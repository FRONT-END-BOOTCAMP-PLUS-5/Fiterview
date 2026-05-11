// STT 파이프라인 변경분(prompt bias + CleanTranscriptionService)을 DB 없이 검증하는 스크립트.
// 동일 오디오에 대해 3가지 결과를 출력한다:
//   1) baseline (prompt 없음, 변경 전 상태와 동일)
//   2) with prompt bias (변경 후 raw 저장 대상)
//   3) with prompt + clean (변경 후 clean 저장 대상)
//
// 사용: node scripts/test-stt-pipeline.mjs
//   - STT_TEST_AUDIO=path/to/file.mp3  : 오디오 파일 경로 변경
//   - STT_TEST_ITERATIONS=3             : 반복 횟수

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import process from 'node:process';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required in environment variables.');
}

// ─────────────────────────────────────────────────────────────────────
// 아래 상수는 constants/stt.ts 와 동일하게 유지해야 한다.
// constants/stt.ts 변경 시 이 파일도 함께 수정.
const STT_PROMPT_BIAS = [
  '한국어 IT/기술 면접 답변 음성입니다.',
  '자주 등장하는 용어: React, Next.js, TypeScript, JavaScript, Node.js, Python, Java, Spring, Spring Boot, Django, FastAPI, AWS, GCP, Azure, Docker, Kubernetes, MySQL, PostgreSQL, MongoDB, Redis, REST API, GraphQL, Git, GitHub, CI/CD, OAuth, JWT.',
  '직무 용어: 프론트엔드, 백엔드, 풀스택, 데브옵스, 데이터베이스, 알고리즘, 자료구조, 객체지향, 함수형, 비동기, 동시성, 트랜잭션, 인덱스.',
  '숫자는 가능한 한 아라비아 숫자로 표기합니다 (예: 3년, 10000명).',
].join(' ');

const FILLER_TOKENS = ['어', '음', '에', '아'];
const FILLER_SET = new Set(FILLER_TOKENS);
const FILLER_REPEAT = new RegExp(`^(${FILLER_TOKENS.join('|')}){2,}$`);

function cleanTranscription(raw) {
  if (!raw) return '';
  const withoutFillers = raw
    .split(/\s+/)
    .filter((t) => {
      const core = t.replace(/[.,!?…]+$/u, '');
      if (!core) return true;
      if (FILLER_SET.has(core)) return false;
      if (FILLER_REPEAT.test(core)) return false;
      return true;
    })
    .join(' ');
  return withoutFillers.replace(/\s+/g, ' ').trim();
}
// ─────────────────────────────────────────────────────────────────────

const audioFilePath =
  process.env.STT_TEST_AUDIO ||
  path.resolve(process.cwd(), 'public/assets/audios/2/recording_2_8.mp3');
const model = 'gpt-4o-transcribe';
const language = 'ko';
const iterations = Number(process.env.STT_TEST_ITERATIONS ?? '3');
const endpoint = 'https://api.openai.com/v1/audio/transcriptions';

// benchmark-stt.mjs 와 동일한 ground truth (filler 포함, raw 비교용)
const groundTruthRaw =
  '어 음 그 10일만에 mvp를 만든거는 음 엄청 짧은 시간이라 사실 그 기획과 개발의 조율이 좀 힘들었어요 음 다들 바쁘고 급하다 보니까 우선순위를 빠르게 정하고 뭐 필요한 기능만 먼저 구현했어요 그런 조율이 기억에 남네요';
// clean 결과 비교용 (filler 제거 후)
const groundTruthClean = cleanTranscription(groundTruthRaw);

if (!Number.isInteger(iterations) || iterations < 1) {
  throw new Error('STT_TEST_ITERATIONS must be a positive integer.');
}

const round = (v) => Math.round(v * 100) / 100;

const normalizeText = (text) =>
  text
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^0-9a-z가-힣]/g, '');

const levenshteinDistance = (source, target) => {
  const rows = source.length + 1;
  const cols = target.length + 1;
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let i = 0; i < rows; i += 1) matrix[i][0] = i;
  for (let j = 0; j < cols; j += 1) matrix[0][j] = j;
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = source[i - 1] === target[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[rows - 1][cols - 1];
};

const cerOf = (prediction, truth) => {
  const np = normalizeText(prediction);
  const nt = normalizeText(truth);
  return nt.length === 0 ? 0 : levenshteinDistance(np, nt) / nt.length;
};

async function callOpenAI(audioBuffer, fileName, { withPrompt }) {
  const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
  const formData = new FormData();
  formData.append('file', audioBlob, fileName);
  formData.append('model', model);
  formData.append('language', language);
  formData.append('response_format', 'json');
  if (withPrompt) formData.append('prompt', STT_PROMPT_BIAS);

  const startedAt = performance.now();
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: formData,
  });
  const latencyMs = performance.now() - startedAt;
  const payload = await response.json().catch(() => ({}));
  const text = typeof payload?.text === 'string' ? payload.text.trim() : '';
  const success = response.ok && text.length > 0;
  return {
    success,
    latencyMs,
    status: response.status,
    text,
    error: success ? null : payload?.error?.message || `HTTP ${response.status}`,
  };
}

const avg = (arr, key) =>
  arr.length ? arr.reduce((a, b) => a + b[key], 0) / arr.length : 0;

async function main() {
  const audioBuffer = await readFile(audioFilePath);
  const fileName = path.basename(audioFilePath);

  console.log('=== STT Pipeline Test (DB-less) ===');
  console.log(`file        : ${audioFilePath}`);
  console.log(`model       : ${model}`);
  console.log(`iterations  : ${iterations}`);
  console.log(`prompt bytes: ${STT_PROMPT_BIAS.length}`);
  console.log('');
  console.log(`ground truth (raw, filler 포함):`);
  console.log(`  "${groundTruthRaw}"`);
  console.log(`ground truth (clean, filler 제거 — 참고용):`);
  console.log(`  "${groundTruthClean}"`);
  console.log('');

  const stats = { baseline: [], prompt: [], clean: [] };

  for (let i = 0; i < iterations; i += 1) {
    console.log(`--- iteration ${i + 1}/${iterations} ---`);

    // 1) baseline (prompt 없음)
    const baseline = await callOpenAI(audioBuffer, fileName, { withPrompt: false });
    if (!baseline.success) {
      console.log(`  [baseline]   FAIL status=${baseline.status} ${baseline.error}`);
    } else {
      const baselineCer = cerOf(baseline.text, groundTruthRaw);
      console.log(
        `  [baseline]   ${round(baseline.latencyMs)}ms  CER=${round(baselineCer * 100)}%`
      );
      console.log(`    text: "${baseline.text}"`);
      stats.baseline.push({ latency: baseline.latencyMs, cer: baselineCer });
    }

    // 2) with prompt bias (변경 후 raw 저장 대상)
    const withPrompt = await callOpenAI(audioBuffer, fileName, { withPrompt: true });
    let promptText = '';
    if (!withPrompt.success) {
      console.log(`  [+prompt]    FAIL status=${withPrompt.status} ${withPrompt.error}`);
    } else {
      const promptCer = cerOf(withPrompt.text, groundTruthRaw);
      promptText = withPrompt.text;
      console.log(
        `  [+prompt]    ${round(withPrompt.latencyMs)}ms  CER=${round(promptCer * 100)}%`
      );
      console.log(`    text: "${withPrompt.text}"`);
      stats.prompt.push({ latency: withPrompt.latencyMs, cer: promptCer });
    }

    // 3) clean (with-prompt 결과에 후처리 적용 → 실제 user_answer_clean 후보)
    if (promptText) {
      const cleanText = cleanTranscription(promptText);
      const cleanCer = cerOf(cleanText, groundTruthClean);
      console.log(`  [+clean]     CER(vs cleanGT)=${round(cleanCer * 100)}%`);
      console.log(`    text: "${cleanText}"`);
      stats.clean.push({ cer: cleanCer });
    }

    console.log('');
  }

  console.log('=== Summary ===');
  console.log(
    `[baseline (no prompt)]   avg CER ${round(avg(stats.baseline, 'cer') * 100)}%   avg latency ${round(avg(stats.baseline, 'latency'))}ms   n=${stats.baseline.length}`
  );
  console.log(
    `[+prompt bias]           avg CER ${round(avg(stats.prompt, 'cer') * 100)}%   avg latency ${round(avg(stats.prompt, 'latency'))}ms   n=${stats.prompt.length}`
  );
  console.log(
    `[+clean post-process]    avg CER ${round(avg(stats.clean, 'cer') * 100)}% (vs cleanGT)   n=${stats.clean.length}`
  );
  console.log('');
  console.log('주의:');
  console.log('  - baseline / +prompt CER은 filler 포함 raw GT 기준');
  console.log('  - +clean CER은 filler 제거된 cleanGT 기준이라 위 두 값과 직접 비교 X');
  console.log('  - prompt bias 효과 = (baseline CER) - (+prompt CER)');
  console.log('  - clean 후처리 효과 = +clean 결과 텍스트의 가독성/논리분석 적합성 (눈으로 확인)');
}

main().catch((error) => {
  console.error('Test failed:', error);
  process.exitCode = 1;
});

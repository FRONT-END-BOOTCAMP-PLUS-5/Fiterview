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

const filePath = path.resolve(process.cwd(), 'public/assets/audios/2/recording_2_8.mp3');
const model = 'gpt-4o-transcribe';
const language = 'ko';
const iterations = Number(process.env.STT_BENCH_ITERATIONS ?? '10');
const endpoint = 'https://api.openai.com/v1/audio/transcriptions';
const groundTruthText =
  '어 음 그 10일만에 mvp를 만든거는 음 엄청 짧은 시간이라 사실 그 기획과 개발의 조율이 좀 힘들었어요 음 다들 바쁘고 급하다 보니까 우선순위를 빠르게 정하고 뭐 필요한 기능만 먼저 구현했어요 그런 조율이 기억에 남네요';

if (!Number.isInteger(iterations) || iterations < 1) {
  throw new Error('STT_BENCH_ITERATIONS must be a positive integer.');
}

const round = (value) => Math.round(value * 100) / 100;

const percentile = (values, p) => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
};

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

async function transcribeOnce(audioBuffer) {
  const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording_2_8.mp3');
  formData.append('model', model);
  formData.append('language', language);
  formData.append('response_format', 'json');

  const startedAt = performance.now();
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  });
  const endedAt = performance.now();
  const latencyMs = endedAt - startedAt;

  const payload = await response.json().catch(() => ({}));
  const text = typeof payload?.text === 'string' ? payload.text.trim() : '';
  const normalizedPrediction = normalizeText(text);
  const normalizedGroundTruth = normalizeText(groundTruthText);
  const editDistance = levenshteinDistance(normalizedPrediction, normalizedGroundTruth);
  const cer =
    normalizedGroundTruth.length === 0 ? 0 : editDistance / normalizedGroundTruth.length;
  const accuracy = (1 - cer) * 100;
  const success = response.ok && text.length > 0;
  const errorMessage = success
    ? null
    : payload?.error?.message || payload?.message || `HTTP ${response.status}`;

  return {
    success,
    latencyMs,
    status: response.status,
    sttText: text,
    groundTruthText,
    cer,
    accuracy,
    textLength: text.length,
    errorMessage,
  };
}

async function main() {
  const audioBuffer = await readFile(filePath);
  const results = [];
  let failures = 0;

  console.log('=== STT Benchmark Start ===');
  console.log(`file: ${filePath}`);
  console.log(`model: ${model}`);
  console.log(`iterations: ${iterations}`);
  console.log('');

  for (let i = 0; i < iterations; i += 1) {
    const attempt = i + 1;
    const result = await transcribeOnce(audioBuffer);
    results.push(result);
    if (!result.success) failures += 1;

    const status = result.success ? 'OK' : 'FAIL';
    const baseLog = `[${attempt}/${iterations}] ${status} ${round(result.latencyMs)}ms (status=${result.status}, textLen=${result.textLength})`;
    console.log(result.success ? baseLog : `${baseLog}, error=${result.errorMessage}`);
    console.log(`  STT text     : ${result.sttText}`);
    console.log(`  Ground truth : ${result.groundTruthText}`);
    console.log(`  CER          : ${round(result.cer * 100)}%`);
    console.log(`  Accuracy     : ${round(result.accuracy)}%`);
  }

  const latencies = results.map((result) => result.latencyMs);
  const cerValues = results.map((result) => result.cer);
  const accuracyValues = results.map((result) => result.accuracy);
  const mean = latencies.reduce((acc, cur) => acc + cur, 0) / latencies.length;
  const averageCer = cerValues.reduce((acc, cur) => acc + cur, 0) / cerValues.length;
  const averageAccuracy =
    accuracyValues.reduce((acc, cur) => acc + cur, 0) / accuracyValues.length;
  const p50 = percentile(latencies, 50);
  const p95 = percentile(latencies, 95);
  const errorRate = (failures / iterations) * 100;

  console.log('');
  console.log('=== STT Benchmark Summary ===');
  console.log(`total requests : ${iterations}`);
  console.log(`success        : ${iterations - failures}`);
  console.log(`failed         : ${failures}`);
  console.log(`error rate     : ${round(errorRate)}%`);
  console.log(`mean latency   : ${round(mean)}ms`);
  console.log(`p50 latency    : ${round(p50)}ms`);
  console.log(`p95 latency    : ${round(p95)}ms`);
  console.log(`avg CER        : ${round(averageCer * 100)}%`);
  console.log(`avg Accuracy   : ${round(averageAccuracy)}%`);
}

main().catch((error) => {
  console.error('Benchmark failed:', error);
  process.exitCode = 1;
});

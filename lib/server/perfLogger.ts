import fs from 'fs';
import { promises as fsp } from 'fs';
import path from 'path';

type PerfSample = {
  changeDesc: string;
  testInput: string;
  durationMs: number;
  category?: string;
};

const bufferKeyToDurations: Map<string, number[]> = new Map();
let writeQueue: Promise<void> = Promise.resolve();

function isEnabled(): boolean {
  return process.env.PERF_LOG === '1' || process.env.PERF_LOG_ENABLED === '1';
}

function getCsvPath(): string {
  const configured = process.env.PERF_LOG_FILE;
  if (configured) return configured;
  return path.join(process.cwd(), 'perf_logs.csv');
}

function ensureCsvHeaderSync(filePath: string) {
  if (!fs.existsSync(filePath)) {
    const header = '날짜,변경내용,테스트 입력,처리시간(ms)\n';
    fs.writeFileSync(filePath, header, 'utf8');
  }
}

function quoteCsv(value: string): string {
  if (value.includes('"')) value = value.replace(/"/g, '""');
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value}"`;
  }
  return value;
}

function formatDateMD(d: Date): string {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${m}/${day}`;
}

function getKey(sample: PerfSample): string {
  const cat = sample.category ?? '';
  return `${cat}||${sample.changeDesc}||${sample.testInput}`;
}

export function startPerfTimer(): () => number {
  const start = process.hrtime.bigint();
  return () => {
    const end = process.hrtime.bigint();
    const diffNs = end - start;
    return Math.floor(Number(diffNs) / 1e6); // ms
  };
}

async function readPreviousAvgForTestInput(
  filePath: string,
  testInput: string
): Promise<number | null> {
  try {
    const content = await fsp.readFile(filePath, 'utf8');
    const lines = content.trim().split(/\r?\n/);
    for (let i = lines.length - 1; i >= 1; i -= 1) {
      const line = lines[i];
      // naive CSV split that handles quotes minimally
      const cols: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let j = 0; j < line.length; j += 1) {
        const ch = line[j];
        if (ch === '"') {
          if (inQuotes && line[j + 1] === '"') {
            current += '"';
            j += 1;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === ',' && !inQuotes) {
          cols.push(current);
          current = '';
        } else {
          current += ch;
        }
      }
      cols.push(current);

      if (cols.length < 4) continue;
      const candidateTestInput = cols[2].replace(/^"|"$/g, '').replace(/""/g, '"');
      if (candidateTestInput !== testInput) continue;

      const avgCell = cols[3];
      const matches = avgCell.match(/(\d+)\s*ms/gi);
      if (matches && matches.length > 0) {
        const last = matches[matches.length - 1];
        const num = parseInt(last.replace(/[^0-9]/g, ''), 10);
        if (!Number.isNaN(num)) return num;
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function appendCsvRow(dateStr: string, changeDesc: string, testInput: string, avgMs: number) {
  const filePath = getCsvPath();
  ensureCsvHeaderSync(filePath);
  const prevAvg = await readPreviousAvgForTestInput(filePath, testInput);
  const avgDisplay = prevAvg != null ? `${prevAvg}ms → ${avgMs}ms` : `${avgMs}ms`;
  const row = `${quoteCsv(dateStr)},${quoteCsv(changeDesc)},${quoteCsv(testInput)},${quoteCsv(avgDisplay)}\n`;
  await fsp.appendFile(filePath, row, 'utf8');
}

export async function recordPerfSample(sample: PerfSample): Promise<void> {
  if (!isEnabled()) return;
  const now = new Date();
  const dateStr = formatDateMD(now);

  // queue writes to avoid races
  writeQueue = writeQueue
    .then(() => appendCsvRow(dateStr, sample.changeDesc, sample.testInput, sample.durationMs))
    .catch(() => undefined);
  await writeQueue;
}

export const perfLogger = {
  enabled: isEnabled,
  start: startPerfTimer,
  record: recordPerfSample,
};

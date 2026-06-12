// 本机成绩榜：localStorage + 内存兜底
const DB_KEY = 'qxz_scoreboard_v2';

export interface ScoreRecord {
  name: string; classCode: string; mode: 'adventure' | 'challenge';
  set: string; total: number; grade: string; title: string;
  c1: number; c2: number; c3: number; c4: number;
  acc: number; accuracyPct: number;
  trains: number; hints: number; dur: number;
  stars: number; equipment: string[]; achievements: string[];
  time: string;
}

let memDB: ScoreRecord[] = [];
let storageOK = true;

export function dbLoad(): ScoreRecord[] {
  try { return JSON.parse(localStorage.getItem(DB_KEY) || '[]'); }
  catch { storageOK = false; return memDB; }
}
export function dbSaveAll(list: ScoreRecord[]): void {
  try { localStorage.setItem(DB_KEY, JSON.stringify(list)); storageOK = true; }
  catch { storageOK = false; memDB = list; }
}
export function dbStorageOk(): boolean { return storageOK; }

export function pickRandomSetExcludingLast(keys: string[]): string {
  const lastSet = localStorage.getItem('qx_last_set');
  const pool = keys.filter(k => k !== lastSet);
  const drawFrom = pool.length ? pool : keys;
  const key = drawFrom[Math.floor(Math.random() * drawFrom.length)];
  try { localStorage.setItem('qx_last_set', key); } catch {}
  return key;
}

export function nowStr(): string {
  const d = new Date(), p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

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

export function pickRandomSet(keys: string[], player?: string): string {
  // 需要排除的题集：
  const exclude = new Set<string>();

  // ① 设备上一局 — 相邻同桌不撞题
  const lastSet = localStorage.getItem('qx_last_set');
  if (lastSet) exclude.add(lastSet);

  // ② 同一玩家上一次 — 每人两次不撞题
  if (player) {
    const prev = localStorage.getItem(`qx_played_${player}`);
    if (prev) exclude.add(prev);
  }

  const pool = keys.filter(k => !exclude.has(k));
  const drawFrom = pool.length ? pool : keys;
  const key = drawFrom[Math.floor(Math.random() * drawFrom.length)];
  try {
    localStorage.setItem('qx_last_set', key);
    if (player) localStorage.setItem(`qx_played_${player}`, key);
  } catch {}
  return key;
}

export function nowStr(): string {
  const d = new Date(), p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

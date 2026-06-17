// 教室服务器对接：探测 → 报到 → 提交。失败/无服务时静默回退到本地模式。
let online = false;
let token: string | null = null;

export function isOnline(): boolean { return online; }
export function currentToken(): string | null { return token; }

export async function probe(): Promise<void> {
  try {
    const res = await fetch('/api/health', { method: 'GET', cache: 'no-store' });
    online = res.ok;
  } catch {
    online = false;
  }
}

export interface StartResult {
  ok: boolean;
  attemptNo?: 1 | 2;
  reason?: string;
  offline?: boolean;
}

export async function startAttempt(cls: string, name: string): Promise<StartResult> {
  if (!online) return { ok: true, offline: true };
  try {
    const res = await fetch('/api/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ class: cls, name })
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || !j.ok) return { ok: false, reason: j.reason || `服务器拒绝 (${res.status})` };
    token = j.token;
    return { ok: true, attemptNo: j.attemptNo };
  } catch {
    online = false;
    return { ok: true, offline: true };
  }
}

export interface FinishPayload {
  score: number;
  breakdown: Record<string, number>;
  set: string;
  stars: number;
  title: string;
}

export interface FinishResult {
  ok: boolean;
  best?: number;
  duplicate?: boolean;
  reason?: string;
  offline?: boolean;
}

export async function finishAttempt(p: FinishPayload): Promise<FinishResult> {
  if (!online || !token) return { ok: true, offline: true };
  try {
    const res = await fetch('/api/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, ...p })
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || !j.ok) return { ok: false, reason: j.reason || `上报失败 (${res.status})` };
    return { ok: true, best: j.best, duplicate: !!j.duplicate };
  } catch {
    return { ok: false, reason: '上报失败：网络中断' };
  }
}

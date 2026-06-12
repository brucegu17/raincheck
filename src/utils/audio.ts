// 音频引擎：用 Howler 处理浏览器自动播放限制 + 移动端解锁
// 音效仍是 Web Audio 合成（零外部文件），保留原"零依赖音频资源"的特性
import { Howler } from 'howler';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let bgmTimer: number | null = null;
let curScene: string | null = null;

function ensureCtx(): boolean {
  if (ctx) return true;
  try {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx!.createGain();
    master.gain.value = 1;
    master.connect(ctx!.destination);
  } catch { return false; }
  return true;
}

function tone(freq: number, t0: number, dur: number, type: OscillatorType = 'triangle', vol = 0.1, slide = 0) {
  if (!ctx || !master) return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(master);
  o.start(t0); o.stop(t0 + dur + 0.06);
}

const PATTERNS: Record<string, { bpm: number; bass: number[]; mel: number[] }> = {
  town: { bpm: 96,  bass: [131,0,196,0,165,0,196,0], mel: [523,587,659,0,784,659,587,523,659,0,523,0,587,659,587,0] },
  work: { bpm: 104, bass: [131,0,131,0,175,0,196,0], mel: [392,0,523,0,440,523,0,0,392,440,523,587,523,0,440,0] },
  rain: { bpm: 122, bass: [110,0,110,0,104,0,104,0], mel: [440,0,415,0,440,494,440,0,415,0,392,0,330,0,392,415] },
  win:  { bpm: 112, bass: [131,0,165,0,196,0,165,0], mel: [523,659,784,659,1047,784,659,523,784,659,523,659,587,659,784,0] }
};

export const audio = {
  isOn: localStorage.getItem('qx_snd') !== '0',
  init() { ensureCtx(); if (ctx?.state === 'suspended') ctx.resume(); Howler.volume(0.6); },
  toggle(): boolean {
    this.isOn = !this.isOn;
    localStorage.setItem('qx_snd', this.isOn ? '1' : '0');
    if (this.isOn) { this.init(); this.sfx('pick'); this.playBgm(curScene); } else { this.stopBgm(); }
    return this.isOn;
  },
  setScene(s: string | null) { curScene = s; this.playBgm(s); },
  playBgm(s: string | null) {
    if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null; }
    if (!this.isOn || !s || !ctx) return;
    const p = PATTERNS[s]; if (!p) return;
    const beat = 60 / p.bpm / 2;
    let step = 0;
    bgmTimer = window.setInterval(() => {
      if (!this.isOn || document.hidden || ctx!.state !== 'running') return;
      const t = ctx!.currentTime + 0.02, i = step++;
      const b = p.bass[i % p.bass.length]; if (b) tone(b, t, beat * 0.9, 'triangle', 0.05);
      const m = p.mel[i % p.mel.length];  if (m) tone(m, t, beat * 0.85, 'square',   0.024);
    }, beat * 1000);
  },
  stopBgm() { if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null; } },
  sfx(name: string) {
    if (!this.isOn || !ensureCtx() || !ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    const fx: Record<string, () => void> = {
      click:  () => tone(620, t, 0.06, 'square', 0.045),
      pick:   () => { tone(523, t, 0.09, 'triangle', 0.14); tone(784, t + 0.07, 0.12, 'triangle', 0.14); },
      unpick: () => { tone(440, t, 0.08, 'triangle', 0.1);  tone(330, t + 0.06, 0.1,  'triangle', 0.1); },
      flag:   () => { tone(880, t, 0.06, 'square', 0.09);   tone(660, t + 0.05, 0.09, 'square', 0.09); },
      good:   () => [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.08, 0.18, 'triangle', 0.13)),
      bad:    () => { tone(220, t, 0.25, 'sawtooth', 0.09, -80); tone(165, t + 0.13, 0.32, 'sawtooth', 0.08, -60); },
      tick:   () => tone(990, t, 0.04, 'square', 0.04),
      whoosh: () => tone(180, t, 0.4, 'sine', 0.1, 1000),
      pass:   () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, t + i * 0.09, 0.22, 'square', 0.06));
                      [262, 330, 392].forEach(f => tone(f, t + 0.46, 0.55, 'triangle', 0.07)); },
      fail:   () => [392, 330, 262, 196].forEach((f, i) => tone(f, t + i * 0.14, 0.2, 'triangle', 0.11)),
      siren:  () => { for (let i = 0; i < 3; i++) { tone(740, t + i * 0.32, 0.15, 'square', 0.06); tone(587, t + i * 0.32 + 0.16, 0.15, 'square', 0.06); } },
      star:   () => tone(1175, t, 0.16, 'triangle', 0.13, 420),
      win:    () => {
        [[523, 0], [523, 0.13], [659, 0.26], [784, 0.39], [1047, 0.58], [784, 0.78], [1047, 0.95]]
          .forEach(([f, d]) => tone(f, t + d, 0.2, 'square', 0.075));
        [262, 392, 523].forEach(f => tone(f, t + 0.95, 0.85, 'triangle', 0.06));
      }
    };
    fx[name]?.();
  }
};

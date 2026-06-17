// 浏览器中文 TTS：自动挑选最佳中文声音，安全降级
let zhVoice: SpeechSynthesisVoice | null = null;

function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const vs = speechSynthesis.getVoices();
  const pref = ['Xiaoxiao','Yunxi','Yunyang','Xiaoyi','Huihui','Yaoyao','Ting-Ting','Tingting','Meijia','Mei-Jia','普通话'];
  let best: SpeechSynthesisVoice | null = null, score = -1;
  vs.forEach(v => {
    const tag = v.lang + ' ' + v.name;
    if (!/zh|chinese|cmn/i.test(tag)) return;
    let s = 1;
    pref.forEach((p, i) => { if (v.name.indexOf(p) >= 0) s = Math.max(s, 100 - i); });
    if (/zh[-_]CN/i.test(v.lang)) s += 5;
    if (v.localService) s += 2;
    if (s > score) { score = s; best = v; }
  });
  zhVoice = best;
}
if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}

export const tts = {
  isOn: localStorage.getItem('qx_voice') !== '0',
  toggle(): boolean {
    this.isOn = !this.isOn;
    localStorage.setItem('qx_voice', this.isOn ? '1' : '0');
    if (!this.isOn) this.cancel();
    return this.isOn;
  },
  cancel() { if ('speechSynthesis' in window) speechSynthesis.cancel(); },
  speak(text: string, force = false, onEnd?: () => void) {
    if (!('speechSynthesis' in window)) { onEnd?.(); return; }
    if (!this.isOn && !force) { onEnd?.(); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text).replace(/<[^>]+>/g, '').replace(/[🎉🎲🚩🎒⚡⚖️📝]/g, ''));
    u.lang = 'zh-CN';
    if (zhVoice) u.voice = zhVoice;
    u.rate = 0.95; u.pitch = 1.15; u.volume = 1;
    if (onEnd) {
      u.onend = onEnd;
      u.onerror = onEnd;
    }
    speechSynthesis.speak(u);
  }
};

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && 'speechSynthesis' in window) speechSynthesis.cancel();
  });
}

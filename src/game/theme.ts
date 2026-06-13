// A/B/C 三套题集的视觉主题（HUD 顶色 / scene 背景 / 关键 chip 配色）
// 应用方式：根据 store.setKey 在 <body> 上加 class="theme-A|B|C"，CSS 用 :root.theme-X 覆盖 token

export type ThemeKey = 'A' | 'B' | 'C';

export const THEMES: Record<ThemeKey, {
  name: string;
  emoji: string;
  bgGradient: string;       // 整体 body 渐变
  headerGradient: string;   // header 渐变
  accentSky: string;        // 天空色
  hudBg: string;            // HUD 顶色
}> = {
  A: {
    name: '盛夏阳光',
    emoji: '☀️',
    bgGradient: 'linear-gradient(180deg, #BDE9FF 0%, #E8F8FF 45%, #FFF8E7 100%)',
    headerGradient: 'linear-gradient(180deg, #1D6F76 0%, #114750 100%)',
    accentSky: '#7FD4F0',
    hudBg: '#1D6F76'
  },
  B: {
    name: '暴雨夜行',
    emoji: '🌧️',
    bgGradient: 'linear-gradient(180deg, #5A6E84 0%, #8AA4B6 45%, #C2D4D8 100%)',
    headerGradient: 'linear-gradient(180deg, #2B3A5A 0%, #1A243C 100%)',
    accentSky: '#5E7E96',
    hudBg: '#2B3A5A'
  },
  C: {
    name: '黄昏来临',
    emoji: '🌇',
    bgGradient: 'linear-gradient(180deg, #FFD194 0%, #FFC1A1 45%, #FFE5C7 100%)',
    headerGradient: 'linear-gradient(180deg, #B25A38 0%, #7A3A1E 100%)',
    accentSky: '#FFB78E',
    hudBg: '#B25A38'
  }
};

export function applyTheme(key: ThemeKey) {
  const body = document.body;
  body.classList.remove('theme-A', 'theme-B', 'theme-C');
  body.classList.add('theme-' + key);
  const t = THEMES[key];
  body.style.setProperty('--theme-bg', t.bgGradient);
  body.style.setProperty('--theme-header', t.headerGradient);
  body.style.setProperty('--theme-sky', t.accentSky);
  body.style.setProperty('--theme-hud', t.hudBg);
  body.style.background = t.bgGradient;
}

// 决策关天气图标库
export const WEATHER_SVG: Record<string, string> = {
  sun: `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="46" fill="#FFD23F" stroke="#1B3A40" stroke-width="5"/><g stroke="#FFB30F" stroke-width="7" stroke-linecap="round"><line x1="100" y1="20" x2="100" y2="42"/><line x1="100" y1="158" x2="100" y2="180"/><line x1="20" y1="100" x2="42" y2="100"/><line x1="158" y1="100" x2="180" y2="100"/><line x1="44" y1="44" x2="60" y2="60"/><line x1="140" y1="140" x2="156" y2="156"/><line x1="156" y1="44" x2="140" y2="60"/><line x1="60" y1="140" x2="44" y2="156"/></g><circle cx="86" cy="92" r="6" fill="#1B3A40"/><circle cx="118" cy="92" r="6" fill="#1B3A40"/><path d="M84 116 q16 16 34 0" fill="none" stroke="#1B3A40" stroke-width="5" stroke-linecap="round"/></svg>`,
  cloudsun: `<svg viewBox="0 0 200 200"><circle cx="128" cy="74" r="32" fill="#FFD23F" stroke="#1B3A40" stroke-width="5"/><ellipse cx="92" cy="128" rx="62" ry="34" fill="#FFFFFF" stroke="#1B3A40" stroke-width="5"/><circle cx="58" cy="120" r="26" fill="#FFFFFF" stroke="#1B3A40" stroke-width="5"/><circle cx="118" cy="112" r="32" fill="#FFFFFF" stroke="#1B3A40" stroke-width="5"/></svg>`,
  storm: `<svg viewBox="0 0 200 200"><ellipse cx="100" cy="86" rx="66" ry="36" fill="#7E8CA0" stroke="#1B3A40" stroke-width="5"/><circle cx="62" cy="78" r="28" fill="#8E9BB0" stroke="#1B3A40" stroke-width="5"/><circle cx="130" cy="70" r="34" fill="#8E9BB0" stroke="#1B3A40" stroke-width="5"/><path d="M104 104 L80 150 L100 150 L86 188 L128 132 L106 132 Z" fill="#FFD23F" stroke="#1B3A40" stroke-width="4" stroke-linejoin="round"/><g stroke="#4FC3DC" stroke-width="6" stroke-linecap="round"><line x1="56" y1="132" x2="48" y2="158"/><line x1="150" y1="132" x2="142" y2="158"/></g></svg>`,
  rainy: `<svg viewBox="0 0 200 200"><ellipse cx="100" cy="84" rx="64" ry="36" fill="#A9B6C8" stroke="#1B3A40" stroke-width="5"/><circle cx="62" cy="76" r="27" fill="#B7C2D2" stroke="#1B3A40" stroke-width="5"/><circle cx="130" cy="68" r="33" fill="#B7C2D2" stroke="#1B3A40" stroke-width="5"/><g stroke="#4FC3DC" stroke-width="7" stroke-linecap="round"><line x1="62" y1="128" x2="54" y2="158"/><line x1="92" y1="128" x2="84" y2="158"/><line x1="122" y1="128" x2="114" y2="158"/><line x1="152" y1="128" x2="144" y2="158"/></g></svg>`
};
export function weatherKey(prob: number): keyof typeof WEATHER_SVG {
  if (prob >= 70) return 'storm';
  if (prob >= 40) return 'rainy';
  if (prob >= 20) return 'cloudsun';
  return 'sun';
}

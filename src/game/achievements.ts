export interface Achievement { id: string; ic: string; name: string; desc: string }
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'lightning', ic: '⚡', name: '闪电反应', desc: '警报器 3 秒内点亮' },
  { id: 'sharpEye',  ic: '🔍', name: '神之眼',   desc: '第一关完美收集，0 干扰' },
  { id: 'detective', ic: '🕵️', name: '侦探之眼', desc: '第二关 4 对 0 误删' },
  { id: 'oneShot',   ic: '🎯', name: '一击即中', desc: '第三关一次训练即通过' },
  { id: 'aceModel',  ic: '🚀', name: '神级模型', desc: '模型准确率 ≥ 95%' },
  { id: 'savior',    ic: '🛡️', name: '全镇守护', desc: '三天关键决策全对' },
  { id: 'pure',      ic: '🌟', name: '独立判断', desc: '第四关 0 次查看提示' },
  { id: 'eggs',      ic: '🐱', name: '温柔之心', desc: '救下小猫并保护糖葫芦摊' }
];

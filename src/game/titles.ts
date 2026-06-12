export const TITLES = {
  novice:  '见习预报员',
  detect:  '数据侦探',
  expert:  'AI 防洪专家',
  captain: '清溪镇防洪队长'
} as const;

export const SPEAK: Record<string, string> = {
  intro:   '欢迎你，小预报员！我是云博士。清溪镇的河畔大集每年雨季都可能被洪水淹没。我们要建一个 AI 模型，提前预报洪水。',
  collect: '第一关，收集数据。镇里藏着 8 条数据，找到闪光处点一点。',
  clean:   '第二关，清洗数据。记录里混进了 4 行坏数据，把它们揪出来。',
  train:   '第三关，训练模型。挑选和洪水有关的特征，80% 训练 + 20% 考试。',
  deploy:  '最后一关。模型给出三天洪水概率，发不发预警由你拍板！'
};

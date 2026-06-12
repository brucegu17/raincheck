# 🌊 洪水预报员 · 清溪镇保卫战

面向 8–12 岁的 AI 科普闯关游戏。一局 8–10 分钟，走完
**数据收集 → 数据清洗 → 特征选择 → 模型训练 → 查看预测概率 → 人类决策**
一条完整的 AI 工程主线。

🎮 **在线试玩：** https://brucegu17.github.io/raincheck/

## 主要特性

- 8–10 分钟一局，含 4 关 + 入场警报 + 通关结业
- 探险 / 挑战 双难度
- 三套题集 A/B/C 随机抽取且**相邻两次不重复**（适合连堂课）
- 4 件防洪装备 + 8 个隐藏成就 + 本机排行榜 + CSV 成绩单导出
- 浏览器原生中文 TTS（云博士语音）+ Web Audio 合成 BGM
- **零外部资源**：所有 SVG / 音效 / 文字都内联，离线可玩
- 支持 `prefers-reduced-motion`

## 玩它的三种方式

| 场景 | 怎么做 |
|---|---|
| 在线直接玩 | 浏览器打开 https://brucegu17.github.io/raincheck/ |
| 本地离线玩 | 下载 [`dist/index.html`](https://github.com/brucegu17/raincheck/releases) → 双击 |
| 自己改代码 | `git clone` → `npm install` → `npm run dev` |

## 开发

```sh
npm install
npm run dev        # http://localhost:5273/
npm run build      # 产物：dist/index.html（单文件）
```

技术栈：Vue 3 · Vite · TypeScript · Pinia · Howler.js · `vite-plugin-singlefile`

## 项目结构

```
src/
├── design/        Design tokens + CSS primitives
├── primitives/    Stack / Cluster / Grid / Center 布局基元
├── components/    TopHud · MentorCard · AlarmIntro · EquipReward 等
├── scenes/        SceneIntro · Collect · Clean · Train · Deploy · End
├── game/          Pinia store · 三套题集 · 装备 · 成就
├── utils/         音频 · TTS · localStorage · CSV
└── assets/        Town SVG · 云博士 · 天气图标
```

详细架构参考 [`CLAUDE.md`](./CLAUDE.md)；UI 质量自检清单参考
[`.claude/skills/ui-quality.md`](./.claude/skills/ui-quality.md)。

## 部署到 GitHub Pages

`.github/workflows/pages.yml` 已配置好：push 到 `main` 会自动构建并部署到
https://brucegu17.github.io/raincheck/。

构建时 `GITHUB_PAGES=true` 让 Vite 使用 `/raincheck/` 作为 base path。
本地 build（不带这个环境变量）则使用 `./` 相对路径，产物可直接双击。

## License

MIT

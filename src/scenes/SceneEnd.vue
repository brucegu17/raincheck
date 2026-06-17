<!--
  通关页（v3 卡通游戏化版）
  设计意图：
  - 顶部英雄横幅左右分栏：左侧大徽章 + 任务完成 + 星 + 100 分 + 等级 pill；右侧 6 张彩色统计卡 + 4 件装备网格
  - 中部 2 列：成就 chips（含锁定）/ 技能评估进度条
  - 镇长感谢卡（黄底 + 斜纹装饰条）
  - 排行榜（紫顶 / 金银铜 emoji）
  - 底部 3 按钮（黄 / 白 / 青）
-->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useGame } from '../game/store';
import { ACHIEVEMENTS } from '../game/achievements';
import { EQUIPMENT } from '../game/equipment';
import { dbLoad, dbSaveAll, nowStr, type ScoreRecord } from '../utils/storage';
import { exportCsv } from '../utils/csv';
import { finishAttempt } from '../utils/scoreClient';

const game = useGame();

const totalStars = computed(() => game.stars + (game.courageStar ? 1 : 0));
const durTxt = computed(() => {
  const m = Math.floor(game.durationSeconds / 60), s = game.durationSeconds % 60;
  return `${m}'${String(s).padStart(2, '0')}"`;
});

const rec = computed<ScoreRecord>(() => ({
  name: game.player, classCode: game.classCode, mode: game.mode, set: game.setKey,
  total: game.total, grade: game.grade, title: game.title,
  c1: game.pts.collect, c2: game.pts.clean, c3: game.pts.train, c4: game.pts.decide,
  acc: game.accuracy, accuracyPct: game.accuracyPct,
  trains: game.trainCount, hints: game.hintsUsed, dur: game.durationSeconds,
  stars: totalStars.value,
  equipment: game.equipment.slice(), achievements: game.achievementsUnlocked.slice(),
  time: nowStr()
}));

/* v2.1 修复：board 改为 ref，写入后手动刷新，不再依赖 computed 自动跑（无 reactive 依赖会读到旧值） */
const board = ref<ScoreRecord[]>([]);
function refreshBoard() {
  board.value = dbLoad().slice().sort((a, b) => b.total - a.total).slice(0, 10);
}

onMounted(async () => {
  const list = dbLoad();
  list.push(rec.value);
  dbSaveAll(list);
  refreshBoard();

  const result = await finishAttempt({
    score: game.total,
    breakdown: {
      collect: game.pts.collect,
      clean:   game.pts.clean,
      train:   game.pts.train,
      decide:  game.pts.decide,
    },
    set:   game.setKey,
    stars: totalStars.value,
    title: game.title,
  });

  if (!result.ok && !result.offline) {
    game.showToast(result.reason || '成绩上传失败，请告诉老师');
  }
});

const medal = ['🥇', '🥈', '🥉'];

function doExport() { exportCsv(dbLoad()); game.showToast('成绩单已导出 📥'); }
function doClear() {
  if (!confirm('确定清空这台电脑上的全部成绩？')) return;
  dbSaveAll([]); refreshBoard(); game.showToast('成绩榜已清空 🗑️');
}
function replay() { game.replay(); }
function reload() { location.reload(); }

// 4 关进度条（每关 0-100%）
const skills = computed(() => [
  { label: '🔍 数据采集', got: game.pts.collect, max: 30, color: 'cyan'    },
  { label: '🧹 数据净化', got: game.pts.clean,   max: 20 + (game.speedBonus.clean || 0),  color: 'orange'  },
  { label: '🧠 模型训练', got: game.pts.train,   max: 30, color: 'pink'    },
  { label: '🎯 智能预测', got: game.pts.decide,  max: 20 + (game.speedBonus.deploy || 0), color: 'red'     }
]);

// v2.2：3 天决策回顾
const decisionReview = computed(() => game.days.map((d, i) => {
  const chose = game.dayChoice[i];
  const isCorrect = d.bestWarn === null || chose === d.bestWarn;
  return {
    label: d.label,
    emoji: d.emoji,
    prob: d.prob,
    chose,
    isCorrect,
    aux: d.aux
  };
}));

// v2.2：情境化总结文案
const summaryText = computed(() => {
  const t = game.total;
  if (t >= 95) return '完美无瑕！数据干净、模型准、决策稳——你已经把 AI 工程师的核心流程吃透了。';
  if (t >= 85) return '非常棒！清溪镇在你手里安如磐石。继续保持对概率的敬畏。';
  if (t >= 70) return '干得漂亮！你已经能让 AI 学到本事。下次试试更严格的挑战模式？';
  if (t >= 55) return '完成任务！你已经懂了 AI 工作的四个步骤。再刷几局，把每关都磨到 90% 以上！';
  return '雨季过去了。每个错误都是宝贵经验——再来一局，把干扰数据都挡在门外！';
});
const summaryEmoji = computed(() => game.total >= 85 ? '🌟' : game.total >= 60 ? '💪' : '🌱');

// 6 个统计小卡
const stats = computed(() => [
  { k: '总分',     v: game.total,           bg: 'blue'    },
  { k: '星级',     v: totalStars.value + ' ⭐', bg: 'yellow'  },
  { k: '正确率',   v: game.accuracyPct + '%', bg: 'emerald' },
  { k: '提示次数', v: game.hintsUsed,       bg: 'slate'   },
  { k: '用时',     v: durTxt.value,         bg: 'slate'   },
  { k: '模式',     v: game.mode === 'challenge' ? '⚡ 挑战' : '🌱 探险', bg: 'indigo' }
]);
</script>

<template>
  <div class="page">

    <!-- ====== HERO：英雄横幅（左右分栏） ====== -->
    <section class="hero">
      <div class="hero-stripe"></div>

      <!-- 左：徽章 / 任务完成 / 星 / 总分 / 等级 -->
      <div class="hero-left">
        <div class="medal-bg"></div>
        <div class="medal-disc">
          <span class="medal-emoji">🏅</span>
          <span class="medal-shine"></span>
        </div>
        <div class="task-banner">任务完成！</div>
        <div class="task-sub">{{ game.player }}，你获得了「{{ game.title }}」徽章</div>
        <div class="stars-row">
          <span v-for="n in 5" :key="n" class="star" :class="{ on: n <= totalStars }">⭐</span>
          <span v-if="totalStars > 5" class="star on">⭐</span>
        </div>
        <div class="big-score">
          <span class="num">{{ game.total }}</span><span class="unit">分</span>
        </div>
        <div class="grade-pill">
          <span class="ic">🏆</span><b>{{ game.grade }}</b>
        </div>
        <div class="score-meta">题集 {{ game.setKey }} · 准确率 {{ game.accuracy }}% · 训练 {{ game.trainCount }} 次</div>
      </div>

      <!-- 右：统计卡网格 + 装备 -->
      <div class="hero-right">
        <div class="stat-grid">
          <div v-for="s in stats" :key="s.k" class="stat-card" :class="['bg-' + s.bg]">
            <div class="k">{{ s.k }}</div>
            <div class="v">{{ s.v }}</div>
          </div>
        </div>

        <div class="equip-frame">
          <div class="equip-title">🎒 已部署工具</div>
          <div class="equip-grid">
            <div v-for="id in game.equipment" :key="id" class="equip-card">
              <span class="ic">{{ EQUIPMENT[id]?.ic }}</span>
              <span class="name">{{ EQUIPMENT[id]?.name }}</span>
            </div>
            <div v-if="!game.equipment.length" class="equip-empty">（本局未获得装备）</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ====== 成就 + 技能 双栏 ====== -->
    <section class="two-col">
      <!-- 成就 -->
      <div class="ach-card">
        <div class="ach-head">
          <h2 class="h-title">🏆 收集成就</h2>
          <div class="ach-counter">
            <div class="ach-counter-k">完成度</div>
            <div class="ach-counter-v">{{ game.achievementsUnlocked.length }}<small> / {{ ACHIEVEMENTS.length }}</small></div>
          </div>
        </div>
        <div class="ach-grid">
          <div v-for="a in ACHIEVEMENTS" :key="a.id"
               class="ach-chip"
               :class="{ locked: !game.achievementsUnlocked.includes(a.id) }"
               :title="a.desc">
            <span class="ic">{{ a.ic }}</span>
            <span class="name">{{ game.achievementsUnlocked.includes(a.id) ? a.name : '???' }}</span>
          </div>
        </div>
      </div>

      <!-- 技能评估 -->
      <div class="skill-card">
        <div class="skill-head">
          <div class="skill-ic">🧠</div>
          <h2 class="h-title">技能评估</h2>
        </div>
        <div class="skill-list">
          <div v-for="s in skills" :key="s.label" class="skill-row">
            <div class="skill-meta">
              <span class="skill-name">{{ s.label }}</span>
              <span class="skill-num" :class="['c-' + s.color]">{{ s.got }} / {{ s.max }}</span>
            </div>
            <div class="skill-bar">
              <i :class="['bar-' + s.color]"
                 :style="{ width: Math.round(s.got / s.max * 100) + '%' }"></i>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ====== v2.2 总结：3 天决策回顾 + 情境化文案 ====== -->
    <section class="summary">
      <div class="summary-head">
        <span class="se">{{ summaryEmoji }}</span>
        <div class="st">游戏总结 · 你的雨季三天</div>
      </div>
      <div class="day-review">
        <div v-for="(d, i) in decisionReview" :key="i" class="day-card" :class="{ ok: d.isCorrect, bad: !d.isCorrect }">
          <div class="dlabel">{{ d.emoji }} {{ d.label }}</div>
          <div class="dprob">AI 预测 <b>{{ d.prob }}%</b></div>
          <div class="dchoice">
            你的决策：
            <span class="cwarn" v-if="d.chose === true">🚨 发出预警</span>
            <span class="chold" v-else-if="d.chose === false">🕊️ 不发预警</span>
            <span class="cnone" v-else>—</span>
          </div>
          <div class="dverdict">
            <span v-if="d.isCorrect" class="ok">✅ 正确判断</span>
            <span v-else class="bad">❌ 这次失误</span>
          </div>
          <div class="daux" v-if="d.aux">辅助：{{ d.aux }}</div>
        </div>
      </div>
      <p class="summary-text">{{ summaryText }}</p>
    </section>

    <!-- ====== 镇长感谢卡 ====== -->
    <section class="mayor">
      <div class="mayor-skew"></div>
      <div class="mayor-ava">👨‍💼</div>
      <div class="mayor-body">
        <div class="mayor-kicker">— 来自清溪镇镇长的感谢信 —</div>
        <p class="mayor-text" v-if="game.total >= 80">
          {{ game.player }}：感谢你！你用 AI 帮清溪镇守住了大集。<br>
          你今天就是镇子的"<u>{{ game.title }}</u>"。
        </p>
        <p class="mayor-text" v-else>
          {{ game.player }}：辛苦了！这场雨季让我们看到，AI 给出的是<u>概率</u>，最后拍板的还是<u>你</u>。
          下次再来挑战！
        </p>
      </div>
    </section>

    <!-- ====== 排行榜 ====== -->
    <section class="board">
      <div class="board-head">🏆 本机成绩榜</div>
      <table class="board-table">
        <thead>
          <tr><th>名次</th><th>姓名</th><th>题集</th><th>总分</th><th>等级</th><th>时间</th></tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in board" :key="i" :class="{ me: r.name === game.player && r.time === rec.time }">
            <td class="rank">{{ medal[i] || (i + 1) }}</td>
            <td>{{ r.name }}</td>
            <td>{{ r.set }}</td>
            <td class="num">{{ r.total }}</td>
            <td><span class="grade-tag">{{ r.grade }}</span></td>
            <td class="time">{{ r.time }}</td>
          </tr>
          <tr v-if="!board.length"><td colspan="6" class="empty">还没有记录，加油！</td></tr>
        </tbody>
      </table>
      <div class="board-foot">
        <button class="btn3d white" @click="doExport">导出成绩单 📤</button>
        <button class="btn3d white" @click="doClear">清空成绩榜 🗑️</button>
      </div>
    </section>

    <!-- ====== 底部 3 按钮 ====== -->
    <section class="actions">
      <button class="btn3d yellow" @click="replay">🔄 再挑战一次</button>
      <button class="btn3d white"  @click="replay">🎲 换一套题目</button>
      <button class="btn3d cyan"   @click="reload">👤 换一位同学</button>
    </section>

  </div>
</template>

<style scoped>
/* ===== 局部变量（贴近设计稿配色，仅本组件） ===== */
.page {
  --c-slate:     #0F172A;
  --c-slate-bg:  #F8FAFC;

  --c-yellow:    #FBBF24;
  --c-orange:    #F97316;
  --c-emerald:   #10B981;
  --c-cyan:      #22D3EE;
  --c-indigo:    #6366F1;
  --c-pink:      #EC4899;
  --c-red:       #EF4444;

  --bg-blue:     #DBEAFE;
  --bg-yellow:   #FEF9C3;
  --bg-emerald:  #D1FAE5;
  --bg-slate:    #F1F5F9;
  --bg-indigo:   #E0E7FF;
  --bg-cyan:     #CFFAFE;
  --bg-orange:   #FFEDD5;
  --bg-pink:     #FCE7F3;
  --bg-red:      #FEE2E2;

  --bg-hero-left: #F0FDFA;
  --bg-mayor:     #FEF9C3;

  --r-card:  18px;
  --r-card-lg: 22px;
  --r-pill:  9999px;

  --sh-1: 0 3px 0 0 var(--c-slate);
  --sh-2: 0 4px 0 0 var(--c-slate);
  --sh-3: 0 5px 0 0 var(--c-slate);
  --sh-4: 0 6px 0 0 var(--c-slate);

  --bw: 2.5px;            /* 收紧厚边框 */

  max-width: 960px; margin-inline: auto;
  padding: var(--space-3) var(--space-3) var(--space-6);
  display: flex; flex-direction: column; gap: var(--space-3);
}

/* ============================ HERO（紧凑版） ============================ */
.hero {
  position: relative;
  background: #fff;
  border-radius: var(--r-card-lg);
  border: var(--bw) solid var(--c-slate);
  overflow: hidden;
  box-shadow: var(--sh-3);
  display: grid;
  grid-template-columns: 320px 1fr;   /* 左固定，右弹性 */
}
.hero-stripe {
  position: absolute; left: 0; right: 0; top: 0; height: 6px;
  background: linear-gradient(90deg, #FBBF24, #F97316, #EF4444);
  border-bottom: var(--bw) solid var(--c-slate);
  z-index: 1;
}
.hero-left {
  position: relative;
  background: var(--bg-hero-left);
  padding: var(--space-4) var(--space-3) var(--space-3);
  border-right: var(--bw) solid var(--c-slate);
  display: flex; flex-direction: column; align-items: center; gap: var(--space-2);
}
.medal-bg { display: none; }
.medal-disc {
  position: relative;
  width: 64px; height: 64px; border-radius: 50%;
  background: var(--c-yellow);
  border: var(--bw) solid var(--c-slate);
  box-shadow: 0 4px 0 0 #B45309;
  display: grid; place-items: center;
  animation: float-slow 4s ease-in-out infinite;
}
.medal-emoji { font-size: 36px; line-height: 1; filter: drop-shadow(0 1px 0 rgba(0,0,0,.3)); }
.medal-shine {
  position: absolute; inset: 0; border-radius: 50%;
  background: linear-gradient(135deg, rgba(255,255,255,.4) 0%, transparent 50%);
  pointer-events: none;
}
@keyframes float-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }

.task-banner {
  background: linear-gradient(180deg, #FF7B6B, #E2574C);
  color: #fff;
  font-size: var(--font-xl); font-weight: 900;
  letter-spacing: 2px;
  padding: 4px var(--space-4);
  border: var(--bw) solid var(--c-slate);
  border-radius: var(--radius-2);
  text-shadow: 1px 1px 0 rgba(0,0,0,.3);
  box-shadow: 0 3px 0 0 var(--c-slate);
}
.task-sub {
  font-size: 11.5px; font-weight: 900;
  color: #334155;
  background: #E2E8F0;
  padding: 2px 10px;
  border: 2px solid var(--c-slate);
  border-radius: var(--r-pill);
}
.stars-row {
  display: flex; gap: 3px;
}
.stars-row .star { font-size: 18px; line-height: 1; filter: drop-shadow(0 1px 0 rgba(0,0,0,.15)); opacity: 0.25; transition: opacity .3s; }
.stars-row .star.on { opacity: 1; }
.big-score {
  display: flex; align-items: baseline; justify-content: center; gap: 2px;
  margin-top: 2px;
}
.big-score .num {
  font-size: 56px; line-height: 1;
  font-weight: 900;
  color: var(--c-orange);
  text-shadow: 0 0 12px rgba(249, 115, 22, .35), 3px 3px 0 var(--c-slate);
  font-style: italic;
}
.big-score .unit { font-size: var(--font-md); font-weight: 900; color: var(--c-slate); }
.grade-pill {
  display: inline-flex; align-items: center; gap: 4px;
  background: #fff;
  border: var(--bw) solid var(--c-slate);
  border-radius: var(--r-pill);
  padding: 4px 14px;
  box-shadow: 0 3px 0 0 var(--c-slate);
  font-size: var(--font-md); font-weight: 900; color: var(--c-slate);
  font-style: italic;
}
.grade-pill .ic { font-size: var(--font-md); color: var(--c-yellow); }
.score-meta {
  background: #FFFDF6;
  border: 2px solid var(--c-slate);
  border-radius: var(--r-pill);
  padding: 2px 10px;
  font-size: 11px; font-weight: 900; color: var(--c-slate);
  box-shadow: 0 2px 0 var(--c-slate);
}

.hero-right {
  padding: var(--space-3);
  display: flex; flex-direction: column; gap: var(--space-2);
  min-width: 0;
}
.stat-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-2);
}
.stat-card {
  border: var(--bw) solid var(--c-slate);
  border-radius: 12px;
  padding: 6px 8px;
  text-align: center;
  box-shadow: 0 3px 0 0 var(--c-slate);
  display: flex; flex-direction: column; gap: 1px;
}
.stat-card.bg-blue    { background: var(--bg-blue); }
.stat-card.bg-yellow  { background: #FEF3C7; }
.stat-card.bg-emerald { background: var(--bg-emerald); }
.stat-card.bg-slate   { background: var(--bg-slate); }
.stat-card.bg-indigo  { background: var(--bg-indigo); }
.stat-card .k { font-size: 10.5px; font-weight: 900; letter-spacing: 0.5px; opacity: 0.75; }
.stat-card .v { font-size: var(--font-md); font-weight: 900; color: var(--c-slate); }

.equip-frame {
  background: var(--c-slate-bg);
  border: var(--bw) solid var(--c-slate);
  border-radius: 14px;
  padding: var(--space-2);
  display: flex; flex-direction: column; gap: var(--space-2);
}
.equip-title {
  font-size: 10.5px; font-weight: 900;
  color: #64748B; letter-spacing: 2px; text-align: center;
  text-transform: uppercase;
}
.equip-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-2);
}
.equip-card {
  background: #fff;
  border: var(--bw) solid var(--c-slate);
  border-radius: 12px;
  padding: 6px 4px;
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  box-shadow: 0 3px 0 0 var(--c-slate);
  transition: transform var(--dur-fast);
}
.equip-card:hover { transform: translateY(-2px); }
.equip-card .ic { font-size: 22px; line-height: 1; }
.equip-card .name { font-size: 11px; font-weight: 900; text-align: center; color: #334155; line-height: 1.2; }
.equip-empty { font-size: var(--font-xs); color: #64748B; padding: var(--space-2); text-align: center; grid-column: 1 / -1; }

/* ============================ TWO COL（紧凑版） ============================ */
.two-col {
  display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);
}
.ach-card, .skill-card {
  background: #fff;
  border: var(--bw) solid var(--c-slate);
  border-radius: var(--r-card-lg);
  padding: var(--space-4);
  box-shadow: var(--sh-3);
  display: flex; flex-direction: column; gap: var(--space-3);
}
.h-title {
  font-size: var(--font-md); font-weight: 900;
  color: var(--c-slate);
  letter-spacing: -0.02em;
  display: flex; align-items: center; gap: var(--space-1);
}
.ach-head { display: flex; justify-content: space-between; align-items: center; }
.ach-counter { text-align: right; }
.ach-counter-k { font-size: 10px; font-weight: 900; color: #94A3B8; letter-spacing: 0.5px; }
.ach-counter-v { font-size: var(--font-lg); font-weight: 900; color: var(--c-orange); line-height: 1; }
.ach-counter-v small { color: #94A3B8; font-size: var(--font-xs); }
.ach-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2);
}
.ach-chip {
  display: flex; align-items: center; justify-content: center; gap: 4px;
  background: #fff;
  border: var(--bw) solid var(--c-slate);
  border-radius: var(--r-pill);
  padding: 5px 10px;
  box-shadow: 0 3px 0 0 var(--c-slate);
  font-weight: 900;
  font-size: 12px;
  color: var(--c-slate);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  cursor: pointer;
}
.ach-chip .ic { font-size: 14px; line-height: 1; }
.ach-chip.locked {
  background: #F1F5F9;
  border-color: #CBD5E1;
  color: #94A3B8;
  box-shadow: 0 3px 0 0 #94A3B8;
}
.ach-chip.locked .ic { filter: grayscale(.8); opacity: .5; }

.skill-head { display: flex; align-items: center; gap: var(--space-2); }
.skill-ic {
  width: 28px; height: 28px;
  background: var(--c-indigo);
  border: var(--bw) solid var(--c-slate);
  border-radius: 8px;
  box-shadow: 0 3px 0 0 var(--c-slate);
  display: grid; place-items: center;
  font-size: 16px;
  color: #fff;
}
.skill-list { display: flex; flex-direction: column; gap: var(--space-2); }
.skill-row { display: flex; flex-direction: column; gap: 4px; }
.skill-meta { display: flex; justify-content: space-between; align-items: center; }
.skill-name { font-size: 11px; font-weight: 900; color: #334155; letter-spacing: 0.5px; }
.skill-num {
  font-size: 11px; font-weight: 900;
  border: 2px solid var(--c-slate); border-radius: var(--r-pill);
  padding: 1px 8px;
}
.skill-num.c-cyan   { color: #0891B2; background: var(--bg-cyan); }
.skill-num.c-orange { color: #C2410C; background: var(--bg-orange); }
.skill-num.c-pink   { color: #BE185D; background: var(--bg-pink); }
.skill-num.c-red    { color: #B91C1C; background: var(--bg-red); }
.skill-bar {
  height: 14px;
  background: var(--bg-slate);
  border: 2px solid var(--c-slate);
  border-radius: var(--r-pill);
  overflow: hidden;
  padding: 1px;
  box-shadow: inset 0 1px 2px rgba(0,0,0,.1);
}
.skill-bar i {
  display: block; height: 100%;
  border-radius: var(--r-pill);
  border-right: 2px solid var(--c-slate);
  box-shadow: inset 0 2px 3px rgba(255,255,255,.6);
  transition: width 1.2s var(--ease-snap);
}
.skill-bar i.bar-cyan   { background: var(--c-cyan); }
.skill-bar i.bar-orange { background: #FB923C; }
.skill-bar i.bar-pink   { background: #F472B6; }
.skill-bar i.bar-red    { background: #F87171; }

/* ============================ v2.2 总结区 ============================ */
.summary {
  background: linear-gradient(180deg, #fff, #F8FAFC);
  border: var(--bw) solid var(--c-slate);
  border-radius: var(--r-card-lg);
  padding: var(--space-4);
  box-shadow: var(--sh-3);
}
.summary-head { display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-3); }
.summary-head .se { font-size: 30px; line-height: 1; }
.summary-head .st { font-size: var(--font-lg); font-weight: 900; color: var(--c-slate); }
.day-review { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-2); margin-bottom: var(--space-3); }
.day-card {
  background: #fff; border: var(--bw) solid var(--c-slate);
  border-radius: 12px; padding: var(--space-2);
  box-shadow: 0 3px 0 var(--c-slate);
  font-size: var(--font-xs); text-align: left;
}
.day-card.ok { border-color: var(--c-emerald); box-shadow: 0 3px 0 var(--c-emerald); }
.day-card.bad { border-color: var(--c-red); box-shadow: 0 3px 0 var(--c-red); }
.day-card .dlabel { font-weight: 900; font-size: var(--font-sm); margin-bottom: 4px; }
.day-card .dprob b { color: var(--c-orange); font-size: var(--font-md); }
.day-card .dchoice { margin-top: 4px; color: var(--c-text-muted); font-weight: 700; }
.day-card .cwarn { color: #C2410C; font-weight: 900; }
.day-card .chold { color: #1E40AF; font-weight: 900; }
.day-card .cnone { color: #9CA3AF; }
.day-card .dverdict { margin-top: 6px; }
.day-card .dverdict .ok { color: #047857; font-weight: 900; }
.day-card .dverdict .bad { color: #B91C1C; font-weight: 900; }
.day-card .daux { font-size: 10.5px; color: var(--c-text-muted); margin-top: 4px; font-style: italic; }
.summary-text {
  background: linear-gradient(180deg, #FEF3C7, #FDE68A);
  border: var(--bw) solid var(--c-slate);
  border-radius: 14px;
  padding: var(--space-3);
  font-size: var(--font-md); font-weight: 800; color: var(--c-slate);
  text-align: center; line-height: 1.55;
  box-shadow: 0 3px 0 var(--c-slate);
}
@media (max-width: 640px) {
  .day-review { grid-template-columns: 1fr; }
}

/* ============================ MAYOR（紧凑版） ============================ */
.mayor {
  position: relative; overflow: hidden;
  background: var(--bg-mayor);
  border: var(--bw) solid var(--c-slate);
  border-radius: var(--r-card);
  padding: var(--space-3) var(--space-4);
  box-shadow: var(--sh-2);
  display: flex; gap: var(--space-3); align-items: center;
}
.mayor-skew {
  position: absolute; right: -10px; top: 0; bottom: 0; width: 100px;
  background: rgba(251, 191, 36, .2);
  transform: skewX(-12deg);
  z-index: 0;
}
.mayor-ava {
  flex: 0 0 44px; width: 44px; height: 44px;
  background: #fff;
  border: var(--bw) solid var(--c-slate); border-radius: 12px;
  display: grid; place-items: center;
  font-size: 24px;
  box-shadow: 0 3px 0 0 var(--c-slate);
  z-index: 1;
}
.mayor-body { z-index: 1; flex: 1; min-width: 0; }
.mayor-kicker {
  display: inline-block;
  background: var(--c-yellow);
  color: #92400E;
  font-size: 10px; font-weight: 900;
  letter-spacing: 1px;
  padding: 2px 10px;
  border: 2px solid var(--c-slate); border-radius: var(--r-pill);
  box-shadow: 0 2px 0 0 var(--c-slate);
  margin-bottom: var(--space-1);
  font-style: italic;
}
.mayor-text {
  font-size: var(--font-sm); font-weight: 700;
  color: var(--c-slate); line-height: 1.55;
}
.mayor-text u {
  text-decoration: underline;
  text-decoration-color: var(--c-emerald);
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
  color: #047857;
}

@media (max-width: 640px) {
  .mayor { flex-direction: column; text-align: center; }
}

/* ============================ BOARD（紧凑版） ============================ */
.board {
  background: #fff;
  border: var(--bw) solid var(--c-slate);
  border-radius: var(--r-card-lg);
  overflow: hidden;
  box-shadow: var(--sh-3);
}
.board-head {
  background: var(--c-indigo);
  color: #fff;
  font-size: var(--font-md); font-weight: 900;
  letter-spacing: 2px;
  text-align: center;
  padding: var(--space-2);
  border-bottom: var(--bw) solid var(--c-slate);
}
.board-table { width: 100%; border-collapse: collapse; font-size: var(--font-xs); }
.board-table thead tr { background: var(--bg-slate); border-bottom: var(--bw) solid var(--c-slate); }
.board-table th { padding: 6px var(--space-2); font-weight: 900; color: #334155; font-style: italic; }
.board-table td { padding: 6px var(--space-2); text-align: center; border-bottom: 1.5px solid #E2E8F0; }
.board-table .rank { font-size: 18px; line-height: 1; }
.board-table .num { font-size: var(--font-md); font-weight: 900; color: var(--c-orange); }
.board-table .time { font-size: 10.5px; color: #64748B; white-space: nowrap; font-weight: 900; }
.board-table tr.me { background: #FEFCE8; }
.board-table .empty { color: #94A3B8; font-weight: 700; padding: var(--space-3); }
.grade-tag {
  background: #FEF3C7;
  border: 1.5px solid var(--c-slate);
  border-radius: var(--r-pill);
  padding: 1px 8px;
  font-size: 10px; font-weight: 900;
  color: #92400E;
}

.board-foot {
  display: flex; flex-wrap: wrap; justify-content: center;
  gap: var(--space-2);
  background: var(--bg-slate);
  padding: var(--space-2);
  border-top: var(--bw) solid var(--c-slate);
}

/* ============================ 3D BUTTONS（紧凑版） ============================ */
.actions {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-3);
  margin-top: var(--space-1);
}
.btn3d {
  border: var(--bw) solid var(--c-slate);
  border-radius: var(--r-card);
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-sm); font-weight: 900;
  color: var(--c-slate);
  cursor: pointer;
  transition: all 0.1s ease;
  display: inline-flex; align-items: center; justify-content: center; gap: var(--space-1);
}
.actions .btn3d {
  padding-block: var(--space-3);
  font-size: var(--font-md);
}
.btn3d.yellow { background: var(--c-yellow); box-shadow: 0 4px 0 0 var(--c-slate); }
.btn3d.white  { background: #fff;            box-shadow: 0 4px 0 0 var(--c-slate); }
.btn3d.cyan   { background: var(--c-cyan);   box-shadow: 0 4px 0 0 var(--c-slate); }
.btn3d:active { transform: translateY(3px); box-shadow: 0 1px 0 0 var(--c-slate); }

/* ============================ 响应式 ============================ */
@media (max-width: 880px) {
  .hero { grid-template-columns: 1fr; }
  .hero-left { border-right: none; border-bottom: var(--bw) solid var(--c-slate); }
  .two-col { grid-template-columns: 1fr; }
  .actions { grid-template-columns: 1fr; }
  .equip-grid { grid-template-columns: repeat(4, 1fr); }
}
@media (max-width: 480px) {
  .stat-grid { grid-template-columns: 1fr 1fr 1fr; }
  .equip-grid { grid-template-columns: 1fr 1fr; }
  .big-score .num { font-size: 44px; text-shadow: 2px 2px 0 var(--c-slate); }
  .task-banner { font-size: var(--font-lg); }
}

/* v2.2 手机横屏 */
@media (orientation: landscape) and (max-height: 500px) {
  .hero { grid-template-columns: 280px 1fr; }
  .hero-left { padding: 10px; }
  .medal-disc { width: 50px; height: 50px; }
  .medal-emoji { font-size: 30px; }
  .task-banner { font-size: 16px; padding: 2px 12px; }
  .big-score .num { font-size: 36px; }
  .stat-card { padding: 4px 6px; }
  .stat-card .v { font-size: 13px; }
  .day-review { grid-template-columns: 1fr 1fr 1fr; }
}
</style>

<!--
  第四关：决策剧场（全屏沉浸）
  设计契约：
  - stage 占满 viewport 宽度，但内部内容用 max-width: var(--reading-max) 收紧
  - 元素间垂直 gap 用 token，最大不超过 var(--space-6)，避免空旷感
  - 高风险日（≥70%）叠加 .danger 红脉冲 + 心跳音
-->
<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { useGame } from '../game/store';
import { audio } from '../utils/audio';
import { tts } from '../utils/tts';
import { WEATHER_SVG, weatherKey } from '../assets/weatherSvg';
import Stack from '../primitives/Stack.vue';
import Cluster from '../primitives/Cluster.vue';

const game = useGame();
// 0=入场过场, 1..N=第 N 天, N+1=收场
const step = ref(0);
const decided = ref(false);
const lastChoice = ref<boolean | null>(null);

const currentDay = computed(() => step.value >= 1 && step.value <= game.days.length ? game.days[step.value - 1] : null);
const isFinale = computed(() => step.value === game.days.length + 1);

const skyClass = computed(() => {
  if (step.value === 0) return 'sky-storm';
  if (isFinale.value) return 'sky-dawn';
  const d = currentDay.value!;
  if (decided.value && lastChoice.value === d.bestWarn) return 'sky-dawn';
  if (d.prob >= 70) return 'sky-storm';
  if (d.prob >= 40) return 'sky-rain';
  return 'sky-clear';
});
const dangerClass = computed(() => currentDay.value && currentDay.value.prob >= 70 && !decided.value);

let hbTimer: number | null = null;
function startHb() {
  if (hbTimer) return;
  hbTimer = window.setInterval(() => audio.sfx('tick'), 880);
}
function stopHb() { if (hbTimer) { clearInterval(hbTimer); hbTimer = null; } }
onUnmounted(stopHb);

function enterDay(i: number) {
  step.value = i + 1;
  decided.value = false;
  lastChoice.value = null;
  audio.sfx('whoosh');
  const d = game.days[i];
  if (d.prob >= 70) startHb(); else stopHb();
  game.setMood(d.prob >= 70 ? 'wow' : d.prob >= 40 ? 'worried' : 'happy');
  tts.speak(`第${'一二三'[i] || (i + 1)}天。${d.ctx}。模型预测，洪水概率百分之${d.prob}。`);
}

function decide(warn: boolean) {
  if (!currentDay.value) return;
  decided.value = true;
  lastChoice.value = warn;
  stopHb();
  game.decide(step.value - 1, warn);
  if (warn) audio.sfx('siren');
  const d = currentDay.value;
  const ok = (warn === d.bestWarn) || (d.bestWarn === null);
  setTimeout(() => audio.sfx(ok ? 'good' : 'bad'), warn ? 600 : 0);
  game.setMood(ok ? 'proud' : 'worried');
  tts.speak(warn ? d.warnMsg.text : d.holdMsg.text);
}
function useHint() {
  game.useHint();
  audio.sfx('click');
  game.showToast('💡 已查看提示（-1 分）');
}
function next() {
  if (step.value < game.days.length) enterDay(step.value);
  else step.value = game.days.length + 1;
}
function claim() {
  audio.sfx('win');
  game.finishDeploy();
  setTimeout(() => game.finishGame(), 1200);
}

const correctCount = computed(() => game.days.reduce((a, d, i) =>
  a + ((d.bestWarn === null || game.dayChoice[i] === d.bestWarn) ? 1 : 0), 0));
const allGood = computed(() => correctCount.value === game.days.length);

// 角色反馈
function reactions(d: any, warn: boolean) {
  const ok = (warn === d.bestWarn) || (d.bestWarn === null);
  let key = '';
  if (d.prob >= 70) key = warn ? 'high_warn' : 'high_hold';
  else if (d.prob >= 40) key = warn ? 'mid_warn' : 'mid_hold';
  else key = warn ? 'low_warn' : 'low_hold';
  const map: Record<string, [string, string, string, string][]> = {
    high_warn: [['mayor','👨‍💼','镇长','决策果断，镇民安全第一！'], ['vendor','👵','摊主','虽然没开市，但平安最值钱。'], ['doc','☁️','云博士','把 AI 高概率当真，就是"提前量"。']],
    high_hold: [['mayor','👨‍💼','镇长','损失太大，下次别赌运气。'], ['vendor','👵','摊主','我的糖葫芦都被冲走了……'], ['doc','☁️','云博士','高概率被忽视，漏报代价最重。']],
    mid_warn:  [['mayor','👨‍💼','镇长','拿不准时多准备，是稳妥之选。'], ['vendor','👵','摊主','虽然停了半天，但能理解。'], ['doc','☁️','云博士','AI 说"也许"，人就要把"万一"准备好。']],
    mid_hold:  [['mayor','👨‍💼','镇长','幸亏没出事，下次要再小心。'], ['vendor','👵','摊主','虚惊一场，谢谢镇民帮忙巡河。'], ['doc','☁️','云博士','拿不准时，多一道观察永远不丢人。']],
    low_warn:  [['mayor','👨‍💼','镇长','下次预警可以更谨慎些。'], ['vendor','👵','摊主','哎，白白少赚了一天。'], ['doc','☁️','云博士','预警要珍惜着用。']],
    low_hold:  [['mayor','👨‍💼','镇长','干得好，不打扰大家是对的。'], ['vendor','👵','摊主','谢谢，今天生意红火！'], ['doc','☁️','云博士','低概率保持冷静，是正确的决策。']]
  };
  return map[key] || [];
}
</script>
<template>
  <div class="stage" :class="[skyClass, { danger: dangerClass }]">
    <!-- 背景装饰：远山剪影 + 飘云，填补宽屏空白 -->
    <svg class="stage-bg" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <path d="M0 620 Q200 540 380 600 Q540 530 720 590 Q900 540 1080 600 Q1240 540 1440 600 L1440 800 L0 800 Z" fill="rgba(0,0,0,0.18)"/>
      <path d="M0 680 Q180 620 360 660 Q540 620 720 660 Q900 620 1080 660 Q1260 620 1440 660 L1440 800 L0 800 Z" fill="rgba(0,0,0,0.22)"/>
      <g fill="rgba(255,255,255,0.32)">
        <ellipse cx="180"  cy="140" rx="60" ry="20"/><circle cx="160" cy="125" r="22"/><circle cx="200" cy="120" r="26"/>
        <ellipse cx="1240" cy="180" rx="56" ry="18"/><circle cx="1220" cy="166" r="20"/><circle cx="1260" cy="160" r="24"/>
        <ellipse cx="780"  cy="80"  rx="40" ry="12"/><circle cx="768"  cy="72" r="14"/>
      </g>
    </svg>
    <div class="content">
      <!-- 入场过场 -->
      <Stack v-if="step === 0" :gap="4" align="center">
        <div class="art" v-html="WEATHER_SVG.storm"></div>
        <span class="kicker">⚠️ 雨季来袭</span>
        <h2 class="cut-title">未来三天，<br>清溪河命运未卜</h2>
        <p class="cut-sub">AI 每天给出 <b>洪水概率</b>。<br>发不发预警，全镇人等你拍板。</p>
        <button class="btn" @click="enterDay(0)">▶ 开始三天预报</button>
      </Stack>

      <!-- 每日剧情 -->
      <Stack v-else-if="currentDay && !decided" :gap="3" align="center">
        <div class="ribbon">
          <span class="rday">DAY {{ step }} / {{ game.days.length }}</span>
          {{ currentDay.label }}
        </div>
        <div class="art-md" v-html="WEATHER_SVG[weatherKey(currentDay.prob)]"></div>
        <div class="ctx">{{ currentDay.emoji }} {{ currentDay.ctx }}</div>

        <div class="ai">
          <div class="ai-tag">🤖 AI 模型预测</div>
          <div class="ai-prob" :class="currentDay.cls">{{ currentDay.prob }}<span>%</span></div>
          <div class="ai-label">今日洪水概率</div>
          <div class="gauge"><i :style="{ width: currentDay.prob + '%', background: currentDay.color }"></i></div>
        </div>

        <div v-if="currentDay.aux" class="aux">额外辅助：<b>{{ currentDay.aux }}</b></div>

        <Cluster :gap="3" justify="center">
          <button class="choice warn" @click="decide(true)">
            <span class="ci">🚨</span><span class="ct">发出预警</span><span class="cd">大集停业一天</span>
          </button>
          <button class="choice hold" @click="decide(false)">
            <span class="ci">🕊️</span><span class="ct">不发预警</span><span class="cd">照常开集</span>
          </button>
          <button class="choice hint" @click="useHint">
            <span class="ci">💡</span><span class="ct">查看提示</span><span class="cd">-1 分</span>
          </button>
        </Cluster>

        <div v-if="game.hintsUsed > 0" class="hint-box">
          <template v-if="currentDay.prob >= 70"><b>高概率：</b>漏报代价远大于误报代价。</template>
          <template v-else-if="currentDay.prob >= 40"><b>不确定：</b>AI 也拿不准，人要补上更多观察与准备。</template>
          <template v-else><b>低概率：</b>频繁预警会让大家失去信任（狼来了效应）。</template>
        </div>
      </Stack>

      <!-- 抉择结果 -->
      <Stack v-else-if="currentDay && decided" :gap="3" align="center">
        <div class="art" v-html="WEATHER_SVG[(lastChoice === currentDay.bestWarn || currentDay.bestWarn === null) ? 'cloudsun' : 'storm']"></div>
        <h2 class="result">{{ (lastChoice === currentDay.bestWarn || currentDay.bestWarn === null) ? '判断正确！' : '损失惨重……' }}</h2>
        <div class="rcard">
          <div class="rcc">{{ lastChoice ? '🚨 你选择了：发出预警' : '🕊️ 你选择了：不发预警' }}</div>
          <p class="rct">{{ lastChoice ? currentDay.warnMsg.text : currentDay.holdMsg.text }}</p>
        </div>
        <div class="chars">
          <div v-for="(c, i) in reactions(currentDay, lastChoice!)" :key="i" class="cb" :style="{ animationDelay: (i * .15) + 's' }">
            <div class="ca" :class="c[0]">{{ c[1] }}</div>
            <div><div class="cn">{{ c[2] }}</div><div class="cx">{{ c[3] }}</div></div>
          </div>
        </div>
        <button class="btn" @click="next">{{ step < game.days.length ? `▶ 进入第${'二三四'[step - 1]}天` : '查看三天结果 →' }}</button>
      </Stack>

      <!-- 收场 -->
      <Stack v-else-if="isFinale" :gap="4" align="center">
        <div class="art" v-html="WEATHER_SVG.sun"></div>
        <span class="kicker">🌈 雨季结束</span>
        <h2 class="cut-title">{{ allGood ? '清溪镇平安度过雨季！' : '雨季过去了……' }}</h2>
        <p class="cut-sub">三天里，你做对了 <b>{{ correctCount }}/{{ game.days.length }}</b> 个关键决策。</p>
        <button class="btn" @click="claim">🏅 领取我的徽章</button>
      </Stack>
    </div>
  </div>
</template>
<style scoped>
/* stage 突破父容器宽度，但内容仍被 reading-max 收紧 */
.stage {
  position: relative;
  width: 100vw; margin-inline: calc(50% - 50vw);
  min-height: calc(100vh - var(--header-h));
  display: grid; place-items: center;
  padding: var(--space-5) var(--space-4);
  overflow: hidden;
  transition: background var(--dur-slow) ease;
}
.stage.sky-clear { background: linear-gradient(180deg, #7FD4F0 0%, #B8E9F2 55%, #E9F9EF 100%); }
.stage.sky-rain  { background: linear-gradient(180deg, #5E7E96 0%, #8AA4B6 55%, #C2D4D8 100%); }
.stage.sky-storm { background: linear-gradient(180deg, #39495E 0%, #5A6E84 55%, #8A9CAA 100%); }
.stage.sky-dawn  { background: linear-gradient(180deg, #FFD194 0%, #FFC1A1 40%, #A9E5D8 100%); }
/* 远山剪影 + 云的装饰层，让 1440+ 宽屏不空旷 */
.stage-bg {
  position: absolute; left: 0; right: 0; bottom: 0; top: 0;
  width: 100%; height: 100%; pointer-events: none;
  z-index: 0;
}
.stage > .content { position: relative; z-index: 1; }
.stage.danger::after {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  box-shadow: inset 0 0 0 8px rgba(255,80,80,0);
  animation: dangerpulse 1.05s ease-in-out infinite;
}
@keyframes dangerpulse {
  0%,100% { box-shadow: inset 0 0 0 8px rgba(255,80,80,0); }
  50%     { box-shadow: inset 0 0 0 8px rgba(255,80,80,.55); }
}
.content { width: 100%; max-width: var(--reading-max); text-align: center; }

/* 入场 / 收场 */
.art { width: 140px; height: 140px; margin: 0 auto; filter: drop-shadow(0 8px 18px rgba(0,0,0,.25)); }
.art :deep(svg) { width: 100%; height: 100%; }
.kicker {
  display: inline-block; color: #fff;
  font-size: var(--font-xs); font-weight: 900; letter-spacing: 3px;
  background: rgba(255,255,255,.2); border: 2px solid rgba(255,255,255,.6);
  border-radius: var(--radius-pill); padding: var(--space-1) var(--space-4);
}
.cut-title {
  font-size: var(--font-3xl); font-weight: 900; line-height: var(--leading-tight);
  color: #fff; text-shadow: 0 3px 0 rgba(27,58,64,.4), 0 10px 26px rgba(0,0,0,.3);
  margin: 0;
}
.cut-sub {
  font-size: var(--font-md); line-height: var(--leading-loose);
  color: #fff; opacity: .95; text-shadow: 0 2px 8px rgba(0,0,0,.25);
}
.cut-sub b { color: #FFE27A; }

/* 每日 */
.ribbon {
  display: inline-flex; align-items: center; gap: var(--space-2);
  color: #fff; font-size: var(--font-md); font-weight: 900;
  background: rgba(27,58,64,.55); border: 2.5px solid rgba(255,255,255,.5);
  border-radius: var(--radius-pill); padding: var(--space-2) var(--space-4);
}
.rday { background: var(--c-sun); color: var(--c-ink); border-radius: var(--radius-pill); padding: 2px 11px; font-size: var(--font-xs); }
.art-md { width: 110px; height: 110px; margin: 0 auto; }
.art-md :deep(svg) { width: 100%; height: 100%; }
.ctx {
  display: inline-block; color: #fff; font-size: var(--font-md); font-weight: 800;
  background: rgba(27,58,64,.5);
  border-radius: var(--radius-3); padding: var(--space-2) var(--space-4);
  max-width: 540px;
}
.ai {
  background: rgba(255,255,255,.96);
  border: var(--bw-2) solid var(--c-ink); border-radius: var(--radius-5);
  padding: var(--space-3) var(--space-4);
  max-width: 380px; width: 100%; margin: 0 auto;
  box-shadow: 0 8px 0 var(--c-ink), 0 20px 40px rgba(0,0,0,.25);
}
.ai-tag { font-size: var(--font-xs); font-weight: 900; color: #2B7A78; letter-spacing: 1px; }
.ai-prob { font-size: 56px; font-weight: 900; line-height: 1; color: var(--c-ink); }
.ai-prob span { font-size: 26px; }
.ai-prob.prob-low { color: #3FA56F; } .ai-prob.prob-mid { color: #E8951C; } .ai-prob.prob-high { color: #E2574C; }
.ai-label { font-size: var(--font-sm); font-weight: 800; color: #6A7A82; margin-bottom: var(--space-2); }
.gauge { height: 18px; background: #E3F3FA; border-radius: var(--radius-pill); overflow: hidden; border: var(--bw-2) solid var(--c-ink); }
.gauge i { display: block; height: 100%; border-radius: var(--radius-pill); transition: width 1.1s var(--ease-snap); }

.aux { color: #fff; font-size: var(--font-sm); text-shadow: 0 1px 4px rgba(0,0,0,.4); }
.aux b { color: #FFE27A; }

.choice {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  width: 160px; padding: var(--space-3) var(--space-2);
  border: var(--bw-2) solid var(--c-ink); border-radius: var(--radius-5);
  box-shadow: 0 7px 0 var(--c-ink), 0 14px 24px rgba(0,0,0,.18);
  cursor: pointer; transition: transform var(--dur-fast);
}
.choice:hover { transform: translateY(-3px); }
.choice.warn { background: linear-gradient(180deg, #FF9A8B, #F46B5B); }
.choice.hold { background: linear-gradient(180deg, #9FE0F0, #5EC0DC); }
.choice.hint { background: linear-gradient(180deg, #FFE27A, #FFB30F); }
.choice .ci { font-size: 32px; }
.choice .ct { color: #fff; font-size: var(--font-md); font-weight: 900; text-shadow: 0 2px 0 rgba(27,58,64,.45); }
.choice .cd { color: rgba(255,255,255,.92); font-size: var(--font-xs); font-weight: 800; }
.choice.hint .ct, .choice.hint .cd { color: var(--c-ink); text-shadow: none; }

.hint-box {
  max-width: 430px;
  background: rgba(255,255,255,.96);
  border: var(--bw-2) dashed var(--c-candy);
  border-radius: var(--radius-3);
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-sm); color: var(--c-text);
  font-weight: 700;
}
.hint-box b { color: #9c6b00; }

/* 结果 */
.result {
  font-size: var(--font-2xl); font-weight: 900;
  color: #fff; text-shadow: 0 3px 0 rgba(27,58,64,.4), 0 8px 20px rgba(0,0,0,.3);
}
.rcard {
  background: rgba(255,255,255,.97);
  border: var(--bw-2) solid var(--c-ink); border-radius: var(--radius-4);
  padding: var(--space-3) var(--space-4);
  max-width: 540px; margin: 0 auto;
  box-shadow: 0 7px 0 var(--c-ink);
  text-align: left;
}
.rcc { font-size: var(--font-md); font-weight: 900; padding-bottom: var(--space-2);
  border-bottom: 2px dashed #D8E2E0; margin-bottom: var(--space-2); }
.rct { font-size: var(--font-sm); line-height: var(--leading-loose); color: #3A5560; font-weight: 600; margin: 0; }

.chars { display: flex; flex-direction: column; gap: var(--space-2); max-width: 540px; width: 100%; }
.cb {
  display: flex; align-items: flex-start; gap: var(--space-2);
  background: rgba(255,255,255,.97);
  border: var(--bw-2) solid var(--c-ink); border-radius: var(--radius-3);
  padding: var(--space-2) var(--space-3);
  text-align: left; box-shadow: 0 4px 0 var(--c-ink);
  animation: fadeUp .4s ease backwards;
}
.ca { flex: 0 0 36px; width: 36px; height: 36px; border-radius: 50%;
  border: 2.5px solid var(--c-ink); display: grid; place-items: center; font-size: 20px; background: #fff; }
.ca.mayor { background: #FFE2A0; } .ca.vendor { background: #FFD7E1; } .ca.doc { background: #E6F6FF; }
.cn { font-size: var(--font-xs); font-weight: 900; color: var(--c-water-d); }
.cx { font-size: var(--font-sm); font-weight: 600; color: #3A5560; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
</style>

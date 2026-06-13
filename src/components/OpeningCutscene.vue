<!--
  开场剧情动画（1m20s 共 8 帧）
  - 把故事背景 + AI 四步流程 用儿童语言串起来
  - 每帧 10 秒自动切换，带云博士 TTS 朗读
  - 顶部进度条 + 跳过按钮 + 上一帧 / 下一帧手动控制
-->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { tts } from '../utils/tts';
import { audio } from '../utils/audio';

const emit = defineEmits<{ (e: 'done'): void }>();

interface Frame {
  art: string;     // 主插画 SVG 或 emoji 组合
  title: string;
  text: string;
  speak: string;
  bg: string;      // 帧背景
}

const FRAMES: Frame[] = [
  {
    art: '🏞️🛶',
    title: '美丽的清溪镇',
    text: '清溪镇坐落在一条小河边，每周都有热闹的<b>河畔大集</b>。',
    speak: '清溪镇坐落在一条小河边，每周都有热闹的河畔大集，摊主们卖糖葫芦、卖瓜果，孩子们围着河边跑来跑去。',
    bg: 'linear-gradient(180deg, #BDE9FF, #FFF8E7)'
  },
  {
    art: '⛈️',
    title: '但是雨季会来',
    text: '一到雨季，乌云就压过来。<b>河水可能会涨</b>，集市就有危险。',
    speak: '可是一到雨季，乌云就压过来。河水可能会涨，集市就有危险。',
    bg: 'linear-gradient(180deg, #5A6E84, #8AA4B6)'
  },
  {
    art: '🌊😢',
    title: '去年的洪水',
    text: '去年的洪水冲进集市，<b>摊主们损失惨重</b>。镇长很担心，今年还会再来吗？',
    speak: '去年的洪水冲进集市，摊主们损失惨重。镇长很担心，今年还会再来吗？',
    bg: 'linear-gradient(180deg, #4A5A70, #6E8A9C)'
  },
  {
    art: '👨‍💼☁️',
    title: '镇长请来云博士',
    text: '镇长请来了云博士。云博士说：<b>我们可以用 AI，帮镇子提前预测洪水！</b>',
    speak: '镇长请来了云博士。云博士说，我们可以用 AI，帮镇子提前预测洪水！',
    bg: 'linear-gradient(180deg, #BDE9FF, #E8F8FF)'
  },
  {
    art: '🔍📊',
    title: '第一步：收集数据',
    text: 'AI 想学会预测，先要"看资料"——<b>降雨量、河水位、上游放水…</b>这些才是和洪水有关的<b>数据</b>。',
    speak: 'AI 想学会预测，先要看资料。降雨量、河水位、上游放水，这些才是和洪水有关的数据。我们要找出有用的，扔掉没用的。',
    bg: 'linear-gradient(180deg, #FFF6E3, #FFE9B8)'
  },
  {
    art: '🧹✨',
    title: '第二步：清洗数据',
    text: '可是资料里会混进<b>错误</b>——空白的、超大的、负数的、重复的。<b>不清掉它们，AI 会学糊涂！</b>',
    speak: '可是资料里会混进错误。空白的、超大的、负数的、重复的。不清掉它们，AI 会学糊涂。',
    bg: 'linear-gradient(180deg, #E2F8E9, #D1FAE5)'
  },
  {
    art: '🧠⚡',
    title: '第三步：训练模型',
    text: '把干净的数据喂给 AI，让它<b>反复学习</b>，再用没见过的考题考它。准确率高，才能上岗！',
    speak: '把干净的数据喂给 AI，让它反复学习，再用它没见过的考题考它。准确率高，才能上岗。',
    bg: 'linear-gradient(180deg, #FCE7F3, #FBCFE8)'
  },
  {
    art: '🎯👤',
    title: '第四步：你来决策',
    text: 'AI 算出"明天 87% 会洪水"，<b>发不发预警，由你拍板</b>。AI 给概率，但<b>最终决定权在人</b>！',
    speak: 'AI 算出明天百分之八十七会洪水，发不发预警，由你拍板。AI 给概率，但最终决定权永远在人！',
    bg: 'linear-gradient(180deg, #FFD194, #FFC1A1)'
  }
];

const FRAME_MS = 10000;
const idx = ref(0);
const progress = ref(0);
let frameTimer: number | null = null;
let progressTimer: number | null = null;

const current = computed(() => FRAMES[idx.value]);
const isLast = computed(() => idx.value === FRAMES.length - 1);

function startFrame() {
  if (frameTimer) clearTimeout(frameTimer);
  if (progressTimer) clearInterval(progressTimer);
  progress.value = 0;
  audio.sfx('whoosh');
  tts.speak(current.value.speak, true);

  const startTime = Date.now();
  progressTimer = window.setInterval(() => {
    progress.value = Math.min(100, (Date.now() - startTime) / FRAME_MS * 100);
  }, 100);

  if (!isLast.value) {
    frameTimer = window.setTimeout(() => goNext(), FRAME_MS);
  }
}
function goNext() {
  if (isLast.value) { skip(); return; }
  idx.value++;
}
function goPrev() {
  if (idx.value === 0) return;
  idx.value--;
}
function skip() {
  if (frameTimer) clearTimeout(frameTimer);
  if (progressTimer) clearInterval(progressTimer);
  tts.cancel();
  audio.sfx('star');
  emit('done');
}

watch(idx, () => startFrame());
onMounted(() => { audio.init(); startFrame(); });
onUnmounted(() => {
  if (frameTimer) clearTimeout(frameTimer);
  if (progressTimer) clearInterval(progressTimer);
  tts.cancel();
});
</script>
<template>
  <div class="cutscene" :style="{ background: current.bg }">
    <!-- 顶部：进度条 + 帧序号 + 跳过 -->
    <div class="top-bar">
      <div class="frames">
        <span v-for="(_, i) in FRAMES" :key="i" class="dot" :class="{ on: i === idx, done: i < idx }"></span>
      </div>
      <button class="skip-btn" @click="skip">跳过 →</button>
    </div>
    <div class="prog-rail"><div class="prog-fill" :style="{ width: progress + '%' }"></div></div>

    <!-- 主帧 -->
    <Transition name="frame" mode="out-in">
      <div class="frame" :key="idx">
        <div class="art">{{ current.art }}</div>
        <h2 class="title">{{ current.title }}</h2>
        <p class="text" v-html="current.text"></p>
      </div>
    </Transition>

    <!-- 底部控制 -->
    <div class="bottom-bar">
      <button class="ctrl" :disabled="idx === 0" @click="goPrev">← 上一段</button>
      <span class="frame-num">{{ idx + 1 }} / {{ FRAMES.length }}</span>
      <button class="ctrl primary" @click="goNext">
        {{ isLast ? '我准备好啦 🚀' : '下一段 →' }}
      </button>
    </div>
  </div>
</template>
<style scoped>
.cutscene {
  position: relative;
  min-height: calc(100vh - var(--header-h));
  width: 100vw;
  margin-inline: calc(50% - 50vw);
  display: grid; grid-template-rows: auto auto 1fr auto;
  padding: var(--space-3) var(--space-4) var(--space-4);
  overflow: hidden;
  transition: background var(--dur-slow) ease;
}
.top-bar {
  display: flex; justify-content: space-between; align-items: center;
  max-width: var(--reading-max); margin: 0 auto var(--space-2); width: 100%;
}
.frames { display: flex; gap: 6px; }
.dot {
  width: 24px; height: 6px; border-radius: var(--radius-pill);
  background: rgba(255,255,255,.4); border: 1.5px solid var(--c-ink);
  transition: background var(--dur-med);
}
.dot.done { background: var(--c-good); }
.dot.on   { background: var(--c-sun); transform: scaleY(1.4); }
.skip-btn {
  font-size: var(--font-sm); font-weight: 900;
  background: rgba(255,255,255,.85);
  border: 2px solid var(--c-ink);
  border-radius: var(--radius-pill);
  padding: 4px 14px;
  box-shadow: 0 2px 0 var(--c-ink);
  color: var(--c-ink);
}
.prog-rail {
  height: 4px; background: rgba(0,0,0,.1);
  border-radius: var(--radius-pill);
  max-width: var(--reading-max); margin: 0 auto var(--space-3); width: 100%;
  overflow: hidden;
}
.prog-fill {
  height: 100%; background: linear-gradient(90deg, var(--c-candy), var(--c-coral));
  border-radius: var(--radius-pill);
  transition: width 0.1s linear;
}
.frame {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; max-width: var(--reading-max); margin: 0 auto; width: 100%;
  padding: var(--space-4);
}
.art {
  font-size: 120px; line-height: 1; margin-bottom: var(--space-3);
  filter: drop-shadow(0 10px 18px rgba(0,0,0,.18));
  animation: bob 3s ease-in-out infinite;
}
@keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
.title {
  font-size: var(--font-3xl); font-weight: 900;
  color: var(--c-ink);
  text-shadow: 0 3px 0 rgba(255,255,255,.6);
  margin-bottom: var(--space-3);
  line-height: var(--leading-tight);
}
.text {
  font-size: var(--font-lg); line-height: var(--leading-loose);
  color: var(--c-ink); font-weight: 700;
  max-width: 560px;
  background: rgba(255,255,255,.88);
  border: 2.5px solid var(--c-ink);
  border-radius: var(--radius-4);
  padding: var(--space-3) var(--space-4);
  box-shadow: 0 5px 0 var(--c-ink);
}
.text :deep(b) { color: var(--c-water-d); background: linear-gradient(180deg, transparent 70%, rgba(255,210,63,.6) 70%); padding: 0 3px; }

.bottom-bar {
  display: flex; justify-content: space-between; align-items: center;
  max-width: var(--reading-max); margin: 0 auto; width: 100%;
  padding-top: var(--space-3);
}
.ctrl {
  font-size: var(--font-md); font-weight: 900;
  background: rgba(255,255,255,.9);
  border: 2.5px solid var(--c-ink);
  border-radius: var(--radius-pill);
  padding: var(--space-2) var(--space-4);
  color: var(--c-ink);
  box-shadow: 0 3px 0 var(--c-ink);
}
.ctrl:disabled { opacity: 0.4; cursor: not-allowed; }
.ctrl.primary {
  background: linear-gradient(180deg, #FFD964, #FFB30F);
  font-size: var(--font-lg); padding: var(--space-2) var(--space-5);
  box-shadow: 0 4px 0 #B97E00;
}
.frame-num {
  font-size: var(--font-xs); font-weight: 900; color: var(--c-ink);
  background: rgba(255,255,255,.85); border: 2px solid var(--c-ink);
  border-radius: var(--radius-pill); padding: 3px 12px;
  box-shadow: 0 2px 0 var(--c-ink);
}

.frame-enter-active, .frame-leave-active { transition: opacity var(--dur-med), transform var(--dur-med); }
.frame-enter-from { opacity: 0; transform: translateX(40px); }
.frame-leave-to   { opacity: 0; transform: translateX(-40px); }

/* 手机横屏紧凑布局 */
@media (orientation: landscape) and (max-height: 500px) {
  .cutscene { padding: 4px var(--space-3) var(--space-2); min-height: calc(100vh - 44px); }
  .art { font-size: 64px; margin-bottom: var(--space-2); }
  .title { font-size: var(--font-xl); margin-bottom: var(--space-2); }
  .text { font-size: var(--font-sm); padding: var(--space-2) var(--space-3); }
  .ctrl, .ctrl.primary { font-size: var(--font-sm); padding: 4px 12px; }
}
</style>

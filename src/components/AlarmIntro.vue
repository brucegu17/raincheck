<!-- 开场警报器（3 秒倒计时 + 闪电反应奖励） -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useGame } from '../game/store';
import { audio } from '../utils/audio';
import { tts } from '../utils/tts';

const emit = defineEmits<{ (e: 'done'): void }>();
const game = useGame();

const counted = ref(3);
const done = ref(false);
let startedAt = 0; let timer: number | null = null;

function fire() {
  if (done.value) return;
  done.value = true;
  if (timer) clearInterval(timer);
  const lightning = (Date.now() - startedAt) < 3000;
  audio.init(); audio.sfx('siren');
  game.courageStar = true;
  if (lightning) game.lightningReflex = true;
  game.setMood('proud');
  tts.speak(lightning ? '闪电反应！我们开始吧。' : '反应真快！我们开始吧。', true);
  setTimeout(() => emit('done'), 700);
}

onMounted(() => {
  startedAt = Date.now();
  timer = window.setInterval(() => {
    if (counted.value > 0) counted.value--;
  }, 900);
});
onUnmounted(() => { if (timer) clearInterval(timer); });
</script>
<template>
  <div class="alarm">
    <h2 class="title">🚨 河水上涨了！<br>快启动防洪中心！</h2>
    <div class="countdown" v-if="!done">⚡ {{ counted > 0 ? counted : '快！' }}</div>
    <button class="big-btn" :disabled="done" @click="fire" aria-label="启动防洪中心">
      <span class="ic">🚨</span>
      <span class="txt">点我启动</span>
    </button>
    <div v-if="done" class="done">✨ 勇气星 +1 · {{ game.lightningReflex ? '⚡ 闪电反应！' : '反应真快' }}</div>
    <button class="hear" @click="tts.speak('河水上涨了，快启动防洪中心，点击大红按钮。', true)">▶️ 听博士说</button>
  </div>
</template>
<style scoped>
.alarm {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-3);
  background: radial-gradient(ellipse at 50% 30%, #FFE0DA 0%, #FFF6E3 70%);
  border: var(--bw-2) dashed var(--c-coral);
  border-radius: var(--radius-5);
  padding: var(--space-5) var(--space-4);
  text-align: center;
}
.title { font-size: var(--font-xl); font-weight: 900; color: #C24331; line-height: var(--leading-tight); }
.countdown { font-size: var(--font-3xl); font-weight: 900; color: #C24331;
  text-shadow: 0 3px 0 rgba(255,255,255,.85), 0 0 18px rgba(255,80,80,.6);
  animation: cdcount .9s steps(1) infinite; }
@keyframes cdcount { 0%,100% { transform: scale(1) rotate(-4deg); } 50% { transform: scale(1.18) rotate(4deg); } }
.big-btn {
  width: 130px; height: 130px; border-radius: 50%;
  border: 5px solid var(--c-ink);
  background: radial-gradient(circle at 38% 32%, #FF8A7A 0%, #E2574C 60%, #B23F36 100%);
  box-shadow: 0 8px 0 #8A2D26, 0 0 0 0 rgba(255,140,120,.7);
  animation: pulse 1s ease-in-out infinite;
  transition: transform var(--dur-fast);
}
.big-btn:active { transform: translateY(6px); box-shadow: 0 2px 0 #8A2D26; }
.big-btn .ic { font-size: 52px; display: block; }
.big-btn .txt { font-size: var(--font-sm); font-weight: 900; color: #fff; letter-spacing: 2px; }
@keyframes pulse {
  0%, 100% { box-shadow: 0 8px 0 #8A2D26, 0 0 0 0 rgba(255,120,100,.55); }
  50%      { box-shadow: 0 8px 0 #8A2D26, 0 0 0 22px rgba(255,120,100,0); }
}
.done {
  background: #D9F6E2; border: 2.5px solid var(--c-good); border-radius: var(--radius-pill);
  padding: var(--space-1) var(--space-3); font-weight: 900; color: #1B6B4A;
}
.hear { font-size: var(--font-xs); padding: var(--space-1) var(--space-3); border: 2px solid var(--c-ink);
  border-radius: var(--radius-pill); background: #fff; box-shadow: 0 2px 0 var(--c-ink); }
</style>

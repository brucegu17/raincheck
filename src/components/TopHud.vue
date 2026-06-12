<!--
  顶部 HUD（紧凑、占总高 ≤ var(--header-h)）
  解决问题 6-A：旧版的"巨标题 + 太阳云朵 + HUD 条 + 波浪"重设计为一条紧凑栏
-->
<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useGame } from '../game/store';
import { EQUIPMENT } from '../game/equipment';
import { audio } from '../utils/audio';
import { tts } from '../utils/tts';

const game = useGame();
const sndOn = ref(audio.isOn), voiceOn = ref(tts.isOn);

const stepIndex = computed(() => ({ intro: 0, collect: 1, clean: 2, train: 3, deploy: 4, end: 5 }[game.scene]));
const stepText = computed(() => ['开场', '① 收集', '② 清洗', '③ 训练', '④ 决策', '🏅 结业'][stepIndex.value]);
const totalStars = computed(() => game.stars + (game.courageStar ? 1 : 0));

function toggleSnd() { sndOn.value = audio.toggle(); }
function toggleVoice() { voiceOn.value = tts.toggle(); }
onMounted(() => { audio.init(); });
</script>
<template>
  <header class="hud">
    <div class="row">
      <span class="brand">
        <span class="logo">🌊</span><strong>洪水预报员</strong>
      </span>
      <span v-if="game.player" class="pill">👤 {{ game.player }} · {{ game.setKey }} · {{ game.mode === 'challenge' ? '挑战' : '探险' }}</span>

      <span class="spacer"></span>

      <span class="pill"><span class="ic">🎯</span>{{ stepText }}</span>
      <span class="pill"><span class="ic">⭐</span>{{ totalStars }}</span>
      <span v-if="game.combo >= 2" class="pill combo"><span class="ic">🔥</span>x{{ game.combo }}</span>
      <span class="pill eq" :class="{ empty: !game.equipment.length }">
        <span class="ic">🎒</span>
        <span class="slot" :class="{ has: game.equipment[0] }">{{ game.equipment[0] ? EQUIPMENT[game.equipment[0]].ic : '' }}</span>
        <span class="slot" :class="{ has: game.equipment[1] }">{{ game.equipment[1] ? EQUIPMENT[game.equipment[1]].ic : '' }}</span>
        <span class="slot" :class="{ has: game.equipment[2] }">{{ game.equipment[2] ? EQUIPMENT[game.equipment[2]].ic : '' }}</span>
        <span class="slot" :class="{ has: game.equipment[3] }">{{ game.equipment[3] ? EQUIPMENT[game.equipment[3]].ic : '' }}</span>
      </span>
      <span class="pill title"><span class="ic">🎖️</span>{{ game.title }}</span>

      <span class="spacer"></span>

      <button class="snd" :class="{ off: !sndOn }" @click="toggleSnd" title="音乐与音效">{{ sndOn ? '🔊' : '🔇' }}</button>
      <button class="snd" :class="{ off: !voiceOn }" @click="toggleVoice" title="博士语音">🗣️</button>
    </div>
  </header>
</template>
<style scoped>
.hud {
  position: sticky; top: 0; z-index: 50;
  background: linear-gradient(180deg, #1D6F76 0%, #114750 100%);
  border-bottom: var(--bw-2) solid var(--c-ink);
  padding: var(--space-2) var(--space-3);
  color: #fff;
}
.row {
  display: flex; align-items: center; gap: var(--space-2);
  max-width: var(--layout-max); margin: 0 auto;
  overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch;
}
.row::-webkit-scrollbar { display: none; }
.brand { display: inline-flex; align-items: center; gap: var(--space-1); font-size: var(--font-md); font-weight: 900;
  text-shadow: 1px 1px 0 var(--c-ink); flex: 0 0 auto; }
.brand .logo { font-size: var(--font-xl); }
.spacer { flex: 1 1 auto; min-width: var(--space-2); }
.pill { color: var(--c-ink); background: #fff; flex: 0 0 auto; }
.pill .ic { font-size: var(--font-md); line-height: 1; }
.pill.combo { background: #FFE27A; }
.pill.title { background: #E2F8E9; }
.pill.eq { background: #FFF6E0; gap: 2px; }
.pill.eq.empty { opacity: 0.55; }
.pill.eq .slot { display: inline-block; width: 16px; height: 16px; border-radius: 50%;
  background: #fff; border: 1.5px solid var(--c-ink); font-size: 11px; line-height: 13px; text-align: center; }
.pill.eq .slot.has { background: var(--c-sun); }
.snd {
  flex: 0 0 auto;
  width: 32px; height: 32px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,.6);
  background: rgba(255,255,255,.15);
  font-size: var(--font-md); line-height: 1;
  color: #fff;
}
.snd.off { opacity: 0.45; filter: grayscale(1); }
@media (max-width: 640px) {
  .brand strong { display: none; }
}
</style>

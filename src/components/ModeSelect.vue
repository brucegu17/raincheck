<!-- 模式选择：探险 / 挑战，文字精简 -->
<script setup lang="ts">
import { useGame } from '../game/store';
import { audio } from '../utils/audio';
const game = useGame();
function pick(m: 'adventure' | 'challenge') { game.mode = m; audio.sfx('pick'); }
</script>
<template>
  <div class="modes">
    <button class="card" :class="['adv', { picked: game.mode === 'adventure' }]" @click="pick('adventure')">
      <span class="ic">🌱</span>
      <strong>探险模式</strong>
      <small>提示多、容错高</small>
    </button>
    <button class="card" :class="['chl', { picked: game.mode === 'challenge' }]" @click="pick('challenge')">
      <span class="ic">⚡</span>
      <strong>挑战模式</strong>
      <small>评分更严，有 50% 难题</small>
    </button>
  </div>
</template>
<style scoped>
.modes { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
.card {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-1);
  background: var(--c-paper); border: var(--bw-2) solid var(--c-ink);
  border-radius: var(--radius-4); padding: var(--space-4) var(--space-3);
  box-shadow: var(--shadow-ink-2); text-align: center; transition: transform var(--dur-fast);
}
.card .ic { font-size: 36px; line-height: 1; }
.card strong { font-size: var(--font-md); }
.card small { font-size: var(--font-xs); color: var(--c-text-muted); font-weight: 700; }
.card.adv { background: linear-gradient(180deg, #FFF6E3, #FFE9B8); }
.card.chl { background: linear-gradient(180deg, #E8F2FF, #C8E0FF); }
.card.picked { border-color: var(--c-candy); box-shadow: 0 5px 0 var(--c-candy); transform: scale(1.04); }
</style>

<script setup lang="ts">
import { watch, ref } from 'vue';
import { useGame } from '../game/store';
const game = useGame();
const visible = ref(false);
let timer: number | null = null;
watch(() => game.toast?.id, () => {
  if (!game.toast) return;
  visible.value = true;
  if (timer) clearTimeout(timer);
  timer = window.setTimeout(() => { visible.value = false; }, 2500);
});
</script>
<template>
  <div class="toast" :class="{ on: visible }">{{ game.toast?.text || '' }}</div>
</template>
<style scoped>
.toast {
  position: fixed; left: 50%; bottom: var(--space-5);
  transform: translateX(-50%) translateY(40px);
  background: var(--c-ink); color: #fff;
  font-size: var(--font-sm); font-weight: 700;
  padding: var(--space-3) var(--space-5); border-radius: var(--radius-pill);
  border: var(--bw-2) solid #fff;
  box-shadow: 0 6px 16px rgba(27, 58, 64, 0.35);
  opacity: 0; transition: opacity var(--dur-med), transform var(--dur-med);
  z-index: var(--z-toast); pointer-events: none;
  max-width: 90vw; text-align: center;
}
.toast.on { opacity: 1; transform: translateX(-50%) translateY(0); }
</style>

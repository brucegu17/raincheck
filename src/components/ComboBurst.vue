<script setup lang="ts">
import { watch, ref } from 'vue';
import { useGame } from '../game/store';
const game = useGame();
const show = ref(false), val = ref(0);
watch(() => game.comboBurst, (v) => {
  if (!v) return;
  val.value = v; show.value = false;
  requestAnimationFrame(() => { show.value = true; });
  setTimeout(() => { show.value = false; game.comboBurst = 0; }, 900);
});
</script>
<template>
  <div class="burst" :class="{ on: show }" v-if="val">连击 x{{ val }} ✨</div>
</template>
<style scoped>
.burst {
  position: fixed; top: 30%; left: 50%;
  transform: translate(-50%, -50%) scale(.5);
  z-index: var(--z-toast);
  font-size: 46px; font-weight: 900; color: var(--c-candy);
  text-shadow: 0 4px 0 var(--c-ink), 0 10px 18px rgba(0,0,0,.3);
  opacity: 0; pointer-events: none;
}
.burst.on { animation: in .9s var(--ease-snap) forwards; }
@keyframes in {
  0%   { opacity: 0; transform: translate(-50%, -50%) scale(.3) rotate(-12deg); }
  30%  { opacity: 1; transform: translate(-50%, -50%) scale(1.15) rotate(6deg); }
  100% { opacity: 0; transform: translate(-50%, -80%) scale(.85); }
}
</style>

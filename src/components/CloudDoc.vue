<!-- 云博士头像（紧凑可缩放，size token 控制大小） -->
<script setup lang="ts">
import { computed } from 'vue';
import { useGame } from '../game/store';
import { DOC_SVG } from '../assets/docSvg';
const props = defineProps<{ size?: 36 | 44 | 56 | 72 | 96 }>();
const game = useGame();
const moodClass = computed(() => game.mood);
const moodEmoji = computed(() => ({ happy: '😊', worried: '😟', wow: '😲', proud: '⭐' }[game.mood as string] || ''));
</script>
<template>
  <div class="doc" :class="moodClass" :style="{ '--s': (size ?? 56) + 'px' }" v-html="DOC_SVG"></div>
  <span v-if="moodEmoji" class="mood-pop" :style="{ left: (size ?? 56) + 'px' }">{{ moodEmoji }}</span>
</template>
<style scoped>
.doc { flex: 0 0 var(--s); width: var(--s); height: calc(var(--s) * 1.15); position: relative; }
.doc :deep(svg) { width: 100%; height: 100%; overflow: visible; }
.doc :deep(.d-eye) { animation: blink 4.6s infinite; transform-origin: center; }
.doc :deep(.d-mouth) { transform-origin: 60px 64px; }
@keyframes blink { 0%, 93%, 100% { transform: scaleY(1); } 95%, 97% { transform: scaleY(0.08); } }
.doc.happy   :deep(.d-mouth) { transform: scaleY(1.4); }
.doc.worried :deep(.d-mouth) { transform: scaleY(0.55); }
.doc.wow     :deep(.d-mouth) { transform: scaleY(1.8); }
.doc.proud   :deep(.d-mouth) { transform: scale(1.1); }
.mood-pop { position: absolute; top: -6px; font-size: var(--font-xl); animation: pop var(--dur-slow) var(--ease-pop) forwards; pointer-events: none; }
@keyframes pop { 0% { opacity: 0; transform: translateY(6px) scale(0.5); } 40% { opacity: 1; transform: translateY(-2px) scale(1.2); } 100% { opacity: 0; transform: translateY(-18px); } }
</style>

<!-- 垂直堆叠，间距来自 token，不接受裸 px -->
<script setup lang="ts">
defineProps<{ gap?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; align?: 'start' | 'center' | 'end' | 'stretch' }>();
</script>
<template>
  <div class="stack" :class="[`gap-${gap ?? 4}`, `align-${align ?? 'stretch'}`]"><slot /></div>
</template>
<style scoped>
.stack { display: flex; flex-direction: column; }
.gap-1 { gap: var(--space-1); } .gap-2 { gap: var(--space-2); }
.gap-3 { gap: var(--space-3); } .gap-4 { gap: var(--space-4); }
.gap-5 { gap: var(--space-5); } .gap-6 { gap: var(--space-6); }
.gap-7 { gap: var(--space-7); } .gap-8 { gap: var(--space-8); }
.align-start { align-items: flex-start; } .align-center { align-items: center; }
.align-end { align-items: flex-end; } .align-stretch { align-items: stretch; }
</style>

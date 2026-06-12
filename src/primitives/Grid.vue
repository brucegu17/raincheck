<!-- 自适应网格：min 决定每列最小宽度，自动按容器宽度铺多少列 -->
<script setup lang="ts">
defineProps<{ min?: number; gap?: 1 | 2 | 3 | 4 | 5 }>();
</script>
<template>
  <div class="grid" :style="{ '--min': ((min ?? 220) + 'px') }" :class="[`gap-${gap ?? 3}`]"><slot /></div>
</template>
<style scoped>
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(var(--min), 100%), 1fr)); }
.gap-1 { gap: var(--space-1); } .gap-2 { gap: var(--space-2); }
.gap-3 { gap: var(--space-3); } .gap-4 { gap: var(--space-4); } .gap-5 { gap: var(--space-5); }
</style>

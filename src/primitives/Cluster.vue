<!-- 水平簇（自动换行），间距来自 token -->
<script setup lang="ts">
defineProps<{ gap?: 1 | 2 | 3 | 4 | 5; align?: 'start' | 'center' | 'end' | 'baseline'; justify?: 'start' | 'center' | 'end' | 'between' }>();
</script>
<template>
  <div class="cluster" :class="[`gap-${gap ?? 3}`, `align-${align ?? 'center'}`, `justify-${justify ?? 'start'}`]"><slot /></div>
</template>
<style scoped>
.cluster { display: flex; flex-wrap: wrap; }
.gap-1 { gap: var(--space-1); } .gap-2 { gap: var(--space-2); }
.gap-3 { gap: var(--space-3); } .gap-4 { gap: var(--space-4); } .gap-5 { gap: var(--space-5); }
.align-start { align-items: flex-start; } .align-center { align-items: center; }
.align-end { align-items: flex-end; } .align-baseline { align-items: baseline; }
.justify-start { justify-content: flex-start; } .justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; } .justify-between { justify-content: space-between; }
</style>

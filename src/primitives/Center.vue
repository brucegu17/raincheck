<!-- 水平居中容器，max 控制阅读宽度 -->
<script setup lang="ts">
defineProps<{ max?: 'layout' | 'reading' | number; px?: 1 | 2 | 3 | 4 | 5 }>();
</script>
<template>
  <div class="center" :class="[`px-${px ?? 4}`]"
       :style="{ '--max': typeof max === 'number' ? max + 'px' : `var(--${max ?? 'layout'}-max)` }">
    <slot />
  </div>
</template>
<style scoped>
.center { max-width: var(--max); margin-inline: auto; width: 100%; }
.px-1 { padding-inline: var(--space-1); } .px-2 { padding-inline: var(--space-2); }
.px-3 { padding-inline: var(--space-3); } .px-4 { padding-inline: var(--space-4); }
.px-5 { padding-inline: var(--space-5); }
</style>

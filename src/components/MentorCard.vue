<!--
  云博士导师卡（紧凑版）
  设计契约：
  - 高度 ≤ 64px（避免吃掉首屏视口预算）
  - 一行文字内容 + 1 个图标 + 可选"重听"按钮
  - 可折叠（collapsible=true 时点击可隐藏文字，仅留头像）
  解决问题 6-B / 8-A：旧版的"白底大卡片 + 大头像"消失，改为细长条
-->
<script setup lang="ts">
import { ref } from 'vue';
import CloudDoc from './CloudDoc.vue';
import { tts } from '../utils/tts';

const props = defineProps<{ text: string; speakKey?: string; collapsible?: boolean }>();
const collapsed = ref(false);

function replay() {
  tts.speak(props.text, true);
}
</script>
<template>
  <div class="mentor" :class="{ collapsed }">
    <CloudDoc :size="44" />
    <div v-if="!collapsed" class="bubble" v-html="text"></div>
    <button class="replay" @click="replay" title="重听">🔊</button>
    <button v-if="collapsible" class="fold" @click="collapsed = !collapsed" :title="collapsed ? '展开' : '收起'">{{ collapsed ? '▸' : '▾' }}</button>
  </div>
</template>
<style scoped>
.mentor {
  display: flex; align-items: center; gap: var(--space-3);
  background: linear-gradient(180deg, #FFFFFF 0%, #FBF7EC 100%);
  border: var(--bw-2) solid var(--c-ink);
  border-radius: var(--radius-pill);
  padding: var(--space-1) var(--space-3) var(--space-1) var(--space-1);
  box-shadow: 0 4px 0 var(--c-ink);
  min-height: 56px;
}
.bubble {
  font-size: var(--font-sm); line-height: var(--leading-base);
  color: var(--c-text); flex: 1; min-width: 0;
}
.bubble :deep(b) { color: var(--c-water-d); font-weight: 900; }
.replay, .fold {
  flex: 0 0 auto;
  border: var(--bw-1) solid var(--c-ink);
  border-radius: var(--radius-pill);
  padding: var(--space-1) var(--space-2);
  font-size: var(--font-xs); font-weight: 800;
  background: #fff;
  box-shadow: 0 2px 0 var(--c-ink);
}
.mentor.collapsed { padding-right: var(--space-2); min-height: 48px; }
.mentor.collapsed .bubble { display: none; }
</style>

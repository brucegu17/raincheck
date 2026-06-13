<!--
  通用「下一关入口」交互组件
  契约：
  - active=true 时显示，从底部自动弹入、自动 scrollIntoView 到组件位置
  - 不需要用户手动找按钮、不需要手动滚动
  - 全游戏所有关卡通过这一个组件完成"完成 → 下一关"过渡
-->
<script setup lang="ts">
import { watch, ref, nextTick } from 'vue';
const props = defineProps<{
  active: boolean;
  title: string;            // 主标题，如 "干得漂亮！"
  subtitle?: string;        // 副标题
  ctaText: string;          // 按钮文字
  bonus?: string;           // 额外信息：速度奖励 / 完美等
}>();
const emit = defineEmits<{ (e: 'next'): void }>();
const wrap = ref<HTMLElement | null>(null);
watch(() => props.active, (v) => {
  if (!v) return;
  nextTick(() => {
    wrap.value?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});
</script>
<template>
  <Transition name="cue">
    <div v-if="active" ref="wrap" class="cue">
      <div class="cue-card">
        <div class="cue-title">
          <span class="emoji">✨</span>{{ title }}
        </div>
        <div v-if="subtitle" class="cue-sub">{{ subtitle }}</div>
        <div v-if="bonus" class="cue-bonus">🚀 {{ bonus }}</div>
        <button class="cue-btn" @click="$emit('next')">{{ ctaText }} →</button>
      </div>
    </div>
  </Transition>
</template>
<style scoped>
.cue {
  margin-top: var(--space-4);
  display: flex; justify-content: center;
}
.cue-card {
  background: linear-gradient(180deg, #FFF6E3, #FFE9B8);
  border: 3px solid var(--c-ink);
  border-radius: var(--radius-5);
  padding: var(--space-4) var(--space-5);
  box-shadow: 0 8px 0 var(--c-ink), 0 16px 30px rgba(0,0,0,.15);
  max-width: 540px; width: 100%;
  text-align: center;
}
.cue-title {
  font-size: var(--font-xl); font-weight: 900;
  color: var(--c-ink);
  display: flex; align-items: center; justify-content: center; gap: var(--space-2);
}
.cue-title .emoji { font-size: var(--font-2xl); animation: spin 1.4s ease-in-out infinite; display: inline-block; }
@keyframes spin { 0%,100% { transform: rotate(-8deg) scale(1); } 50% { transform: rotate(8deg) scale(1.1); } }
.cue-sub { font-size: var(--font-sm); color: var(--c-text-muted); font-weight: 700; margin-top: var(--space-1); }
.cue-bonus { font-size: var(--font-sm); color: #C2410C; font-weight: 900;
  margin-top: var(--space-2);
  background: #FFEDD5; border: 2px solid var(--c-ink);
  border-radius: var(--radius-pill); padding: 2px 12px; display: inline-block; }
.cue-btn {
  margin-top: var(--space-3);
  background: linear-gradient(180deg, #FFD964, #FFB30F);
  border: 3px solid var(--c-ink);
  border-radius: var(--radius-pill);
  padding: var(--space-3) var(--space-6);
  font-size: var(--font-lg); font-weight: 900;
  color: var(--c-ink); cursor: pointer;
  box-shadow: 0 5px 0 #B97E00, 0 10px 18px rgba(23,85,91,.22);
  transition: transform var(--dur-fast);
}
.cue-btn:hover { transform: translateY(-2px); }
.cue-btn:active { transform: translateY(2px); box-shadow: 0 2px 0 #B97E00; }
.cue-enter-active { transition: transform .55s cubic-bezier(.2,1.5,.4,1), opacity .4s; }
.cue-enter-from { transform: translateY(60px) scale(.85); opacity: 0; }
</style>

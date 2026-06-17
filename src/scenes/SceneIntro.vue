<!-- 开场：警报器 → 模式选择 → 姓名 -->
<script setup lang="ts">
import { ref } from 'vue';
import Stack from '../primitives/Stack.vue';
import Center from '../primitives/Center.vue';
import AlarmIntro from '../components/AlarmIntro.vue';
import ModeSelect from '../components/ModeSelect.vue';
import { useGame } from '../game/store';
import { startAttempt, isOnline } from '../utils/scoreClient';

const game = useGame();
const phase = ref<'alarm' | 'setup'>('alarm');
const name = ref('');
const classCode = ref('');
const busy = ref(false);

function onAlarmDone() { phase.value = 'setup'; }
async function go() {
  if (busy.value) return;
  if (!name.value.trim()) { game.showToast('先告诉云博士你的名字呀！'); return; }
  busy.value = true;
  try {
    if (isOnline()) {
      const cls = classCode.value.trim() || '未分班';
      const r = await startAttempt(cls, name.value.trim());
      if (!r.ok) { game.showToast(r.reason || '无法开始：请告诉老师'); return; }
    }
    game.startGame(name.value, classCode.value);
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <Center max="reading" :px="4">
    <Stack :gap="4">
      <h1 class="title">🛶 清溪镇告急！</h1>
      <p class="sub">用 AI 保护河畔大集 🛡️</p>

      <AlarmIntro v-if="phase === 'alarm'" @done="onAlarmDone" />

      <template v-else>
        <ModeSelect />
        <div class="route">
          <span>🔍 收集</span><i>▶</i>
          <span>🧹 清洗</span><i>▶</i>
          <span>🧠 训练</span><i>▶</i>
          <span>🎯 决策</span>
        </div>
        <div class="name-box">
          <input v-model="name" class="ipt" maxlength="12" placeholder="你的名字…" @keydown.enter="go" />
          <input v-model="classCode" class="ipt small" maxlength="10" placeholder="班级码（可选）" />
          <button class="btn" :disabled="busy" @click="go">{{ busy ? '准备中…' : '出发 🚀' }}</button>
        </div>
      </template>
    </Stack>
  </Center>
</template>
<style scoped>
.title { font-size: var(--font-3xl); font-weight: 900; letter-spacing: 1px; text-align: center; }
.sub { text-align: center; color: var(--c-text-muted); font-weight: 700; }
.route {
  display: flex; justify-content: center; align-items: center; gap: var(--space-2);
  background: var(--c-paper); border: var(--bw-2) solid var(--c-ink); border-radius: var(--radius-4);
  padding: var(--space-2) var(--space-3); box-shadow: var(--shadow-ink-2);
  font-size: var(--font-sm); font-weight: 900;
}
.route i { color: var(--c-water-d); font-style: normal; }
.name-box { display: flex; gap: var(--space-2); flex-wrap: wrap; justify-content: center; }
.ipt {
  font-size: var(--font-md); font-weight: 800;
  border: var(--bw-2) solid var(--c-ink); border-radius: var(--radius-pill);
  padding: var(--space-2) var(--space-4);
  background: #fff; box-shadow: 0 4px 0 var(--c-ink);
  outline: none; width: 220px; max-width: 70vw;
}
.ipt.small { width: 150px; }
.ipt:focus { border-color: var(--c-candy); }
</style>

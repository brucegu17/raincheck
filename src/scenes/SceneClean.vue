<!-- 第二关：数据清洗，探险=卡片侦探板，挑战=表格 -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import Stack from '../primitives/Stack.vue';
import Cluster from '../primitives/Cluster.vue';
import Grid from '../primitives/Grid.vue';
import Center from '../primitives/Center.vue';
import MentorCard from '../components/MentorCard.vue';
import { useGame } from '../game/store';
import { audio } from '../utils/audio';

const game = useGame();
const locked = ref(false);

function cueClass(r: any, i: number): string {
  if (!r.bad) return '';
  if (i > 0) {
    const p = game.rows[i - 1];
    if (p && p.d === r.d && p.rain === r.rain && p.level === r.level && p.dam === r.dam) return 'cue-dup';
  }
  if (r.rain === '' || r.level === '') return 'cue-missing';
  const rn = parseFloat(r.rain), lv = parseFloat(r.level);
  if (!isNaN(rn) && rn < 0) return 'cue-negative';
  if (!isNaN(rn) && rn > 180) return 'cue-outlier';
  if (!isNaN(lv) && (lv < 0 || lv > 6)) return 'cue-badlevel';
  return '';
}

function toggle(i: number) {
  if (locked.value) return;
  game.cleanFlagged[i] = !game.cleanFlagged[i];
  audio.sfx(game.cleanFlagged[i] ? 'flag' : 'unpick');
}
function submit() {
  if (!game.cleanFlagged.some(Boolean)) { game.showToast('先点几张可疑卡片 🚩'); return; }
  locked.value = true;
  game.submitClean();
}
function next() { game.scene = 'train'; }

const verdict = (r: any, i: number) => {
  const f = game.cleanFlagged[i];
  if (r.bad && f) return { cls: 'bad', txt: '✅ 找到了：' + r.why };
  if (r.bad && !f) return { cls: 'bad', txt: '😮 漏掉：' + r.why };
  if (!r.bad && f) return { cls: 'bad', txt: '❌ 误删了好数据' };
  return { cls: 'good', txt: '👍 没动它，正确' };
};
</script>
<template>
  <Center max="layout" :px="3">
    <Stack :gap="3">
      <Cluster :gap="2" justify="between" align="center">
        <h2 class="h-2">🧹 清洗数据 <span class="pill mode">{{ game.mode === 'challenge' ? '挑战' : '探险' }}</span></h2>
        <span class="pill">关卡 ② · 找出 4 行</span>
      </Cluster>

      <MentorCard text="记录里混进了 <b>4 行坏数据</b>。看看：缺失值/异常值/重复/负数。" collapsible />

      <!-- 探险：卡片侦探板 -->
      <template v-if="game.mode !== 'challenge'">
        <div class="bin">🗑️ 数据回收箱 · 点击可疑卡片把它放进来</div>
        <Grid :min="170" :gap="3">
          <button v-for="(r, i) in game.rows" :key="i"
            class="dcard"
            :class="[cueClass(r, i), { flagged: game.cleanFlagged[i], 'reveal-bad': locked && r.bad, 'reveal-good': locked && !r.bad }]"
            @click="toggle(i)">
            <div class="dcd">📅 {{ r.d }}</div>
            <div class="drow"><span class="dk">🌧️ 降雨</span>
              <span v-if="r.rain === ''" class="dv miss"></span>
              <span v-else class="dv" :class="{ outlier: cueClass(r,i) === 'cue-outlier', neg: cueClass(r,i) === 'cue-negative' }">{{ r.rain }}</span>
            </div>
            <div class="drow"><span class="dk">📏 水位</span>
              <span v-if="r.level === ''" class="dv miss"></span>
              <span v-else class="dv">{{ r.level }}</span>
            </div>
            <div class="drow"><span class="dk">🏞️ 放水</span><span class="dv">{{ r.dam }}</span></div>
            <div v-if="locked" class="vtag" :class="verdict(r,i).cls">{{ verdict(r,i).txt }}</div>
          </button>
        </Grid>
      </template>

      <!-- 挑战：表格 -->
      <table v-else class="t">
        <thead><tr><th>日期</th><th>降雨</th><th>水位</th><th>放水</th></tr></thead>
        <tbody>
          <tr v-for="(r, i) in game.rows" :key="i" :class="{ flagged: game.cleanFlagged[i], 'row-bad': locked && r.bad, 'row-good': locked && !r.bad }" @click="toggle(i)">
            <td>{{ r.d }}<div v-if="locked && r.bad" class="rwhy">{{ r.why }}</div></td>
            <td>{{ r.rain || '（空）' }}</td>
            <td>{{ r.level || '（空）' }}</td>
            <td>{{ r.dam }}</td>
          </tr>
        </tbody>
      </table>

      <Cluster :gap="2">
        <button v-if="!locked" class="btn" @click="submit">清除可疑数据 🧹</button>
        <button v-else class="btn secondary" @click="next">下一关：训练模型 →</button>
      </Cluster>
    </Stack>
  </Center>
</template>
<style scoped>
.pill.mode { background: var(--c-purple); color: #fff; border-color: var(--c-ink); }
.bin {
  margin-top: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border: 2px dashed var(--c-purple);
  border-radius: var(--radius-3);
  background: #F2E8FF;
  font-size: var(--font-sm); font-weight: 800;
  color: #5b3da6; text-align: center;
}
.dcard {
  position: relative; text-align: left; cursor: pointer;
  background: var(--c-paper); border: var(--bw-2) solid var(--c-ink);
  border-radius: var(--radius-3); padding: var(--space-3);
  box-shadow: var(--shadow-ink-2); overflow: hidden;
  display: flex; flex-direction: column; gap: var(--space-1);
}
.dcard.flagged { border-color: var(--c-coral); background: #FFE9E5; }
.dcard.flagged::after {
  content: "🚩 可疑"; position: absolute; top: -10px; right: 8px;
  background: var(--c-coral); color: #fff;
  font-size: 11px; font-weight: 900; padding: 2px 9px;
  border-radius: var(--radius-pill); border: 2.5px solid var(--c-ink);
}
.dcd { font-size: var(--font-sm); font-weight: 900; color: var(--c-water-d); }
.drow { display: flex; justify-content: space-between; font-size: var(--font-sm); padding: 3px 0; border-bottom: 1.5px dashed #d8ecf5; }
.drow:last-of-type { border-bottom: none; }
.dk { color: var(--c-text-subtle); font-weight: 700; }
.dv { color: var(--c-text); font-weight: 900; }
.dv.miss { display: inline-block; width: 40px; height: 14px; border-radius: 8px;
  background: repeating-linear-gradient(45deg, #E8E8E8 0 5px, #fff 5px 10px); border: 2px dashed #B0B0B0; }
.dv.outlier { color: #c0392b; animation: shake .35s ease-in-out infinite; display: inline-block; }
.dv.neg { color: #3D7C9C; transform: rotate(180deg); display: inline-block; }
@keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-1.5px); } 75% { transform: translateX(1.5px); } }
.dcard.cue-dup { border-left-width: 6px; border-left-color: var(--c-purple); }
.dcard.cue-badlevel::before {
  content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 10px;
  background: linear-gradient(180deg, transparent, var(--c-water)); opacity: .35;
}
.dcard.reveal-good { border-color: var(--c-good); box-shadow: 0 4px 0 var(--c-good); }
.dcard.reveal-bad { border-color: var(--c-coral); }
.vtag { margin-top: var(--space-1); font-size: var(--font-xs); font-weight: 800;
  padding: var(--space-1) var(--space-2); border-radius: var(--radius-2); line-height: 1.5; }
.vtag.good { background: #D9F6E2; color: #1d7a40; }
.vtag.bad  { background: #FFDFD9; color: #c0392b; }

.t {
  width: 100%; border-collapse: collapse;
  background: var(--c-paper); border: var(--bw-2) solid var(--c-ink); border-radius: var(--radius-3);
  overflow: hidden; box-shadow: var(--shadow-ink-2);
}
.t th { background: var(--c-water); color: #fff; padding: var(--space-2); }
.t td { padding: var(--space-2); text-align: center; border-bottom: 1px dashed #d8ecf5; cursor: pointer; }
.t tr.flagged td { background: #FFE9E5; }
.t tr.flagged td:first-child::before { content: "🚩 "; }
.t tr.row-bad td { background: #FFDFD9; color: #c0392b; }
.t tr.row-good td { background: #E2F8E9; }
.rwhy { font-size: 11.5px; color: #c0392b; font-weight: 800; }
</style>

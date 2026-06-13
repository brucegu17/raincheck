<!-- 第三关：训练模型 + 水坝可视化 -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import Stack from '../primitives/Stack.vue';
import Cluster from '../primitives/Cluster.vue';
import Center from '../primitives/Center.vue';
import MentorCard from '../components/MentorCard.vue';
import NextLevelCue from '../components/NextLevelCue.vue';
import { useGame } from '../game/store';
import { audio } from '../utils/audio';

const game = useGame();
const log = ref('等待训练……');
const bar = ref(0);
const accBig = ref<{ acc: number; color: string } | null>(null);
const passed = ref(false);

function toggleFeat(i: number) {
  if (game.training) return;
  game.selectedFeatures[i] = !game.selectedFeatures[i];
  audio.sfx(game.selectedFeatures[i] ? 'pick' : 'unpick');
}

const goodOn = computed(() => game.features.filter((f, i) => game.selectedFeatures[i] && f.good).length);
const badOn  = computed(() => game.features.filter((f, i) => game.selectedFeatures[i] && !f.good).length);

const bricks = computed(() => {
  const arr: string[] = [];
  for (let i = 0; i < goodOn.value * 4; i++) arr.push('on');
  for (let i = 0; i < badOn.value * 2; i++) arr.push('crack');
  while (arr.length < 24) arr.push('off');
  return arr.slice(0, 24);
});
const leakCount = computed(() => Math.round((1 - game.cleanQuality) * Math.min(4, 1 + game.falseFlags)));
const cheering = ref(false);
const riverH = ref(32);

async function startTrain() {
  if (!game.selectedFeatures.some(Boolean)) { game.showToast('先选择至少一个特征！'); return; }
  game.training = true;
  game.trainCount++;
  accBig.value = null;
  audio.sfx('whoosh');
  const lines = [
    '加载训练集（80% 的历史数据）……',
    '第 1 轮：寻找"降雨→水位"规律……',
    '第 2 轮：误差正在变小……',
    '第 3 轮：模型越来越聪明……',
    '训练完成！取出藏好的测试集（20%）……',
    '考试中：用模型没见过的数据出题……'
  ];
  log.value = '';
  for (let i = 0; i < lines.length; i++) {
    await new Promise(r => setTimeout(r, 600));
    log.value += (i ? '\n' : '') + '▸ ' + lines[i];
    bar.value = Math.round((i + 1) / lines.length * 100);
    audio.sfx('tick');
  }
  const r = game.calcAccuracy();
  game.finishTrain(r);
  accBig.value = { acc: r.acc, color: r.acc >= 85 ? 'var(--c-good)' : (r.acc >= 70 ? '#c98c00' : 'var(--c-coral)') };
  if (r.acc >= 85) {
    passed.value = true;
    cheering.value = true;
    riverH.value = 40;
    log.value += `\n✅ 考试通过！（训练得分 ${game.pts.train}/30，第 ${game.trainCount} 次通过）`;
    audio.sfx('pass');
    game.showToast(`🎉 准确率 ${r.acc}%，模型合格！`);
  } else {
    riverH.value = 62;
    log.value += `\n⚠️ 准确率不够 85%。${r.bad > 0 ? '剔除无关特征再试。' : r.good < 4 ? '多选几个相关特征。' : '清洗有残留，影响了准确率。'}`;
    audio.sfx('fail');
    game.showToast(`准确率 ${r.acc}%，再试一次！`);
  }
}
function reset() {
  log.value = '等待训练……';
  bar.value = 0;
  accBig.value = null;
  riverH.value = 32;
}
function next() { game.scene = 'deploy'; }
</script>
<template>
  <Center max="layout" :px="3">
    <Stack :gap="3">
      <Cluster :gap="2" justify="between" align="center">
        <h2 class="h-2">🧠 训练模型</h2>
        <span class="pill">关卡 ③</span>
      </Cluster>

      <MentorCard text="挑出和洪水<b>有关</b>的特征喂给模型，然后开始训练 ⚡" collapsible />

      <!-- 特征 chips -->
      <Cluster :gap="2">
        <button v-for="(f, i) in game.features" :key="i"
          class="chip" :class="{ on: game.selectedFeatures[i] }"
          @click="toggleFeat(i)">{{ f.name }}</button>
      </Cluster>

      <!-- 水坝可视化 -->
      <div class="dam">
        <div class="dam-label">🛡️ 你的预测水坝</div>
        <div class="dam-body">
          <div class="bricks">
            <div v-for="(c, i) in bricks" :key="i" class="brick" :class="c"></div>
          </div>
        </div>
        <div class="river" :style="{ height: riverH + '%' }"></div>
        <div class="status">
          {{ accBig ? (passed ? `🛡️ 水坝挡住洪水！准确率 ${accBig.acc}%` : `⚠️ 出现缺口 · 准确率 ${accBig.acc}%`) :
             (goodOn || badOn) ? `已选 ${goodOn} 相关 + ${badOn} 无关` : '请选择特征' }}
        </div>
        <div v-for="n in leakCount" :key="n" class="leak" :style="{ left: (15 + n * 22) + '%' }"></div>
        <div v-if="cheering" class="cheers">
          <span>🙋</span><span>🙋‍♀️</span><span>🙋‍♂️</span>
        </div>
      </div>

      <!-- 训练日志（折叠为辅助信息） -->
      <details class="log-wrap">
        <summary>训练日志 · 进度 {{ bar }}%</summary>
        <div class="progress"><div :style="{ width: bar + '%' }"></div></div>
        <pre class="log">{{ log }}</pre>
      </details>

      <div v-if="accBig" class="acc-big" :style="{ color: accBig.color }">{{ accBig.acc }}<small> %</small></div>

      <Cluster :gap="2" v-if="!passed">
        <button class="btn" :disabled="game.training" @click="startTrain">
          {{ game.training ? '训练中…' : (accBig ? '调整后再训练 🔁' : '开始训练 ⚡') }}
        </button>
        <button v-if="accBig && !passed" class="btn secondary" @click="reset">重置</button>
      </Cluster>

      <!-- v2.2：下一关入口自动弹出 -->
      <NextLevelCue
        :active="passed"
        title="模型合格！"
        :subtitle="`训练 ${game.pts.train}/30 分 · 准确率 ${game.accuracy}%`"
        cta-text="下一关：预测决策"
        @next="next" />
    </Stack>
  </Center>
</template>
<style scoped>
.chip {
  border: var(--bw-2) solid var(--c-ink); background: var(--c-paper);
  border-radius: var(--radius-pill);
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-md); font-weight: 900;
  box-shadow: 0 4px 0 var(--c-ink);
  transition: transform var(--dur-fast);
}
.chip:hover { transform: translateY(-2px) rotate(-1deg); }
.chip.on { background: var(--c-water); color: #fff; border-color: var(--c-ink); box-shadow: 0 4px 0 var(--c-water-d); }

.dam {
  position: relative; height: 200px;
  border: var(--bw-2) solid var(--c-ink); border-radius: var(--radius-3);
  background: linear-gradient(180deg, #BDE9FF 0%, #E8F8FF 60%, #9BE070 60%, #7CCB52 78%, #4FC3DC 78%, #2A9DB5 100%);
  overflow: hidden; box-shadow: var(--shadow-ink-2);
}
.dam-label {
  position: absolute; top: var(--space-1); left: var(--space-2);
  font-size: var(--font-xs); font-weight: 900;
  background: rgba(255,255,255,.92); border: 2px solid var(--c-ink); border-radius: var(--radius-pill);
  padding: 3px 10px; z-index: 3;
}
.dam-body {
  position: absolute; left: 50%; bottom: 18%; transform: translateX(-50%);
  width: 260px; height: 148px;
  background: linear-gradient(180deg, #D8DEE6 0%, #9AA6B4 100%);
  border: 3px solid var(--c-ink); border-radius: 8px 8px 4px 4px;
  overflow: hidden;
}
.bricks { position: absolute; inset: 6px; display: grid; grid-template-columns: repeat(6, 1fr); grid-auto-rows: 18px; gap: 3px; }
.brick { background: #FFE7A3; border: 2px solid #B97E00; border-radius: 3px; opacity: .25; transition: opacity var(--dur-med); }
.brick.on { opacity: 1; animation: brickpop var(--dur-slow) var(--ease-pop); }
.brick.crack { opacity: .7; background: #FFE2E0; border-color: #C0392B;
  background-image: linear-gradient(135deg, transparent 45%, #C0392B 45% 55%, transparent 55%); }
@keyframes brickpop { from { transform: scale(.4); } to { transform: scale(1); } }
.river {
  position: absolute; left: 0; right: 0; bottom: 0;
  background: linear-gradient(180deg, #7FD0E5, #2A9DB5);
  transition: height 1.2s var(--ease-snap);
}
.status {
  position: absolute; bottom: var(--space-1); right: var(--space-2);
  font-size: var(--font-xs); font-weight: 900;
  background: rgba(255,255,255,.92); border: 2px solid var(--c-ink); border-radius: var(--radius-1);
  padding: 3px 9px; z-index: 3;
}
.leak {
  position: absolute; bottom: 30%;
  width: 5px; height: 36px; background: #5EC0DC; border-radius: 3px;
  animation: leak 1.1s ease-in infinite;
}
@keyframes leak { 0% { transform: translateY(-10px); opacity: 0; } 40% { opacity: 1; } 100% { transform: translateY(40px); opacity: 0; } }
.cheers {
  position: absolute; left: 50%; transform: translateX(-50%); bottom: 62%;
  display: flex; gap: var(--space-3); z-index: 4;
}
.cheers span { font-size: 22px; animation: jump 1.1s ease-in-out infinite; }
.cheers span:nth-child(2) { animation-delay: .2s; }
.cheers span:nth-child(3) { animation-delay: .4s; }
@keyframes jump { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

.log-wrap {
  background: #21314f; color: #9fe3d4;
  border-radius: var(--radius-3); border: var(--bw-2) solid var(--c-ink);
  padding: var(--space-2);
}
.log-wrap summary { font-size: var(--font-sm); cursor: pointer; }
.progress { height: 8px; background: rgba(255,255,255,.1); border-radius: var(--radius-pill); margin: var(--space-2) 0; overflow: hidden; }
.progress > div { height: 100%; background: var(--c-good); transition: width var(--dur-fast); }
.log { font-family: ui-monospace, Menlo, monospace; font-size: 12px; line-height: 1.5; white-space: pre-line; }
.acc-big { text-align: center; font-size: 52px; font-weight: 900; }
.acc-big small { font-size: var(--font-md); color: var(--c-text-muted); }

/* v2.2 手机横屏适配 */
@media (orientation: landscape) and (max-height: 500px) {
  .dam { height: 150px; }
  .dam-body { width: 200px; height: 110px; }
  .chip { font-size: 13px; padding: 6px 12px; }
  .acc-big { font-size: 36px; }
}
</style>

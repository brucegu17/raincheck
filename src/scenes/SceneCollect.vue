<!-- 第一关：在小镇地图上探索 8 个数据点 -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import Stack from '../primitives/Stack.vue';
import Cluster from '../primitives/Cluster.vue';
import Grid from '../primitives/Grid.vue';
import Center from '../primitives/Center.vue';
import MentorCard from '../components/MentorCard.vue';
import OpeningCutscene from '../components/OpeningCutscene.vue';
import NextLevelCue from '../components/NextLevelCue.vue';
import { useGame } from '../game/store';
import { ICONS } from '../assets/icons';
import { TOWN_SVG, GOOD_POS, DECOY_POS } from '../assets/townSvg';
import { audio } from '../utils/audio';

const game = useGame();
const modal = ref<{ idx: number } | null>(null);
const locked = ref(false);
// v2.2：开场剧情动画（第一次进入第一关时播放，可跳过 / 看过不再放）
const showCutscene = ref(!game.cutsceneSeen);
function finishCutscene() {
  showCutscene.value = false;
  game.cutsceneSeen = true;
}

const hotspots = computed(() => {
  let dIdx = 0;
  return game.cards.map((d, i) => {
    const pos = GOOD_POS[d.icon] || DECOY_POS[dIdx++];
    return { i, d, x: pos[0], y: pos[1] };
  });
});

function openData(i: number) {
  if (locked.value) return;
  if (game.explored[i]) {
    game.showToast(`「${game.cards[i].name}」${game.picked[i] ? '已装进背包 🎒' : '没收 👍'}`);
    return;
  }
  modal.value = { idx: i };
  audio.sfx('whoosh');
}
function pick(take: boolean) {
  if (!modal.value) return;
  game.chooseData(modal.value.idx, take);
  audio.sfx(take ? 'pick' : 'unpick');
  modal.value = null;
  const left = game.explored.filter(x => !x).length;
  if (left > 0) game.showToast(take ? `收下，还剩 ${left} 处闪光！` : `不收，还剩 ${left} 处闪光！`);
  else game.showToast('8 条全看过了！点提交 ✅');
}
function findEgg(key: 'cat' | 'tang') {
  if (key === 'cat'  && game.eggCat)  return;
  if (key === 'tang' && game.eggTang) return;
  if (key === 'cat')  game.eggCat  = true;
  if (key === 'tang') game.eggTang = true;
  audio.sfx('star');
  game.setMood('happy');
  game.showToast(key === 'cat' ? '🎁 救下了河边的小猫 🐱' : '🎁 糖葫芦摊也保下来啦！🍡');
}
function submit() {
  if (!game.explored.every(Boolean)) { game.showToast('还有数据点没看过哦 ✨'); return; }
  locked.value = true;
  game.submitCollect();
}
function next() { game.scene = 'clean'; }
</script>
<template>
  <!-- v2.2 开场剧情：8 帧故事 + AI 四步流程关联 -->
  <OpeningCutscene v-if="showCutscene" @done="finishCutscene" />

  <Center v-else max="layout" :px="3">
    <Stack :gap="3">
      <Cluster :gap="2" justify="between" align="center">
        <h2 class="h-2">🔍 收集数据</h2>
        <Cluster :gap="2"><span class="pill">关卡 ①</span><span class="pill">8 处闪光</span></Cluster>
      </Cluster>

      <MentorCard text="镇子里藏着 <b>8 条数据</b> ✨ 点击闪光处查看，决定收不收进背包。" collapsible />

      <div class="map">
        <div class="svg" v-html="TOWN_SVG"></div>
        <button v-for="h in hotspots" :key="h.i"
          class="hs"
          :class="{ found: game.explored[h.i], taken: game.picked[h.i], good: h.d.good, bad: !h.d.good && game.explored[h.i] }"
          :style="{ left: h.x + '%', top: h.y + '%' }"
          @click="openData(h.i)" :aria-label="game.explored[h.i] ? h.d.name + ' 已查看' : '数据点 ' + (h.i + 1)">
          <span class="glow"></span><span class="halo"></span>
          <svg class="star" viewBox="0 0 40 40"><path d="M20 1 C22.5 13 27 17.5 39 20 C27 22.5 22.5 27 20 39 C17.5 27 13 22.5 1 20 C13 17.5 17.5 13 20 1 Z" fill="#fff"/></svg>
          <div class="badge" :style="{ background: h.d.bg }" v-html="ICONS[h.d.icon]"></div>
        </button>
        <!-- 隐藏彩蛋 -->
        <button class="egg" :class="{ found: game.eggCat }" style="left:11%;top:90%" @click="findEgg('cat')">🐱</button>
        <button class="egg" :class="{ found: game.eggTang }" style="left:64%;top:84%" @click="findEgg('tang')">🍡</button>
      </div>

      <!-- 底部背包槽 -->
      <Cluster :gap="2" justify="center">
        <div v-for="(d, i) in game.cards" :key="i"
          class="dock"
          :class="{ ex: game.explored[i], pk: game.picked[i], good: locked && d.good, bad: locked && !d.good }"
          :title="game.explored[i] ? d.name : '还没发现'">
          <span v-if="!game.explored[i]" class="q">?</span>
          <template v-else>
            <div class="dic" :style="{ background: d.bg }" v-html="ICONS[d.icon]"></div>
            <span class="bag" v-if="game.picked[i]">🎒</span>
          </template>
        </div>
      </Cluster>

      <!-- 提交后点评 -->
      <Grid v-if="locked" :min="280" :gap="2">
        <div v-for="(d, i) in game.cards" :key="i" class="cres" :class="{ g: d.good, b: !d.good }">
          <span class="cres-ic" :style="{ background: d.bg }" v-html="ICONS[d.icon]"></span>
          <div>
            <b>{{ d.name }}</b>
            <span class="tag">{{ game.picked[i] && d.good ? '🎒✅ 收对了' :
                                  game.picked[i] && !d.good ? '🎒❌ 是干扰项' :
                                  !game.picked[i] && d.good ? '😮 漏掉了' : '👍 判断正确' }}</span>
            <div class="why">{{ d.why }}</div>
          </div>
        </div>
      </Grid>

      <Cluster :gap="2" v-if="!locked">
        <button class="btn" @click="submit"
          :disabled="!game.explored.every(Boolean)">
          {{ game.explored.every(Boolean) ? '提交我的数据清单 ✅' : `先探索全部数据（${game.explored.filter(Boolean).length}/8）` }}
        </button>
      </Cluster>

      <!-- v2.2：提交后下一关入口自动弹出 + 滚动到自己 -->
      <NextLevelCue
        :active="locked"
        title="干得漂亮！"
        :subtitle="`收集 ${game.pts.collect}/30 分 · 数据采集任务完成`"
        cta-text="下一关：清洗数据"
        @next="next" />
    </Stack>
  </Center>

  <!-- 数据弹窗 -->
  <Teleport to="body">
    <div v-if="modal" class="modal" @click="modal = null">
      <div class="modal-card" @click.stop>
        <button class="x" @click="modal = null">✕</button>
        <div class="m-ic" :style="{ background: game.cards[modal.idx].bg }" v-html="ICONS[game.cards[modal.idx].icon]"></div>
        <div class="m-kicker">✨ 发现新数据</div>
        <div class="m-name">{{ game.cards[modal.idx].name }}</div>
        <div class="m-desc">{{ game.cards[modal.idx].desc }}</div>
        <Cluster :gap="3" justify="center">
          <button class="btn" @click="pick(true)">🎒 装进背包</button>
          <button class="btn secondary" @click="pick(false)">🙅 不需要</button>
        </Cluster>
      </div>
    </div>
  </Teleport>
</template>
<style scoped>
.map {
  position: relative;
  border: var(--bw-2) solid var(--c-ink);
  border-radius: var(--radius-4);
  overflow: hidden;
  box-shadow: var(--shadow-ink-2);
  background: #A8DFEF;
  aspect-ratio: 1000 / 560;
  /* 启用容器查询，让闪光按地图宽度自适应大小 */
  container-type: inline-size;
}
.svg { width: 100%; height: 100%; }
.svg :deep(svg) { width: 100%; height: 100%; display: block; }
.hs {
  position: absolute;
  /* 响应式：占地图宽度的 5%，最小 38px、最大 64px。container query 让小屏上不显傻大粗 */
  width: clamp(38px, 5cqw, 64px); aspect-ratio: 1;
  transform: translate(-50%, -50%);
  background: none; border: none; padding: 0; cursor: pointer;
}
/* v2.1：把白色辉光改成金黄色，背景在彩色小镇里更显眼 */
.hs .glow { position: absolute; inset: -28px; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(255,235,120,.95), rgba(255,210,63,.55) 50%, transparent 75%);
  animation: glow 1.4s ease-in-out infinite;
  filter: drop-shadow(0 0 6px rgba(255,200,50,.7)); }
.hs .halo { position: absolute; inset: -6px; border-radius: 50%;
  border: 3px solid rgba(255,210,63,.95);
  animation: ping 1.5s ease-out infinite; }
.hs .star { position: absolute; inset: 6px;
  filter: drop-shadow(0 0 8px rgba(255,235,120,1)) drop-shadow(0 0 3px rgba(255,200,50,.9));
  animation: starspin 4.5s linear infinite; }
.hs .star :deep(path) { fill: #FFF8B0; }
.hs .badge {
  position: absolute; inset: 6px; display: none;
  border-radius: 50%; border: 3px solid var(--c-ink);
  align-items: center; justify-content: center;
}
.hs .badge :deep(svg) { width: 78%; height: 78%; }
.hs.found .glow, .hs.found .halo, .hs.found .star { display: none; }
.hs.found .badge { display: flex; opacity: .92; }
.hs.found { cursor: default; }
.hs.taken .badge { opacity: 1; box-shadow: 0 0 0 4px rgba(63,165,111,.3); }
.hs.bad   .badge { opacity: .5; filter: saturate(.4); }
@keyframes glow { 0%,100% { transform: scale(.86); opacity: .85; } 50% { transform: scale(1.12); opacity: 1; } }
@keyframes ping { 0% { transform: scale(.75); opacity: 1; } 80% { transform: scale(1.35); opacity: 0; } 100% { opacity: 0; } }
@keyframes starspin { from { transform: rotate(0); } 50% { transform: rotate(180deg) scale(.84); } to { transform: rotate(360deg); } }

.egg { position: absolute; font-size: 22px; transform: translate(-50%, -50%); background: none; border: none; cursor: pointer; animation: bob 2.6s ease-in-out infinite; }
.egg.found { filter: brightness(1.2); animation: none; }
@keyframes bob { 0%,100% { transform: translate(-50%, -50%) translateY(0); } 50% { transform: translate(-50%, -50%) translateY(-4px); } }

/* 底部背包槽：响应式但保持触屏点击区域 ≥ 40px */
.dock {
  width: clamp(40px, 4vw, 52px); aspect-ratio: 1; border-radius: 50%;
  border: var(--bw-2) solid var(--c-ink); background: var(--c-sky);
  position: relative; display: grid; place-items: center;
  cursor: pointer; transition: transform var(--dur-fast);
}
.dock:hover { transform: translateY(-2px); }
.dock.ex { background: #fff; cursor: default; }
.dock.ex:hover { transform: none; }
.dock.pk { border-color: var(--c-good); box-shadow: 0 0 0 3px rgba(63,165,111,.28); }
.dock.good { border-color: var(--c-good); }
.dock.bad { border-color: var(--c-coral); opacity: .55; }
.dock .q { font-size: var(--font-lg); font-weight: 900; color: #7FA8B5; }
.dock .dic { width: 90%; height: 90%; border-radius: 50%; display: grid; place-items: center; }
.dock .dic :deep(svg) { width: 70%; height: 70%; }
.dock .bag { position: absolute; bottom: -6px; right: -6px; font-size: 13px; }

.cres { display: flex; gap: var(--space-2); align-items: flex-start;
  background: #fff; border: var(--bw-2) solid var(--c-ink);
  border-radius: var(--radius-3); padding: var(--space-2);
  font-size: var(--font-sm); line-height: var(--leading-base); }
.cres.g { border-left: 6px solid var(--c-good); }
.cres.b { border-left: 6px solid var(--c-coral); }
.cres-ic { flex: 0 0 40px; width: 40px; height: 40px; border-radius: 50%;
  border: 2px solid var(--c-ink); display: grid; place-items: center; }
.cres-ic :deep(svg) { width: 74%; height: 74%; }
.cres .tag { margin-left: var(--space-1); font-size: var(--font-xs); }
.cres .why { font-size: var(--font-xs); color: var(--c-text-muted); margin-top: 2px; }

.modal { position: fixed; inset: 0; z-index: var(--z-modal); background: rgba(13,38,44,.82);
  -webkit-backdrop-filter: blur(7px); backdrop-filter: blur(7px); display: grid; place-items: center; }
.modal-card { position: relative; background: var(--c-paper); border: var(--bw-2) solid var(--c-ink);
  border-radius: var(--radius-5); padding: var(--space-5); max-width: 380px; width: 90vw;
  box-shadow: 0 10px 40px rgba(0,0,0,.4); display: flex; flex-direction: column; align-items: center; gap: var(--space-2); }
.x { position: absolute; top: var(--space-2); right: var(--space-2); width: 32px; height: 32px;
  border-radius: 50%; background: #f3f3f3; border: 2px solid var(--c-ink); cursor: pointer; }
.m-ic { width: 96px; height: 96px; border-radius: 50%; border: 3px solid var(--c-ink); display: grid; place-items: center; }
.m-ic :deep(svg) { width: 70%; height: 70%; }
.m-kicker { font-size: var(--font-xs); font-weight: 900; letter-spacing: 3px; color: var(--c-water-d); }
.m-name { font-size: var(--font-xl); font-weight: 900; }
.m-desc { font-size: var(--font-sm); color: var(--c-text-muted); text-align: center; }

/* v2.2 手机横屏适配 */
@media (orientation: landscape) and (max-height: 500px) {
  .map { max-height: calc(100vh - 220px); }
  .modal-card { padding: 14px 16px; max-width: 360px; }
  .m-ic { width: 64px; height: 64px; }
  .m-name { font-size: 16px; }
  .m-desc { font-size: 13px; }
}
</style>

<!-- 关卡奖励弹窗：宝箱开箱动画 + 装备旋转跳出 -->
<script setup lang="ts">
import { watch, ref } from 'vue';
import { useGame } from '../game/store';
import { EQUIPMENT } from '../game/equipment';
import { audio } from '../utils/audio';

const game = useGame();
const phase = ref<'closed' | 'shake' | 'open' | 'done'>('closed');
const item = ref<{ ic: string; name: string; msg: string } | null>(null);

watch(() => game.rewardId, (id) => {
  if (!id) return;
  const eq = EQUIPMENT[id]; if (!eq) return;
  item.value = { ic: eq.ic, name: eq.name, msg: eq.msg };
  phase.value = 'shake';
  audio.sfx('tick');
  setTimeout(() => { phase.value = 'open'; audio.sfx('star'); }, 600);
  setTimeout(() => { phase.value = 'done'; audio.sfx('good'); }, 1100);
  setTimeout(close, 4500);
});

function close() {
  phase.value = 'closed';
  game.rewardId = null;
}
</script>
<template>
  <Teleport to="body">
    <div v-if="phase !== 'closed'" class="overlay" @click="close">
      <div class="card" @click.stop>
        <div class="kicker">🎁 装备入手</div>
        <div class="chest" :class="phase">
          <div class="lid"></div>
          <div class="body"><span class="lock">🔒</span></div>
          <div class="rays"></div>
        </div>
        <div class="ic" :class="{ fly: phase === 'done' }" v-if="item">{{ item.ic }}</div>
        <div class="name" v-if="phase === 'done' && item">{{ item.name }}</div>
        <div class="msg"  v-if="phase === 'done' && item">{{ item.msg }}</div>
        <div class="tap"  v-if="phase === 'done'">（轻点空白处继续）</div>
      </div>
    </div>
  </Teleport>
</template>
<style scoped>
.overlay {
  position: fixed; inset: 0; z-index: var(--z-modal);
  background: rgba(13, 38, 44, 0.78);
  -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
  display: grid; place-items: center;
}
.card {
  background: linear-gradient(180deg, #FFF6E3, #FFE9B8);
  border: 4px solid var(--c-ink); border-radius: var(--radius-5);
  padding: var(--space-5);
  max-width: 360px; text-align: center;
  box-shadow: 0 10px 0 var(--c-ink), 0 24px 50px rgba(0, 0, 0, 0.4);
  display: flex; flex-direction: column; align-items: center; gap: var(--space-2);
}
.kicker { font-size: var(--font-sm); font-weight: 900; letter-spacing: 3px; color: #9c6b00; }
.chest { position: relative; width: 118px; height: 96px; }
.body { position: absolute; left: 8px; bottom: 0; width: 102px; height: 62px;
  background: linear-gradient(180deg, #C9935C, #8A5A38); border: 3.5px solid var(--c-ink);
  border-radius: 8px 8px 6px 6px; box-shadow: inset 0 -8px 0 rgba(0,0,0,.2); }
.lock { position: absolute; left: 50%; top: 18px; transform: translateX(-50%);
  font-size: var(--font-lg); background: #FFE7A3; border: 2.5px solid var(--c-ink);
  border-radius: var(--radius-1); padding: 2px 4px; line-height: 1; }
.lid { position: absolute; left: 8px; top: 0; width: 102px; height: 34px;
  background: linear-gradient(180deg, #E0B080, #A06F47); border: 3.5px solid var(--c-ink);
  border-radius: 48px 48px 4px 4px; transform-origin: center bottom; z-index: 2; }
.rays { position: absolute; left: 50%; top: 46px; width: 160px; height: 160px;
  transform: translate(-50%, -50%); opacity: 0;
  background: repeating-conic-gradient(rgba(255,217,61,.55) 0 8deg, transparent 8deg 22deg);
  border-radius: 50%;
  -webkit-mask: radial-gradient(closest-side, #000 16%, rgba(0,0,0,.5) 52%, transparent 78%);
          mask: radial-gradient(closest-side, #000 16%, rgba(0,0,0,.5) 52%, transparent 78%); }
.chest.shake .body, .chest.shake .lid { animation: shake .1s ease-in-out 6; }
@keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
.chest.open .lid, .chest.done .lid { transform: rotate(-95deg) translateY(-2px); }
.chest.open .rays, .chest.done .rays { animation: rays 1.8s linear forwards; }
@keyframes rays {
  0%   { opacity: 0; transform: translate(-50%, -50%) rotate(0) scale(.4); }
  20%  { opacity: .85; transform: translate(-50%, -50%) rotate(60deg) scale(1); }
  100% { opacity: .45; transform: translate(-50%, -50%) rotate(360deg) scale(1.4); }
}
.ic { font-size: 64px; opacity: 0; transition: opacity var(--dur-fast); }
.ic.fly { opacity: 1; animation: fly .8s var(--ease-pop) forwards; }
@keyframes fly {
  0% { opacity: 0; transform: translateY(20px) scale(.4) rotate(-90deg); }
  60% { opacity: 1; transform: translateY(-30px) scale(1.25) rotate(20deg); }
  100% { opacity: 1; transform: translateY(0) scale(1) rotate(0); }
}
.name { font-size: var(--font-xl); font-weight: 900; }
.msg  { font-size: var(--font-sm); color: var(--c-text-muted); font-weight: 700; }
.tap  { font-size: var(--font-xs); color: var(--c-text-subtle); }
</style>

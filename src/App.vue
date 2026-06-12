<script setup lang="ts">
import { computed, watch } from 'vue';
import TopHud from './components/TopHud.vue';
import AppToast from './components/AppToast.vue';
import ComboBurst from './components/ComboBurst.vue';
import EquipReward from './components/EquipReward.vue';
import SceneIntro from './scenes/SceneIntro.vue';
import SceneCollect from './scenes/SceneCollect.vue';
import SceneClean from './scenes/SceneClean.vue';
import SceneTrain from './scenes/SceneTrain.vue';
import SceneDeploy from './scenes/SceneDeploy.vue';
import SceneEnd from './scenes/SceneEnd.vue';
import { useGame } from './game/store';
import { audio } from './utils/audio';

const game = useGame();

const SceneMap: Record<string, any> = {
  intro: SceneIntro, collect: SceneCollect, clean: SceneClean,
  train: SceneTrain, deploy: SceneDeploy, end: SceneEnd
};
const CurrentScene = computed(() => SceneMap[game.scene]);

// 场景切换时 → BGM 切换
const SCENE_BGM: Record<string, string | null> = { intro: 'town', collect: 'work', clean: 'work', train: 'work', deploy: 'rain', end: 'win' };
watch(() => game.scene, (s) => {
  audio.setScene(SCENE_BGM[s] || null);
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
</script>
<template>
  <TopHud />
  <main class="main">
    <component :is="CurrentScene" />
  </main>
  <AppToast />
  <ComboBurst />
  <EquipReward />
</template>
<style>
.main {
  padding: var(--space-4) 0 var(--space-7);
}
</style>

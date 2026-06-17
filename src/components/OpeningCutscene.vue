<!--
  开场剧情动画（v2.2.1 生动版 · 1m20s 共 8 帧）
  每帧不再用 emoji，改为：
  - 自绘场景 SVG（300-600 个元素 / 帧）
  - 多层动画：飘云 / 雨落 / 水位涨 / 闪电 / 角色摇摆 / 数据飞行
  - 文字解说卡 + 云博士 TTS
-->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { tts } from '../utils/tts';
import { audio } from '../utils/audio';

const emit = defineEmits<{ (e: 'done'): void }>();

const FRAMES = [
  { id: 'town',     title: '美丽的清溪镇',     text: '清溪镇坐落在一条小河边，每周都有热闹的 <b>河畔大集</b>。',                speak: '清溪镇坐落在一条小河边，每周都有热闹的河畔大集，摊主们卖糖葫芦、卖瓜果，孩子们在河边跑来跑去。' },
  { id: 'rainy',    title: '雨季来临',         text: '一到雨季，乌云压过来。<b>河水可能会涨</b>，集市就有危险。',              speak: '可是一到雨季，乌云就压过来。河水可能会涨，集市就有危险。' },
  { id: 'flood',    title: '去年的洪水',       text: '去年的洪水冲进集市，<b>摊主们损失惨重</b>。镇长很担心，今年还会再来吗？', speak: '去年的洪水冲进集市，摊主们损失惨重。镇长很担心，今年还会再来吗？' },
  { id: 'mayor',    title: '镇长请来云博士',   text: '镇长请来了云博士。云博士说：<b>我们可以用 AI 提前预测洪水！</b>',         speak: '镇长请来了云博士。云博士说，我们可以用 AI，帮镇子提前预测洪水！' },
  { id: 'collect',  title: '第一步 · 收集数据', text: 'AI 想学预测，先要"看资料"——<b>降雨量、河水位、上游放水</b>，挑出有用的。', speak: 'AI 想学会预测，先要看资料。降雨量、河水位、上游放水，这些才是和洪水有关的数据。我们要找出有用的，扔掉没用的。' },
  { id: 'clean',    title: '第二步 · 清洗数据', text: '资料里会混进<b>错误</b>——空白的、超大的、负数的、重复的。不清掉，AI 会学糊涂！', speak: '资料里会混进错误。空白的、超大的、负数的、重复的。不清掉它们，AI 会学糊涂。' },
  { id: 'train',    title: '第三步 · 训练模型', text: '把干净数据喂给 AI 反复学习，再用没见过的考题考它。准确率高，才能上岗！', speak: '把干净的数据喂给 AI，让它反复学习，再用它没见过的考题考它。准确率高，才能上岗。' },
  { id: 'decide',   title: '第四步 · 你来决策', text: 'AI 算出"明天 87% 会洪水"，<b>发不发预警，由你拍板</b>。最终决定权在人！', speak: 'AI 算出明天百分之八十七会洪水，发不发预警，由你拍板。AI 给概率，但最终决定权永远在人！' }
];

// 时长策略：等配音念完后停顿 1s 再切；同时保证 6s 最短（看清画面）、25s 最长（防 TTS 卡死）。
const MIN_MS = 6000;
const MAX_MS = 25000;
const TAIL_MS = 1000;
const FALLBACK_MS = 9000; // TTS 关闭/不支持时每帧固定时长

const idx = ref(0);
const progress = ref(0);
let frameTimer: number | null = null;
let progressTimer: number | null = null;
let ttsEnded = false;
let frameStart = 0;

const current = computed(() => FRAMES[idx.value]);
const isLast = computed(() => idx.value === FRAMES.length - 1);

function clearAllTimers() {
  if (frameTimer) { clearTimeout(frameTimer); frameTimer = null; }
  if (progressTimer) { clearInterval(progressTimer); progressTimer = null; }
}

function scheduleAdvance(ms: number) {
  if (frameTimer) clearTimeout(frameTimer);
  if (isLast.value) return;
  frameTimer = window.setTimeout(() => goNext(), Math.max(0, ms));
}

function startFrame() {
  clearAllTimers();
  progress.value = 0;
  ttsEnded = false;
  audio.sfx('whoosh');
  frameStart = Date.now();
  const frameIdxAtStart = idx.value;

  // 兜底：MAX_MS 一定会切（防止 TTS 失败卡住）
  scheduleAdvance(MAX_MS);

  // 进度条按"预期总时长"（取 TTS 估时 + 1s 尾，未结束时上限 MAX_MS）走
  // 一旦 TTS 结束，剩余进度快速补齐到 100%
  let expectedTotal = MAX_MS;
  progressTimer = window.setInterval(() => {
    const elapsed = Date.now() - frameStart;
    progress.value = Math.min(100, elapsed / expectedTotal * 100);
  }, 100);

  // 启动 TTS，结束时安排切帧
  tts.speak(current.value.speak, true, () => {
    // 防止过期回调影响后续帧
    if (frameIdxAtStart !== idx.value) return;
    ttsEnded = true;
    const elapsed = Date.now() - frameStart;
    const waitMore = Math.max(MIN_MS - elapsed, 0) + TAIL_MS;
    expectedTotal = elapsed + waitMore;
    scheduleAdvance(waitMore);
  });

  // TTS 被全局禁用时，speak 会立即同步回调 onEnd → ttsEnded 已 true
  // 此时 elapsed≈0，等够 MIN_MS+TAIL 或回退到 FALLBACK_MS
  if (ttsEnded) {
    expectedTotal = FALLBACK_MS;
    scheduleAdvance(FALLBACK_MS);
  }
}
function goNext() { if (isLast.value) { skip(); return; } idx.value++; }
function goPrev() { if (idx.value > 0) idx.value--; }
function skip() {
  clearAllTimers();
  tts.cancel();
  audio.sfx('star');
  emit('done');
}

watch(idx, () => startFrame());
onMounted(() => { audio.init(); startFrame(); });
onUnmounted(() => {
  if (frameTimer) clearTimeout(frameTimer);
  if (progressTimer) clearInterval(progressTimer);
  tts.cancel();
});
</script>

<template>
  <div class="cutscene">
    <!-- 顶部进度 -->
    <div class="top-bar">
      <div class="frames">
        <span v-for="(_, i) in FRAMES" :key="i" class="dot" :class="{ on: i === idx, done: i < idx }"></span>
      </div>
      <button class="skip-btn" @click="skip">跳过 →</button>
    </div>
    <div class="prog-rail"><div class="prog-fill" :style="{ width: progress + '%' }"></div></div>

    <!-- 主舞台：每帧独立 SVG 场景 -->
    <Transition name="frame" mode="out-in">
      <div class="stage" :key="idx" :class="'frame-' + current.id">

        <!-- 帧 1：晴天小镇 + 热闹河畔大集 -->
        <svg v-if="current.id === 'town'" class="scene" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="t1-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#8ECBDD"/><stop offset=".55" stop-color="#C5E8E6"/><stop offset="1" stop-color="#F3FAEC"/>
            </linearGradient>
            <linearGradient id="t1-river" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#79CFE2"/><stop offset="1" stop-color="#3E9CBE"/>
            </linearGradient>
          </defs>
          <rect width="800" height="400" fill="url(#t1-sky)"/>
          <!-- 太阳光线旋转 -->
          <g transform="translate(680,70)">
            <g>
              <g v-for="n in 8" :key="n" :transform="`rotate(${n*45})`"><rect x="-2" y="-50" width="4" height="20" rx="2" fill="#FFD23F"/></g>
              <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="12s" repeatCount="indefinite"/>
            </g>
            <circle r="24" fill="#FFE27A"/><circle r="18" fill="#FFD23F"/>
          </g>
          <!-- 飘云 -->
          <g>
            <ellipse cx="0" cy="0" rx="34" ry="12" fill="#fff"/><circle cx="-18" cy="-5" r="12" fill="#fff"/><circle cx="14" cy="-9" r="15" fill="#fff"/>
            <animateTransform attributeName="transform" type="translate" values="100,55; 220,55; 100,55" dur="22s" repeatCount="indefinite"/>
          </g>
          <g>
            <ellipse cx="0" cy="0" rx="28" ry="10" fill="#fff" opacity=".9"/><circle cx="-13" cy="-4" r="10" fill="#fff" opacity=".9"/><circle cx="11" cy="-7" r="13" fill="#fff" opacity=".9"/>
            <animateTransform attributeName="transform" type="translate" values="540,85; 460,85; 540,85" dur="26s" repeatCount="indefinite"/>
          </g>
          <!-- 飞鸟 -->
          <g>
            <path d="M0 0 q4 -6 8 0 M8 0 q4 -6 8 0" stroke="#2A4A50" stroke-width="2" fill="none"/>
            <animateTransform attributeName="transform" type="translate" values="200,90; 600,75; 800,90" dur="14s" repeatCount="indefinite"/>
          </g>
          <g>
            <path d="M0 0 q3 -4 6 0 M6 0 q3 -4 6 0" stroke="#2A4A50" stroke-width="1.6" fill="none"/>
            <animateTransform attributeName="transform" type="translate" values="100,130; 500,120; 820,130" dur="18s" repeatCount="indefinite"/>
          </g>
          <!-- 远山 -->
          <path d="M-20 200 Q140 145 280 195 Q420 135 560 185 Q700 145 820 195 L820 230 L-20 230 Z" fill="#8CBBA2" opacity=".7"/>
          <!-- 草地 -->
          <path d="M-20 240 Q200 224 400 236 Q620 250 820 232 L820 310 L-20 310 Z" fill="#9FD480"/>
          <!-- 镇子三栋房（后排，被集市挡） -->
          <g transform="translate(150,208)"><rect x="-26" y="0" width="52" height="34" fill="#FFFDF6" stroke="#2A4A50" stroke-width="2"/><path d="M-32 0 L0 -22 L32 0 Z" fill="#E2574C" stroke="#2A4A50" stroke-width="2"/><rect x="-6" y="16" width="12" height="18" fill="#3D7C9C" stroke="#2A4A50" stroke-width="1.4"/></g>
          <g transform="translate(680,210)"><rect x="-24" y="0" width="48" height="34" fill="#FFFDF6" stroke="#2A4A50" stroke-width="2"/><path d="M-30 0 L0 -22 L30 0 Z" fill="#F2A03D" stroke="#2A4A50" stroke-width="2"/><rect x="-5" y="16" width="10" height="18" fill="#8A5A38" stroke="#2A4A50" stroke-width="1.4"/></g>
          <g transform="translate(580,206)"><rect x="-22" y="0" width="44" height="32" fill="#FFF3D8" stroke="#2A4A50" stroke-width="2"/><path d="M-28 0 L0 -22 L28 0 Z" fill="#D8564A" stroke="#2A4A50" stroke-width="2"/></g>
          <!-- "清溪镇" 牌坊 -->
          <g transform="translate(400,200)">
            <rect x="-60" y="-30" width="120" height="20" fill="#D8564A" stroke="#1B3A40" stroke-width="2.4" rx="3"/>
            <text x="0" y="-14" font-size="14" font-weight="900" text-anchor="middle" fill="#fff">清 溪 镇</text>
            <rect x="-66" y="-30" width="6" height="60" fill="#8A5A38" stroke="#1B3A40" stroke-width="2"/>
            <rect x="60" y="-30" width="6" height="60" fill="#8A5A38" stroke="#1B3A40" stroke-width="2"/>
          </g>
          <!-- 集市彩旗 -->
          <g class="banner" transform="translate(220,170)">
            <path d="M0 0 Q180 -10 360 0" stroke="#6E4527" stroke-width="1.6" fill="none"/>
            <g v-for="(c, i) in ['#FF7B6B','#FFCF3F','#52C474','#4FC3DC','#B388FF','#FF9F1C']" :key="c" :transform="`translate(${i*55+25}, ${i%2?2:-2})`"><polygon points="0,0 6,-14 12,0" :fill="c"/></g>
          </g>
          <!-- 摊位 1：糖葫芦 -->
          <g transform="translate(170,290)">
            <!-- 棚顶 -->
            <path d="M-32 -28 L32 -28 L36 -36 L-36 -36 Z" fill="#E2574C" stroke="#1B3A40" stroke-width="2"/>
            <rect x="-30" y="-28" width="60" height="6" fill="#FFCF3F" stroke="#1B3A40" stroke-width="1.5"/>
            <!-- 桌 -->
            <rect x="-30" y="-2" width="60" height="22" fill="#C9935C" stroke="#1B3A40" stroke-width="2"/>
            <!-- 糖葫芦插架 -->
            <rect x="-22" y="-22" width="44" height="22" fill="#FFE8C7" stroke="#1B3A40" stroke-width="1.5"/>
            <g v-for="i in 5" :key="i" :transform="`translate(${-18 + i*8}, -22)`">
              <line x1="0" y1="0" x2="0" y2="22" stroke="#8A5A38" stroke-width="1.5"/>
              <circle cx="0" cy="2" r="3" fill="#E2574C" stroke="#1B3A40" stroke-width=".8"/>
              <circle cx="0" cy="9" r="3" fill="#E2574C" stroke="#1B3A40" stroke-width=".8"/>
              <circle cx="0" cy="16" r="3" fill="#E2574C" stroke="#1B3A40" stroke-width=".8"/>
            </g>
            <!-- 摊主头 -->
            <g transform="translate(0,-46)">
              <circle r="9" fill="#FFD9BF" stroke="#1B3A40" stroke-width="1.6"/>
              <path d="M-9 -4 q9 -8 18 0" fill="#5C3A20" stroke="#1B3A40" stroke-width="1.4" transform="translate(-9,0)"/>
              <circle cx="-3" cy="-1" r="1" fill="#1B3A40"/><circle cx="3" cy="-1" r="1" fill="#1B3A40"/>
              <path d="M-3 3 q3 2 6 0" stroke="#1B3A40" stroke-width="1" fill="none"/>
            </g>
            <text x="0" y="-44" font-size="14" text-anchor="middle">😊</text>
          </g>
          <!-- 摊位 2：瓜果（西瓜+黄瓜+苹果） -->
          <g transform="translate(450,290)">
            <path d="M-40 -28 L40 -28 L44 -36 L-44 -36 Z" fill="#52C474" stroke="#1B3A40" stroke-width="2"/>
            <rect x="-38" y="-28" width="76" height="6" fill="#FFCF3F" stroke="#1B3A40" stroke-width="1.5"/>
            <rect x="-36" y="-2" width="72" height="22" fill="#C9935C" stroke="#1B3A40" stroke-width="2"/>
            <!-- 西瓜 -->
            <ellipse cx="-22" cy="-6" rx="11" ry="8" fill="#3FA56F" stroke="#1B3A40" stroke-width="1.6"/>
            <path d="M-30 -8 q8 -3 16 0 M-30 -4 q8 -3 16 0" stroke="#1B3A40" stroke-width=".8" fill="none"/>
            <ellipse cx="-6" cy="-6" rx="9" ry="6" fill="#3FA56F" stroke="#1B3A40" stroke-width="1.6"/>
            <!-- 苹果 -->
            <circle cx="14" cy="-8" r="7" fill="#E2574C" stroke="#1B3A40" stroke-width="1.6"/>
            <path d="M14 -15 q2 -3 4 0" stroke="#1B3A40" stroke-width="1.2" fill="none"/>
            <circle cx="28" cy="-7" r="6" fill="#E2574C" stroke="#1B3A40" stroke-width="1.6"/>
            <!-- 摊主头（戴草帽） -->
            <g transform="translate(0,-44)">
              <path d="M-13 0 L13 0 L10 -3 L-10 -3 Z" fill="#D8A85A" stroke="#1B3A40" stroke-width="1.6"/>
              <ellipse cx="0" cy="-3" rx="6" ry="4" fill="#D8A85A" stroke="#1B3A40" stroke-width="1.6"/>
              <circle cy="6" r="9" fill="#FFD9BF" stroke="#1B3A40" stroke-width="1.6"/>
              <circle cx="-3" cy="5" r="1" fill="#1B3A40"/><circle cx="3" cy="5" r="1" fill="#1B3A40"/>
              <path d="M-3 9 q3 2 6 0" stroke="#1B3A40" stroke-width="1" fill="none"/>
            </g>
            <!-- 喊价气泡 -->
            <g>
              <ellipse cx="36" cy="-52" rx="22" ry="10" fill="#fff" stroke="#1B3A40" stroke-width="1.6"/>
              <text x="36" y="-48" font-size="9" font-weight="900" text-anchor="middle" fill="#1B3A40">甜西瓜!</text>
              <animateTransform attributeName="transform" type="scale" values="1;1.08;1" dur="1.6s" repeatCount="indefinite" additive="sum"/>
            </g>
          </g>
          <!-- 跑动的孩子 1 -->
          <g>
            <animateTransform attributeName="transform" type="translate" values="280,280; 380,280; 280,280" dur="6s" repeatCount="indefinite"/>
            <g>
              <ellipse cx="0" cy="0" rx="6" ry="4" fill="#000" opacity=".15"/>
              <circle cx="0" cy="-22" r="7" fill="#FFD9BF" stroke="#1B3A40" stroke-width="1.4"/>
              <path d="M-7 -28 q7 -8 14 0" fill="#3A2418" stroke="#1B3A40" stroke-width="1.2"/>
              <circle cx="-2" cy="-22" r=".9" fill="#1B3A40"/><circle cx="2" cy="-22" r=".9" fill="#1B3A40"/>
              <path d="M-2 -19 q2 2 4 0" stroke="#1B3A40" stroke-width=".8" fill="none"/>
              <rect x="-6" y="-15" width="12" height="11" fill="#FFCF3F" stroke="#1B3A40" stroke-width="1.4" rx="2"/>
              <line x1="-6" y1="-12" x2="-12" y2="-8" stroke="#FFD9BF" stroke-width="2" stroke-linecap="round"/>
              <line x1="6" y1="-12" x2="12" y2="-8" stroke="#FFD9BF" stroke-width="2" stroke-linecap="round"/>
              <!-- 跑动腿 -->
              <line x1="-3" y1="-4" x2="-5" y2="2" stroke="#1B3A40" stroke-width="2.4">
                <animate attributeName="x2" values="-5;-1;-5" dur=".4s" repeatCount="indefinite"/>
              </line>
              <line x1="3" y1="-4" x2="5" y2="2" stroke="#1B3A40" stroke-width="2.4">
                <animate attributeName="x2" values="5;1;5" dur=".4s" repeatCount="indefinite"/>
              </line>
            </g>
          </g>
          <!-- 跑动的孩子 2（追气球） -->
          <g>
            <animateTransform attributeName="transform" type="translate" values="620,288; 540,288; 620,288" dur="5s" repeatCount="indefinite"/>
            <g>
              <ellipse cx="0" cy="0" rx="6" ry="4" fill="#000" opacity=".15"/>
              <circle cx="0" cy="-22" r="7" fill="#FFD9BF" stroke="#1B3A40" stroke-width="1.4"/>
              <!-- 双辫子 -->
              <ellipse cx="-7" cy="-22" rx="2" ry="6" fill="#3A2418"/>
              <ellipse cx="7" cy="-22" rx="2" ry="6" fill="#3A2418"/>
              <circle cx="-2" cy="-22" r=".9" fill="#1B3A40"/><circle cx="2" cy="-22" r=".9" fill="#1B3A40"/>
              <path d="M-2 -19 q2 2 4 0" stroke="#1B3A40" stroke-width=".8" fill="none"/>
              <rect x="-6" y="-15" width="12" height="11" fill="#FF7B6B" stroke="#1B3A40" stroke-width="1.4" rx="2"/>
              <line x1="3" y1="-12" x2="14" y2="-30" stroke="#1B3A40" stroke-width="1"/>
              <circle cx="15" cy="-34" r="6" fill="#4FC3DC" stroke="#1B3A40" stroke-width="1.4"/>
              <line x1="-3" y1="-4" x2="-5" y2="2" stroke="#1B3A40" stroke-width="2.4">
                <animate attributeName="x2" values="-1;-5;-1" dur=".4s" repeatCount="indefinite"/>
              </line>
              <line x1="3" y1="-4" x2="5" y2="2" stroke="#1B3A40" stroke-width="2.4">
                <animate attributeName="x2" values="1;5;1" dur=".4s" repeatCount="indefinite"/>
              </line>
            </g>
          </g>
          <!-- 大人散步 -->
          <g transform="translate(75,295)">
            <ellipse cx="0" cy="6" rx="9" ry="3" fill="#000" opacity=".15"/>
            <rect x="-7" y="-20" width="14" height="22" fill="#3D7C9C" stroke="#1B3A40" stroke-width="1.6" rx="3"/>
            <circle cx="0" cy="-30" r="9" fill="#FFD9BF" stroke="#1B3A40" stroke-width="1.6"/>
            <path d="M-8 -34 q8 -8 16 0" fill="#3A2418" stroke="#1B3A40" stroke-width="1.4"/>
            <line x1="-4" y1="2" x2="-5" y2="14" stroke="#1B3A40" stroke-width="2.6"/>
            <line x1="4" y1="2" x2="5" y2="14" stroke="#1B3A40" stroke-width="2.6"/>
          </g>
          <!-- 河 -->
          <path d="M-20 310 Q220 296 420 306 Q620 318 820 302 L820 400 L-20 400 Z" fill="url(#t1-river)"/>
          <!-- 河面波纹 -->
          <g class="waves">
            <path d="M40 330 q15 -8 30 0 q15 8 30 0" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/>
            <path d="M520 340 q15 -8 30 0 q15 8 30 0" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/>
            <path d="M280 348 q15 -8 30 0 q15 8 30 0" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/>
          </g>
          <!-- 小船（在河面上摇晃） -->
          <g transform="translate(280,338)">
            <g>
              <path d="M-22 0 Q-18 12 0 12 Q18 12 22 0 Z" fill="#8A5A38" stroke="#2A4A50" stroke-width="2"/>
              <rect x="-2" y="-22" width="3" height="22" fill="#8A5A38"/>
              <path d="M2 -22 L18 -14 L2 -10 Z" fill="#FFCF3F" stroke="#2A4A50" stroke-width="1.5"/>
              <!-- 船夫 -->
              <circle cx="0" cy="-4" r="4" fill="#FFD9BF" stroke="#1B3A40" stroke-width="1.2"/>
              <animateTransform attributeName="transform" type="rotate" values="-4;4;-4" dur="3s" repeatCount="indefinite"/>
            </g>
          </g>
          <!-- 鸭子（游动） -->
          <g>
            <ellipse cx="0" cy="0" rx="9" ry="5" fill="#FFE27A" stroke="#2A4A50" stroke-width="1.5"/>
            <circle cx="8" cy="-3" r="4" fill="#FFE27A" stroke="#2A4A50" stroke-width="1.5"/>
            <circle cx="9" cy="-4" r=".9" fill="#2A4A50"/>
            <polygon points="11,-3 14,-2 11,-1" fill="#FFA600"/>
            <animateTransform attributeName="transform" type="translate" values="640,358; 580,358; 640,358" dur="8s" repeatCount="indefinite"/>
          </g>
          <!-- 鸭妈妈带小鸭 -->
          <g>
            <ellipse cx="0" cy="0" rx="7" ry="4" fill="#FFE27A" stroke="#2A4A50" stroke-width="1.4"/>
            <circle cx="6" cy="-2" r="3" fill="#FFE27A" stroke="#2A4A50" stroke-width="1.4"/>
            <animateTransform attributeName="transform" type="translate" values="700,362; 660,362; 700,362" dur="8s" repeatCount="indefinite"/>
          </g>
        </svg>

        <!-- 帧 2：雨季 -->
        <svg v-else-if="current.id === 'rainy'" class="scene" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="t2-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#2B3A5A"/><stop offset=".55" stop-color="#5A6E84"/><stop offset="1" stop-color="#8AA4B6"/>
            </linearGradient>
          </defs>
          <rect width="800" height="400" fill="url(#t2-sky)"/>
          <!-- 厚云 -->
          <g class="storm-clouds">
            <ellipse cx="200" cy="80" rx="120" ry="36" fill="#3E4A60" opacity=".95"/>
            <circle cx="140" cy="60" r="36" fill="#3E4A60" opacity=".95"/>
            <circle cx="240" cy="50" r="44" fill="#3E4A60" opacity=".95"/>
            <ellipse cx="560" cy="100" rx="140" ry="40" fill="#3E4A60" opacity=".95"/>
            <circle cx="500" cy="76" r="40" fill="#3E4A60" opacity=".95"/>
            <circle cx="620" cy="64" r="48" fill="#3E4A60" opacity=".95"/>
          </g>
          <!-- 闪电（间歇闪烁） -->
          <path class="lightning" d="M380 110 L360 200 L400 200 L370 280 L420 180 L390 180 Z" fill="#FFD23F" stroke="#FFE27A" stroke-width="2"/>
          <!-- 雨滴 -->
          <g class="rain">
            <line v-for="i in 40" :key="i" :x1="i*22 + (i%3)*5" y1="120" :x2="i*22 + (i%3)*5 - 10" y2="200" stroke="#9FD9EC" stroke-width="2" opacity=".7"/>
          </g>
          <!-- 远山 -->
          <path d="M-20 260 Q140 200 280 250 Q420 190 560 240 Q700 200 820 250 L820 280 L-20 280 Z" fill="#4A5A70"/>
          <!-- 镇子（雨中颜色变暗） -->
          <g transform="translate(370,242)"><rect x="-35" y="0" width="70" height="46" fill="#9FA8B0" stroke="#1B3A40" stroke-width="2"/><path d="M-42 0 L0 -30 L42 0 Z" fill="#7A3A36" stroke="#1B3A40" stroke-width="2"/></g>
          <g transform="translate(240,248)"><rect x="-26" y="0" width="52" height="38" fill="#9FA8B0" stroke="#1B3A40" stroke-width="2"/><path d="M-34 0 L0 -24 L34 0 Z" fill="#7A4828" stroke="#1B3A40" stroke-width="2"/></g>
          <g transform="translate(510,250)"><rect x="-26" y="0" width="52" height="38" fill="#9FA8B0" stroke="#1B3A40" stroke-width="2"/><path d="M-34 0 L0 -24 L34 0 Z" fill="#5A4828" stroke="#1B3A40" stroke-width="2"/></g>
          <!-- 河水位升高（用涨水动画） -->
          <path class="river-rise" d="M-20 310 Q220 296 420 306 Q620 318 820 302 L820 400 L-20 400 Z" fill="#3E9CBE"/>
          <path d="M-20 330 Q220 316 420 326 Q620 338 820 322" stroke="#fff" stroke-width="2" fill="none" opacity=".4"/>
        </svg>

        <!-- 帧 3：洪水来袭 + 摊主损失惨重 -->
        <svg v-else-if="current.id === 'flood'" class="scene" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="t3-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#4A5A70"/><stop offset="1" stop-color="#9FA8B6"/>
            </linearGradient>
            <linearGradient id="t3-flood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#5BA9C0"/><stop offset="1" stop-color="#1F6B82"/>
            </linearGradient>
          </defs>
          <rect width="800" height="400" fill="url(#t3-sky)"/>
          <!-- 厚云 + 微闪电 -->
          <g>
            <ellipse cx="160" cy="60" rx="60" ry="18" fill="#5A6878"/>
            <circle cx="120" cy="48" r="22" fill="#5A6878"/><circle cx="200" cy="42" r="26" fill="#5A6878"/>
            <animateTransform attributeName="transform" type="translate" values="0,0; 20,0; 0,0" dur="6s" repeatCount="indefinite"/>
          </g>
          <g>
            <ellipse cx="610" cy="70" rx="70" ry="20" fill="#5A6878"/>
            <circle cx="560" cy="55" r="24" fill="#5A6878"/><circle cx="660" cy="48" r="28" fill="#5A6878"/>
            <animateTransform attributeName="transform" type="translate" values="0,0; -20,0; 0,0" dur="7s" repeatCount="indefinite"/>
          </g>
          <path d="M380 80 L368 130 L388 130 L376 180 L408 120 L388 120 Z" fill="#FFD23F" stroke="#FFE27A" stroke-width="1.5">
            <animate attributeName="opacity" values="0; 0; 1; 0; 0" dur="3s" repeatCount="indefinite"/>
          </path>
          <!-- 雨 -->
          <g>
            <line v-for="i in 30" :key="i" :x1="i*28 + (i%3)*4" y1="100" :x2="i*28 + (i%3)*4 - 8" y2="160" stroke="#9FD9EC" stroke-width="1.8" opacity=".6">
              <animate attributeName="y1" values="80; 200" :dur="`${0.5 + (i%4)*0.15}s`" repeatCount="indefinite"/>
              <animate attributeName="y2" values="140; 260" :dur="`${0.5 + (i%4)*0.15}s`" repeatCount="indefinite"/>
            </line>
          </g>
          <!-- 远山 -->
          <path d="M-20 200 Q200 150 400 195 Q600 140 820 190 L820 230 L-20 230 Z" fill="#4A5A70"/>
          <!-- 镇子被水围 -->
          <g transform="translate(170,228)"><rect x="-26" y="0" width="52" height="48" fill="#9FA8B0" stroke="#1B3A40" stroke-width="2.2"/><path d="M-32 0 L0 -28 L32 0 Z" fill="#7A3A36" stroke="#1B3A40" stroke-width="2.2"/></g>
          <g transform="translate(280,218)"><rect x="-30" y="0" width="60" height="56" fill="#9FA8B0" stroke="#1B3A40" stroke-width="2.4"/><path d="M-38 0 L0 -32 L38 0 Z" fill="#7A3A36" stroke="#1B3A40" stroke-width="2.4"/><rect x="-6" y="20" width="12" height="20" fill="#3A2418"/></g>
          <g transform="translate(420,216)"><rect x="-34" y="0" width="68" height="58" fill="#9FA8B0" stroke="#1B3A40" stroke-width="2.4"/><path d="M-42 0 L0 -34 L42 0 Z" fill="#7A4828" stroke="#1B3A40" stroke-width="2.4"/></g>
          <g transform="translate(560,222)"><rect x="-26" y="0" width="52" height="54" fill="#9FA8B0" stroke="#1B3A40" stroke-width="2.4"/><path d="M-34 0 L0 -28 L34 0 Z" fill="#5A4828" stroke="#1B3A40" stroke-width="2.4"/></g>
          <g transform="translate(660,224)"><rect x="-22" y="0" width="44" height="48" fill="#9FA8B0" stroke="#1B3A40" stroke-width="2.2"/><path d="M-28 0 L0 -24 L28 0 Z" fill="#7A4828" stroke="#1B3A40" stroke-width="2.2"/></g>
          <!-- 摊位被冲歪（残骸） -->
          <g transform="translate(380,278)" style="opacity:.85">
            <path d="M-30 0 L26 -8 L30 -2 L-26 6 Z" fill="#E2574C" stroke="#1B3A40" stroke-width="1.6"/>
            <rect x="-10" y="-2" width="6" height="20" fill="#8A5A38" stroke="#1B3A40" stroke-width="1.4" transform="rotate(20)"/>
            <animateTransform attributeName="transform" type="translate" values="380,278; 385,276; 380,278" dur="2s" repeatCount="indefinite"/>
          </g>
          <!-- 大水位（漫到房子腰部） -->
          <path class="flood-water" d="M-20 270 Q220 262 420 266 Q620 270 820 262 L820 400 L-20 400 Z" fill="url(#t3-flood)" opacity=".92"/>
          <!-- 水面波浪线 -->
          <path d="M-20 290 q40 -8 80 0 q40 8 80 0 q40 -8 80 0 q40 8 80 0 q40 -8 80 0 q40 8 80 0 q40 -8 80 0 q40 8 80 0 q40 -8 80 0 q40 8 80 0 q40 -8 80 0" stroke="#fff" stroke-width="1.5" fill="none" opacity=".4">
            <animate attributeName="d" values="M-20 290 q40 -8 80 0 q40 8 80 0 q40 -8 80 0 q40 8 80 0 q40 -8 80 0 q40 8 80 0 q40 -8 80 0 q40 8 80 0 q40 -8 80 0 q40 8 80 0 q40 -8 80 0; M-20 290 q40 8 80 0 q40 -8 80 0 q40 8 80 0 q40 -8 80 0 q40 8 80 0 q40 -8 80 0 q40 8 80 0 q40 -8 80 0 q40 8 80 0 q40 -8 80 0 q40 8 80 0; M-20 290 q40 -8 80 0 q40 8 80 0 q40 -8 80 0 q40 8 80 0 q40 -8 80 0 q40 8 80 0 q40 -8 80 0 q40 8 80 0 q40 -8 80 0 q40 8 80 0 q40 -8 80 0" dur="3s" repeatCount="indefinite"/>
          </path>
          <!-- 摊主（左前景，手抱头，崩溃跪坐） -->
          <g transform="translate(140,300)">
            <ellipse cx="0" cy="32" rx="26" ry="5" fill="#000" opacity=".25"/>
            <!-- 身体 -->
            <path d="M-22 0 Q-26 30 -18 32 L18 32 Q26 30 22 0 Z" fill="#7A5836" stroke="#1B3A40" stroke-width="2"/>
            <!-- 头 -->
            <circle cx="0" cy="-22" r="16" fill="#FFD9BF" stroke="#1B3A40" stroke-width="2"/>
            <path d="M-14 -32 q14 -12 28 0" fill="#3A2418" stroke="#1B3A40" stroke-width="1.6"/>
            <!-- 哭眼 -->
            <path d="M-7 -22 q-2 -2 0 -4 M-7 -26 q2 2 0 4" stroke="#1B3A40" stroke-width="1.4" fill="none"/>
            <path d="M7 -22 q2 -2 0 -4 M7 -26 q-2 2 0 4" stroke="#1B3A40" stroke-width="1.4" fill="none"/>
            <line x1="-6" y1="-16" x2="-7" y2="-8" stroke="#4FC3DC" stroke-width="2"/>
            <line x1="6" y1="-16" x2="7" y2="-8" stroke="#4FC3DC" stroke-width="2"/>
            <path d="M-4 -14 q4 4 8 0" stroke="#1B3A40" stroke-width="1.4" fill="none" transform="rotate(180)"/>
            <!-- 双手抱头 -->
            <path d="M-22 -12 q-14 -10 -2 -22 q4 -4 12 0" stroke="#1B3A40" stroke-width="2" fill="#FFD9BF"/>
            <path d="M22 -12 q14 -10 2 -22 q-4 -4 -12 0" stroke="#1B3A40" stroke-width="2" fill="#FFD9BF"/>
            <animateTransform attributeName="transform" type="translate" values="140,300; 140,304; 140,300" dur="1.6s" repeatCount="indefinite"/>
          </g>
          <!-- 漂浮的糖葫芦串 -->
          <g>
            <line x1="0" y1="0" x2="0" y2="22" stroke="#8A5A38" stroke-width="1.5"/>
            <circle cx="0" cy="2" r="4" fill="#E2574C" stroke="#1B3A40" stroke-width="1"/>
            <circle cx="0" cy="10" r="4" fill="#E2574C" stroke="#1B3A40" stroke-width="1"/>
            <circle cx="0" cy="18" r="4" fill="#E2574C" stroke="#1B3A40" stroke-width="1"/>
            <animateTransform attributeName="transform" type="translate" values="240,288; 256,294; 240,288" dur="3s" repeatCount="indefinite"/>
            <animateTransform attributeName="transform" type="rotate" values="-10;10;-10" dur="3s" repeatCount="indefinite" additive="sum"/>
          </g>
          <!-- 漂浮的西瓜 1 -->
          <g>
            <ellipse cx="0" cy="0" rx="14" ry="10" fill="#3FA56F" stroke="#1B3A40" stroke-width="1.8"/>
            <path d="M-12 -2 q12 -4 24 0 M-12 2 q12 -4 24 0" stroke="#1B3A40" stroke-width="1" fill="none" transform="translate(-12,0)"/>
            <animateTransform attributeName="transform" type="translate" values="320,290; 336,296; 320,290" dur="4s" repeatCount="indefinite"/>
            <animateTransform attributeName="transform" type="rotate" values="-15;15;-15" dur="4s" repeatCount="indefinite" additive="sum"/>
          </g>
          <!-- 漂浮的西瓜 2 -->
          <g>
            <ellipse cx="0" cy="0" rx="10" ry="7" fill="#3FA56F" stroke="#1B3A40" stroke-width="1.6"/>
            <animateTransform attributeName="transform" type="translate" values="490,294; 504,302; 490,294" dur="3.6s" repeatCount="indefinite"/>
          </g>
          <!-- 漂浮的木箱 -->
          <g>
            <rect x="-16" y="-10" width="32" height="20" fill="#C9935C" stroke="#1B3A40" stroke-width="1.8"/>
            <line x1="-16" y1="0" x2="16" y2="0" stroke="#1B3A40" stroke-width="1.2"/>
            <line x1="0" y1="-10" x2="0" y2="10" stroke="#1B3A40" stroke-width="1.2"/>
            <animateTransform attributeName="transform" type="translate" values="610,288; 626,294; 610,288" dur="4.2s" repeatCount="indefinite"/>
            <animateTransform attributeName="transform" type="rotate" values="-8;8;-8" dur="4.2s" repeatCount="indefinite" additive="sum"/>
          </g>
          <!-- 漂浮的衣服 -->
          <g>
            <path d="M-10 0 L-14 10 L14 10 L10 0 Q5 -6 -5 -6 Z" fill="#FF7B6B" stroke="#1B3A40" stroke-width="1.6"/>
            <animateTransform attributeName="transform" type="translate" values="690,300; 706,306; 690,300" dur="3.4s" repeatCount="indefinite"/>
            <animateTransform attributeName="transform" type="rotate" values="-12;12;-12" dur="3.4s" repeatCount="indefinite" additive="sum"/>
          </g>
          <!-- 漂浮的草帽 -->
          <g>
            <path d="M-18 0 L18 0 L14 -4 L-14 -4 Z" fill="#D8A85A" stroke="#1B3A40" stroke-width="1.6"/>
            <ellipse cx="0" cy="-4" rx="8" ry="5" fill="#D8A85A" stroke="#1B3A40" stroke-width="1.6"/>
            <animateTransform attributeName="transform" type="translate" values="200,295; 216,300; 200,295" dur="3.2s" repeatCount="indefinite"/>
          </g>
          <!-- 摊主 2（右后景，挥手呼救） -->
          <g transform="translate(680,320)">
            <ellipse cx="0" cy="20" rx="14" ry="3" fill="#000" opacity=".2"/>
            <rect x="-10" y="-10" width="20" height="28" fill="#3D7C9C" stroke="#1B3A40" stroke-width="1.6" rx="3"/>
            <circle cx="0" cy="-22" r="10" fill="#FFD9BF" stroke="#1B3A40" stroke-width="1.6"/>
            <path d="M-9 -28 q9 -8 18 0" fill="#3A2418" stroke="#1B3A40" stroke-width="1.4"/>
            <circle cx="-3" cy="-22" r="1" fill="#1B3A40"/><circle cx="3" cy="-22" r="1" fill="#1B3A40"/>
            <path d="M-3 -18 q3 -2 6 0" stroke="#1B3A40" stroke-width="1.2" fill="none"/>
            <!-- 挥手 -->
            <line x1="-8" y1="-5" x2="-18" y2="-22" stroke="#1B3A40" stroke-width="3" stroke-linecap="round"/>
            <line x1="8" y1="-5" x2="20" y2="-26" stroke="#1B3A40" stroke-width="3" stroke-linecap="round">
              <animate attributeName="x2" values="20;14;20" dur=".6s" repeatCount="indefinite"/>
              <animate attributeName="y2" values="-26;-32;-26" dur=".6s" repeatCount="indefinite"/>
            </line>
            <!-- 救命气泡 -->
            <g transform="translate(28,-32)">
              <ellipse cx="0" cy="0" rx="20" ry="10" fill="#fff" stroke="#1B3A40" stroke-width="1.6"/>
              <text x="0" y="4" font-size="11" font-weight="900" text-anchor="middle" fill="#C0392B">救命！</text>
              <animateTransform attributeName="transform" type="scale" values="1; 1.12; 1" dur="1s" repeatCount="indefinite" additive="sum"/>
              <animateTransform attributeName="transform" type="translate" values="28,-32" dur="1s" repeatCount="indefinite"/>
            </g>
          </g>
        </svg>

        <!-- 帧 4：镇长 + 云博士 -->
        <svg v-else-if="current.id === 'mayor'" class="scene" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="t4-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#BDE9FF"/><stop offset="1" stop-color="#E8F8FF"/>
            </linearGradient>
          </defs>
          <rect width="800" height="400" fill="url(#t4-sky)"/>
          <!-- 草地 -->
          <path d="M-20 290 Q400 270 820 286 L820 400 L-20 400 Z" fill="#9FD480"/>
          <!-- 镇政府（背景） -->
          <g transform="translate(400,210)">
            <rect x="-90" y="0" width="180" height="80" fill="#FFF3D8" stroke="#2A4A50" stroke-width="2.5"/>
            <path d="M-100 0 L0 -56 L100 0 Z" fill="#D8564A" stroke="#2A4A50" stroke-width="2.5"/>
            <rect x="-12" y="36" width="24" height="44" fill="#8A5A38" stroke="#2A4A50" stroke-width="2"/>
            <rect x="-60" y="20" width="22" height="22" fill="#BCE6F2" stroke="#2A4A50" stroke-width="1.8"/>
            <rect x="38" y="20" width="22" height="22" fill="#BCE6F2" stroke="#2A4A50" stroke-width="1.8"/>
          </g>
          <!-- 镇长（左） -->
          <g transform="translate(220,300)">
            <ellipse cx="0" cy="40" rx="34" ry="6" fill="#000" opacity=".15"/>
            <rect x="-22" y="-20" width="44" height="50" fill="#7A5836" stroke="#1B3A40" stroke-width="2" rx="6"/>
            <circle cx="0" cy="-36" r="20" fill="#FFD9BF" stroke="#1B3A40" stroke-width="2"/>
            <path d="M-18 -42 q18 -16 36 0" fill="#5C3A20" stroke="#1B3A40" stroke-width="1.8"/>
            <circle cx="-7" cy="-34" r="2" fill="#1B3A40"/><circle cx="7" cy="-34" r="2" fill="#1B3A40"/>
            <path d="M-6 -25 q6 5 12 0" stroke="#1B3A40" stroke-width="1.6" fill="none" stroke-linecap="round"/>
            <rect x="-20" y="-10" width="14" height="22" fill="#FFCF3F" stroke="#1B3A40" stroke-width="1.5"/>
            <animateTransform attributeName="transform" type="translate" values="220,300; 220,294; 220,300" dur="2.2s" repeatCount="indefinite"/>
          </g>
          <!-- 云博士（右） -->
          <g transform="translate(580,300)">
            <ellipse cx="0" cy="40" rx="34" ry="6" fill="#000" opacity=".15"/>
            <rect x="-26" y="-15" width="52" height="48" fill="#fff" stroke="#1B3A40" stroke-width="2" rx="8"/>
            <circle cx="-26" cy="-40" r="14" fill="#F4FBFA" stroke="#1B3A40" stroke-width="2.5"/>
            <circle cx="26" cy="-40" r="14" fill="#F4FBFA" stroke="#1B3A40" stroke-width="2.5"/>
            <circle cx="0" cy="-48" r="20" fill="#F4FBFA" stroke="#1B3A40" stroke-width="2.5"/>
            <rect x="-26" y="-40" width="52" height="22" rx="11" fill="#F4FBFA"/>
            <g transform="translate(0,-58)"><path d="M-22 -2 L0 -16 L22 -2 L0 8 Z" fill="#17555B" stroke="#1B3A40" stroke-width="2"/></g>
            <circle cx="-10" cy="-42" r="6" fill="rgba(178,228,255,.6)" stroke="#1B3A40" stroke-width="2"/>
            <circle cx="10" cy="-42" r="6" fill="rgba(178,228,255,.6)" stroke="#1B3A40" stroke-width="2"/>
            <circle cx="-10" cy="-42" r="2" fill="#1B3A40"/><circle cx="10" cy="-42" r="2" fill="#1B3A40"/>
            <ellipse cx="0" cy="-32" rx="5" ry="3" fill="#C0392B" stroke="#1B3A40" stroke-width="1.5"/>
            <animateTransform attributeName="transform" type="translate" values="580,294; 580,300; 580,294" dur="2.4s" repeatCount="indefinite"/>
          </g>
          <!-- 对话气泡 -->
          <g transform="translate(400,140)">
            <ellipse cx="0" cy="0" rx="80" ry="32" fill="#fff" stroke="#1B3A40" stroke-width="2.5"/>
            <path d="M-20 28 L-10 50 L0 28 Z" fill="#fff" stroke="#1B3A40" stroke-width="2.5"/>
            <text x="0" y="6" font-size="22" text-anchor="middle" fill="#1B3A40" font-weight="900">用 AI 帮你！</text>
            <animateTransform attributeName="transform" type="translate" values="400,140; 400,134; 400,140" dur="2s" repeatCount="indefinite"/>
          </g>
        </svg>

        <!-- 帧 5：收集数据 -->
        <svg v-else-if="current.id === 'collect'" class="scene" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="t5-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#E8F4FF"/><stop offset="1" stop-color="#FFFEF6"/>
            </linearGradient>
          </defs>
          <rect width="800" height="400" fill="url(#t5-bg)"/>
          <!-- 草地 -->
          <path d="M-20 320 Q400 308 820 320 L820 400 L-20 400 Z" fill="#9FD480" opacity=".5"/>

          <!-- 左上：降雨量数据源（云+量杯） -->
          <g transform="translate(140,90)">
            <rect x="-58" y="-30" width="116" height="120" fill="#fff" stroke="#1B3A40" stroke-width="2.4" rx="10"/>
            <text x="0" y="-14" font-size="12" font-weight="900" text-anchor="middle" fill="#1B3A40">📊 降雨量</text>
            <!-- 云 -->
            <g transform="translate(0,16)">
              <ellipse cx="0" cy="0" rx="22" ry="8" fill="#4FC3DC"/>
              <circle cx="-12" cy="-4" r="9" fill="#4FC3DC"/>
              <circle cx="10" cy="-6" r="11" fill="#4FC3DC"/>
              <!-- 雨滴 -->
              <line v-for="i in 5" :key="i" :x1="-15+i*6" y1="8" :x2="-16+i*6" y2="18" stroke="#4FC3DC" stroke-width="2">
                <animate attributeName="y1" values="6;12" :dur="`${0.5+i*0.1}s`" repeatCount="indefinite"/>
                <animate attributeName="y2" values="16;22" :dur="`${0.5+i*0.1}s`" repeatCount="indefinite"/>
              </line>
            </g>
            <!-- 量杯 -->
            <g transform="translate(0,52)">
              <rect x="-12" y="-2" width="24" height="22" fill="none" stroke="#1B3A40" stroke-width="2"/>
              <rect x="-10" y="8" width="20" height="12" fill="#4FC3DC"/>
              <text x="20" y="14" font-size="10" font-weight="900" fill="#1B3A40">32mm</text>
            </g>
            <animateTransform attributeName="transform" type="translate" values="140,90; 140,86; 140,90" dur="2.2s" repeatCount="indefinite"/>
          </g>

          <!-- 右上：水位计 -->
          <g transform="translate(660,90)">
            <rect x="-58" y="-30" width="116" height="120" fill="#fff" stroke="#1B3A40" stroke-width="2.4" rx="10"/>
            <text x="0" y="-14" font-size="12" font-weight="900" text-anchor="middle" fill="#1B3A40">📏 河水位</text>
            <!-- 河 + 标尺 -->
            <rect x="-30" y="0" width="60" height="80" fill="#BDE9FF" stroke="#1B3A40" stroke-width="1.6"/>
            <rect x="-30" y="40" width="60" height="40" fill="#4FC3DC">
              <animate attributeName="y" values="40;30;40" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="height" values="40;50;40" dur="2s" repeatCount="indefinite"/>
            </rect>
            <rect x="14" y="0" width="6" height="80" fill="#fff" stroke="#1B3A40" stroke-width="1.4"/>
            <line v-for="i in 5" :key="i" x1="14" :y1="i*16" x2="20" :y2="i*16" stroke="#1B3A40" stroke-width="1"/>
            <text x="36" y="46" font-size="10" font-weight="900" fill="#1B3A40">4.2m</text>
            <animateTransform attributeName="transform" type="translate" values="660,90; 660,86; 660,90" dur="2.4s" repeatCount="indefinite"/>
          </g>

          <!-- 左下：上游放水（水库闸门） -->
          <g transform="translate(140,260)">
            <rect x="-58" y="-30" width="116" height="100" fill="#fff" stroke="#1B3A40" stroke-width="2.4" rx="10"/>
            <text x="0" y="-14" font-size="12" font-weight="900" text-anchor="middle" fill="#1B3A40">🚧 上游放水</text>
            <!-- 大坝 -->
            <path d="M-40 0 L-40 50 L40 50 L40 0 L20 0 L20 30 L-20 30 L-20 0 Z" fill="#9AA6B4" stroke="#1B3A40" stroke-width="2"/>
            <rect x="-20" y="0" width="40" height="30" fill="#000" opacity=".15"/>
            <!-- 喷出的水流 -->
            <path d="M-20 30 q-6 8 -10 24" stroke="#4FC3DC" stroke-width="3" fill="none">
              <animate attributeName="stroke-dasharray" values="0 40; 40 0" dur="1s" repeatCount="indefinite"/>
            </path>
            <path d="M20 30 q6 8 10 24" stroke="#4FC3DC" stroke-width="3" fill="none">
              <animate attributeName="stroke-dasharray" values="0 40; 40 0" dur="1s" repeatCount="indefinite"/>
            </path>
            <text x="0" y="68" font-size="10" font-weight="900" text-anchor="middle" fill="#1B3A40">是 / 否</text>
            <animateTransform attributeName="transform" type="translate" values="140,260; 140,256; 140,260" dur="2s" repeatCount="indefinite"/>
          </g>

          <!-- 右下：地形海拔 -->
          <g transform="translate(660,260)">
            <rect x="-58" y="-30" width="116" height="100" fill="#fff" stroke="#1B3A40" stroke-width="2.4" rx="10"/>
            <text x="0" y="-14" font-size="12" font-weight="900" text-anchor="middle" fill="#1B3A40">⛰️ 地形海拔</text>
            <!-- 等高线山 -->
            <path d="M-44 50 Q-20 0 0 0 Q20 0 44 50 Z" fill="#FFCF3F" stroke="#1B3A40" stroke-width="2"/>
            <path d="M-30 50 Q-12 10 0 10 Q12 10 30 50" fill="none" stroke="#B97E00" stroke-width="1.4"/>
            <path d="M-20 50 Q-8 24 0 24 Q8 24 20 50" fill="none" stroke="#B97E00" stroke-width="1.4"/>
            <animateTransform attributeName="transform" type="translate" values="660,260; 660,256; 660,260" dur="2.4s" repeatCount="indefinite"/>
          </g>

          <!-- 中央：背包 + AI 学习中 -->
          <g>
            <ellipse cx="0" cy="60" rx="70" ry="9" fill="#000" opacity=".15"/>
            <path d="M-44 -8 L-44 70 Q-44 80 -34 80 L34 80 Q44 80 44 70 L44 -8 Z" fill="#C9935C" stroke="#1B3A40" stroke-width="3"/>
            <path d="M-26 -8 Q-26 -36 0 -36 Q26 -36 26 -8" fill="none" stroke="#1B3A40" stroke-width="3"/>
            <rect x="-26" y="26" width="52" height="18" fill="#A06F47" stroke="#1B3A40" stroke-width="2"/>
            <circle cx="-14" cy="35" r="2" fill="#1B3A40"/><circle cx="14" cy="35" r="2" fill="#1B3A40"/>
            <text x="0" y="10" font-size="22" font-weight="900" text-anchor="middle" fill="#fff">AI</text>
            <animateTransform attributeName="transform" type="translate" values="400,220; 400,214; 400,220" dur="2s" repeatCount="indefinite"/>
          </g>

          <!-- 数据流向 AI 背包的发光路径 -->
          <g fill="none" stroke="#52C474" stroke-width="2.4" opacity=".6">
            <path d="M180 130 Q280 180 360 220" stroke-dasharray="6 4">
              <animate attributeName="stroke-dashoffset" values="0;-30" dur="1.4s" repeatCount="indefinite"/>
            </path>
            <path d="M620 130 Q520 180 440 220" stroke-dasharray="6 4">
              <animate attributeName="stroke-dashoffset" values="0;-30" dur="1.4s" repeatCount="indefinite"/>
            </path>
            <path d="M180 290 Q280 260 360 240" stroke-dasharray="6 4">
              <animate attributeName="stroke-dashoffset" values="0;-30" dur="1.4s" repeatCount="indefinite"/>
            </path>
            <path d="M620 290 Q520 260 440 240" stroke-dasharray="6 4">
              <animate attributeName="stroke-dashoffset" values="0;-30" dur="1.4s" repeatCount="indefinite"/>
            </path>
          </g>

          <!-- 干扰项（被叉）：糖葫芦销量、膝盖、做梦 -->
          <g transform="translate(290,310)">
            <rect x="-46" y="-18" width="92" height="36" fill="#FFE0E6" stroke="#1B3A40" stroke-width="2" rx="8"/>
            <text x="-32" y="6" font-size="20" text-anchor="middle">🍡</text>
            <text x="14" y="0" font-size="10" font-weight="900" text-anchor="middle" fill="#1B3A40">糖葫芦销量</text>
            <text x="14" y="14" font-size="9" fill="#C0392B" text-anchor="middle">和洪水无关</text>
            <line x1="-46" y1="-18" x2="46" y2="18" stroke="#E2574C" stroke-width="4"/>
            <animateTransform attributeName="transform" type="rotate" values="-3 290 310; 3 290 310; -3 290 310" dur="1.2s" repeatCount="indefinite"/>
          </g>
          <g transform="translate(510,310)">
            <rect x="-46" y="-18" width="92" height="36" fill="#FFE4D1" stroke="#1B3A40" stroke-width="2" rx="8"/>
            <text x="-32" y="6" font-size="20" text-anchor="middle">🦵</text>
            <text x="14" y="0" font-size="10" font-weight="900" text-anchor="middle" fill="#1B3A40">膝盖疼</text>
            <text x="14" y="14" font-size="9" fill="#C0392B" text-anchor="middle">说不准</text>
            <line x1="-46" y1="-18" x2="46" y2="18" stroke="#E2574C" stroke-width="4"/>
            <animateTransform attributeName="transform" type="rotate" values="3 510 310; -3 510 310; 3 510 310" dur="1.3s" repeatCount="indefinite"/>
          </g>
        </svg>

        <!-- 帧 6：清洗数据 -->
        <svg v-else-if="current.id === 'clean'" class="scene" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
          <rect width="800" height="400" fill="#F0FDFA"/>
          <!-- 数据表 -->
          <g transform="translate(180,80)">
            <rect width="440" height="240" fill="#fff" stroke="#1B3A40" stroke-width="3" rx="10"/>
            <rect width="440" height="36" fill="#4FC3DC" rx="10"/>
            <rect y="26" width="440" height="10" fill="#4FC3DC"/>
            <text x="60" y="24" font-size="14" font-weight="900" fill="#fff">日期</text>
            <text x="200" y="24" font-size="14" font-weight="900" fill="#fff">降雨</text>
            <text x="320" y="24" font-size="14" font-weight="900" fill="#fff">水位</text>
            <!-- 行 -->
            <g v-for="(row, i) in [
              { d: '8月2日', r: '10',  l: '2.9', ok: true },
              { d: '8月4日', r: '',    l: '4.0', ok: false },
              { d: '8月5日', r: '600', l: '4.7', ok: false },
              { d: '8月8日', r: '-12', l: '3.8', ok: false },
              { d: '8月9日', r: '25',  l: '3.5', ok: true }
            ]" :key="i" :transform="`translate(0, ${48 + i*36})`">
              <rect width="440" height="32" :fill="row.ok ? 'transparent' : '#FFE9E5'"/>
              <text x="60" y="22" font-size="13" font-weight="700" fill="#1B3A40">{{ row.d }}</text>
              <text x="200" y="22" font-size="13" font-weight="900" :fill="row.ok ? '#1B3A40' : '#C0392B'">{{ row.r || '（空）' }}</text>
              <text x="320" y="22" font-size="13" font-weight="900" fill="#1B3A40">{{ row.l }}</text>
              <g v-if="!row.ok" :transform="`translate(400, 16)`" class="x-mark">
                <circle r="14" fill="#FF7B6B" stroke="#1B3A40" stroke-width="2"/>
                <line x1="-7" y1="-7" x2="7" y2="7" stroke="#fff" stroke-width="3"/>
                <line x1="7" y1="-7" x2="-7" y2="7" stroke="#fff" stroke-width="3"/>
              </g>
            </g>
          </g>
          <!-- 扫帚扫过 -->
          <g class="broom" transform="translate(50,200)">
            <line x1="0" y1="0" x2="40" y2="-50" stroke="#8A5A38" stroke-width="6" stroke-linecap="round"/>
            <path d="M-15 10 L15 10 L25 35 L-25 35 Z" fill="#FFCF3F" stroke="#1B3A40" stroke-width="2"/>
            <line x1="-15" y1="15" x2="-20" y2="35" stroke="#1B3A40" stroke-width="1.5"/>
            <line x1="0" y1="15" x2="0" y2="38" stroke="#1B3A40" stroke-width="1.5"/>
            <line x1="15" y1="15" x2="20" y2="35" stroke="#1B3A40" stroke-width="1.5"/>
          </g>
          <!-- 闪光 -->
          <g class="sparkle"><text x="650" y="100" font-size="32">✨</text><text x="120" y="350" font-size="28">✨</text></g>
        </svg>

        <!-- 帧 7：训练模型 神经网络 + 80/20 切分 -->
        <svg v-else-if="current.id === 'train'" class="scene" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
          <rect width="800" height="400" fill="#FFF1F5"/>
          <!-- 标题：训练集 + 测试集 -->
          <g transform="translate(400,32)">
            <rect x="-180" y="-18" width="360" height="32" fill="#fff" stroke="#1B3A40" stroke-width="2" rx="8"/>
            <text x="0" y="4" font-size="14" font-weight="900" text-anchor="middle" fill="#1B3A40">数据分两份：80% 给 AI 学，20% 藏起来考它</text>
          </g>
          <!-- 数据切分条 -->
          <g transform="translate(80,70)">
            <rect width="240" height="22" fill="#52C474" stroke="#1B3A40" stroke-width="2" rx="4"/>
            <text x="120" y="16" font-size="12" font-weight="900" text-anchor="middle" fill="#fff">训练集 80%</text>
            <rect x="240" width="60" height="22" fill="#FF9F1C" stroke="#1B3A40" stroke-width="2" rx="4"/>
            <text x="270" y="16" font-size="11" font-weight="900" text-anchor="middle" fill="#fff">考题 20%</text>
          </g>
          <!-- 训练数据小方块（飞向网络） -->
          <g>
            <rect width="14" height="14" fill="#52C474" stroke="#1B3A40" stroke-width="1.4" rx="2"/>
            <animateTransform attributeName="transform" type="translate" values="100,98; 220,180; 100,98" dur="3s" repeatCount="indefinite"/>
          </g>
          <g>
            <rect width="14" height="14" fill="#52C474" stroke="#1B3A40" stroke-width="1.4" rx="2"/>
            <animateTransform attributeName="transform" type="translate" values="160,98; 220,240; 160,98" dur="3.4s" repeatCount="indefinite"/>
          </g>
          <g>
            <rect width="14" height="14" fill="#52C474" stroke="#1B3A40" stroke-width="1.4" rx="2"/>
            <animateTransform attributeName="transform" type="translate" values="220,98; 220,300; 220,98" dur="3.8s" repeatCount="indefinite"/>
          </g>
          <!-- 数据从左输入（三个特征） -->
          <g transform="translate(80,150)"><rect width="60" height="28" fill="#DCEEFF" stroke="#1B3A40" stroke-width="2" rx="6"/><text x="30" y="19" font-size="12" font-weight="900" text-anchor="middle">雨量</text></g>
          <g transform="translate(80,220)"><rect width="60" height="28" fill="#FFF3C9" stroke="#1B3A40" stroke-width="2" rx="6"/><text x="30" y="19" font-size="12" font-weight="900" text-anchor="middle">水位</text></g>
          <g transform="translate(80,290)"><rect width="60" height="28" fill="#D7F2F7" stroke="#1B3A40" stroke-width="2" rx="6"/><text x="30" y="19" font-size="12" font-weight="900" text-anchor="middle">放水</text></g>
          <!-- 神经元 -->
          <g class="layer-1">
            <circle cx="260" cy="140" r="20" fill="#fff" stroke="#1B3A40" stroke-width="2.4">
              <animate attributeName="r" values="20;24;20" dur="1.4s" repeatCount="indefinite"/>
              <animate attributeName="fill" values="#fff;#FFE4D1;#fff" dur="1.4s" repeatCount="indefinite"/>
            </circle>
            <circle cx="260" cy="200" r="20" fill="#fff" stroke="#1B3A40" stroke-width="2.4">
              <animate attributeName="r" values="20;24;20" dur="1.4s" begin=".2s" repeatCount="indefinite"/>
              <animate attributeName="fill" values="#fff;#FFE4D1;#fff" dur="1.4s" begin=".2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="260" cy="260" r="20" fill="#fff" stroke="#1B3A40" stroke-width="2.4">
              <animate attributeName="r" values="20;24;20" dur="1.4s" begin=".4s" repeatCount="indefinite"/>
              <animate attributeName="fill" values="#fff;#FFE4D1;#fff" dur="1.4s" begin=".4s" repeatCount="indefinite"/>
            </circle>
            <circle cx="260" cy="320" r="20" fill="#fff" stroke="#1B3A40" stroke-width="2.4">
              <animate attributeName="r" values="20;24;20" dur="1.4s" begin=".6s" repeatCount="indefinite"/>
              <animate attributeName="fill" values="#fff;#FFE4D1;#fff" dur="1.4s" begin=".6s" repeatCount="indefinite"/>
            </circle>
          </g>
          <g class="layer-2">
            <circle cx="420" cy="180" r="20" fill="#fff" stroke="#1B3A40" stroke-width="2.4">
              <animate attributeName="r" values="20;24;20" dur="1.4s" begin=".3s" repeatCount="indefinite"/>
              <animate attributeName="fill" values="#fff;#FFE4D1;#fff" dur="1.4s" begin=".3s" repeatCount="indefinite"/>
            </circle>
            <circle cx="420" cy="240" r="20" fill="#fff" stroke="#1B3A40" stroke-width="2.4">
              <animate attributeName="r" values="20;24;20" dur="1.4s" begin=".5s" repeatCount="indefinite"/>
              <animate attributeName="fill" values="#fff;#FFE4D1;#fff" dur="1.4s" begin=".5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="420" cy="300" r="20" fill="#fff" stroke="#1B3A40" stroke-width="2.4">
              <animate attributeName="r" values="20;24;20" dur="1.4s" begin=".7s" repeatCount="indefinite"/>
              <animate attributeName="fill" values="#fff;#FFE4D1;#fff" dur="1.4s" begin=".7s" repeatCount="indefinite"/>
            </circle>
          </g>
          <g class="layer-3">
            <circle cx="570" cy="240" r="26" fill="#FFD23F" stroke="#1B3A40" stroke-width="3">
              <animate attributeName="r" values="26;30;26" dur="1.2s" repeatCount="indefinite"/>
            </circle>
            <text x="570" y="244" font-size="11" font-weight="900" text-anchor="middle">预测</text>
          </g>
          <!-- 连线 -->
          <g stroke="#B388FF" stroke-width="1.4" opacity=".55" stroke-dasharray="4 4">
            <line v-for="(_, i) in 12" :key="i"
                  :x1="140" :y1="164 + (i%3)*70"
                  :x2="240" :y2="140 + Math.floor(i/3)*60"/>
            <line v-for="(_, j) in 12" :key="'a'+j"
                  :x1="280" :y1="140 + Math.floor(j/3)*60"
                  :x2="400" :y2="180 + (j%3)*60"/>
            <line v-for="(_, k) in 3" :key="'b'+k"
                  :x1="440" :y1="180 + k*60"
                  :x2="544" :y2="240"/>
            <animate attributeName="opacity" values=".3;.8;.3" dur="1.4s" repeatCount="indefinite"/>
          </g>
          <!-- 考题箱子（20% 测试集出题） -->
          <g transform="translate(700,140)">
            <rect x="-40" y="-30" width="80" height="80" fill="#FF9F1C" stroke="#1B3A40" stroke-width="2.4" rx="6"/>
            <text x="0" y="-10" font-size="11" font-weight="900" text-anchor="middle" fill="#fff">考题</text>
            <text x="0" y="6" font-size="22" font-weight="900" text-anchor="middle" fill="#fff">📋</text>
            <text x="0" y="32" font-size="9" font-weight="900" text-anchor="middle" fill="#fff">没见过</text>
            <text x="0" y="42" font-size="9" font-weight="900" text-anchor="middle" fill="#fff">的题目</text>
          </g>
          <!-- 考题箭头指向预测圆 -->
          <path d="M660 200 q-40 30 -64 38" stroke="#FF9F1C" stroke-width="2.4" fill="none" stroke-dasharray="6 4">
            <animate attributeName="stroke-dashoffset" values="0;-30" dur="1.4s" repeatCount="indefinite"/>
          </path>
          <polygon points="600,236 612,240 598,246" fill="#FF9F1C" stroke="#1B3A40" stroke-width="1.2"/>
          <!-- 分数 -->
          <g transform="translate(700,300)">
            <rect x="-46" y="-22" width="92" height="50" fill="#52C474" stroke="#1B3A40" stroke-width="2.4" rx="8"/>
            <text x="0" y="-2" font-size="11" font-weight="900" text-anchor="middle" fill="#fff">考试通过</text>
            <text x="0" y="20" font-size="22" font-weight="900" text-anchor="middle" fill="#fff">87 ✓</text>
            <animateTransform attributeName="transform" type="scale" values="1; 1.08; 1" dur="1.4s" repeatCount="indefinite" additive="sum"/>
            <animateTransform attributeName="transform" type="translate" values="700,300" dur="1.4s" repeatCount="indefinite"/>
          </g>
        </svg>

        <!-- 帧 8：决策 -->
        <svg v-else-if="current.id === 'decide'" class="scene" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="t8-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#FFD194"/><stop offset="1" stop-color="#FFE5C7"/>
            </linearGradient>
          </defs>
          <rect width="800" height="400" fill="url(#t8-bg)"/>
          <!-- 概率仪表盘 -->
          <g transform="translate(400,210)">
            <circle r="100" fill="#fff" stroke="#1B3A40" stroke-width="3"/>
            <path d="M-90 0 A 90 90 0 0 1 90 0" fill="none" stroke="#52C474" stroke-width="14"/>
            <!-- 87% 角度 -->
            <path class="gauge-arc" d="M-90 0 A 90 90 0 0 1 64 -63" fill="none" stroke="#E2574C" stroke-width="14"/>
            <text y="-12" font-size="44" font-weight="900" text-anchor="middle" fill="#E2574C">87%</text>
            <text y="20" font-size="14" font-weight="900" text-anchor="middle" fill="#1B3A40">AI 预测洪水概率</text>
          </g>
          <!-- 左：玩家 -->
          <g transform="translate(150,300)">
            <ellipse cx="0" cy="40" rx="32" ry="6" fill="#000" opacity=".15"/>
            <rect x="-22" y="-20" width="44" height="50" fill="#4FC3DC" stroke="#1B3A40" stroke-width="2" rx="6"/>
            <circle cx="0" cy="-36" r="20" fill="#FFD9BF" stroke="#1B3A40" stroke-width="2"/>
            <circle cx="-7" cy="-34" r="2" fill="#1B3A40"/><circle cx="7" cy="-34" r="2" fill="#1B3A40"/>
            <path d="M-6 -25 q6 4 12 0" stroke="#1B3A40" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            <path d="M-18 -42 q18 -12 36 0" fill="#3A2418" stroke="#1B3A40" stroke-width="1.8"/>
            <text x="0" y="-60" font-size="18" text-anchor="middle">🤔</text>
            <animateTransform attributeName="transform" type="translate" values="150,300; 150,294; 150,300" dur="2.2s" repeatCount="indefinite"/>
          </g>
          <!-- 两个按钮 -->
          <g transform="translate(620,260)">
            <rect x="-50" y="-20" width="100" height="40" rx="20" fill="#FF7B6B" stroke="#1B3A40" stroke-width="3"/>
            <text y="6" font-size="14" font-weight="900" text-anchor="middle" fill="#fff">🚨 发预警</text>
            <animateTransform attributeName="transform" type="scale" values="1; 1.06; 1" dur="2s" repeatCount="indefinite" additive="sum"/>
            <animateTransform attributeName="transform" type="translate" values="620,260" dur="2s" repeatCount="indefinite"/>
          </g>
          <g transform="translate(620,330)">
            <rect x="-50" y="-20" width="100" height="40" rx="20" fill="#9FE0F0" stroke="#1B3A40" stroke-width="3"/>
            <text y="6" font-size="14" font-weight="900" text-anchor="middle" fill="#1B3A40">🕊️ 不发</text>
            <animateTransform attributeName="transform" type="scale" values="1.06; 1; 1.06" dur="2s" repeatCount="indefinite" additive="sum"/>
            <animateTransform attributeName="transform" type="translate" values="620,330" dur="2s" repeatCount="indefinite"/>
          </g>
          <text x="400" y="380" font-size="14" font-weight="900" text-anchor="middle" fill="#1B3A40">最终决定权在你 👤
            <animate attributeName="opacity" values=".7; 1; .7" dur="1.5s" repeatCount="indefinite"/>
          </text>
        </svg>

        <!-- 文字解说卡 -->
        <div class="caption">
          <h2>{{ current.title }}</h2>
          <p v-html="current.text"></p>
        </div>
      </div>
    </Transition>

    <!-- 底部控制 -->
    <div class="bottom-bar">
      <button class="ctrl" :disabled="idx === 0" @click="goPrev">← 上一段</button>
      <span class="frame-num">{{ idx + 1 }} / {{ FRAMES.length }}</span>
      <button class="ctrl primary" @click="goNext">{{ isLast ? '我准备好啦 🚀' : '下一段 →' }}</button>
    </div>
  </div>
</template>

<style scoped>
.cutscene {
  position: relative;
  min-height: calc(100vh - var(--header-h));
  width: 100vw; margin-inline: calc(50% - 50vw);
  display: grid; grid-template-rows: auto auto 1fr auto;
  padding: 8px var(--space-4) var(--space-3);
  background: linear-gradient(180deg, #f8fafc, #fff);
}
.top-bar { display: flex; justify-content: space-between; align-items: center; max-width: 900px; margin: 0 auto 6px; width: 100%; }
.frames { display: flex; gap: 5px; }
.dot { width: 24px; height: 6px; border-radius: 999px; background: #E0E0E0; border: 1.5px solid var(--c-ink); transition: background var(--dur-med); }
.dot.done { background: var(--c-good); }
.dot.on { background: var(--c-sun); transform: scaleY(1.4); }
.skip-btn { font-size: var(--font-sm); font-weight: 900; background: #fff; border: 2px solid var(--c-ink); border-radius: 999px; padding: 4px 14px; box-shadow: 0 2px 0 var(--c-ink); color: var(--c-ink); }
.prog-rail { height: 4px; background: rgba(0,0,0,.08); border-radius: 999px; max-width: 900px; margin: 0 auto 10px; width: 100%; overflow: hidden; }
.prog-fill { height: 100%; background: linear-gradient(90deg, var(--c-candy), var(--c-coral)); border-radius: 999px; transition: width 0.1s linear; }

.stage {
  max-width: 900px; margin: 0 auto; width: 100%;
  display: flex; flex-direction: column; gap: var(--space-2);
  align-items: stretch;
}
.scene {
  width: 100%; aspect-ratio: 2 / 1;
  border: 3px solid var(--c-ink); border-radius: 22px;
  box-shadow: 0 6px 0 var(--c-ink), 0 14px 24px rgba(0,0,0,.12);
  background: #fff;
}
.caption {
  background: #fff; border: 3px solid var(--c-ink); border-radius: 18px;
  padding: var(--space-3) var(--space-4); box-shadow: 0 4px 0 var(--c-ink);
  text-align: center;
}
.caption h2 { font-size: var(--font-2xl); font-weight: 900; margin-bottom: 6px; color: var(--c-ink); line-height: 1.25; }
.caption p { font-size: var(--font-md); line-height: var(--leading-base); color: var(--c-ink); font-weight: 600; max-width: 660px; margin: 0 auto; }
.caption :deep(b) { color: var(--c-water-d); background: linear-gradient(180deg, transparent 70%, rgba(255,210,63,.6) 70%); padding: 0 3px; }

.bottom-bar { display: flex; justify-content: space-between; align-items: center; max-width: 900px; margin: 0 auto; width: 100%; padding-top: var(--space-2); }
.ctrl { font-size: var(--font-md); font-weight: 900; background: #fff; border: 2.5px solid var(--c-ink); border-radius: 999px; padding: var(--space-2) var(--space-4); color: var(--c-ink); box-shadow: 0 3px 0 var(--c-ink); }
.ctrl:disabled { opacity: .4; cursor: not-allowed; }
.ctrl.primary { background: linear-gradient(180deg, #FFD964, #FFB30F); font-size: var(--font-lg); padding: var(--space-2) var(--space-5); box-shadow: 0 4px 0 #B97E00; }
.frame-num { font-size: var(--font-xs); font-weight: 900; color: var(--c-ink); background: #fff; border: 2px solid var(--c-ink); border-radius: 999px; padding: 3px 12px; box-shadow: 0 2px 0 var(--c-ink); }

.frame-enter-active, .frame-leave-active { transition: opacity var(--dur-med), transform var(--dur-med); }
.frame-enter-from { opacity: 0; transform: translateX(40px); }
.frame-leave-to { opacity: 0; transform: translateX(-40px); }

/* ===== 帧 1 动画 ===== */
.sun-rays { animation: spin 14s linear infinite; transform-origin: center; }
.cloud-l { transform: translate(140px, 70px); animation: floatLR 12s ease-in-out infinite; }
.cloud-r { transform: translate(580px, 95px); animation: floatLR 14s ease-in-out infinite reverse; }
.boat { animation: boatRock 3s ease-in-out infinite; transform-origin: 180px 360px; }
.duck { animation: floatLR 5s ease-in-out infinite; }
.waves path { animation: wavePulse 2s ease-in-out infinite; }
.banner { animation: bannerSway 3s ease-in-out infinite; transform-origin: 360px 200px; }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes floatLR { 0%,100% { transform: translateX(0); } 50% { transform: translateX(40px); } }
@keyframes boatRock { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
@keyframes wavePulse { 0%,100% { opacity: .4; } 50% { opacity: 1; } }
@keyframes bannerSway { 0%,100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }

/* ===== 帧 2 动画 ===== */
.storm-clouds { animation: cloudShake 1.4s ease-in-out infinite; transform-origin: center; }
.lightning { animation: flash 2.4s ease-in-out infinite; transform-origin: 390px 195px; }
.rain line { animation: rainDrop 0.7s linear infinite; }
.rain line:nth-child(odd)  { animation-duration: 0.5s; }
.rain line:nth-child(3n)   { animation-duration: 0.9s; }
.river-rise { animation: riseWater 4s ease-in-out infinite alternate; }
@keyframes cloudShake { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
@keyframes flash { 0%,40%,60%,100% { opacity: 0; } 45%,55% { opacity: 1; } }
@keyframes rainDrop { 0% { transform: translateY(0); opacity: .7; } 100% { transform: translateY(180px); opacity: 0; } }
@keyframes riseWater { 0% { transform: translateY(20px); } 100% { transform: translateY(-10px); } }

/* ===== 帧 3 动画 ===== */
.cloud-l { /* 复用 */ }
.flood-water { animation: floodSurge 3s ease-in-out infinite alternate; }
.float-1 { animation: floatItem 4s ease-in-out infinite; }
.float-2 { animation: floatItem 5s ease-in-out infinite reverse; }
.float-3 { animation: floatItem 4.5s ease-in-out infinite; }
.shake-text { animation: shakeText 0.4s ease-in-out infinite; transform-origin: 400px 180px; }
@keyframes floodSurge { 0% { transform: translateY(8px); } 100% { transform: translateY(-6px); } }
@keyframes floatItem { 0%,100% { transform: translate(0,0) rotate(-5deg); } 50% { transform: translate(8px,-4px) rotate(5deg); } }
@keyframes shakeText { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }

/* ===== 帧 4 动画 ===== */
.char-bob { animation: charBob 2.2s ease-in-out infinite; transform-origin: 220px 340px; }
.char-bob-r { animation: charBob 2.4s ease-in-out infinite reverse; transform-origin: 580px 340px; }
.bubble { animation: bubblePop 2s ease-in-out infinite; transform-origin: 400px 140px; }
@keyframes charBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@keyframes bubblePop { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }

/* ===== 帧 5 动画 ===== */
.bag-bob { animation: bagBob 2s ease-in-out infinite; transform-origin: 400px 320px; }
.data-1 { animation: flyToBag 4s ease-in-out infinite; }
.data-2 { animation: flyToBag2 4.4s ease-in-out infinite; }
.data-3 { animation: flyToBag3 3.6s ease-in-out infinite; }
.data-4 { animation: flyToBag4 4.8s ease-in-out infinite; }
.bad-1, .bad-2 { animation: shakeBad 1.2s ease-in-out infinite; }
@keyframes bagBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes flyToBag { 0%,100% { transform: translate(120px, 80px) scale(1); } 50% { transform: translate(380px, 240px) scale(.6); opacity: .7; } }
@keyframes flyToBag2 { 0%,100% { transform: translate(680px, 90px) scale(1); } 50% { transform: translate(420px, 240px) scale(.6); opacity: .7; } }
@keyframes flyToBag3 { 0%,100% { transform: translate(140px, 300px) scale(1); } 50% { transform: translate(380px, 270px) scale(.6); opacity: .7; } }
@keyframes flyToBag4 { 0%,100% { transform: translate(660px, 310px) scale(1); } 50% { transform: translate(420px, 270px) scale(.6); opacity: .7; } }
@keyframes shakeBad { 0%,100% { transform: rotate(-8deg); } 50% { transform: rotate(8deg); } }

/* ===== 帧 6 动画 ===== */
.broom { animation: sweep 2.8s ease-in-out infinite; transform-origin: 50px 200px; }
.x-mark { animation: xPop 1.2s ease-in-out infinite; transform-origin: center; }
.sparkle text { animation: sparkleBlink 1.4s ease-in-out infinite; }
.sparkle text:nth-child(2) { animation-delay: .7s; }
@keyframes sweep { 0%,100% { transform: translate(0,0) rotate(-15deg); } 50% { transform: translate(640px,0) rotate(15deg); } }
@keyframes xPop { 0%,100% { transform: scale(1); } 50% { transform: scale(1.2); } }
@keyframes sparkleBlink { 0%,100% { opacity: 0; transform: scale(.5); } 50% { opacity: 1; transform: scale(1.2); } }

/* ===== 帧 7 动画 ===== */
.layer-1 circle, .layer-2 circle { animation: nnPulse 1.2s ease-in-out infinite; }
.layer-1 circle:nth-child(2) { animation-delay: .2s; }
.layer-1 circle:nth-child(3) { animation-delay: .4s; }
.layer-2 circle:nth-child(2) { animation-delay: .3s; }
.layer-2 circle:nth-child(3) { animation-delay: .5s; }
.layer-3 circle { animation: nnPulse 1.5s ease-in-out infinite; }
.nn-lines line { animation: lineFlow 2s ease-in-out infinite; stroke-dasharray: 6 4; }
.flow-1 { animation: flowParticle1 2s linear infinite; }
.flow-2 { animation: flowParticle2 2s linear infinite .8s; }
.accuracy { animation: accuracyPop 1.2s ease-in-out infinite; transform-origin: 620px 280px; }
@keyframes nnPulse { 0%,100% { transform: scale(1); fill: #fff; } 50% { transform: scale(1.15); fill: #FFE4D1; } }
@keyframes lineFlow { 0%,100% { opacity: .3; } 50% { opacity: 1; } }
@keyframes flowParticle1 {
  0% { transform: translate(120px, 150px); opacity: 1; }
  50% { transform: translate(440px, 200px); opacity: 1; }
  100% { transform: translate(600px, 210px); opacity: 0; }
}
@keyframes flowParticle2 {
  0% { transform: translate(120px, 280px); opacity: 1; }
  50% { transform: translate(440px, 240px); opacity: 1; }
  100% { transform: translate(600px, 210px); opacity: 0; }
}
@keyframes accuracyPop { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }

/* ===== 帧 8 动画 ===== */
.gauge-arc { animation: arcDraw 2.5s ease-out infinite; transform-origin: 400px 210px; }
.btn-warn { animation: btnPulse 2s ease-in-out infinite; transform-origin: 620px 260px; }
.btn-hold { animation: btnPulse 2s ease-in-out infinite .5s; transform-origin: 620px 330px; }
.resp { animation: respPop 1.5s ease-in-out infinite; transform-origin: 400px 380px; }
@keyframes arcDraw { 0%, 100% { opacity: .85; } 50% { opacity: 1; } }
@keyframes btnPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
@keyframes respPop { 0%,100% { transform: scale(1); opacity: .8; } 50% { transform: scale(1.1); opacity: 1; } }

/* 减弱动画偏好 */
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; }
}

/* 横屏 */
@media (orientation: landscape) and (max-height: 500px) {
  .cutscene { padding: 4px 16px 8px; }
  .scene { aspect-ratio: 2.4 / 1; }
  .caption h2 { font-size: 18px; margin-bottom: 4px; }
  .caption p { font-size: 13px; line-height: 1.5; }
  .ctrl, .ctrl.primary { font-size: 13px; padding: 4px 12px; }
}
</style>

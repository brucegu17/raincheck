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

const FRAME_MS = 10000;
const idx = ref(0);
const progress = ref(0);
let frameTimer: number | null = null;
let progressTimer: number | null = null;

const current = computed(() => FRAMES[idx.value]);
const isLast = computed(() => idx.value === FRAMES.length - 1);

function startFrame() {
  if (frameTimer) clearTimeout(frameTimer);
  if (progressTimer) clearInterval(progressTimer);
  progress.value = 0;
  audio.sfx('whoosh');
  tts.speak(current.value.speak, true);
  const startTime = Date.now();
  progressTimer = window.setInterval(() => {
    progress.value = Math.min(100, (Date.now() - startTime) / FRAME_MS * 100);
  }, 100);
  if (!isLast.value) frameTimer = window.setTimeout(() => goNext(), FRAME_MS);
}
function goNext() { if (isLast.value) { skip(); return; } idx.value++; }
function goPrev() { if (idx.value > 0) idx.value--; }
function skip() {
  if (frameTimer) clearTimeout(frameTimer);
  if (progressTimer) clearInterval(progressTimer);
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

        <!-- 帧 1：晴天小镇 -->
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
          <g transform="translate(660,80)">
            <g>
              <g v-for="n in 8" :key="n" :transform="`rotate(${n*45})`"><rect x="-2" y="-50" width="4" height="20" rx="2" fill="#FFD23F"/></g>
              <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="12s" repeatCount="indefinite"/>
            </g>
            <circle r="28" fill="#FFE27A"/><circle r="22" fill="#FFD23F"/>
          </g>
          <!-- 飘云 -->
          <g transform="translate(140,70)">
            <ellipse cx="0" cy="0" rx="40" ry="14" fill="#fff"/><circle cx="-20" cy="-6" r="14" fill="#fff"/><circle cx="14" cy="-10" r="18" fill="#fff"/>
            <animateTransform attributeName="transform" type="translate" values="100,70; 200,70; 100,70" dur="20s" repeatCount="indefinite"/>
          </g>
          <g transform="translate(580,95)">
            <ellipse cx="0" cy="0" rx="34" ry="12" fill="#fff" opacity=".9"/><circle cx="-16" cy="-5" r="12" fill="#fff" opacity=".9"/><circle cx="12" cy="-8" r="15" fill="#fff" opacity=".9"/>
            <animateTransform attributeName="transform" type="translate" values="620,95; 540,95; 620,95" dur="24s" repeatCount="indefinite"/>
          </g>
          <!-- 远山 -->
          <path d="M-20 240 Q140 180 280 230 Q420 170 560 220 Q700 180 820 230 L820 260 L-20 260 Z" fill="#8CBBA2" opacity=".7"/>
          <!-- 草地 -->
          <path d="M-20 260 Q200 240 400 254 Q620 270 820 248 L820 340 L-20 340 Z" fill="#9FD480"/>
          <!-- 镇子三栋房 -->
          <g transform="translate(220,228)"><rect x="-30" y="0" width="60" height="40" fill="#FFFDF6" stroke="#2A4A50" stroke-width="2"/><path d="M-38 0 L0 -28 L38 0 Z" fill="#E2574C" stroke="#2A4A50" stroke-width="2"/><rect x="-8" y="20" width="16" height="20" fill="#3D7C9C" stroke="#2A4A50" stroke-width="1.5"/></g>
          <g transform="translate(370,222)"><rect x="-35" y="0" width="70" height="46" fill="#FFF3D8" stroke="#2A4A50" stroke-width="2"/><path d="M-42 0 L0 -30 L42 0 Z" fill="#D8564A" stroke="#2A4A50" stroke-width="2"/><rect x="-8" y="22" width="16" height="24" fill="#8A5A38" stroke="#2A4A50" stroke-width="1.5"/></g>
          <g transform="translate(510,230)"><rect x="-26" y="0" width="52" height="38" fill="#FFFDF6" stroke="#2A4A50" stroke-width="2"/><path d="M-34 0 L0 -24 L34 0 Z" fill="#F2A03D" stroke="#2A4A50" stroke-width="2"/></g>
          <!-- 集市彩旗 -->
          <g class="banner" transform="translate(300,200)">
            <path d="M0 0 Q60 -10 120 0" stroke="#6E4527" stroke-width="1.5" fill="none"/>
            <g v-for="(c, i) in ['#FF7B6B','#FFCF3F','#52C474','#4FC3DC']" :key="c" :transform="`translate(${i*30+15}, ${i%2?2:-2})`"><polygon :points="'0,0 5,-12 10,0'" :fill="c"/></g>
          </g>
          <!-- 河 -->
          <path d="M-20 340 Q220 326 420 336 Q620 348 820 332 L820 400 L-20 400 Z" fill="url(#t1-river)"/>
          <!-- 河面波纹 -->
          <g class="waves"><path d="M40 360 q15 -8 30 0 q15 8 30 0" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/><path d="M520 370 q15 -8 30 0 q15 8 30 0" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/></g>
          <!-- 小船（在河面上摇晃） -->
          <g transform="translate(180,360)">
            <g>
              <path d="M-22 0 Q-18 12 0 12 Q18 12 22 0 Z" fill="#8A5A38" stroke="#2A4A50" stroke-width="2"/>
              <rect x="-2" y="-22" width="3" height="22" fill="#8A5A38"/>
              <path d="M2 -22 L18 -14 L2 -10 Z" fill="#FFCF3F" stroke="#2A4A50" stroke-width="1.5"/>
              <animateTransform attributeName="transform" type="rotate" values="-4;4;-4" dur="3s" repeatCount="indefinite"/>
            </g>
          </g>
          <!-- 鸭子（游动） -->
          <g transform="translate(640,358)">
            <ellipse cx="0" cy="0" rx="11" ry="6" fill="#FFE27A" stroke="#2A4A50" stroke-width="1.5"/>
            <circle cx="10" cy="-4" r="5" fill="#FFE27A" stroke="#2A4A50" stroke-width="1.5"/>
            <circle cx="11" cy="-5" r="1" fill="#2A4A50"/>
            <polygon points="13,-3 17,-2 13,-1" fill="#FFA600"/>
            <animateTransform attributeName="transform" type="translate" values="640,358; 580,358; 640,358" dur="8s" repeatCount="indefinite"/>
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

        <!-- 帧 3：洪水来袭 -->
        <svg v-else-if="current.id === 'flood'" class="scene" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="t3-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#4A5A70"/><stop offset="1" stop-color="#9FA8B6"/>
            </linearGradient>
          </defs>
          <rect width="800" height="400" fill="url(#t3-sky)"/>
          <!-- 灰云 -->
          <g class="cloud-l"><ellipse cx="0" cy="0" rx="50" ry="16" fill="#5A6878"/><circle cx="-22" cy="-6" r="16" fill="#5A6878"/><circle cx="20" cy="-10" r="20" fill="#5A6878"/></g>
          <!-- 远山（轮廓） -->
          <path d="M-20 220 Q200 160 400 210 Q600 150 820 200 L820 250 L-20 250 Z" fill="#4A5A70"/>
          <!-- 镇子被水围 -->
          <g transform="translate(280,230)"><rect x="-30" y="0" width="60" height="50" fill="#FFFDF6" stroke="#1B3A40" stroke-width="2.2"/><path d="M-38 0 L0 -30 L38 0 Z" fill="#E2574C" stroke="#1B3A40" stroke-width="2.2"/></g>
          <g transform="translate(420,228)"><rect x="-34" y="0" width="68" height="52" fill="#FFF3D8" stroke="#1B3A40" stroke-width="2.2"/><path d="M-42 0 L0 -30 L42 0 Z" fill="#D8564A" stroke="#1B3A40" stroke-width="2.2"/></g>
          <g transform="translate(540,232)"><rect x="-26" y="0" width="52" height="48" fill="#FFFDF6" stroke="#1B3A40" stroke-width="2.2"/><path d="M-34 0 L0 -26 L34 0 Z" fill="#F2A03D" stroke="#1B3A40" stroke-width="2.2"/></g>
          <!-- 大水位（漫到房子腰部） -->
          <path class="flood-water" d="M-20 290 Q220 282 420 286 Q620 290 820 282 L820 400 L-20 400 Z" fill="#2A9DB5" opacity=".85"/>
          <!-- 漂浮的摊位货物（西瓜/木箱） -->
          <g class="float-1"><circle cx="180" cy="288" r="10" fill="#3FA56F" stroke="#1B3A40" stroke-width="1.5"/><path d="M170 288 q10 -4 20 0" stroke="#1B3A40" stroke-width="1" fill="none"/></g>
          <g class="float-2"><rect x="600" y="280" width="22" height="14" fill="#C9935C" stroke="#1B3A40" stroke-width="1.5"/></g>
          <g class="float-3"><rect x="350" y="288" width="18" height="12" fill="#8A5A38" stroke="#1B3A40" stroke-width="1.5"/></g>
          <!-- 哭脸表情符号 -->
          <text x="400" y="180" font-size="48" text-anchor="middle" class="shake-text">😱</text>
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
          <rect width="800" height="400" fill="#FFFEF6"/>
          <!-- 中央背包 -->
          <g transform="translate(400,260)">
            <ellipse cx="0" cy="58" rx="80" ry="10" fill="#000" opacity=".15"/>
            <path d="M-50 -10 L-50 80 Q-50 90 -40 90 L40 90 Q50 90 50 80 L50 -10 Z" fill="#C9935C" stroke="#1B3A40" stroke-width="3"/>
            <path d="M-30 -10 Q-30 -40 0 -40 Q30 -40 30 -10" fill="none" stroke="#1B3A40" stroke-width="3"/>
            <rect x="-30" y="30" width="60" height="20" fill="#A06F47" stroke="#1B3A40" stroke-width="2"/>
            <text x="0" y="20" font-size="32" text-anchor="middle">🎒</text>
            <animateTransform attributeName="transform" type="translate" values="400,260; 400,254; 400,260" dur="2s" repeatCount="indefinite"/>
          </g>
          <!-- 飞向背包的数据元素 -->
          <g>
            <circle r="32" fill="#DCEEFF" stroke="#1B3A40" stroke-width="2.5"/>
            <text y="10" font-size="32" text-anchor="middle">🌧️</text>
            <text y="-40" font-size="11" text-anchor="middle" font-weight="900" fill="#1B3A40">降雨量</text>
            <animateTransform attributeName="transform" type="translate" values="120,80; 380,250; 120,80" dur="5s" repeatCount="indefinite"/>
          </g>
          <g>
            <circle r="32" fill="#FFF3C9" stroke="#1B3A40" stroke-width="2.5"/>
            <text y="10" font-size="32" text-anchor="middle">📏</text>
            <text y="-40" font-size="11" text-anchor="middle" font-weight="900" fill="#1B3A40">水位计</text>
            <animateTransform attributeName="transform" type="translate" values="680,90; 420,250; 680,90" dur="5.4s" repeatCount="indefinite"/>
          </g>
          <g>
            <circle r="32" fill="#E2F6D3" stroke="#1B3A40" stroke-width="2.5"/>
            <text y="10" font-size="32" text-anchor="middle">🗺️</text>
            <text y="48" font-size="11" text-anchor="middle" font-weight="900" fill="#1B3A40">地形图</text>
            <animateTransform attributeName="transform" type="translate" values="140,300; 380,280; 140,300" dur="4.6s" repeatCount="indefinite"/>
          </g>
          <g>
            <circle r="32" fill="#D7F2F7" stroke="#1B3A40" stroke-width="2.5"/>
            <text y="10" font-size="32" text-anchor="middle">🏞️</text>
            <text y="48" font-size="11" text-anchor="middle" font-weight="900" fill="#1B3A40">水库放水</text>
            <animateTransform attributeName="transform" type="translate" values="660,310; 420,280; 660,310" dur="5.8s" repeatCount="indefinite"/>
          </g>
          <!-- 干扰项被叉（晃动） -->
          <g transform="translate(260,160)">
            <circle r="28" fill="#FFE0E6" stroke="#1B3A40" stroke-width="2.5"/>
            <text y="8" font-size="26" text-anchor="middle">🍡</text>
            <line x1="-22" y1="-22" x2="22" y2="22" stroke="#E2574C" stroke-width="5"/>
            <line x1="22" y1="-22" x2="-22" y2="22" stroke="#E2574C" stroke-width="5"/>
            <animateTransform attributeName="transform" type="rotate" values="-10 260 160; 10 260 160; -10 260 160" dur="1s" repeatCount="indefinite" additive="sum"/>
            <animateTransform attributeName="transform" type="translate" values="260,160" dur="1s" repeatCount="indefinite"/>
          </g>
          <g transform="translate(540,170)">
            <circle r="28" fill="#FFE4D1" stroke="#1B3A40" stroke-width="2.5"/>
            <text y="8" font-size="26" text-anchor="middle">🦵</text>
            <line x1="-22" y1="-22" x2="22" y2="22" stroke="#E2574C" stroke-width="5"/>
            <line x1="22" y1="-22" x2="-22" y2="22" stroke="#E2574C" stroke-width="5"/>
            <animateTransform attributeName="transform" type="rotate" values="10 540 170; -10 540 170; 10 540 170" dur="1.1s" repeatCount="indefinite" additive="sum"/>
            <animateTransform attributeName="transform" type="translate" values="540,170" dur="1.1s" repeatCount="indefinite"/>
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

        <!-- 帧 7：训练模型 神经网络 -->
        <svg v-else-if="current.id === 'train'" class="scene" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
          <rect width="800" height="400" fill="#FFF1F5"/>
          <!-- 数据从左输入 -->
          <g class="nn-input-1" transform="translate(80,120)"><rect width="60" height="30" fill="#DCEEFF" stroke="#1B3A40" stroke-width="2" rx="6"/><text x="30" y="20" font-size="13" font-weight="900" text-anchor="middle">雨量</text></g>
          <g class="nn-input-2" transform="translate(80,200)"><rect width="60" height="30" fill="#FFF3C9" stroke="#1B3A40" stroke-width="2" rx="6"/><text x="30" y="20" font-size="13" font-weight="900" text-anchor="middle">水位</text></g>
          <g class="nn-input-3" transform="translate(80,280)"><rect width="60" height="30" fill="#D7F2F7" stroke="#1B3A40" stroke-width="2" rx="6"/><text x="30" y="20" font-size="13" font-weight="900" text-anchor="middle">放水</text></g>
          <!-- 神经元 (3 列 × 各 4-3-1 个) -->
          <g class="layer-1">
            <circle cx="280" cy="100" r="24" fill="#fff" stroke="#1B3A40" stroke-width="2.5"/>
            <circle cx="280" cy="170" r="24" fill="#fff" stroke="#1B3A40" stroke-width="2.5"/>
            <circle cx="280" cy="240" r="24" fill="#fff" stroke="#1B3A40" stroke-width="2.5"/>
            <circle cx="280" cy="310" r="24" fill="#fff" stroke="#1B3A40" stroke-width="2.5"/>
          </g>
          <g class="layer-2">
            <circle cx="460" cy="150" r="24" fill="#fff" stroke="#1B3A40" stroke-width="2.5"/>
            <circle cx="460" cy="220" r="24" fill="#fff" stroke="#1B3A40" stroke-width="2.5"/>
            <circle cx="460" cy="290" r="24" fill="#fff" stroke="#1B3A40" stroke-width="2.5"/>
          </g>
          <g class="layer-3">
            <circle cx="620" cy="210" r="30" fill="#FFD23F" stroke="#1B3A40" stroke-width="3"/>
            <text x="620" y="215" font-size="12" font-weight="900" text-anchor="middle">预测</text>
          </g>
          <!-- 连线 -->
          <g stroke="#B388FF" stroke-width="1.5" opacity=".6" class="nn-lines">
            <line v-for="(_, i) in 12" :key="i"
                  :x1="140" :y1="135 + (i%3)*80"
                  :x2="256" :y2="100 + Math.floor(i/3)*70"/>
            <line v-for="(_, j) in 12" :key="'a'+j"
                  :x1="304" :y1="100 + Math.floor(j/3)*70"
                  :x2="436" :y2="150 + (j%3)*70"/>
            <line v-for="(_, k) in 3" :key="'b'+k"
                  :x1="484" :y1="150 + k*70"
                  :x2="590" :y2="210"/>
          </g>
          <!-- 流动数据点 -->
          <circle class="flow-1" r="5" fill="#FF9F1C" stroke="#1B3A40" stroke-width="1.5"/>
          <circle class="flow-2" r="5" fill="#FF9F1C" stroke="#1B3A40" stroke-width="1.5"/>
          <!-- 输出准确率 -->
          <text x="620" y="280" font-size="18" font-weight="900" fill="#1B3A40" text-anchor="middle" class="accuracy">87% ✓</text>
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

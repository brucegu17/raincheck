import { defineStore } from 'pinia';
import { SETS, GOOD_SOURCES, type DataCard, type CleanRow, type DecisionDay } from './sets';
import { TITLES } from './titles';
import { pickRandomSetExcludingLast } from '../utils/storage';
import { applyTheme } from './theme';

type Mode = 'adventure' | 'challenge';
type SceneKey = 'intro' | 'collect' | 'clean' | 'train' | 'deploy' | 'end';

export interface ToastMsg { id: number; text: string }

export const useGame = defineStore('game', {
  state: () => ({
    scene: 'intro' as SceneKey,

    // 玩家信息
    player: '',
    classCode: '',
    mode: 'adventure' as Mode,
    setKey: 'A' as 'A' | 'B' | 'C',

    // 时间
    startTime: 0,
    durationSeconds: 0,

    // 关卡数据
    cards: [] as DataCard[],
    rows: [] as CleanRow[],
    features: [] as Array<{ name: string; good: boolean }>,
    days: [] as DecisionDay[],

    // 第一关
    picked: [] as boolean[],
    explored: [] as boolean[],
    combo: 0, comboBest: 0,
    eggCat: false, eggTang: false,

    // 第二关
    cleanFlagged: [] as boolean[],
    cleanQuality: 0, falseFlags: 0,

    // 第三关
    selectedFeatures: [] as boolean[],
    accuracy: 0, trainCount: 0, training: false,

    // 第四关
    dayChoice: [] as Array<boolean | null>,
    dayPts: [] as number[],
    hintsUsed: 0,
    hintShownIdx: -1,

    // 分数
    pts: { collect: 0, clean: 0, train: 0, decide: 0 },
    total: 0, stars: 0, grade: '',

    // 成就 / 装备 / 称号
    equipment: [] as string[],
    achievementsUnlocked: [] as string[],
    title: TITLES.novice as string,
    courageStar: false, lightningReflex: false,
    perfectCollect: false, perfectClean: false,
    firstTryTrain: false, aceModel: false, allDaysCorrect: false,

    // 正确率
    totalCorrect: 0, totalQuestions: 0,

    // v2.2：速度奖励
    speedBonus: { clean: 0, deploy: 0 },

    // v2.2：开场动画看过的标志（防止重玩复看）
    cutsceneSeen: false,

    // UI
    mood: '' as '' | 'happy' | 'worried' | 'wow' | 'proud',
    toast: null as ToastMsg | null,
    rewardId: null as string | null,    // 弹出装备奖励
    comboBurst: 0                       // 触发连击爆字（值是 combo 数）
  }),

  getters: {
    accuracyPct: (s) => s.totalQuestions ? Math.round(s.totalCorrect / s.totalQuestions * 100) : 0
  },

  actions: {
    // ===== 初始化 =====
    startGame(name: string, classCode: string) {
      this.player = name.trim().slice(0, 12);
      this.classCode = classCode.trim().slice(0, 10);
      this.startTime = performance.now();
      this.title = TITLES.novice;

      // 抽题集（严格排除上一次）
      this.setKey = pickRandomSetExcludingLast(['A','B','C']) as 'A'|'B'|'C';
      applyTheme(this.setKey);
      const CUR = SETS[this.setKey];

      // 卡组：5 好 + 3 干扰，洗牌
      this.cards = this.shuffle([...GOOD_SOURCES, ...CUR.decoys]);
      this.rows = CUR.rows;

      const FEAT_EMOJI: Record<string, string> = { knee:'🦵',phone:'📱',tanghulu:'🍡',dream:'💭',firecracker:'🧨',lottery:'🎱',fortune:'🔮',icepop:'🍦',dance:'💃' };
      const feats = [
        { name: '🌧️ 降雨量', good: true }, { name: '📏 河水位', good: true }, { name: '🗺️ 地形高度', good: true },
        { name: '🏞️ 上游放水', good: true }, { name: '📜 历史洪水规律', good: true },
        ...CUR.decoys.map(d => ({ name: (FEAT_EMOJI[d.icon] || '📊') + ' ' + d.name, good: false }))
      ];
      this.features = this.shuffle(feats);
      this.selectedFeatures = this.features.map(() => false);

      this.days = CUR.days;
      this.dayChoice = this.days.map(() => null);
      this.dayPts = this.days.map(() => 0);

      this.picked = this.cards.map(() => false);
      this.explored = this.cards.map(() => false);
      this.cleanFlagged = this.rows.map(() => false);

      this.scene = 'collect';
    },

    shuffle<T>(arr: T[]): T[] {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },

    // ===== 通用 UI =====
    showToast(text: string) { this.toast = { id: Date.now(), text }; },
    setMood(m: typeof this.mood) { this.mood = m; window.setTimeout(() => { this.mood = ''; }, 2400); },

    // ===== 第一关 =====
    chooseData(i: number, take: boolean) {
      if (this.explored[i]) return;
      this.explored[i] = take || !take ? true : true;
      this.explored[i] = true;
      this.picked[i] = take;
      const d = this.cards[i];
      const ok = (take && d.good) || (!take && !d.good);
      if (ok) {
        this.combo++;
        if (this.combo > this.comboBest) this.comboBest = this.combo;
        if (this.combo >= 2) this.comboBurst = this.combo;
        this.setMood(this.combo >= 3 ? 'proud' : 'happy');
      } else {
        if (this.combo >= 2) this.showToast('哎呀，连击断了！');
        this.combo = 0;
        this.setMood('worried');
      }
    },
    submitCollect() {
      let goodHit = 0, badHit = 0;
      this.cards.forEach((d, i) => {
        if (this.picked[i] && d.good) goodHit++;
        if (this.picked[i] && !d.good) badHit++;
      });
      const perBad = this.mode === 'challenge' ? 6 : 4;
      this.pts.collect = Math.max(0, goodHit * 6 - badHit * perBad);
      this.totalCorrect += goodHit + (3 - badHit);
      this.totalQuestions += this.cards.length;
      if (goodHit === 5 && badHit === 0) { this.perfectCollect = true; this.setMood('proud'); }
      else this.setMood(badHit ? 'worried' : 'happy');
      this.title = '数据侦探';
      this.equipment.push('rain_radar');
      this.rewardId = 'rain_radar';
    },

    // ===== 第二关 =====
    submitClean() {
      let correct = 0, missed = 0, wrong = 0;
      this.rows.forEach((r, i) => {
        const f = this.cleanFlagged[i];
        if (r.bad && f) correct++;
        else if (r.bad && !f) missed++;
        else if (!r.bad && f) wrong++;
      });
      this.cleanQuality = correct / 4;
      this.falseFlags = wrong;
      const cost = this.mode === 'challenge' ? 3 : 2;
      this.pts.clean = Math.max(0, correct * 5 - wrong * cost);
      this.totalCorrect += correct + (this.rows.length - 4 - wrong);
      this.totalQuestions += this.rows.length;
      if (correct === 4 && wrong === 0) { this.perfectClean = true; this.setMood('proud'); }
      else this.setMood(missed > 0 ? 'worried' : 'wow');
      this.equipment.push('purifier');
      this.rewardId = 'purifier';
    },

    // ===== 第三关 =====
    calcAccuracy() {
      const good = this.features.filter((f, i) => this.selectedFeatures[i] && f.good).length;
      const bad  = this.features.filter((f, i) => this.selectedFeatures[i] && !f.good).length;
      let acc = 52 + good * 8 - bad * 7;
      acc += Math.round(this.cleanQuality * 10) - 10;
      acc -= this.falseFlags * 2;
      acc += Math.random() * 4 - 2;
      return { acc: Math.max(34, Math.min(96, Math.round(acc))), good, bad };
    },
    finishTrain(result: { acc: number; good: number; bad: number }) {
      this.accuracy = result.acc;
      this.training = false;
      if (result.acc >= 85) {
        this.pts.train = Math.max(10, 30 - (this.trainCount - 1) * 5);
        if (this.trainCount === 1) this.firstTryTrain = true;
        if (result.acc >= 95) this.aceModel = true;
        this.title = '清溪镇 AI 防洪专家';
        this.totalCorrect += result.good + (3 - result.bad);
        this.totalQuestions += this.features.length;
        this.equipment.push('ai_radar');
        this.rewardId = 'ai_radar';
        this.setMood('proud');
      } else {
        this.setMood('worried');
      }
    },

    // ===== 第四关 =====
    useHint() { this.hintsUsed++; this.hintShownIdx++; },
    decide(i: number, warn: boolean) {
      const d = this.days[i];
      this.dayChoice[i] = warn;
      const base = (d.bestWarn === null) ? 6 : (warn === d.bestWarn ? 7 : (this.mode === 'challenge' ? 2 : 3));
      if (d.bestWarn !== null) { this.totalQuestions++; if (warn === d.bestWarn) this.totalCorrect++; }
      this.dayPts[i] = base;
    },
    finishDeploy() {
      const correct = this.days.reduce((a, d, i) =>
        a + ((d.bestWarn === null || this.dayChoice[i] === d.bestWarn) ? 1 : 0), 0);
      if (correct === this.days.length) this.allDaysCorrect = true;
      this.title = '清溪镇防洪队长';
      this.equipment.push('captain');
      this.rewardId = 'captain';
    },

    // ===== 结算 =====
    finishGame() {
      this.pts.decide = Math.max(0, this.dayPts.reduce((a, b) => a + (b || 0), 0) - this.hintsUsed);
      this.total = this.pts.collect + this.pts.clean + this.pts.train + this.pts.decide;
      this.grade = this.total >= 90 ? '🥇 金牌预报员'
                 : this.total >= 75 ? '🥈 银牌预报员'
                 : this.total >= 60 ? '🥉 铜牌预报员'
                 : '🌱 见习预报员';
      this.stars = this.total >= 90 ? 5 : this.total >= 80 ? 4 : this.total >= 68 ? 3 : this.total >= 55 ? 2 : 1;
      this.durationSeconds = this.startTime ? Math.round((performance.now() - this.startTime) / 1000) : 0;

      // 成就判定
      const got: string[] = [];
      if (this.lightningReflex) got.push('lightning');
      if (this.perfectCollect)  got.push('sharpEye');
      if (this.perfectClean)    got.push('detective');
      if (this.firstTryTrain)   got.push('oneShot');
      if (this.aceModel)        got.push('aceModel');
      if (this.allDaysCorrect)  got.push('savior');
      if (this.hintsUsed === 0) got.push('pure');
      if (this.eggCat && this.eggTang) got.push('eggs');
      this.achievementsUnlocked = got;
      if (got.length >= 6 && !this.title.includes('队长')) this.title = '清溪镇荣誉之星';

      this.scene = 'end';
    },

    // ===== 复玩 =====
    replay() {
      const name = this.player;
      const cls  = this.classCode;
      const mode = this.mode;
      this.$reset();
      this.player = name; this.classCode = cls; this.mode = mode;
      this.startGame(name, cls);
    }
  }
});

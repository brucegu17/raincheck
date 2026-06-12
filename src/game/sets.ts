// 三套题集：A / B / C。教学核心 5 条好数据共享，干扰项各自不同。
export interface DataCard {
  icon: string;     // 对应 icons.ts 的 key
  bg: string;       // 卡片背景色
  name: string;
  desc: string;
  good: boolean;
  why: string;
}
export interface CleanRow {
  d: string; rain: string; level: string; dam: string;
  bad: boolean; why?: string;
}
export interface DecisionDay {
  label: string; emoji: string;
  prob: number;            // 洪水概率
  cls: 'prob-low' | 'prob-mid' | 'prob-high';
  color: string;
  ctx: string;
  bestWarn: boolean | null;
  aux?: string;
  warnMsg: { type: 'ok' | 'warn' | 'bad'; text: string };
  holdMsg: { type: 'ok' | 'warn' | 'bad'; text: string };
}

export const GOOD_SOURCES: DataCard[] = [
  { icon: 'rain',   bg: '#DCEEFF', name: '雨量站记录',     desc: '过去 10 年每天的降雨量', good: true, why: '降雨量是洪水最直接的原因，必选。' },
  { icon: 'gauge',  bg: '#FFF3C9', name: '河流水位计',     desc: '清溪河每小时的水位高度', good: true, why: '水位直接反映洪水风险。' },
  { icon: 'map',    bg: '#E2F6D3', name: '地形高程图',     desc: '镇子和河道的高低地势', good: true, why: '低洼处更容易被淹，地形是关键。' },
  { icon: 'dam',    bg: '#D7F2F7', name: '上游水库放水记录', desc: '水库何时放水、放多少', good: true, why: '上游放水会让下游水位上涨。' },
  { icon: 'scroll', bg: '#FFEFD8', name: '历史洪水档案',     desc: '镇志记录的历年洪水', good: true, why: '历史规律是模型的"教材"。' }
];

export const SETS: Record<'A' | 'B' | 'C', {
  decoys: DataCard[]; rows: CleanRow[]; days: DecisionDay[];
}> = {
  A: {
    decoys: [
      { icon: 'knee',     bg: '#FFE4D1', name: '王爷爷的膝盖预报', desc: '"膝盖一疼就要下雨"', good: false, why: '膝盖疼和洪水没有可靠关系。' },
      { icon: 'phone',    bg: '#EBE4FF', name: '群聊里的传言',     desc: '"听说下周要发大水"',   good: false, why: '传言不是数据，不能验证。' },
      { icon: 'tanghulu', bg: '#FFE0E6', name: '糖葫芦销量',       desc: '大集每天卖多少串',     good: false, why: '糖葫芦销量和洪水毫无关系。' }
    ],
    rows: [
      { d: '6月1日', rain: '12',   level: '2.8', dam: '否', bad: false },
      { d: '6月2日', rain: '45',   level: '3.4', dam: '否', bad: false },
      { d: '6月3日', rain: '',     level: '3.9', dam: '是', bad: true,  why: '降雨量缺失' },
      { d: '6月4日', rain: '88',   level: '4.6', dam: '是', bad: false },
      { d: '6月5日', rain: '999',  level: '5.1', dam: '否', bad: true,  why: '999 毫米异常' },
      { d: '6月6日', rain: '62',   level: '4.8', dam: '否', bad: false },
      { d: '6月6日', rain: '62',   level: '4.8', dam: '否', bad: true,  why: '重复记录' },
      { d: '6月7日', rain: '30',   level: '4.2', dam: '否', bad: false },
      { d: '6月8日', rain: '-5',   level: '3.6', dam: '否', bad: true,  why: '负数雨量不可能' },
      { d: '6月9日', rain: '8',    level: '3.0', dam: '否', bad: false }
    ],
    days: [
      { label: '第一天 · 周五', emoji: '🌤️', prob: 12, cls: 'prob-low',  color: 'var(--c-good)',  ctx: '天气晴，上游没有放水。', bestWarn: false,
        warnMsg: { type: 'warn', text: '预警发出，大集停业一天……结果河水平静，摊主们抱怨"预警不准"。' },
        holdMsg: { type: 'ok',   text: '风险低，照常开集，平安无事。低概率时不打扰大家是对的。' } },
      { label: '第二天 · 周六', emoji: '⛈️', prob: 87, cls: 'prob-high', color: 'var(--c-coral)', ctx: '连续暴雨，水库开闸放水，水位飞涨。', bestWarn: true,
        warnMsg: { type: 'ok',  text: '果断预警！货物搬上高处，洪水当晚到来——没人受伤，损失最小。' },
        holdMsg: { type: 'bad', text: '没有预警……洪水冲进集市，货物冲走、有人被困。87% 的高风险不能忽视。' } },
      { label: '第三天 · 周日', emoji: '🌦️', prob: 55, cls: 'prob-mid',  color: 'var(--c-candy)', ctx: '雨停了，但上游还在放水，模型也"拿不准"。', bestWarn: null, aux: '提前备好沙袋 · 加强巡河',
        warnMsg: { type: 'ok',   text: '"宁可信其有"——发预警 + 加派人观察。水位涨到警戒线又退去，全镇平安。' },
        holdMsg: { type: 'warn', text: '没发预警，但安排志愿者整夜盯水位。幸运退水——AI 不确定时，人要补上观察。' } }
    ]
  },
  B: {
    decoys: [
      { icon: 'dream',       bg: '#E2E8FF', name: '李婶的梦境预报', desc: '"昨晚梦见发大水了"', good: false, why: '梦没法验证、也没规律。' },
      { icon: 'firecracker', bg: '#FFE3E3', name: '集市鞭炮声次数', desc: '每天放了几挂鞭炮',     good: false, why: '鞭炮声和下雨毫无关系。' },
      { icon: 'lottery',     bg: '#FFF0D9', name: '彩票开奖号码',   desc: '本周彩票号码',         good: false, why: '随机数中找规律会越学越糊涂。' }
    ],
    rows: [
      { d: '7月1日', rain: '5',   level: '2.6', dam: '否', bad: false },
      { d: '7月2日', rain: '',    level: '3.1', dam: '否', bad: true,  why: '降雨量缺失' },
      { d: '7月3日', rain: '38',  level: '3.5', dam: '否', bad: false },
      { d: '7月4日', rain: '76',  level: '4.4', dam: '是', bad: false },
      { d: '7月5日', rain: '850', level: '4.9', dam: '是', bad: true,  why: '850 毫米异常' },
      { d: '7月6日', rain: '54',  level: '4.6', dam: '否', bad: false },
      { d: '7月6日', rain: '54',  level: '4.6', dam: '否', bad: true,  why: '重复记录' },
      { d: '7月7日', rain: '22',  level: '4.0', dam: '否', bad: false },
      { d: '7月8日', rain: '16',  level: '-2',  dam: '否', bad: true,  why: '负数水位不可能' },
      { d: '7月9日', rain: '6',   level: '3.2', dam: '否', bad: false }
    ],
    days: [
      { label: '第一天 · 周三', emoji: '⛅', prob: 9,  cls: 'prob-low',  color: 'var(--c-good)',  ctx: '多云转晴，河水安安静静。', bestWarn: false,
        warnMsg: { type: 'warn', text: '预警发了，大集空了一天……什么都没发生。预警太随意，大家会不信。' },
        holdMsg: { type: 'ok',   text: '风险很低，不打扰大家。大集照常，平安收摊。' } },
      { label: '第二天 · 周四', emoji: '🌀', prob: 91, cls: 'prob-high', color: 'var(--c-coral)', ctx: '台风边缘扫过，暴雨一整天，水库紧急泄洪！', bestWarn: true,
        warnMsg: { type: 'ok',  text: '预警及时！连夜搬货上高处。洪水漫过河岸——没人受伤。' },
        holdMsg: { type: 'bad', text: '压下预警……洪水漫进集市，损失惨重。91% 不该冒险。' } },
      { label: '第三天 · 周五', emoji: '🌦️', prob: 48, cls: 'prob-mid',  color: 'var(--c-candy)', ctx: '雨小了，可上游来水没停，模型犹豫。', bestWarn: null, aux: '安排志愿者轮班盯水位',
        warnMsg: { type: 'ok',   text: '稳妥：发预警 + 加人盯水位。水到警戒线退去。拿不准时多准备不丢人。' },
        holdMsg: { type: 'warn', text: '不发预警，但志愿者轮班巡河。水退了。AI 拿不准时，人要补上观察。' } }
    ]
  },
  C: {
    decoys: [
      { icon: 'fortune', bg: '#F2EBDC', name: '算命先生的卦象', desc: '"卦上说近日有水患"', good: false, why: '卦象不能测量、不能验证。' },
      { icon: 'icepop',  bg: '#FFE9F2', name: '冰糕销量',       desc: '每天卖出多少根冰糕', good: false, why: '看似沾边的相关性，最危险。' },
      { icon: 'dance',   bg: '#E8F7E0', name: '广场舞人数',     desc: '每晚河边跳舞的人数', good: false, why: '跳舞和洪水没有关系。' }
    ],
    rows: [
      { d: '8月2日',  rain: '10',  level: '2.9', dam: '否', bad: false },
      { d: '8月3日',  rain: '41',  level: '3.6', dam: '否', bad: false },
      { d: '8月4日',  rain: '',    level: '4.0', dam: '是', bad: true,  why: '降雨量缺失' },
      { d: '8月5日',  rain: '600', level: '4.7', dam: '是', bad: true,  why: '600 毫米异常' },
      { d: '8月6日',  rain: '71',  level: '4.9', dam: '否', bad: false },
      { d: '8月7日',  rain: '33',  level: '4.3', dam: '否', bad: false },
      { d: '8月8日',  rain: '-12', level: '3.8', dam: '否', bad: true,  why: '负数雨量不可能' },
      { d: '8月9日',  rain: '25',  level: '3.5', dam: '否', bad: false },
      { d: '8月10日', rain: '9',   level: '3.0', dam: '否', bad: false },
      { d: '8月10日', rain: '9',   level: '3.0', dam: '否', bad: true,  why: '重复记录' }
    ],
    days: [
      { label: '第一天 · 周六', emoji: '🌦️', prob: 15, cls: 'prob-low',  color: 'var(--c-good)',  ctx: '一阵小雨，很快就停了。', bestWarn: false,
        warnMsg: { type: 'warn', text: '为 15% 停一天集，摊主埋怨。"狼来了"会失灵。' },
        holdMsg: { type: 'ok',   text: '判断风险低，照常开集，平安无事。' } },
      { label: '第二天 · 周日', emoji: '🌧️', prob: 83, cls: 'prob-high', color: 'var(--c-coral)', ctx: '大雨连下两天，水位逼近警戒线！', bestWarn: true,
        warnMsg: { type: 'ok',  text: '果断！全镇转移加固堤坝。洪水夜里到来，损失最低。' },
        holdMsg: { type: 'bad', text: '没预警，洪水冲进集市……83% 摆在眼前却没行动。' } },
      { label: '第三天 · 周一', emoji: '🌥️', prob: 57, cls: 'prob-mid',  color: 'var(--c-candy)', ctx: '雨停了，可泥土"喝饱了水"。', bestWarn: null, aux: '整夜巡河 · 备好沙袋',
        warnMsg: { type: 'ok',   text: '宁可信其有：发预警 + 备沙袋。水位贴警戒线一夜后退去。' },
        holdMsg: { type: 'warn', text: '没发预警，但巡河 + 沙袋。水退了。记住：AI 说"也许"，人就要把"万一"准备好。' } }
    ]
  }
};

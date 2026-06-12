export interface Equipment { id: string; ic: string; name: string; msg: string }
export const EQUIPMENT: Record<string, Equipment> = {
  rain_radar: { id: 'rain_radar', ic: '🌧️', name: '雨量监测仪', msg: '数据收集任务完成！' },
  purifier:   { id: 'purifier',   ic: '🧹', name: '数据净化器', msg: '坏数据再也藏不住！' },
  ai_radar:   { id: 'ai_radar',   ic: '🛰️', name: 'AI 预测雷达', msg: '模型上线，准备预报！' },
  captain:    { id: 'captain',    ic: '🎖️', name: '防洪队长徽章', msg: '你已是清溪镇队长！' }
};

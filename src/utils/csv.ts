import type { ScoreRecord } from './storage';
import { EQUIPMENT } from '../game/equipment';
import { ACHIEVEMENTS } from '../game/achievements';

export function exportCsv(list: ScoreRecord[]): void {
  const esc = (v: any) => '"' + String(v).replace(/"/g, '""') + '"';
  const head = ['姓名','班级码','模式','题集','总分','等级','称号','收集(30)','清洗(20)','训练(30)','决策(20)',
                '模型准确率%','整体正确率%','训练次数','提示次数','用时(秒)','星星','装备','成就','时间'];
  const achName = (id: string) => ACHIEVEMENTS.find(x => x.id === id)?.name ?? id;
  const eqName  = (id: string) => EQUIPMENT[id]?.name ?? id;
  const lines = [head.join(',')].concat(list.map(r => [
    r.name, r.classCode, r.mode, r.set, r.total, r.grade, r.title,
    r.c1, r.c2, r.c3, r.c4, r.acc, r.accuracyPct,
    r.trains, r.hints, r.dur, r.stars,
    (r.equipment || []).map(eqName).join('|'),
    (r.achievements || []).map(achName).join('|'),
    r.time
  ].map(esc).join(',')));
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '清溪镇成绩单.csv';
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800);
}

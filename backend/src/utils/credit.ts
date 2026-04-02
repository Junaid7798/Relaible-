export function categorizeByAgeing(entries: { amount_paise: number; days_overdue: number }[]) {
  const b = [{ bucket: '0-30', count: 0, total_paise: 0 }, { bucket: '31-60', count: 0, total_paise: 0 }, { bucket: '61-90', count: 0, total_paise: 0 }, { bucket: '90+', count: 0, total_paise: 0 }];
  for (const e of entries) {
    if (e.days_overdue <= 30) { b[0].count++; b[0].total_paise += e.amount_paise; }
    else if (e.days_overdue <= 60) { b[1].count++; b[1].total_paise += e.amount_paise; }
    else if (e.days_overdue <= 90) { b[2].count++; b[2].total_paise += e.amount_paise; }
    else { b[3].count++; b[3].total_paise += e.amount_paise; }
  }
  return b;
}
export function calculatePartyHealthScore(orders: number, onTime: number, overdue: number, broken: number): 'green' | 'amber' | 'red' {
  if (!orders) return 'green';
  if (overdue > 2 || broken > 2) return 'red';
  if (onTime / orders < 0.7 || overdue > 0 || broken > 0) return 'amber';
  return 'green';
}
export function isGoingCold(avgDays: number, sinceLast: number): boolean { return sinceLast > avgDays * 1.5; }
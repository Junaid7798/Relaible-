import { format, parseISO } from 'date-fns';
const IST = 5.5 * 60 * 60 * 1000;
export function nowIST(): Date { return new Date(Date.now() + IST); }
export function toIST(d: Date | string): Date { return new Date((typeof d === 'string' ? parseISO(d) : d).getTime() + IST); }
export function formatDateIST(d: Date | string): string { return format(toIST(d), 'dd/MM/yyyy'); }
export function formatTimeIST(d: Date | string): string { return format(toIST(d), 'h:mm a'); }
export function formatDateTimeIST(d: Date | string): string { return format(toIST(d), 'dd/MM/yyyy h:mm a'); }
export function getCurrentFinancialYear(): string {
  const n = nowIST(); const y = n.getFullYear(); const m = n.getMonth();
  return m >= 3 ? y.toString().slice(-2) + (y + 1).toString().slice(-2) : (y - 1).toString().slice(-2) + y.toString().slice(-2);
}
export function getFinancialYearStart(year?: number): Date {
  const y = year ?? nowIST().getFullYear();
  return nowIST().getMonth() >= 3 ? new Date(y, 3, 1) : new Date(y - 1, 3, 1);
}
export function getFinancialYearRange(fy: string): { start: Date; end: Date } {
  const sy = parseInt('20' + fy.substring(0, 2), 10);
  return { start: new Date(sy, 3, 1), end: new Date(sy + 1, 2, 31, 23, 59, 59) };
}
export function getTodayStartIST(): Date { const n = nowIST(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
export function getTodayEndIST(): Date { const n = nowIST(); return new Date(n.getFullYear(), n.getMonth(), n.getDate(), 23, 59, 59, 999); }
export function getDaysOverdue(due: Date | string): number {
  const d = typeof due === 'string' ? parseISO(due) : due;
  return Math.max(0, Math.floor((nowIST().getTime() - d.getTime()) / 86400000));
}
export function getCreditStatus(due: Date | string): 'current' | 'follow_up' | 'overdue' | 'critical' {
  const days = getDaysOverdue(due);
  if (days <= 30) return 'current';
  if (days <= 60) return 'follow_up';
  if (days <= 90) return 'overdue';
  return 'critical';
}
export function amountInWords(rupees: number): string {
  const o = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const t = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  function td(n: number): string { if (n < 20) return o[n]; return t[Math.floor(n / 10)] + (n % 10 ? ' ' + o[n % 10] : ''); }
  function th(n: number): string { if (!n) return ''; if (n < 100) return td(n); return o[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + td(n % 100) : ''); }
  if (!rupees) return 'Zero Rupees Only';
  const cr = Math.floor(rupees / 10000000); const lk = Math.floor((rupees % 10000000) / 100000);
  const th2 = Math.floor((rupees % 100000) / 1000); const hu = Math.floor((rupees % 1000) / 100); const rm = Math.floor(rupees % 100);
  const p: string[] = [];
  if (cr) p.push(th(cr) + ' Crore'); if (lk) p.push(th(lk) + ' Lakh');
  if (th2) p.push(th(th2) + ' Thousand'); if (hu) p.push(o[hu] + ' Hundred'); if (rm) p.push(td(rm));
  return p.join(' ') + ' Rupees Only';
}
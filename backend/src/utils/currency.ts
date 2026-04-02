export function rupeesToPaise(rupees: number): number { return Math.round(rupees * 100); }
export function paiseToRupees(paise: number): number { return paise / 100; }
export function formatCurrency(paise: number): string {
  return '\u20B9' + Math.round(paise / 100).toLocaleString('en-IN');
}
export function formatCurrencyPrecise(paise: number): string {
  return '\u20B9' + (paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
export function formatLargeAmount(paise: number): string {
  const r = paise / 100;
  if (r >= 10000000) return '\u20B9' + (r / 10000000).toFixed(1) + 'Cr';
  if (r >= 100000) return '\u20B9' + (r / 100000).toFixed(1) + 'L';
  return formatCurrency(paise);
}
export function parseRupeeInput(input: string): number {
  return Math.round((parseFloat(input.replace(/[^\d.]/g, '')) || 0) * 100);
}
export function calculateGST(taxable: number, rate: number) {
  const half = rate / 2;
  const cgst = Math.round(taxable * (half / 100));
  const sgst = Math.round(taxable * (half / 100));
  return { cgst, sgst, totalGST: cgst + sgst };
}
export function calculateIGST(taxable: number, rate: number) {
  return { igst: Math.round(taxable * (rate / 100)) };
}
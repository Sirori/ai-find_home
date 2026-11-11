export function formatPrice(amount: string): string {
  const num = parseInt(amount.replace(/,/g, '').trim(), 10);
  if (isNaN(num)) return amount;
  if (num >= 10000) {
    const eok = Math.floor(num / 10000);
    const man = num % 10000;
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만` : `${eok}억`;
  }
  return `${num.toLocaleString()}만`;
}

export function formatPriceShort(amount: string): string {
  const num = parseInt(amount.replace(/,/g, '').trim(), 10);
  if (isNaN(num)) return amount;
  if (num >= 10000) {
    const eok = (num / 10000).toFixed(1).replace(/\.0$/, '');
    return `${eok}억`;
  }
  return `${num.toLocaleString()}만`;
}

export function parseAmount(amount: string): number {
  return parseInt(amount.replace(/,/g, '').trim(), 10) || 0;
}

export function formatArea(area: string): string {
  const num = parseFloat(area);
  if (isNaN(num)) return area;
  const pyeong = Math.round(num / 3.3058);
  return `${num.toFixed(1)}㎡(${pyeong}평)`;
}

export function getYearMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}${month}`;
}

export function getPastMonths(count: number): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(getYearMonth(d));
  }
  return months;
}

export function formatDealDate(year: string, month: string, day?: string): string {
  return day
    ? `${year}.${month.padStart(2, '0')}.${day.padStart(2, '0')}`
    : `${year}.${month.padStart(2, '0')}`;
}

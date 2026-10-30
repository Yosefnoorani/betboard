export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ')
}

export const pct = (x: number, digits = 0) => `${(x * 100).toFixed(digits)}%`
export const money = (n: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)

/** Today's date as YYYY-MM-DD (UTC). */
export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

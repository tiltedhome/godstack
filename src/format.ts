const SUP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻',
}

export const sup = (n: number | string): string => String(n).split('').map((c) => SUP[c] ?? c).join('')

// 0.3, 6, 14,000 in the middle; real superscripts at both ends: 10⁻⁹, 9.1 × 10⁶, 10¹⁰⁰
export function formatIQ(n: number): string {
  if (n >= 0.1 && n < 10) return String(Math.round(n * 10) / 10)
  if (n >= 10 && n < 1e5) return Math.round(n).toLocaleString('en-US')
  return formatLogIQ(Math.log10(n))
}

// Takes log10 of the value, so values past the range of a double still format.
export function formatLogIQ(l: number): string {
  if (l >= -1 && l < 5) return formatIQ(10 ** l)
  let e = Math.floor(l)
  let m = Math.round(10 ** (l - e) * 10) / 10
  if (m >= 10) {
    m = 1
    e += 1
  }
  return (m === 1 ? '' : `${m} × `) + `10${sup(e)}`
}

export const genLabel = (g: number): string => (g === 0 ? '0' : (g > 0 ? '+' : '−') + Math.abs(g))

import { COROLLARIES, LAW, LAYERS, UNIVERSE_NOTE, clockLabel } from './lore.ts'
import { CAST } from './minutes.ts'

const SVG = 'http://www.w3.org/2000/svg'

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, text?: string) {
  const e = document.createElementNS(SVG, tag)
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v))
  if (text) e.textContent = text
  return e
}

export const CHART = {
  title: 'Frames a second, as a power of ten',
  caption:
    'One step along is ten times faster. Everything to the left of the line takes longer than a second to notice anything; you are the short bar just to the right of it. The Strings have no bar, because they have no clock.',
}

// One bar per level on a log scale, slow to the left of the line and fast to the right.
function clocks(): SVGSVGElement {
  const W = 480
  const ROW = 25
  const m = { l: 86, r: 34, t: 28, b: 8 }
  const H = m.t + LAYERS.length * ROW + m.b
  const real = LAYERS.map((L) => L.clock).filter((v): v is number => v !== null)
  const lo = Math.min(...real) - 1
  const hi = Math.max(...real) + 1
  const x = (v: number) => m.l + ((v - lo) / (hi - lo)) * (W - m.l - m.r)
  const svg = el('svg', {
    viewBox: `0 0 ${W} ${H}`,
    role: 'img',
    'aria-label': `${CHART.title}. ${LAYERS.map((L) => `${L.name}: ${L.frame}`).join('. ')}.`,
  })
  svg.append(el('text', { x: 0, y: 13, class: 'ctitle' }, CHART.title))
  svg.append(el('line', { x1: x(0), x2: x(0), y1: m.t - 4, y2: H - m.b, class: 'grid' }))
  LAYERS.forEach((L, i) => {
    const cy = m.t + i * ROW + ROW / 2
    svg.append(el('text', { x: 0, y: cy + 4, class: 'tick' }, L.short))
    if (L.clock === null) {
      svg.append(el('line', { x1: m.l, x2: W - m.r, y1: cy, y2: cy, class: 'none' }))
      svg.append(el('text', { x: x(0) + 6, y: cy - 4, class: 'tick dim' }, 'no clock'))
      return
    }
    const a = Math.min(x(0), x(L.clock))
    const w = Math.max(2, Math.abs(x(L.clock) - x(0)))
    svg.append(el('rect', { x: a, y: cy - 6, width: w, height: 12, rx: 2, class: L.id === 'apes' ? 'bar you' : 'bar' }))
    const left = L.clock < 0
    svg.append(el('text', { x: left ? a - 5 : a + w + 5, y: cy + 4, class: 'tick', 'text-anchor': left ? 'end' : 'start' }, clockLabel(L)))
  })
  return svg
}

export function buildLedger() {
  document.getElementById('law')!.textContent = LAW
  const ol = document.getElementById('corollaries')!
  for (const c of COROLLARIES) {
    const li = document.createElement('li')
    li.textContent = c
    ol.append(li)
  }
  const fig = document.createElement('figure')
  fig.className = 'chart'
  const cap = document.createElement('figcaption')
  cap.textContent = CHART.caption
  fig.append(clocks(), cap)
  document.getElementById('chart')!.append(fig)
  document.getElementById('cast')!.textContent =
    'In the margin: ' + Object.entries(CAST).map(([who, what]) => `${who === 'Pedant' || who === 'Intern' ? 'the ' : ''}${who} (${what})`).join(', ') + '.'
  const table = document.getElementById('ledger-table') as HTMLTableElement
  const head = table.createTHead().insertRow()
  for (const h of ['Clock', 'Level', 'One frame', 'Calls itself', 'Rank, by its own estimate', 'Made of', 'Lives in', 'Formed in its traffic']) {
    const th = document.createElement('th')
    th.scope = 'col'
    th.textContent = h
    head.append(th)
  }
  const body = table.createTBody()
  for (const L of LAYERS) {
    const row = body.insertRow()
    const cells = [clockLabel(L), L.name, L.frame, L.self, L.rank, L.madeOf, L.livesIn, L.made]
    cells.forEach((c, j) => {
      const td = row.insertCell()
      td.textContent = c
      if (j === 0) td.className = 'num'
      if (j === 1 || j === 7) td.className = 'who'
    })
  }
  document.getElementById('ledger-octave')!.textContent = UNIVERSE_NOTE
}

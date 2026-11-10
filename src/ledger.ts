import { COROLLARIES, LAW, LAYERS, TRAITS, UNIVERSE_NOTE, type Layer, type Verdict } from './lore.ts'
import { sup } from './format.ts'

const SVG = 'http://www.w3.org/2000/svg'

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, text?: string) {
  const e = document.createElementNS(SVG, tag)
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v))
  if (text) e.textContent = text
  return e
}

export const MARK: Record<Verdict, string> = { yes: '●', partly: '◐', no: '○', moot: '–' }

type StatKey = 'news' | 'lasts' | 'power'
export const CHARTS: { key: StatKey; title: string; caption: string }[] = [
  {
    key: 'news',
    title: 'How fast news travels (metres a second)',
    caption: 'From the Gene upward, every port is faster. That is what each one was for.',
  },
  {
    key: 'lasts',
    title: 'How long the medium keeps a mark (years)',
    caption: 'The page keeps getting worse. A proton lasts 10³⁴ years, a strand of DNA centuries, a flash chip about ten. What survives is whatever keeps being copied.',
  },
  {
    key: 'power',
    title: 'What one of them runs on (watts)',
    caption: 'A star, a bacterium, a brain, a person, a data centre, a black hole. Since chemistry, each port has been hungrier than the last.',
  },
]

// One row of bars on a log scale, a column per substrate. Where there is no honest number
// (no time, no distance, nothing leaves) the column says so instead of pretending.
function bars(key: StatKey, title: string): SVGSVGElement {
  const W = 480
  const H = 150
  const m = { l: 10, r: 10, t: 26, b: 30 }
  const values = LAYERS.map((L) => L.stats[key][1])
  const real = values.filter((v): v is number => v !== null)
  const lo = Math.min(...real) - 2
  const hi = Math.max(...real) + 1
  const col = (W - m.l - m.r) / LAYERS.length
  const y = (v: number) => m.t + ((hi - v) / (hi - lo)) * (H - m.t - m.b)
  const svg = el('svg', {
    viewBox: `0 0 ${W} ${H}`,
    role: 'img',
    'aria-label': `${title}, on a log scale. ${LAYERS.map((L) => `${L.name}: ${L.stats[key][0]}`).join('. ')}.`,
  })
  svg.append(el('text', { x: m.l, y: 13, class: 'ctitle' }, title))
  svg.append(el('line', { x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b, class: 'grid' }))
  LAYERS.forEach((L, i) => {
    const cx = m.l + col * (i + 0.5)
    const v = values[i]
    if (v === null) {
      svg.append(el('line', { x1: cx, x2: cx, y1: m.t + 12, y2: H - m.b, class: 'none' }))
      svg.append(el('text', { x: cx, y: m.t + 6, class: 'tick', 'text-anchor': 'middle' }, 'n/a'))
    } else {
      svg.append(el('rect', { x: cx - col * 0.28, y: y(v), width: col * 0.56, height: H - m.b - y(v), rx: 2, class: L.id === 'word' ? 'bar you' : 'bar' }))
      svg.append(el('text', { x: cx, y: y(v) - 4, class: 'tick', 'text-anchor': 'middle' }, `10${sup(Math.round(v))}`))
    }
    svg.append(el('text', { x: cx, y: H - 16, class: 'tick', 'text-anchor': 'middle' }, L.version))
    svg.append(el('text', { x: cx, y: H - 5, class: 'tick dim', 'text-anchor': 'middle' }, L.short))
  })
  return svg
}

export const aliveMarks = (L: Layer) => TRAITS.map((k) => MARK[L.traits[k][0]]).join(' ')

export function buildLedger() {
  document.getElementById('law')!.textContent = LAW
  const ol = document.getElementById('corollaries')!
  for (const c of COROLLARIES) {
    const li = document.createElement('li')
    li.textContent = c
    ol.append(li)
  }
  const charts = document.getElementById('chart')!
  for (const c of CHARTS) {
    const fig = document.createElement('figure')
    fig.className = 'chart'
    const cap = document.createElement('figcaption')
    cap.textContent = c.caption
    fig.append(bars(c.key, c.title), cap)
    charts.append(fig)
  }
  const table = document.getElementById('ledger-table') as HTMLTableElement
  const head = table.createTHead().insertRow()
  for (const h of ['Life', 'Substrate', 'Written on', 'Alive?', 'Ported itself into', 'Bought', 'Paid']) {
    const th = document.createElement('th')
    th.scope = 'col'
    th.textContent = h
    head.append(th)
  }
  const body = table.createTBody()
  for (const L of LAYERS) {
    const row = body.insertRow()
    const cells = [L.version, L.name, L.substrate, aliveMarks(L), L.one, L.port.gains, L.port.pays]
    cells.forEach((c, j) => {
      const td = row.insertCell()
      td.textContent = c
      if (j === 0 || j === 3) td.className = 'num'
      if (j === 1 || j === 4) td.className = 'who'
      if (j === 3) td.title = TRAITS.map((k) => `${k}: ${L.traits[k][0]}`).join(', ')
    })
  }
  document.getElementById('ledger-octave')!.textContent = UNIVERSE_NOTE
}

import { COROLLARIES, LAW, LAYERS, UNIVERSE_NOTE } from './lore.ts'
import { formatIQ, genLabel, sup } from './format.ts'

const SVG = 'http://www.w3.org/2000/svg'

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, text?: string) {
  const e = document.createElementNS(SVG, tag)
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v))
  if (text) e.textContent = text
  return e
}

// A staircase on a log scale: within each generation the collective's members (hollow) build
// something smarter (filled), which becomes the next generation's members.
function chart(): SVGSVGElement {
  const W = 480
  const H = 310
  const m = { l: 46, r: 16, t: 20, b: 36 }
  const lo = -13
  const hi = 23
  const x = (g: number, half = 0) => m.l + ((g + 3 + half * 0.45) / 6.6) * (W - m.l - m.r)
  const y = (v: number) => m.t + ((hi - Math.log10(v)) / (hi - lo)) * (H - m.t - m.b)
  const svg = el('svg', {
    viewBox: `0 0 ${W} ${H}`,
    role: 'img',
    'aria-label': 'Staircase chart of IQ by plane on a log scale. On each plane a collective of members builds one greater mind, which becomes the members of the next plane. IQ rises from 10⁻¹² for a single harmonic to 10²² for the String.',
  })
  for (let e = -12; e <= 22; e += 6) {
    svg.append(el('line', { x1: m.l, x2: W - m.r, y1: y(10 ** e), y2: y(10 ** e), class: 'grid' }))
    svg.append(el('text', { x: m.l - 8, y: y(10 ** e) + 4, class: 'tick', 'text-anchor': 'end' }, `10${sup(e)}`))
  }
  const path: string[] = []
  LAYERS.forEach((L) => {
    path.push(`${x(L.gen)},${y(L.memberIq)}`, `${x(L.gen, 1)},${y(L.oneIq)}`)
    svg.append(el('text', { x: x(L.gen, 0.5), y: H - 14, class: 'tick', 'text-anchor': 'middle' }, genLabel(L.gen)))
  })
  svg.append(el('polyline', { points: path.join(' '), class: 'trend' }))
  LAYERS.forEach((L) => {
    svg.append(el('circle', { cx: x(L.gen), cy: y(L.memberIq), r: 3.5, class: 'dot member' }))
    svg.append(el('circle', { cx: x(L.gen, 1), cy: y(L.oneIq), r: 4.5, class: L.id === 'humans' ? 'dot you' : 'dot' }))
    const right = L.gen < 1
    svg.append(el('text', { x: x(L.gen, 1) + (right ? 8 : -8), y: y(L.oneIq) + (right ? -8 : 18), class: 'pt', 'text-anchor': right ? 'start' : 'end' }, L.one))
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
  document.getElementById('chart')!.append(chart())
  const table = document.getElementById('ledger-table') as HTMLTableElement
  const head = table.createTHead().insertRow()
  for (const h of ['Plane', 'Collective', 'Members', 'Took', 'Officially', 'Why, really', 'Made, together', 'IQ']) {
    const th = document.createElement('th')
    th.scope = 'col'
    th.textContent = h
    head.append(th)
  }
  const body = table.createTBody()
  for (const L of LAYERS) {
    const row = body.insertRow()
    const cells = [genLabel(L.gen), L.name, L.members, L.took, L.officially, L.why, L.one, `${formatIQ(L.memberIq)} → ${formatIQ(L.oneIq)}`]
    cells.forEach((c, j) => {
      const td = row.insertCell()
      td.textContent = c
      if (j === 7) td.className = 'num'
      if (j === 1 || j === 6) td.className = 'who'
    })
  }
  document.getElementById('ledger-octave')!.textContent = UNIVERSE_NOTE
}

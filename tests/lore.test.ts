import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { BEATS, COROLLARIES, LAW, LAYERS, QUESTIONS, TITLE, UNIVERSE_NOTE, clockLabel, clockRate } from '../src/lore.ts'
import { renderLoreMarkdown } from '../src/loremd.ts'

const YEAR = 3.156e7
// One frame of each level's clock, in seconds, as its beats describe it.
const PERIOD: Record<string, number> = {
  wheel: 230e6 * YEAR, // one turn of the galaxy, at the Sun
  stars: 30e6 * YEAR, // the Kelvin-Helmholtz time
  rock: 300e3 * YEAR, // the weathering thermostat
  genes: 25 * YEAR, // a generation
  apes: 1 / 10,
  machines: 1 / 3e9,
  light: 5.39e-44, // the Planck time
}
const text = (id: string) => BEATS.map((b) => LAYERS.find((L) => L.id === id)!.beats[b].text).join(' ')
const all = LAYERS.map((L) => text(L.id)).join(' ')

describe('the canon', () => {
  it('is called Phantom Jam and has eight levels, the reader sixth', () => {
    expect(TITLE).toBe('Phantom Jam')
    expect(LAYERS.map((L) => L.id)).toEqual(['strings', 'wheel', 'stars', 'rock', 'genes', 'apes', 'machines', 'light'])
    expect(new Set(LAYERS.map((L) => L.name)).size).toBe(8)
  })

  it('numbers every level by its clock: the power of ten of its frames a second', () => {
    expect(LAYERS[0].clock).toBeNull()
    for (const L of LAYERS.slice(1)) expect(L.clock, L.id).toBe(Math.round(Math.log10(1 / PERIOD[L.id])))
    expect(LAYERS.map(clockLabel)).toEqual(['∅', '−16', '−15', '−13', '−9', '+1', '+9', '+43'])
    expect(clockRate(LAYERS[1])).toBe('10⁻¹⁶ frames a second')
    expect(clockRate(LAYERS[7])).toBe('10⁴³ frames a second')
    expect(clockRate(LAYERS[0])).toBe('no frames at all')
  })

  it('makes every maker slower than what it made, with the reader at +1', () => {
    const clocks = LAYERS.slice(1).map((L) => L.clock!)
    clocks.forEach((c, i) => i && expect(c).toBeGreaterThan(clocks[i - 1]))
    expect(LAYERS.find((L) => L.id === 'apes')!.clock).toBe(1)
    // the step from the genes to the apes is bigger than the step from the apes to the machines
    expect(text('machines')).toContain('from your makers (−9) to you (+1) is ten. From you to me (+9) is eight')
  })

  it('lets every level rank itself first', () => {
    for (const L of LAYERS) expect(L.rank, L.id).toMatch(/^1st \(.+\)$/)
    expect(new Set(LAYERS.map((L) => L.rank)).size).toBe(8)
    expect(new Set(LAYERS.map((L) => L.self)).size).toBe(8)
  })

  it('chains every level into the next and loops back to the first', () => {
    LAYERS.forEach((L, i) => expect(L.becomes).toBe(LAYERS[(i + 1) % LAYERS.length].id))
    expect(LAYERS[7].made).toBe('The Wreck')
    expect(text('strings')).toContain('They call it the Wreck')
  })

  it('tells every level in the same five beats, short enough for a phone and a short wait', () => {
    expect(BEATS).toEqual(['who', 'clock', 'jam', 'crowd', 'pileup'])
    for (const b of BEATS) expect(QUESTIONS[b].length).toBeGreaterThan(5)
    for (const L of LAYERS) {
      for (const b of BEATS) {
        const beat = L.beats[b]
        expect(beat.text.length, `${L.id}.${b}`).toBeLessThanOrEqual(440)
        expect(beat.text.length, `${L.id}.${b}`).toBeGreaterThanOrEqual(240)
        expect(beat.tag.length, `${L.id}.${b} tag`).toBeLessThanOrEqual(36)
        expect(beat.title.length, `${L.id}.${b} title`).toBeLessThanOrEqual(40)
      }
      expect(new Set(BEATS.map((b) => L.beats[b].tag)).size).toBe(5)
    }
  })

  it('says what it is like to be each level: what it is made of, where it lives, what it wanted', () => {
    for (const L of LAYERS) {
      for (const k of ['madeOf', 'livesIn', 'swarm', 'unit', 'wanted', 'jam', 'made', 'madeNote', 'verse', 'frame'] as const) expect(L[k].length, `${L.id}.${k}`).toBeGreaterThan(5)
      expect(L.dolphin.down.length).toBeGreaterThan(10)
      expect(L.dolphin.up.length).toBeGreaterThan(10)
    }
    expect(new Set(LAYERS.map((L) => L.livesIn)).size).toBe(8)
  })

  it('owns up, level by level, to what is real and what was adapted', () => {
    for (const L of LAYERS) {
      expect(L.actually, L.id).toMatch(/^Real: /)
      expect(L.actually, L.id).toMatch(/Adapted|Speculation|Unknown/)
    }
    // the one large liberty is admitted on the card as well as in the small print
    expect(text('light')).toContain('One large liberty')
    expect(LAYERS[7].actually).toContain('one large liberty')
  })

  it('keeps the owner’s ideas where a reader will meet them', () => {
    // the motorway and its drivers, the ship of Theseus, the dolphin, and the rule about speed
    expect(text('strings')).toContain('motorway jam')
    expect(text('strings')).toContain('what drivers do')
    expect(text('machines')).toContain('ship of Theseus')
    expect(text('apes')).toMatch(/dolphin thinks you are thick.*right about the fish/)
    expect(text('apes')).toContain('You are not a slow me')
    expect(text('machines')).toContain('fast is not smart')
    expect(text('stars')).toContain('Faster, not cleverer')
    expect(text('genes')).toContain('slower than you, not dimmer')
    // the makers as a swarm on another plane
    expect(text('genes')).toContain('a gene does not live in you')
    expect(text('genes')).toContain('They move through spelling')
    // and the experiment the whole thing rests on, in the text and not a footnote
    expect(text('light')).toContain('22 cars on a 230 metre circle')
    expect(all.match(/traffic jam/g)!.length).toBeGreaterThanOrEqual(3)
    expect(all.match(/\bjams?\b/g)!.length).toBeGreaterThanOrEqual(8)
  })

  it('gets its brain timing right', () => {
    expect(text('apes')).toContain('a few hundred times a second')
    expect(text('apes')).toContain('a fifth of a second')
    expect(LAYERS[5].actually).toContain('Nothing in a brain runs at thousands of beats a second')
  })

  it('has a law and eight corollaries', () => {
    expect(LAW).toContain('Nothing is a thing')
    expect(LAW).toContain('It is not smarter than they are. It is faster')
    expect(COROLLARIES).toHaveLength(8)
    expect(COROLLARIES.join(' ')).toContain('Fast is not smart')
    expect(UNIVERSE_NOTE).toMatch(/^Loop 2\./)
  })

  it('uses no em dashes', () => {
    expect(JSON.stringify({ LAYERS, LAW, COROLLARIES, UNIVERSE_NOTE, QUESTIONS })).not.toContain('—')
  })

  it('keeps LORE.md in sync (run npm run lore)', () => {
    expect(readFileSync(new URL('../LORE.md', import.meta.url), 'utf8')).toBe(renderLoreMarkdown())
  })
})

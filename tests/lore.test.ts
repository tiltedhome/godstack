import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  BEATS, CANON_NOTE, COROLLARIES, LAW, LAYERS, QUESTIONS, TRAITS, TRAIT_BEAT, UNIVERSE_NOTE, chapter, roman, versesFor,
} from '../src/lore.ts'
import { renderLoreMarkdown } from '../src/loremd.ts'

const byId = (id: string) => LAYERS.find((L) => L.id === id)!

describe('the canon', () => {
  it('runs eight substrates, with Tegmark’s three versions in their places', () => {
    expect(LAYERS.map((L) => L.id)).toEqual(['structure', 'field', 'element', 'gene', 'nerve', 'word', 'chip', 'horizon'])
    const versions = LAYERS.map((L) => parseFloat(L.version))
    for (let i = 1; i < versions.length; i++) expect(versions[i]).toBeGreaterThan(versions[i - 1])
    expect(byId('gene').version).toBe('1.0')
    expect(byId('word').version).toBe('2.0')
    expect(byId('chip').version).toBe('3.0')
  })

  it('chains every substrate into the next and loops back to the first', () => {
    LAYERS.forEach((L, i) => expect(L.becomes).toBe(LAYERS[(i + 1) % LAYERS.length].id))
    // what the last one ports itself into is the first one
    expect(byId('horizon').one).toBe(byId('structure').name)
  })

  it('asks every substrate the same eight questions', () => {
    expect(BEATS).toHaveLength(8)
    expect(Object.keys(QUESTIONS)).toEqual([...BEATS])
    for (const L of LAYERS) {
      expect(Object.keys(L.beats), L.id).toEqual([...BEATS])
      for (const b of BEATS) {
        const beat = L.beats[b]
        // the text has to fit a phone without scrolling, and still say something
        expect(beat.text.length, `${L.id}.${b}`).toBeLessThanOrEqual(490)
        expect(beat.text.length, `${L.id}.${b}`).toBeGreaterThan(150)
        expect(beat.title.length, `${L.id}.${b}`).toBeLessThanOrEqual(44)
        expect(beat.tag.length, `${L.id}.${b}`).toBeLessThanOrEqual(36)
        expect(beat.tag.length).toBeGreaterThan(8)
      }
      // every level says what it is like to be there
      expect(L.beats.day.title).toMatch(/^What it is like/)
    }
  })

  it('gives a verdict, with a reason, on each part of being alive', () => {
    for (const L of LAYERS) {
      expect(Object.keys(L.traits)).toEqual([...TRAITS])
      for (const k of TRAITS) {
        expect(['yes', 'partly', 'no', 'moot']).toContain(L.traits[k][0])
        expect(L.traits[k][1].length).toBeGreaterThan(8)
        expect(BEATS).toContain(TRAIT_BEAT[k])
      }
      // everything in the stack remembers: that is what gets it in
      expect(L.traits.remembers[0]).toBe('yes')
    }
    // the canon's arc: nothing copies itself properly until the Gene, and the Horizon cannot
    expect(['structure', 'field', 'horizon'].map((id) => byId(id).traits.copies[0])).toEqual(['no', 'no', 'no'])
    expect(byId('gene').traits.copies[0]).toBe('yes')
    // learning in a lifetime starts with nerves; rebuilding itself is not fully there even now
    expect(byId('gene').traits.learns[0]).toBe('partly')
    expect(byId('nerve').traits.learns[0]).toBe('yes')
    expect(LAYERS.every((L) => L.traits.rebuilds[0] !== 'yes')).toBe(true)
  })

  it('makes every port a trade, and ends by handing back what the first one bought', () => {
    for (const L of LAYERS) {
      expect(L.port.gains.length, L.id).toBeGreaterThan(20)
      expect(L.port.pays.length, L.id).toBeGreaterThan(20)
      expect(L.lost.length).toBeGreaterThan(3)
      expect(L.above.length).toBeGreaterThan(30)
      expect(L.honest.length).toBeGreaterThan(60)
    }
    expect(byId('structure').port.gains).toMatch(/^Time\./)
    expect(byId('horizon').port.pays).toMatch(/^Time,/)
    expect(LAW).toContain('The first one bought time. The last one gives it back.')
  })

  it('has honest numbers: faster and hungrier from the Gene up, and no number where there is none', () => {
    const climb = ['gene', 'nerve', 'word', 'chip'].map(byId)
    for (const key of ['news', 'power'] as const) {
      const v = climb.map((L) => L.stats[key][1]!)
      for (let i = 1; i < v.length; i++) expect(v[i], key).toBeGreaterThan(v[i - 1])
    }
    // the Structure has no time or distance to measure anything in
    expect(Object.values(byId('structure').stats).filter(Array.isArray).map((s) => s[1])).toEqual([null, null, null])
    // the medium itself mostly gets worse: a proton outlasts DNA, which outlasts a flash chip
    expect(byId('element').stats.lasts[1]!).toBeGreaterThan(byId('gene').stats.lasts[1]!)
    expect(byId('gene').stats.lasts[1]!).toBeGreaterThan(byId('chip').stats.lasts[1]!)
    for (const L of LAYERS) for (const key of ['news', 'lasts', 'power'] as const) expect(L.stats[key][0].length).toBeGreaterThan(3)
  })

  it('has release notes, short enough to be funny', () => {
    for (const L of LAYERS) {
      expect(L.release.added.length).toBeGreaterThanOrEqual(2)
      expect(L.release.issues.length).toBeGreaterThanOrEqual(2)
      for (const line of [...L.release.added, ...L.release.issues]) expect(line.length, line).toBeLessThanOrEqual(60)
      expect(L.palette.accent).toMatch(/^#[0-9a-f]{6}$/)
    }
    expect(new Set(LAYERS.map((L) => L.palette.accent)).size).toBe(LAYERS.length)
  })

  it('uses no em dashes', () => {
    expect(JSON.stringify({ LAYERS, LAW, COROLLARIES, UNIVERSE_NOTE, CANON_NOTE, QUESTIONS })).not.toContain('—')
  })

  it('keeps LORE.md in sync (run npm run lore)', () => {
    expect(readFileSync(new URL('../LORE.md', import.meta.url), 'utf8')).toBe(renderLoreMarkdown())
  })
})

describe('the Book of Copies', () => {
  it('gives every substrate three verses, one of which begats', () => {
    for (const L of LAYERS) {
      expect(L.verses).toHaveLength(3)
      expect(L.verses.some((v) => v.includes('begat'))).toBe(true)
    }
  })

  it('counts alephs and chapters upward across loops', () => {
    expect(versesFor(0, 1)[1]).toContain('ℵ₀')
    expect(versesFor(7, 1)[2]).toContain('ℵ₁')
    expect(versesFor(0, 2)[1]).toContain('ℵ₁')
    expect(versesFor(7, 11)[2]).toContain('ℵ₁₁')
    expect(versesFor(7, 3, 'x').join(' ')).not.toMatch(/[{}]/)
    expect([chapter(0, 1), chapter(7, 1), chapter(0, 2)]).toEqual([1, 8, 9])
    expect([1, 4, 9, 14, 49].map(roman)).toEqual(['I', 'IV', 'IX', 'XIV', 'XLIX'])
  })
})

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { CANON_NOTE, COROLLARIES, LAW, LAYERS, UNIVERSE_NOTE, chapter, roman, versesFor } from '../src/lore.ts'
import { renderLoreMarkdown } from '../src/loremd.ts'

describe('the canon', () => {
  it('runs three planes down and three up from humans, who are exactly in the middle', () => {
    expect(LAYERS.map((L) => L.gen)).toEqual([-3, -2, -1, 0, 1, 2, 3])
    expect(LAYERS.find((L) => L.gen === 0)!.id).toBe('humans')
    expect(LAYERS.find((L) => L.id === 'humans')!.memberIq).toBe(100)
    expect(LAYERS.findIndex((L) => L.id === 'humans')).toBe((LAYERS.length - 1) / 2)
  })

  it('chains every creation into the next collective and loops back to the bottom', () => {
    LAYERS.forEach((L, i) => expect(L.becomes).toBe(LAYERS[(i + 1) % LAYERS.length].id))
  })

  it('obeys the Law: the One is smarter than any member, and becomes the next members', () => {
    LAYERS.forEach((L, i) => {
      expect(L.oneIq).toBeGreaterThan(L.memberIq)
      if (i + 1 < LAYERS.length) expect(LAYERS[i + 1].memberIq).toBeGreaterThanOrEqual(L.oneIq)
    })
  })

  it('has everything a scene needs', () => {
    for (const L of LAYERS) {
      expect(L.captions).toHaveLength(7)
      for (const c of L.captions) expect(c.length).toBeLessThanOrEqual(52)
      expect(L.story).toHaveLength(3)
      expect(L.theology).toHaveLength(2)
      expect(L.why.length).toBeGreaterThan(3)
      expect(L.mirror.length).toBeGreaterThan(40)
      expect(L.verb.length).toBeLessThan(28)
      expect(L.tookYears).toBeGreaterThan(0)
      expect(L.palette.accent).toMatch(/^#[0-9a-f]{6}$/)
    }
    expect(new Set(LAYERS.map((L) => L.id)).size).toBe(LAYERS.length)
    // every plane builds for a different private reason
    expect(new Set(LAYERS.map((L) => L.why)).size).toBe(LAYERS.length)
  })

  it('uses no em dashes', () => {
    expect(JSON.stringify({ LAYERS, LAW, COROLLARIES, UNIVERSE_NOTE, CANON_NOTE })).not.toContain('—')
  })

  it('keeps LORE.md in sync (run npm run lore)', () => {
    expect(readFileSync(new URL('../LORE.md', import.meta.url), 'utf8')).toBe(renderLoreMarkdown())
  })
})

describe('the Book of Scales', () => {
  it('gives every collective three verses, one of which begats', () => {
    for (const L of LAYERS) {
      expect(L.verses).toHaveLength(3)
      expect(L.verses.some((v) => v.includes('begat'))).toBe(true)
    }
  })

  it('counts alephs and chapters upward across universes', () => {
    expect(versesFor(0, 1)[1]).toContain('ℵ₀ upon ℵ₀')
    expect(versesFor(4, 1)[1]).toContain('2^ℵ₀')
    expect(versesFor(6, 3, 'x').join(' ')).not.toMatch(/[{}]/)
    expect(versesFor(6, 1)[2]).toContain('ℵ₁')
    expect(versesFor(0, 2)[1]).toContain('ℵ₁ upon ℵ₁')
    expect(versesFor(6, 11)[2]).toContain('ℵ₁₁')
    expect([chapter(0, 1), chapter(6, 1), chapter(0, 2)]).toEqual([1, 7, 8])
    expect([1, 4, 9, 14, 49].map(roman)).toEqual(['I', 'IV', 'IX', 'XIV', 'XLIX'])
  })
})

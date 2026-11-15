import { describe, expect, it } from 'vitest'
import { next, previous, parseHash, readingTime } from '../src/engine'
import { chapters } from '../src/lore'
import { renderLoreMarkdown } from '../src/loremd'
import { readFileSync } from 'node:fs'
describe('reader state',()=>{
 it('visits every passage exactly once before the changed second reading',()=>{
  let s={chapter:0,beat:0,loop:0};const visited=new Set<string>()
  for(let i=0;i<24;i++){visited.add(`${s.chapter}/${s.beat}`);s=next(s)}
  expect(visited.size).toBe(24);expect(s).toEqual({chapter:0,beat:0,loop:1})
 })
 it('moves backward across chapter boundaries without losing the reading count',()=>{expect(previous({chapter:2,beat:0,loop:3})).toEqual({chapter:1,beat:2,loop:3});expect(previous({chapter:0,beat:0,loop:0})).toEqual({chapter:7,beat:2,loop:0})})
 it('restores deep links and clamps invalid passages',()=>{
  expect(parseHash('#body/2')).toEqual({chapter:4,beat:1,loop:0})
  for(const hash of ['#unknown/99','#body/-4','#body/NaN','#body/Infinity','#body/1.5']){const s=parseHash(hash);expect(chapters[s.chapter].beats[s.beat]).toBeDefined()}
 })
 it('allows enough time for the full passage and shortens it with tempo',()=>{const text=Array(64).fill('word').join(' ');expect(readingTime(text,1)).toBe(23000);expect(readingTime(text,1.4)).toBeLessThan(readingTime(text,1))})
})
describe('published canon',()=>{
 it('keeps the downloadable reading synchronized',()=>expect(readFileSync('LORE.md','utf8')).toBe(renderLoreMarkdown()))
 it('keeps route IDs unique and the science boundary explicit',()=>{expect(new Set(chapters.map(c=>c.id)).size).toBe(chapters.length);for(const c of chapters){expect(c.note.length).toBeGreaterThan(80);expect(c.beats).toHaveLength(3)}})
 it('preserves house punctuation and reasonably short passages',()=>{expect(JSON.stringify(chapters)).not.toContain('\u2014');for(const c of chapters)for(const b of c.beats)expect(b.text.length).toBeLessThan(520)})
})

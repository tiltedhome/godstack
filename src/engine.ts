import { chapters } from './lore'
export type State = { chapter: number; beat: number; loop: number }
export function next(s: State): State {
  if (s.beat < chapters[s.chapter].beats.length - 1) return { ...s, beat: s.beat + 1 }
  return { chapter: (s.chapter + 1) % chapters.length, beat: 0, loop: s.loop + Number(s.chapter === chapters.length - 1) }
}
export function previous(s: State): State {
  if (s.beat > 0) return { ...s, beat: s.beat - 1 }
  const chapter = (s.chapter - 1 + chapters.length) % chapters.length
  return { ...s, chapter, beat: chapters[chapter].beats.length - 1 }
}
export function parseHash(hash: string): State {
  const [id, beat] = hash.replace(/^#/, '').split('/')
  const chapter = Math.max(0, chapters.findIndex(c => c.id === id))
  return { chapter, beat: Math.max(0, Math.min(chapters[chapter].beats.length - 1, Math.floor(Number(beat) || 1) - 1)), loop: 0 }
}
export function readingTime(text: string, speed: number) { return (3 + text.split(/\s+/).length / 3.2) * 1000 / speed }

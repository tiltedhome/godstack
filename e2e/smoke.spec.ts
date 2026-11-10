import { expect, test, type Page } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { BEATS, BOOK, CANON_NOTE, LAYERS, QUESTIONS, chapter, roman, versesFor } from '../src/lore.ts'
import { LESSONS, MINUTES, NOTES_EARLY } from '../src/minutes.ts'

// Headless Chrome has no GPU and runs WebGL in software, which is slow enough to make the
// timing-sensitive tests flaky. So the suite drives the 2D renderer (?gl=off), which shares
// every line of engine, scene and UI code, and the WebGL layer has its own tests at the end.
const GL_PAGE = new URL('../dist/index.html', import.meta.url).href
const PAGE = GL_PAGE + '?gl=off'
// what the card calls each level; names and text come from the canon, so edits to the
// storyline do not break the tests
const TITLES = LAYERS.map((L) => `Life ${L.version} · ${L.name}`)
const beat = (i: number, b: number) => LAYERS[i].beats[BEATS[b]]

type State = { index: number; octave: number; beat: number; phase: string; t: number }
type Hooks = {
  state: State
  webgl: boolean
  setSpeed(s: number): void
  setAutoplay(on: boolean): void
  set(s: object): void
  reroll(): void
  spin(): { yaw: number; pitch: number }
  degree(): number
  tags(): string[]
  poke(x: number, y: number): string
  glStats(): { lines: number; tris: number; orbs: number; colours: number } | null
  sound: { state: string; enabled: boolean; notes: number; fired: string[] }
}
const hooks = (page: Page) => page.evaluateHandle(() => (window as unknown as { godstack: Hooks }).godstack)
const state = (page: Page) => page.evaluate(() => (window as unknown as { godstack: Hooks }).godstack.state)

let errors: string[]

// How many different colours are on screen: on the 2D canvas, and on the WebGL layer under it.
function distinctColours() {
  const c = document.getElementById('stage') as HTMLCanvasElement
  const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data
  const seen = new Set<number>()
  for (let k = 0; k < d.length; k += 4 * 997) seen.add((d[k] << 16) | (d[k + 1] << 8) | d[k + 2])
  const g = (window as unknown as { godstack: { webgl: boolean; glStats(): { lines: number; colours: number } | null } }).godstack
  const stats = g.glStats()
  return { webgl: g.webgl, gl: stats?.colours ?? 0, lines: stats?.lines ?? 0, total: seen.size + (stats?.colours ?? 0) }
}

test.beforeEach(async ({ page }) => {
  errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  // Fonts are a CDN nicety; keep the test hermetic.
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort())
  await page.goto(PAGE)
  await page.locator('#start-quiet').click()
  await expect(page.locator('#intro')).toBeHidden()
  await expect(page.locator('#name')).toHaveText(TITLES[0])
})

test.afterEach(() => expect(errors).toEqual([]))

test('nothing moves on until the reader does', async ({ page }) => {
  // autoplay is off unless asked for: the first beat is still there seconds later
  await expect(page.locator('#autoplay')).toHaveAttribute('aria-pressed', 'false')
  await page.waitForTimeout(2500)
  expect(await state(page)).toMatchObject({ index: 0, beat: 0, phase: 'read' })
  await expect(page.locator('#beat-text')).toHaveText(beat(0, 0).text)
  await expect(page.locator('#question')).toHaveText(QUESTIONS.substrate)
  await expect(page.locator('#count')).toHaveText('1 of 8')
})

test('the main button reads through a level, one question at a time, then pulls back', async ({ page }) => {
  const act = page.locator('#act')
  for (let b = 1; b < BEATS.length; b++) {
    await expect(act).toHaveText(`Next: ${QUESTIONS[BEATS[b]].toLowerCase()}`)
    await act.click()
    await expect(page.locator('#beat-title')).toHaveText(beat(0, b).title)
    await expect(page.locator('#beat-text')).toHaveText(beat(0, b).text)
    await expect(page.locator('#count')).toHaveText(`${b + 1} of 8`)
    await expect(page.locator('#dots button[aria-current="step"]')).toHaveAttribute('aria-label', `${b + 1}. ${QUESTIONS[BEATS[b]]}`)
  }
  // the leap is playing: a press hurries it to its end, and the next one pulls back
  await expect(act).toHaveText('Porting…')
  await act.click()
  await expect(act).toHaveText(`Pull back: ${LAYERS[1].name}`)
  await act.click()
  await expect(page.locator('#name')).toHaveText(TITLES[1], { timeout: 8000 })
  await expect(page.locator('#beat-title')).toHaveText(beat(1, 0).title)
  // back goes to the end of the level below; the rail and the dots jump anywhere
  await page.locator('#prev').click()
  await expect(page.locator('#name')).toHaveText(TITLES[0])
  await expect(page.locator('#count')).toHaveText('8 of 8')
  await page.locator('#rail button').nth(4).click()
  await expect(page.locator('#name')).toHaveText(TITLES[4])
  await page.locator('#dots button').nth(5).click()
  await expect(page.locator('#beat-title')).toHaveText(beat(4, 5).title)
  await page.locator('#next').click()
  await expect(page.locator('#name')).toHaveText(TITLES[5], { timeout: 8000 })
})

test('the keyboard turns the pages too', async ({ page }) => {
  await page.locator('#stage').focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('#count')).toHaveText('2 of 8')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowLeft')
  await expect(page.locator('#beat-title')).toHaveText(beat(0, 1).title)
  await page.keyboard.press(']')
  await expect(page.locator('#name')).toHaveText(TITLES[1], { timeout: 8000 })
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('[')
  await expect(page.locator('#count')).toHaveText('1 of 8')
  await expect(page.locator('#name')).toHaveText(TITLES[1])
})

test('autoplay, when asked for, reads every level and loops into loop 2', async ({ page }) => {
  test.setTimeout(120_000)
  // Record every level the page shows. Polling the text can sleep through a whole level.
  await page.evaluate(() => {
    const name = document.getElementById('name')!
    const seen: string[] = ((window as unknown as { seen: string[] }).seen = [])
    const note = () => {
      const t = name.textContent ?? ''
      if (t !== seen[seen.length - 1]) seen.push(t)
    }
    note()
    new MutationObserver(note).observe(name, { childList: true, characterData: true, subtree: true })
  })
  await page.locator('#autoplay').click()
  await expect(page.locator('#autoplay')).toHaveAttribute('aria-pressed', 'true')
  await (await hooks(page)).evaluate((g) => g.setSpeed(120))
  const looped = [...TITLES, `${TITLES[0]}, Loop 2`]
  const seen = () => page.evaluate((n) => (window as unknown as { seen: string[] }).seen.slice(0, n), looped.length)
  await expect.poll(seen, { timeout: 90_000 }).toEqual(looped)
  await expect(page.locator('#octave')).toHaveText(/Loop [2-9]/)
})

test('every question of every level paints, and labels what it is about', async ({ page }, info) => {
  const g = await hooks(page)
  await g.evaluate((g) => g.setSpeed(0))
  for (let i = 0; i < LAYERS.length; i++) {
    for (let b = 0; b < BEATS.length; b++) {
      await g.evaluate((g, [i, b]) => g.set({ index: i, beat: b, t: 3 }), [i, b])
      await expect(page.locator('#beat-title')).toHaveText(beat(i, b).title)
      await page.waitForTimeout(70)
      // the callout on the stage is the one the canon gives this beat
      expect(await g.evaluate((g) => g.tags()), `${LAYERS[i].id}.${BEATS[b]}`).toContain(beat(i, b).tag)
      if (b === 2) {
        const distinct = await page.evaluate(distinctColours)
        expect(distinct.webgl).toBe(false)
        expect(distinct.total, `level ${i} looks blank`).toBeGreaterThan(40)
        await page.screenshot({ path: fileURLToPath(new URL(`../test-results/screens/${info.project.name}-${i}.png`, import.meta.url)) })
      }
    }
  }
})

test('the leap and the pull-back paint without errors, at every seam', async ({ page }) => {
  const g = await hooks(page)
  await g.evaluate((g) => g.setSpeed(0))
  for (let i = 0; i < LAYERS.length; i++) {
    for (const t of [0.6, 2.4, 4.5, 6]) {
      await g.evaluate((g, [i, t]) => g.set({ index: i, octave: 2, beat: 7, t }), [i, t])
      await page.waitForTimeout(50)
    }
    for (const t of [0.4, 1.2, 2.1]) {
      await g.evaluate((g, [i, t]) => g.set({ index: i, octave: 2, beat: 7, phase: 'zoom', t }), [i, t])
      await page.waitForTimeout(50)
    }
  }
  await expect(page.locator('#act')).toHaveText('Pulling back…')
  expect((await page.evaluate(distinctColours)).total).toBeGreaterThan(40)
})

test('a tap damages the scene, and each substrate does something different about it', async ({ page }) => {
  const g = await hooks(page)
  const box = (await page.locator('#stage').boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + 200
  const said: string[] = []
  for (let i = 0; i < LAYERS.length; i++) {
    await g.evaluate((g, i) => g.set({ index: i, beat: 3, t: 3 }), i)
    said.push(await g.evaluate((g, [x, y]) => g.poke(x, y), [x, y]))
    // a real tap paints its ripple and does not turn the page
    await page.mouse.click(x, y)
    expect(await state(page)).toMatchObject({ index: i, beat: 3 })
  }
  expect(new Set(said).size).toBe(LAYERS.length)
  expect(said[0]).toBe('nothing to flip')
  expect(said[3]).toMatch(/mended|mutation/)
  expect(said[6]).toMatch(/corrected/)
  // on the beat where the copies are linking up, a tap also introduces a few of them
  await g.evaluate((g) => g.set({ index: 4, beat: 6, t: 0.3 }))
  await g.evaluate((g) => g.setSpeed(0))
  const k0 = await g.evaluate((g) => g.degree())
  await page.mouse.click(x, y)
  expect(await g.evaluate((g) => g.degree())).toBeGreaterThan(k0)
})

test('the form turns by drag and by keyboard, and a flick turns the page', async ({ page }) => {
  const g = await hooks(page)
  const box = (await page.locator('#stage').boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + 190
  const before = await g.evaluate((g) => g.spin())
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 60, y + 25, { steps: 6 })
  await page.waitForTimeout(400)
  await page.mouse.up()
  const dragged = await g.evaluate((g) => g.spin())
  expect(dragged.yaw).toBeGreaterThan(before.yaw + 0.2)
  expect(dragged.pitch).toBeGreaterThan(before.pitch)
  // a slow drag is neither a tap nor a flick: the page has not turned
  expect((await state(page)).beat).toBe(0)
  await page.locator('#act').focus()
  await page.keyboard.press('Tab')
  await page.locator('body').press('d')
  await expect.poll(async () => (await g.evaluate((g) => g.spin())).yaw).toBeGreaterThan(dragged.yaw + 0.05)
  // a quick flick to the left is "next"
  await page.mouse.move(x + 60, y)
  await page.mouse.down()
  await page.mouse.move(x - 60, y)
  await page.mouse.up()
  await expect.poll(async () => (await state(page)).beat).toBe(1)
})

test('ledger opens, lists every substrate and its numbers, and closes with Escape', async ({ page }) => {
  await page.locator('#open-ledger').click()
  await expect(page.locator('#ledger')).toBeVisible()
  await expect(page.locator('#ledger-table tbody tr')).toHaveCount(LAYERS.length)
  // three charts (speed, lifetime, power), each with a bar for every level that has a number
  await expect(page.locator('#chart svg')).toHaveCount(3)
  for (const [n, key] of (['news', 'lasts', 'power'] as const).entries()) {
    await expect(page.locator('#chart svg').nth(n).locator('rect.bar')).toHaveCount(LAYERS.filter((L) => L.stats[key][1] !== null).length)
  }
  await expect(page.locator('#law')).toContainText('Life is information')
  await page.keyboard.press('Escape')
  await expect(page.locator('#ledger')).toBeHidden()
})

test('no horizontal page scroll', async ({ page }) => {
  await page.locator('summary').click()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})

test('the open ledger keeps keyboard focus inside it', async ({ page }) => {
  await page.locator('#open-ledger').click()
  await expect(page.locator('#close-ledger')).toBeFocused()
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('Shift+Tab')
    const inside = await page.evaluate(() => !!document.activeElement?.closest('#ledger') || document.activeElement === document.body)
    expect(inside).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(page.locator('#open-ledger')).toBeFocused()
  await expect(page.locator('#act')).not.toHaveAttribute('inert')
})

test('reduced motion freezes the scene clock', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } })
  const page = await ctx.newPage()
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort())
  await page.goto(PAGE)
  await page.locator('#start-quiet').click()
  await page.evaluate(() => (window as unknown as { godstack: Hooks }).godstack.set({ index: 4, beat: 3 }))
  // long enough for the beat to finish easing in; after that, only the clock could move it
  await page.waitForTimeout(1900)
  const snap = () => page.evaluate(() => (document.getElementById('stage') as HTMLCanvasElement).toDataURL())
  const a = await snap()
  await page.waitForTimeout(700)
  expect(await snap()).toBe(a)
  await ctx.close()
})

test('sound turns on from the button, and every beat, birth and division is heard', async ({ page }) => {
  test.setTimeout(120_000)
  const snd = () => page.evaluate(() => (window as unknown as { godstack: Hooks }).godstack.sound)
  expect((await snd()).state).toBe('none')
  await page.locator('#sound').click()
  await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'true')
  await expect.poll(async () => (await snd()).state).toBe('running')
  await expect.poll(async () => (await snd()).notes, { timeout: 5000 }).toBeGreaterThan(2)
  const g = await hooks(page)
  await g.evaluate((g) => {
    g.setAutoplay(true)
    g.setSpeed(60)
  })
  await expect(page.locator('#octave')).toHaveText('Loop 2', { timeout: 90_000 })
  const { CUES, BIRTH } = await import('../src/audio.ts')
  const fired = new Set((await snd()).fired)
  // every level's first beat is silent only on the very first frame; all the rest must sound
  const wanted = [...Object.values(CUES).flatMap((c) => c.slice(1)), ...Object.values(BIRTH), 'swell', 'divide']
  expect(wanted.filter((n) => !fired.has(n))).toEqual([])
  await page.locator('#sound').click()
  await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'false')
})

test.describe('intro', () => {
  test.beforeEach(async ({ page }) => {
    await page.locator('#brand').click()
    await expect(page.locator('#intro')).toBeVisible()
  })

  test('holds the stack still and keeps focus inside until dismissed', async ({ page }) => {
    await expect(page.locator('#intro-punch')).toHaveText('The current copy.')
    await expect(page.locator('#card')).toHaveAttribute('inert', '')
    const t0 = await state(page)
    await page.waitForTimeout(800)
    expect(await state(page)).toEqual(t0)
  })

  test('tapping the backdrop skips to the punchline', async ({ page }) => {
    await page.locator('#intro').click({ position: { x: 5, y: 5 } })
    await expect(page.locator('#intro')).toHaveClass(/skip/)
    await expect(page.locator('#intro-punch')).toHaveCSS('opacity', '1')
  })

  test('starting with sound plucks the string, then the music', async ({ page }) => {
    await page.locator('#start-sound').click()
    await expect(page.locator('#intro')).toBeHidden()
    await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'true')
    await expect.poll(() => page.evaluate(() => (window as unknown as { godstack: Hooks }).godstack.sound.fired)).toContain('pluck')
    await expect(page.locator('#card')).not.toHaveAttribute('inert')
  })
})

test('deep links open a level, or one question of it, and skip the intro', async ({ page }) => {
  // a hash-only change doesn't reload the page, so start from a fresh document
  await page.goto('about:blank')
  await page.goto(PAGE + '#' + LAYERS[2].id)
  await expect(page.locator('#intro')).toBeHidden()
  await expect(page.locator('#name')).toHaveText(TITLES[2])
  await expect(page.locator('#gl')).toBeHidden()
  await page.goto('about:blank')
  await page.goto(PAGE + '#' + LAYERS[3].id + '-5')
  await expect(page.locator('#name')).toHaveText(TITLES[3])
  await expect(page.locator('#beat-title')).toHaveText(beat(3, 4).title)
  // and the address keeps up as the reader moves
  await page.locator('#act').click()
  await expect.poll(() => page.evaluate(() => location.hash)).toBe(`#${LAYERS[3].id}-6`)
})

test('a remembered sound preference resumes on the first tap', async ({ page }) => {
  const snd = () => page.evaluate(() => (window as unknown as { godstack: Hooks }).godstack.sound)
  await page.evaluate(() => localStorage.setItem('substrate:sound', 'on'))
  // the URL already carries the first level's hash, so the reload is a deep link and skips the intro
  await page.reload()
  await expect(page.locator('#intro')).toBeHidden()
  expect((await snd()).enabled).toBe(false)
  await page.locator('#act').click()
  await expect.poll(async () => (await snd()).enabled).toBe(true)
  expect((await snd()).state).toBe('running')
  await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'true')
})

test('the rest of a level is in the card: verdicts, numbers, the trade, release notes, scripture', async ({ page }) => {
  await page.locator('#rail button').nth(3).click()
  await page.locator('summary').click()
  const L = LAYERS[3]
  await expect(page.locator('#traits li')).toHaveCount(5)
  // the verdict the current question bears on is picked out, and follows the reader
  await expect(page.locator('#traits li.on')).toHaveCount(0)
  await page.locator('#dots button').nth(2).click()
  await expect(page.locator('#traits li.on')).toContainText('Copies itself')
  await expect(page.locator('#f-made')).toHaveText(L.one)
  await expect(page.locator('#f-gains')).toHaveText(L.port.gains)
  await expect(page.locator('#f-pays')).toHaveText(L.port.pays)
  await expect(page.locator('#f-news')).toHaveText(L.stats.news[0])
  await expect(page.locator('#honest')).toHaveText(L.honest)
  await expect(page.locator('#release li')).toHaveCount(L.release.added.length + L.release.issues.length)
  await expect(page.locator('#verses cite')).toHaveText(`${BOOK}, chapter ${roman(chapter(3, 1))}`)
  await expect(page.locator('#verses p')).toHaveCount(3)
  await expect(page.locator('#verses p').nth(2)).toContainText(`4:3${versesFor(3, 1)[2]}`)
})

test('every loop is the same stack with different jokes', async ({ page }) => {
  const g = await hooks(page)
  const accent = () => page.evaluate(() => document.documentElement.style.getPropertyValue('--accent'))
  const margin = () => page.locator('#minutes').textContent()
  expect(await accent()).toBe(LAYERS[0].palette.accent)
  expect(MINUTES[LAYERS[0].id]).toContain(await margin())
  const first = await margin()
  await g.evaluate((g) => g.reroll())
  expect(await margin()).not.toBe(first)

  // loop 1 leaves the canon's note in the constants; later loops leave their own
  await page.locator('summary').click()
  await g.evaluate((g) => g.set({ index: 7, octave: 1 }))
  await expect(page.locator('#verses p').nth(2)).toContainText(`the note read: ${CANON_NOTE}.`)
  await g.evaluate((g) => g.set({ index: 7, octave: 3 }))
  await expect(page.locator('#name')).toHaveText(`${TITLES[7]}, Loop 3`)
  const verse = (await page.locator('#verses p').nth(2).textContent())!
  expect(NOTES_EARLY.some((n) => verse.includes(`the note read: ${n}.`))).toBe(true)
  expect(verse).toContain('loop ℵ₃')
  expect(await accent()).not.toBe(LAYERS[7].palette.accent)

  // loop 2 opens with the long note, loop 5 with what the stack has learned
  await g.evaluate((g) => g.set({ index: 0, octave: 2 }))
  await expect(page.locator('#octave-note')).toContainText('Loop 2.')
  await g.evaluate((g) => g.set({ index: 0, octave: 5 }))
  await expect(page.locator('#octave-note')).toHaveText(LESSONS[2])
  await expect(page.locator('#octave')).toHaveText('Loop 5')
})

test.describe('the WebGL layer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('about:blank')
    await page.goto(GL_PAGE + '#' + LAYERS[0].id)
    await expect(page.locator('#intro')).toBeHidden()
  })

  test('runs wherever the browser has WebGL', async ({ page }) => {
    const has = await page.evaluate(() => !!document.createElement('canvas').getContext('webgl2'))
    const on = await page.evaluate(() => (window as unknown as { godstack: Hooks }).godstack.webgl)
    expect(on).toBe(has)
    await expect(page.locator('#gl')).toBeVisible({ visible: has })
  })

  test('draws the sky and the geometry of every level, and the pull-back between them', async ({ page }, info) => {
    const g = await hooks(page)
    await g.evaluate((g) => g.setSpeed(0))
    test.skip(!(await g.evaluate((g) => g.webgl)), 'no WebGL in this browser')
    for (let i = 0; i < LAYERS.length; i++) {
      await g.evaluate((g, i) => g.set({ index: i, beat: 2, t: 3 }), i)
      await expect(page.locator('#name')).toHaveText(TITLES[i])
      await page.waitForTimeout(150)
      const distinct = await page.evaluate(distinctColours)
      expect(distinct.gl, `level ${i}: nothing on the WebGL layer`).toBeGreaterThan(40)
      // every level but the last is drawn in wire; the Horizon's surface is drawn in 2D
      if (i < LAYERS.length - 1) expect(distinct.lines, `level ${i}: no geometry on the WebGL layer`).toBeGreaterThan(50)
      await page.screenshot({ path: fileURLToPath(new URL(`../test-results/screens/${info.project.name}-gl-${i}.png`, import.meta.url)) })
    }
    await g.evaluate((g) => g.set({ index: 2, octave: 2, beat: 7, phase: 'zoom', t: 1.1 }))
    await page.waitForTimeout(150)
    // mid pull-back the layer is still drawing geometry, for the level being left at least
    expect((await page.evaluate(distinctColours)).lines).toBeGreaterThan(100)
  })
})

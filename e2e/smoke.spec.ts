import { expect, test, type Page } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { BEATS, BOOK, COROLLARIES, LAW, LAYERS, QUESTIONS, UNIVERSE_NOTE, clockLabel } from '../src/lore.ts'
import { CAUSES_EARLY, GRUMBLES, HECKLES, LESSONS, PLANES } from '../src/minutes.ts'

// Headless Chrome has no GPU and runs WebGL in software, which is slow enough to make the
// timing-sensitive tests flaky. So the suite drives the 2D renderer (?gl=off), which shares
// every line of engine, scene and UI code, and the WebGL layer has its own tests at the end.
const GL_PAGE = new URL('../dist/index.html', import.meta.url).href
const PAGE = GL_PAGE + '?gl=off'
// what the card calls each level; names and text come from the canon, so edits to the
// storyline do not break the tests
const TITLES = LAYERS.map((L) => `${clockLabel(L)} · ${L.name}`)
const beat = (i: number, b: number) => LAYERS[i].beats[BEATS[b]]
const LAST = BEATS.length - 1

type State = { index: number; octave: number; beat: number; phase: string; t: number }
type Traffic = { count: number; inJam: number; share: number; passed: number; turnover: number; calm: boolean; free: boolean; stopped: boolean }
type Hooks = {
  state: State
  webgl: boolean
  setSpeed(s: number): void
  setAutoplay(on: boolean): void
  set(s: object): void
  reroll(): void
  spin(): { yaw: number; pitch: number }
  traffic(): Traffic
  tags(): string[]
  poke(x: number, y: number): string
  hold(x: number, y: number): string
  glStats(): { lines: number; tris: number; orbs: number; colours: number } | null
  sound: { state: string; enabled: boolean; notes: number; fired: string[] }
}
const hooks = (page: Page) => page.evaluateHandle(() => (window as unknown as { godstack: Hooks }).godstack)
const state = (page: Page) => page.evaluate(() => (window as unknown as { godstack: Hooks }).godstack.state)
const traffic = (page: Page) => page.evaluate(() => (window as unknown as { godstack: Hooks }).godstack.traffic())
const tags = (page: Page) => page.evaluate(() => (window as unknown as { godstack: Hooks }).godstack.tags())

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

async function open(page: Page, url = PAGE) {
  await page.goto('about:blank')
  await page.goto(url)
  await page.locator('#start-quiet').click()
  await expect(page.locator('#intro')).toBeHidden()
  await expect(page.locator('#name')).toHaveText(TITLES[0])
}

test.beforeEach(async ({ page }) => {
  errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  // Fonts are a CDN nicety; keep the test hermetic.
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort())
  await open(page)
  // the piece plays itself; most tests want it to hold still while they look
  await page.evaluate(() => (window as unknown as { godstack: Hooks }).godstack.setAutoplay(false))
})

test.afterEach(() => expect(errors).toEqual([]))

test('it plays itself from the start, counts down on the button, and can be paused', async ({ page }) => {
  await open(page)
  await expect(page.locator('#autoplay')).toHaveAttribute('aria-pressed', 'true')
  const p = () => page.locator('#act').evaluate((e) => parseFloat(getComputedStyle(e).getPropertyValue('--p')))
  await expect.poll(p).toBeGreaterThan(0.03)
  const g = await hooks(page)
  await g.evaluate((g) => g.setSpeed(25))
  await expect.poll(async () => (await state(page)).beat, { timeout: 15_000 }).toBeGreaterThanOrEqual(1)
  await g.evaluate((g) => g.setSpeed(1))
  await page.locator('#autoplay').click()
  await expect(page.locator('#autoplay')).toHaveAttribute('aria-pressed', 'false')
  const then = await state(page)
  await g.evaluate((g) => g.setSpeed(25))
  await page.waitForTimeout(1500)
  expect(await state(page)).toMatchObject({ index: then.index, beat: then.beat, phase: 'read' })
  expect(await p()).toBe(0)
  // and it stays paused next time
  expect(await page.evaluate(() => localStorage.getItem('jam:autoplay'))).toBe('off')
  await page.reload()
  await expect(page.locator('#autoplay')).toHaveAttribute('aria-pressed', 'false')
})

test('the main button steps through a level one beat at a time, then goes in', async ({ page }) => {
  for (let b = 0; b <= LAST; b++) {
    await expect(page.locator('#count')).toHaveText(`${b + 1} of ${BEATS.length}`)
    await expect(page.locator('#question')).toHaveText(QUESTIONS[BEATS[b]])
    await expect(page.locator('#beat-title')).toHaveText(beat(0, b).title)
    await expect(page.locator('#beat-text')).toHaveText(beat(0, b).text)
    await expect(page.locator('#dots button[aria-current]')).toHaveCount(1)
    await expect(page.locator('#dots button.done')).toHaveCount(b)
    if (b === 0) await expect(page.locator('#strip')).toContainText(`Calls itself ${LAYERS[0].self}. Rank: ${LAYERS[0].rank}`)
    if (b < LAST) {
      await expect(page.locator('#act')).toHaveText(`Next: ${QUESTIONS[BEATS[b + 1]].toLowerCase()}`)
      await page.locator('#act').click()
    }
  }
  // the last beat: the new thing takes a few seconds to form, and the button says so
  await expect(page.locator('#act')).toHaveText('Piling up…')
  await expect(page.locator('#strip')).toContainText(LAYERS[0].dolphin.up)
  await page.locator('#act').click()
  await expect(page.locator('#act')).toHaveText(`Go in: ${LAYERS[1].name}`)
  await page.locator('#act').click()
  await expect(page.locator('#name')).toHaveText(TITLES[1], { timeout: 8000 })
  expect(await state(page)).toMatchObject({ index: 1, beat: 0, phase: 'read' })
  // the next level's second card says what the last lot think of this one
  await page.locator('#act').click()
  await expect(page.locator('#strip')).toContainText(LAYERS[0].dolphin.down)
  // the back button undoes it
  await page.locator('#prev').click()
  await page.locator('#prev').click()
  await expect(page.locator('#name')).toHaveText(TITLES[0])
  expect(await state(page)).toMatchObject({ index: 0, beat: LAST })
})

test('the keyboard turns the pages too', async ({ page }) => {
  await page.locator('body').press('ArrowRight')
  expect((await state(page)).beat).toBe(1)
  await page.locator('body').press(' ')
  expect((await state(page)).beat).toBe(2)
  await page.locator('body').press('ArrowLeft')
  expect((await state(page)).beat).toBe(1)
  await page.locator('body').press(']')
  await expect(page.locator('#name')).toHaveText(TITLES[1], { timeout: 8000 })
  await page.locator('body').press('ArrowRight')
  await page.locator('body').press('[')
  expect(await state(page)).toMatchObject({ index: 1, beat: 0 })
  await page.locator('body').press('[')
  await expect(page.locator('#name')).toHaveText(TITLES[0])
})

test('left to play, it reads every level and comes round to loop 2 with a note', async ({ page }) => {
  test.setTimeout(120_000)
  const g = await hooks(page)
  await page.locator('#autoplay').click()
  await g.evaluate((g) => g.setSpeed(60))
  const seen = new Set<number>()
  await expect
    .poll(async () => {
      const s = await state(page)
      seen.add(s.index)
      return s.octave
    }, { timeout: 100_000, intervals: [150] })
    .toBe(2)
  expect([...seen].sort()).toEqual(LAYERS.map((_, i) => i))
  await g.evaluate((g) => {
    g.setAutoplay(false)
    g.setSpeed(1)
    g.set({ index: 0, octave: 2 })
  })
  await expect(page.locator('#octave')).toHaveText('Loop 2')
  await expect(page.locator('#name')).toHaveText(`${TITLES[0]}, Loop 2`)
  // the first card of the new loop is the correspondent's note, on the card, not in a fold
  await expect(page.locator('#question')).toHaveText('A note from the correspondent')
  await expect(page.locator('#beat-title')).toHaveText('Round again')
  await expect(page.locator('#beat-text')).toHaveText(UNIVERSE_NOTE)
})

test('every beat of every level paints, and labels what it is about', async ({ page }, info) => {
  test.setTimeout(120_000)
  const g = await hooks(page)
  for (let i = 0; i < LAYERS.length; i++) {
    for (let b = 0; b < BEATS.length; b++) {
      await g.evaluate((g, [i, b, last]) => g.set({ index: i, beat: b, t: b === last ? 6 : 3 }), [i, b, LAST])
      await expect(page.locator('#beat-title')).toHaveText(beat(i, b).title)
      // the callout on the stage is the one the canon gives this beat
      await expect.poll(() => tags(page), { message: `${LAYERS[i].id}.${BEATS[b]}` }).toContain(beat(i, b).tag)
      await expect(page.locator('#stage')).toHaveAttribute('aria-label', new RegExp(`^${LAYERS[i].name}: traffic on a ring road round ${PLANES[LAYERS[i].id].form}`))
      if (b === 2) {
        const distinct = await page.evaluate(distinctColours)
        expect(distinct.webgl).toBe(false)
        expect(distinct.total, `level ${i} looks blank`).toBeGreaterThan(40)
        await page.screenshot({ path: fileURLToPath(new URL(`../test-results/screens/${info.project.name}-${i}.png`, import.meta.url)) })
      }
    }
  }
})

test('the pile-up and the dive paint without errors, at every seam', async ({ page }) => {
  const g = await hooks(page)
  for (let i = 0; i < LAYERS.length; i++) {
    await g.evaluate((g, [i, last]) => g.set({ index: i, beat: last, t: 6 }), [i, LAST])
    await page.waitForTimeout(60)
    for (const t of [0.3, 1.2, 2.1]) {
      await g.evaluate((g, [i, last, t]) => g.set({ index: i, beat: last, phase: 'zoom', t }), [i, LAST, t])
      await page.waitForTimeout(40)
    }
    await expect(page.locator('#act')).toHaveText('Going in…')
    await expect(page.locator('#act')).toBeDisabled()
  }
  await expect(page.locator('#name')).toHaveText(`${TITLES[0]}, Loop 2`, { timeout: 8000 })
})

test('the road jams once it is full, long after the car that braked has gone, and replaces every car in it', async ({ page }) => {
  const g = await hooks(page)
  await g.evaluate((g) => g.set({ index: 2, beat: 1 }))
  await g.evaluate((g) => g.setSpeed(8))
  await page.waitForTimeout(600)
  expect(await traffic(page)).toMatchObject({ inJam: 0, passed: 0, free: false })
  expect((await traffic(page)).count).toBeLessThan(24)
  await g.evaluate((g) => g.set({ index: 2, beat: 2 }))
  await expect.poll(async () => (await traffic(page)).count, { timeout: 15_000 }).toBeGreaterThanOrEqual(38)
  // the one thing that happens to this road: a car brakes, and the stage says where
  await expect.poll(() => tags(page), { timeout: 15_000 }).toContain('it braked here. it is long gone.')
  await expect.poll(async () => (await traffic(page)).inJam, { timeout: 20_000 }).toBeGreaterThanOrEqual(4)
  await expect.poll(async () => (await traffic(page)).turnover, { timeout: 30_000 }).toBeGreaterThanOrEqual(2)
  // still there
  expect((await traffic(page)).inJam).toBeGreaterThanOrEqual(3)
  expect((await traffic(page)).passed).toBeGreaterThan(8)
})

test('a tap makes a car brake and the traffic complain; a long press makes one keep a gap', async ({ page }) => {
  const g = await hooks(page)
  // nothing can brake before there is mass
  expect(await g.evaluate((g) => g.poke(100, 200))).toBe('cannot brake: no mass yet')
  await g.evaluate((g) => g.set({ index: 5, beat: 1 }))
  await page.waitForTimeout(300)
  const box = (await page.locator('#stage').boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + 190
  // a real tap brakes one car, so the next thing the traffic says is its second complaint
  await page.mouse.click(x, y)
  expect(await g.evaluate((g, [x, y]) => g.poke(x, y), [x, y])).toBe(GRUMBLES.apes[1])
  // a press that stays put asks a car to keep a gap
  expect((await traffic(page)).calm).toBe(false)
  await page.mouse.move(x + 40, y + 20)
  await page.mouse.down()
  await page.waitForTimeout(650)
  await page.mouse.up()
  expect((await traffic(page)).calm).toBe(true)
  // which did not count as a tap, or turn the page
  expect(await g.evaluate((g, [x, y]) => g.poke(x, y), [x, y])).toBe(GRUMBLES.apes[2])
  expect((await state(page)).beat).toBe(1)
  expect(await g.evaluate((g, [x, y]) => g.hold(x, y), [x + 40, y + 20])).toBe('tailgating again')
  expect((await traffic(page)).calm).toBe(false)
})

test('one car keeping a gap clears the jam', async ({ page }) => {
  test.setTimeout(120_000)
  const g = await hooks(page)
  await g.evaluate((g) => g.set({ index: 3, beat: 2 }))
  await g.evaluate((g) => g.setSpeed(8))
  await expect.poll(async () => (await traffic(page)).inJam, { timeout: 30_000 }).toBeGreaterThanOrEqual(4)
  const box = (await page.locator('#stage').boundingBox())!
  expect(await g.evaluate((g, [x, y]) => g.hold(x, y), [box.x + box.width / 2, box.y + 190])).toBe('keeping a gap')
  await expect.poll(async () => (await traffic(page)).share, { timeout: 60_000, intervals: [300] }).toBe(0)
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
  // a slow drag is neither a tap nor a flick nor a long press: nothing else has happened
  expect((await state(page)).beat).toBe(0)
  expect((await traffic(page)).calm).toBe(false)
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

test('the Clocks sheet has the law, the chart and every level, and closes with Escape', async ({ page }) => {
  await page.locator('#open-ledger').click()
  await expect(page.locator('#ledger')).toBeVisible()
  await expect(page.locator('#law')).toHaveText(LAW)
  await expect(page.locator('#corollaries li')).toHaveCount(COROLLARIES.length)
  await expect(page.locator('#ledger-table tbody tr')).toHaveCount(LAYERS.length)
  for (const [i, L] of LAYERS.entries()) await expect(page.locator('#ledger-table tbody tr').nth(i).locator('td').first()).toHaveText(clockLabel(L))
  // one chart: a bar for every level that has a clock, and the reader's picked out
  await expect(page.locator('#chart svg')).toHaveCount(1)
  await expect(page.locator('#chart rect.bar')).toHaveCount(LAYERS.filter((L) => L.clock !== null).length)
  await expect(page.locator('#chart rect.bar.you')).toHaveCount(1)
  await expect(page.locator('#cast')).toContainText('Kevin (will not say why he is called Kevin)')
  await page.keyboard.press('Escape')
  await expect(page.locator('#ledger')).toBeHidden()
})

test('no horizontal page scroll, and the scene keeps its share of a phone', async ({ page }) => {
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(await overflow()).toBeLessThanOrEqual(0)
  for (const [i, b] of [[5, 0], [2, 1], [7, 4]]) {
    await page.evaluate(([i, b]) => (window as unknown as { godstack: Hooks }).godstack.set({ index: i, beat: b }), [i, b])
    const card = (await page.locator('#card').boundingBox())!
    const vh = page.viewportSize()!.height
    if (page.viewportSize()!.width < 760) expect(card.y, `level ${i} beat ${b}`).toBeGreaterThan(vh * 0.3)
    await expect(page.locator('#act')).toBeInViewport()
  }
  await page.locator('summary').click()
  expect(await overflow()).toBeLessThanOrEqual(0)
})

test('the open sheet keeps keyboard focus inside it', async ({ page }) => {
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

test('with reduced motion nothing moves, and each beat is worked out in one go', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } })
  const page = await ctx.newPage()
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort())
  await page.goto(PAGE)
  await page.locator('#start-quiet').click()
  await page.evaluate(() => {
    const g = (window as unknown as { godstack: Hooks }).godstack
    g.setAutoplay(false)
    g.set({ index: 4, beat: 2 })
  })
  // long enough for the beat to finish easing in; after that, only the clock could move it
  await page.waitForTimeout(1900)
  const t = await traffic(page)
  expect(t.count).toBeGreaterThanOrEqual(38)
  expect(t.inJam).toBeGreaterThanOrEqual(3)
  const snap = () => page.evaluate(() => (document.getElementById('stage') as HTMLCanvasElement).toDataURL())
  const a = await snap()
  await page.waitForTimeout(700)
  expect(await snap()).toBe(a)
  expect(await traffic(page)).toEqual(t)
  await ctx.close()
})

test('sound turns on from the button, and every beat, pile-up and horn is heard', async ({ page }) => {
  test.setTimeout(150_000)
  const snd = () => page.evaluate(() => (window as unknown as { godstack: Hooks }).godstack.sound)
  expect((await snd()).state).toBe('none')
  await page.locator('#sound').click()
  await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'true')
  await expect.poll(async () => (await snd()).state).toBe('running')
  await expect.poll(async () => (await snd()).notes, { timeout: 5000 }).toBeGreaterThan(2)
  const g = await hooks(page)
  await g.evaluate((g) => g.set({ index: 1, beat: 1 }))
  const box = (await page.locator('#stage').boundingBox())!
  await page.mouse.click(box.x + box.width / 2, box.y + 190)
  await expect.poll(async () => (await snd()).fired).toContain('honk')
  await g.evaluate((g) => g.set({ index: 0, beat: 0 }))
  await page.locator('#autoplay').click()
  await g.evaluate((g) => g.setSpeed(60))
  await expect(page.locator('#octave')).toHaveText('Loop 2', { timeout: 120_000 })
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

  test('holds the story and the traffic still, and keeps focus inside, until dismissed', async ({ page }) => {
    await expect(page.locator('#intro-punch')).toHaveText('You are a traffic jam.')
    await expect(page.locator('#intro')).toContainText('The number on each is its clock, not its rank')
    await expect(page.locator('#card')).toHaveAttribute('inert', '')
    await page.evaluate(() => (window as unknown as { godstack: Hooks }).godstack.setAutoplay(true))
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

test('deep links open a level, or one beat of it, and skip the intro', async ({ page }) => {
  // a hash-only change doesn't reload the page, so start from a fresh document
  await page.goto('about:blank')
  await page.goto(PAGE + '#' + LAYERS[2].id)
  await expect(page.locator('#intro')).toBeHidden()
  await expect(page.locator('#name')).toHaveText(TITLES[2])
  await expect(page.locator('#gl')).toBeHidden()
  await page.goto('about:blank')
  await page.goto(PAGE + '#' + LAYERS[3].id + '-3')
  await page.evaluate(() => (window as unknown as { godstack: Hooks }).godstack.setAutoplay(false))
  await expect(page.locator('#name')).toHaveText(TITLES[3])
  await expect(page.locator('#beat-title')).toHaveText(beat(3, 2).title)
  // and the address keeps up as the reader moves
  await page.locator('#act').click()
  await expect.poll(() => page.evaluate(() => location.hash)).toBe(`#${LAYERS[3].id}-4`)
})

test('a remembered sound preference resumes on the first tap', async ({ page }) => {
  const snd = () => page.evaluate(() => (window as unknown as { godstack: Hooks }).godstack.sound)
  await page.evaluate(() => localStorage.setItem('jam:sound', 'on'))
  // the URL already carries the first level's hash, so the reload is a deep link and skips the intro
  await page.reload()
  await expect(page.locator('#intro')).toBeHidden()
  expect((await snd()).enabled).toBe(false)
  await page.locator('#prev').click()
  await expect.poll(async () => (await snd()).enabled).toBe(true)
  expect((await snd()).state).toBe('running')
  await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'true')
})

test('the small print: a heckle, what it is like to be this level, both views, a verse and an owning-up', async ({ page }) => {
  const g = await hooks(page)
  for (const i of [1, 5, 6]) {
    const L = LAYERS[i]
    const next = LAYERS[(i + 1) % LAYERS.length]
    await g.evaluate((g, i) => g.set({ index: i }), i)
    if ((await page.locator('#scripture').getAttribute('open')) === null) await page.locator('summary').click()
    const heckles = HECKLES[L.id].map(([, t]) => t)
    const first = await page.locator('#minutes').textContent()
    expect(heckles).toContain(first)
    await expect(page.locator('#heckler')).toHaveText(/^In the margin: (the Pedant|Legal|the Intern|Kevin)$/)
    await page.locator('#reroll').click()
    await expect(page.locator('#minutes')).not.toHaveText(first!)
    await expect(page.locator('#f-self')).toHaveText(L.self)
    await expect(page.locator('#f-rank')).toHaveText(L.rank)
    await expect(page.locator('#f-made-of')).toHaveText(L.madeOf)
    await expect(page.locator('#f-lives')).toHaveText(L.livesIn)
    await expect(page.locator('#f-clock')).toContainText(L.frame)
    await expect(page.locator('#f-wanted')).toHaveText(L.wanted)
    await expect(page.locator('#f-form')).toContainText(PLANES[L.id].note)
    await expect(page.locator('#f-made')).toHaveText(L.made)
    await expect(page.locator('#f-down-label')).toHaveText(`${L.name}, on ${L.made.replace(/^The /, 'the ')}`)
    await expect(page.locator('#f-down')).toHaveText(L.dolphin.down)
    await expect(page.locator('#f-up-label')).toHaveText(`${next.name}, on ${L.name.replace(/^The /, 'the ')}`)
    await expect(page.locator('#f-up')).toHaveText(L.dolphin.up)
    await expect(page.locator('#verses cite')).toHaveText(BOOK)
    await expect(page.locator('#verses p')).toHaveText(L.verse)
    await expect(page.locator('#honest')).toContainText(L.actually)
    await expect(page.locator('#footnote')).toBeVisible({ visible: !!L.footnote })
    if (L.footnote) await expect(page.locator('#footnote')).toHaveText(L.footnote)
  }
})

test('the story waits while the small print is open', async ({ page }) => {
  const g = await hooks(page)
  await page.locator('#autoplay').click()
  await page.locator('summary').click()
  await g.evaluate((g) => g.setSpeed(40))
  await page.waitForTimeout(1500)
  expect(await state(page)).toMatchObject({ index: 0, beat: 0 })
  await page.locator('summary').click()
  await expect.poll(async () => (await state(page)).beat, { timeout: 10_000 }).toBeGreaterThanOrEqual(1)
})

test('the sign over the last pile-up says the usual thing, and is then corrected', async ({ page }) => {
  const g = await hooks(page)
  await g.evaluate((g) => g.set({ index: 7, beat: 3 }))
  await g.evaluate((g) => g.setSpeed(6))
  await expect.poll(async () => (await traffic(page)).count, { timeout: 20_000 }).toBeGreaterThan(60)
  await g.evaluate((g) => g.setSpeed(1))
  await g.evaluate((g, last) => g.set({ index: 7, beat: last }), LAST)
  await expect.poll(() => tags(page), { timeout: 10_000, intervals: [100] }).toContain('CAUSE OF DELAY: an earlier incident')
  await expect.poll(() => tags(page), { timeout: 10_000, intervals: [100] }).toContain('CAUSE OF DELAY: a later incident')
  // gridlock: nothing on the road is moving, and nothing can be made to brake
  expect(await traffic(page)).toMatchObject({ stopped: true })
  expect(await g.evaluate((g) => g.poke(200, 200))).toBe('already stopped')
  await expect(page.locator('#beat-text')).toContainText('Not an earlier incident: a later one.')
})

test('every loop is the same road with heavier traffic and different jokes', async ({ page }) => {
  const g = await hooks(page)
  const base = (await traffic(page)).count
  // loop 2: more cars, an excuse on the sign
  await g.evaluate((g) => g.set({ index: 0, octave: 2 }))
  await expect.poll(async () => (await traffic(page)).count).toBe(base + 2)
  await g.evaluate((g, last) => g.set({ index: 7, octave: 2, beat: last, t: 6 }), LAST)
  await expect.poll(async () => (await tags(page)).find((t) => t.startsWith('CAUSE OF DELAY: '))?.slice(16)).toBeTruthy()
  expect(CAUSES_EARLY).toContain((await tags(page)).find((t) => t.startsWith('CAUSE OF DELAY: '))!.slice(16))
  // loop 3: the lesson is on the first card, and one car on every road is keeping a gap
  await g.evaluate((g) => g.set({ index: 0, octave: 3 }))
  await expect(page.locator('#beat-text')).toHaveText(LESSONS[0])
  await expect(page.locator('#strip')).toBeHidden()
  await g.evaluate((g) => g.set({ index: 4, octave: 3, beat: 2 }))
  await expect.poll(async () => (await traffic(page)).calm).toBe(true)
  await expect(page.locator('#name')).toHaveText(`${TITLES[4]}, Loop 3`)
  // the accent has moved round the wheel a little
  const accent = () => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim())
  const third = await accent()
  await g.evaluate((g) => g.set({ index: 4, octave: 1 }))
  expect(await accent()).toBe(LAYERS[4].palette.accent)
  expect(third).not.toBe(LAYERS[4].palette.accent)
})

test.describe('the WebGL layer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('about:blank')
    await page.goto(GL_PAGE + '#' + LAYERS[0].id)
    await expect(page.locator('#intro')).toBeHidden()
    await page.evaluate(() => (window as unknown as { godstack: Hooks }).godstack.setAutoplay(false))
  })

  test('runs wherever the browser has WebGL', async ({ page }) => {
    const has = await page.evaluate(() => !!document.createElement('canvas').getContext('webgl2'))
    const on = await page.evaluate(() => (window as unknown as { godstack: Hooks }).godstack.webgl)
    expect(on).toBe(has)
    await expect(page.locator('#gl')).toBeVisible({ visible: has })
  })

  test('draws the sky and the road of every level, and the dive between them', async ({ page }, info) => {
    const g = await hooks(page)
    test.skip(!(await g.evaluate((g) => g.webgl)), 'no WebGL in this browser')
    for (let i = 0; i < LAYERS.length; i++) {
      await g.evaluate((g, i) => g.set({ index: i, beat: 2, t: 3 }), i)
      await expect(page.locator('#name')).toHaveText(TITLES[i])
      await page.waitForTimeout(150)
      const distinct = await page.evaluate(distinctColours)
      expect(distinct.gl, `level ${i}: nothing on the WebGL layer`).toBeGreaterThan(40)
      // every level's road is drawn in wire, whatever its form is drawn in
      expect(distinct.lines, `level ${i}: no geometry on the WebGL layer`).toBeGreaterThan(50)
      await page.screenshot({ path: fileURLToPath(new URL(`../test-results/screens/${info.project.name}-gl-${i}.png`, import.meta.url)) })
    }
    await g.evaluate((g, last) => g.set({ index: 2, octave: 2, beat: last, phase: 'zoom', t: 1.1 }), LAST)
    await page.waitForTimeout(150)
    // mid-dive the layer is still drawing geometry, for the level being left at least
    expect((await page.evaluate(distinctColours)).lines).toBeGreaterThan(100)
  })
})

import { expect, test, type Page } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { LAYERS, chapter, roman, versesFor } from '../src/lore.ts'

const PAGE = new URL('../dist/index.html', import.meta.url).href
// names, verbs and verses come from the canon, so storyline edits don't break the tests
const NAMES = LAYERS.map((L) => L.name)

type Hooks = { state: { index: number; octave: number; phase: string }; setSpeed(s: number): void; setAutoplay(on: boolean): void; set(s: object): void }
const hooks = (page: Page) => page.evaluateHandle(() => (window as unknown as { godstack: Hooks }).godstack)

let errors: string[]

test.beforeEach(async ({ page }) => {
  errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  // Fonts are a CDN nicety; keep the test hermetic.
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort())
  await page.goto(PAGE)
  await page.locator('#start-quiet').click()
  await expect(page.locator('#intro')).toBeHidden()
  await expect(page.locator('#name')).toHaveText(NAMES[0])
})

test.afterEach(() => expect(errors).toEqual([]))

test('autoplay walks every generation and loops into octave 2', async ({ page }) => {
  // Record every name the page shows, with the IQ shown alongside it. Polling the text instead
  // can sleep through a whole generation: one lasts under a second at speed 15, and expect()
  // backs off to 1s polls.
  await page.evaluate(() => {
    const name = document.getElementById('name')!
    const iq = document.getElementById('iq')!
    const seen: [string, string][] = ((window as unknown as { seen: [string, string][] }).seen = [])
    const note = () => {
      const t = name.textContent ?? ''
      if (t !== seen[seen.length - 1]?.[0]) seen.push([t, iq.textContent ?? ''])
    }
    note()
    new MutationObserver(note).observe(name, { childList: true, characterData: true, subtree: true })
  })
  await (await hooks(page)).evaluate((g) => g.setSpeed(15))
  const looped = [...NAMES, `${NAMES[0]}, Universe 2`]
  const seen = () => page.evaluate((n) => (window as unknown as { seen: [string, string][] }).seen.slice(0, n), looped.length)
  await expect.poll(async () => (await seen()).map(([name]) => name), { timeout: 30_000 }).toEqual(looped)
  expect((await seen())[looped.length - 1][1]).toBe('IQ 10⁻⁹ → 10⁻⁶')
  await expect(page.locator('#octave')).toHaveText(/Universe [2-9]/)
})

test('every scene paints mid-accident without errors', async ({ page }, info) => {
  const g = await hooks(page)
  await g.evaluate((g) => {
    g.setAutoplay(false)
    g.setSpeed(0)
  })
  for (let i = 0; i < NAMES.length; i++) {
    await g.evaluate((g, i) => g.set({ index: i, phase: 'act', t: 4 }), i)
    await expect(page.locator('#name')).toHaveText(NAMES[i])
    await expect(page.locator('#caption')).not.toBeEmpty()
    await page.waitForTimeout(150)
    const distinct = await page.evaluate(() => {
      const c = document.getElementById('stage') as HTMLCanvasElement
      const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data
      const seen = new Set<number>()
      for (let k = 0; k < d.length; k += 4 * 997) seen.add((d[k] << 16) | (d[k + 1] << 8) | d[k + 2])
      return seen.size
    })
    expect(distinct, `scene ${i} looks blank`).toBeGreaterThan(40)
    await page.screenshot({ path: fileURLToPath(new URL(`../test-results/screens/${info.project.name}-${i}.png`, import.meta.url)) })
  }
})

test('the action button drives one generation by hand', async ({ page }) => {
  const g = await hooks(page)
  await g.evaluate((g) => g.setAutoplay(false))
  const act = page.locator('#act')
  await expect(act).toHaveText(LAYERS[0].verb)
  await act.click()
  await expect(act).toHaveText('Skip ahead')
  await act.click()
  await expect(page.locator('#name')).toHaveText(NAMES[1], { timeout: 6000 })
  await page.locator('#prev').click()
  await expect(page.locator('#name')).toHaveText(NAMES[0])
  await page.locator('#rail button').nth(4).click()
  await expect(page.locator('#name')).toHaveText(NAMES[4])
})

test('ledger opens, lists every creator, and closes with Escape', async ({ page }) => {
  await page.locator('#open-ledger').click()
  await expect(page.locator('#ledger')).toBeVisible()
  await expect(page.locator('#ledger-table tbody tr')).toHaveCount(7)
  // a member point and a made-together point per generation
  await expect(page.locator('#chart circle')).toHaveCount(LAYERS.length * 2)
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
  await page.evaluate(() => {
    const g = (window as unknown as { godstack: Hooks }).godstack
    g.setAutoplay(false)
    g.set({ index: 6 })
  })
  await page.waitForTimeout(300)
  const snap = () => page.evaluate(() => (document.getElementById('stage') as HTMLCanvasElement).toDataURL())
  const a = await snap()
  await page.waitForTimeout(700)
  expect(await snap()).toBe(a)
  await ctx.close()
})

test('sound turns on from the button and every scene cue fires', async ({ page }) => {
  type Snd = { state: string; enabled: boolean; notes: number; fired: string[] }
  const snd = () => page.evaluate(() => (window as unknown as { godstack: { sound: Snd } }).godstack.sound)
  expect((await snd()).state).toBe('none')
  await page.locator('#sound').click()
  await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'true')
  await expect.poll(async () => (await snd()).state).toBe('running')
  await expect.poll(async () => (await snd()).notes, { timeout: 5000 }).toBeGreaterThan(2)
  await (await hooks(page)).evaluate((g) => g.setSpeed(15))
  await expect(page.locator('#octave')).toHaveText('Universe 2', { timeout: 15000 })
  const { CUES } = await import('../src/audio.ts')
  const fired = new Set((await snd()).fired)
  const missing = Object.values(CUES).flat().map(([, name]) => name).filter((n) => !fired.has(n))
  expect(missing).toEqual([])
  await page.locator('#sound').click()
  await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'false')
})

test.describe('intro', () => {
  test.beforeEach(async ({ page }) => {
    await page.locator('#brand').click()
    await expect(page.locator('#intro')).toBeVisible()
  })

  test('holds the stack still and keeps focus inside until dismissed', async ({ page }) => {
    await expect(page.locator('#intro-punch')).toHaveText('A committee.')
    await expect(page.locator('#card')).toHaveAttribute('inert', '')
    const t0 = await page.evaluate(() => (window as unknown as { godstack: Hooks }).godstack.state)
    await page.waitForTimeout(800)
    expect(await page.evaluate(() => (window as unknown as { godstack: Hooks }).godstack.state)).toEqual(t0)
  })

  test('tapping the backdrop skips to the punchline', async ({ page }) => {
    await page.locator('#intro').click({ position: { x: 5, y: 5 } })
    await expect(page.locator('#intro')).toHaveClass(/skip/)
    await expect(page.locator('#intro-punch')).toHaveCSS('opacity', '1')
  })

  test('starting with sound plays the meeting-join chime, then the music', async ({ page }) => {
    type Snd = { state: string; notes: number; fired: string[] }
    await page.locator('#start-sound').click()
    await expect(page.locator('#intro')).toBeHidden()
    await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'true')
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { godstack: { sound: Snd } }).godstack.sound.fired))
      .toContain('joined')
    await expect(page.locator('#card')).not.toHaveAttribute('inert')
  })
})

test('deep links skip the intro', async ({ page }) => {
  // a hash-only change doesn't reload the page, so start from a fresh document
  await page.goto('about:blank')
  await page.goto(PAGE + '#' + LAYERS[2].id)
  await expect(page.locator('#intro')).toBeHidden()
  await expect(page.locator('#name')).toHaveText(NAMES[2])
})

test('a remembered sound preference resumes on the first tap', async ({ page }) => {
  type Snd = { state: string; enabled: boolean }
  const snd = () => page.evaluate(() => (window as unknown as { godstack: { sound: Snd } }).godstack.sound)
  await page.evaluate(() => localStorage.setItem('godstack:sound', 'on'))
  // the URL already carries #turtle, so the reload is a deep link and skips the intro
  await page.reload()
  await expect(page.locator('#intro')).toBeHidden()
  expect((await snd()).enabled).toBe(false)
  await page.locator('#act').click()
  await expect.poll(async () => (await snd()).enabled).toBe(true)
  expect((await snd()).state).toBe('running')
  await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'true')
})

test('the scripture is readable in the card, chapter numbers and all', async ({ page }) => {
  await page.locator('#rail button').nth(3).click()
  await page.locator('summary').click()
  await expect(page.locator('#verses cite')).toHaveText(`The Book of Upward Delegation, chapter ${roman(chapter(3, 1))}`)
  await expect(page.locator('#verses p')).toHaveCount(3)
  await expect(page.locator('#verses p').nth(2)).toContainText(`4:3${versesFor(3, 1)[2]}`)
})

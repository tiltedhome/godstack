import './styles.css'
import { BEATS, BOOK, LAYERS, QUESTIONS, UNIVERSE_NOTE, clockLabel, clockRate, type Beat } from './lore.ts'
import {
  DUR, LAST, NBEATS, REDUCED_DUR, backward, forward, initial, leapt, progress, readingTime, skip, step, type EngineState,
} from './engine.ts'
import { Renderer } from './render.ts'
import { SCENES, setLoop, tags } from './scenes.ts'
import { buildLedger } from './ledger.ts'
import { Sound, type Sfx } from './audio.ts'
import { PLANES } from './minutes.ts'
import { accentFor, heckleFor, lessonFor } from './rotate.ts'

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T
const N = LAYERS.length
const SIDE = '(min-width: 760px) and (min-aspect-ratio: 1/1)'

const canvas = $<HTMLCanvasElement>('stage')
const card = $('card')
const rail = $('rail')
const actBtn = $<HTMLButtonElement>('act')
const actLabel = $('act-label')
const autoBtn = $<HTMLButtonElement>('autoplay')
const soundBtn = $<HTMLButtonElement>('sound')
const more = $<HTMLDetailsElement>('scripture')
const ledger = $('ledger')

const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)')
const dur = () => (reducedMq.matches ? REDUCED_DUR : DUR)

const store = {
  get(k: string) {
    try {
      return localStorage.getItem(k)
    } catch {
      return null
    }
  },
  set(k: string, v: string) {
    try {
      localStorage.setItem(k, v)
    } catch {
      /* storage can be unavailable; the setting just won't stick */
    }
  },
}

// Deep links: #genes opens a level, #genes-3 opens its third beat.
function fromHash(): EngineState | null {
  const [id, beat] = location.hash.slice(1).split('-')
  const index = LAYERS.findIndex((L) => L.id === id)
  if (index < 0) return null
  const b = Math.min(NBEATS, Math.max(1, parseInt(beat ?? '1', 10) || 1)) - 1
  return { ...initial(index, 1, b), t: b === LAST ? DUR.leap : DUR.settle }
}
const linked = fromHash()
let state: EngineState = linked ?? initial()
// Phantom Jam plays itself, at reading pace, unless the reader has said they would rather
// step through it.
let autoplay = store.get('jam:autoplay') !== 'off'
const sound = new Sound()
let wantSound = store.get('jam:sound') === 'on'
let speed = 1
// how many times "another" has been asked of this level's margin
let rerolls = 0
// every time the reader plays with the road, the beat waits a little longer for them
let grace = 0
const GRACE = 4
const MAX_GRACE = 16

// ?gl=off forces the 2D renderer, for comparing the two and for the tests
const wantGL = new URLSearchParams(location.search).get('gl') !== 'off'
const renderer = new Renderer(canvas, SCENES, LAYERS, wantGL ? $<HTMLCanvasElement>('gl') : null)
if (!wantGL) $('gl').hidden = true

const layer = () => LAYERS[state.index]
// What the card says. The first card of every loop after the first is the correspondent's
// note on coming round again; the reader has met the Strings already.
function beatOf(s: EngineState = state): Beat {
  const beat = LAYERS[s.index].beats[BEATS[s.beat]]
  if (s.index !== 0 || s.beat !== 0 || s.octave < 2) return beat
  return { title: 'Round again', text: s.octave === 2 ? UNIVERSE_NOTE : lessonFor(s.octave), tag: beat.tag }
}

/* ---------------------------------------------------------------- the rail */

const railBtns = LAYERS.map((L, i) => {
  const b = document.createElement('button')
  b.type = 'button'
  b.setAttribute('aria-label', `Clock ${clockLabel(L)}: ${L.name}`)
  b.innerHTML = '<span class="tick"></span><span class="g"></span><span class="n"></span>'
  b.querySelector('.g')!.textContent = clockLabel(L)
  b.querySelector('.n')!.textContent = L.short
  b.addEventListener('click', () => go(initial(i, state.octave)))
  rail.append(b)
  return b
})

// one dot per beat; the current one is wide, the ones already read are filled
const dotBtns = BEATS.map((key, b) => {
  const d = document.createElement('button')
  d.type = 'button'
  d.setAttribute('aria-label', `${b + 1}. ${QUESTIONS[key]}`)
  d.addEventListener('click', () => go({ ...state, phase: 'read', beat: b, from: state.beat, t: 0 }))
  $('dots').append(d)
  return d
})

/* ---------------------------------------------------------------- the card */

// Everything that changes when the level (or the loop) does.
function renderCard() {
  const L = layer()
  const next = LAYERS[(state.index + 1) % N]
  const loop = state.octave
  document.documentElement.style.setProperty('--accent', accentFor(L.palette.accent, loop))
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', L.palette.top)
  setLoop(loop)
  const plane = PLANES[L.id]
  $('octave').textContent = `Loop ${loop}`
  $('dim').textContent = `Clock ${clockLabel(L)}`
  $('name').textContent = `${clockLabel(L)} · ${L.name}${loop > 1 ? `, Loop ${loop}` : ''}`
  $('f-self').textContent = L.self
  $('f-rank').textContent = L.rank
  $('f-made-of').textContent = L.madeOf
  $('f-lives').textContent = L.livesIn
  $('f-swarm').textContent = L.swarm
  $('f-clock').textContent = `${L.frame} (${clockRate(L)})`
  $('f-wanted').textContent = L.wanted
  $('f-jam').textContent = L.jam
  $('f-form').textContent = `${plane.form[0].toUpperCase()}${plane.form.slice(1)}. ${plane.note}`
  $('f-made').textContent = L.made
  $('f-made-note').textContent = L.madeNote
  $('f-down-label').textContent = `${L.name}, on ${lower(L.made)}`
  $('f-down').textContent = L.dolphin.down
  $('f-up-label').textContent = `${next.name}, on ${lower(L.name)}`
  $('f-up').textContent = L.dolphin.up
  $('honest').textContent = L.actually
  rerolls = 0
  renderMinutes()
  const cite = document.createElement('cite')
  cite.textContent = BOOK
  const verse = document.createElement('p')
  // a drop cap on the first letter
  const cap = document.createElement('span')
  cap.className = 'dropcap'
  cap.textContent = L.verse[0]
  verse.append(cap, L.verse.slice(1))
  $('verses').replaceChildren(cite, verse)
  const foot = $('footnote')
  foot.hidden = !L.footnote
  foot.textContent = L.footnote ?? ''
  railBtns.forEach((b, i) => {
    if (i === state.index) b.setAttribute('aria-current', 'step')
    else b.removeAttribute('aria-current')
    b.classList.toggle('done', i < state.index)
  })
}

function renderMinutes() {
  const [who, text] = heckleFor(layer().id, state.octave, rerolls)
  $('heckler').textContent = `In the margin: ${who === 'Pedant' || who === 'Intern' ? 'the ' : ''}${who}`
  $('minutes').textContent = text
}

// "The Wheel" in the middle of a sentence.
const lower = (name: string) => name.replace(/^The /, 'the ')

// The line under the beat's label: the things about a level that say what it is like to be
// it, one or two per beat, so nobody has to open the small print to find out.
function stripFor(): string {
  const L = layer()
  const prev = LAYERS[(state.index + N - 1) % N]
  // the first card of a later loop is the correspondent's note, and needs no caption
  if (state.index === 0 && state.beat === 0 && state.octave > 1) return ''
  switch (BEATS[state.beat]) {
    case 'who':
      return `Calls itself ${L.self}. Rank: ${L.rank}. Wanted: ${L.wanted[0].toLowerCase()}${L.wanted.slice(1)}`
    case 'clock':
      // how it looks to the level before, which is the other half of the dolphin's joke
      return state.index === 0 && state.octave === 1
        ? `Lives in ${L.livesIn}.`
        : `Lives in ${L.livesIn}. ${prev.name}, on ${lower(prev.made)}: “${prev.dolphin.down}”`
    case 'jam':
      return `What it is: ${L.jam}.`
    case 'crowd':
      return `How many: ${L.swarm}.`
    default: {
      const next = LAYERS[(state.index + 1) % N]
      return `${next.name}, on ${lower(L.name)}: “${L.dolphin.up}”`
    }
  }
}

// Everything that changes when the beat does.
function renderBeat() {
  const L = layer()
  const key = BEATS[state.beat]
  const beat = beatOf()
  grace = 0
  $('strip').textContent = stripFor()
  $('count').textContent = `${state.beat + 1} of ${NBEATS}`
  $('question').textContent = beat === L.beats[key] ? QUESTIONS[key] : 'A note from the correspondent'
  $('beat-title').textContent = beat.title
  $('beat-text').textContent = beat.text
  dotBtns.forEach((d, b) => {
    d.classList.toggle('done', b < state.beat)
    if (b === state.beat) d.setAttribute('aria-current', 'step')
    else d.removeAttribute('aria-current')
  })
  canvas.setAttribute('aria-label', `${L.name}: traffic on a ring road round ${PLANES[L.id].form}. ${QUESTIONS[key]}: ${beat.tag}.`)
  try {
    history.replaceState(null, '', `${location.search}#${L.id}${state.beat ? `-${state.beat + 1}` : ''}`)
  } catch {
    /* sandboxed frames may refuse; deep links are a nicety */
  }
}

// How long the current beat is held while playing: its reading time, plus whatever the
// reader has earned by playing with the road.
const dwell = () => readingTime(beatOf().text.length + $('strip').textContent!.length / 2) + grace
// The story holds still while the reader is reading something else.
const held = () => !intro.hidden || !ledger.hidden || more.open

let lastLabel = ''
function renderControls() {
  const next = LAYERS[(state.index + 1) % N]
  let label: string
  if (state.phase === 'zoom') label = 'Going in…'
  else if (state.beat < LAST) label = `Next: ${QUESTIONS[BEATS[state.beat + 1]].toLowerCase()}`
  else label = leapt(state, dur()) ? `Go in: ${next.name}` : 'Piling up…'
  if (label !== lastLabel) {
    lastLabel = label
    actLabel.textContent = label
    actBtn.disabled = state.phase === 'zoom'
    actBtn.classList.toggle('skip', label === 'Piling up…')
  }
  // the countdown: how much of this beat's reading time has gone
  actBtn.style.setProperty('--p', autoplay && !held() ? progress(state, dur(), dwell()).toFixed(3) : '0')
}

function renderSound() {
  soundBtn.setAttribute('aria-pressed', String(sound.enabled))
  soundBtn.setAttribute('aria-label', sound.enabled ? 'Turn sound off' : 'Turn sound on')
}

function setSound(on: boolean) {
  wantSound = on
  store.set('jam:sound', on ? 'on' : 'off')
  if (on) sound.enable().catch(() => {}).finally(renderSound)
  else sound.disable()
  renderSound()
}

function renderAutoplay() {
  autoBtn.setAttribute('aria-pressed', String(autoplay))
  autoBtn.setAttribute('aria-label', autoplay ? 'Pause: I will step through it myself' : 'Play: carry on by itself')
}

// Move to a new state, and redraw whatever that changed.
function go(next: EngineState) {
  const level = next.index !== state.index || next.octave !== state.octave
  const beat = level || next.beat !== state.beat
  const left = state.index
  state = next
  if (level) renderCard()
  // the road just left goes back to how it was found, ready for the next time round (and
  // with the next loop's traffic on it, if this is the same road on a later loop)
  if (level) SCENES[left].reset()
  if (beat) renderBeat()
  renderControls()
}

/* ------------------------------------------------------------------ layout */

// The stage is the part of the screen not covered by the card, so the scene stays visible.
function layoutStage(snap = false) {
  renderer.resize()
  const side = window.matchMedia(SIDE).matches
  const top = rail.getBoundingClientRect().bottom + 6
  const c = card.getBoundingClientRect()
  let r
  if (side) r = { x: 0, y: top, w: Math.max(100, c.left - 12), h: Math.max(100, window.innerHeight - top - 12) }
  else {
    if (more.open && !snap) return
    r = { x: 0, y: top, w: window.innerWidth, h: Math.max(100, c.top + 18 - top) }
  }
  renderer.setStage(r, snap)
}

/* ------------------------------------------------------------------ events */

const stepOn = () => go(forward(state, dur()))
const stepBack = () => go(backward(state, N, dur()))
actBtn.addEventListener('click', stepOn)
$('prev').addEventListener('click', stepBack)
$('next').addEventListener('click', () => go(skip(state)))
soundBtn.addEventListener('click', () => setSound(!sound.enabled))
// Browsers only start audio from a gesture, so a remembered "on" waits for a tap or key.
// Touch grants that permission on pointerup, not pointerdown; keep trying until it takes.
const resumeSound = (e: Event) => {
  const t = e.target as Node
  if (wantSound && !sound.enabled && !soundBtn.contains(t) && !intro.contains(t)) setSound(true)
}
window.addEventListener('pointerup', resumeSound, { capture: true })
window.addEventListener('keydown', resumeSound, { capture: true })
document.addEventListener('visibilitychange', () => sound.visibility(document.hidden))

autoBtn.addEventListener('click', () => {
  autoplay = !autoplay
  store.set('jam:autoplay', autoplay ? 'on' : 'off')
  // start the reading clock for this beat from now
  if (autoplay && state.phase === 'read') state = { ...state, t: Math.min(state.t, state.beat === LAST ? dur().leap : dur().settle) }
  renderAutoplay()
})
$('reroll').addEventListener('click', () => {
  rerolls++
  renderMinutes()
})
more.addEventListener('toggle', () => layoutStage())

/* ------------------------------------------------------------------ intro */

const intro = $('intro')
const behind = () => [canvas, document.querySelector('.top') as HTMLElement, rail, card]
// Size the punchline so its longest word fits the column, at any width and once the
// display font has loaded (its glyphs are much wider than the fallback's).
const punch = $('intro-punch')
function fitPunchline() {
  punch.style.fontSize = ''
  const max = parseFloat(getComputedStyle(punch).fontSize)
  const col = punch.parentElement!.clientWidth
  const words = (punch.textContent ?? '').split(/\s+/)
  const probe = document.createElement('span')
  probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap'
  punch.append(probe)
  let widest = 0
  for (const w of words) {
    probe.textContent = w
    // layout width, not getBoundingClientRect: the pop-in animation scales the punchline
    widest = Math.max(widest, probe.offsetWidth)
  }
  probe.remove()
  // a little slack for the tilt
  if (widest > 0) punch.style.fontSize = `${Math.min(max, (max * col * 0.94) / widest)}px`
}
window.addEventListener('resize', fitPunchline)
document.fonts?.load(`20px "Fraunces"`).then(fitPunchline, () => {})

function openIntro() {
  intro.classList.remove('skip')
  intro.hidden = false
  fitPunchline()
  for (const el of behind()) el.inert = true
  $('start-sound').focus({ preventScroll: true })
}
function closeIntro(withSound: boolean) {
  intro.hidden = true
  for (const el of behind()) el.inert = false
  setSound(withSound)
  if (withSound) sound.ready.then(() => sound.play('pluck'))
  actBtn.focus({ preventScroll: true })
}
$('start-sound').addEventListener('click', () => closeIntro(true))
$('start-quiet').addEventListener('click', () => closeIntro(false))
intro.addEventListener('click', (e) => {
  if (!(e.target as HTMLElement).closest('button')) intro.classList.add('skip')
})
$('brand').addEventListener('click', openIntro)
// deep links like #genes go straight to the stack
if (!linked) openIntro()
else intro.hidden = true

let opener: HTMLElement | null = null
// Everything behind the ledger is inert while it is open, so focus can't wander under it.
function openLedger() {
  opener = document.activeElement as HTMLElement
  for (const el of behind()) el.inert = true
  ledger.hidden = false
  $('close-ledger').focus()
}
function closeLedger() {
  ledger.hidden = true
  for (const el of behind()) el.inert = false
  opener?.focus()
}
$('open-ledger').addEventListener('click', openLedger)
$('close-ledger').addEventListener('click', closeLedger)
ledger.addEventListener('click', (e) => {
  if (e.target === ledger) closeLedger()
})

window.addEventListener('keydown', (e) => {
  if (!intro.hidden) {
    if (e.key === 'Escape') closeIntro(false)
    else if (!(e.target as HTMLElement).closest('button')) intro.classList.add('skip')
    return
  }
  if (!ledger.hidden) {
    if (e.key === 'Escape') closeLedger()
    return
  }
  const onControl = (e.target as HTMLElement).closest('button, summary, a, input')
  if (e.key === 'ArrowRight') stepOn()
  else if (e.key === 'ArrowLeft') stepBack()
  else if (e.key === 'PageDown' || e.key === ']') go(skip(state))
  else if (e.key === 'PageUp' || e.key === '[') go(initial(state.beat ? state.index : (state.index + N - 1) % N, state.octave))
  // A and D turn the form, W and S tip it: the keyboard's version of a drag
  else if ('adws'.includes(e.key.toLowerCase()) && e.key.length === 1 && !e.metaKey && !e.ctrlKey && !onControl) {
    const k = e.key.toLowerCase()
    if (k === 'a' || k === 'd') renderer.spinVel.yaw = k === 'a' ? -1.6 : 1.6
    else renderer.spinVel.pitch = k === 'w' ? -1.2 : 1.2
  } else if ((e.key === ' ' || e.key === 'Enter') && !onControl) {
    e.preventDefault()
    stepOn()
  }
})

// A tap on the road makes the nearest car brake, for about a second. On a quiet road that is
// the end of it. On a busy one it is the start of something that will outlast the car.
function poke(clientX: number, clientY: number) {
  if (state.phase !== 'read') return
  const [x, y] = renderer.toScene(clientX, clientY)
  const word = SCENES[state.index].poke(x, y)
  renderer.ripple(clientX, clientY, accentFor(layer().palette.accent, state.octave), word)
  sound.play('honk')
  grace = Math.min(MAX_GRACE, grace + GRACE)
}

// A long press asks the nearest car to keep a gap and stop passing the braking on. One of
// those is enough to dissolve a jam (Stern and colleagues, 2018), and you can watch it.
function keepGap(clientX: number, clientY: number) {
  if (state.phase !== 'read') return
  const [x, y] = renderer.toScene(clientX, clientY)
  const word = SCENES[state.index].hold(x, y)
  renderer.ripple(clientX, clientY, '#9af2c4', word)
  sound.play('calm')
  grace = Math.min(MAX_GRACE, grace + GRACE * 2)
}

// A drag turns the form; a quick flick sideways turns the page; a press that stays put asks
// a car to keep a gap.
const HOLD_MS = 480
let touchStart: { x: number; y: number; t: number; lx: number; ly: number; timer: number; held: boolean } | null = null
canvas.addEventListener('pointerdown', (e) => {
  const x = e.clientX
  const y = e.clientY
  const timer = window.setTimeout(() => {
    if (!touchStart || Math.hypot(touchStart.lx - x, touchStart.ly - y) > 12) return
    touchStart.held = true
    keepGap(x, y)
  }, HOLD_MS)
  touchStart = { x, y, t: performance.now(), lx: x, ly: y, timer, held: false }
  canvas.setPointerCapture(e.pointerId)
})
canvas.addEventListener('pointermove', (e) => {
  if (!touchStart) return
  const dx = e.clientX - touchStart.lx
  const dy = e.clientY - touchStart.ly
  touchStart.lx = e.clientX
  touchStart.ly = e.clientY
  renderer.spin.yaw += dx * 0.006
  renderer.spin.pitch += dy * 0.006
  renderer.spinVel.yaw = dx * 0.25
  renderer.spinVel.pitch = dy * 0.25
})
canvas.addEventListener('pointerup', (e) => {
  if (!touchStart) return
  const dx = e.clientX - touchStart.x
  const dy = e.clientY - touchStart.y
  const dt = performance.now() - touchStart.t
  const wasHeld = touchStart.held
  window.clearTimeout(touchStart.timer)
  touchStart = null
  if (wasHeld) return
  const flick = dt < 350 && Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 2
  if (flick) {
    renderer.spinVel.yaw = 0
    if (dx < 0) stepOn()
    else stepBack()
  } else if (Math.hypot(dx, dy) < 12) poke(e.clientX, e.clientY)
})
canvas.addEventListener('pointercancel', () => {
  if (touchStart) window.clearTimeout(touchStart.timer)
  touchStart = null
})
canvas.addEventListener('contextmenu', (e) => e.preventDefault())
// On phones that offer it, tilting the device leans the form a little.
window.addEventListener('deviceorientation', (e) => {
  if (reducedMq.matches || e.gamma == null || e.beta == null) return
  renderer.tilt = [Math.max(-1, Math.min(1, e.gamma / 35)), Math.max(-1, Math.min(1, (e.beta - 40) / 35))]
})

window.addEventListener('resize', () => layoutStage(true))
new ResizeObserver(() => layoutStage()).observe(card)

/* -------------------------------------------------------------------- loop */

let last = performance.now()
function tick(now: number) {
  // the traffic keeps going whatever happens; the story waits while the reader is elsewhere
  const real = Math.min(0.1, (now - last) / 1000) * speed
  const dt = held() ? 0 : real
  last = now
  const next = step(state, dt, autoplay, dur(), N, dwell())
  if (next.index !== state.index || next.octave !== state.octave || next.beat !== state.beat) go(next)
  else state = next
  renderControls()
  renderer.frame(state, now / 1000, dur(), reducedMq.matches, intro.hidden ? real : 0)
  sound.frame(state, dur())
  requestAnimationFrame(tick)
}

buildLedger()
renderCard()
renderBeat()
renderAutoplay()
layoutStage(true)
requestAnimationFrame(tick)

// Test hooks (used by the Playwright smoke test).
declare global {
  interface Window {
    godstack: unknown
  }
}
window.godstack = {
  get state() {
    return state
  },
  setSpeed(s: number) {
    speed = s
  },
  set(s: Partial<EngineState>) {
    const beat = s.beat ?? (s.index !== undefined || s.octave !== undefined ? 0 : state.beat)
    go({ ...state, phase: 'read', t: 0, ...s, beat, from: s.from ?? beat })
  },
  get sound() {
    return { state: sound.state, enabled: sound.enabled, notes: sound.notes, fired: sound.fired.slice() }
  },
  sfx(name: Sfx) {
    sound.play(name)
  },
  skipIntro() {
    if (!intro.hidden) closeIntro(false)
  },
  setAutoplay(on: boolean) {
    autoplay = on
    renderAutoplay()
  },
  reroll() {
    rerolls++
    renderMinutes()
  },
  spin() {
    return { ...renderer.spin }
  },
  // whether the WebGL layer is running, how much it drew, and whether it drew anything
  get webgl() {
    return renderer.gl !== null
  },
  glStats() {
    return renderer.gl ? { ...renderer.gl.stats(), colours: renderer.gl.distinctColours() } : null
  },
  // what the road on screen is doing: how many cars, how many in the jam, how many through it
  traffic() {
    return SCENES[state.index].stats()
  },
  // the labels currently drawn over the scene
  tags() {
    return tags.map((t) => t.text)
  },
  // make the nearest car brake, as a tap would, and report what it said
  poke(clientX: number, clientY: number) {
    const [x, y] = renderer.toScene(clientX, clientY)
    return SCENES[state.index].poke(x, y)
  },
  // ask the nearest car to keep a gap, as a long press would
  hold(clientX: number, clientY: number) {
    const [x, y] = renderer.toScene(clientX, clientY)
    return SCENES[state.index].hold(x, y)
  },
}

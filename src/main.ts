import './styles.css'
import { BEATS, BOOK, LAYERS, QUESTIONS, TRAITS, TRAIT_BEAT, TRAIT_LABELS, UNIVERSE_NOTE, chapter, roman, versesFor } from './lore.ts'
import {
  DUR, LAST, NBEATS, REDUCED_DUR, backward, forward, frame as engineFrame, initial, leapt, readingTime, skip, step, type EngineState,
} from './engine.ts'
import { Renderer } from './render.ts'
import { SCENES, linkProgress, setLoop, tags } from './scenes.ts'
import { MARK, buildLedger } from './ledger.ts'
import { Sound, TAPS, type Sfx } from './audio.ts'
import { PLANES } from './minutes.ts'
import { accentFor, lessonFor, minuteFor, noteFor } from './rotate.ts'

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T
const N = LAYERS.length
const SIDE = '(min-width: 760px) and (min-aspect-ratio: 1/1)'

const canvas = $<HTMLCanvasElement>('stage')
const card = $('card')
const rail = $('rail')
const actBtn = $<HTMLButtonElement>('act')
const autoBtn = $<HTMLButtonElement>('autoplay')
const soundBtn = $<HTMLButtonElement>('sound')
const more = $<HTMLDetailsElement>('scripture')
const ledger = $('ledger')

const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)')
const dur = () => (reducedMq.matches ? REDUCED_DUR : DUR)
// the clock the scenes are drawn at: frozen under reduced motion
const sceneTime = () => (reducedMq.matches ? 1 : performance.now() / 1000)

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

// Deep links: #gene opens a level, #gene-3 opens its third question.
function fromHash(): EngineState | null {
  const [id, beat] = location.hash.slice(1).split('-')
  const index = LAYERS.findIndex((L) => L.id === id)
  if (index < 0) return null
  const b = Math.min(NBEATS, Math.max(1, parseInt(beat ?? '1', 10) || 1)) - 1
  return { ...initial(index, 1, b), t: b === LAST ? DUR.leap : DUR.settle }
}
const linked = fromHash()
let state: EngineState = linked ?? initial()
// Substrate is read at the reader's pace. Autoplay is there for people who would rather
// be read to, and is off unless they ask for it.
let autoplay = store.get('substrate:autoplay') === 'on'
const sound = new Sound()
let wantSound = store.get('substrate:sound') === 'on'
let speed = 1
// how many times "another" has been asked of this level's margin
let rerolls = 0

// ?gl=off forces the 2D renderer, for comparing the two and for the tests
const wantGL = new URLSearchParams(location.search).get('gl') !== 'off'
const renderer = new Renderer(canvas, SCENES, LAYERS, wantGL ? $<HTMLCanvasElement>('gl') : null)
if (!wantGL) $('gl').hidden = true

const layer = () => LAYERS[state.index]
const beatOf = (s: EngineState = state) => LAYERS[s.index].beats[BEATS[s.beat]]

/* ---------------------------------------------------------------- the rail */

const railBtns = LAYERS.map((L, i) => {
  const b = document.createElement('button')
  b.type = 'button'
  b.setAttribute('aria-label', `Life ${L.version}: ${L.name}`)
  b.innerHTML = '<span class="tick"></span><span class="g"></span><span class="n"></span>'
  b.querySelector('.g')!.textContent = L.version
  b.querySelector('.n')!.textContent = L.short
  b.addEventListener('click', () => go(initial(i, state.octave)))
  rail.append(b)
  return b
})

// one dot per question; the current one is wide, the ones already read are filled
const dotBtns = BEATS.map((key, b) => {
  const d = document.createElement('button')
  d.type = 'button'
  d.setAttribute('aria-label', `${b + 1}. ${QUESTIONS[key]}`)
  d.addEventListener('click', () => go({ ...state, phase: 'read', beat: b, from: state.beat, t: 0 }))
  $('dots').append(d)
  return d
})

/* ---------------------------------------------------------------- the card */

const li = (text: string, cls = '') => {
  const e = document.createElement('li')
  e.textContent = text
  if (cls) e.className = cls
  return e
}

// Everything that changes when the level (or the loop) does.
function renderCard() {
  const L = layer()
  const loop = state.octave
  document.documentElement.style.setProperty('--accent', accentFor(L.palette.accent, loop))
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', L.palette.top)
  setLoop(loop)
  const plane = PLANES[L.id]
  $('octave').textContent = `Loop ${loop}`
  $('dim').textContent = `Time: ${L.time}`
  $('name').textContent = `Life ${L.version} · ${L.name}${loop > 1 ? `, Loop ${loop}` : ''}`
  $('epithet').textContent = L.epithet
  $('traits').replaceChildren(
    ...TRAITS.map((k) => {
      const [verdict, why] = L.traits[k]
      const e = li('', verdict)
      e.dataset.trait = k
      const mark = document.createElement('span')
      mark.className = 'mark'
      mark.textContent = MARK[verdict]
      const name = document.createElement('b')
      name.textContent = TRAIT_LABELS[k]
      e.append(mark, name, ` ${why}`)
      return e
    }),
  )
  $('f-substrate').textContent = L.substrate
  $('f-unit').textContent = L.unit
  $('f-members').textContent = L.members
  $('f-time').textContent = `${L.time} (it took ${L.took})`
  $('f-news').textContent = L.stats.news[0]
  $('f-lasts').textContent = L.stats.lasts[0]
  $('f-power').textContent = L.stats.power[0]
  $('f-density').textContent = L.stats.density
  $('f-fidelity').textContent = L.stats.fidelity
  $('f-form').textContent = `${plane.form[0].toUpperCase()}${plane.form.slice(1)}. ${plane.note}`
  $('f-made').textContent = L.one
  $('f-made-note').textContent = L.oneNote
  $('f-gains').textContent = L.port.gains
  $('f-pays').textContent = L.port.pays
  $('f-lost').textContent = L.lost
  $('f-above').textContent = L.above
  $('release-title').textContent = `Release notes, Life ${L.version}`
  $('release').replaceChildren(...L.release.added.map((a) => li(a, 'added')), ...L.release.issues.map((a) => li(a, 'issue')))
  $('honest').textContent = L.honest
  rerolls = 0
  renderMinutes()
  const ch = chapter(state.index, loop)
  const cite = document.createElement('cite')
  cite.textContent = `${BOOK}, chapter ${roman(ch)}`
  $('verses').replaceChildren(
    cite,
    ...versesFor(state.index, loop, noteFor(loop)).map((v, k) => {
      const p = document.createElement('p')
      const n = document.createElement('sup')
      n.textContent = `${ch}:${k + 1}`
      if (k === 0) {
        // a drop cap on the chapter's first letter (::first-letter would take the verse number)
        const cap = document.createElement('span')
        cap.className = 'dropcap'
        cap.textContent = v[0]
        p.append(n, cap, v.slice(1))
      } else p.append(n, v)
      return p
    }),
  )
  const foot = $('footnote')
  foot.hidden = !L.footnote
  foot.textContent = L.footnote ?? ''
  const note = $('octave-note')
  note.hidden = !(state.index === 0 && loop > 1)
  note.textContent = loop === 2 ? UNIVERSE_NOTE : lessonFor(loop)
  railBtns.forEach((b, i) => {
    if (i === state.index) b.setAttribute('aria-current', 'step')
    else b.removeAttribute('aria-current')
    b.classList.toggle('done', i < state.index)
  })
}

function renderMinutes() {
  $('minutes').textContent = minuteFor(layer().id, state.octave, rerolls)
}

// Everything that changes when the question does.
function renderBeat() {
  const L = layer()
  const key = BEATS[state.beat]
  const beat = L.beats[key]
  $('count').textContent = `${state.beat + 1} of ${NBEATS}`
  $('question').textContent = QUESTIONS[key]
  $('beat-title').textContent = beat.title
  $('beat-text').textContent = beat.text
  dotBtns.forEach((d, b) => {
    d.classList.toggle('done', b < state.beat)
    if (b === state.beat) d.setAttribute('aria-current', 'step')
    else d.removeAttribute('aria-current')
  })
  // the trait this question is the evidence for
  for (const row of $('traits').children) (row as HTMLElement).classList.toggle('on', TRAIT_BEAT[(row as HTMLElement).dataset.trait as keyof typeof TRAIT_BEAT] === key)
  canvas.setAttribute('aria-label', `${L.name}, life ${L.version}, drawn inside ${PLANES[L.id].form}. ${QUESTIONS[key]}: ${beat.tag}.`)
  try {
    history.replaceState(null, '', `${location.search}#${L.id}${state.beat ? `-${state.beat + 1}` : ''}`)
  } catch {
    /* sandboxed frames may refuse; deep links are a nicety */
  }
}

let lastLabel = ''
function renderControls() {
  const next = LAYERS[(state.index + 1) % N]
  let label: string
  if (state.phase === 'zoom') label = 'Pulling back…'
  else if (state.beat < LAST) label = `Next: ${QUESTIONS[BEATS[state.beat + 1]].toLowerCase()}`
  else label = leapt(state, dur()) ? `Pull back: ${next.name}` : 'Porting…'
  if (label !== lastLabel) {
    lastLabel = label
    actBtn.textContent = label
    actBtn.disabled = state.phase === 'zoom'
    actBtn.classList.toggle('skip', label === 'Porting…')
  }
}

function renderSound() {
  soundBtn.setAttribute('aria-pressed', String(sound.enabled))
  soundBtn.setAttribute('aria-label', sound.enabled ? 'Turn sound off' : 'Turn sound on')
}

function setSound(on: boolean) {
  wantSound = on
  store.set('substrate:sound', on ? 'on' : 'off')
  if (on) sound.enable().catch(() => {}).finally(renderSound)
  else sound.disable()
  renderSound()
}

function renderAutoplay() {
  autoBtn.setAttribute('aria-pressed', String(autoplay))
  autoBtn.setAttribute('aria-label', autoplay ? 'Stop autoplay: I will read at my own pace' : 'Read it to me: turn autoplay on')
}

// Move to a new state, and redraw whatever that changed.
function go(next: EngineState) {
  const level = next.index !== state.index || next.octave !== state.octave
  const beat = level || next.beat !== state.beat
  if (level) {
    SCENES[state.index].graph.reset()
    SCENES[state.index].reset()
  }
  state = next
  if (level) renderCard()
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
  store.set('substrate:autoplay', autoplay ? 'on' : 'off')
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
// deep links like #gene go straight to the stack
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

// A tap on the stage damages whatever is nearest, and the substrate does what it does about
// that: nothing, on the first; a repair you can watch, on the fourth; a correction too fast
// to see, on the seventh. It is the quickest way to find out what "resists entropy" means.
function poke(clientX: number, clientY: number) {
  if (state.phase !== 'read') return
  const L = layer()
  const [x, y] = renderer.toScene(clientX, clientY)
  const word = SCENES[state.index].poke(x, y, sceneTime())
  renderer.ripple(clientX, clientY, accentFor(L.palette.accent, state.octave), word)
  sound.play(TAPS[L.id])
  // on the beat where the copies are linking up, a tap also introduces a few of them
  if (state.beat === LAST - 1) SCENES[state.index].graph.introduce(3)
}

// A drag turns the form; a quick flick sideways turns the page.
let touchStart: { x: number; y: number; t: number; lx: number; ly: number } | null = null
canvas.addEventListener('pointerdown', (e) => {
  touchStart = { x: e.clientX, y: e.clientY, t: performance.now(), lx: e.clientX, ly: e.clientY }
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
  touchStart = null
  const flick = dt < 350 && Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 2
  if (flick) {
    renderer.spinVel.yaw = 0
    if (dx < 0) stepOn()
    else stepBack()
  } else if (Math.hypot(dx, dy) < 12) poke(e.clientX, e.clientY)
})
canvas.addEventListener('pointercancel', () => (touchStart = null))
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
  // the stack waits while the intro is up
  const dt = intro.hidden ? Math.min(0.1, (now - last) / 1000) * speed : 0
  last = now
  const next = step(state, dt, autoplay, dur(), N, readingTime(beatOf().text.length))
  if (next.index !== state.index || next.octave !== state.octave || next.beat !== state.beat) go(next)
  else state = next
  renderControls()
  renderer.frame(state, now / 1000, dur(), reducedMq.matches)
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
  // the real mean degree of the network on screen, which a tap on the right beat raises
  degree() {
    return SCENES[state.index].graph.meanDegree(linkProgress(engineFrame(state, dur())))
  },
  // the labels currently drawn over the scene
  tags() {
    return tags.map((t) => t.text)
  },
  // damage the scene at a point, as a tap would, and report what the substrate did about it
  poke(clientX: number, clientY: number) {
    const [x, y] = renderer.toScene(clientX, clientY)
    return SCENES[state.index].poke(x, y, sceneTime())
  },
}

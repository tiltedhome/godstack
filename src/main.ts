import './styles.css'
import { BOOK, LAYERS, UNIVERSE_NOTE, chapter, roman, versesFor } from './lore.ts'
import { DUR, REDUCED_DUR, advance, back, initial, progress, step, trigger, type EngineState, type Phase } from './engine.ts'
import { formatIQ, genLabel } from './format.ts'
import { Renderer } from './render.ts'
import { SCENES, setLoop } from './scenes.ts'
import { buildLedger } from './ledger.ts'
import { Sound, TAPS, type Sfx } from './audio.ts'
import { PLANES } from './minutes.ts'
import { accentFor, lessonFor, minuteFor, noteFor } from './rotate.ts'

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T
const N = LAYERS.length
const SIDE = '(min-width: 760px) and (min-aspect-ratio: 1/1)'

const canvas = $<HTMLCanvasElement>('stage')
const card = $('card')
const rail = $('rail')
const caption = $('caption')
const actBtn = $<HTMLButtonElement>('act')
const autoBtn = $<HTMLButtonElement>('autoplay')
const soundBtn = $<HTMLButtonElement>('sound')
const scripture = $<HTMLDetailsElement>('scripture')
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

const fromHash = LAYERS.findIndex((L) => L.id === location.hash.slice(1))
let state: EngineState = initial(Math.max(0, fromHash))
let autoplay = store.get('scalemodel:autoplay') !== 'off'
const sound = new Sound()
let wantSound = store.get('scalemodel:sound') === 'on'
let speed = 1
// how many times "another" has been asked of this plane's margin
let rerolls = 0

// ?gl=off forces the 2D renderer, for comparing the two and for the tests
const wantGL = new URLSearchParams(location.search).get('gl') !== 'off'
const renderer = new Renderer(canvas, SCENES, LAYERS, wantGL ? $<HTMLCanvasElement>('gl') : null)
if (!wantGL) $('gl').hidden = true

/* ---------------------------------------------------------------- the rail */

const railBtns = LAYERS.map((L, i) => {
  const b = document.createElement('button')
  b.type = 'button'
  b.setAttribute('aria-label', `Plane ${genLabel(L.gen)}: ${L.name}`)
  b.innerHTML = '<span class="tick"></span><span class="g"></span><span class="n"></span>'
  b.querySelector('.g')!.textContent = genLabel(L.gen)
  b.querySelector('.n')!.textContent = L.short
  b.addEventListener('click', () => go({ ...initial(i, state.octave) }))
  rail.append(b)
  return b
})

/* ---------------------------------------------------------------- the card */

function renderCard() {
  const L = LAYERS[state.index]
  const loop = state.octave
  document.documentElement.style.setProperty('--accent', accentFor(L.palette.accent, loop))
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', L.palette.top)
  setLoop(loop)
  const plane = PLANES[L.id]
  const prev = LAYERS[(state.index + N - 1) % N]
  $('octave').textContent = `Loop ${loop}`
  $('dim').textContent = `Harmonic ${plane.harmonic} of ${N}`
  $('gen').textContent = `Plane ${genLabel(L.gen)}`
  // the thesis, every plane: whoever made these was one plane down, and wanted something else
  $('plane').textContent = `Made by ${prev.one}, one ${state.index === 0 ? 'loop back' : 'plane down'}. Building, in turn, out of ${L.why.toLowerCase()}.`
  $('t-below').textContent = L.theology[0]
  $('t-above').textContent = L.theology[1]
  $('f-plane').textContent = `Harmonic ${plane.harmonic} of the String, ${plane.dims} dimensions (${plane.label}), at ${plane.scale === 'none' ? 'no scale at all' : plane.scale}. ${plane.note}`
  $('f-form').textContent = plane.form[0].toUpperCase() + plane.form.slice(1) + '.'
  $('f-why').textContent = L.why
  $('f-mirror').textContent = L.mirror
  rerolls = 0
  renderMinutes()
  // the algorithm in one line: what each member could do, and what they made together
  $('iq').textContent = `IQ ${formatIQ(L.memberIq)} → ${formatIQ(L.oneIq)}`
  $('name').textContent = loop > 1 ? `${L.name}, Loop ${loop}` : L.name
  $('latin').textContent = L.latin + '.'
  $('epithet').textContent = L.epithet
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
  const story = $('story')
  story.replaceChildren(
    ...L.story.map((s) => {
      const p = document.createElement('p')
      p.textContent = s
      return p
    }),
  )
  $('f-members').textContent = `${L.members}, IQ ${formatIQ(L.memberIq)} each`
  $('f-took').textContent = L.took
  $('f-officially').textContent = L.officially
  $('f-actually').textContent = L.actually
  $('f-made').textContent = `${L.one} (IQ ${formatIQ(L.oneIq)})`
  $('f-made-note').textContent = L.oneNote
  $('f-then').textContent = L.multiplied
  const foot = $('footnote')
  foot.hidden = !L.footnote
  foot.textContent = L.footnote ?? ''
  const note = $('octave-note')
  note.hidden = !(state.index === 0 && loop > 1)
  note.textContent = loop === 2 ? UNIVERSE_NOTE : lessonFor(loop)
  canvas.setAttribute('aria-label', `${L.name}, plane ${genLabel(L.gen)}. ${L.epithet} Drawn inside ${plane.form}.`)
  railBtns.forEach((b, i) => {
    if (i === state.index) b.setAttribute('aria-current', 'step')
    else b.removeAttribute('aria-current')
    b.classList.toggle('done', i < state.index)
  })
  try {
    history.replaceState(null, '', `#${L.id}`)
  } catch {
    /* sandboxed frames may refuse; deep links are a nicety */
  }
}

function renderMinutes() {
  $('minutes').textContent = minuteFor(LAYERS[state.index].id, state.octave, rerolls)
}

let lastPhase: Phase | null = null
let lastCaption = ''

function renderControls() {
  const L = LAYERS[state.index]
  if (state.phase !== lastPhase) {
    lastPhase = state.phase
    actBtn.disabled = state.phase === 'hold' || state.phase === 'zoom'
    actBtn.classList.toggle('skip', state.phase === 'act')
    actBtn.textContent = state.phase === 'idle' ? L.verb : state.phase === 'act' ? 'Skip ahead' : 'Pulling back…'
  }
  let c = ''
  if (state.phase === 'act') c = L.captions[Math.min(L.captions.length - 1, Math.floor(progress(state, dur()) * L.captions.length))]
  else if (state.phase === 'hold') c = L.captions[L.captions.length - 1]
  else if (state.phase === 'zoom') c = `Made, together: ${L.one}`
  if (c !== lastCaption) {
    lastCaption = c
    caption.textContent = c
  }
}

function renderSound() {
  soundBtn.setAttribute('aria-pressed', String(sound.enabled))
  soundBtn.setAttribute('aria-label', sound.enabled ? 'Turn sound off' : 'Turn sound on')
}

function setSound(on: boolean) {
  wantSound = on
  store.set('scalemodel:sound', on ? 'on' : 'off')
  if (on) sound.enable().catch(() => {}).finally(renderSound)
  else sound.disable()
  renderSound()
}

function renderAutoplay() {
  autoBtn.setAttribute('aria-pressed', String(autoplay))
  autoBtn.setAttribute('aria-label', autoplay ? 'Pause autoplay' : 'Start autoplay')
}

function go(next: EngineState) {
  const changed = next.index !== state.index || next.octave !== state.octave
  if (changed) SCENES[state.index].graph.reset()
  state = next
  lastPhase = null
  if (changed) renderCard()
  renderControls()
}

/* ------------------------------------------------------------------ layout */

// The stage is the part of the screen not covered by the card, so the creatures stay visible.
function layoutStage(snap = false) {
  renderer.resize()
  const side = window.matchMedia(SIDE).matches
  const top = rail.getBoundingClientRect().bottom + 6
  const c = card.getBoundingClientRect()
  let r
  if (side) r = { x: 0, y: top, w: Math.max(100, c.left - 12), h: Math.max(100, window.innerHeight - top - 12) }
  else {
    if (scripture.open && !snap) return
    r = { x: 0, y: top, w: window.innerWidth, h: Math.max(100, c.top + 18 - top) }
  }
  renderer.setStage(r, snap)
  const root = document.documentElement.style
  root.setProperty('--cap-x', `${r.x + r.w / 2}px`)
  root.setProperty('--cap-y', `${r.y + r.h - 6}px`)
}

/* ------------------------------------------------------------------ events */

actBtn.addEventListener('click', () => go(trigger(state)))
$('next').addEventListener('click', () => go(advance(state)))
$('prev').addEventListener('click', () => go(back(state, N)))
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
  store.set('scalemodel:autoplay', autoplay ? 'on' : 'off')
  renderAutoplay()
  renderSound()
})
$('reroll').addEventListener('click', () => {
  rerolls++
  renderMinutes()
})
scripture.addEventListener('toggle', () => layoutStage())

/* ------------------------------------------------------------------ intro */

const intro = $('intro')
const behind = () => [canvas, document.querySelector('.top') as HTMLElement, rail, caption, card]
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
// deep links like #orrery go straight to the stack
if (fromHash < 0) openIntro()
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
  if (e.key === 'ArrowRight') go(advance(state))
  else if (e.key === 'ArrowLeft') go(back(state, N))
  // A and D turn the form, W and S tip it: the keyboard's version of a drag
  else if ('adws'.includes(e.key.toLowerCase()) && e.key.length === 1 && !e.metaKey && !e.ctrlKey && !onControl) {
    const k = e.key.toLowerCase()
    if (k === 'a' || k === 'd') renderer.spinVel.yaw = k === 'a' ? -1.6 : 1.6
    else renderer.spinVel.pitch = k === 'w' ? -1.2 : 1.2
  }
  else if ((e.key === ' ' || e.key === 'Enter') && !onControl) {
    e.preventDefault()
    go(trigger(state))
  }
})

// The stage is hands-on. A tap sets things in motion, or, once they are moving, does what a
// tap does on that plane (plucks, perturbs, observes, introduces, entangles, buds, collapses):
// a few more members are linked, there is a ripple and a sound, and the One arrives a little
// sooner. A drag turns the form; a quick flick sideways moves between planes.
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
    go(dx < 0 ? advance(state) : back(state, N))
  } else if (Math.hypot(dx, dy) < 12) {
    if (state.phase === 'act') {
      const L = LAYERS[state.index]
      SCENES[state.index].graph.introduce(3)
      renderer.ripple(e.clientX, e.clientY, accentFor(L.palette.accent, state.octave), TAPS[L.id].word)
      sound.play(TAPS[L.id].sfx, progress(state, dur()))
      // a little nearer the moment of emergence, never past it
      go({ ...state, t: Math.min(dur().act * 0.64, state.t + 0.35) })
    } else go(trigger(state))
  }
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
function frame(now: number) {
  // the stack waits while the intro is up
  const dt = intro.hidden ? Math.min(0.1, (now - last) / 1000) * speed : 0
  last = now
  const prev = state
  state = step(state, dt, autoplay, dur(), N)
  if (state.index !== prev.index || state.octave !== prev.octave) renderCard()
  renderControls()
  renderer.frame(state, now / 1000, dur(), reducedMq.matches)
  sound.frame(state, dur())
  requestAnimationFrame(frame)
}

buildLedger()
// the scripture font is only used on canvas, so ask for it explicitly and re-wrap when it lands
document.fonts?.load('20px "IM Fell English"').then(() => renderer.fontsChanged(), () => {})
renderCard()
renderAutoplay()
layoutStage(true)
requestAnimationFrame(frame)

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
    go({ ...state, ...s })
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
  // the real mean degree of the network on screen, which a tap should raise
  degree() {
    return SCENES[state.index].graph.meanDegree(progress(state, dur()))
  },
}

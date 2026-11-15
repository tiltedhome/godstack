// A ring road with cars on it. This is the thing every scene in the cut is built round.
//
// The model is the optimal-velocity model of Bando and colleagues (1995): every car steers
// toward the speed it would like at its present distance from the car in front,
//
//     dv/dt = a (V(h) - v)        V(h) = tanh(h - 2) + tanh(2)
//
// and that is all. There is no accident in the equations. Spread the cars evenly and they
// can all cruise at V(L/N); but that state is only stable while V'(L/N) < a/2. Put more cars
// on the road than that and any wobble grows into a jam, which then rolls backwards round
// the ring for ever while the cars go forwards through it. With a = 1 and a road 100 long
// that is every count from 35 to 89. Sugiyama and colleagues did it with real cars in 2008.
//
// Positions are in road units along the ring (0 to LENGTH), speeds in road units per unit
// of model time, and step() takes real seconds.

export const LENGTH = 100
export const SENSITIVITY = 1
export const VMAX = Math.tanh(2) + 1 // the speed on an empty road, near enough
export const TIMESCALE = 4.2 // model time units per real second
const DT = 0.04 // integration step, in model time
const MIN_GAP = 0.45 // bumper to bumper
const BRAKE = 3.2 // how hard a braking car brakes, relative to a
export const SLOW = 0.32 // a car below this fraction of VMAX is "in the jam"
const CALM = 0.9 // a calm car aims a little under the speed the road could manage if nobody bunched

export const optimal = (h: number) => Math.tanh(h - 2) + Math.tanh(2)
const slope = (h: number) => 1 / Math.cosh(h - 2) ** 2
// Would evenly spaced traffic of this many cars stay evenly spaced?
export const stable = (n: number) => n < 2 || slope(LENGTH / n) < SENSITIVITY / 2

export interface Car {
  id: number // stays with the car for life, so a scene can colour it and follow it
  x: number // where it is on the ring
  v: number
  braking: number // model time left of a forced brake
  calm: boolean // keeps a gap and does not pass the braking on
  laps: number // how many times it has been round
  slowFor: number // model time spent in the jam, this visit
}

const wrap = (x: number) => ((x % LENGTH) + LENGTH) % LENGTH

export class Ring {
  cars: Car[] = []
  // The strings before the Wreck: nothing notices the thing in front, and everything goes
  // flat out. Turn it off and the traffic starts to interact.
  free = false
  // A lid on every speed, 0 to 1. The last level closes it, and that is gridlock.
  limit = 1
  // A stretch of road that is slow whoever is on it (a spiral arm, say): the fraction of
  // its usual speed a car can manage at x. Left unset, the road is the same all the way round.
  drag: ((x: number) => number) | null = null
  time = 0 // model time
  private nextId = 0
  private target = 0
  private carry = 0

  constructor(n = 0, jitter = 0.2, seed = 1) {
    let s = seed >>> 0 || 1
    const r = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296)
    for (let i = 0; i < n; i++) {
      const h = LENGTH / n
      this.cars.push(this.make(wrap(i * h + (r() - 0.5) * jitter * h), optimal(h)))
    }
    this.cars.sort((a, b) => a.x - b.x)
    this.target = n
  }

  private make(x: number, v: number): Car {
    return { id: this.nextId++, x, v, braking: 0, calm: false, laps: 0, slowFor: 0 }
  }

  get count() {
    return this.cars.length
  }

  // Ask for a different number of cars. They join and leave one at a time as the road
  // steps, into the biggest gap and out of the tightest one, so nothing ever jumps.
  setCount(n: number) {
    this.target = Math.max(0, Math.round(n))
  }

  // The distance from car i to the car in front, along the road.
  headway(i: number): number {
    const n = this.cars.length
    if (n < 2) return LENGTH
    const d = this.cars[(i + 1) % n].x - this.cars[i].x
    return d > 0 ? d : d + LENGTH
  }

  // Make a car brake for a while (real seconds). This is the "accident": it is over almost
  // at once, and on a busy road that makes no difference.
  brake(i: number, seconds = 1.2) {
    const c = this.cars[i]
    if (c) c.braking = Math.max(c.braking, seconds * TIMESCALE)
  }

  // The car nearest a point on the ring.
  nearest(x: number): number {
    let best = -1
    let bd = Infinity
    for (let i = 0; i < this.cars.length; i++) {
      let d = Math.abs(this.cars[i].x - wrap(x))
      d = Math.min(d, LENGTH - d)
      if (d < bd) {
        bd = d
        best = i
      }
    }
    return best
  }

  // One car on the road keeps a gap, or none does.
  setCalm(on: boolean) {
    const has = this.cars.some((c) => c.calm)
    if (on && !has && this.cars.length) this.cars[0].calm = true
    if (!on) for (const c of this.cars) c.calm = false
  }

  step(seconds: number) {
    this.carry += Math.min(seconds, 0.1) * TIMESCALE
    while (this.carry >= DT) {
      this.carry -= DT
      this.tick()
    }
  }

  private tick() {
    const cars = this.cars
    this.time += DT
    if (cars.length !== this.target && Math.floor(this.time / 0.6) !== Math.floor((this.time - DT) / 0.6)) this.resize()
    const n = cars.length
    if (!n) return
    // accelerations first, from the state as it stands
    const cruise = CALM * optimal(LENGTH / n) * this.limit
    const acc = new Array<number>(n)
    for (let i = 0; i < n; i++) {
      const c = cars[i]
      let want = (this.free ? VMAX : optimal(this.headway(i))) * this.limit
      if (this.drag) want *= this.drag(c.x)
      // a calm car will not go faster than the whole road could manage, however inviting
      // the gap in front of it. The gap is what soaks up the wave (Stern and colleagues, 2018).
      if (c.calm && !this.free) want = Math.min(want, cruise)
      let a = SENSITIVITY * (want - c.v)
      if (c.braking > 0) a = -BRAKE * c.v
      acc[i] = a
    }
    for (let i = 0; i < n; i++) {
      const c = cars[i]
      c.v = Math.max(0, c.v + acc[i] * DT)
      if (c.braking > 0) c.braking = Math.max(0, c.braking - DT)
      c.slowFor = c.v < SLOW * VMAX ? c.slowFor + DT : 0
    }
    // then move, never through the car in front (free traffic does not notice it)
    for (let i = 0; i < n; i++) {
      const c = cars[i]
      let dx = c.v * DT
      if (!this.free && n > 1) {
        const room = this.headway(i) - MIN_GAP
        if (dx > room) {
          dx = Math.max(0, room)
          c.v = Math.min(c.v, cars[(i + 1) % n].v)
        }
      }
      c.x += dx
      if (c.x >= LENGTH) {
        c.x -= LENGTH
        c.laps++
      }
    }
    if (this.free) cars.sort((a, b) => a.x - b.x)
    else if (n > 1 && cars[n - 1].x < cars[n - 2].x) cars.unshift(cars.pop()!) // the front car came round
  }

  private resize() {
    const cars = this.cars
    const n = cars.length
    if (n < this.target) {
      if (!n) {
        cars.push(this.make(0, this.free ? VMAX : optimal(LENGTH)))
        return
      }
      let at = 0
      let big = -1
      for (let i = 0; i < n; i++) {
        const h = this.headway(i)
        if (h > big) {
          big = h
          at = i
        }
      }
      if (big < MIN_GAP * 3) return // no room just now
      const a = cars[at]
      const b = cars[(at + 1) % n]
      const car = this.make(wrap(a.x + big / 2), Math.min(a.v, b.v, optimal(big / 2)))
      cars.push(car)
      cars.sort((p, q) => p.x - q.x)
    } else if (n > this.target) {
      let at = -1
      let small = Infinity
      for (let i = 0; i < n; i++) {
        const h = this.headway(i)
        if (h < small && !cars[i].calm && i !== this.tagged) {
          small = h
          at = i
        }
      }
      if (at >= 0) cars.splice(at, 1)
    }
  }

  // The car a scene is following, so the viewer can watch one thing go through the jam and
  // out the other side. Index into cars, or -1.
  private tagId = -1
  get tagged(): number {
    return this.tagId < 0 ? -1 : this.cars.findIndex((c) => c.id === this.tagId)
  }
  set tagged(i: number) {
    this.tagId = i >= 0 && this.cars[i] ? this.cars[i].id : -1
  }

  // Is this car in the jam?
  slow(i: number): boolean {
    return this.cars[i].v < SLOW * VMAX
  }

  // The share of the cars that are in it.
  jammed(): number {
    const n = this.cars.length
    if (!n || this.free) return 0
    let k = 0
    for (let i = 0; i < n; i++) if (this.slow(i)) k++
    return k / n
  }

  meanSpeed(): number {
    const n = this.cars.length
    if (!n) return 0
    let s = 0
    for (const c of this.cars) s += c.v
    return s / n
  }

  // Where the jam is and how many cars are in it: the biggest unbroken run of slow cars.
  // `at` is the middle of the run, `back` its upstream end (where cars are joining).
  jam(): { at: number; back: number; front: number; size: number; ids: number[] } | null {
    const n = this.cars.length
    if (n < 3 || this.free) return null
    let start = -1
    for (let i = 0; i < n; i++) if (!this.slow(i)) { start = i; break }
    if (start < 0) return { at: this.cars[0].x, back: this.cars[0].x, front: this.cars[n - 1].x, size: n, ids: this.cars.map((c) => c.id) }
    let best = 0
    let bestFrom = -1
    let run = 0
    let from = -1
    for (let k = 1; k <= n; k++) {
      const i = (start + k) % n
      if (this.slow(i)) {
        if (!run) from = i
        run++
        if (run > best) {
          best = run
          bestFrom = from
        }
      } else run = 0
    }
    if (best < 2) return null
    const back = this.cars[bestFrom].x
    const front = this.cars[(bestFrom + best - 1) % n].x
    const span = front >= back ? front - back : front + LENGTH - back
    const ids: number[] = []
    for (let k = 0; k < best; k++) ids.push(this.cars[(bestFrom + k) % n].id)
    return { at: wrap(back + span / 2), back, front, size: best, ids }
  }
}

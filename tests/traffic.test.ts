import { describe, expect, it } from 'vitest'
import { LENGTH, Ring, VMAX, optimal, stable } from '../src/traffic.ts'

const run = (r: Ring, seconds: number, each?: (t: number) => void) => {
  for (let k = 0; k < seconds * 60; k++) {
    r.step(1 / 60)
    each?.(k / 60)
  }
}
const order = (r: Ring) => {
  const ids = r.cars.map((c) => c.id)
  const k = ids.indexOf(Math.min(...ids))
  return ids.slice(k).concat(ids.slice(0, k)).join(',')
}

describe('the road', () => {
  it('is only stable while it is quiet: 35 to 89 cars will not stay evenly spaced', () => {
    expect([2, 16, 34].map(stable)).toEqual([true, true, true])
    expect([35, 40, 52, 89].map(stable)).toEqual([false, false, false, false])
    expect(stable(90)).toBe(true)
  })

  it('forgets an accident on a quiet road', () => {
    const r = new Ring(16, 0.2, 7)
    run(r, 2)
    r.brake(3, 1.2)
    run(r, 1)
    expect(r.cars.some((c) => c.v < 0.5 * VMAX)).toBe(true)
    run(r, 20)
    expect(r.jammed()).toBe(0)
    expect(r.jam()).toBeNull()
    expect(r.meanSpeed()).toBeCloseTo(optimal(LENGTH / 16), 1)
  })

  it('keeps the jam on a busy road, long after the car that braked has driven off', () => {
    const r = new Ring(40, 0.2, 7)
    run(r, 2)
    const culprit = r.cars[3].id
    r.brake(3, 1.2)
    run(r, 60)
    const jam = r.jam()!
    expect(jam.size).toBeGreaterThanOrEqual(5)
    const car = r.cars.find((c) => c.id === culprit)!
    expect(car.braking).toBe(0)
    expect(car.laps).toBeGreaterThan(0)
    // and it is still there a minute later
    run(r, 60)
    expect(r.jam()!.size).toBeGreaterThanOrEqual(5)
  })

  it('rolls the jam backwards while every car goes forwards', () => {
    const r = new Ring(40, 0.2, 7)
    run(r, 2)
    r.brake(3, 1.2)
    run(r, 40)
    let last = r.jam()!.back
    let drift = 0
    const before = r.cars.map((c) => c.x + c.laps * LENGTH)
    const ids = r.cars.map((c) => c.id)
    run(r, 30, () => {
      const j = r.jam()
      if (!j) return
      let d = j.back - last
      if (d > LENGTH / 2) d -= LENGTH
      if (d < -LENGTH / 2) d += LENGTH
      drift += d
      last = j.back
    })
    expect(drift).toBeLessThan(-20)
    ids.forEach((id, i) => {
      const c = r.cars.find((x) => x.id === id)!
      expect(c.x + c.laps * LENGTH).toBeGreaterThan(before[i] + 20)
    })
  })

  it('never loses a car and never lets one overtake', () => {
    const r = new Ring(46, 0.2, 9)
    const was = order(r)
    run(r, 2)
    r.brake(10, 1.5)
    run(r, 50, () => {
      for (let i = 0; i < r.count; i++) expect(r.headway(i)).toBeGreaterThan(0.2)
    })
    expect(r.count).toBe(46)
    expect(order(r)).toBe(was)
  })

  it('is a ship of Theseus: a few seconds on, the same jam is made of different cars', () => {
    const r = new Ring(40, 0.2, 7)
    run(r, 2)
    r.brake(3, 1.2)
    run(r, 45)
    const then = new Set(r.jam()!.ids)
    run(r, 7)
    const now = r.jam()!
    expect(now.size).toBeGreaterThanOrEqual(5)
    expect(now.ids.filter((id) => then.has(id))).toEqual([])
  })

  it('needs no accident at all, given enough cars', () => {
    const r = new Ring(46, 0.2, 7)
    run(r, 40)
    expect(r.jammed()).toBeGreaterThan(0.15)
  })

  it('dissolves the jam if one car in forty holds a steady speed and lets a gap open', () => {
    for (const n of [38, 46, 52]) {
      const r = new Ring(n, 0.2, 7)
      r.setCalm(true)
      run(r, 2)
      r.brake(3, 1.2)
      run(r, 10)
      expect(r.jammed(), `${n} cars, just after`).toBeGreaterThan(0.05)
      run(r, 70)
      expect(r.jammed(), `${n} cars, later`).toBe(0)
      expect(r.cars.filter((c) => c.calm)).toHaveLength(1)
    }
  })

  it('takes cars on and lets them off one at a time, and never the one being followed', () => {
    const r = new Ring(18, 0.2, 3)
    r.tagged = 0
    const followed = r.cars[0].id
    r.setCount(40)
    run(r, 0.5)
    expect(r.count).toBeGreaterThan(18)
    expect(r.count).toBeLessThan(40)
    run(r, 15)
    expect(r.count).toBe(40)
    r.setCount(12)
    run(r, 15)
    expect(r.count).toBe(12)
    expect(r.cars[r.tagged].id).toBe(followed)
  })

  it('goes flat out when nothing notices anything, and stops dead when the lid comes down', () => {
    const r = new Ring(40, 0.5, 3)
    r.free = true
    run(r, 6)
    for (const c of r.cars) expect(c.v).toBeCloseTo(VMAX, 1)
    expect(r.jammed()).toBe(0)
    r.free = false
    r.limit = 0
    run(r, 10)
    for (const c of r.cars) expect(c.v).toBeLessThan(0.01)
  })

  it('finds the car nearest a place on the road', () => {
    const r = new Ring(10, 0, 1)
    expect(r.cars[r.nearest(r.cars[4].x + 0.3)].id).toBe(r.cars[4].id)
    expect(r.nearest(LENGTH - 0.1)).toBe(0)
  })
})

import { describe, expect, it } from 'vitest'
import {
  GOLDEN_ANGLE, INRADIUS, KEPLER_ORDER, PHI, PLATONIC, e8Edges, e8Roots, e8Shadow, fibSphere, kepler, metatron, penrose, project,
  torus, torusPoint, type SolidName,
} from '../src/solid.ts'
import { cube, cubeCorners } from '../src/hyper.ts'
import { ZOOM, pullBack } from '../src/render.ts'

const len = (v: number[]) => Math.hypot(...v)

describe('the Platonic solids', () => {
  const counts: Record<SolidName, [number, number, number]> = {
    tetrahedron: [4, 6, 4],
    cube: [8, 12, 6],
    octahedron: [6, 12, 8],
    dodecahedron: [20, 30, 12],
    icosahedron: [12, 30, 20],
  }
  it('have the right corners and edges, and obey Euler: V − E + F = 2', () => {
    for (const [name, [v, e, f]] of Object.entries(counts) as [SolidName, [number, number, number]][]) {
      const s = PLATONIC[name]
      expect(s.verts, name).toHaveLength(v)
      expect(s.edges, name).toHaveLength(e)
      expect(v - e + f).toBe(2)
      for (const p of s.verts) expect(len(p)).toBeCloseTo(1, 9)
      // every edge the same length, every corner with the same number of edges
      const lengths = s.edges.map(([a, b]) => len(s.verts[a].map((x, k) => x - s.verts[b][k])))
      for (const l of lengths) expect(l).toBeCloseTo(lengths[0], 9)
      const degree = new Array(v).fill(0)
      for (const [a, b] of s.edges) {
        degree[a]++
        degree[b]++
      }
      expect(new Set(degree).size).toBe(1)
    }
  })

  it('have inscribed spheres where the textbooks say: duals share one', () => {
    expect(INRADIUS.cube).toBeCloseTo(INRADIUS.octahedron, 12)
    expect(INRADIUS.dodecahedron).toBeCloseTo(INRADIUS.icosahedron, 12)
    expect(INRADIUS.tetrahedron).toBeCloseTo(1 / 3, 12)
    // check one against the geometry itself: the centre of a cube's face is 1/√3 out
    const c = PLATONIC.cube.verts
    const face = c.filter((p) => p[0] > 0)
    const mid = [0, 1, 2].map((k) => face.reduce((s, p) => s + p[k], 0) / face.length)
    expect(len(mid)).toBeCloseTo(INRADIUS.cube, 9)
  })
})

describe('Kepler’s nest', () => {
  it('runs cube, tetrahedron, dodecahedron, icosahedron, octahedron, from Saturn in', () => {
    expect(KEPLER_ORDER).toEqual(['cube', 'tetrahedron', 'dodecahedron', 'icosahedron', 'octahedron'])
    const { shells, orbits } = kepler()
    expect(shells).toHaveLength(5)
    expect(orbits).toHaveLength(6)
    for (let i = 1; i < 6; i++) expect(orbits[i]).toBeLessThan(orbits[i - 1])
    shells.forEach((s, i) => expect(s.r).toBe(orbits[i]))
  })

  it('nearly fits, and is wrong, exactly as much as it was in 1596', () => {
    const { orbits } = kepler()
    // the real orbits, as fractions of Saturn's: Jupiter, Mars, Earth, Venus, Mercury
    const real = [5.2, 1.524, 1, 0.723, 0.387].map((a) => a / 9.54)
    // Jupiter comes out within about 6 percent...
    expect(Math.abs(orbits[1] / real[0] - 1)).toBeLessThan(0.07)
    // ...and Mercury is off by most of its own orbit
    expect(orbits[5] / real[4]).toBeGreaterThan(1.5)
  })
})

describe('the other forms', () => {
  it('builds a torus as a grid of two circles', () => {
    const t = torus(1, 0.4, 12, 6)
    expect(t.verts).toHaveLength(72)
    expect(t.edges).toHaveLength(144)
    for (const [x, y, z] of t.verts) expect((Math.hypot(x, z) - 1) ** 2 + y * y).toBeCloseTo(0.16, 9)
    expect(torusPoint(0, 0, 1, 0.4)).toEqual([1.4, 0, 0])
  })

  it('sows a sphere by the golden angle, which is 137.5 degrees', () => {
    expect((GOLDEN_ANGLE * 180) / Math.PI).toBeCloseTo(137.5078, 3)
    expect(PHI * PHI).toBeCloseTo(PHI + 1, 12)
    const pts = fibSphere(144)
    for (const p of pts) expect(len(p)).toBeCloseTo(1, 9)
    // evenly spread: the centre of mass is at the centre
    const mean = [0, 1, 2].map((k) => pts.reduce((s, p) => s + p[k], 0) / pts.length)
    expect(len(mean)).toBeLessThan(0.02)
  })

  it('fits twelve spheres round a thirteenth, and joins every centre: Metatron’s cube', () => {
    const m = metatron()
    expect(m.verts).toHaveLength(13)
    expect(m.edges).toHaveLength(78)
    // the twelve all touch the middle one (distance 1 between centres of radius-½ spheres)...
    for (const p of m.verts.slice(1)) expect(len(p)).toBeCloseTo(1, 9)
    // ...and each touches four of the others: the 24 edges of a cuboctahedron
    expect(m.shell).toHaveLength(24)
    for (const [a, b] of m.shell) expect(len(m.verts[a].map((x, k) => x - m.verts[b][k]))).toBeCloseTo(1, 9)
  })

  it('finds the 240 roots of E8, each with 56 nearest neighbours', () => {
    const roots = e8Roots()
    expect(roots).toHaveLength(240)
    for (const r of roots) expect(r.reduce((s, x) => s + x * x, 0)).toBeCloseTo(2, 12)
    expect(new Set(roots.map((r) => r.join(','))).size).toBe(240)
    // closed under negation, as a root system must be
    const keys = new Set(roots.map((r) => r.join(',')))
    for (const r of roots) expect(keys.has(r.map((x) => (x === 0 ? 0 : -x)).join(','))).toBe(true)
    const edges = e8Edges(roots)
    expect(edges).toHaveLength(6720)
    const degree = new Array(240).fill(0)
    for (const [a, b] of edges) {
      degree[a]++
      degree[b]++
    }
    expect(new Set(degree)).toEqual(new Set([56]))
  })

  it('casts E8’s shadow onto a few nested shells, and keeps it bounded while it turns', () => {
    const roots = e8Roots()
    const radii = new Set(roots.map((r) => len(e8Shadow(r, 0)).toFixed(3)))
    expect(radii.size).toBeLessThanOrEqual(8)
    for (const t of [0, 3, 50, 1000]) for (const r of roots) expect(len(e8Shadow(r, t))).toBeLessThanOrEqual(Math.SQRT2 + 1e-9)
  })

  it('tiles the plane Penrose’s way: fivefold, two rhombus edges only, never a repeat', () => {
    const t = penrose(4)
    expect(t.edges.length).toBeGreaterThan(300)
    // every edge is the same length (both rhombi have unit sides)
    const lengths = t.edges.map(([a, b]) => Math.hypot(t.pts[a][0] - t.pts[b][0], t.pts[a][1] - t.pts[b][1]))
    for (const l of lengths) expect(l).toBeCloseTo(lengths[0], 6)
    // fivefold symmetry: turning the points by 72 degrees gives the same set of points
    const key = (x: number, y: number) => `${Math.round(x * 1e4)},${Math.round(y * 1e4)}`
    const set = new Set(t.pts.map(([x, y]) => key(x, y)))
    const c = Math.cos((2 * Math.PI) / 5)
    const s = Math.sin((2 * Math.PI) / 5)
    for (const [x, y] of t.pts) expect(set.has(key(x * c - y * s, x * s + y * c))).toBe(true)
    // each subdivision multiplies the tile count by about φ²
    expect(penrose(5).edges.length / t.edges.length).toBeGreaterThan(2.4)
    expect(penrose(5).edges.length / t.edges.length).toBeLessThan(2.8)
  })

  it('still builds real n-cubes: 2^n corners, n·2^(n-1) edges', () => {
    for (let n = 0; n <= 9; n++) {
      const g = cube(n)
      expect(g.verts).toHaveLength(2 ** n)
      expect(g.edges).toHaveLength(n * 2 ** Math.max(0, n - 1))
      for (const [a, b] of g.edges) expect(g.verts[a].filter((v, k) => v !== g.verts[b][k])).toHaveLength(1)
    }
    expect(cubeCorners(5, 1.5, { yaw: 0.2, pitch: 0.1 }, 60)).toHaveLength(32)
  })
})

describe('the camera', () => {
  it('projects with perspective: nearer is bigger, and the centre stays put', () => {
    const view = { yaw: 0, pitch: 0 }
    expect(project([0, 0, 0], view, 50)).toMatchObject({ x: 0, y: 0, z: 0, k: 1 })
    const near = project([1, 0, 1], view, 50)
    const far = project([1, 0, -1], view, 50)
    expect(near.x).toBeGreaterThan(far.x)
    expect(near.k).toBeGreaterThan(1)
    expect(far.k).toBeLessThan(1)
    // a quarter turn about the vertical carries +x to the far side
    const turned = project([1, 0, 0], { yaw: Math.PI / 2, pitch: 0 }, 50)
    expect(turned.x).toBeCloseTo(0, 9)
    expect(turned.z).toBeCloseTo(-1, 9)
  })

  it('pulls back so the plane being left lands exactly on its socket, 1/ZOOM the size', () => {
    const sock: [number, number] = [37, -22]
    const start = pullBack(sock, 0)
    // at the start the old plane fills the stage and the new one is ZOOM times too big
    expect(start.inner).toEqual({ c: [-0, 0], z: 1 })
    expect(start.outer.z).toBe(ZOOM)
    expect(start.outer.c).toEqual(sock)
    const end = pullBack(sock, 1)
    expect(end.outer.z).toBeCloseTo(1, 12)
    expect(end.outer.c[0]).toBeCloseTo(0, 12)
    expect(end.inner.z).toBeCloseTo(1 / ZOOM, 12)
    // all the way through, the old plane's centre and the new plane's socket are the same
    // point on screen: that is what makes one a detail of the other
    for (const u of [0, 0.2, 0.5, 0.8, 1]) {
      const cam = pullBack(sock, u)
      const socketOnScreen = [(sock[0] - cam.outer.c[0]) * cam.outer.z, (sock[1] - cam.outer.c[1]) * cam.outer.z]
      const centreOnScreen = [(0 - cam.inner.c[0]) * cam.inner.z, (0 - cam.inner.c[1]) * cam.inner.z]
      expect(socketOnScreen[0]).toBeCloseTo(centreOnScreen[0], 9)
      expect(socketOnScreen[1]).toBeCloseTo(centreOnScreen[1], 9)
      expect(cam.outer.z / cam.inner.z).toBeCloseTo(ZOOM, 9)
    }
  })
})

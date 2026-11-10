// The WebGL layer, drawn with three.js underneath the 2D canvas. It does the two jobs the
// GPU is much better at than Canvas 2D:
//
//   the sky      one fragment shader for the gradient, the plane's Julia set and, between
//                planes, the Mandelbrot set, at half the screen's resolution instead of the
//                110 pixels across the CPU version could afford
//   the forms    every wireframe, lit translucent face and sphere of the sacred geometry,
//                additively blended and run through a bloom pass so the lines glow
//
// The scenes still do their own rotation and perspective on the CPU (solid.ts), because the
// characters drawn in 2D have to stand exactly on the corners. So this layer is a painter: it
// is handed points that are already projected, in scene units, plus the camera transform the
// 2D canvas is using, and it puts them in the same place. If WebGL is not available nothing
// here runs and the renderer falls back to drawing all of it in 2D, as the v3 cut does.

import {
  AdditiveBlending, BufferAttribute, BufferGeometry, ColorManagement, DoubleSide, DynamicDrawUsage, LineBasicMaterial,
  LineSegments, LinearSRGBColorSpace, Mesh, MeshBasicMaterial, OrthographicCamera, PlaneGeometry, Points, Scene,
  ShaderMaterial, Vector2, WebGLRenderTarget, WebGLRenderer,
} from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

export interface GLPoint {
  x: number
  y: number
  z: number
  k?: number
}

export interface SkyOpts {
  top: string
  bottom: string
  top2: string
  bottom2: string
  blend: number // 0 = the first gradient, 1 = the second
  tint: string // the accent the fractal is drawn in
  c: [number, number] // the Julia constant
  center: [number, number] // where on the Mandelbrot set the map is centred
  span: number // how much of the map is in view
  onMap: number // 0 = Julia sky, 1 = Mandelbrot map
  time: number
  drift: number // 0 holds the sky still (reduced motion)
  glow: [number, number] // centre of the stage, in CSS pixels
}

const MAX_LINES = 16000
const MAX_TRIS = 9000
const MAX_ORBS = 3000

const rgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

const SKY_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`

// The same colouring as the CPU sky in fractal.ts: smooth escape counts, slow moving bands,
// the plane's tint lifting toward white only right at the boundary of the set.
const SKY_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec3 top, bottom, top2, bottom2, tint;
uniform float blend, aspect, span, onMap, time, drift;
uniform vec2 c, center, glow, size;

vec4 shade(vec2 z, vec2 k, float bandRate, float inside) {
  float i = 0.0;
  float r2 = 0.0;
  for (int n = 0; n < 56; n++) {
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + k;
    r2 = dot(z, z);
    if (r2 > 16.0) break;
    i += 1.0;
  }
  if (i >= 56.0) return vec4(tint * inside, 1.0);
  float nu = i + 1.0 - log2(log(r2) / 2.0);
  float u = clamp(nu / 44.0, 0.0, 1.0);
  float band = 0.55 + 0.45 * sin(nu * bandRate - time * 0.6);
  float a = pow(u, 1.25) * (0.55 + 0.45 * band);
  float lift = pow(u, 4.0) * 0.22;
  return vec4(min(vec3(1.0), mix(tint * 0.35, tint, u * band) + lift) * a * a, a);
}

vec3 screen(vec3 a, vec3 b) { return 1.0 - (1.0 - a) * (1.0 - b); }

void main() {
  vec2 p = (vUv * 2.0 - 1.0) * vec2(aspect, -1.0);
  vec3 col = mix(mix(top, bottom, 1.0 - vUv.y), mix(top2, bottom2, 1.0 - vUv.y), blend);
  vec2 px = vec2(vUv.x, 1.0 - vUv.y) * size;
  float d = length(px - glow) / (max(size.x, size.y) * 0.7);
  col += tint * 0.14 * max(0.0, 1.0 - d);
  if (onMap < 0.999) {
    vec2 k = c + drift * 0.012 * vec2(cos(time * 0.11), sin(time * 0.13));
    col = screen(col, shade(p * 1.55, k, 0.55, 0.03).rgb * 0.5 * (1.0 - onMap));
  }
  if (onMap > 0.001) {
    col = screen(col, shade(vec2(0.0), center + p * span * 0.5, 0.7, 0.03).rgb * 0.62 * onMap);
  }
  gl_FragColor = vec4(col, 1.0);
}`

const ORB_VERT = /* glsl */ `
attribute vec4 col;
attribute float radius;
varying vec4 vCol;
uniform float ratio;
void main() {
  vCol = col;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = radius * 2.0 * ratio;
}`

// A sphere, faked on a point sprite: a bright rim, a soft body and a highlight up and left.
const ORB_FRAG = /* glsl */ `
precision mediump float;
varying vec4 vCol;
void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float r = length(q);
  if (r > 1.0) discard;
  float rim = smoothstep(0.78, 0.97, r) * (1.0 - smoothstep(0.97, 1.0, r));
  float body = 0.16 * (1.0 - r * r);
  float spec = 0.35 * smoothstep(0.5, 0.0, length(q - vec2(-0.35, -0.4)));
  gl_FragColor = vec4(vCol.rgb * (rim * 0.9 + body + spec) * vCol.a, 1.0);
}`

export class GLLayer {
  ok = false
  private renderer!: WebGLRenderer
  private composer!: EffectComposer
  private bloom!: UnrealBloomPass
  private scene = new Scene()
  private camera = new OrthographicCamera(0, 1, 0, 1, -10, 10)
  private skyScene = new Scene()
  private skyMat!: ShaderMaterial
  private skyTarget!: WebGLRenderTarget
  private finalScene = new Scene()
  private finalMat!: ShaderMaterial
  private orbMat!: ShaderMaterial
  private linePos = new Float32Array(MAX_LINES * 6)
  private lineCol = new Float32Array(MAX_LINES * 8)
  private triPos = new Float32Array(MAX_TRIS * 9)
  private triCol = new Float32Array(MAX_TRIS * 12)
  private orbPos = new Float32Array(MAX_ORBS * 3)
  private orbCol = new Float32Array(MAX_ORBS * 4)
  private orbRad = new Float32Array(MAX_ORBS)
  private lines!: LineSegments
  private tris!: Mesh
  private orbs!: Points
  private nLine = 0
  private nTri = 0
  private nOrb = 0
  // the camera the 2D canvas is using for the scene being drawn: px = o + units × k
  private k = 1
  private ox = 0
  private oy = 0
  private a = 1
  private W = 1
  private H = 1

  constructor(canvas: HTMLCanvasElement) {
    try {
      // colours here are the same sRGB hex values the 2D canvas uses, passed straight through
      ColorManagement.enabled = false
      this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' })
      this.renderer.outputColorSpace = LinearSRGBColorSpace
      this.renderer.autoClear = false
      this.build()
      this.ok = true
    } catch {
      this.ok = false
    }
  }

  private build() {
    this.skyMat = new ShaderMaterial({
      vertexShader: SKY_VERT,
      fragmentShader: SKY_FRAG,
      depthTest: false,
      uniforms: {
        top: { value: [0, 0, 0] }, bottom: { value: [0, 0, 0] }, top2: { value: [0, 0, 0] }, bottom2: { value: [0, 0, 0] },
        tint: { value: [1, 1, 1] }, blend: { value: 0 }, aspect: { value: 1 }, span: { value: 1 }, onMap: { value: 0 },
        time: { value: 0 }, drift: { value: 1 }, c: { value: new Vector2() }, center: { value: new Vector2() },
        glow: { value: new Vector2() }, size: { value: new Vector2(1, 1) },
      },
    })
    this.skyScene.add(new Mesh(new PlaneGeometry(2, 2), this.skyMat))
    this.skyTarget = new WebGLRenderTarget(2, 2, { depthBuffer: false })
    const dyn = (arr: Float32Array, size: number) => new BufferAttribute(arr, size).setUsage(DynamicDrawUsage)
    const glowing = { vertexColors: true, transparent: true, blending: AdditiveBlending, depthTest: false, depthWrite: false }
    const tg = new BufferGeometry().setAttribute('position', dyn(this.triPos, 3)).setAttribute('color', dyn(this.triCol, 4))
    this.tris = new Mesh(tg, new MeshBasicMaterial({ ...glowing, side: DoubleSide }))
    const lg = new BufferGeometry().setAttribute('position', dyn(this.linePos, 3)).setAttribute('color', dyn(this.lineCol, 4))
    this.lines = new LineSegments(lg, new LineBasicMaterial(glowing))
    const og = new BufferGeometry().setAttribute('position', dyn(this.orbPos, 3)).setAttribute('col', dyn(this.orbCol, 4)).setAttribute('radius', dyn(this.orbRad, 1))
    this.orbMat = new ShaderMaterial({ vertexShader: ORB_VERT, fragmentShader: ORB_FRAG, uniforms: { ratio: { value: 1 } }, transparent: true, blending: AdditiveBlending, depthTest: false, depthWrite: false })
    this.orbs = new Points(og, this.orbMat)
    ;[this.tris, this.orbs, this.lines].forEach((o, i) => {
      o.frustumCulled = false
      o.renderOrder = i
      this.scene.add(o)
    })

    // The geometry is rendered on black and bloomed on its own, so the glow comes from the
    // lines and never from the sky; then one last pass lays it over the sky.
    this.composer = new EffectComposer(this.renderer)
    this.composer.renderToScreen = false
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    this.bloom = new UnrealBloomPass(new Vector2(256, 256), 0.7, 0.5, 0.12)
    this.composer.addPass(this.bloom)
    this.finalMat = new ShaderMaterial({
      vertexShader: SKY_VERT,
      fragmentShader: 'varying vec2 vUv; uniform sampler2D sky; uniform sampler2D forms; void main() { vec3 s = texture2D(sky, vUv).rgb; vec3 f = texture2D(forms, vUv).rgb; gl_FragColor = vec4(1.0 - (1.0 - s) * (1.0 - min(f, vec3(1.0))), 1.0); }',
      uniforms: { sky: { value: this.skyTarget.texture }, forms: { value: null } },
      depthTest: false,
    })
    this.finalScene.add(new Mesh(new PlaneGeometry(2, 2), this.finalMat))
  }

  // Quality steps down, never up, when frames run long: first fewer pixels, then no bloom.
  // A phone that cannot keep up gets a softer picture rather than a slower one.
  static readonly LEVELS = [
    { ratio: 1.5, bloom: true },
    { ratio: 1, bloom: true },
    { ratio: 0.75, bloom: false },
    { ratio: 0.5, bloom: false },
  ]
  level = 0
  private slow = 0
  private frames = 0
  private dpr = 1

  // Called once a frame with the time since the last one, in seconds.
  pace(dt: number) {
    if (!this.ok || dt <= 0 || dt > 0.25 || this.level >= GLLayer.LEVELS.length - 1) return
    this.frames++
    // a frame longer than 26 ms means we are missing 60 and close to missing 30
    this.slow = this.slow * 0.9 + (dt > 0.026 ? 1 : 0) * 0.1
    if (this.frames > 24 && this.slow > 0.6) {
      this.level++
      this.frames = 0
      this.slow = 0
      this.resize(this.W, this.H, this.dpr)
    }
  }

  resize(W: number, H: number, dpr: number) {
    if (!this.ok) return
    this.W = W
    this.H = H
    this.dpr = dpr
    const q = GLLayer.LEVELS[this.level]
    this.bloom.enabled = q.bloom
    // phones have more pixels than their GPUs want to bloom; 1.5 is indistinguishable here
    const ratio = Math.min(q.ratio, dpr)
    this.renderer.setPixelRatio(ratio)
    this.renderer.setSize(W, H, false)
    this.composer.setPixelRatio(ratio)
    this.composer.setSize(W, H)
    this.skyTarget.setSize(Math.max(2, Math.round(W * 0.6)), Math.max(2, Math.round(H * 0.6)))
    this.camera.right = W
    this.camera.bottom = H
    this.camera.updateProjectionMatrix()
    this.orbMat.uniforms.ratio.value = ratio
    this.skyMat.uniforms.aspect.value = W / H
    this.skyMat.uniforms.size.value.set(W, H)
  }

  begin() {
    this.nLine = this.nTri = this.nOrb = 0
  }

  sky(o: SkyOpts) {
    const u = this.skyMat.uniforms
    u.top.value = rgb(o.top)
    u.bottom.value = rgb(o.bottom)
    u.top2.value = rgb(o.top2)
    u.bottom2.value = rgb(o.bottom2)
    u.tint.value = rgb(o.tint)
    u.blend.value = o.blend
    u.c.value.set(o.c[0], o.c[1])
    u.center.value.set(o.center[0], o.center[1])
    u.span.value = o.span
    u.onMap.value = o.onMap
    u.time.value = o.time
    u.drift.value = o.drift
    u.glow.value.set(o.glow[0], o.glow[1])
  }

  // The 2D canvas is about to draw a scene with this camera; do the same.
  xf(k: number, ox: number, oy: number, a: number) {
    this.k = k
    this.ox = ox
    this.oy = oy
    this.a = a
  }

  // Edges, brighter the nearer they are.
  wire(pts: GLPoint[], edges: [number, number][], color: string, alpha: number) {
    const [r, g, b] = rgb(color)
    const { k, ox, oy, linePos: P, lineCol: C } = this
    const a = alpha * this.a
    if (a <= 0.004) return
    for (const [i, j] of edges) {
      if (this.nLine >= MAX_LINES) return
      const p = pts[i]
      const q = pts[j]
      const n = this.nLine++
      P[n * 6] = ox + p.x * k
      P[n * 6 + 1] = oy + p.y * k
      P[n * 6 + 3] = ox + q.x * k
      P[n * 6 + 4] = oy + q.y * k
      const near = Math.min(1, Math.max(0, ((p.z + q.z) / 2 + 1.15) / 2.3))
      const v = a * (0.2 + 0.8 * near)
      for (let m = 0; m < 2; m++) {
        C[n * 8 + m * 4] = r
        C[n * 8 + m * 4 + 1] = g
        C[n * 8 + m * 4 + 2] = b
        C[n * 8 + m * 4 + 3] = v
      }
    }
  }

  // Translucent faces, lit from up and to the left, so a solid reads as a solid.
  faces(pts: GLPoint[], tris: [number, number, number][], color: string, alpha: number) {
    const [r, g, b] = rgb(color)
    const { k, ox, oy, triPos: P, triCol: C } = this
    const a = alpha * this.a
    if (a <= 0.004) return
    for (const [i, j, l] of tris) {
      if (this.nTri >= MAX_TRIS) return
      const p = pts[i]
      const q = pts[j]
      const s = pts[l]
      // the face's normal, taking a unit of depth as about sixty units across
      const ux = q.x - p.x
      const uy = q.y - p.y
      const uz = (q.z - p.z) * 60
      const vx = s.x - p.x
      const vy = s.y - p.y
      const vz = (s.z - p.z) * 60
      const nx = uy * vz - uz * vy
      const ny = uz * vx - ux * vz
      const nz = ux * vy - uy * vx
      const len = Math.hypot(nx, ny, nz) || 1
      const lit = Math.abs((nx * -0.42 + ny * -0.57 + nz * 0.7) / len)
      const near = Math.min(1, Math.max(0, ((p.z + q.z + s.z) / 3 + 1.15) / 2.3))
      const v = a * (0.18 + 0.82 * lit * lit) * (0.45 + 0.55 * near)
      const n = this.nTri++
      ;[p, q, s].forEach((w, m) => {
        P[n * 9 + m * 3] = ox + w.x * k
        P[n * 9 + m * 3 + 1] = oy + w.y * k
        C[n * 12 + m * 4] = r
        C[n * 12 + m * 4 + 1] = g
        C[n * 12 + m * 4 + 2] = b
        C[n * 12 + m * 4 + 3] = v
      })
    }
  }

  // Spheres of a given radius (in scene units) at each point.
  orb(pts: GLPoint[], radius: number, color: string, alpha: number) {
    const [r, g, b] = rgb(color)
    const a = alpha * this.a
    if (a <= 0.004) return
    for (const p of pts) {
      if (this.nOrb >= MAX_ORBS) return
      const n = this.nOrb++
      this.orbPos[n * 3] = this.ox + p.x * this.k
      this.orbPos[n * 3 + 1] = this.oy + p.y * this.k
      this.orbRad[n] = radius * (p.k ?? 1) * this.k
      this.orbCol[n * 4] = r
      this.orbCol[n * 4 + 1] = g
      this.orbCol[n * 4 + 2] = b
      this.orbCol[n * 4 + 3] = a * (0.45 + 0.55 * Math.min(1, Math.max(0, (p.z + 1.15) / 2.3)))
    }
  }

  end() {
    const flush = (o: LineSegments | Mesh | Points, count: number, names: string[]) => {
      o.geometry.setDrawRange(0, count)
      for (const n of names) (o.geometry.getAttribute(n) as BufferAttribute).needsUpdate = true
      o.visible = count > 0
    }
    flush(this.lines, this.nLine * 2, ['position', 'color'])
    flush(this.tris, this.nTri * 3, ['position', 'color'])
    flush(this.orbs, this.nOrb, ['position', 'col', 'radius'])
    this.renderer.setRenderTarget(this.skyTarget)
    this.renderer.render(this.skyScene, this.camera)
    this.composer.render()
    this.finalMat.uniforms.forms.value = this.composer.readBuffer.texture
    this.renderer.setRenderTarget(null)
    this.renderer.render(this.finalScene, this.camera)
  }

  // For the tests: how much is being drawn, and whether the picture is more than one colour.
  stats() {
    return { lines: this.nLine, tris: this.nTri, orbs: this.nOrb, level: this.level }
  }

  distinctColours(): number {
    if (!this.ok) return 0
    this.end()
    const gl = this.renderer.getContext()
    const w = gl.drawingBufferWidth
    const h = gl.drawingBufferHeight
    const px = new Uint8Array(4)
    const seen = new Set<number>()
    for (let y = 8; y < h; y += Math.max(1, Math.floor(h / 40))) {
      for (let x = 8; x < w; x += Math.max(1, Math.floor(w / 40))) {
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px)
        seen.add((px[0] << 16) | (px[1] << 8) | px[2])
      }
    }
    return seen.size
  }

  get size() {
    return [this.W, this.H]
  }
}

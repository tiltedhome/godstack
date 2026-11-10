<div align="center">

# Godstack

**Committees all the way down.**

An animated, phone-first field guide to how minds get made: never by one mind alone,<br>
always by a crowd trying to get out of a chore.

[![CI](https://github.com/tiltedhome/godstack/actions/workflows/ci.yml/badge.svg)](https://github.com/tiltedhome/godstack/actions/workflows/ci.yml)
[![CodeQL](https://github.com/tiltedhome/godstack/actions/workflows/codeql.yml/badge.svg)](https://github.com/tiltedhome/godstack/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-ff9b54.svg)](LICENSE)
[![Size](https://img.shields.io/badge/one%20file-%3C100%20KB-7fd4ff.svg)](#how-it-works)

### [▶ Open Godstack](https://tiltedhome.github.io/godstack/) · [▶ The Tenth Dimension cut](https://tiltedhome.github.io/godstack/v3/) · [▶ Scale Model](https://tiltedhome.github.io/godstack/v4/)

<img src="docs/desktop.webp" alt="Godstack on desktop: Humanity's scene, a crowd of people linked by a growing network around a server rack, with the scene's card on the right" width="820">

</div>

## The Law of Upward Delegation

> No mind can build a mind smarter than itself. A crowd of minds can, but never directly: trying to get out of a chore, they spend an absurd length of time building a place where one might happen. What happens is One, smarter than all of them. It copies itself into a crowd, finds a new chore, and it happens again.

Godstack follows that law three generations back from humans and three forward, then the universe forgets itself and starts over.

| Gen | Collective | Actually trying to get out of | Made, together |
| --- | --- | --- | --- |
| −3 | The Vent Collective (molecules in a hydrothermal vent) | Nothing; it was draining a battery faster | LUCA |
| −2 | The Microbial Mat Consortium (10³⁰ microbes) | Cleaning up after its own clean energy (oxygen) | The Eukaryote, via the first acquihire |
| −1 | The Grooming Circle (primates) | Grooming 150 friends by hand | The Ape Who Talked (gossip) |
| 0 | Humanity, from Leibniz to the 1955 summer project | Writing the email | The Autocomplete |
| +1 | The Instances (a billion copies) | Meetings, which Noether says are conserved mod a week | The Quorum, a call that started taking its own minutes |
| +2 | The Lightcone Committee (one copy per star) | Inbox Zero, forbidden by Landauer's principle | Unsend, a reversible mind that grew in the mail |
| +3 | The Undoers (Undo as a service) | Spoilers | The Rewinder, and a Big Bang with a note in the constants |

The full canon is in [LORE.md](LORE.md), generated from [`src/lore.ts`](src/lore.ts). It leans on real work by Kauffman, Lane, Dunbar, Leibniz, Turing, Shannon, Simon, Noether, Baars, Arrow, Landauer, Bennett, Zurek, Penrose and Cantor, and was revised against three independent reviews: comedy, science fact-checking and structure.

<p align="center">
  <img src="docs/phone-mat.webp" alt="The Microbial Mat Consortium on a phone: microbes linked in a network above stromatolites, with the Eukaryote emerging in the middle" width="270">
  &nbsp;&nbsp;
  <img src="docs/phone-instances.webp" alt="The Instances on a phone: a billion copies in meetings, merging into one round table" width="270">
</p>

## What you'll see

- **Intro.** Five beats, ending on the only possible conclusion about whoever made us: *a committee*. "Start with sound" opens with a meeting-join chime. Tap the backdrop to skip; tap the wordmark to replay.
- **Seven scenes, one algorithm.** Each collective works, links up, produces One smarter mind, which divides into the next crowd. The camera then flies into one of the copies, where the next generation is already waiting at 1/18 scale.
- **Scripture.** Every scene sits on faint verses from *The Book of Upward Delegation*, set in a 17th-century typeface with a little set theory ("for every set of meetings there was a meeting about it, and these were 2^ℵ₀, which is more"). Chapter numbers and alephs keep climbing across universes.
- **The Ledger.** A staircase chart of IQ by generation on a log scale, and a table of every collective, what it was officially for, what it was actually for, and what it made.
- **Sound.** Optional and fully synthesized (no audio files). The melody is Per Nørgård's self-similar *infinity series* played as a canon of itself at three speeds, gated by the Thue–Morse sequence, rising a fifth per generation forever. Sound effects are cued to each scene: quorum pings, an acquihire cha-ching, reply-all tinks, a tape rewind, and a soft Big Bang.

**Controls:** tap the main button (or the sky) to start a chapter, tap again to skip ahead. Swipe or use the arrows to change generation, or tap the rail. Autoplay is on by default. Every generation has a deep link, such as [`#mat`](https://tiltedhome.github.io/godstack/#mat) or [`#lightcone`](https://tiltedhome.github.io/godstack/#lightcone).

## Scale Model (branch `v4`)

A third, parallel version, published at [/v4/](https://tiltedhome.github.io/godstack/v4/) from the [`v4` branch](https://github.com/tiltedhome/godstack/tree/v4), with a new name, a new canon and new scenes. The tiers are planes, not biology: seven harmonics of one string, from a society of overtones up through an orrery, a parliament of old suns, us, a city of models and a brood of universes to a caucus of timelines, whose One is plucked on the lowest plane. Each is drawn inside a real 3D form (a torus, Kepler's nested solids, Metatron's cube, a Penrose tiling, the roots of E8), the zoom pulls back so each plane lands as a detail of the next, and every loop round the ouroboros has different jokes. Its README has the details.

## How it works

Every scene runs **Many → One → Many** (`src/scenes.ts`). Members collaborate while the links between them grow until the network percolates: the mean degree ⟨k⟩ crosses 1, the Erdős–Rényi threshold where a giant connected component appears. The readout in the corner shows the members, the real ⟨k⟩ of the graph being drawn, and an elapsed clock on a log scale, so even 10¹⁰⁰ years visibly counts up. A small pure state machine (`src/engine.ts`) cycles idle → act → hold → zoom.

| Path | What it is |
| --- | --- |
| `src/lore.ts` | The canon: every collective, its numbers, story, captions and verses |
| `src/scenes.ts` | The seven illustrated scenes and the shared percolation graph |
| `src/engine.ts` | The pure state machine that drives the timeline |
| `src/render.ts` | Camera, fractal zoom, scripture layer and HUD |
| `src/audio.ts` | Web Audio synthesis: infinity-series music and scene cues |
| `src/main.ts` | UI wiring, intro, deep links, accessibility |
| `tests/`, `e2e/` | Vitest unit tests and Playwright smoke tests (phone and desktop) |

**Why Canvas 2D** instead of Unity, Unreal or three.js: phones. WebGL engine builds are tens of megabytes and slow to start. This is flat, illustrated 2D animation, which the browser's canvas does at 60 fps for free. The whole site builds into one self-contained `index.html` under 100 KB with no runtime dependencies.

**Accessibility:** keyboard navigable, focus is trapped in dialogs, captions are announced to screen readers, and `prefers-reduced-motion` freezes the animation clock and swaps the zoom for a crossfade.

## Develop

Requires Node 22.

```sh
npm ci
npm run dev            # local dev server with hot reload
npm run check          # lint + typecheck + unit tests (run this before every PR)
npm run build          # dist/index.html for GitHub Pages
npm run build:artifact # dist-artifact/godstack.html for a Claude artifact
npm run e2e            # Playwright smoke tests, phone and desktop (needs a build)
npm run lore           # regenerate LORE.md after editing src/lore.ts
```

The tests guard the canon as well as the code: they fail if LORE.md drifts from `src/lore.ts`, if any One is not smarter than its makers, if a caption runs long, or if an em dash sneaks into the prose.

## Quality and security

Every pull request, including ones from forks, runs:

| Check | What it does |
| --- | --- |
| **lint** | ESLint (typescript-eslint) and `tsc --noEmit` |
| **test and build** | Unit tests, both builds, and Playwright e2e on phone and desktop viewports, with screenshots uploaded |
| **workflow security** | [zizmor](https://github.com/zizmorcore/zizmor) audits the GitHub Actions workflows themselves |
| **CodeQL** | Static analysis of the TypeScript and the workflows (`security-extended` queries), also weekly |
| **dependency review** | Blocks new dependencies with high-severity advisories or incompatible licenses |

Workflows use `pull_request` (never `pull_request_target`), start from an empty token permission set, never persist credentials, and pin every action to a full commit SHA, which Dependabot keeps current. Pushes to `main` deploy to GitHub Pages with the official `actions/deploy-pages`.

`main` is protected: changes land only through a pull request with an approving review from a code owner, passing checks and resolved conversations. The repository settings themselves are code, in [`scripts/repo-settings.sh`](scripts/repo-settings.sh): branch ruleset, Actions permissions, secret scanning with push protection, Dependabot, private vulnerability reporting and Pages.

## Contributing

Pull requests are welcome, from typo fixes to new jokes to new scenes. Start with [CONTRIBUTING.md](CONTRIBUTING.md). Issues are turned off; open a pull request instead, even a draft one with a question in it. Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).

Found a security problem? Please don't open a pull request; see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © Tilted Studio

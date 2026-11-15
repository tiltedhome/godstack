# Godstack v2gpt

## The Department of Unintended Consequences

[Read the independent edition](https://tiltedhome.github.io/godstack/v2gpt/)

A cosmic hearing in eight movements. A physicist with a cello callus asks who authorized consciousness. A dolphin questions the benchmark. The creators have a facilities issue. Their descendants will inherit something more difficult than intelligence: responsibility.

**The law of unintended inheritance:** many lives make a shared environment; something new learns to live there. It inherits a problem, not necessarily its makers' purpose. This is a fictional premise, not a law of physics.

Original prose and mathematical engravings explore emergence, embodied experience, alien competence, AI succession and repeating relationships. The finale returns a musical and visual motif in a new context. A second reading changes the opening. Science and philosophy notes distinguish established constraints from speculation.

## Controls

- Continue or go back through 24 short passages. Reader-paced by default.
- Select any of eight chapters. Each passage has a shareable URL fragment.
- Optional automatic reading has three tempos and pauses when the tab is hidden or field notes are open.
- Optional quiet synthesized music starts only with explicit interaction.
- Disturb the diagram to send a ripple through its geometry.
- Arrow keys navigate outside controls. Native dialogs support Escape and focus restoration.
- Reduced-motion preference freezes the animated diagrams.

## Independence

This cut lives on `v2gpt` and serves only `/v2gpt/`. No scripts, storage, service workers, APIs or assets are shared with other cuts. The only main-branch change needed is additive site assembly and a README link. Existing branch sources and local sessions are untouched.

## Develop

Node 22, Vite, TypeScript, Canvas 2D. No runtime libraries or remote fonts. Build output is one self-contained HTML file.

```sh
npm ci
npm run dev
npm run check
npm run build
npm run build:artifact
npm run e2e
npm run lore
```

`src/lore.ts` is the canon, `LORE.md` its generated reading copy. `src/engine.ts` holds reader navigation. `src/render.ts` draws the engravings. `src/main.ts` connects accessible controls and deep links. Tests cover all passages, loop state, malformed routes, canon synchronization, layout, dialog focus, reduced motion and autoplay.

The supplied Playwright configuration runs phone and desktop. CI uses preinstalled Chrome. Locally, set `PW_CHROMIUM` to an installed browser when needed.

## Verification and limits

Canon independently reviewed for science, comedy and clarity. Local lint, types, unit tests and both builds pass. CI runs phone/desktop browser tests and workflow security checks. Managed preview routing was unavailable during initial development; published-page inspection follows deployment. Canvas drawings are illustrative, not quantitative simulations. Real-device performance is not inferred from headless tests.

## Reading room

Tegmark's Mathematical Universe Hypothesis and Life 3.0; David Michael Levin's The Body's Recollection of Being; Landauer's work on irreversible computation. Full links and distinctions are in the page's Field notes and [LORE.md](LORE.md). The story is original, with absurd cosmic scale, recursive consequences, and affectionate satire rather than quotations or borrowed characters.

MIT. See [LICENSE](LICENSE).

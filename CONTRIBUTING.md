# Contributing to Godstack

Thanks for wanting to help the committee. Every contribution, from a typo to a new tier of the universe, goes through a pull request.

## Before you start

- **Issues are turned off.** If you have a question or an idea, open a **draft pull request** describing it, even with no code yet. That keeps every conversation next to a concrete change.
- **Security problems** never go in a pull request. See [SECURITY.md](SECURITY.md).
- By contributing you agree your work is released under the [MIT License](LICENSE) and that you'll follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Setup

You need Node 22.

```sh
git clone https://github.com/<you>/godstack.git   # your fork
cd godstack
npm ci
npm run dev
```

## Making a change

1. Branch from `main`. Keep each pull request to one idea.
2. Run the checks locally before you push:

   ```sh
   npm run check   # lint + typecheck + unit tests
   npm run build && npx playwright install chromium && npm run e2e
   ```

3. Open a pull request using the template. Screenshots or a short screen recording help a lot for anything visual.

## What happens to your pull request

1. **Automated checks** run on every pull request: lint, typecheck, unit tests, both builds, end-to-end tests on phone and desktop, CodeQL, a workflow security audit, and dependency review. If this is your first contribution, a maintainer approves the workflow run before it starts; this is a GitHub safety feature, not a judgment of your code.
2. **Review.** A maintainer reviews it. Every pull request needs an approving review from a code owner, all checks passing, and every conversation resolved before it can merge.
3. **Merge.** Pull requests are squash-merged, so your branch can be as messy as you like. The site redeploys to GitHub Pages automatically.

## House style

### Writing (the canon in `src/lore.ts`)

The tone is Douglas Adams with footnotes: absurd, affectionate, and **true**. Every claim about real science, history or people should be accurate and, ideally, checkable; jokes are allowed to exaggerate the implications, not the facts.

- No em dashes in the prose. A test enforces this.
- Each beat's text is at most 490 characters, its title 44 and its on-stage tag 36, so that it fits a phone without scrolling. Tests enforce all three.
- After editing `src/lore.ts`, run `npm run lore` to regenerate `LORE.md`, and commit both.
- Every substrate answers the same eight questions, in the same order, and says in `honest` where its physics stops. Every port has to buy something and pay something. Yes, there are tests.

### Code

- TypeScript, Canvas 2D for the characters and type, three.js for the sky and geometry. That is the only runtime dependency; another one needs a very good reason.
- Scenes are drawn in a 215-unit coordinate space centred on the stage; see the existing scenes in `src/scenes.ts`.
- Keep it fast on a mid-range phone and keep the page a single self-contained `index.html`. Anything drawn on the WebGL layer must also work, or be safely absent, on the 2D fallback (`?gl=off`).
- Respect `prefers-reduced-motion`, keyboard navigation and screen readers.

### Workflows

If you touch `.github/workflows/`, pin any new action to a full commit SHA with the version in a comment, keep token permissions minimal, and never use `pull_request_target`. The zizmor check will tell you if something is off.

## Commit messages

Write a short summary line in the imperative ("Add the Lightcone reply-all sound"), then a blank line and the why, if it isn't obvious.

// Regenerates LORE.md from src/lore.ts. Runs on Node's built-in TypeScript type stripping.
import { writeFileSync } from 'node:fs'
import { renderLoreMarkdown } from '../src/loremd.ts'

writeFileSync(new URL('../LORE.md', import.meta.url), renderLoreMarkdown())
console.log('LORE.md updated')

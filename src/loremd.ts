import { COROLLARIES, LAW, LAYERS, UNIVERSE_NOTE, chapter, roman, versesFor } from './lore.ts'
import { formatIQ, genLabel } from './format.ts'

export function renderLoreMarkdown(): string {
  const out: string[] = [
    '# The Godstack canon',
    '',
    '<!-- Generated from src/lore.ts by `npm run lore`. Edit that file, not this one. -->',
    '',
    `> **The Law of Upward Delegation.** ${LAW}`,
    '',
    ...COROLLARIES.map((c, i) => `${i + 1}. ${c}`),
    '',
    '| Gen | Collective | Members | Took | Actually for | Made, together | IQ |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...LAYERS.map((L) => `| ${genLabel(L.gen)} | ${L.name} | ${L.members} | ${L.took} | ${L.actually} | ${L.one} | ${formatIQ(L.memberIq)} → ${formatIQ(L.oneIq)} |`),
    '',
  ]
  LAYERS.forEach((L, i) => {
    const ch = chapter(i, 1)
    out.push(
      `## ${genLabel(L.gen)}: ${L.name}`,
      '',
      `*${L.latin}.* ${L.epithet}`,
      '',
      `> *The Book of Upward Delegation, chapter ${roman(ch)}*`,
      '>',
      ...versesFor(i, 1).flatMap((v, k) => [`> <sup>${ch}:${k + 1}</sup> ${v}`, '>']).slice(0, -1),
      '',
      ...L.story.flatMap((p) => [p, '']),
      `- **Members:** ${L.members}, IQ ${formatIQ(L.memberIq)} each`,
      `- **Took:** ${L.took}`,
      `- **Officially for:** ${L.officially}`,
      `- **Actually for:** ${L.actually}`,
      `- **Made, together:** ${L.one} (IQ ${formatIQ(L.oneIq)}). ${L.oneNote}`,
      `- **Then:** ${L.multiplied}`,
      '',
    )
    if (L.footnote) out.push(`> ${L.footnote}`, '')
  })
  out.push('## ∞: Universe 2', '', UNIVERSE_NOTE, '')
  return out.join('\n')
}

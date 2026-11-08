import { COROLLARIES, LAW, LAYERS, UNIVERSE_NOTE, chapter, roman, versesFor } from './lore.ts'
import { formatIQ, genLabel } from './format.ts'
import { DIMENSIONS, MINUTES, NOTES } from './minutes.ts'

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
    const dim = DIMENSIONS[L.id]
    out.push(
      `## ${genLabel(L.gen)}: ${L.name}`,
      '',
      `*${L.latin}.* ${L.epithet}`,
      '',
      `**Plane ${dim.d}, ${dim.label}.** ${dim.note}`,
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
      `**Seen from the plane above:** ${L.theology[0]}`,
      '',
      `**Seen from the One itself:** ${L.theology[1]}`,
      '',
      '<details><summary>From the minutes</summary>',
      '',
      ...(MINUTES[L.id] ?? []).map((m) => `- ${m}`),
      '',
      '</details>',
      '',
    )
    if (L.footnote) out.push(`> ${L.footnote}`, '')
  })
  out.push('## ∞: Universe 2', '', UNIVERSE_NOTE, '', '### What the note in the constants says, some universes', '', ...NOTES.map((n) => `- ${n}`), '')
  return out.join('\n')
}

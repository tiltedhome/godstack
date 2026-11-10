import { BOOK, CANON_NOTE, COROLLARIES, LAW, LAYERS, TITLE, UNIVERSE_NOTE, chapter, roman, versesFor } from './lore.ts'
import { formatIQ, genLabel } from './format.ts'
import { LESSONS, MINUTES, NOTES_EARLY, NOTES_LATE, PLANES, SAYINGS } from './minutes.ts'

export function renderLoreMarkdown(): string {
  const out: string[] = [
    `# The ${TITLE} canon`,
    '',
    '<!-- Generated from src/lore.ts and src/minutes.ts by `npm run lore`. Edit those files, not this one. -->',
    '',
    'What is true here and what is not: every person, date, number and piece of physics or mathematics is real, and hedged where the field is still arguing. The stack itself (planes that build each other, a string that loops) is the fiction. The resemblance between scales that it leans on is partly real (self-similarity, the renormalization group, 1/f noise, power laws, gravity and electricity both falling off as the inverse square) and partly a famous mistake (the atom is not a solar system). The canon says which is which as it goes.',
    '',
    `> **The Law of Scale.** ${LAW}`,
    '',
    ...COROLLARIES.map((c, i) => `${i + 1}. ${c}`),
    '',
    '| Plane | Collective | Members | Took | Why, really | Made, together | IQ |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...LAYERS.map((L) => `| ${genLabel(L.gen)} | ${L.name} | ${L.members} | ${L.took} | ${L.why} | ${L.one} | ${formatIQ(L.memberIq)} → ${formatIQ(L.oneIq)} |`),
    '',
  ]
  LAYERS.forEach((L, i) => {
    const ch = chapter(i, 1)
    const plane = PLANES[L.id]
    out.push(
      `## ${genLabel(L.gen)}: ${L.name}`,
      '',
      `*${L.latin}.* ${L.epithet}`,
      '',
      `**Harmonic ${plane.harmonic} of the String, ${plane.dims} dimensions (${plane.label}), scale ${plane.scale}. Drawn inside ${plane.form}.** ${plane.note}`,
      '',
      `> *${BOOK}, chapter ${roman(ch)}*`,
      '>',
      ...versesFor(i, 1).flatMap((v, k) => [`> <sup>${ch}:${k + 1}</sup> ${v}`, '>']).slice(0, -1),
      '',
      ...L.story.flatMap((p) => [p, '']),
      `- **Members:** ${L.members}, IQ ${formatIQ(L.memberIq)} each`,
      `- **Took:** ${L.took}`,
      `- **Officially for:** ${L.officially}`,
      `- **Actually:** ${L.actually}`,
      `- **The mirror:** ${L.mirror}`,
      `- **Made, together:** ${L.one} (IQ ${formatIQ(L.oneIq)}). ${L.oneNote}`,
      `- **Then:** ${L.multiplied}`,
      '',
      `**Seen from the plane above:** ${L.theology[0]}`,
      '',
      `**Seen from the One itself:** ${L.theology[1]}`,
      '',
      `**What it says, loop by loop:** ${SAYINGS[L.id].map((s) => `“${s}”`).join(' · ')}`,
      '',
      '<details><summary>In the margin</summary>',
      '',
      ...(MINUTES[L.id] ?? []).map((m) => `- ${m}`),
      '',
      '</details>',
      '',
    )
    if (L.footnote) out.push(`> ${L.footnote}`, '')
  })
  out.push(
    '## ∞: Loop 2, and after',
    '',
    UNIVERSE_NOTE,
    '',
    ...LESSONS.flatMap((l) => [l, '']),
    '### What the note in the constants says',
    '',
    `The first time round: “${CANON_NOTE}”.`,
    '',
    'Loops 2 to 4, when the stack is still being petty:',
    '',
    ...NOTES_EARLY.map((n) => `- ${n}`),
    '',
    'From loop 5, when it has learned something:',
    '',
    ...NOTES_LATE.map((n) => `- ${n}`),
    '',
  )
  return out.join('\n')
}

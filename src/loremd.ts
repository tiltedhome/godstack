import {
  BEATS, BOOK, CANON_NOTE, COROLLARIES, LAW, LAYERS, QUESTIONS, TITLE, TRAITS, TRAIT_LABELS, UNIVERSE_NOTE, chapter, roman, versesFor,
} from './lore.ts'
import { LESSONS, MINUTES, NOTES_EARLY, NOTES_LATE, PLANES, SAYINGS } from './minutes.ts'

const MARK = { yes: 'yes', partly: 'partly', no: 'no', moot: 'not applicable' } as const

export function renderLoreMarkdown(): string {
  const out: string[] = [
    `# The ${TITLE} canon`,
    '',
    '<!-- Generated from src/lore.ts and src/minutes.ts by `npm run lore`. Edit those files, not this one. -->',
    '',
    'What is true here and what is not: every person, date, number and piece of physics, biology or history is real, and hedged where the field is still arguing. The idea that life is information, indifferent to what it is written on, is Max Tegmark’s (Our Mathematical Universe, 2014; Life 3.0, 2017). Life 1.0, 2.0 and 3.0 are his. The versions below 1.0 and above 3.0, the claim that those levels are alive, and the loop, are this Book’s, and each level says where its physics stops.',
    '',
    `> **The Law of Substrates.** ${LAW}`,
    '',
    ...COROLLARIES.map((c, i) => `${i + 1}. ${c}`),
    '',
    '| Life | Substrate | Written on | Remembers | Copies | Repairs | Learns | Rebuilds itself | Ported itself into |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...LAYERS.map((L) => `| ${L.version} | ${L.name} | ${L.substrate} | ${TRAITS.map((k) => MARK[L.traits[k][0]]).join(' | ')} | ${L.one} |`),
    '',
  ]
  LAYERS.forEach((L, i) => {
    const ch = chapter(i, 1)
    const plane = PLANES[L.id]
    out.push(
      `## Life ${L.version}: ${L.name}`,
      '',
      `*${L.epithet}*`,
      '',
      `Written on ${L.substrate}. One unit of memory: ${L.unit}. There are ${L.members}. Time here: ${L.time}. It took ${L.took}.`,
      '',
      ...BEATS.flatMap((b, k) => [`### ${k + 1}. ${QUESTIONS[b]}: ${L.beats[b].title}`, '', L.beats[b].text, '', `*On the stage:* ${L.beats[b].tag}`, '']),
      '### Is it alive?',
      '',
      ...TRAITS.map((k) => `- **${TRAIT_LABELS[k]}:** ${MARK[L.traits[k][0]]}. ${L.traits[k][1][0].toUpperCase()}${L.traits[k][1].slice(1)}.`),
      '',
      '### The numbers',
      '',
      `- **How fast news travels:** ${L.stats.news[0]}`,
      `- **How long the medium lasts:** ${L.stats.lasts[0]}`,
      `- **What it runs on:** ${L.stats.power[0]}`,
      `- **Density:** ${L.stats.density}`,
      `- **Fidelity:** ${L.stats.fidelity}`,
      '',
      '### The port',
      '',
      `- **Ported itself into:** ${L.one}. ${L.oneNote}`,
      `- **Bought:** ${L.port.gains}`,
      `- **Paid:** ${L.port.pays}`,
      `- **Lost in the port:** ${L.lost}`,
      `- **Seen from the next substrate:** ${L.above}`,
      `- **First words, loop by loop:** ${SAYINGS[L.id].map((s) => `“${s}”`).join(' · ')}`,
      '',
      `### Release notes, Life ${L.version}`,
      '',
      ...L.release.added.map((a) => `- Added: ${a}`),
      ...L.release.issues.map((a) => `- Known issue: ${a}`),
      '',
      `> *${BOOK}, chapter ${roman(ch)}*`,
      '>',
      ...versesFor(i, 1).flatMap((v, k) => [`> <sup>${ch}:${k + 1}</sup> ${v}`, '>']).slice(0, -1),
      '',
      `**Where the physics stops.** ${L.honest}`,
      '',
      `**Drawn inside ${plane.form}.** ${plane.note}`,
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

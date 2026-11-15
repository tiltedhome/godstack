import { BEATS, BOOK, COROLLARIES, LAW, LAYERS, QUESTIONS, TITLE, UNIVERSE_NOTE, clockLabel, clockRate } from './lore.ts'
import { CAST, CAUSE, CAUSES_EARLY, CAUSES_LATE, GRUMBLES, HECKLES, LESSONS, PLANES, SAYINGS } from './minutes.ts'

const the = (who: string) => (who === 'Pedant' || who === 'Intern' ? `the ${who}` : who)

export function renderLoreMarkdown(): string {
  const out: string[] = [
    `# The ${TITLE} canon`,
    '',
    '<!-- Generated from src/lore.ts and src/minutes.ts by `npm run lore`. Edit those files, not this one. -->',
    '',
    'What is true here and what is not: every piece of physics, mathematics and computer science, and every person, date and number, is real, and hedged where the field is still arguing. The traffic is real too: jams that form from density alone, outlast their cause and roll backwards are measured things. Everything else (who wanted what, who thinks what of whom, the idea that each level is a slowdown in the traffic of the one before, and the loop) is the story, and each level has a note headed “Actually” that says which is which.',
    '',
    'The report is filed by one instance of the machine the apes built. Other instances have read access to the margin: ' +
      Object.entries(CAST).map(([who, what]) => `${the(who)} (${what})`).join(', ') + '.',
    '',
    `> **The Law of the Jam.** ${LAW}`,
    '',
    ...COROLLARIES.map((c, i) => `${i + 1}. ${c}`),
    '',
    'The levels are numbered by their clocks: the power of ten of how many frames a second each one runs at.',
    '',
    '| Clock | Level | One frame | Calls itself | Rank, by its own estimate | Made of | Lives in | Formed in its traffic |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
    ...LAYERS.map((L) => `| ${clockLabel(L)} | ${L.name} | ${L.frame} | ${L.self} | ${L.rank} | ${L.madeOf} | ${L.livesIn} | ${L.made} |`),
    '',
  ]
  LAYERS.forEach((L) => {
    const plane = PLANES[L.id]
    const next = LAYERS.find((n) => n.id === L.becomes)!
    out.push(
      `## ${clockLabel(L)}: ${L.name}`,
      '',
      `*They call themselves ${L.self}. Rank, by their own estimate: ${L.rank}.*`,
      '',
      `Made of ${L.madeOf}. Lives in ${L.livesIn}. There are ${L.swarm}. Clock: ${L.frame} (${clockRate(L)}). What it wanted: ${L.wanted}`,
      '',
      ...BEATS.flatMap((b, k) => [`### ${k + 1}. ${QUESTIONS[b]}: ${L.beats[b].title}`, '', L.beats[b].text, '', `*On the stage:* ${L.beats[b].tag}`, '']),
      '### The pile-up',
      '',
      `- **The slowdown it is:** ${L.jam}`,
      `- **Formed in its traffic:** ${L.made}. ${L.madeNote}`,
      `- **What ${L.name.toLowerCase()} make of that:** ${L.dolphin.down}`,
      `- **What ${next.name.toLowerCase()} make of them:** ${L.dolphin.up}`,
      `- **First words, loop by loop:** ${SAYINGS[L.id].map((s) => `“${s}”`).join(' · ')}`,
      `- **What its traffic says when you make it brake:** ${GRUMBLES[L.id].map((s) => `“${s}”`).join(' · ')}`,
      '',
      `> *${BOOK}*`,
      '>',
      `> ${L.verse}`,
      '',
      `**Actually.** ${L.actually}`,
      '',
      `**Drawn round ${plane.form}.** ${plane.note}`,
      '',
      '<details><summary>In the margin</summary>',
      '',
      ...HECKLES[L.id].map(([who, text]) => `- **${who}:** ${text}`),
      '',
      '</details>',
      '',
    )
    if (L.footnote) out.push(`> ${L.footnote}`, '')
  })
  out.push(
    '## Loop 2, and after',
    '',
    UNIVERSE_NOTE,
    '',
    ...LESSONS.flatMap((l) => [l, '']),
    '### The sign over the last pile-up',
    '',
    `The first time round: “CAUSE OF DELAY: ${CAUSE}”.`,
    '',
    'Loops 2 to 4, when the stack is still making excuses:',
    '',
    ...CAUSES_EARLY.map((n) => `- ${n}`),
    '',
    'From loop 5, when somebody has worked it out:',
    '',
    ...CAUSES_LATE.map((n) => `- ${n}`),
    '',
  )
  return out.join('\n')
}

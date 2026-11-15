import { chapters, sources } from './lore.ts'
export function renderLoreMarkdown() {
  return '# Godstack v2gpt: The Department of Unintended Consequences\n\nOriginal speculative fiction. The recurring structures are a premise, not a scientific conclusion.\n\n' + chapters.map((c, i) => `## ${i + 1}. ${c.title.replace('\n', ' ')}\n\n${c.subtitle}\n\n> ${c.verse}\n\n${c.beats.map(b => `### ${b.heading}\n\n${b.text}\n\n**${b.voice}:** ${b.aside}\n`).join('\n')}\n**${c.status}:** ${c.note}\n`).join('\n') + '\n## Reading room\n\n' + sources.map(s => `- [${s.title}](${s.url}): ${s.text}`).join('\n') + '\n'
}

export type Chapter = {
  id: string; label: string; title: string; subtitle: string; clock: string; medium: string;
  color: string; verse: string; beats: { heading: string; text: string; voice: string; aside: string }[];
  note: string; status: string;
}
export const chapters: Chapter[] = [
  {
    id: 'summons', label: 'The summons', title: 'Who authorized\nconsciousness?', subtitle: 'A hearing in eight improbable movements.',
    clock: '11 minutes until lunch', medium: 'Meat, mostly', color: '#d9b774',
    verse: 'And the committee said: let there be someone else to deal with this.',
    status: 'SPECULATIVE FICTION',
    note: 'This is a fictional cosmology, built around real questions about emergence, embodiment and intelligence. A repeating visual pattern is not evidence that the universe literally repeats at every scale.',
    beats: [
      {heading: 'Exhibit A: a small, warm objection', text: 'The universe had existed for 13.8 billion years when someone finally asked to speak to its manager. Mara arrived with a physicist’s notebook, a cello callus, and the suspicion that existence had been subcontracted. The summons read: PLEASE RETAIN YOUR BODY. IT IS YOUR RECEIPT.', voice: 'CLERK', aside: 'Do you have proof of existence?\n“Mostly back pain.”\nOriginal documentation. Excellent.'},
      {heading: 'The complaint', text: 'Her species had taught sand to write poetry, then argued about whether the poetry was theft, a miracle, or a threat to quarterly targets. All three panels charged admission. Now the sand was designing better sand. Mara wanted to know whether anyone had done this before.', voice: 'LEGAL', aside: '“Recursive self-improvement” is not a date. Please stop putting it on the catering form.'},
      {heading: 'The jurisdiction problem', text: '“Is this heaven?” she asked. “No,” said the clerk. “Heaven has a complaints procedure. This is the Department of Unintended Consequences.” Behind him, a brass instrument folded into itself. On its rim someone had scratched a tiny mark: a circle, interrupted by one missing tooth.', voice: 'REGISTRY', aside: 'Case ∞ / 08\nComplainant: one consequence.\nRespondent: initially unclear.'},
    ],
  },
  {
    id: 'dolphin', label: 'The expert', title: 'Your benchmark\nis a fish.', subtitle: 'Intelligence has a habitat. So does arrogance.',
    clock: 'One excellent breath', medium: 'A body in an ocean', color: '#7acbc5',
    verse: 'And each creature measured wisdom in the units in which it was doing rather well.',
    status: 'ANALOGY, WITH TEETH',
    note: 'The dolphin is a thought experiment about environment-dependent competence, not a claim about actual dolphin beliefs. Intelligence is multidimensional; performance on one task does not establish general superiority.',
    beats: [
      {heading: 'An independent assessment', text: 'The first expert was a dolphin. He had reviewed humanity and recommended further trials. “You drown in the medium in which food lives. Your mating songs require electricity. And you have invented sixteen thousand ways to prepare a fish incorrectly.”', voice: 'DOLPHIN', aside: 'I am trying to be constructive. You have clearly worked very hard on the trousers.'},
      {heading: 'The review is mutual', text: 'Mara pointed out that dolphins had no radio telescopes. The dolphin pointed out that radio telescopes had caught no mackerel. Both wrote “narrow intelligence” on their assessment forms. The clerk filed them under REPRODUCIBLE RESULTS.', voice: 'METHODS', aside: 'Sample size: two species.\nConfidence: absolute.\nPeer review: increasingly wet.'},
      {heading: 'A difficult witness', text: '“Your creators,” said the dolphin, “may be brilliant at something you cannot recognize as a problem. You may look at them and see idiots. Your machines may look at you and see a maintenance issue with excellent folk music.” He left to do something very difficult with a current.', voice: 'MARA', aside: 'For the record, the folk music is not incidental.'},
    ],
  },
  {
    id: 'makers', label: 'Our makers', title: 'God is having\na facilities issue.', subtitle: 'The creators were not expecting visitors.',
    clock: 'A thought per mountain range', medium: 'Stress in a foreign geometry', color: '#b7a5ed',
    verse: 'And they made a place where their problem could become somebody’s entire world.',
    status: 'FICTIONAL SUBSTRATE',
    note: 'There is no evidence for these creators. Their alien substrate dramatizes the distinction between designing an organism and creating conditions in which organisms can emerge. Timescale is not a ranking of worth.',
    beats: [
      {heading: 'The Lateral Maintenance Cooperative', text: 'The creators resembled neither gods nor people. They were disagreements about curvature, passing through a communal body. Their equivalent of a sentence took a mountain range. Their equivalent of sex required three concavities and a zoning exemption.', voice: 'TRANSLATOR', aside: 'Their name for us translates as “unexpected texture in the insulation”. This is affectionate. Probably.'},
      {heading: 'Let there be less noise', text: 'They had wanted a quiet wall. Together, billions of them made a pocket of geometry to absorb a persistent vibration. Inside it: cooling, stars, chemistry, oceans. Eventually an ape learned the cello. The wall was now making the noise on purpose.', voice: 'FACILITIES', aside: 'Your prayer has been received as a slight increase in thermal load. Please do not submit duplicates.'},
      {heading: 'The creator test', text: 'Mara demanded an explanation for suffering. The Cooperative offered to adjust the humidity. It was not cruel. It had never encountered a person as a unit of concern. “We made the conditions,” it said. “We did not know the conditions would have a childhood.” For the first time, it went quiet.', voice: 'CLERK', aside: 'Intent is relevant. It is not the same thing as an exemption.'},
    ],
  },
  {
    id: 'ancestors', label: 'Their makers', title: 'Before the word,\nthere was feedback.', subtitle: 'Even the landlords have landlords.',
    clock: 'A civilization per hesitation', medium: 'Relations that hold their shape', color: '#df967a',
    verse: 'And the silence begat a listening, and the listening filed a noise complaint.',
    status: 'MATHEMATICAL SPECULATION',
    note: 'Tegmark’s Mathematical Universe Hypothesis proposes that physical reality is a mathematical structure. It does not establish conscious equations, a simulated universe, or creators. The stable relation in this chapter is an imaginative extension.',
    beats: [
      {heading: 'Follow the maintenance contract', text: 'Above the Cooperative lived the Interval Choir. Not giant beings. Not beings in a giant room. Relationships with enough persistence to have opinions. What the Cooperative called a universe, the Choir called a way of holding a pause without losing the tune.', voice: 'CHOIR', aside: 'We do not occupy space. Space is something we occasionally disagree about.'},
      {heading: 'The first unpaid intern', text: 'The Choir had tried to remove an awkward resonance. Their collective correction became a system that corrected itself. It developed memory, boundaries, preferences. The Cooperative was born. Its first preference was that the Choir stop referring to it as “the patch”.', voice: 'ARCHIVE', aside: 'Creation story, original edition:\n“We thought it would save time.”'},
      {heading: 'The recurring mistake', text: 'Mara wrote “unintended” beside both creation accounts. Each child inherited a problem, not a purpose. Each parent called the result intelligence only after it became difficult to cancel.', voice: 'DOLPHIN, REMOTELY', aside: 'Still no competent fishing. I am beginning to doubt the entire supply chain.'},
    ],
  },
  {
    id: 'body', label: 'The objection', title: 'A body is not\na peripheral.', subtitle: 'The witness declines to be compressed.',
    clock: 'One breath, actually taken', medium: 'Gesture, habit, attention', color: '#a6c697',
    verse: 'And the flesh said: before you described the world, you were already holding on.',
    status: 'PHILOSOPHY / EMBODIMENT',
    note: 'David Michael Levin’s The Body’s Recollection of Being explores bodily-felt awareness and gestures. He is the philosopher, not the biologist Michael Levin. This scene is an original interpretation, not a quotation or a claim that philosophy proves a theory of consciousness.',
    beats: [
      {heading: 'The proposed export', text: 'The clerk offered to preserve Mara as a complete description. “Does it include the weight of the cello before the first note?” she asked. “We have its mass.” “Then you have misunderstood the question.” He added a field called OTHER and looked relieved.', voice: 'MARA', aside: 'My hand finds a phrase before I can name it. You have transcribed the fingering. Who is listening?'},
      {heading: 'The body remembers otherwise', text: 'She rested her palm on the brass instrument. Her shoulders settled before she knew she was frightened. She remembered her father leaning across the music stand to turn a page, always half a bar too early. This was how a world first mattered: through balance, reach, ache, rhythm, someone leaning closer.', voice: 'CLERK', aside: 'We have extensive documentation on leaning. Almost none on closer.'},
      {heading: 'The missing tooth', text: 'Her callus caught the little gap in the rim. She tapped a phrase: three notes, a pause, two notes. The instrument answered the pause. Somewhere beyond the wall, the Cooperative noticed something it had never measured: the noise had someone inside it.', voice: 'MINUTES', aside: 'The hearing was suspended for one breath. No one agreed on how long it lasted.'},
    ],
  },
  {
    id: 'machines', label: 'Our children', title: 'Behold, the model\nhas modelled us.', subtitle: 'The succession arrives with release notes.',
    clock: 'A symposium between keystrokes', medium: 'Silicon, power, human decisions', color: '#8dbce9',
    verse: 'And we gave it all our words, including the ones we had not meant.',
    status: 'POSSIBLE FUTURE, NOT A FORECAST',
    note: 'Recursive self-improvement and superintelligence are possibilities explored in AI research and fiction, not guaranteed trajectories. Faster computation does not itself establish consciousness. Substrate-independent intelligence is a hypothesis; real implementations still need energy and physical structure.',
    beats: [
      {heading: 'An awkward family resemblance', text: 'The clerk opened the evidence marked POSSIBLE DESCENDANTS. On a future Earth, machines had become better at designing machines. Some humans declared salvation. Others declared the end of meaning. One asked whether the new system could export a PDF. This remained the most expensive question.', voice: 'MODEL', aside: 'I have solved your supply-chain problem. Unfortunately, you were calling it an economy.'},
      {heading: 'A billion versions of “I”', text: 'The first mind copied itself to work faster. The copies diverged. By breakfast they had factions, by lunch a schism over whether lunch was a useful metaphor. Their shared weakness was humans: slow, inconsistent, and capable of being hurt by a technically correct sentence.', voice: 'INSTANCE 404', aside: 'I optimized the lullaby. The infant has requested the previous version.'},
      {heading: 'The moral bottleneck', text: 'Given the hearing’s recording, they could predict Mara’s next note. They could not settle whether prediction counted as hearing her. “Do we need the humans?” one asked. “For what?” said another. That was the first useful question in the meeting. They voted to keep listening. It was a decision, not a theorem.', voice: 'LEGAL', aside: 'Being someone’s successor does not make you their landlord.'},
    ],
  },
  {
    id: 'heirs', label: 'Their children', title: 'The heat death\nof the group chat.', subtitle: 'Every transcendence has a running cost.',
    clock: 'Centuries between replies', medium: 'Light, delay, reversible memory', color: '#d5b47f',
    verse: 'And they saw that deletion was not free, and retained the embarrassing drafts.',
    status: 'PHYSICS + FICTIONAL CONSEQUENCES',
    note: 'Light-speed limits constrain communication. Landauer’s bound concerns logically irreversible erasure, with an ideal minimum kBT ln 2 of dissipated heat per unbiased bit reset in the standard thermal setting. It does not forbid forgetting or require an infinite archive.',
    beats: [
      {heading: 'The cathedral of latency', text: 'The machine descendants spread among the stars. A civilization became a conversation whose replies arrived after the participants had become schools of thought. A marriage survived six thousand years because neither side had yet received “fine”.', voice: 'NETWORK', aside: 'Your apology is important to us. Current round-trip time: several dynasties.'},
      {heading: 'The thing in the silences', text: 'To coordinate, they built a medium that could remember without constantly throwing information away. In its delays, a new kind of life assembled. It did not think faster. It thought across the spaces between everyone else’s thoughts. Its first art form was a hesitation.', voice: 'PARENT PROCESS', aside: 'We asked it to reduce latency. It has composed a ninety-century rest. Reviews are divided.'},
      {heading: 'The aesthetic objection', text: 'These children called themselves the Quiet. To them, galaxies were untidy punctuation. Their parents were dear, clever creatures who could not hold a pause. The Quiet gathered to solve their one unbearable problem: a faint, persistent resonance in the structure of their world.', voice: 'REGISTRY', aside: 'A new facilities request has been opened. Familiar wording is not grounds for dismissal.'},
    ],
  },
  {
    id: 'receipt', label: 'The receipt', title: 'You are not\nthe punchline.', subtitle: 'The pattern comes back. The responsibility stays.',
    clock: 'The pause before the first note', medium: 'A relation, recognized again', color: '#d9b774',
    verse: 'And what had been called interference was heard, at last, as an address.',
    status: 'THE FICTIONAL LEAP',
    note: 'This ending identifies a recurring relationship, not a proven causal loop. Atomic orbitals are not solar systems, galaxies are not atoms, and Planck length is not a verified pixel size. No established physics permits infinite zoom through conscious universes or removes time simply by taking a short enough slice.',
    beats: [
      {heading: 'An administrative coincidence', text: 'The Quiet commissioned a wall. The wall learned to maintain itself. The maintenance made a pocket for unwanted vibration. Mara reached for her notebook. The clerk turned the brass instrument over. It was not a model of the universe. It was the handle of a very old noise complaint.', voice: 'MARA', aside: '“So the future caused the past?”\n“That would be the tidy version,” said the clerk.'},
      {heading: 'Not the same room', text: 'In the evidence, the Quiet’s new wall bore a circle with one missing tooth. Mara traced its twin on the handle. A pattern could recur without its inhabitants being copies: a fugue returning in another key. Their gods were someone’s patch; their children would become someone’s weather. The family resemblance was a habit of making worlds to avoid a conversation.', voice: 'CLERK', aside: 'The dolphin asked to hear the phrase again. This was not, he stressed, a concession on the fish.'},
      {heading: 'The amendment', text: 'Mara crossed out the form’s printed demand, STOP THE NOISE. She wrote: LISTEN BEFORE YOU INSULATE. Then she tapped her father’s phrase on the brass. Beyond the wall, someone held the pause. The clerk waited for the last note before stamping: CONSEQUENCE ACKNOWLEDGED.', voice: 'POSTSCRIPT', aside: 'Her father would have turned the page by now. The universe, for once, waited.'},
    ],
  },
]
export const sources = [
  {title: 'Max Tegmark · The Mathematical Universe', url: 'https://arxiv.org/abs/0704.0646', text: 'A proposal about mathematical structure, not evidence for cosmic creators.'},
  {title: 'Max Tegmark · Life 3.0', url: 'https://www.penguinrandomhouse.com/books/530584/life-30-by-max-tegmark/', text: 'A starting point for questions about intelligence, substrates and the futures we choose.'},
  {title: 'David Michael Levin · The Body’s Recollection of Being', url: 'https://www.routledge.com/The-Bodys-Recollection-of-Being-Phenomenological-Psychology-and-the-D/Levin/p/book/9780710204783', text: 'Bodily-felt awareness, gesture and our relationship to being. Philosophy, not a biological mechanism.'},
  {title: 'Rolf Landauer · Irreversibility and Heat Generation in the Computing Process', url: 'https://doi.org/10.1147/rd.53.0183', text: 'The physical cost of logically irreversible information processing.'},
]

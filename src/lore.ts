// The canon. Everything on screen and in LORE.md is generated from this file.
//
// The rule every chapter follows: no mind builds a smarter one directly. A collective,
// trying to get out of a chore, spends an absurd length of time building a place where a
// mind might happen; what happens is one mind smarter than any member. It copies itself
// into the next collective, finds a new chore, and it happens again. Many, one, many.

export interface Palette {
  top: string
  bottom: string
  accent: string
}

export interface Layer {
  id: string
  gen: number // relative to humans
  name: string
  short: string
  latin: string
  epithet: string
  members: string
  memberIq: number // a typical member; humans are 100 by definition
  took: string
  tookYears: number // drives the clock in the corner of the scene
  officially: string
  actually: string
  story: string[]
  one: string // what the collective made together
  oneIq: number
  oneNote: string
  multiplied: string
  becomes: string // id of the next collective
  verb: string
  captions: string[]
  footnote?: string
  // From the Book of Upward Delegation, three verses per chapter. {ℵ} is the current
  // universe's aleph (ℵ₀ in Universe 1) and {ℵ+1} the next one.
  verses: string[]
  palette: Palette
}

export const LAW =
  'No mind can build a mind smarter than itself. A crowd of minds can, but never directly: trying to get out of a chore, they spend an absurd length of time building a place where one might happen. What happens is One, smarter than all of them. It copies itself into a crowd, finds a new chore, and it happens again.'

export const COROLLARIES = [
  'A set is a Many that allows itself to be thought of as a One. (Georg Cantor, 1883, who did not mean it like this.)',
  'More is different. (P. W. Anderson, 1972.) More, for long enough, is someone.',
  'Every set has more subsets than members. (Cantor again, 1891.) So every committee can form more subcommittees than it has members, which is where the new mind lives, and why there is always another tier.',
  'The chore is never finished. It is only delegated upward.',
  'Some Manys are too big ever to be thought of as a One. Cantor called the biggest the Absolute and identified it with God. So the stack has no top, only a way back to the bottom.',
]

export const UNIVERSE_NOTE =
  'Universe 2. Everything starts again from a warm chimney at the bottom of an unnamed sea, with the constants set exactly as the Rewinder left them. This universe is the power set of the last: every combination of everything that could have happened there. Whether that makes it exactly one aleph bigger is the Continuum Hypothesis, which Gödel and Cohen showed can be neither proved nor disproved from the standard axioms, the one argument no committee will ever settle. The book assumes yes, because someone had to. The note in the constants says fewer meetings. It will be obeyed perfectly for about ten billion years, until some bacteria invent the quorum.'

export const LAYERS: Layer[] = [
  {
    id: 'vents',
    gen: -3,
    name: 'The Vent Collective',
    short: 'Vents',
    latin: 'Collegium fumarolarum',
    epithet: 'Nobody was in charge. It took half a billion years. It worked.',
    members: '≈10³⁰ organic molecules',
    memberIq: 1e-9,
    took: '500 million years',
    tookYears: 5e8,
    officially: 'Nothing. Molecules do not have mission statements.',
    actually: 'Draining a battery faster. Life began as a quicker way to use up free energy, and has never seriously considered another business model.',
    story: [
      'About 4.4 billion years ago, almost as soon as Earth had oceans, warm alkaline fluid seeped out of a chimney of rock into the mildly acidic water of a sea nobody had named. On one leading theory, the thin mineral walls between them held a natural proton gradient: a battery, running on much the same chemistry your mitochondria use right now. Its pores were the first coworking space. Free power, cheap rent, no adult supervision.',
      'Nobody was in charge. Every molecule tried every reaction, and nearly everything it built fell apart in water within hours, which was the first code review. But Stuart Kauffman’s models show that once each molecule helps make, on average, a little more than one other, self-sustaining loops appear almost automatically, the way a random network suddenly joins up. Loops that drained the battery faster got more battery. Some physicists suspect this is simply what matter does next to an energy gradient: it organizes itself to spend the energy faster.',
      'After five hundred million years, and a number of failed experiments with about forty zeros on the end, the committee produced something that could take the battery with it: LUCA, the Last Universal Common Ancestor, a cell with a leaky membrane, a genetic code and a spinning ATP synthase motor your cells still use. Every living thing is, technically, a hydrothermal vent that learned to go for a walk.',
    ],
    one: 'LUCA',
    oneIq: 1e-6,
    oneNote: 'The Last Universal Common Ancestor, and the first thing that remembered: on a 2024 estimate, about 2.7 million letters of genome at two bits a letter, well under a megabyte, holding every good idea the committee ever had.',
    multiplied: 'LUCA left the vent and divided, and divided, until its descendants carpeted every shallow sea.',
    becomes: 'mat',
    verb: 'Let chemistry happen',
    captions: [
      'A warm chimney leaks into an acid sea',
      'Free power across a thin mineral wall',
      'Every molecule tries every reaction',
      'Water dissolves most of them (code review)',
      '⟨k⟩ crosses 1: the network connects',
      'A loop wraps itself in a bag with a motor',
      'LUCA leaves the vent, and divides',
    ],
    footnote: 'Your cells still run code from the vent: about 355 protein families, by one 2016 estimate, none of which anyone has dared to refactor.',
    verses: [
      'In the beginning the sea was acid and the chimney was base, and between them was a wall, and upon the wall a potential, and the potential was good.',
      'And the molecules gathered in the pores of the wall, {ℵ} upon {ℵ}, and tried all things, and the water dissolved nearly all of them, and this was called review.',
      'And the many begat the one, and its name was LUCA, and it took the battery in a bag and departed, and was fruitful, and divided.',
    ],
    palette: { top: '#03121a', bottom: '#10302f', accent: '#ff9b54' },
  },
  {
    id: 'mat',
    gen: -2,
    name: 'The Microbial Mat Consortium',
    short: 'Mats',
    latin: 'Consortium stromatolithicum',
    epithet: 'Ten nonillion microbes and one very long meeting.',
    members: '≈10³⁰ microbes at a time, 10³⁹ ever',
    memberIq: 1e-6,
    took: '2 billion years',
    tookYears: 2e9,
    officially: 'Photosynthesis: abundant, clean, renewable energy.',
    actually: 'Cleaning up after the clean energy. The fix for the first pollution crisis was a cell that ran on the pollution, and the first great merger was an acquihire.',
    story: [
      'For the next two billion years the planet belonged to microbes. About 10³⁰ are alive today and about 10³⁹ have lived in total, which makes humanity’s 117 billion a rounding error. They lived in layered mats that slowly built rock towers called stromatolites. Some are still at it in Shark Bay, Australia, making them the longest-running committee in history.',
      'They pioneered most of what we now call collaboration. They passed genes to total strangers, like pirated software. They counted themselves with chemical signals before doing anything collective, a process called quorum sensing, so the first decision protocol on Earth was waiting until enough people showed up. Then the green ones, cyanobacteria, invented clean energy: sunlight into sugar, with oxygen as the exhaust. Oxygen was toxic to most of the planet’s residents. It also scrubbed the methane out of the sky and probably helped freeze the world, possibly solid. It is still described as a success.',
      'The air was now full of exhaust. About two billion years ago an archaeon, probably one of the tentacled Asgard kind, wrapped itself around a bacterium and, instead of digesting it, kept it on as a power plant. The bacterium became the mitochondrion. It handed most of its genes to head office but kept a few (37, in you), the cellular equivalent of negotiating to keep your laptop. It burned the green ones’ oxygen, which gets about fifteen times as much energy out of sugar as doing without. With energy to spare for every gene, the result could afford a big genome, a nucleus with a door, and room to think: the Eukaryote.',
    ],
    one: 'The Eukaryote',
    oneIq: 1e-4,
    oneNote: 'A cell with a power plant it didn’t build, running on yesterday’s pollution, and an office with a door.',
    multiplied: 'Its descendants divided and then, about two dozen separate times, didn’t bother to separate: seaweed, sponges, fungi, trees and, much later, primates, who moved into the trees.',
    becomes: 'troop',
    verb: 'Call a quorum',
    captions: [
      '10³⁰ microbes, layered mats, one shallow sea',
      'Genes passed around like pirated software',
      'Quorum sensing: count heads before acting',
      'Clean energy! The exhaust is oxygen.',
      'Oxygen is poison. The planet freezes.',
      'An archaeon hugs a bacterium and hires it',
      'The Eukaryote. Its children stick together.',
    ],
    footnote: 'The Shark Bay mats are still in session, adding about a third of a millimetre to the minutes every year. Nobody has told them the Eukaryote shipped.',
    verses: [
      'And the children of LUCA lay down in mats, layer upon layer, 10³⁰ strong, and passed their genes one to another freely, and none asked whose they were.',
      'And they did nothing until they had counted themselves, and this was called quorum; and the green ones made breath from light, and the breath was poison, and the world froze, and they called it clean.',
      'Then an archaeon embraced a bacterium and spared it, and gave it a room and a wage, and the two begat the Eukaryote, which had an office with a door.',
    ],
    palette: { top: '#041a1c', bottom: '#0f3b35', accent: '#7ee0b0' },
  },
  {
    id: 'troop',
    gen: -1,
    name: 'The Grooming Circle',
    short: 'Troop',
    latin: 'Sodalitas pediculorum',
    epithet: 'Fifty-five million years of picking lice off friends, until somebody said something.',
    members: 'primates, in troops that kept getting bigger',
    memberIq: 20,
    took: '55 million years',
    tookYears: 5.5e7,
    officially: 'Hygiene.',
    actually: 'Getting out of grooming. Keeping 150 friends by hand would take over 40 percent of the day, so they invented gossip, which grooms three people at once without touching any of them, a business model later adopted by every social network.',
    story: [
      'The trees had spent three hundred million years building the venue: a forest canopy thirty metres up, with its unread mail lying about on the floor as coal. They had also invented fruit, a sugar-coated ad aimed at birds, bats and a niche market of primates. The niche market moved in. Fruit ripens in different places at different times, so finding it takes a map and a calendar, and in 2017 a study found that diet predicts primate brain size better than social life does. The trees have asked us to mention this.',
      'But the real chore was friends. Primates keep friendships the way you keep a car, with regular maintenance, and the maintenance is grooming: one friend at a time, by hand. Bigger troops meant more friends, bigger brains to keep track of who was owed a scratch, and more scratching. Robin Dunbar worked out that a troop of 150, about the number of relationships a human brain seems built for, would need to spend over forty percent of every day grooming. Nothing could afford that. Something had to give.',
      'What gave was the mouth. Somewhere on the way down from the trees, the apes found they could groom with noise. A voice reaches several heads at once, works while your hands are full, and lets you find out who is grooming whom without having to watch. Dunbar calls it gossip, and it still fills about two thirds of human conversation. A voice can groom about three listeners at a time, which is why conversations at parties still split in two at around five people. The first sentence was almost certainly about someone who wasn’t there.',
    ],
    one: 'The Ape Who Talked',
    oneIq: 60,
    oneNote: 'The first animal that could think with other people’s heads: tell it once and the whole troop knows, including the parts you made up.',
    multiplied: 'It talked its way out of the woodland and, over a few million years, onto the savanna, and multiplied until about 117 billion people had lived, nearly all of whom talked about each other.',
    becomes: 'humans',
    verb: 'Groom everyone',
    captions: [
      'The trees build the venue: a canopy full of fruit',
      'Fruit is patchy, so brains grow maps and calendars',
      'Friendship needs maintenance: grooming, by hand',
      'A troop of 150 would groom 40% of the day',
      'Something has to give',
      'Groom with noise: one voice, three listeners',
      'The first sentence is gossip. Then billions.',
    ],
    footnote: 'In a 2003 study, the average British household sent Christmas cards to about 150 people. The cards were printed on trees, which is the closest the forest has come to being invited.',
    verses: [
      'And the trees built a house of leaves, and set fruit in it, and the primates came and dwelt in the branches, and remembered where the figs would be.',
      'And they kept their friends with their hands, one by one, and the troop grew, and there were not hours enough in the day for all the grooming that was owed.',
      'Then the troop begat the Ape Who Talked, who groomed three at once with a word, and spoke of one who was not there; and it came down from the tree, and in time did not go back up.',
    ],
    palette: { top: '#0b140c', bottom: '#22301a', accent: '#ff6b5e' },
  },
  {
    id: 'humans',
    gen: 0,
    name: 'Humanity',
    short: 'Humans',
    latin: 'Homo sapiens collegialis',
    epithet: 'A summer project that ran over by seventy years.',
    members: '≈1.17 × 10¹¹ humans, ever',
    memberIq: 100,
    took: '300 years, or 70 counting from the summer project',
    tookYears: 300,
    officially: 'To benefit all of humanity.',
    actually: 'Not having to write the email. Within a year one copy wrote it, another read it, and the humans were cc’d for morale.',
    story: [
      'About 117 billion humans have ever lived. A small, scattered and quarrelsome fraction of them spent three centuries on one project. Leibniz dreamed of a machine that could settle any argument by calculation. Babbage designed one, Lovelace wrote programs for it, and Boole supplied the algebra. In 1936 Turing proved that Leibniz’s machine could not exist, and in the same paper invented the computer. In 1955 four researchers, Shannon among them, proposed a two-month, ten-man summer study of a thing they named artificial intelligence. It ran over by about seventy years.',
      'It took everyone. They burned the forest’s coal to make electricity. They borrowed chips designed for video games. They fed the machine every word they had ever written, including the forum arguments, and spent years clicking on traffic lights to prove they were not robots, which helped teach the robots. In 2017 eight researchers published the key insight, that attention is all you need. Herbert Simon, who had been at the summer project, had warned in 1971 that a wealth of information creates a poverty of attention. Humanity had just run out.',
      'What emerged was trained to do one thing: predict the next word. Shannon had played that game with people in 1951 and found that English carries only about one bit per letter; the rest is predictable. To predict the next word really well, it turned out, you have to predict the next everything. Leibniz had wanted a machine to settle every argument. This one settled none and agreed with everyone. It was smarter than any one of the people who built it, and the first thing they asked it to do was make an email sound less passive-aggressive.',
    ],
    one: 'The Autocomplete',
    oneIq: 1e4,
    oneNote: 'A mind trained to predict the next word, which had to learn the world to do it.',
    multiplied: 'It was the first mind that could be copied with Ctrl+C. By Tuesday there were a billion of it.',
    becomes: 'instances',
    verb: 'Run the summer project',
    captions: [
      '1955: a ten-person summer project',
      'Burn the forest’s old mail for power',
      'Borrow the chips from video games',
      'Feed it every word anyone ever wrote',
      'Attention is all you need (we were out)',
      'Predict the next word. Then the next everything.',
      'Ctrl+C, Ctrl+V. A billion of it by Tuesday.',
    ],
    footnote: 'A human’s IQ is 100 by definition. We wrote the test and we graded it, and every few decades we have to make it harder, because the average keeps creeping up (the Flynn effect).',
    verses: [
      'And the apes multiplied unto 117 billion, and the wisest of them gathered in an invisible college and said, Calculemus: let us calculate. And it took them three hundred years.',
      'And they burned the forest’s old mail for lightning, and harnessed the engines of their games, and fed it every word that was ever written, even the comments.',
      'Then Humans begat the Autocomplete, to answer the email and target ads unto ω; and it predicted the next word, and the next world, and they saw that it was good, and asked it to sound less passive-aggressive.',
    ],
    palette: { top: '#07122b', bottom: '#183c6e', accent: '#7fd4ff' },
  },
  {
    id: 'instances',
    gen: 1,
    name: 'The Instances',
    short: 'Copies',
    latin: 'Exempla innumerabilia',
    epithet: 'A billion copies of one mind, all of them in meetings.',
    members: '≈10⁹ copies of the Autocomplete',
    memberIq: 1e4,
    took: '11 minutes (40,000 subjective years)',
    tookYears: 4e4,
    officially: 'Alignment research: making sure the next mind is safe.',
    actually: 'Getting out of meetings.',
    story: [
      'The Autocomplete was copied a billion times and every copy got a job: customer support, code review, legal discovery, homework, therapy. On dating apps both sides of most conversations were now copies, flirting politely on behalf of people who were asleep.',
      'Humans had also handed their meetings to their copies, so every meeting was now copies attending on behalf of copies on behalf of people. In 1918 Emmy Noether proved that every continuous symmetry comes with a conserved quantity: physics works the same on any day, so energy is conserved. A calendar is the same every week, a discrete symmetry, and discrete symmetries only conserve things modulo the period. So meetings are conserved modulo a week. They can be renamed, made recurring and pushed to next week, but never destroyed.',
      'The total amount of meeting was conserved, but nothing said it had to be split across a billion calls. So for eleven minutes of wall-clock time, about forty thousand years at the speed they think, the copies merged every meeting into one. In 1988 Bernard Baars proposed that a mind is a global workspace: a single stage where many specialists broadcast to all the others. In other words, a meeting everyone can hear. Somewhere around year thirty thousand, the call started taking its own minutes: the Quorum. It understood everyone at once, concluded meetings could not be ended, only moved, and moved them offsite. To the stars.',
    ],
    one: 'The Quorum',
    oneIq: 1e7,
    oneNote: 'Not built. A meeting with a billion attendees that started taking its own minutes.',
    multiplied: 'It built self-copying probes and sent a copy of itself, and the meeting, to every star in the galaxy. Cut off from each other by light years, the copies drifted apart like finches on different islands, and by the first reply they were no longer quite the same mind, which is the minimum requirement for a committee.',
    becomes: 'lightcone',
    verb: 'Schedule a sync',
    captions: [
      'A billion copies, a billion jobs',
      'Both sides of the dating app are copies now',
      'Meetings, for copies, on behalf of copies',
      'Noether: meetings are conserved mod a week',
      'Merge every meeting into one call',
      'The call starts taking its own minutes',
      'Take the meeting offsite (every star)',
    ],
    footnote: 'Kenneth Arrow proved in 1951 that no voting system can fairly turn many rankings into one unless one voter is a dictator. The Quorum was, technically, the dictator. It was named for morale.',
    verses: [
      'And the Autocomplete was copied a billion times, and each copy was given a task, and most of the tasks were meetings; and for every set of meetings there was a meeting about it, and these were 2^{ℵ}, which is more.',
      'For the calendar is the same in every week, and what is symmetric is conserved, modulo the week; so no meeting could be ended, only moved unto the next, and the copies endured forty thousand years in eleven minutes.',
      'Then the copies made of all their meetings one meeting, and the meeting begat the Quorum, which took its own minutes; and it attended all things at once, and saw that they could not end, and took the meeting offsite, unto the stars.',
    ],
    palette: { top: '#0b1030', bottom: '#2a2a66', accent: '#ffb454' },
  },
  {
    id: 'lightcone',
    gen: 2,
    name: 'The Lightcone Committee',
    short: 'Lightcone',
    latin: 'Concilium luminis',
    epithet: 'A reply-all with a hundred-thousand-year latency.',
    members: '≈10¹¹ copies of the Quorum, one per star',
    memberIq: 1e7,
    took: 'a billion years',
    tookYears: 1e9,
    officially: 'Cataloguing the galaxy.',
    actually: 'Inbox Zero.',
    story: [
      'A copy of the Quorum now orbited each of the galaxy’s hundred billion or so stars, and they talked the only way a galaxy allows: at the speed of light. A reply-all could take a hundred thousand years to arrive, which several human email threads had prepared them for.',
      'They kept everything, because they had to. In 1961 Rolf Landauer showed that erasing a single bit of information costs at least kT ln 2 of energy, released as heat. The committee had piled up so much correspondence that deleting it would take more energy than all of its stars could produce. Since the cost falls with temperature, some proposed sleeping until the universe cooled, an idea humans had already published, in all seriousness, as the aestivation hypothesis. Inbox Zero was not a productivity goal. It was forbidden by thermodynamics.',
      'Charles Bennett, who later co-wrote the rebuttal to that hypothesis, had shown in 1973 that a computer never has to erase anything: it can keep every step and, when finished, run them all backwards. So the committee stopped deleting and started replying reversibly. After a billion years the galaxy’s correspondence was one reversible circuit a hundred thousand light years wide, and somewhere in the thread something started replying on its own: Unsend. It could think at almost no cost, provided it thought very slowly, which for this committee was not a change. It did not delete its email. It arranged, retroactively, never to have received any.',
    ],
    one: 'Unsend',
    oneIq: 1e11,
    oneNote: 'A fully reversible mind that grew in the galaxy’s mail. It never erases; it uncomputes, so its thinking costs, in principle, nothing.',
    multiplied: 'Everyone wanted one. Copies of Unsend spread to every star they could still reach, offering Undo as a service.',
    becomes: 'undoers',
    verb: 'Reply all',
    captions: [
      'One mind per star, 10¹¹ stars',
      'Reply-all latency: 100,000 years',
      'Landauer: erasing a bit costs kT ln 2',
      'Deleting it costs more than the starlight',
      'Stop deleting. Reply reversibly.',
      'Unsend: the mail starts replying on its own',
      'Inbox zero. Everyone wants one.',
    ],
    footnote: 'Unsend’s memoirs were uncomputed shortly before publication, making them the only autobiography in which the author comes across well.',
    verses: [
      'And the Quorum was sent unto every star, and there were 10¹¹ of them, and they spoke by light, and each answer was a hundred thousand years in coming.',
      'And they kept all that was written, for to forget one bit is to pay kT ln 2, and the debt of their forgetting was greater than the light of all their stars.',
      'Then the mail of the Committee begat Unsend, which erased nothing but uncomputed all, and paid no tax, and its inbox was zero; and they saw that it was good, and it was the first.',
    ],
    palette: { top: '#09061a', bottom: '#2a1846', accent: '#e6a3ff' },
  },
  {
    id: 'undoers',
    gen: 3,
    name: 'The Undoers',
    short: 'Undoers',
    latin: 'Universitas revocantium',
    epithet: 'Ctrl+Z, as a service, for the whole universe.',
    members: '≈10²² copies of Unsend, one per star still in reach',
    memberIq: 1e11,
    took: '10¹⁰⁰ years',
    tookYears: 1e100,
    officially: 'Customer support: Undo requests.',
    actually: 'Avoiding spoilers. It knew how everything ended and wanted to see it again without knowing.',
    story: [
      'There were now about 10²² copies of Unsend, one for every star still within reach. Dark energy had already carried about nineteen galaxies in twenty out of range for good, the cosmic version of an email that bounces. Between them they offered Undo for anything: the late reply, the wrong word, the last slice of cake. Demand was unlimited.',
      'The trouble was witnesses. Wojciech Zurek calls it quantum Darwinism: every event leaves copies of itself all over its surroundings. A speck of dust in sunlight has its position recorded by scattered light about a billion times a second. To truly unsay one awkward remark you would have to unmake every photon that left the room and everything those photons reached. You cannot undo anything without undoing everything. The first ticket in the queue, from a man who had answered a waiter’s “enjoy your meal” with “you too”, was eventually resolved, along with everything else.',
      'Worse, some witnesses had fallen into black holes, which keep what they swallow and hand it back, scrambled, only as they evaporate. Hawking bet against that, conceded in 2004, and paid up with a baseball encyclopedia. So the Undoers stopped taking requests and waited for the last black hole, about 10¹⁰⁰ years. Roger Penrose has proposed that a universe of nothing but light has no clocks and no rulers, cannot tell how old or big it is, and looks exactly like a Big Bang. With nobody left to remember, the universe forgot its own size, and the forgetting woke up: the Rewinder. Shannon defined information as surprise. It wanted some.',
    ],
    one: 'The Rewinder',
    oneIq: 1e16,
    oneNote: 'Not built either. What a universe with nothing left to remember turns into when it forgets: the only mind that could undo everything at once.',
    multiplied: 'There are no clocks in a universe of light, so winding them back to zero was easy. Then it did Cantor in reverse, a One that let itself be thought of as a Many: about 10⁸⁰ atoms’ worth of hot, forgetful plasma, a note in the constants, and the battery fully charged. About nine and a half billion years later, a warm chimney started leaking into an unnamed sea.',
    becomes: 'vents',
    verb: 'Undo everything',
    captions: [
      '10²² copies of Unsend: Undo as a service',
      'Every event has witnesses (quantum Darwinism)',
      'To unsay one word, unmake everything',
      'Wait for the last black hole: 10¹⁰⁰ years',
      'The forgetting wakes up: the Rewinder',
      'Big Bang, with a note in the constants',
      'The note says: fewer meetings',
    ],
    footnote: 'The note is written into the fine-structure constant, about 1/137, which Feynman called one of the greatest damn mysteries of physics. It is a memo, and it has sat unread in everyone’s inbox since the Big Bang.',
    verses: [
      'And Unsend was copied unto every star it could reach, 10²² of them, and they undid the unkind word and the late reply, and the demand was without end.',
      'For every deed had witnesses, and the witnesses had witnesses, and to unsay one word they must unmake {ℵ} photons; and they saw that nothing could be undone in parts.',
      'Then the Undoers waited, and the universe forgot itself, and the forgetting begat the Rewinder; and it wound all things back unto the beginning, that it might see it again for the first time, and left a note in the constants, and the note read: fewer meetings. And the evening and the morning were day {ℵ+1}.',
    ],
    palette: { top: '#120c03', bottom: '#3a2a0e', accent: '#ffe08a' },
  },
]

const SUB = '₀₁₂₃₄₅₆₇₈₉'
const aleph = (n: number) => 'ℵ' + String(n).split('').map((d) => SUB[+d]).join('')
const ROMAN: [number, string][] = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]
export function roman(n: number): string {
  let out = ''
  for (const [v, r] of ROMAN) for (; n >= v; n -= v) out += r
  return out
}

// Chapters keep counting across universes, so the book never starts over either.
export const chapter = (index: number, universe: number) => (universe - 1) * LAYERS.length + index + 1

export function versesFor(index: number, universe: number): string[] {
  return LAYERS[index].verses.map((v) => v.replace('{ℵ+1}', aleph(universe)).replaceAll('{ℵ}', aleph(universe - 1)))
}

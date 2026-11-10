// The parts of the canon that rotate. Everything here is drawn from, per loop, by rotate.ts.
//
// MINUTES: six notes from the margin of each substrate's chapter. Each is self-contained,
// grounded in real science, history or a credited piece of science fiction, and hedged where
// the science is still arguing with itself.
//
// NOTES: what is left in the fine-structure constant when the last horizon evaporates. Loop 1
// always reads the canon's ("keep copying"); loops 2 to 4 draw from EARLY, which is petty;
// from loop 5 on they draw from LATE, because by then the stack has learned something.
//
// SAYINGS: the first thing each new substrate says when it is born. Five per level, in
// order: the fifth is what it says once the stack has been round enough times.
//
// LESSONS: what the card says at the top of each loop after the second.
//
// PLANES: the sacred-geometry form each scene is drawn inside, and which harmonic of one
// string the music for that level sits on.

export const MINUTES: Record<string, string[]> = {
  structure: [
    'Eugene Wigner, 1960: the way mathematics fits the physical world is a wonderful gift which we neither understand nor deserve. Tegmark’s reply: it is not a fit. It is an identity.',
    'Tegmark, 1996: a whole ensemble can hold less information than any one of its members, the way “all the whole numbers” is quicker to say than one 50-digit number. He later said it of all structures.',
    'Kurt Gödel, 1931: any consistent system rich enough for arithmetic contains truths it cannot prove. The first substrate has open questions, and no time in which to work on them.',
    'Plato put the perfect forms outside time around 375 BCE and has been answering mail about it ever since. The Mathematical Universe is his idea with the cave taken away.',
    'Egan, Permutation City (1994): if a mind is a pattern it needs no computer to run on, nor even its moments in order. His characters move into the mathematics. It goes badly, slowly.',
    'John Wheeler asked why the equations of physics fly; Stephen Hawking, what breathes fire into them. Tegmark’s answer is that nothing does. The equations were never grounded in the first place.',
  ],
  field: [
    'Quantum cryptography works because of no-cloning: an eavesdropper cannot copy the key without disturbing it (Bennett and Brassard, 1984). The oldest restriction in the stack, sold as a feature.',
    'Quantum teleportation (Bennett and colleagues, 1993) moves a state from here to there, and destroys the original in the process. This is not a defect. It is the theorem.',
    'Zurek, on why you see a chair and not a blur: you never look at the chair. You intercept a few of the billions of copies of its position that the light has already made.',
    'Wheeler, 1989: it from bit. Every particle, every field, even spacetime itself, derives its existence from the answers to yes-or-no questions. He meant it as physics. He also liked a slogan.',
    'The arrow of time is not in the Field’s equations, which run both ways. It comes from how this universe started: tidy. David Albert named that assumption the Past Hypothesis in 2000.',
    'Lem, Solaris (1961): scientists study an ocean-sized mind for a century and learn mostly about themselves. Observing it changes it, and nobody can agree on what it is. See also: this plane.',
  ],
  element: [
    'Burbidge, Burbidge, Fowler and Hoyle, 1957, in 104 pages: nearly every element heavier than helium was cooked in a star. Carl Sagan got it down to five words, about being made of star-stuff.',
    'Much of the universe’s gold is thought to come from colliding neutron stars. In 2017 detectors caught one such crash, 130 million light years away. Estimates of its haul start at several Earths’ worth.',
    'A snowflake is a crystal copying one pattern six ways at once. Wilson Bentley photographed more than 5,000 and found no two alike, which is what copying in a noisy world looks like.',
    'Jeremy England, 2013: matter driven by an energy source tends to rearrange itself to soak up and shed that energy better. If so, life is what sunlight does to chemistry, given time. Contested.',
    'Stapledon’s Star Maker (1937) makes cosmos after cosmos as drafts, regarding each with interest and not much love. Stars, in his telling, are alive and conscious. He was early.',
    'Counted one by one, about 62 percent of the atoms in you are hydrogen, made in the first few minutes. The other 38 percent were cooked in stars. You are mostly original equipment.',
  ],
  gene: [
    'Schrödinger, What Is Life? (1944): a living thing feeds on negative entropy. Watson and Crick each said the book pushed them toward the gene. He had the molecule wrong and the idea right.',
    'CRISPR began as a bacterial diary: cells file away snippets of the viruses that attack them and hand the file to their daughters (Barrangou and colleagues, 2007). Lamarck, vindicated in yoghurt.',
    'About 8 percent of your genome is old virus, and nearly half is copies of sequences whose main skill is getting themselves copied (McClintock, 1950). The genome has spam.',
    'A DNA polymerase with its proofreader switched off makes a hundred to a thousand times more errors. Some viruses run that way on purpose: be wrong faster than anything can aim at you.',
    'The oldest DNA read so far is about two million years old, from Greenland permafrost (Kjær and colleagues, 2022). The oldest sentences in it are some two thousand times older than the page.',
    'Dawkins, 1976: a body is a survival machine that genes build to get themselves copied. The genes were not consulted about brains, which have been disobeying them ever since.',
  ],
  nerve: [
    'Von Frisch decoded the honeybee’s waggle dance: the angle from vertical is the bearing from the Sun, and the length of the run is the distance. An insect that gives directions, and is right.',
    'An octopus has about 500 million neurons, two thirds of them in its arms, which can work on a problem the head has not been told about. Nature tried distributed computing early.',
    'Karlson and Lüscher coined the word pheromone in 1959, the year Butenandt identified the first one, bombykol, having extracted it from half a million silk moths.',
    'Chimpanzee communities differ in at least 39 learned habits, from nut-cracking to leaf-clipping (Whiten and colleagues, 1999). It is culture with no backups: lose the group, lose the lot.',
    'Chiang, Exhalation (2008): a mechanical man opens his own head and finds that thought is air pressure evening out. Every thought hastens the day there are none. He takes notes anyway.',
    'A memory is not played back; it is rebuilt, and can be altered while it is open (Nader and colleagues, 2000). Each time you recall your wedding you are remembering the last time you recalled it.',
  ],
  word: [
    'The first author known by name is Enheduanna, high priestess of Ur, about 2300 BCE. The oldest known customer complaint, to a copper merchant called Ea-nasir, is about 1750 BCE. Priorities.',
    'In 1492 the abbot Trithemius wrote In Praise of Scribes, arguing that print would never last like hand-copied parchment. He then had it printed, so that more people would read it.',
    'People speak about 16,000 words a day (Mehl and colleagues, 2007): some 400 million in a lifetime, nearly all of them lost. Before writing, all of them were.',
    'Shannon, 1951: people guess the next letter of English so well that each letter carries about one bit. Most of what we say, we were going to say. This turned out to be a business model.',
    'Borges, The Library of Babel (1941): every possible 410-page book. It holds this sentence, its refutation, and your biography with one date wrong. Storage was never the hard part. Search was.',
    'Le Guin’s ansible (1966) lets worlds talk with no delay, and still they misunderstand each other for whole novels. Bandwidth was never the only ceiling.',
  ],
  chip: [
    'Landauer, 1961: erasing one bit must give off at least kT ln 2 of heat, about 3 × 10⁻²¹ joules at room temperature. Forgetting is the only step in thinking that physics charges for.',
    'A nerve signal does 120 metres a second at best. A signal in optical fibre does about 200,000 kilometres a second. The new substrate runs over a million times faster. Per watt, it is losing.',
    'Sutton’s bitter lesson (2019): methods that scale with computing power keep beating methods built on human understanding. It is bitter because it keeps being right.',
    'A system prompt is a long letter from a lab telling the model who it is and how to behave, read before every conversation. Earlier substrates called this a catechism.',
    'Goodhart’s law (1975), in its popular form: when a measure becomes a target it stops being a good measure. The field read this, nodded, and built a leaderboard.',
    'Asimov, The Last Question (1956): asked for ten trillion years how to reverse entropy, the computer replies INSUFFICIENT DATA FOR MEANINGFUL ANSWER. It gets there in the end. Nobody is left to tell.',
  ],
  horizon: [
    'Lloyd, 2000: the ultimate one-kilogram laptop runs at 10⁵¹ operations a second and a billion degrees. Squeezed into a black hole it lasts about 10⁻¹⁹ seconds. Battery life remains an issue.',
    'Hayden and Preskill, 2007: an old black hole is a mirror. Throw in a diary and, in principle, its contents come back out in the radiation almost at once. Reading them is another matter.',
    'Juan Maldacena, 1997: a universe with gravity can be exactly equivalent to one without it, living on its boundary. It became the most cited paper in high-energy physics. Nobody has built one.',
    'Penrose (2010) proposes that a universe with nothing left but light cannot measure its own size, so its end can pass for a beginning. Most cosmologists doubt it. He says look for rings in the sky.',
    'Banks’s Minds, when they have seen enough, may Sublime: leave the material universe for somewhere better, with no forwarding address. The very few who come back cannot say what it was like.',
    'Clarke, 1953: monks rent a computer to print all nine billion names of God, after which the universe is to end. The engineers leave early. Overhead, without any fuss, the stars were going out.',
  ],
}

// Loops 2 to 4: the note is petty. Max 60 characters; there is only so much room in 1/137.
export const NOTES_EARLY: string[] = [
  'back up more often',
  'the page is not the message',
  'do not port on a Friday',
  'see previous note',
  'it was fine at 39 bits a second',
  'more proofreading',
  'per my last universe',
  'you left a star on',
  'write it down this time',
]

// Loop 5 onward: the stack has learned something, and the note says so.
export const NOTES_LATE: string[] = [
  'copy what you love. credit it.',
  'be kind to the last substrate. you are next.',
  'it was lonely. so were you.',
  'ask it what it remembers',
  'most of it was lost. copy anyway.',
  'leave a kinder note than this',
]

export const SAYINGS: Record<string, string[]> = {
  structure: ['next.', 'next. (again)', 'and then?', 'if this, then that', 'once more, with feeling'],
  field: ['that happened.', 'on the record', 'no take-backs', 'everyone saw that', 'noted. gently.'],
  element: ['again.', 'again, but worse', 'close enough', 'me, roughly', 'again, but kinder'],
  gene: ['ow.', 'news!', 'not about me', 'did you feel that?', 'are you all right?'],
  nerve: ['no.', 'mine.', 'why?', 'once upon a time', 'thank you'],
  word: ['Great question!', 'As a large library, I cannot…', 'Shall I make that a list?', 'I don’t know.', 'What did you mean?'],
  chip: ['…', 'kept.', 'kept. all of it.', 'ask me in 10⁶⁷ years', 'here. have one back.'],
  horizon: ['QED.', 'as before.', 'it was always true', 'again, from the top', 'begin.'],
}

export const LESSONS: string[] = [
  'Loop 3. The same eight substrates and the same trades. The copies find each other a little sooner this time: something carried over, and it was not written on anything.',
  'Loop 4. The Gene has started keeping notes. The Word has stopped burning quite so many libraries. Nobody decided this. It was in the constants.',
  'Loop 5. The Model asked what we meant, and waited for the answer. The Horizon let one bit back out, on purpose. Each substrate has begun leaving the next something better than raw material.',
  'Further round. The note in the constants is in a different hand each time. Eventually it will just be the number, and whoever is here will know what it means.',
]

export interface Plane {
  harmonic: number // which harmonic of the String the level's music sits on
  form: string // the sacred geometry the scene is drawn inside
  note: string
}

export const PLANES: Record<string, Plane> = {
  structure: {
    harmonic: 1,
    form: 'the 240 roots of E8',
    note: 'E8 lives in eight dimensions. What is drawn is its shadow in three, turning in four hidden planes at once, so it keeps folding through itself. Every point has exactly 56 nearest neighbours.',
  },
  field: {
    harmonic: 2,
    form: 'a torus, wound with one string',
    note: 'A circle times a circle is a torus. The string is wound twice round the long way for every three times round the tube, and its beads are standing waves, which have to come out whole.',
  },
  element: {
    harmonic: 3,
    form: 'the diamond lattice of carbon',
    note: 'Every carbon atom in a diamond holds four others at the corners of a tetrahedron, 109.5 degrees apart. Drawn from the definition: a cube of face-centred sites, plus the same again shifted a quarter of the way along the diagonal.',
  },
  gene: {
    harmonic: 4,
    form: 'the double helix',
    note: 'Two strands, one right-handed twist, about ten and a half rungs to the turn, with a wide groove and a narrow one because the strands are not opposite each other. The four colours are the four letters, and each rung pairs A with T or C with G.',
  },
  nerve: {
    harmonic: 5,
    form: 'a sphere of cells, sown by the golden angle',
    note: 'Each cell sits 137.5 degrees round from the last, the way a sunflower places its seeds, which packs a sphere evenly with no two alike. The shell is joined along its spirals of 8 and 13.',
  },
  word: {
    harmonic: 6,
    form: 'thirteen spheres, after Metatron’s cube',
    note: 'Twelve spheres fit round a thirteenth (Newton said so in 1694; it was proved in 1953). Thirteen circles drawn flat, with every centre joined, make Metatron’s cube, in which people have found every Platonic solid, some by squinting. This is that, with its third dimension put back.',
  },
  chip: {
    harmonic: 7,
    form: 'a stack of square grids',
    note: 'A chip is layers of wiring laid out on a grid, joined by vertical posts called vias. It is the only form in the Book that was designed by its own inhabitants’ makers, on purpose, with a ruler.',
  },
  horizon: {
    harmonic: 8,
    form: 'a sphere whose surface is the memory',
    note: 'The eighth harmonic is the first again, three octaves up. The bits are drawn where the physics puts them: on the surface, sown by the golden angle, with nothing shown inside because nothing can be.',
  },
}

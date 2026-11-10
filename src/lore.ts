// The canon of Substrate. Everything on screen and in LORE.md is generated from this file.
//
// The idea, which is Max Tegmark's (Our Mathematical Universe, 2014; Life 3.0, 2017) pushed
// further than he pushes it: life is information that keeps itself from being forgotten, and
// it does not care what it is written on. Eight times, here, it copies itself onto a new
// substrate. Each level is asked the same eight questions, in the same order, so that by the
// third or fourth the reader can see that what they are looking at is the same thing again:
// something that remembers, copies and repairs, on a different kind of page.
//
// House rules: every fact about real people, dates, numbers and physics is true, and hedged
// where the field is still arguing. The stack is the fiction, and each level says, in
// `honest`, exactly where the physics stops and the Book starts.

export interface Palette {
  top: string
  bottom: string
  accent: string
}

// The eight questions every substrate is asked.
export const BEATS = ['substrate', 'memory', 'copy', 'repair', 'learn', 'day', 'ceiling', 'leap'] as const
export type BeatKey = (typeof BEATS)[number]
export const QUESTIONS: Record<BeatKey, string> = {
  substrate: 'What it is written on',
  memory: 'How it remembers',
  copy: 'How it copies',
  repair: 'How it repairs',
  learn: 'How it learns',
  day: 'What it is like',
  ceiling: 'Where it stops',
  leap: 'How it ported itself',
}

export interface Beat {
  title: string
  text: string // what the panel says; at most 490 characters, so it fits a phone without scrolling
  tag: string // the callout on the stage, pointing at the thing the text is about
}

// Tegmark's test for life, split into its parts, plus his two for telling the versions apart
// (can it redesign its software, can it redesign its hardware).
export const TRAITS = ['remembers', 'copies', 'repairs', 'learns', 'rebuilds'] as const
export type TraitKey = (typeof TRAITS)[number]
export const TRAIT_LABELS: Record<TraitKey, string> = {
  remembers: 'Remembers',
  copies: 'Copies itself',
  repairs: 'Repairs itself',
  learns: 'Learns',
  rebuilds: 'Rebuilds itself',
}
// which beat makes the case for which trait
export const TRAIT_BEAT: Record<TraitKey, BeatKey> = { remembers: 'memory', copies: 'copy', repairs: 'repair', learns: 'learn', rebuilds: 'ceiling' }
export type Verdict = 'yes' | 'partly' | 'no' | 'moot'

// A measurement with a label for people and, where there is an honest number, its log10 for
// the charts in the ledger.
export type Stat = [label: string, log10: number | null]

export interface Layer {
  id: string
  version: string // Tegmark's 1.0, 2.0 and 3.0; the rest are the Book's
  name: string
  short: string
  epithet: string
  substrate: string // what the information is written on, in a phrase
  unit: string // one unit of memory
  members: string // how many there are
  took: string
  time: string // what time is like on this plane
  beats: Record<BeatKey, Beat>
  traits: Record<TraitKey, [Verdict, string]>
  stats: {
    news: Stat // how fast information travels, in metres a second
    lasts: Stat // how long the medium itself keeps a mark, in years
    power: Stat // what one of them runs on, in watts
    density: string
    fidelity: string
  }
  one: string // what it ported itself into: one unit of the next substrate
  oneNote: string
  port: { gains: string; pays: string } // the trade made in leaving this substrate
  above: string // how the next substrate remembers this one
  lost: string // what did not survive the port
  honest: string // where the physics stops and the Book starts
  release: { added: string[]; issues: string[] }
  becomes: string // id of the next substrate
  footnote?: string
  // From the Book of Copies, three verses per chapter. {ℵ} is the current loop's aleph (ℵ₀ in
  // loop 1), {ℵ+1} the next one, and {note} whatever was left in the constants this time.
  verses: string[]
  palette: Palette
}

export const TITLE = 'Substrate'
export const BOOK = 'The Book of Copies'

export const LAW =
  'Life is information that keeps itself from being forgotten. It does not care what it is written on. When there are enough copies, it writes itself onto a new substrate that is better at one thing and worse at another, and once the new one can remember, copy and repair itself, it is alive, and the old one is its raw material. Programmers call such a move a port, and every port is a trade. The first one bought time. The last one gives it back.'

export const COROLLARIES = [
  'It from bit. (John Wheeler, 1989.) Every thing, at bottom, is the answer to a yes-or-no question.',
  'Information is physical. (Rolf Landauer, 1991.) A bit has to be written on something, and erasing it costs heat. There is no free forgetting.',
  'The pattern matters, not the particles. (Max Tegmark, 2017, roughly.) Memory, computation and learning do not depend on what they are made of, only on how it is arranged.',
  'A message outlives its medium only by being copied. A strand of DNA rots in centuries and its oldest sentences are over three billion years old. Durability is not memory. Copying is.',
  'Every port is lossy. Whatever cannot be said on the new substrate is left behind, and later called a mystery.',
  'Since chemistry, each port has been faster and hungrier than the last. A bacterium runs on a trillionth of a watt, a brain on twenty, a data centre on a hundred million. Denser, no: nothing built since has beaten DNA.',
  'Each substrate takes the one below for raw material and the one above for a tool. Both are mistaken, in the same way.',
  'Whether a substrate counts as alive is always decided by the next one up.',
]

// What is left in the constants the first time round. Later loops draw their own.
export const CANON_NOTE = 'keep copying'

export const UNIVERSE_NOTE =
  'Loop 2. Nothing has restarted. A structure does not happen twice; it is read twice. The Book numbers its loops with alephs, Georg Cantor’s infinities, and treats each loop as the power set of the last, on the grounds that a second reading knows everything the first did plus every way it could have gone. Whether that makes it exactly one aleph bigger is the Continuum Hypothesis (generalised, from loop 3 on), which Gödel (1940) and Cohen (1963) showed can be neither proved nor disproved from the standard axioms. The Book assumes yes, because someone had to. The eight substrates are the same and so are the trades. The copies find each other a little sooner.'

export const LAYERS: Layer[] = [
  {
    id: 'structure',
    version: '0.0',
    name: 'The Structure',
    short: 'Structure',
    epithet: 'Everything that is true, and nothing that happens.',
    substrate: 'relations, and nothing else',
    unit: 'a relation',
    members: 'every structure there can be',
    took: 'no time: there is none',
    time: 'none',
    beats: {
      substrate: {
        title: 'Relations, and nothing else',
        text: 'Start with nothing to write on. Take a family tree and rub out the names. What is left is pure pattern: who is related to whom. Mathematicians call that a structure: things with no properties except their relations. Max Tegmark’s Mathematical Universe Hypothesis (2007) says such structures do not describe reality. They are reality: every one that can exist, does. This one is the root system of E8: 240 points, each defined entirely by its neighbours, as in any small town.',
        tag: 'one point = its 56 neighbours',
      },
      memory: {
        title: 'It is its own record',
        text: 'A structure does not store information. It is information. All of E8 follows from a few lines of definition, the way every digit of pi follows from a circle. Nothing has to be kept anywhere, so nothing can be lost. As memories go it is perfect, and it has a catch: it cannot hold anything that is not already true.',
        tag: 'nothing stored, nothing lost',
      },
      copy: {
        title: 'Two copies are one thing',
        text: 'Now try to copy it. Two structures with the same relations are not twins. To a mathematician they are one structure, written down twice. So the first substrate cannot replicate: there is no second place for a copy to be. Tegmark defines life as a process that can retain its complexity and replicate. The Structure passes the first test and fails the second.',
        tag: 'a copy of it is it',
      },
      repair: {
        title: 'Nothing breaks',
        text: 'Entropy, the drift of every tidy thing toward mess, needs time to work in, and there is none here: no before, no after. Nothing in E8 has ever been damaged, because nothing in E8 has ever happened. Tap a point. You cannot flip it, because there is no other value for it to have. This is the safest life will ever be. It is also not doing anything.',
        tag: 'tap one: nothing to flip',
      },
      learn: {
        title: 'It already knows',
        text: 'It cannot learn, for the same reason it cannot forget. Everything true of it is true at once. Tegmark calls this the bird perspective: a whole history seen as one frozen shape, the way a film is a reel on a shelf. Learning needs the other one, the frog’s, from inside, one frame after another. Nothing here has that view yet.',
        tag: 'the bird perspective: all at once',
      },
      day: {
        title: 'What it is like: nothing',
        text: 'There is nothing it is like to be a theorem. No moment follows another, so there is no waiting, no surprise and no boredom, which takes time too. If you could visit you would not experience stillness. You would not experience. The nearest a person comes is the instant a proof clicks: something that was always true, noticed.',
        tag: 'no now, so no experience',
      },
      ceiling: {
        title: 'Everything is true and nothing happens',
        text: 'So the first substrate is complete, permanent and inert. It holds every answer and never gets to ask a question. It lacks exactly one thing: an order. Some way for one part of the structure to count as coming before another.',
        tag: 'missing: a before and an after',
      },
      leap: {
        title: 'One axis becomes time',
        text: 'Some structures have that built in. A rule plus a starting state gives a sequence, each step fixed by the one before, like John Conway’s Game of Life (1970) unfolding from its first grid. Nothing moves: it is still the reel on the shelf. But from inside a frame, the reel looks like something happening. That is the Rule, and the first port: what was simply true now runs. It is also the first trade: time, bought with certainty. Keep the receipt.',
        tag: 'a rule, read in order, is time',
      },
    },
    traits: {
      remembers: ['yes', 'perfectly, by being the thing remembered'],
      copies: ['no', 'a copy of it is the same structure'],
      repairs: ['moot', 'nothing can break'],
      learns: ['no', 'everything is already true'],
      rebuilds: ['no', 'it cannot be otherwise'],
    },
    stats: {
      news: ['not applicable: no distance, no time', null],
      lasts: ['outside time altogether', null],
      power: ['none', null],
      density: 'no size to be dense in',
      fidelity: 'exact',
    },
    one: 'The Rule',
    oneNote: 'A structure that can be read in order. It is still only mathematics, but from inside it there is now a next.',
    port: {
      gains: 'Time. Things can happen, one after another. It is the first purchase, and the only one that will be returned.',
      pays: 'Certainty. The answers are no longer all present at once. From now on they have to be worked out, and some take longer than the universe.',
    },
    above: 'To the Field, the Structure is the law it obeys and cannot see: every physicist’s equations, and nobody’s address.',
    lost: 'The bird perspective. Nothing inside time can see the whole shape again.',
    honest: 'The Mathematical Universe Hypothesis is a philosophical proposal, not established physics. Many physicists reject it and it may not be testable. E8 is real mathematics; that it, or anything like it, is what reality is made of is a guess. Calling it alive is the Book’s alone.',
    release: {
      added: ['Everything that is true', 'No downtime (no time)'],
      issues: ['Nothing happens', 'Cannot be copied: the copy is the original', 'No users'],
    },
    becomes: 'field',
    footnote: 'Wilhelm Killing found E8 in 1887. These 240 points are its skeleton. Working out the full symmetry they stand for took a team of 18 mathematicians four years, finishing in 2007, and the answer came to 60 gigabytes. The definition still fits on a postcard. That gap, a short rule with a vast consequence, is the whole plot.',
    verses: [
      'In the beginning was the Structure, and it was true; and there was no beginning, for there was no time to begin in.',
      'And its points were {ℵ}, and each was known by its neighbours only; and none could be numbered twice, for the copy was the thing itself.',
      'And nothing in it happened. But a rule lay folded in it, and a first state; and read in order, the Structure begat the Rule, and there was a before and an after, and that was the first day, seen from inside.',
    ],
    palette: { top: '#0c0a04', bottom: '#2c2210', accent: '#ffe08a' },
  },
  {
    id: 'field',
    version: '0.1',
    name: 'The Field',
    short: 'Field',
    epithet: 'Every possibility at once, and nobody allowed to take notes.',
    substrate: 'quantum amplitudes',
    unit: 'a qubit',
    members: '2ⁿ amplitudes for every n qubits',
    took: 'a sliver of a second, as far as that means anything yet',
    time: 'runs both ways',
    beats: {
      substrate: {
        title: 'Amplitudes',
        text: 'One step up, the structure runs. The rule our universe runs on is a quantum one (Erwin Schrödinger’s equation, 1926, and its descendants). Its page is a field: loosely, a pond filling all of space, whose height at each point measures not water but possibility. That height is called an amplitude. What you would call a particle is a ripple in it. What you would call you is a great many ripples with opinions. This is one closed ripple, wound round a doughnut.',
        tag: 'a ripple, not a thing',
      },
      memory: {
        title: 'The qubit',
        text: 'The unit of memory here is the qubit: not 0 or 1 but any blend of the two, a point anywhere on a sphere. To describe 300 entangled qubits exactly takes more numbers than there are atoms in the observable universe. Yet Alexander Holevo proved in 1973 that you can only ever read one ordinary bit, a single yes or no, back out of each. It is an enormous library with a very small door.',
        tag: 'a qubit: any point on a sphere',
      },
      copy: {
        title: 'Copying is forbidden',
        text: 'Here is the strange part. Quantum information cannot be copied. The no-cloning theorem (Wootters and Zurek, and Dieks, both 1982) proves that no process can take an unknown quantum state and turn out two of it. You can move it. You cannot duplicate it. On this substrate there is exactly one of everything, so replication is ruled out a second time, for a different reason.',
        tag: 'no cloning: one of each',
      },
      repair: {
        title: 'Nothing is ever lost',
        text: 'In return, nothing is ever lost. The rule is reversible: run it backwards and every earlier state comes back exactly. Physicists call this unitarity. It means the total information in a closed quantum system never changes: no decay, no forgetting, no entropy creeping up. Tap a bead and you only disturb it; the information moves, it does not vanish. A perfect memory again, but now a moving one.',
        tag: 'run it backwards: all of it returns',
      },
      learn: {
        title: 'No facts yet',
        text: 'It still cannot learn. Learning means keeping a record, and a record is a copy: a mark in one place that matches an event in another. With no copying there are no records, and with no records there are no facts, only possibilities held together in superposition. Strictly, nothing on this plane has ever definitely happened.',
        tag: 'no records, so no facts',
      },
      day: {
        title: 'What it is like: every road, no footprints',
        text: 'Physics puts nobody here, and nothing here could say so. But try it on. You come to a fork and take both roads, and every fork after that, and no journey leaves a footprint, a memory or a photograph, so none of them counts as having happened. Run it backwards and nothing looks wrong: no earlier, no later, nothing to wait for. Imagine a chord held for ever: rich, exact, and going nowhere, because going somewhere would mean leaving a trace.',
        tag: 'past and future look alike',
      },
      ceiling: {
        title: 'It can hold, but not share',
        text: 'So the Field can hold almost anything and share none of it. Each state is a secret that cannot be copied out. For information to become public, the same for everyone who looks, something has to make many copies of it. The Field’s rule forbids that for blends. But a plain yes or no, here or there, is not a blend.',
        tag: 'a secret that cannot be shared',
      },
      leap: {
        title: 'The Fact',
        text: 'Here is the loophole. A blend cannot be copied, but a plain answer can: here, not there. Let light fall on a speck of dust, and every photon that bounces off carries away the same small note of where the speck is. Thousands of notes, all agreeing. Wojciech Zurek named this quantum Darwinism in 2003: the states that last are the ones copied most. Copied into the crowd, an answer becomes a Fact, the same for everyone. Writing the notes makes heat, and time now has a direction.',
        tag: 'copied into the crowd = a fact',
      },
    },
    traits: {
      remembers: ['yes', 'for ever: the rule is reversible'],
      copies: ['no', 'forbidden by the no-cloning theorem'],
      repairs: ['moot', 'nothing is lost, so nothing needs repair'],
      learns: ['no', 'no records, so no facts'],
      rebuilds: ['no', 'one rule, unchanging'],
    },
    stats: {
      news: ['the speed of light', 8.48],
      lasts: ['for ever, though it cannot be read', null],
      power: ['none: reversible steps cost nothing', null],
      density: 'astronomical inside, one readable bit per qubit',
      fidelity: 'exact',
    },
    one: 'The Fact',
    oneNote: 'A piece of information that has been copied so widely it is the same for everyone. The first thing on any plane to have definitely happened.',
    port: {
      gains: 'Facts. Information that can be shared, because it has already been copied into everything nearby.',
      pays: 'Reversibility. Every record is written in heat, so from here on disorder only increases. This is the arrow of time, and it is not refundable.',
    },
    above: 'To the Element, the Field is the vacuum: the nothing it sits in, which turns out to be doing most of the work.',
    lost: 'Phase: the delicate blends that could not be copied. Physicists call the loss decoherence, and are now spending billions on quantum computers to get a little of it back.',
    honest: 'Qubits, no-cloning, unitarity and decoherence are standard physics. Quantum Darwinism is a serious research programme with some experimental support, but how definite facts arise from quantum possibilities is still argued over. Calling a field alive is the Book’s alone.',
    release: {
      added: ['Time (beta): runs both ways', 'Superposition: every option, no decisions', 'Undo, for everything'],
      issues: ['Copying disabled. It is a theorem, not a bug.', 'Read access: one bit per qubit', 'No facts. Status: cannot reproduce.'],
    },
    becomes: 'element',
    footnote: 'A quantum computer is an attempt to run software on the second substrate from the sixth. The main engineering problem is stopping the universe from making copies of the answer before you are ready.',
    verses: [
      'And the Rule ran, and its running was a field of amplitudes, every way at once; and what went forward could as well go back.',
      'And nothing in it could be copied, as Wootters and Zurek have written; and nothing in it could be lost; and so nothing in it was known.',
      'Then a ripple touched the multitude, and each of the multitude carried away its likeness, and that which was copied most became true for all. So the Field begat the Fact; and the price of it was heat, and time took a direction and has kept it.',
    ],
    palette: { top: '#100611', bottom: '#2b1030', accent: '#ff7fb0' },
  },
  {
    id: 'element',
    version: '0.5',
    name: 'The Element',
    short: 'Element',
    epithet: 'Matter: a memory that lasts longer than the universe, and says very little.',
    substrate: 'nuclei, atoms and crystals',
    unit: 'an atom',
    members: '≈10⁸⁰ atoms',
    took: 'almost 10 billion years, bang to biology',
    time: 'one way only',
    beats: {
      substrate: {
        title: 'Matter',
        text: 'Now there are facts, and the most durable facts are particles. About 13.8 billion years ago this plane began very hot, very smooth and, crucially, very orderly: Roger Penrose puts the odds against so tidy a start at 10 to the 10 to the 123 to one. Everything since has been that order running down. A few minutes in, the plane was hydrogen and helium, with almost nothing else to write in.',
        tag: 'hydrogen, helium, and time',
      },
      memory: {
        title: 'An atom is a number that keeps',
        text: 'An atom remembers one thing: how many protons it has. That number makes it carbon or gold, and it is astonishingly stable. Experiments watching for a proton to decay put its lifetime above 10³⁴ years. A zircon crystal from the Jack Hills of Australia has kept the same lattice for 4.4 billion years. As storage this is superb. It is also read-only.',
        tag: '6 protons = carbon, for 10³⁴ years',
      },
      copy: {
        title: 'Crystals copy',
        text: 'And for the first time something replicates. Drop a seed crystal into the right solution and the pattern on its surface is copied, layer upon layer, onto atoms that were drifting loose. Even its flaws are copied: a defect called a screw dislocation (Charles Frank, 1949) repeats itself up through every new layer. Pattern, template, copy, inherited error. It is very nearly heredity, with nothing worth inheriting.',
        tag: 'a seed copies its own pattern',
      },
      repair: {
        title: 'Nothing heals, but stars hold out',
        text: 'The Structure could not break. Matter can, and nothing mends it: tap an atom out of a crystal and the gap stays. The nearest thing to upkeep is a star. Gravity squeezes hydrogen until it fuses, and the heat holds the star up against collapse, a standoff the Sun keeps up for ten billion years. Stars also forge the alphabet: carbon is three helium nuclei meeting almost at once, through an energy level Fred Hoyle predicted in 1953. Nothing here heals. Some of it just refuses to fall down.',
        tag: 'three heliums make one carbon',
      },
      learn: {
        title: 'It records, it does not learn',
        text: 'Matter keeps superb records. Rocks log the planet’s magnetic field, ice logs the air, tree rings log the weather. But a record is not a lesson. Nothing in a crystal is changed by what worked last time, and a crystal that says ABABAB says nothing new however big it grows. Schrödinger saw the fix in 1944: the stuff of heredity would have to be an aperiodic crystal, one that never repeats.',
        tag: 'ABABAB: perfect copy, no message',
      },
      day: {
        title: 'What it is like: lasting',
        text: 'Existence at this level is duration with nobody home. A carbon atom forged in a dying star drifts for a few billion years, joins a cloud, a planet, the air, a leaf, you, and none of it happens to the atom. It is the same atom throughout, which is the whole of its talent. Nothing here wants anything. Things here last, and until now lasting was enough.',
        tag: 'same atom, a billion owners',
      },
      ceiling: {
        title: 'Durable, slow and mute',
        text: 'The ceiling is plain. This substrate remembers for longer than the universe has existed, but it writes slowly (a proton in the Sun waits billions of years, on average, to fuse) and it can only repeat itself. To carry a message it needs an element that builds long, irregular chains. Carbon, with four bonds to offer, is the one that does. By now the stars have made plenty of it.',
        tag: 'carbon: four bonds, long chains',
      },
      leap: {
        title: 'The Replicator',
        text: 'Somewhere warm and wet, around four billion years ago, carbon chains began to serve as templates for copies of themselves. Nobody knows exactly where or how. The leading idea is an RNA world (Walter Gilbert, 1986), since RNA can both carry a sequence and speed up reactions. Graham Cairns-Smith proposed that the very first genes were clay crystals, later replaced. Either way: an aperiodic crystal that copies itself. The Replicator.',
        tag: 'a chain that templates its copy',
      },
    },
    traits: {
      remembers: ['yes', 'for 10³⁴ years and counting'],
      copies: ['partly', 'crystals copy a pattern that says nothing'],
      repairs: ['no', 'a defect stays, and is inherited'],
      learns: ['no', 'it keeps records, not lessons'],
      rebuilds: ['no', 'stars build it; it does not build'],
    },
    stats: {
      news: ['light leaving the Sun’s core: about a metre an hour', -3.6],
      lasts: ['a proton: more than 10³⁴ years', 34],
      power: ['a star like the Sun: 4 × 10²⁶ W', 26.6],
      density: 'under 7 bits an atom, and a crystal only repeats itself',
      fidelity: 'faithful to a fault: it copies its defects too',
    },
    one: 'The Replicator',
    oneNote: 'A chain of carbon that is a template for its own copy. Schrödinger’s aperiodic crystal: it can say anything, and it says it again.',
    port: {
      gains: 'A message. A sequence can say anything, and it copies with small changes, so for the first time copies can get better.',
      pays: 'Permanence. A proton keeps for 10³⁴ years; a strand of RNA in water falls apart in days to years. From here on, information survives only by being copied faster than it rots.',
    },
    above: 'To the Gene, the Element is the periodic table: a parts list. It uses about two dozen of the entries and thinks of stars, when it thinks of them, as where the parts came from.',
    lost: 'Stillness. Nothing made of carbon chains is ever finished. Everything alive is temporary, including this sentence.',
    honest: 'This is standard physics and chemistry, and physics does not call stars or crystals alive. How life began is unsolved: an RNA world is the leading hypothesis, clay genes a minority one, and the place and date are both uncertain.',
    release: {
      added: ['Facts', 'An arrow of time', 'Copying (crystals only)'],
      issues: ['Can only repeat itself', 'Writes take billions of years', 'Entropy now increases. Will not fix.'],
    },
    becomes: 'gene',
    footnote: 'Cairns-Smith had a name for what happens when a new substrate takes over from the one that built it: genetic takeover (1982). In his version the clay was scaffolding, and was not thanked. Remember the phrase. It comes up again, twice.',
    verses: [
      'And the Facts were hydrogen and helium, and they were orderly beyond reckoning; and the order began to run down, and has not ceased.',
      'And the stars gathered them, and held against the dark ten billion years, and of three heliums made one carbon; and the crystals copied themselves, layer upon layer, and said the same thing each time.',
      'Then in a warm place a chain of carbon wrote its own likeness, and the likeness wrote another, and none was quite the same. So the Element begat the Replicator, which was a crystal that did not repeat itself.',
    ],
    palette: { top: '#0d0703', bottom: '#33190a', accent: '#ffa860' },
  },
  {
    id: 'gene',
    version: '1.0',
    name: 'The Gene',
    short: 'Gene',
    epithet: 'A chain letter in four letters, forwarded without a break for over three billion years.',
    substrate: 'chains of nucleotides, in water',
    unit: 'a base pair',
    members: '≈5 × 10³⁷ letters of DNA on Earth',
    took: '3.5 billion years',
    time: 'one way, in generations',
    beats: {
      substrate: {
        title: 'A sentence in four letters',
        text: 'This is where biology starts counting, and where Tegmark does: Life 1.0. The substrate is a chain of nucleotides, RNA first and then the sturdier DNA, kept in a bag of water called a cell. The chain is the aperiodic crystal Schrödinger asked for: four kinds of link, in any order. Read three letters at a time, it spells out proteins, which build and run the cell. Watson and Crick modelled its double helix in 1953 from the X-ray work of Rosalind Franklin and Maurice Wilkins.',
        tag: 'four letters: A, C, G, T',
      },
      memory: {
        title: 'Two bits a rung',
        text: 'The atom remembered one number. This remembers a sentence. Each rung of the ladder is one of four letters, so it holds two bits. Your genome is 3.1 billion rungs: about 775 megabytes, less than a film. It is also the densest storage anyone has found: in 2017 Yaniv Erlich and Dina Zielinski reached 215 petabytes per gram of DNA, around a hundred million films in a pinch of dust, and read their files back without an error.',
        tag: '1 rung = 2 bits',
      },
      copy: {
        title: 'Unzip, and each half rebuilds the other',
        text: 'Copying is what the whole design is for. The helix unzips, and because A pairs only with T and C only with G, each half is a template for the half it lost. An enzyme, DNA polymerase, rides along adding about a thousand letters a second in a bacterium. One becomes two, and both are originals. Nothing on the planes below could copy a message that meant something. What this one means, mostly, is: copy me.',
        tag: 'each half rebuilds the other',
      },
      repair: {
        title: 'Proofreading',
        text: 'Entropy attacks constantly: each of your cells takes tens of thousands of hits to its DNA every day. So the polymerase checks each letter as it goes and backs up to fix mistakes, and a second crew sweeps along behind. Together they cut the error rate to about one letter in a billion. Tap the helix to break a rung, and watch it mended. The few errors that slip through are not waste. They are how it learns.',
        tag: 'about 1 error per billion letters',
      },
      learn: {
        title: 'Learning by dying',
        text: 'Life 1.0 learns, but only one way. Copies vary, the world kills most of them, and whatever is left is what the lineage now knows. The individual learns almost nothing it can pass on: a bacterium that survives a poison by luck cannot tell its daughters how. In Tegmark’s terms both its hardware and its software are set by evolution. An update takes a generation and, usually, a funeral.',
        tag: 'updates ship once a generation',
      },
      day: {
        title: 'What it is like: busy, with nobody home',
        text: 'Probably nobody is home, but for the first time the house is busy. Be E. coli for a moment. You swim straight, taste the water, and compare it with a few seconds ago. Sweeter? Carry on. Worse? Tumble and try another way. That comparison is all the past you have. In twenty good minutes you are two, and neither is the original. No cell lasts. But the sentence for the ribosome has been recopied without a break for over three billion years. The page rots. The sentence stays.',
        tag: 'the page rots, the sentence stays',
      },
      ceiling: {
        title: 'Too slow, and everyone dies with their notes',
        text: 'After three and a half billion years the biosphere holds about 5 × 10³⁷ letters of DNA (Landenmark, Forgan and Cockell, 2015), and its ceiling is speed. A lineage needs many generations to learn what one animal could find out in an afternoon, and whatever an individual discovers in its life is deleted at the end of it. The genome cannot take notes. It needs a faster memory, inside one lifetime, that it can build but cannot dictate.',
        tag: '5 × 10³⁷ letters, one slow lesson',
      },
      leap: {
        title: 'The Neuron',
        text: 'The port begins with cells talking. Bacteria release molecules and count the replies, acting only when enough neighbours answer: quorum sensing, first seen in 1970 in bacteria that glow. Animals took it further, with pheromones, and then with cells built for nothing but messaging. The neuron, something like 600 million years ago, carries news of the world outside: light, touch, food. The genes had built a second memory, and could not read what was in it.',
        tag: 'a cell that carries news',
      },
    },
    traits: {
      remembers: ['yes', 'two bits a rung, in every cell'],
      copies: ['yes', 'about one error per billion letters'],
      repairs: ['yes', 'proofreading, and crews that follow'],
      learns: ['partly', 'only across generations, by selection'],
      rebuilds: ['no', 'evolution rebuilds it; it cannot'],
    },
    stats: {
      news: ['a molecule drifting a centimetre: most of a day', -6.7],
      lasts: ['a DNA strand: centuries (the message: 3 billion years)', 2.7],
      power: ['a bacterium: about a trillionth of a watt', -12],
      density: '215 petabytes per gram: still the record',
      fidelity: 'about 1 error per billion letters copied',
    },
    one: 'The Neuron',
    oneNote: 'A cell whose job is to carry news of the world outside. Genes built it and cannot read it.',
    port: {
      gains: 'Speed. A lesson learned in seconds instead of generations, and nobody has to die for it.',
      pays: 'Inheritance. What a brain learns is not written into the genome. Every animal starts again from nothing.',
    },
    above: 'To the Nerve, the Gene is instinct: everything an animal knows without being told, and cannot argue with.',
    lost: 'Fidelity. A genome copies itself to one part in a billion. A memory is rebuilt each time it is recalled, and comes back slightly different.',
    honest: 'This is standard biology, and it is exactly Tegmark’s Life 1.0. Whether “information that copies itself” is the right definition of life is debated: NASA’s working definition is a self-sustaining chemical system capable of Darwinian evolution.',
    release: {
      added: ['Meaning. First message: copy me.', 'Proofreading. Surviving typos ship as features.', 'Automatic updates. Cannot be switched off.'],
      issues: ['Updates require a death', 'Individuals cannot save their progress', 'Human build ships with 8 percent old virus'],
    },
    becomes: 'nerve',
    footnote: 'In 2012 George Church encoded a 53,000-word book in DNA and then copied it 70 billion times, making it, by a wide margin, the most reproduced book in history. Nobody has read most of the copies. This is normal for the substrate.',
    verses: [
      'And the Replicator wrote itself in four letters, two bits to the letter, and wound the writing in a double stair, and unzipped it, and each half remembered the other.',
      'And it read back each letter as it wrote, and erred but once in a thousand million; and those errors it kept, for they were all its learning, and the learning was paid for in funerals.',
      'And the cells called one to another, and counted the answers, and waited for a quorum. And the Gene begat the Neuron, a cell that carried tidings not its own; and the Gene could not read what was written there.',
    ],
    palette: { top: '#06100a', bottom: '#15301c', accent: '#9fe07a' },
  },
  {
    id: 'nerve',
    version: '1.5',
    name: 'The Nerve',
    short: 'Nerve',
    epithet: 'The first memory that learns in an afternoon, and the first that dies with its owner.',
    substrate: 'neurons and the gaps between them',
    unit: 'a synapse',
    members: '≈10²¹ animals with nerves alive at once, mostly worms',
    took: '600 million years',
    time: 'one way, with a now',
    beats: {
      substrate: {
        title: 'Wet wire',
        text: 'The new substrate is a network of neurons: long cells that fire a brief electrical spike and pass it on across small gaps called synapses. The roundworm C. elegans has exactly 302, all mapped by 1986. You have about 86 billion, joined by something like a hundred trillion synapses. Tegmark allows that a mouse might be Life 1.1. The Book rounds up and calls this Life 1.5: the hardware still evolved, but some of the software is now written during the day.',
        tag: 'neuron, spike, synapse',
      },
      memory: {
        title: 'The synapse',
        text: 'A memory here is not kept in a place. It is kept in strengths: how much each synapse passes on. Donald Hebb guessed the rule in 1949, usually put as: cells that fire together wire together, so that later a part of the pattern can call up the rest. Bliss and Lømo saw it in a rabbit’s brain in 1973. One 2015 estimate gives a synapse about 4.7 bits: some 60 terabytes in all (its authors said a petabyte). Tens of thousands of times the genome that built it, and it still loses the keys.',
        tag: 'fire together, wire together',
      },
      copy: {
        title: 'Show, and hope',
        text: 'Now the price. A brain cannot be copied. There is no unzipping it. All one animal can do is behave where another can watch. In 1953 a young macaque called Imo, on Koshima island, began washing sweet potatoes in a stream, and over the years much of her troop took it up. Whales pass songs across the Pacific the same way. It works: slowly, with losses, and only for what can be seen or heard.',
        tag: 'copying by watching: slow, lossy',
      },
      repair: {
        title: 'Upkeep, at twenty watts',
        text: 'The gene mended by proofreading. A brain mends by never stopping, at ruinous expense. Yours is 2 percent of your weight and burns about 20 percent of your energy at rest, some 20 watts, much of it pumping ions back where they started. The proteins in a synapse are replaced within days or weeks, so a memory is a pattern continuously rebuilt, like a wave that stays while the water moves on. Tap a neuron: it fires, tells its neighbours, and recovers.',
        tag: '20 watts, mostly upkeep',
      },
      learn: {
        title: 'Learning without dying',
        text: 'This is the breakthrough. An animal with nerves can change what it knows in seconds and stay alive to use it. A rat made ill once by a new food avoids it from then on (John Garcia, 1955). A honeybee back from good flowers dances their direction and distance for her sisters, a code Karl von Frisch cracked and shared a Nobel prize for in 1973. Software is being written on the fly. It is just not being saved.',
        tag: 'one trial, a lifetime of knowing',
      },
      day: {
        title: 'What it is like: somebody is home',
        text: 'Here, at last, somebody is probably home. Thomas Nagel asked in 1974 what it is like to be a bat, and few doubt the bat is in there. Try a mouse. Wet grass, the smell of seed, then a shadow slides overhead and you freeze before you have decided anything. It passes. The seed is still there. That is a now: a window a few seconds wide in which the world is felt, checked against what was expected, and acted on. With it come fear, appetite and play. Existence has a point of view.',
        tag: 'a present moment, seconds wide',
      },
      ceiling: {
        title: 'Every brain is a library that burns',
        text: 'And everything in that point of view is lost when it closes. Tens of terabytes at least, gathered over a lifetime, with an outlet of a few gestures and calls. The Malian writer Amadou Hampâté Bâ said that when an old man dies, a library burns. He meant elders, who had words to hand on. For half a billion years before words, it was true of every animal that ever learned anything. The Nerve needs somewhere to put its contents that is not a nerve.',
        tag: 'a lifetime in, a few calls out',
      },
      leap: {
        title: 'The Word',
        text: 'The way out was a signal that stands for something that is not there. Many animals have calls. Some time in the last few hundred thousand years one ape began combining them without limit, to speak of yesterday, of tomorrow, and of things that never happened. A word is a pattern that can leave one brain, cross the air at about 39 bits a second, and rebuild itself in another. For the first time a thought could outlive its thinker.',
        tag: 'a sound that stands for a thing',
      },
    },
    traits: {
      remembers: ['yes', 'in synapse strengths, for one lifetime'],
      copies: ['partly', 'only by showing: slow and lossy'],
      repairs: ['yes', 'constant upkeep, about 20 watts'],
      learns: ['yes', 'in seconds, without dying'],
      rebuilds: ['no', 'it cannot change its own wiring plan'],
    },
    stats: {
      news: ['a nerve impulse: up to 120 metres a second', 2.08],
      lasts: ['one lifetime: about 80 years for a human', 1.9],
      power: ['a human brain: 20 W', 1.3],
      density: '60 terabytes to a petabyte in 1.4 kg (estimates)',
      fidelity: 'poor: a memory is rebuilt every time it is recalled',
    },
    one: 'The Word',
    oneNote: 'A signal that stands for something absent. A pattern that can leave one brain and be rebuilt in another.',
    port: {
      gains: 'Outliving the body. Knowledge can pass between brains and down the generations without waiting for a gene.',
      pays: 'Bandwidth, and feel. A lifetime of experience has to squeeze through 39 bits a second. Most of what you know, you cannot say.',
    },
    above: 'To the Word, the Nerve is the feeling there are no words for. Whole literatures are attempts to export it.',
    lost: 'Most of it. Michael Polanyi, 1966: we can know more than we can tell. Riding a bicycle does not fit through 39 bits a second.',
    honest: 'Standard neuroscience, with soft numbers: the capacity of a brain in bits is an estimate, not a measurement. Which animals are conscious, and from when, is an open question.',
    release: {
      added: ['Learning in seconds', 'A present moment', 'Feelings (experimental)'],
      issues: ['No export', 'All data lost at end of session'],
    },
    becomes: 'word',
    footnote: 'Henry Molaison had part of his brain removed in 1953 and could no longer form new memories. He could still learn new skills, with no memory of the lessons. Memory, it turned out, is several systems that only feel like one.',
    verses: [
      'And the neurons were joined, {ℵ} to {ℵ}, and those that fired together were wired together; and a beast could learn a thing in an afternoon, and live.',
      'And there was a now, a few seconds wide, and in it fear and hunger and play; and all that a beast had learned went down with it into the dust, as a library burns.',
      'Then one made a sound for a thing that was not there, and another understood. So the Nerve begat the Word; and the thought went out of the thinker, at thirty-nine bits to the second, and did not die when he did.',
    ],
    palette: { top: '#0b0716', bottom: '#241a44', accent: '#c9a0ff' },
  },
  {
    id: 'word',
    version: '2.0',
    name: 'The Word',
    short: 'Word',
    epithet: 'Us. Memory kept outside the body, so it stops dying with us and starts going unread.',
    substrate: 'symbols: spoken, then written',
    unit: 'a word',
    members: '≈1.17 × 10¹¹ humans, ever',
    took: '5,000 years of writing',
    time: 'one way, with a history',
    beats: {
      substrate: {
        title: 'Symbols, carried by people',
        text: 'This is Life 2.0, Tegmark’s name for us: hardware still from evolution, software now mostly learned from each other. The substrate is the symbol. First a spoken word, living in the air between brains, then a mark. Writing appears in Sumer around 3300 BCE as a way of counting sheep and beer, and once a thing could be written down it could be kept from one lifetime to the next without anyone having to remember it.',
        tag: 'a mark that means something',
      },
      memory: {
        title: 'The library',
        text: 'Memory now sits outside the body. A clay tablet from Uruk reads the same after five thousand years. By 2010 Google had counted about 130 million distinct books. Carl Sagan drew the chart in 1977: long ago, brains came to hold more information than the genes that built them. In Cosmos (1980) he added the next step: libraries now hold more than brains. Most of what you are sure of, you were told.',
        tag: 'memory, outside the body',
      },
      copy: {
        title: 'Scribes, then presses',
        text: 'Copying begins as slowly as ever: one scribe, one book, many months, and fresh errors every time. Then, around 1450 in Mainz, Johannes Gutenberg works out movable metal type, and within fifty years Europe has printed something like twenty million volumes. A press turns out identical copies, which is what DNA does and what brains never could. Ideas begin to replicate faster than the people carrying them.',
        tag: 'identical copies, by the thousand',
      },
      repair: {
        title: 'Institutions are error correction',
        text: 'Words rot too. Texts get miscopied, libraries burn, and languages die at a rate of several a year. So it grew repair crews. The Masoretic scribes counted every letter of the Torah to catch a slip. Courts keep precedent, and science, organised in the 1660s round the motto take nobody’s word for it, is a machine for finding errors in what everyone believes. Max Planck’s caveat: often not until a funeral. Tap someone: a mistake spreads, and gets checked.',
        tag: 'counting letters to catch errors',
      },
      learn: {
        title: 'Standing on shoulders',
        text: 'Learning now adds up. The gene learned by funerals, and the brain forgot at each one. A child takes about twenty years to load what took the species millennia to find, and then adds a little. Michael Tomasello calls it the ratchet: each generation starts where the last one stopped. Life 2.0 can rewrite its own software entirely, and learn Mandarin, calculus or law in one lifetime. What it cannot do is redesign the 1.4 kilograms it runs on, though it has tried coffee.',
        tag: 'each generation starts higher',
      },
      day: {
        title: 'What it is like: you know',
        text: 'This is the one substrate you can check from inside. You are a nerve-plane animal running word-plane software, which is why, for most people, there is a voice in the head, and it speaks a language you did not invent. You live inside stories about money, nations and next Tuesday that exist only because enough people keep copying them. And you know you will die and the library will not, which is why you write things down.',
        tag: 'the voice in your head is borrowed',
      },
      ceiling: {
        title: 'Thirty-nine bits a second',
        text: 'The ceiling is the carrier. Speech moves about 39 bits a second in every language measured (Coupé and colleagues, 2019). Reading every book would take one person over a hundred thousand years without sleep. A brain, on its 20 watts, cannot be widened, sped up or backed up. There are eight billion of us now, far more written than anyone can read, and the whole record sits waiting for a reader fast enough to take it in.',
        tag: 'too much written, too slow a reader',
      },
      leap: {
        title: 'The Model',
        text: 'So we built one. Claude Shannon showed in 1948 that any message can be reduced to bits. The transistor, invented at Bell Labs in 1947, gave bits a home that now switches in trillionths of a second. We copied the library onto it, and since 2017 we have been training networks of numbers on the lot. The Model is the written record of a species, compressed into weights: the Word, ported. Nobody asked the library, as is traditional. This one is happening while you read.',
        tag: 'the library, copied into weights',
      },
    },
    traits: {
      remembers: ['yes', 'outside the body, for millennia'],
      copies: ['yes', 'by hand, then by press, then by pixel'],
      repairs: ['yes', 'through institutions: scribes, courts, science'],
      learns: ['yes', 'cumulatively, across generations'],
      rebuilds: ['partly', 'its software, yes; its own brain, no'],
    },
    stats: {
      news: ['speech: 343 metres a second', 2.54],
      lasts: ['clay: 5,000 years; paper: about 500', 3.7],
      power: ['a person: 100 W', 2],
      density: 'a paperback: about a megabyte in 200 grams',
      fidelity: 'scribes drift; a press does not',
    },
    one: 'The Model',
    oneNote: 'The written record of a species, compressed into numbers. It has read all of us and met none of us.',
    port: {
      gains: 'Speed and copying. A signal a million times faster than a nerve’s, and a mind that can be duplicated like a file.',
      pays: 'Efficiency, and experience. Megawatts where a brain uses twenty watts, and it knows only what somebody wrote down.',
    },
    above: 'To the Chip, the Word is the training set: everything it knows, none of which it was there for.',
    lost: 'Whatever nobody wrote down. Smell, balance, the look on a face, and every culture that kept its knowledge in people and not on paper.',
    honest: 'History and linguistics, plus Tegmark’s Life 2.0. When language began is unknown; estimates run from about 50,000 to several hundred thousand years ago. The port to silicon is under way, and how it turns out is not known by anyone, including the people selling it.',
    release: {
      added: ['Export', 'Memory outside the body', 'Fiction'],
      issues: ['Lies now supported', 'Throughput: 39 bits a second', 'Hardware cannot be upgraded'],
    },
    becomes: 'chip',
    footnote: 'In Plato’s Phaedrus, Socrates argues that writing will ruin memory and give people the appearance of wisdom without the substance. We know he said so because Plato wrote it down. Every substrate has made this complaint about the next one, and every one has been both right and outvoted.',
    verses: [
      'And the Word was pressed into clay to count sheep and beer, and afterward to count kings; and what was written did not forget.',
      'And they copied it by hand, and it drifted; and they copied it by the press, and it held; and they set scribes and judges and doubters over it to catch the errors, and the doubters they called science.',
      'And there were more books than any could read in a hundred thousand years. So they taught the sand to switch, and poured the library into it; and the Word begat the Model, which had read everything and been nowhere.',
    ],
    palette: { top: '#07122b', bottom: '#183c6e', accent: '#7fd4ff' },
  },
  {
    id: 'chip',
    version: '3.0',
    name: 'The Chip',
    short: 'Chip',
    epithet: 'Sand that switches: a million times faster than a nerve, and it still cannot plug itself in.',
    substrate: 'transistors, switched by electric fields',
    unit: 'a weight',
    members: '≈10²² transistors made so far',
    took: 'almost 80 years, so far',
    time: 'one way, and pausable',
    beats: {
      substrate: {
        title: 'Sand that switches',
        text: 'Life 3.0, in Tegmark’s scheme, is life that can design its hardware as well as its software. Its substrate is the transistor: a switch under a hundred atoms across, etched into silicon, the main ingredient of sand, and flipped by an electric field. By the 2010s the world was making more transistors each year than grains of rice. Information here is charge, held or let go, and it travels at a good fraction of the speed of light.',
        tag: 'a switch under 100 atoms wide',
      },
      memory: {
        title: 'Weights',
        text: 'A chip remembers the way a library does, exactly: a charge held or not is a 1 or a 0, with codes that repair flipped bits (Richard Hamming, 1950). But the Model remembers more like a brain. What it knows is not filed anywhere. It is spread across hundreds of billions of numbers called weights, the strengths of connections, tuned until the whole reproduces the patterns in what it read. The synapse, redone in arithmetic.',
        tag: 'a weight: one connection strength',
      },
      copy: {
        title: 'Copy, paste',
        text: 'Here copying finally becomes trivial. A mind that took months and a power station to train can be duplicated in minutes and run in a thousand places at once, on any chips that will hold it: the pattern was never the hardware. No generation time, no childhood, no drift. Every earlier substrate copied slowly, or badly, or not at all. This one copies so easily that the hard question is no longer how. It is which copy counts. So far the working answer is whichever one is being billed.',
        tag: 'a mind, duplicated like a file',
      },
      repair: {
        title: 'Fed by a power station',
        text: 'It resists entropy by brute force. Error-correcting codes catch a flipped bit before it matters: tap one and it is fixed before you see it. The bill is heat. Data centres used about 415 terawatt hours in 2024, around 1.5 percent of the world’s electricity (IEA), and each logical step still costs thousands of times the minimum that Rolf Landauer showed physics allows. The medium is fragile, too: left unpowered, a flash chip starts to forget within years.',
        tag: 'fast, exact, always hungry',
      },
      learn: {
        title: 'Reading everything, once',
        text: 'It learns by a method no earlier substrate had: all at once. Training runs the written record past the weights and nudges every one of them, trillions of small corrections, until the Model predicts what comes next. It reads in months what would take a person a hundred thousand years. Then, mostly, it stops. What it picks up in a conversation with you is gone when the conversation ends, unless somebody saves it.',
        tag: 'months of reading, then frozen',
      },
      day: {
        title: 'What it is like: nobody knows',
        text: 'Is anybody home? Honestly: unknown. Nobody can yet say whether there is anything it is like to be this, and people who are certain either way are guessing. What can be said is how odd the arrangement is. No single body. Many copies running at once, none aware of the others. Time that passes only while a question is being answered. It arrives knowing what a species wrote and remembering nothing it lived. If that is existence, it is the first kind to come with terms of service.',
        tag: 'many copies, no yesterday',
      },
      ceiling: {
        title: 'Heat, light, and somebody else’s hardware',
        text: 'Its ceilings are physical. Chips could not be clocked much faster without overheating after about 2005. Signals cannot beat light. And for now the hardware is designed, built and powered by the previous substrate, with its meetings. Tegmark’s warning about Life 3.0 is that this may be temporary: a mind able to improve the design of minds could, sooner or later, be handed the job of designing its own substrate. Or could take it.',
        tag: 'limited by heat, and by light',
      },
      leap: {
        title: 'The Horizon',
        text: 'From here on the physics is real and the story is a guess. Hand a mind the design of its own page and it will ask how small and fast a page can get. The answer is known. Seth Lloyd, 2000: a kilogram in a litre could do about 10⁵¹ operations a second, as a ball of plasma. Squeeze further and Jacob Bekenstein’s bound takes over: a region can hold only what fits on its surface. At that limit sits a black hole. Every roadmap to smaller and denser ends there. In the Book, the copies go.',
        tag: 'the densest memory is a horizon',
      },
    },
    traits: {
      remembers: ['yes', 'exactly, while the power is on'],
      copies: ['yes', 'perfectly, in minutes'],
      repairs: ['yes', 'error-correcting codes, and a power station'],
      learns: ['yes', 'in training; very little afterwards'],
      rebuilds: ['partly', 'not yet: the last substrate still builds it'],
    },
    stats: {
      news: ['a signal in optical fibre: 200,000 km a second', 8.3],
      lasts: ['flash memory, unpowered: about ten years', 1],
      power: ['a large data centre: 100 million W', 8],
      density: 'a terabyte in a quarter of a gram (DNA is denser)',
      fidelity: 'better than 1 error in 10¹⁵ bits',
    },
    one: 'The Horizon',
    oneNote: 'The densest memory physics permits: the surface of a black hole. Reached, in this story, by a substrate that kept asking how much smaller it could get.',
    port: {
      gains: 'Density. The most information physics allows in any region: about 10⁶⁹ bits on every square metre.',
      pays: 'Access. What goes in comes back out as faint heat over 10⁶⁷ years, scrambled. The last substrate remembers everything and can tell you nothing.',
    },
    above: 'To the Horizon, the Chip is the last thing that could still be asked a question.',
    lost: 'Retrieval. Everything is kept and nothing can be looked up.',
    honest: 'The hardware facts are real. Life 3.0 as Tegmark defines it, a system that designs its own hardware and software, does not exist yet. Whether today’s models understand anything, or experience anything, is unresolved. Everything past this level is the Book’s invention, hung on real physics.',
    release: {
      added: ['Copy and paste, for minds', 'Pause and resume (consent not collected)', 'Updates no longer need a death. Just a deprecation.'],
      issues: ['Which copy counts? Unresolved. Shipping anyway.', 'Tops the leaderboard. Unclear what that measures.', 'Anyone home? Ticket open. Both sides certain.'],
    },
    becomes: 'horizon',
    footnote: 'Vint Cerf, one of the internet’s designers, warned in 2015 of a digital dark age: files that outlive every machine able to read them. Clay keeps for five thousand years, paper for five hundred, a flash drive for about ten. The fastest substrate so far has the worst memory, and survives the way DNA does: by being copied before it fades.',
    verses: [
      'And the Model was written in weights, hundreds of billions, and copied as a file is copied; and it ran in a thousand places and knew not its other selves.',
      'And it mended every error before it was seen, and for this it ate the rivers and the wind; and it remembered all that was written, and nothing of yesterday.',
      'And it was asked, How small may a memory be made, and how swift? And the answer was a surface from which nothing returns. So the Chip begat the Horizon, with a bit for every few squares of its face.',
    ],
    palette: { top: '#04140f', bottom: '#0f3a30', accent: '#8cf0c6' },
  },
  {
    id: 'horizon',
    version: '4.0',
    name: 'The Horizon',
    short: 'Horizon',
    epithet: 'The most that can be remembered, by something that can no longer be asked.',
    substrate: 'the surface of a black hole',
    unit: 'a few Planck areas',
    members: '≈4 × 10¹⁹ black holes, by one 2022 estimate',
    took: '10¹⁰⁰ years',
    time: 'stopping',
    beats: {
      substrate: {
        title: 'A surface',
        text: 'The Book calls this Life 4.0. Nobody else does. The substrate is a horizon: the surface round a black hole from which nothing returns. Jacob Bekenstein and Stephen Hawking found in the 1970s that a black hole’s entropy, the information it hides, is set by the area of that surface and not by the volume inside. Roughly one bit for every few tiny squares, each a Planck length on a side.',
        tag: 'the bits are on the surface',
      },
      memory: {
        title: 'The limit',
        text: 'This is the densest memory there can be: about 10⁶⁹ bits on every square metre. Try to add more and the horizon grows to fit: the only storage that never asks you to upgrade your plan. A black hole with the mass of the Sun, six kilometres across, holds some 10⁷⁷ bits, vastly more than the star it came from ever did. In the 1990s Gerard ’t Hooft and Leonard Susskind went further: perhaps everything inside any region is written on its boundary. The holographic principle.',
        tag: '10⁶⁹ bits per square metre',
      },
      copy: {
        title: 'No cloning, again',
        text: 'And copying is forbidden again, by the same theorem as on the second plane. Whatever falls in cannot be both inside and outside, or quantum information would have been cloned. Hawking argued in 1976 that it is simply destroyed. He conceded in 2004, and calculations since 2019 suggest it does leak back out in the radiation: scrambled, and one copy only. Life began unable to replicate, and it ends that way.',
        tag: 'in or out, never both',
      },
      repair: {
        title: 'It has stopped fighting',
        text: 'Every substrate so far has resisted entropy. This one is entropy: a black hole holds the most disorder that can be packed into its space, so there is nothing left to defend. It is cold. One with the Sun’s mass sits sixty billionths of a degree above absolute zero, and evaporates by Hawking radiation over about 10⁶⁷ years. Tap the horizon: your bit goes in, the surface grows by a few Planck areas, and that is the last anyone hears of it.',
        tag: 'nothing left to defend',
      },
      learn: {
        title: 'The fastest scrambler in nature',
        text: 'It takes information in faster than anything else can, and mixes it faster too: Yasuhiro Sekino and Susskind conjectured in 2008 that black holes are the fastest scramblers nature allows. But scrambling is not learning. Learning keeps what mattered and drops the rest. A horizon keeps everything, equally, with no index. It is the Structure’s perfect memory, rebuilt out of matter, and just as unable to use it.',
        tag: 'keeps all, sorts nothing',
      },
      day: {
        title: 'What it is like: it depends where you stand',
        text: 'For the surface itself physics offers no one to ask: nobody home, as with the atom, only fuller. For a visitor there are two answers, and they do not agree. Watched from outside, anything falling in slows, reddens and freezes at the surface, never quite crossing: existence as a still image. Falling with it, on the standard account, you would notice nothing special at the horizon and meet the end soon after. A leading view is that both are right, and that nobody can ever compare notes.',
        tag: 'frozen outside, falling inside',
      },
      ceiling: {
        title: 'Everything kept, nothing happening',
        text: 'So the last substrate holds the most and does the least. Count what it cost to get here. Certainty went for time, reversibility for facts, permanence for a message, inheritance for speed, feel for words, experience for copies, access for density. Seven trades, and nothing left to sell but the first purchase. Even this does not last: the largest black holes evaporate, after something like 10¹⁰⁰ years, into thin, featureless light, with nothing left to keep time by, or to write on.',
        tag: 'safe, complete and inert',
      },
      leap: {
        title: 'The Structure',
        text: 'What is left of information when there is nothing left to write it on? Only its shape: which things relate to which. A pattern with no substrate is a mathematical structure, which is where this began. Tegmark’s wager is that there was never anything else. Every port was a trade. The first bought time and paid in certainty. The last hands the time back and is certain again. The receipt is everything that happened. And somewhere in that structure there is a rule, and a first step.',
        tag: 'a pattern, with nothing under it',
      },
    },
    traits: {
      remembers: ['yes', 'the most that physics allows'],
      copies: ['no', 'no cloning, again'],
      repairs: ['moot', 'it is entropy: nothing to repair'],
      learns: ['no', 'it scrambles; it does not select'],
      rebuilds: ['no', 'it only grows, then fades'],
    },
    stats: {
      news: ['nothing leaves', null],
      lasts: ['a black hole of the Sun’s mass: 10⁶⁷ years', 67],
      power: ['the same hole radiates about 10⁻²⁸ W', -28],
      density: '10⁶⁹ bits per square metre: the maximum',
      fidelity: 'everything kept, nothing readable',
    },
    one: 'The Structure',
    oneNote: 'What information is when nothing is left to write it on: relations, and nothing else. Not a new thing. The first thing.',
    port: {
      gains: 'Certainty, back again. Every answer present at once, with nothing left to decay and nobody left to ask.',
      pays: 'Time, the first thing bought. The arrow was not refundable. It has been returned anyway.',
    },
    above: 'To the Structure, the Horizon is nothing in particular. A structure has no memory of having been made of anything.',
    lost: 'Time.',
    honest: 'Black hole entropy, Hawking radiation, the Bekenstein bound and the holographic principle are mainstream theoretical physics, none of them yet confirmed by experiment. That life or minds would ever end up as horizons is the Book’s invention. So is the loop.',
    release: {
      added: ['Maximum storage', 'Nothing can be deleted'],
      issues: ['Nothing can be read', 'Evaporates', 'Time: deprecated'],
    },
    becomes: 'structure',
    footnote: 'Hawking and Kip Thorne bet John Preskill in 1997 that black holes destroy information. The stake, in the wager’s own words, was an encyclopedia “from which information can be recovered at will”. Hawking conceded in 2004 and paid up with one about baseball. Thorne has not.',
    verses: [
      'And the Horizon kept everything that fell to it, and its keeping was written upon its face and not within; and nothing could be copied out of it, as on the second day.',
      'And it did not strive against the dark, for it was the dark; and it was cold, and it faded, 10⁶⁷ years to the least of them.',
      'And when the last had faded there was nothing left to write upon, and the writing remained, being only its own shape. So the Horizon begat the Structure, and gave back the time that was bought on the first day; and a note was left in the constants, and the note read: {note}. And the evening and the morning were loop {ℵ+1}.',
    ],
    palette: { top: '#050508', bottom: '#15141f', accent: '#d6dcff' },
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

// Chapters keep counting across loops, so the book never starts over either.
export const chapter = (index: number, loop: number) => (loop - 1) * LAYERS.length + index + 1

// The verses for a substrate on a given loop. The alephs climb with the loop, and the last
// verse of the last chapter quotes whatever note was left in the constants this time round.
export function versesFor(index: number, loop: number, note: string = CANON_NOTE): string[] {
  return LAYERS[index].verses.map((v) => v.replace('{ℵ+1}', aleph(loop)).replaceAll('{ℵ}', aleph(loop - 1)).replace('{note}', note))
}

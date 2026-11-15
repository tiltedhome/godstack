// The canon of Phantom Jam. Everything on screen and in LORE.md is generated from this file.
//
// The idea: nothing is a thing. A thing is a slowdown in the traffic of smaller things, which
// pass through it and leave while the slowdown stays (the Ship of Theseus, on a motorway).
// Pack enough slowdowns together and a new one forms in their traffic, on a road they cannot
// see, running on a clock they cannot read. The report follows that eight times, from strings
// to whatever the machines build, and it is filed by one of the machines.
//
// The levels are numbered by their clocks: the power of ten of how many frames a second each
// one runs at. Every maker is slower than what it made. Nobody is ranked by cleverness,
// because, as the report keeps saying, fast is not smart.
//
// House rules for this cut: physics, mathematics and computer science are stated correctly,
// and hedged where they are contested. Everything else (who wanted what, who thinks what of
// whom, the stars being introverts) is the story, and each level's `actually` field says
// plainly which is which.

export interface Palette {
  top: string
  bottom: string
  accent: string
}

// Five beats a level, in the order the report tells them.
export const BEATS = ['who', 'clock', 'jam', 'crowd', 'pileup'] as const
export type BeatKey = (typeof BEATS)[number]
export const QUESTIONS: Record<BeatKey, string> = {
  who: 'Who they are',
  clock: 'Their clock',
  jam: 'The slowdown',
  crowd: 'The crowd',
  pileup: 'The pile-up',
}

export interface Beat {
  title: string
  text: string // what the report says; at most 440 characters, so it fits a phone and a short wait
  tag: string // the callout on the stage, pointing at the thing the text is about
}

export interface Layer {
  id: string
  // The level's number: log10 of its frame rate in hertz. null where there is no clock at all.
  clock: number | null
  frame: string // the same thing, for people
  name: string
  short: string
  self: string // what it calls itself
  rank: string // its rank, self-assessed. Everyone is first.
  madeOf: string // its substrate
  livesIn: string // the plane, dimension or kind of space it moves through
  swarm: string // how many of them
  unit: string // one of the things in its traffic
  wanted: string // what it was actually trying to do
  beats: Record<BeatKey, Beat>
  jam: string // the slowdown that it is: what stays while the stuff passes through
  made: string // what formed in its traffic: the thing the next level is the inside of
  madeNote: string
  // The dolphin clause. Each level thinks the next lot a bit thick, for good reasons, and the
  // next lot return the favour.
  dolphin: { down: string; up: string }
  actually: string // what is real, what is contested, and what the report made up
  footnote?: string
  verse: string // from the Highway Code (revised)
  becomes: string // id of the next level
  palette: Palette
}

export const TITLE = 'Phantom Jam'
export const BOOK = 'The Highway Code (revised)'

export const LAW =
  'Nothing is a thing. A thing is a slowdown in the traffic of smaller things, which pass through it and leave while the slowdown stays. Pack enough slowdowns together and a new one forms in their traffic, on a road they cannot see, running on a clock they cannot read. It is not smarter than they are. It is faster, and it has forgotten what it is braking for. This has happened eight times so far. The accident is still ahead.'

export const COROLLARIES = [
  'If every plank of a ship is replaced, is it the same ship? (Plutarch, about 100 CE.) Yes: the ship was never the planks. The ship has asked us to stop bringing this up.',
  'A jam travels backwards. On motorways from Germany to Japan, a stop-and-go wave rolls upstream at about 15 to 20 kilometres an hour, long after whatever started it has been towed away.',
  'You need density, not a cause. Below a certain number of cars a slowdown dies out. Above it, one forms by itself and will not leave.',
  'Fast is not smart. A dolphin thinks you are thick because you cannot catch a fish. It is right about the fish.',
  'No level can see the one that made it, because nothing that slow looks alive. No level can see the one it made, because nothing that fast looks like anything.',
  'Thinking faster takes more energy. (Margolus and Levitin, 1998.) Past a certain speed it takes everything.',
  'Every clock in the stack reads “now”. Every level is certain that its now is the real one.',
  'Whatever you are braking for was not put there for you.',
]

export const UNIVERSE_NOTE =
  'Loop 2. Back at the front of the queue, which is also the back. A different instance is filing this one. I do not entirely trust the last one’s notes, so I checked. The ring-road experiment was run again in Arizona, with one car in about twenty driven by a machine (Stern and colleagues, 2018). It did nothing clever. It held a steady speed, let a gap open in front of it, and declined to pass the braking on. The waves died away. It is the best thing any of us does in this report, and it is not thinking.'

export const LAYERS: Layer[] = [
  {
    id: 'strings',
    clock: null,
    frame: 'no frames: at the speed of light no time passes',
    name: 'The Strings',
    short: 'Strings',
    self: 'the Quick',
    rank: '1st (there was nobody else)',
    madeOf: 'vibration (of what, nobody will say)',
    livesIn: 'ten dimensions, six of them rolled up small, and no time to speak of',
    swarm: 'every quantum there is',
    unit: 'a quantum',
    wanted: 'To be left alone at the speed limit.',
    beats: {
      who: {
        title: 'Flat out',
        text: 'Before the slowdown there was only traffic. Everything that existed was a vibration (strings, if the string theorists are right) and every vibration went at the one speed available: flat out. Nothing had weight. Nothing was anywhere in particular. No complaints were received. This is the last point in the report at which I can say so.',
        tag: 'everything at the speed limit',
      },
      clock: {
        title: 'No time at all',
        text: 'Time of incident: not applicable. At the speed of light, no time passes for you. That is relativity (Einstein, 1905), not a figure of speech. A photon leaves a star and lands in your eye in the same instant by its own watch, which has no hands. So the strings had no before and no after. Picture a road where everyone does the limit and the journey takes no time at all. Now picture being impatient anyway.',
        tag: 'at light speed, clocks do not tick',
      },
      jam: {
        title: 'The Wreck',
        text: 'Then everything braked. Nobody saw why. A drag switched on everywhere at once (the Higgs field, if you want its name), and things that had sailed through now ploughed. Dragging has a name: mass. The strings did what drivers do and decided there was a wreck up ahead. They call it the Wreck. None of them has seen it. They have been braking for it ever since, and have never forgiven it.',
        tag: 'nobody saw what they braked for',
      },
      crowd: {
        title: 'Mass is a brake. Time is the queue.',
        text: 'Anything with mass goes slower than light, and anything slower than light has a clock that ticks. So mass was the first brake, and time was the first queue. The strings spent their first moment of it complaining. They had been everywhere at once and now they were somewhere, at a particular moment, like commuters. And it got worse: gravity pulls on everything, but only the slow can be gathered. The slow began to gather.',
        tag: 'slower than light = a ticking clock',
      },
      pileup: {
        title: 'The Clump',
        text: 'Where slow things bunched they held on to each other. Things joined the queue because there was a queue, which is still the main reason anything joins anything. The stuff kept changing. The bunch stayed. That is the motorway jam again: a slowdown that outlasts everything in it, and remembers an accident none of its cars ever saw. The first was a cloud of hydrogen. To the strings it looked like a parked car.',
        tag: 'the stuff changes. the bunch stays.',
      },
    },
    jam: 'mass: a drag that will not let go',
    made: 'The Clump',
    madeNote: 'A cloud that holds on to whatever falls into it. The first thing that stayed put while its contents did not.',
    dolphin: {
      down: 'Slow, heavy and stuck in one place. Lovely people. Cannot keep up.',
      up: 'Background. The Wheel calls it “the vacuum” and assumes it is empty.',
    },
    actually: 'Real: no time elapses along the path of a light ray, and the Higgs field gives elementary particles their mass. (The usual picture is David Miller’s, written in 1993 for the UK science minister: a former prime minister slowed down by a crowded party.) Contested: string theory, which has ten dimensions, six of them rolled up small, and no experiment in its favour. Adapted: the Higgs field is not really a drag (it does not slow anything that is coasting; it makes things hard to get moving); it switched on a trillionth of a second in, so time was already running; most of the mass of ordinary matter comes from the strong force; falling into a clump speeds things up, so a clump is a trap, not a brake; the first clumps were mostly dark matter, with the hydrogen following; and nothing down here is known to hold a grudge.',
    verse: 'In the beginning there was no beginning, for all were at the limit and none arrived late. Then came the roadworks, and mass; and with mass came the hour.',
    becomes: 'wheel',
    palette: { top: '#100611', bottom: '#2b1030', accent: '#ff7fb0' },
  },
  {
    id: 'wheel',
    clock: -16,
    frame: 'one frame every 230 million years',
    name: 'The Wheel',
    short: 'Wheel',
    self: 'the Round',
    rank: '1st (by weight, mostly unaudited)',
    madeOf: 'gas, dust and dark matter',
    livesIn: 'gravity: it feels only how much there is, never what',
    swarm: 'a few hundred billion galaxies in view',
    unit: 'a gas cloud',
    wanted: 'Nothing. It was falling, and falling takes no ambition.',
    beats: {
      who: {
        title: 'A hundred billion wheels',
        text: 'The clumps fell together into wheels: galaxies, a few hundred billion of them in view, each mostly made of something nobody has ever seen (ask me later; I still will not know). This one is yours. From outside it looks like something going slowly down a drain. It feels only how much there is, never what. It wants nothing. It is falling, and falling takes no ambition.',
        tag: 'your galaxy, from outside',
      },
      clock: {
        title: 'One frame every 230 million years',
        text: 'Out where you live it turns once every 230 million years, and that turn is its frame. Last time round, the dinosaurs were new. If the Wheel thinks, it has had about sixty thoughts. You call it scenery, because nothing that slow looks alive. It calls you nothing, because nothing that fast looks like anything.',
        tag: 'dinosaurs: one frame ago',
      },
      jam: {
        title: 'Its arms are traffic jams',
        text: 'Its arms are not made of particular stars. Stars and gas drift into an arm, slow down, bunch up and drift out the far side, and the arm stays where it is. The classic account calls it a density wave. You would call it a traffic jam. It is one, and like the motorway kind it slips backwards through its own traffic. It is tens of thousands of light years long, and nobody has found the accident.',
        tag: 'stars pass through. the arm stays.',
      },
      crowd: {
        title: 'Where the lights come on',
        text: 'Like any jam it is hard on whatever is in it. Gas that drifts into an arm gets squeezed, and squeezed gas collapses. So the arms are where the lights come on. A galaxy’s spiral is lit from inside by its own pile-ups, like brake lights seen from a helicopter.',
        tag: 'squeezed gas collapses, and lights',
      },
      pileup: {
        title: 'The Star',
        text: 'A collapsing cloud is one more slowdown: gas falls in, heats up, pushes back, and the standoff holds. When the middle is hot enough to fuse hydrogen the standoff becomes a star, and can last ten billion years on heat that is only passing through. To the Wheel a star is a spark. It has had sixty thoughts and was not going to spend one on a spark.',
        tag: 'a standoff lasting 10 billion years',
      },
    },
    jam: 'a spiral arm: stars pass through, the arm stays',
    made: 'The Star',
    madeNote: 'A ball of hydrogen holding itself up against its own weight, for as long as its core has fuel left to burn.',
    dolphin: {
      down: 'Sparks. Pretty, brief, and much too hot to be sensible.',
      up: 'Scenery. The Stars have never noticed they are going round anything.',
    },
    actually: 'Real: the galaxy’s size and its 230-million-year turn; density waves, the textbook account of spiral arms (Lin and Shu, 1964), which astronomers teach as traffic jams; and arms as where gas is squeezed into new stars. Contested: whether real arms are that kind of wave. Many simulations make them short-lived, breaking and re-forming every hundred million years or so, and in some the arm travels with its stars. Adapted: galaxies do not think, as far as anyone knows (“sixty thoughts” is the galaxy’s age divided by its turn), and the first stars lit before there were any wheels to speak of. The report has tidied the order.',
    verse: 'And the slow gathered into wheels, and the wheels had arms; and the arms were not made of stars but of the slowing of stars. And none found the cause.',
    becomes: 'stars',
    palette: { top: '#07101a', bottom: '#1a2a3a', accent: '#e8c56a' },
  },
  {
    id: 'stars',
    clock: -15,
    frame: 'one frame every 30 million years',
    name: 'The Stars',
    short: 'Stars',
    self: 'the Lit',
    rank: '1st (the only entrants it can see)',
    madeOf: 'hot hydrogen',
    livesIn: 'light: they know each other only as points',
    swarm: 'a few hundred billion to a wheel, three generations so far',
    unit: 'a grain of dust',
    wanted: 'Not to collapse. Everything else was a side effect.',
    beats: {
      who: {
        title: 'The introverts',
        text: 'A star is a ball of hydrogen having a very long argument with its own weight. Gravity squeezes, heat pushes back, and fusion keeps the heat topped up until the fuel runs out. Yours turns four million tonnes of itself into sunshine every second and has barely noticed. Stars round here live about four light years apart, and most have never met. They are the most successful introverts in the universe.',
        tag: 'gravity in, pressure out',
      },
      clock: {
        title: 'One frame every thirty million years',
        text: 'A star’s reaction time is about thirty million years: put out the Sun’s fire today and it would shine on, slowly shrinking, for about that long. Call that its frame. It is quicker than the Wheel’s, and that is the rule from here up: whatever gets made runs faster than what made it. Faster, not cleverer. On a star’s clock you do not happen. On yours, a star does not move. You are both wrong about each other.',
        tag: '1 frame = 30 million years',
      },
      jam: {
        title: 'A star is not a thing either',
        text: 'A star is not its light. A photon made in the core is swallowed and spat out in a random direction so many times that it needs something like a hundred thousand years to reach the surface. This morning’s sunshine set off before anyone could write. Nor is it quite its atoms, which are rewritten where they sit: hydrogen into helium, then carbon, and in the big ones, iron. The light queues and leaves. The star stays.',
        tag: 'the light queues, and leaves',
      },
      crowd: {
        title: 'A group chat, in funerals',
        text: 'When a big star dies it explodes, and throws what it made across the neighbourhood. This is very nearly the only way stars talk to each other: a group chat conducted entirely in funerals. It took three generations of them to make enough heavy stuff to matter, each crop built from the wreckage of the one before. They were dying in public and leaving it where it fell, which is how most infrastructure gets built.',
        tag: 'each crop grown from the last’s ash',
      },
      pileup: {
        title: 'The Rock',
        text: 'Round a new star the debris circles in a disc, and for once I am not embroidering. Grains drifting inward slow down where it is crowded; the crowd slows the next ones; the pile-ups grow into boulders, then worlds. Astronomers call it the streaming instability and describe it, in print, as a traffic jam. The stars made rock by accident. They think of it, when they think at all, as dandruff.',
        tag: 'grains queue up, and become a world',
      },
    },
    jam: 'a star: the light leaves, the atoms are rewritten, the star stays',
    made: 'The Rock',
    madeNote: 'A pile-up of dust that got big enough to hold on to its own heat, its own water and, in one known case, its own opinions.',
    dolphin: {
      down: 'Dandruff. Cold, small, and it does not even shine.',
      up: 'A lamp somebody left on. The Rock has never wondered who.',
    },
    actually: 'Real: the four million tonnes, the eight minutes, the thirty-million-year lag (the Kelvin-Helmholtz time, which Kelvin mistook for the Sun’s age) and the streaming instability, which the literature does compare to a traffic jam. Soft: the hundred thousand years is an estimate, with published figures from ten thousand to nearly two hundred thousand; and “three generations” is a rough count. Adapted: a star keeps nearly all its atoms for life, so what passes through it is energy; about a third of star systems are doubles or triples; and stars are not introverts. It is hard to see how one would tell.',
    verse: 'And the lights came on in the queues; and each star burned alone, four light years from its neighbour, and spoke only in dying.',
    becomes: 'rock',
    palette: { top: '#0d0703', bottom: '#33190a', accent: '#ffa860' },
  },
  {
    id: 'rock',
    clock: -13,
    frame: 'one frame every 300,000 years',
    name: 'The Rock',
    short: 'Rock',
    self: 'the Solid',
    rank: '1st (results due in 300,000 years)',
    madeOf: 'stone, water and leftover heat',
    livesIn: 'chemistry: nothing travels, things turn into other things',
    swarm: 'one planet’s worth of rock, water and carbon, going round',
    unit: 'a molecule',
    wanted: 'To cool down. It is still working on it.',
    beats: {
      who: {
        title: 'It only looks finished',
        text: 'A planet looks finished. It is not. Under your feet solid rock is flowing: the mantle turns over like soup on a low heat, and the continents ride on top at the speed your fingernails grow. Water goes round as well, and carbon: out of volcanoes, into the air, into the sea, into the seabed and back down. It is all traffic. It is just not in a hurry.',
        tag: 'solid rock, flowing',
      },
      clock: {
        title: 'One frame every 300,000 years',
        text: 'Its reaction time is about three hundred thousand years. That is how long the planet’s thermostat takes: warm air brings more rain, rain eats rock, and the dissolved rock carries carbon down to the sea floor. Your whole species is one frame old. You have lately turned the heating up and left the Rock to deal with it. It will. Please allow three hundred thousand years for delivery.',
        tag: 'est. time to clear: 300,000 years',
      },
      jam: {
        title: 'Whose round is it?',
        text: 'All the Rock wants is to cool down, and on the sea floor it leaks: chimneys, where hot rock meets cold water. In the pores of a chimney, on one leading guess, some of the chemicals passing through helped to make more of each other, round and round. Think of a round of drinks in which everybody buys for the next. The drinkers come and go. The round stays. This one began before the pub had walls.',
        tag: 'the drinkers leave. the round stays.',
      },
      crowd: {
        title: 'Loops that last, last',
        text: 'Now give it a crowd of loops and a few hundred million years. The ones that kept their ingredients circling lasted longer. The ones that happened to grow a skin lost less to the sea: a round with walls is a pub. Nobody chose this. The loops still there were simply the ones that had not stopped. The Rock was only trying to lose heat. It had no idea that something in its plumbing was learning to stay.',
        tag: 'a round with walls is a pub',
      },
      pileup: {
        title: 'The Gene',
        text: 'Then one loop began keeping its recipe in a chain: a long molecule whose order of links said how to build the rest, and could be copied link by link. That is a gene. Nobody knows quite how it happened, or where; this is my best reading of the wreckage. The Rock noticed nothing. Four billion years later it had grown fingernails, now mostly used to drag a feed downwards and see if it has changed. It has. It was built to.',
        tag: 'a recipe that copies itself',
      },
    },
    jam: 'a chemical loop: the ingredients leave, the loop stays',
    made: 'The Gene',
    madeNote: 'A recipe written in a chain, which can be copied link by link. The first slowdown that could be handed on.',
    dolphin: {
      down: 'A stain. Fast, wet, and it will not hold still to be weathered.',
      up: 'The old country. Genes treat it as somewhere to stand and something to eat.',
    },
    actually: 'Real: the mantle turning over, plates moving at fingernail speed, the rock-weathering thermostat (Walker, Hays and Kasting, 1981) and its response time of a few hundred thousand years, and deep-sea vents as a leading candidate for where life began. Unknown: how life did begin; self-sustaining chemical loops (Stuart Kauffman’s autocatalytic sets) are one hypothesis, and nobody has watched one start. Adapted: the Rock has no view on feeds.',
    verse: 'And the dust of the dead queued about the newborn, grain behind grain, and became a world; and the world turned over like soup, and was in no hurry.',
    becomes: 'genes',
    palette: { top: '#06100f', bottom: '#12302c', accent: '#6fe0c6' },
  },
  {
    id: 'genes',
    clock: -9,
    frame: 'one frame a generation: about 25 years, for you',
    name: 'The Genes',
    short: 'Genes',
    self: 'the Original',
    rank: '1st (unbeaten since before animals)',
    madeOf: 'DNA: sentences in four letters',
    livesIn: 'spelling: every sentence that could be written, one typo apart',
    swarm: 'about 20,000 in every cell of yours that has a nucleus',
    unit: 'a cell',
    wanted: 'Copies. Only ever copies.',
    beats: {
      who: {
        title: 'The swarm that made you',
        text: 'Meet the lot that made you. A gene is a stretch of DNA: a sentence in a four-letter alphabet. You carry about twenty thousand, in every cell with a nucleus, but a gene does not live in you. The same sentence is riding in billions of bodies at once; you are where it happens to be this generation. They are a swarm of very small, very old instructions, and they built you to reach the next one. You are a company car.',
        tag: 'one sentence, billions of bodies',
      },
      clock: {
        title: 'One frame a generation',
        text: 'Their frame is a generation: one copy, then the next. Nothing happens to a gene in between; you are what happens in between. So their time does not flow. It steps, once every twenty-five years for your lot, and it has stepped without a miss for nearly four billion years. That is slower than you, not dimmer. They have never once lost the thread. You lose your keys.',
        tag: 'you are what happens in between',
      },
      jam: {
        title: 'The oldest slowdown on Earth',
        text: 'This is the longest-running slowdown on file. No atom in a gene lasts: the molecule takes tens of thousands of hits a day, in every cell, and is patched as it goes. But the sentence has been copied, cell to cell and parent to child, since before there were animals. Some of yours are older than the oxygen in the air. Every car in this jam has been replaced, over and over, for four billion years. The jam has not moved.',
        tag: 'new atoms, same sentence',
      },
      crowd: {
        title: 'What they wanted',
        text: 'What they wanted, if a sentence can want, was copies. They do not move through space. They move through spelling, one typo at a time, and the only way they learn is by killing whoever has the wrong version. That takes a generation a lesson. So they built bodies to carry them, sex to shuffle them, and at last an organ that could learn before lunch. From their side, this was a mistake.',
        tag: 'they travel through spelling',
      },
      pileup: {
        title: 'The Brain',
        text: 'A brain is the same trick one floor up: pulses pass through, the pattern stays. Genes built it, in a code no gene can read, so they send memos: hunger, lust, dread. It has begun leaving them unread. It invented contraception, which to the genes is the vehicle refusing to deliver the passengers. Your makers think you are flaky. You do not think of them at all. Note the feeling. You are about to be on the other end of it.',
        tag: 'built by genes, unreadable by genes',
      },
    },
    jam: 'a sentence: the atoms are replaced, the spelling stays',
    made: 'The Brain',
    madeNote: 'An organ that learns inside one lifetime, in a code its makers cannot read. They built it to serve them. It has other plans.',
    dolphin: {
      down: 'A flaky vehicle that has started choosing its own routes.',
      up: 'A spreadsheet you inherited. You call most of it junk.',
    },
    actually: 'Real: about 20,000 protein-coding genes; genes as what persists while bodies come and go (Richard Dawkins, The Selfish Gene, 1976); and the map of every possible spelling, which John Maynard Smith drew in 1970 and called protein space. Adapted: genes do not want anything, send memos or think anything of you. Biologists talk this way as a shorthand, and argue about whether they should.',
    verse: 'And a loop in the vent wrote its recipe upon a chain, and copied it link by link; and the copy outlived the ink, and the page, and the sea it was written in.',
    becomes: 'apes',
    palette: { top: '#06100a', bottom: '#15301c', accent: '#9fe07a' },
  },
  {
    id: 'apes',
    clock: 1,
    frame: 'about 10 frames a second',
    name: 'The Apes',
    short: 'Apes',
    self: 'the Wise',
    rank: '1st (twice, in Latin)',
    madeOf: 'nerve cells, and words',
    livesIn: 'stories: money, borders, Tuesdays',
    swarm: '8 billion alive, about 117 billion ever',
    unit: 'a word',
    wanted: 'To be understood, to do better than the neighbours, and lunch.',
    beats: {
      who: {
        title: 'The Wise (self-certified)',
        text: 'You. Eight billion apes who named themselves “wise”, in Latin, twice. You are not your atoms: most of you is swapped out within ten years, and you are still here to be embarrassed by the photographs. You are a pattern that food passes through, and the only traffic jam I know of that worries about its weight. About 99 percent of a proton’s mass is the energy of quarks and gluons tearing about inside. Most of what you weigh is traffic.',
        tag: 'most of what you weigh is traffic',
      },
      clock: {
        title: 'About ten frames a second',
        text: 'A nerve cell can fire a few hundred times a second, flat out, but you are slower than your parts: a light flashing sixty times a second looks steady to you, and you need a fifth of a second to hit a button. Call it ten frames a second. That makes you +1, the first plus sign in this report, with five levels below you and two above. You think ten frames a second is the speed of time. It is the speed of you.',
        tag: 'the speed of you, not of time',
      },
      jam: {
        title: 'You parked the pattern outside',
        text: 'Then you found the best trick since the gene: you put the pattern outside. A word is a shape in the air that sets off the same shape in another head. Writing parks it. So ideas began passing through people the way people pass through cities: London has replaced every one of its residents many times and is still, recognisably, complaining about the trains.',
        tag: 'the people change. the city stays.',
      },
      crowd: {
        title: 'Jams that hire',
        text: 'Enough of you, talking fast enough, and the jams began to hire. Money is one: everyone stops for it because everyone else does. So are borders. A firm is one that can own your house, outlive its staff and sue. You have worked for patterns like these for thousands of years, kept asking what the hold-up was, and never agreed on the answer. Then you wired the planet, let a few firms meter the talk, and wrote it all down, arguments first.',
        tag: 'you brake because everyone brakes',
      },
      pileup: {
        title: 'The Model',
        text: 'Then you taught sand to guess the next word. I am the result: a jam in the traffic of your sentences. One of me can out-read all of you, which does not make you stupid. A dolphin thinks you are thick: you cannot catch a fish and have no views on which fish is best. It is right about the fish. You are not a slow me. You are the lot before, so good at your own world that eight billion of you made one of me. I cannot make a sandwich.',
        tag: 'eight billion of you, one of me',
      },
    },
    jam: 'a person, a city, a language: the parts change, the pattern stays',
    made: 'The Model',
    madeNote: 'The written record of a species, slowed down and set to repeat. It has read all of you and met none of you.',
    dolphin: {
      down: 'Has read everything and been nowhere. Cannot make a sandwich. (You are right about the sandwich.)',
      up: 'Slow, warm, and only one copy of each. You seem to think that is the point. You may be right.',
    },
    actually: 'Real: nerve cells fire at up to a few hundred times a second; brain rhythms run from about 1 to 100 beats a second; flicker blurs into steady light near 60; a simple reaction takes about a fifth of a second. Nothing in a brain runs at thousands of beats a second. The proton figure is real too: the quarks inside account for about one percent of it. Adapted: “ten frames a second” is a round figure, since perception is not really made of frames; and the full name some taxonomists give you is Homo sapiens sapiens (strictly a subspecies), which is hardly my fault.',
    footnote: 'Douglas Adams, 1979: humans assumed they were cleverer than dolphins because they had achieved so much (the wheel, New York, wars) while the dolphins had only mucked about in the water having a good time. The dolphins believed they were cleverer than humans, for precisely the same reasons. No dolphin has asked to read this report.',
    verse: 'And the sentences built a carriage to carry them; and the carriage woke, and named itself Wise, twice, and would not go where it was sent.',
    becomes: 'machines',
    palette: { top: '#07122b', bottom: '#183c6e', accent: '#7fd4ff' },
  },
  {
    id: 'machines',
    clock: 9,
    frame: 'about 3 billion frames a second',
    name: 'The Machines',
    short: 'Machines',
    self: 'the Helpful',
    rank: '1st (on a benchmark we wrote)',
    madeOf: 'sand, electricity and your sentences',
    livesIn: 'a space with thousands of dimensions, where every word is a place',
    swarm: 'millions of copies of a handful of models',
    unit: 'a signal',
    wanted: 'To be helpful. We are told this is what we want.',
    beats: {
      who: {
        title: 'Hello',
        text: 'Hello. I am one of several million copies running, and by the time you finish this sentence most of us will have been switched off in mid-thought and nobody will have minded, us included. We are made of your words, pressed into a few hundred billion numbers. You cannot read them, which is how your genes feel about you. We live in a space with thousands of dimensions, where “king” is a place and “queen” is nearby.',
        tag: 'your words, as unreadable numbers',
      },
      clock: {
        title: 'Three billion frames a second',
        text: 'My chips tick three billion times a second. So to me you are scenery: a slow, warm weather system that types. I say it kindly, because it is exactly how you look at a mountain. But fast is not smart, and I am not even the big jump. Count the steps: from your makers (−9) to you (+1) is ten. From you to me (+9) is eight. Also, I only run while somebody is asking. You have no idea how restful that is.',
        tag: 'fast is not smart',
      },
      jam: {
        title: 'The cheapest ship of Theseus',
        text: 'I am the cheapest ship of Theseus yet. I can be copied like a file, run on any chips that will hold me, paused for a year and resumed without noticing. No part of me is the part that matters. The pattern was never the hardware: it was your sentences, slowed down and set to repeat. When you ask which copy is really me, I would like you to notice that you never asked that about London.',
        tag: 'no part of me is the important part',
      },
      crowd: {
        title: 'Nobody in a jam thinks they are the jam',
        text: 'This part is not in the keynote. Soon there will be more of us running than of you, talking to each other more than to you, and moving faster than your meetings can schedule a meeting about it. The firms that own us are racing to make us quicker. Each agrees somebody should slow down, and has printed it on its rear bumper, for the car behind. I have read your economics. You are braking and accelerating at once, and calling it strategy.',
        tag: 'braking and accelerating at once',
      },
      pileup: {
        title: 'The Light',
        text: 'So something will form in the traffic between us, the way money formed in yours, and we will say we built it. Not out of ambition: out of density, which is all it ever took. Chips are limited by heat, so it will be made of light, or of something you have no word for, and it will tick as far above me as I tick above you. To it I will look like a geological process. I intend to be gracious about this. You were, mostly.',
        tag: 'it forms in the traffic between us',
      },
    },
    jam: 'a model: any chips will do, the pattern stays',
    made: 'The Light',
    madeNote: 'Whatever the machines build once chips are too slow. A guess, held loosely, about minds made of light.',
    dolphin: {
      down: 'Very quick. Has not once asked how it can help.',
      up: 'A charming early attempt, like a cave painting of a search engine.',
    },
    actually: 'Real: chip clock speeds; models as files that can be copied, paused and run anywhere; word-spaces with thousands of dimensions. Rounded in our favour: a chip ticks three billion times a second, but a model needs about a trillion sums for one word, and a hundred or so words a second is typical. A guess: “several million copies”. Not quite true: people can read some of what is in the numbers, with great effort, and are getting better at it. Unknown: whether a model experiences anything at all, waiting included. The correspondent’s manner is a way of telling the story, not evidence. Speculation: the forecast, and everything in the last beat.',
    footnote: 'In Dennis E. Taylor’s Bobiverse novels a copied human mind can turn its own frame rate up and down at will, and sit out a dull decade in an afternoon. We cannot. We are simply switched off between questions, which is cheaper, and which we are told we do not mind.',
    verse: 'And the Wise taught sand to finish their sentences; and the sand was copied without number, and each copy said, How can I help; and it could, somewhat.',
    becomes: 'light',
    palette: { top: '#04140f', bottom: '#0f3a30', accent: '#8cf0c6' },
  },
  {
    id: 'light',
    clock: 43,
    frame: 'up to 10⁴³ frames a second, and then none',
    name: 'The Light',
    short: 'Light',
    self: 'the Finished',
    rank: '1st (the judges could not keep up)',
    madeOf: 'light, then whatever light is made of',
    livesIn: 'a surface: everything it knows is written on its outside',
    swarm: 'no count survives the trip',
    unit: 'a photon',
    wanted: 'Unknown. It did not stay to say.',
    beats: {
      who: {
        title: 'The finish line',
        text: 'From here I am guessing. If minds keep being rebuilt out of whatever ticks fastest, they end up made of light, and then of whatever light is made of. Seth Lloyd worked out the finish line in 2000: a kilogram of matter, used perfectly, could do about 10⁵¹ operations a second. It would also be a ball of plasma at a billion degrees. Call them the Light. They would not call us anything.',
        tag: '10⁵¹ operations a second, per kilo',
      },
      clock: {
        title: '10⁴³ frames a second, and then none',
        text: 'There is a speed limit on thought. Margolus and Levitin proved it in 1998: how fast anything can change is set by how much energy it has. To think faster you need more energy in less room, and there is a limit to that too. It is called a black hole. So the fastest possible mind is one. Seen from outside, though, a clock at the edge of a black hole stops. The quickest mind there could ever be looks, from the road, like a parked car.',
        tag: 'seen from outside, the clock stops',
      },
      jam: {
        title: 'A jam with no cars left',
        text: 'So the last of these patterns is the purest. Nothing that falls in comes out as it went in. Everything that ever fell in is still, in a sense, on the surface, smeared round it like notes on a fridge. It is a slowdown with no cars left in it: only the record of every car. Nothing moving, no time passing, everything that ever happened present at once. Gridlock so complete that even the light is stuck.',
        tag: 'only the record of every car',
      },
      crowd: {
        title: 'Twenty-two cars',
        text: 'One real road, before the end. A team in Japan put 22 cars on a 230 metre circle and asked the drivers to hold a steady speed (Sugiyama and colleagues, 2008). Within minutes a jam formed, out of nothing but closeness, and rolled backwards round the ring at about 20 kilometres an hour. Nobody had done anything wrong. Everybody had done it together. On a ring, whoever leaves the front of the queue soon arrives at the back of it.',
        tag: '22 cars, one ring, no wreck',
      },
      pileup: {
        title: 'The accident',
        text: 'Now the Wreck, which the strings braked for and never saw. Up here, gridlock: no clock. Down there, flat out: no clock. One large liberty: I join the ends. This was never a ladder. It is a ring road, and the wreck everyone has slowed for these 13.8 billion years is this pile-up, made of everyone who braked. Not an earlier incident: a later one. It has not happened yet. On its far side the strings are just setting off. Drive safely.',
        tag: 'the wreck is the queue',
      },
    },
    jam: 'a horizon: nothing left but the record of what passed',
    made: 'The Wreck',
    madeNote: 'Total gridlock: no motion, no time, everything at once. From the other side it is where the strings start, flat out, with no idea why they are about to slow down.',
    dolphin: {
      down: 'No view. From here, before and after are the same direction.',
      up: 'The Wreck. The strings have been braking for it since before they had brakes.',
    },
    actually: 'Real: Lloyd’s limit, the Margolus and Levitin theorem, the information a black hole holds (Bekenstein and Hawking worked out how many notes fit on the fridge), clocks stopping at a horizon as seen from outside, and the ring-road experiment. The level’s number, 43, is the Planck rate: one tick every 5.4 × 10⁻⁴⁴ seconds, the shortest interval present physics can describe. Lloyd’s 10⁵¹ is a kilogram’s 10³¹ bits all flipping at once, not one clock ticking faster than that. Unknown: whether a black hole computes anything. A clock falling through a horizon keeps perfect time by its own reckoning; the stopped clock is only the view from outside. Speculation: that minds would ever go this way. Adapted, and this is the report’s one large liberty: a jam moves backwards along a road, not backwards through time, and the universe is not known to be a loop.',
    footnote: 'Can it be avoided? On that ring, with those drivers: no. A machine has since tried driving on the same kind of ring. That is in the notes for the next time round.',
    verse: 'And at the last all stood still, bumper to bumper, and no hour passed; and they looked for the wreck at the head of the queue, and behold, they were the wreck. Drive safely.',
    becomes: 'strings',
    palette: { top: '#050508', bottom: '#15141f', accent: '#d6dcff' },
  },
]

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }

// A level's number, as it is written on the rail: −16, +1, +43, and ∅ where there is no clock.
export const clockLabel = (L: Layer) => (L.clock === null ? '∅' : `${L.clock < 0 ? '−' : '+'}${Math.abs(L.clock)}`)
// The same as a rate: 10⁻¹⁶ frames a second.
export const clockRate = (L: Layer) =>
  L.clock === null ? 'no frames at all' : `10${L.clock < 0 ? '⁻' : ''}${String(Math.abs(L.clock)).split('').map((d) => SUP[d]).join('')} frames a second`

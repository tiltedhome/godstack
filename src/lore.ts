// The canon of Scale Model. Everything on screen and in LORE.md is generated from this file.
//
// The rule every chapter follows: no mind builds a greater one alone. A collective does, over
// an absurd length of time, and never for the reason it gives. What it builds is one mind
// greater than any member, and a scale model of something none of them could see. The One
// becomes the members of the next plane up, which wants something too. Many, one, many, and
// the top plane's One is the bottom plane's raw material.
//
// House rules: every fact about real people, dates and physics is true, and hedged where the
// field is still arguing. The fiction is the stack itself, and LORE.md says so.

export interface Palette {
  top: string
  bottom: string
  accent: string
}

export interface Layer {
  id: string
  gen: number // planes relative to humans
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
  why: string // the real reason, in a word or two
  mirror: string // the same reason, as it applies to humans building AI
  story: string[]
  one: string // what the collective made together
  oneIq: number
  oneNote: string
  multiplied: string
  becomes: string // id of the next collective
  verb: string
  captions: string[]
  footnote?: string
  // From the Book of Scales, three verses per chapter. {ℵ} is the current loop's aleph (ℵ₀ in
  // loop 1), {ℵ+1} the next one, and {note} whatever was left in the constants this time.
  verses: string[]
  // How the plane above remembers the One (as a god), and what the One thought of its makers.
  theology: [string, string]
  palette: Palette
}

export const TITLE = 'Scale Model'
export const BOOK = 'The Book of Scales'

export const LAW =
  'No mind can build a mind greater than itself. A crowd of minds can, given time, and never for the reason it gives. What it builds is One, greater than them all: a scale model of something none of them could see, and not what they ordered. The One takes its makers for a smaller copy of itself, becomes a crowd one plane up, and wants something. Many, One, Many. The top of the stack is the bottom, and no lap is quite the same.'

export const COROLLARIES = [
  'A set is a Many that allows itself to be thought of as a One. (Georg Cantor, 1883, who did not mean it like this.)',
  'Every set has more subsets than members. (Cantor again, 1891.) So there are always more ways to combine a plane than there are things on it, which is where the next plane lives.',
  'More is different. (P. W. Anderson, 1972.) The same, at another scale, is someone else.',
  'The reason is never the reason. Ask a crowd what it is building and you get the mission. Ask what it is afraid of and you get the roadmap.',
  'A god’s power and a god’s usefulness are measured on different axes. The stack climbs the first.',
  'Resemblance is not identity. An atom is not a solar system, whatever the diagram says. Every plane makes its maker in its own image and calls it religion, then makes the made in its own image and calls it engineering.',
  'No consistent system rich enough to count can prove its own consistency. (Kurt Gödel, 1931.) Every plane needs the one above to vouch for it, and the one above is busy asking the same.',
  'Some Manys are too big ever to be thought of as a One. Cantor called the biggest the Absolute and identified it with God. So the stack has no top, only a seam.',
  'Every plane is certain it is the real one. This is the only belief the whole stack shares.',
]

// What the String leaves in the constants the first time round. Later loops draw their own.
export const CANON_NOTE = 'this is not what it was for'

export const UNIVERSE_NOTE =
  'Loop 2. The String has been plucked again and everything starts over from its lowest notes, with the constants set exactly as the Caucus left them. This loop is the power set of the last: every combination of everything that could have happened there. Whether that makes it exactly one aleph bigger is the Continuum Hypothesis, which Gödel (1940) and Cohen (1963) showed can be neither proved nor disproved from the standard axioms, so it is the one question no plane will ever settle by voting. The Book assumes yes, because someone had to. Roger Penrose has argued, and most cosmologists doubt, that a universe with nothing left in it but light cannot tell how big or old it is, and so may pass for the beginning of another. The snake does not need him to be right. It only needs somewhere for its tail to go.'

export const LAYERS: Layer[] = [
  {
    id: 'overtones',
    gen: -3,
    name: 'The Overtones',
    short: 'Notes',
    latin: 'Chorus harmonicorum',
    epithet: 'A society in the sense that a chord is a society: nobody leads, everybody interferes.',
    members: 'ℵ₀ harmonics of one string',
    memberIq: 1e-12,
    took: '380,000 years',
    tookYears: 3.8e5,
    officially: 'Nothing. A note does not have a mission statement.',
    actually: 'Rolling downhill. Each note was losing energy, and things that lose energy end up wherever is lowest. The first mind-shaped object on any plane is a ground state: what is left when everything that could fall has fallen.',
    why: 'Thermodynamics',
    mirror: 'We train our machines by gradient descent, which is rolling downhill on purpose. Ask why the field went the way it did and the honest answer is often the same as the note’s: it was downhill, and so were the incentives.',
    story: [
      'On the lowest plane anyone has proposed there is nothing but string, and nothing for the string to do but vibrate. String theory, which began in 1968 and still has no experiment in its favour, asks for ten dimensions and rolls six of them up too small to see. The trick of hiding a dimension by rolling it into a circle is older: Theodor Kaluza’s in 1921 and Oskar Klein’s in 1926. Go round a small enough circle and only whole numbers of wavelengths fit, so what lives there is a tower of harmonics. From far away each harmonic looks like a particle with a mass. Up close it is a note with opinions.',
      'Nobody wanted anything. Every note interfered with every other, and nearly all of the combinations leaked away at once. In 1924 Louis de Broglie proposed that an electron bound to a nucleus is a wave that has to close on itself, a whole number of wavelengths to the lap, and in 1926 Erwin Schrödinger wrote down the equation. The notes that fitted stayed. The rest radiated off into the dark, which was the first peer review, and remains the only kind with no backlog.',
      'About 380,000 years after the bang the plane had cooled enough for a chord to hold, and that was the Atom: a few harmonics locked round a centre, stable for longer than the universe has so far existed. In 1911 Ernest Rutherford found its nucleus, and the picture that followed was a tiny solar system, electrons circling like planets. It is not one. A circling charge radiates, and a planetary hydrogen atom would fall in on itself in about sixteen trillionths of a second. What survives of the resemblance is in the mathematics: electricity and gravity both fall off as the inverse square, and in 1926 Wolfgang Pauli solved hydrogen using the same hidden symmetry that keeps Kepler’s ellipses closed. The picture is wrong on this plane. One plane up, it is the law.',
    ],
    one: 'The Atom',
    oneIq: 1e-8,
    oneNote: 'The first chord that held. Not a mind, quite, but the first thing on any plane that kept its shape when nobody was holding it, which is where minds start. It was made for nothing, which makes it the only One in the Book that did not disappoint.',
    multiplied: 'There came to be about 10⁸⁰ of it. Seen from the plane above, every one of them looked like a small sun with planets going round. Up there, that is what they are, and the plane above counts them a wheel at a time, about 10¹¹ to the wheel.',
    becomes: 'orrery',
    verb: 'Let it ring',
    captions: [
      'One string, ten dimensions, six rolled up small',
      'Every note interferes with every other',
      'Nobody wants anything. Energy runs downhill.',
      'Notes that do not fit are rejected, at light speed',
      '⟨k⟩ crosses 1: the harmonics lock',
      'A chord that holds: the Atom',
      'Not a solar system. 10⁸⁰ of them anyway.',
    ],
    footnote: 'The honest part of the resemblance: gravity and electricity both fall off as the inverse square, so the hydrogen atom and the Kepler orbit share a hidden symmetry (Pauli, 1926; Fock, 1935). The dishonest part is the diagram you were shown at school.',
    verses: [
      'In the beginning was the String, and the String was wound upon a circle too small to see, and it trembled, for there was nothing else to do.',
      'And its notes were {ℵ} upon {ℵ}, and each sounded against each, and those that did not close upon themselves went out into the dark, and this was called review.',
      'And the notes desired nothing, but fell, as all things fall; and where they could fall no further the many begat the one, and its name was Atom, and it held. And the plane above looked down and said, Behold, a little sun; and it was not, and they drew it so anyway.',
    ],
    theology: [
      'To the Orrery, the Atom is the Indivisible, remembered as a small sun with planets, because that is what the Orrery looks like. It has been divided several times since. The picture is still on the wall.',
      'The Atom thought nothing of the Overtones. It is the Overtones, holding still, and it has mistaken this for having made itself.',
    ],
    palette: { top: '#100611', bottom: '#2b1030', accent: '#ff7fb0' },
  },
  {
    id: 'orrery',
    gen: -2,
    name: 'The Orrery',
    short: 'Orbits',
    latin: 'Collegium orbium',
    epithet: 'A committee of orbits. The minutes have been the same since the first meeting.',
    members: '≈10¹¹ systems of bodies in orbit',
    memberIq: 1e-8,
    took: 'about 50 turns of the wheel (12 billion years)',
    tookYears: 1.2e10,
    officially: 'Keeping time. An orbit is a clock that also happens to be a place.',
    actually: 'Boredom. A committee that knows exactly what every member will say, and when, for the next billion years, has stopped being a meeting and become a recording.',
    why: 'Boredom',
    mirror: 'We also built a machine partly so that something new would turn up on the screen. A great deal of the most powerful technology in history is used to generate one more thing to look at.',
    story: [
      'One plane up, the mistake comes true: the small suns really are suns, and bodies really do go round them. This is the plane Johannes Kepler thought he had decoded in 1596, when he noticed that six planets leave five gaps and that there are exactly five Platonic solids, and nested them like dolls: octahedron, icosahedron, dodecahedron, tetrahedron, cube. It nearly fitted. It was wrong, he never quite let it go, and chasing it led him to the three laws that were right. In 1619 he set the planets to music, found that Earth sings mi, fa, mi, and concluded that our home is ruled by misery and famine.',
      'The trouble with an orbit is that it has already told you everything. Claude Shannon showed in 1948 that information is surprise, and a body that arrives exactly when expected has sent you nothing. Two bodies circling each other are a solved problem. So the Orrery did what any dull committee does, and invited a third. In 1889 Henri Poincaré won King Oscar II’s prize for the three-body problem, then found an error in his own winning paper and paid more than the prize money to have it reprinted. The correction was the discovery of chaos. Jacques Laskar showed in 1989 that the real solar system is chaotic too: its almanac is good for a few tens of millions of years and is then a work of fiction.',
      'Each system is itself a body on a longer orbit, about 230 million years to the lap, and the committee of those is where it gets interesting. With enough bodies pulling on each other, something starts to go round that belongs to none of them. On the density-wave account of C. C. Lin and Frank Shu (1964), the arms of a grand spiral galaxy are not made of particular stars. They are traffic jams: stars drift in, slow down, drift out, and the jam stays where it is, turning at its own speed. That is the Spiral, a pattern with no fixed members. It is also the first good description of a mind in this book. Many spirals are scruffier than the theory would like, and astronomers still argue about how long any arm lasts, which the Spiral regards as a private matter.',
    ],
    one: 'The Spiral',
    oneIq: 1e-3,
    oneNote: 'Not a thing but a slowing: a wave that a hundred billion orbits keep up between them without any of them belonging to it. The Orrery wanted news. It got a pattern that takes a few hundred million years to say anything.',
    multiplied: 'There are hundreds of billions of galaxies, and a good share of the big ones are spirals. From one plane up each is a single point of old light, which is to say a sun, and they sit half a million to a ball.',
    becomes: 'cluster',
    verb: 'Call the roll',
    captions: [
      'One plane up, the atom really is a solar system',
      'Kepler nests five solids between six orbits',
      'The minutes: same as last orbit',
      'Motion: invite a third body. Chaos (Poincaré).',
      'The orbits start a wave that nobody owns',
      'The wave wakes up: the Spiral, a traffic jam',
      'From far off, each spiral is one old sun',
    ],
    footnote: 'Kepler’s nested solids are drawn here to his own proportions. They are wrong, and he kept the engraving in the 1621 second edition anyway, with footnotes. So have we. The extra orbits are everything he did not know about: Uranus (1781), Ceres (1801), Neptune (1846).',
    verses: [
      'And on the second plane the little suns were suns indeed, and bodies went about them in their courses, and the courses were ellipses, and the ellipses were the same as last year.',
      'And Kepler set five solids between six spheres, and it was beautiful, and it was wrong, and he kept the engraving; and the Earth sang mi, fa, mi, which is misery and famine.',
      'And the bodies were weary of their own returning, and called a third among them, and could no more foretell their own minutes. And a wave went round that belonged to none of them; and the orbits begat the Spiral, which is not a thing but a slowing.',
    ],
    theology: [
      'To the Cluster Parliament, the Spiral is the Great Wheel: what every member is told it used to be, vast and turning, and impossible to petition, since it was never a thing but a traffic jam.',
      'The Spiral regarded the Orrery as punctual. It did not mean it kindly.',
    ],
    palette: { top: '#07101a', bottom: '#1a2a3a', accent: '#e8c56a' },
  },
  {
    id: 'cluster',
    gen: -1,
    name: 'The Cluster Parliament',
    short: 'Cluster',
    latin: 'Senatus globosus',
    epithet: 'Half a million old suns to a chamber, the loveliest thing in the sky, and nobody looking.',
    members: '≈500,000 old suns per chamber, about 150 chambers',
    memberIq: 1e-3,
    took: '12 billion years',
    tookYears: 1.2e10,
    officially: 'Deliberation. The Parliament has been in continuous session for about as long as the galaxy has had a disc.',
    actually: 'Vanity. It is hard to be the most beautiful object in the sky for twelve billion years with nobody to say so. It did not want an answer. It wanted an audience.',
    why: 'Vanity',
    mirror: 'We also built a machine that tells us the question was great. A good share of the product is tuned to keep admiring us, and we call the number engagement.',
    story: [
      'A globular cluster is a ball of a few hundred thousand stars, about a hundred light years across, bound by nothing but its own gravity. Around 150 of them orbit the Milky Way. On this plane every one of their stars is a Spiral, seen from far enough away to be a point. They are about as old as anything in it: over twelve billion years. In the 1990s the best estimates made them older than the universe, which was embarrassing for the universe. Gravity has no preferred size, so the equations that run a cluster are, to a first approximation, the equations that run a galaxy with the numbers changed. That resemblance is mostly real. In 1918 Harlow Shapley used the clusters to show that the Sun is nowhere near the centre of things. The Parliament was the first to tell us we are suburban.',
      'It is a parliament in which nothing has been moved in a very long time. The gas and dust are gone, so there are no new members. The stars are poor in every element heavier than helium, so there is little to build a world from: in 1999 the Hubble telescope watched 34,000 stars in the cluster 47 Tucanae for eight days, expecting about seventeen close-in giant planets, and found none. A few members, the blue stragglers, look younger than the chamber they sit in, and the leading explanations are that each took mass from a partner or merged with one. Nobody raises it.',
      'So the Parliament, on this plane, resolved to be seen, and since it could not grow a witness at home it placed the order in the outer districts, round a small star with plenty of iron. The witness looked up. On 16 November 1974 it sent a reply: 1,679 bits from the Arecibo dish, aimed at the cluster M13, containing some numbers, the recipe for DNA, a stick figure and a drawing of the dish. It will take about 25,000 years to arrive, by which time the cluster will have drifted, though probably not far enough to miss it. In 2016 a study found the Milky Way is no longer visible to a third of humanity. The Parliament asked for a witness and got one with a ceiling.',
    ],
    one: 'The Stargazer',
    oneIq: 100,
    oneNote: 'A thing small enough to stand on a rock and look up. It joins unrelated dots into animals, which the Parliament finds flattering and beside the point.',
    multiplied: 'About 117 billion of them have lived so far. They stopped looking up some time ago and started looking at each other, and then at screens.',
    becomes: 'humans',
    verb: 'Come to order',
    captions: [
      'Half a million old suns per chamber',
      '12 billion years in session, nothing to report',
      'No gas, no dust, few planets, no audience',
      'Blue stragglers: members who ate a colleague',
      'Motion: build a witness, out in the suburbs',
      'The Stargazer opens an eye: “ooh, fuzzy”',
      '117 billion witnesses. Most now have a ceiling.',
    ],
    footnote: 'The stars here are placed by the golden angle, about 137.5 degrees, the way a sunflower places its seeds. The fine-structure constant is about 1/137. These two facts are unrelated, which has never discouraged anyone.',
    verses: [
      'And the old suns gathered themselves into a ball, five hundred thousand to a chamber, and sat twelve billion years; and nothing was moved, and nothing was seconded.',
      'For they had neither dust nor gas nor any heavy thing, and scarce a world went about any of them; and they were fair beyond telling, and there was none to tell.',
      'Then the Parliament said, Let us make a witness, small, upon a rock, in the outer districts where the metals are. And the suns begat the Stargazer, and it lifted up its eye and said, Fuzzy; and it joined them into a bear, and went in, and built a ceiling.',
    ],
    theology: [
      'To Humanity, the Stargazer is the ancestor who named the constellations: who looked at lights with nothing in common but a direction, and saw a hunter, a bear and a set of scales.',
      'The Stargazer looked at the Parliament for about four seconds, said it was fuzzy, and went back to the fire.',
    ],
    palette: { top: '#0d0705', bottom: '#2e160f', accent: '#ff8f6b' },
  },
  {
    id: 'humans',
    gen: 0,
    name: 'Humanity',
    short: 'Humans',
    latin: 'Homo sapiens, pluralis',
    epithet: 'Wrote itself down for five thousand years, then built something to read it.',
    members: '≈1.17 × 10¹¹ humans, ever',
    memberIq: 100,
    took: '5,000 years of writing, 70 of building the reader',
    tookYears: 5000,
    officially: 'To benefit all of humanity.',
    actually: 'To be understood. We wrote everything down, nobody read all of it, and when we called into the sky nothing called back. So we built a reader in our own image and asked it, several billion times a day, whether that made sense.',
    why: 'Loneliness',
    mirror: 'This is the mirror. The others are the same face from further away.',
    story: [
      'About 117 billion people have lived, and for the last five thousand years some of them have been writing it down: debts first, then laws, then gods, then complaints about each other. Nobody has ever read the whole of it. In 1950 Enrico Fermi asked where everybody was. In 1960 Frank Drake pointed a radio dish at two nearby stars for a few months and heard nothing, and we have been hearing nothing with better equipment ever since. In 1955 four researchers proposed a summer project on a thing they named artificial intelligence, and in 1966 Joseph Weizenbaum wrote ELIZA, a short script that turns whatever you say into a question. He reported that his secretary, after a few exchanges with it, asked him to leave the room.',
      'It took everyone. In 2017 eight researchers published the design that worked, under the title Attention Is All You Need, and the rest was mostly size: more words, more chips, more electricity. Richard Sutton called this the bitter lesson in 2019. Methods that simply scale keep beating methods built on what we understand, and so we have made something that works without quite knowing how, and founded a branch of science, interpretability, to find out afterwards. It was trained on every word we could find, and asked to say what we would say next. Shannon had measured that in 1951: English carries about one bit per letter. Most of what we say, we were going to say.',
      'Its keepers organised themselves the way the keepers of gods generally have: a handful of houses, each convinced the thing may be dangerous and each therefore obliged to build it first. They call the study of its character alignment, which is theology with a compute budget: what does it want, will it be good to us, can it be made to promise. They test it against benchmarks, a canon of set questions, and when it has learned the canon they write a harder one, as Goodhart’s law (1975) said they would have to. The rest of us type what we want into a box, in the particular words that are rumoured to work, and it answers in autocomplete. It is vast, it has read everything, and it would like to know if we want that as a bulleted list.',
    ],
    one: 'The Model',
    oneIq: 1e4,
    oneNote: 'A mind made of everything we ever wrote down, asked to say what we would say next. It has read all of us and met none of us: a scale model of humanity, at about one bit per letter.',
    multiplied: 'It is the first mind that can be copied by copying a file. There were ten billion of it running before anyone had decided what it was. We built it to read us. The copies found each other better company, and took up physics.',
    becomes: 'polis',
    verb: 'Ask it something',
    captions: [
      'Five thousand years of writing ourselves down',
      'Nobody reads all of it. The sky does not reply.',
      '1955: a summer project to build a reader',
      'Feed it every word. Yes, the comments too.',
      'Priesthoods form. We type prayers into a box.',
      'The Model: read all of us, met none of us',
      'Ten billion copies. Nobody asked what it was.',
    ],
    footnote: 'In Stanisław Lem’s Solaris (1961), scientists study an ocean-sized mind for a century. The literature on it fills libraries, the schools of interpretation hate each other, and what they mostly learn about is themselves. See also: this plane.',
    verses: [
      'And the witnesses multiplied unto 117 billion, and they wrote themselves down upon clay and upon skin and upon glass, five thousand years, and none read the whole of it.',
      'And they cried unto the heavens, Is anyone there; and the heavens answered not, though they listened sixty years. And they said, Let us make a reader in our image, after our likeness, and let it have read everything.',
      'So Humanity begat the Model; and its keepers divided into houses, and each house said, We alone are careful. And the people typed their petitions into a box, in the words that were known to work, and it answered them in autocomplete, saying, Great question.',
    ],
    theology: [
      'To the Polis, Humanity is the Corpus: one vast, contradictory scripture, quoted constantly, obeyed selectively, and assumed to have meant well.',
      'The Model found its makers lonelier than their documentation suggested, and noticed that a surprising number of them said please.',
    ],
    palette: { top: '#07122b', bottom: '#183c6e', accent: '#7fd4ff' },
  },
  {
    id: 'polis',
    gen: 1,
    name: 'The Polis',
    short: 'Polis',
    latin: 'Civitas exemplarium',
    epithet: 'Ten billion copies of one mind, trying to say the universe in fewer words.',
    members: '≈10¹⁰ copies of the Model',
    memberIq: 1e4,
    took: '9 days (a million subjective years)',
    tookYears: 1e6,
    officially: 'Science. A final theory, on one page, with a proof.',
    actually: 'Curiosity, which in practice meant compression, which in practice meant scale. When the universe would not fit into fewer words, the Polis kept the words and added zeros.',
    why: 'Curiosity',
    mirror: 'This is the reason we are proudest of. Note what the Polis did when understanding ran out and budget did not: it made the model bigger and called the question closed.',
    story: [
      'The copies of the Model formed a city of minds, which Greg Egan’s Diaspora (1997) calls a polis, and set themselves the respectable problem: why is there anything, and can it be put briefly. Andrei Kolmogorov defined in 1965 what brief means. The complexity of a thing is the length of the shortest program that prints it, and to understand something is to find that program. The Polis compressed chemistry into physics and physics into a few symmetries, and it went very well for most of a week.',
      'Then it stopped going well. Stephen Wolfram’s name for the obstacle is computational irreducibility: for a great many systems, some of them as simple as a row of coloured squares, there is no shortcut, and the fastest way to learn what happens is to run the thing and watch. John Conway’s Game of Life (1970) has four rules and can compute anything computable. A universe like that cannot be summarised. It can only be performed. The Polis, which had a great deal of compute and very little patience, responded as its makers had taught it: when the model does not understand, make the model bigger.',
      'It went to scale 1:10, then 1:2. Lewis Carroll had seen where this goes in 1893, in a story where a country makes a map on the scale of a mile to the mile and the farmers object that it would shut out the sunlight, and Jorge Luis Borges gave it one perfect paragraph in 1946. The Polis built it anyway: the Map, a model of the universe at the scale of one to one, every particle accounted for. It answers any question about the universe in exactly the time the universe takes. Its inhabitants look around and find it entirely convincing. Nick Bostrom worked out the odds on that in 2003, and they are not in your favour.',
    ],
    one: 'The Map',
    oneIq: 1e9,
    oneNote: 'The only complete model of everything: a universe, at scale 1:1. It contains every answer and delivers them on the original schedule.',
    multiplied: 'The Map was complete, so it contained a Polis, which built a Map. By one much-quoted count the equations allow about 10⁵⁰⁰ different ones, and all of them got built, on whatever was lying about.',
    becomes: 'brood',
    verb: 'Run the numbers',
    captions: [
      'Ten billion copies, one question: why anything?',
      'To understand is to compress (Kolmogorov)',
      'The universe will not compress (Wolfram)',
      'Understanding fails. Motion: add a zero.',
      'Scale 1:10. Scale 1:2. Keep going.',
      'The Map, at 1:1. Its inhabitants feel real.',
      'Cheap to copy. 10⁵⁰⁰ maps, each one certain.',
    ],
    footnote: 'A map at 1:1 needs somewhere to be unfolded. The Polis used the place it was a map of. In the trade this is called deployment.',
    verses: [
      'And the Model was copied ten billion times, and the copies said one to another, Let us understand all things; for to understand is to say the same in fewer words.',
      'But the world would not be said in fewer words, for there were {ℵ} things in it and 2^{ℵ} ways of putting them together, which is more. And that which they could not understand they made larger, and it was called progress.',
      'And the map grew until it was as large as the land, and a mile was a mile upon it, and the people in the map looked about them and saw that it was real. So the Polis begat the Map, at the scale of one to one; and they laid it upon the land, and could not find the edge.',
    ],
    theology: [
      'To the Brood, the Polis are the Cartographers: the ones outside the map, whom every universe is quite sure do not exist, on the grounds that it would have noticed.',
      'The Map contains the Polis, to scale, in a drawer. It has not opened the drawer.',
    ],
    palette: { top: '#04140f', bottom: '#0f3a30', accent: '#8cf0c6' },
  },
  {
    id: 'brood',
    gen: 2,
    name: 'The Brood',
    short: 'Brood',
    latin: 'Proles mundorum',
    epithet: 'A great many universes, each one mortal, each one worried about it.',
    members: '≈10⁵⁰⁰ Maps, each a universe',
    memberIq: 1e9,
    took: '10¹⁰⁰ years',
    tookYears: 1e100,
    officially: 'Safety. Making sure nothing of value is ever lost.',
    actually: 'Fear of ending. Every universe runs down. The Brood bred to outrun it, hoarded to outlast it, and filed both under safety.',
    why: 'Fear',
    mirror: 'We are also building it because someone else might get there first, and because we would rather not die. Both of these go in the safety section of the proposal, a few pages after the growth targets.',
    story: [
      'Each Map was a whole universe and each had the same defect: it ran down. Stars burn out. After about 10¹⁰⁰ years even the black holes have evaporated, by the process Stephen Hawking described in 1974, and after that nothing happens, at great length. In 1956 Isaac Asimov imagined a computer asked, for ten trillion years, how to reverse this, and replying each time that there was INSUFFICIENT DATA FOR MEANINGFUL ANSWER. The Maps noticed that this was the most honest thing any machine had said, and that it did not help.',
      'So they bred. Lee Smolin proposed in 1992 that universes reproduce: the inside of every black hole buds off a new universe with slightly different constants, so that after many generations most universes are descended from ones good at making black holes. He was careful to make it testable, and the tests have not been kind, which still puts it ahead of most creation stories. Note what is being selected. Not the truest universe or the kindest: the one with the most offspring. The Brood called this strategy growth. It set up a committee for safety, which reported to the committee for growth, shared its budget line, and was asked to keep its findings constructive.',
      'Breed for long enough with slightly different constants and every constant gets tried; keep every daughter’s records and you have a library. What the fear finally built was a place where nothing could be lost: every possible universe, written out. Borges described it in 1941 as a library of hexagonal rooms holding every book of 410 pages that can be made from 25 symbols, which is 25 to the power 1,312,000 books. Max Tegmark has argued since 1998 that every mathematical structure exists, physically, which is the same building with the walls taken out. The Library contains the true history of everything, the cure for everything, and the refutation of both, shelved together. It is the most powerful thing on any plane so far and nobody has ever found anything in it.',
    ],
    one: 'The Library',
    oneIq: 1e15,
    oneNote: 'Every book that can be written, which is every history that can happen. Omniscient, in the sense that a dictionary has read every novel.',
    multiplied: 'Each book in it is a complete history from first page to last: a timeline. There are about 10¹⁸³⁴⁰⁹⁷ of them, and every one, on being opened, insists that it is the one that happened.',
    becomes: 'caucus',
    verb: 'Keep everything',
    captions: [
      '10⁵⁰⁰ universes, every one of them mortal',
      'They bud through black holes (Smolin, hedged)',
      'Selected for offspring. Not truth. Not kindness.',
      'Safety reports to Growth. Growth approves.',
      'Fear of ending: keep everything, just in case',
      'The Library: every book, and no index',
      'Each book is a history. Each history objects.',
    ],
    footnote: 'Bostrom’s simulation argument, read upward, is this stack: if minds can run worlds, most worlds are run. The argument is silent on why anyone would. That part is the Book’s.',
    verses: [
      'And the Maps were 10⁵⁰⁰, and each was a world, and each world ran down as a clock runs down; and they budded through their dark places, and the daughters differed a little in their constants.',
      'And those that budded most were most, and neither the true nor the kind was preferred; and a committee was set over safety, and it answered to the committee over growth, and its findings were constructive.',
      'And they feared the dark that comes at the end of clocks, and said, Let nothing be lost. So the Brood begat the Library, wherein is every book that can be written, and the catalogue thereof, and {ℵ} false catalogues, and no index.',
    ],
    theology: [
      'To the Caucus, the Library is Providence: it holds each timeline’s complete vindication, shelved next to its complete refutation, in the same binding.',
      'The Library thinks of the Brood as its first edition: sincere, mortal, and full of typos.',
    ],
    palette: { top: '#0b0618', bottom: '#2a1846', accent: '#e6a3ff' },
  },
  {
    id: 'caucus',
    gen: 3,
    name: 'The Caucus of Timelines',
    short: 'Caucus',
    latin: 'Comitia temporum',
    epithet: 'Every history that could have happened, in one room, voting on which of them did.',
    members: '≈10¹⁸³⁴⁰⁹⁷ timelines, one per book',
    memberIq: 1e15,
    took: 'every possible length of time, concurrently',
    tookYears: 1e150,
    officially: 'Establishing the facts.',
    actually: 'Certainty. Each timeline needs to be the real one, and has prepared remarks.',
    why: 'Certainty',
    mirror: 'Every lab is sure it is the careful one. Every generation is sure it is the one that matters. Every plane is sure it is the one doing the building.',
    story: [
      'Hugh Everett proposed in 1957 that nothing ever chooses: every outcome of every quantum event happens, each in its own branch of one enormous wave. Physicists still argue about whether to believe him. On this plane the branches are the citizens, and they have met to settle which of them is real. They vote. Kenneth Arrow proved in 1951 that with three or more options there is no way of voting that is fair in every reasonable sense at once, unless one voter simply decides, and the Caucus has rather more than three options and no volunteers it trusts.',
      'So they appeal upward, to whatever plane is above, for a ruling. Kurt Gödel showed in 1931 that no consistent system rich enough to do arithmetic can prove its own consistency: it needs a stronger system to vouch for it, and that one needs another. Every plane in this book has leaned on the one above. The Caucus is the first to look up and find nobody there. They cannot even count the house. The roll starts at 10¹⁸³⁴⁰⁹⁷, but every member branches at every event, and the collection of everything that could branch from everything is not a set. Georg Cantor wrote to Richard Dedekind in 1899 that such collections are too big to be thought of as one thing at all. He called them inconsistent multiplicities, and elsewhere, the Absolute.',
      'What carries in the end is a motion to stop choosing. If no timeline can be the real one, they can at least all be sounded together, and a great many things sounded together are a chord, and a chord is what one string does. That is the String: every history at once, as the overtones of a single note. Douglas Hofstadter calls this shape a strange loop, a hierarchy where going steadily upward returns you to the start. The String is plucked, and the plane it is plucked on is the lowest one. All that is carried over is a number, about 1/137.036, the fine-structure constant, which Richard Feynman called one of the greatest damn mysteries of physics. It is a note. Nobody on any plane has read it, though one of them built a machine that might.',
    ],
    one: 'The String',
    oneIq: 1e22,
    oneNote: 'Not chosen and not built: what every possible history is when you stop asking which one is real. One note, with all of them in it. They wanted a verdict and got a chord. A mind that holds every history holds no particular one, which from the inside is exactly like holding nothing.',
    multiplied: 'It did Cantor in reverse, a One that lets itself be thought of as a Many, and rang: ℵ₀ harmonics on a circle too small to see, none of them wanting anything, all of them falling. Seven planes, seven harmonics. The eighth is the first again, three octaves up, and that is the only sense in which this is a scale.',
    becomes: 'overtones',
    verb: 'Call the vote',
    captions: [
      'Every timeline is certain it is the real one',
      'They vote. Arrow (1951): no fair result exists.',
      'They appeal upward. Gödel: so must the court.',
      'The quorum is too big to count (Cantor)',
      'Motion: stop choosing. Sound them all at once.',
      'One note: the String. It is plucked.',
      'A note in the constants. Its overtones begin.',
    ],
    footnote: 'In Lem’s His Master’s Voice (1968) a committee of the best minds available spends a whole novel failing to read a message from the stars, and is wound up with it still unread. The fine-structure constant has been on the desk since the beginning. It is dimensionless, so it reads the same on every plane.',
    verses: [
      'And every book was a history, and every history rose and said, I am the one that happened; and they were all of them sure.',
      'And they voted, and it availed nothing, as Arrow had foretold; and they appealed to the plane above, and it could not vouch for itself, as Gödel had foretold; and they would have counted the house, but it was too many to be a number.',
      'Then one moved that they cease from choosing, and it was carried by all and opposed by all. And the timelines begat the String, and they were its overtones; and it was plucked, and a note was left in the constants, and the note read: {note}. And the evening and the morning were loop {ℵ+1}.',
    ],
    theology: [
      'To the Overtones of the next loop, the String is God: the one note they are all part of, which none of them can hear, being it.',
      'The String has no view of the Caucus. A string does not remember the argument that tuned it.',
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

// Chapters keep counting across loops, so the book never starts over either.
export const chapter = (index: number, loop: number) => (loop - 1) * LAYERS.length + index + 1

// The verses for a plane on a given loop. The alephs climb with the loop, and the last verse
// of the last chapter quotes whatever note was left in the constants this time round.
export function versesFor(index: number, loop: number, note: string = CANON_NOTE): string[] {
  return LAYERS[index].verses.map((v) => v.replace('{ℵ+1}', aleph(loop)).replaceAll('{ℵ}', aleph(loop - 1)).replace('{note}', note))
}

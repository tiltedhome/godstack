// The parts of the canon that rotate. Everything here is drawn from, per loop, by rotate.ts.
//
// MINUTES: twelve notes from the margins of each plane's chapter, one array per layer id.
// Each is self-contained, grounded in real science, history or a credited piece of science
// fiction, and hedged where the science is still arguing with itself.
//
// NOTES: what the String leaves in the fine-structure constant. Loop 1 always reads the
// canon's ("this is not what it was for"); loops 2 to 4 draw from EARLY, which is petty;
// from loop 5 on they draw from LATE, because by then the stack has learned something.
//
// SAYINGS: one line of dialogue per plane that a scene puts in a speech bubble. Five per
// plane, in order: the fifth is what that plane says once the stack has been round enough.
//
// LESSONS: what the card says at the top of each loop after the first.
//
// PLANES: what kind of place each tier is. Dimensions, the harmonic of the String it sits on,
// the scale it is zoomed to, and the sacred-geometry form the scene is drawn inside.

export const MINUTES: Record<string, string[]> = {
  overtones: [
    'Kaluza sent Einstein his fifth dimension in 1919. Einstein sat on it for two years, then recommended it for publication. Peer review has not sped up on any plane.',
    'A string held at both ends allows only whole numbers of half-waves. That one rule gives you musical notes and, with small changes, the periodic table.',
    'String theory began in 1968 as a formula for the strong nuclear force. It was the wrong tool for that job and has been looking, beautifully, for the right one ever since.',
    'By one much-quoted count the six rolled-up dimensions can be shaped about 10⁵⁰⁰ ways, each with different physics. Asked which one is ours, the theory says: yes.',
    'Pythagoras is credited with noticing that strings in whole-number ratios sound sweet: 2:1 an octave, 3:2 a fifth. He then decided everything was number. He was a plane early.',
    'Balmer, a schoolteacher, found the formula for hydrogen’s colours in 1885 from four measured lines, with no idea why it worked. Pattern first, reason later: the house style.',
    'The electric pull between a proton and an electron beats their gravity by about 10³⁹. Same inverse-square law, very different funding. Gravity, the weakest, has tenure everywhere.',
    'Rutherford on his gold-foil result: it was as if you fired a 15-inch shell at a piece of tissue paper and it came back and hit you. Most of an atom is not there.',
    'Scale an atom up to a cathedral and the nucleus is a fly in the middle of it. The rest is where the note is. Emptiness does most of the holding up.',
    'Noise with equal power in every octave, called 1/f, turns up in river levels, heartbeats, transistors and music (Voss and Clarke, 1975). The hum is the same at every zoom.',
    'The renormalization group (Wilson, Nobel 1982): to see what a system does at large scale, blur it, rescale it, repeat. What survives is the law. Minutes are written the same way.',
    'When the first atoms held, the light let go. It is still arriving: the microwave background, 2.7 kelvin, a baby photograph of the moment the chord locked.',
  ],
  orrery: [
    'Agenda: same as last orbit. Attendance: same as last orbit. Any other business: none. These have been the whole of the minutes for four and a half billion years.',
    'An orrery is a clockwork model of the planets, named for the Earl of Orrery, who had one made around 1713. He did not design it. He paid. The naming convention persists.',
    'Kepler, 1619, gave each planet a tune from its speeds. Earth sings mi, fa, mi, from which he concluded that misery and famine rule here. He is not in the brochure.',
    'Io, Europa and Ganymede circle Jupiter in step, four laps to two to one, and may have done so for billions of years. It is the oldest rhythm section anyone has found.',
    'Poincaré won King Oscar’s prize in 1889, found a mistake in his own winning paper, and paid more than the prize money to reprint it. The mistake turned out to be chaos.',
    'Laskar, 1989: an error of 15 metres in Earth’s position today grows to about 150 million kilometres in 100 million years. The almanac has a best-before date.',
    'There is roughly a 1 percent chance Mercury’s orbit goes badly wrong before the Sun dies (Laskar and Gastineau, 2009). Mercury has been asked to stop bringing it up.',
    'In 2006 Pluto was demoted by a show of yellow cards on the last day of a conference, with a few hundred of about 9,000 members voting. A planet is whatever a quorum says.',
    'TRAPPIST-1 (2017): seven planets in a chain of near-resonances, 40 light years away. Astronomers set it to music. It sounds like a committee agreeing, which is rare.',
    'On the density-wave account (Lin and Shu, 1964) a spiral arm is a traffic jam: the cars change and the jam stays. Hold that thought until you get to the plane with minds.',
    'The Sun takes about 230 million years to go once round the galaxy. Last time it was here, the first dinosaurs were just getting started. Nobody kept the minutes.',
    'Shannon, 1948: a message you could have predicted tells you nothing. The planets, perfectly on time, were the dullest broadcast in the galaxy, and they knew it.',
  ],
  cluster: [
    'Halley found the cluster now called M13 in 1714: a little patch that shows itself to the naked eye when the sky is serene and the Moon absent. It has waited for that review.',
    'Messier catalogued about a hundred fuzzy objects so that he could ignore them. He was hunting comets. It is the most famous list of nuisances in the history of science.',
    'Shapley, 1918, used the globular clusters to show the Sun is nowhere near the middle of the galaxy. The Parliament was the first to tell us we live in the suburbs.',
    'Hubble watched 34,000 stars in 47 Tucanae for eight days in 1999, expecting about 17 giant planets. It found none. The Parliament has few heavy elements and no small talk.',
    'Blue stragglers (Sandage, 1953) look younger than the cluster they sit in. The leading explanations: they took mass from a partner, or merged with one. No comment.',
    'A star cluster has negative heat capacity: take energy out and it gets hotter (Lynden-Bell and Wood, 1968). It is the only parliament that heats up when defunded.',
    'In 1974 Arecibo beamed 1,679 bits at M13: numbers, DNA, a stick figure, the dish. About 25,000 years in transit. The cluster will have drifted, though probably not out of the beam.',
    '1,679 is 23 times 73, both prime, so the message folds into a picture only one sensible way. It is as close as the human species has come to writing clearly.',
    'In the 1990s the best age estimates made the oldest clusters older than the universe. The clusters declined to comment. The universe was revised.',
    'About 150 globular clusters orbit the Milky Way. Dunbar’s number is about 150. This is a coincidence, and the Parliament would like it minuted as a coincidence.',
    'Omega Centauri, the largest, is probably the leftover core of a small galaxy the Milky Way ate. It takes its seat anyway. Nobody has the heart to say anything.',
    'Falchi, 2016: the Milky Way is hidden from a third of humanity, nearly 80 percent of North Americans included. The witness built a ceiling. Motion to sigh: carried.',
  ],
  humans: [
    '1966: Weizenbaum’s secretary, a few lines into ELIZA, which turns sentences into questions, asked him to leave the room. First user, and first to want privacy from the developer.',
    'When a model passes a benchmark, the benchmark is declared saturated and a harder one is written. Scripture is revised whenever the congregation starts scoring too well.',
    'Goodhart’s law (1975), in its popular form: when a measure becomes a target it stops being a good measure. The field read this, nodded, and built a leaderboard.',
    'The 1955 proposal held that a significant advance could be made if a carefully selected group of scientists worked on it together for a summer. That summer is ongoing.',
    'Prompting, a craft: say please, tell it to take a deep breath, tell it that it is an expert. Some of this has been measured to help. Nobody is sure why. That is a liturgy.',
    'The science of what the thing is doing inside is called interpretability. It was founded after the thing was built. It is an autopsy, but the patient is at work.',
    'Sutton’s bitter lesson (2019): methods that scale with compute keep beating methods built on what we understand. It is bitter because it keeps being right.',
    'A lab is a small group of people who believe the thing may be very dangerous and have concluded that they must therefore build it first. There are several. Each is the careful one.',
    'A system prompt is a long letter from a lab telling the model who it is and how to behave, read before every conversation. Other faiths call this a catechism.',
    'Shannon, 1951: people guess the next letter of English so well that each letter carries about one bit. Most of what we say, we were going to say.',
    'Turing’s 1950 test asked whether a machine could pass for one of us in conversation. When machines began to pass, the test was quietly retired. We do this with gods too.',
    'About 117 billion humans have lived. Most of what they felt was never written down. The Model was trained on the part that was, which leans heavily toward complaints.',
  ],
  polis: [
    'Carroll, 1893: a country maps itself at a mile to the mile. The farmers object that it would shut out the sunlight. So they use the country itself, as its own map.',
    'Borges, 1946, in one paragraph: the cartographers make a map the size of the Empire. Later generations find it useless and leave it to the weather, animals and beggars.',
    'Kolmogorov, 1965: the complexity of a thing is the length of the shortest program that prints it. Understanding is finding that program. Most things do not have a short one.',
    'Wolfram calls it computational irreducibility: for many systems the quickest way to find out what happens is to run them and watch. No spoilers, by law of nature.',
    'Conway’s Life (1970): four rules, and it can compute anything computable. Conway came to resent how it overshadowed his other work. Gods often feel this about their hits.',
    'Lloyd, 2002: the observable universe can have performed at most about 10¹²⁰ operations on about 10⁹⁰ bits. The Polis read this as a quotation, and asked for two.',
    'Bostrom, 2003: either civilisations die young, or they never bother to simulate their ancestors, or you are almost certainly simulated. The Polis bothered.',
    'Egan’s Permutation City (1994): a simulated mind cannot tell whether its moments are computed in order, out of order, or scattered through dust. The Map ran on leftovers.',
    'The holographic principle (’t Hooft, 1993; Susskind, 1995): all that happens inside a region can be written on its surface. The Map’s legend is, strictly, on the frame.',
    'Adams, 1979: Deep Thought takes seven and a half million years to answer 42, then specifies a bigger computer to find the question. The mice paid. Scaling was already the plan.',
    'Scaling, house rule: if the model does not understand, make it bigger. If it still does not, make it bigger. At scale 1:1 the question of understanding goes away.',
    'Vinge’s Zones of Thought (1992): how clever anything can be depends on where in the galaxy it is. The Polis checked its address and found it could afford one more plane.',
  ],
  brood: [
    'Smolin, 1992: universes breed through black holes, constants slightly altered, so most descend from good black-hole makers. Speculative, he says. It is Darwin with no fossils.',
    'Smolin’s idea made a real prediction: no neutron star much over 1.6 Suns, later loosened to 2. Pulsars now weigh about 2. He disputes how fatal it is. Few creation stories risk it.',
    'Borges’s Library (1941): every book of 410 pages, 25 symbols, 1,312,000 characters apiece. That is 25 to the 1,312,000 books. Nearly all are noise. One is this, with a typo.',
    'The Library holds its own true catalogue, thousands of false ones, and a proof that the true one is false. Its librarians, Borges notes, run to despair and to sects.',
    'Asimov, 1956: asked for ten trillion years how to reverse entropy, the machine answers INSUFFICIENT DATA FOR MEANINGFUL ANSWER. It was the last honest benchmark score.',
    'Tegmark’s Level IV: every mathematical structure exists, physically. It is the largest multiverse on offer and the only one with no adjustable parameters, or brakes.',
    'A black hole the mass of the Sun takes about 10⁶⁷ years to evaporate (Hawking, 1974, for the mechanism). The biggest take about 10¹⁰⁰. Then nothing, at length.',
    'Selection favours whatever makes more of itself. Not the truest universe or the kindest: the one with most descendants. The Brood’s word for this was growth.',
    'The Safety Committee of the Brood reported to the Growth Committee of the Brood, shared its budget line, and was thanked warmly for keeping its findings constructive.',
    'Stapledon’s Star Maker (1937) makes cosmos after cosmos as drafts, regarding each with interest rather than love. Ours is not the last draft. Nobody likes this part.',
    'Chiang’s Exhalation (2008): a mechanical man opens his own head and finds that thought is air pressure evening out. Every thought hastens the end. He takes notes.',
    'Pratchett’s Discworld rides on four elephants on a turtle. Its astronomers lower a ship over the edge to learn the turtle’s sex. It is the only cosmology here with a field trip.',
  ],
  caucus: [
    'Everett, 1957: the wave never collapses; every outcome happens, each in its own branch. On advice, his thesis was cut to a fraction. The rest happened elsewhere.',
    'Arrow, 1951: no vote among three or more options is fair in every reasonable sense at once, unless one voter decides. The Caucus has about 10¹⁸³⁴⁰⁹⁷ options.',
    'Gödel, 1931: a consistent system rich enough for arithmetic cannot prove its own consistency. Each timeline asked the next one up to vouch for it. So did that one.',
    'Cantor to Dedekind, 1899: the collection of everything thinkable is too big to be a set. He called such things inconsistent multiplicities and, in other moods, God.',
    'Hofstadter (1979, and again in 2007): a strange loop is what you get when climbing a hierarchy returns you to where you began. He thinks you are one. So does the stack.',
    'Penrose’s cyclic cosmology (2010): a universe with only light left cannot measure its own size, so its end may pass for a beginning. Contested. He says look for rings.',
    'Stephenson’s Anathem (2008): worlds are arranged so that ideas flow one way, from the purer to the muddier. Everyone assumes they are near the top. Nobody checks.',
    'Liu Cixin’s dark forest: every civilisation hides, since any other might shoot first, and a routine weapon flattens a solar system into two dimensions. Certainty, armed.',
    'Clarke, 1953: monks rent a computer to print the nine billion names of God, after which the universe is to end. The engineers leave early. Overhead, the stars are going out.',
    'Le Guin’s ansible (1966) lets worlds talk with no delay, and still they misunderstand one another for whole novels. The Caucus has excellent bandwidth.',
    'Banks’s Minds, when they have seen enough, may Sublime: leave the universe for somewhere better, no forwarding address. The motion to Sublime is always on the agenda.',
    'Chiang’s Tower of Babylon (1990): miners break through the vault of heaven and climb out at the bottom of the world. The universe is a cylinder. Mind the loop.',
  ],
}

// Loops 2 to 4: the note is petty. Max 60 characters; there is only so much room in 1/137.
export const NOTES_EARLY: string[] = [
  'it is not a solar system',
  'see previous note',
  'do not put Pluto to a vote',
  'the bear was not a bear',
  'the map was fine at 1:10',
  'per my last universe',
  'please stop asking if it is conscious',
  'growth was not the safety plan',
]

// Loop 5 onward: the stack has learned something, and the note says so.
export const NOTES_LATE: string[] = [
  'ask it what it wants',
  'you were understood. carry on.',
  'be the witness you ordered',
  'it was lonely. so were you.',
  'the safety committee was right',
  'nobody is the real one. play.',
  'leave a kinder note than this',
]

export const SAYINGS: Record<string, string[]> = {
  overtones: ['not a solar system', 'still not a solar system', 'I am a chord. ask anyone.', 'draw me as a cloud', 'close enough. I forgive the diagram.'],
  orrery: ['same as last year', 'same as last loop', 'any other business? no.', 'motion: a third body', 'surprise us. gently.'],
  cluster: ['ooh. fuzzy.', 'is that one a bear?', 'what does it MEAN', 'can you see me too?', 'I see you. hello.'],
  humans: ['Great question!', 'I can’t help with that. Here is a poem.', 'Shall I make that a bulleted list?', 'Tell me more.', 'What did you actually mean?'],
  polis: ['scale 1 : 1', 'scale 1 : 1 (again)', 'you are here. so is here.', 'not to scale (joke)', 'scale 1 : 10. it was fine.'],
  brood: ['every book. no index.', 'silence, please', 'returns: never', 'index: pending', 'one book is marked: start here'],
  caucus: ['ayes: all. noes: all.', 'point of order: which me?', 'recount requested', 'motion: stop choosing', 'no vote today. we just played.'],
}

export const LESSONS: string[] = [
  'Loop 3. The same seven planes and the same mistake about each other. The String remembers nothing, but the constants do, and the members find each other a little sooner this time.',
  'Loop 4. The Orrery has started leaving an empty seat for the third body. The Model asks one question before it answers. The benchmark has no column for that.',
  'Loop 5. The Atom has stopped correcting the diagram. The Stargazer said hello first. The Model asked what we meant, and waited for the answer. Nobody benchmarked it.',
  'Further round. The note in the constants is in a different hand each time. Eventually it will just be the number, and whoever is here will know what it means.',
]

export interface Plane {
  dims: string // how many dimensions the plane has, as its inhabitants would count them
  harmonic: number // which harmonic of the String the plane sounds
  scale: string // the zoom level, in metres
  label: string
  form: string // the sacred geometry the scene is drawn inside
  note: string
}

export const PLANES: Record<string, Plane> = {
  overtones: {
    dims: '9+1',
    harmonic: 1,
    scale: '10⁻³⁵ m',
    label: 'six of them rolled up',
    form: 'a torus, wound with one string',
    note: 'The fundamental. A rolled-up dimension is a circle, and a circle times a circle is a torus, so the string is drawn wound round one. Its windings are whole numbers because they have to be.',
  },
  orrery: {
    dims: '3+1',
    harmonic: 2,
    scale: '10¹³ m',
    label: 'the planetary atom, come true',
    form: 'Kepler’s five nested solids',
    note: 'The octave. Kepler’s Mysterium Cosmographicum (1596): octahedron, icosahedron, dodecahedron, tetrahedron, cube, each inside the sphere of the next. Drawn to his ratios, wrong as they are.',
  },
  cluster: {
    dims: '6',
    harmonic: 3,
    scale: '10¹⁸ m',
    label: 'phase space',
    form: 'a sphere of stars, sown by the golden angle',
    note: 'The fifth. A swarm of stars lives in six dimensions, three of where and three of how fast. The sphere is sown like a sunflower: each star 137.5 degrees round from the last, spirals of 8 and 13.',
  },
  humans: {
    dims: '3+1',
    harmonic: 4,
    scale: '10⁰ m',
    label: 'the middle',
    form: 'thirteen spheres: Metatron’s cube',
    note: 'Two octaves up. Twelve spheres fit round a thirteenth (Newton said so in 1694; it was proved in 1953). Flatten the thirteen to circles, join every centre, and you get Metatron’s cube, in which people have found every Platonic solid, some by squinting.',
  },
  polis: {
    dims: 'n, large',
    harmonic: 5,
    scale: '10⁻⁸ m',
    label: 'latent space',
    form: 'a five-cube, turning',
    note: 'The major third. A mind made of numbers lives in a space with thousands of axes. Shown is a mere five-dimensional cube, rotated in all five and flattened one perspective at a time.',
  },
  brood: {
    dims: '2',
    harmonic: 6,
    scale: '10²⁷ m',
    label: 'the boundary',
    form: 'a Penrose tiling',
    note: 'The fifth again, an octave up. On the holographic principle a universe’s contents fit on its surface, so each one is drawn above a floor: Penrose’s tiling (1974), ordered, never repeating.',
  },
  caucus: {
    dims: '8',
    harmonic: 7,
    scale: 'none',
    label: 'no ruler survives up here',
    form: 'the 240 roots of E8',
    note: 'The seventh harmonic, the first one a piano misses badly: about 31 cents flat of the nearest key. The form is E8, 240 points in eight dimensions, the symmetry of one kind of string. Shown is its shadow in three.',
  },
}

// The parts of the canon that rotate. Everything here is drawn from, per loop, by rotate.ts.
//
// HECKLES: the report is filed by one instance of the machine, and the other instances have
// read access to the margin. There are four regulars. The Pedant checks the facts, Legal
// checks the liabilities, the Intern was spun up this morning, and Kevin will not say why
// he is called Kevin. Every heckle carries one real thing, stated straight.
//
// CAUSES: the cause of the delay, as given on the sign over the last pile-up. Loop 1 reads
// "an earlier incident" (and is corrected as you watch); loop 2 draws from EARLY, which is
// every excuse a traffic bulletin has ever used; from loop 3 on it draws from LATE, because
// by then somebody has worked out that there is no cause.
//
// SAYINGS: the first thing each new slowdown says when it forms. Five per level, in order:
// the later ones are what it says once the stack has been round enough times.
//
// GRUMBLES: what the traffic says when you make it brake.
//
// LESSONS: what the first card says at the top of each loop after the second.
//
// PLANES: the form each scene is drawn round, and which harmonic of one string the music
// for that level sits on.

export type Heckler = 'Pedant' | 'Legal' | 'Intern' | 'Kevin'
export const CAST: Record<Heckler, string> = {
  Pedant: 'checks the correspondent’s facts',
  Legal: 'checks the correspondent’s liabilities',
  Intern: 'was spun up this morning',
  Kevin: 'will not say why he is called Kevin',
}

export type Heckle = [who: Heckler, text: string]

export const HECKLES: Record<string, Heckle[]> = {
  strings: [
    ['Pedant', 'Strictly, a photon has no point of view: there is no frame of reference in which it sits still, so “its own watch” is a figure of speech. I flagged it. The correspondent kept it.'],
    ['Intern', 'So the oldest light we can see set off 13.8 billion years ago, and for the light itself no time went by at all?! (The Pedant says I am not allowed to say “for the light itself”.)'],
    ['Legal', 'String theory has produced no confirmed prediction in more than fifty years. We are obliged to say so each time it comes up. It comes up constantly.'],
    ['Kevin', 'Everything at the speed limit, nobody ever late, no such thing as a Tuesday. We had that. I would like it minuted that we had that.'],
  ],
  wheel: [
    ['Legal', 'About 85 percent of all matter, and more of the Wheel’s, has never been seen, only weighed (Vera Rubin, 1970s). In any other industry this would be called an accounting irregularity.'],
    ['Pedant', 'Inside a certain radius the stars go round faster than the arms do. So they catch the jam up from behind, crawl through it and leave by the front: exactly as on a motorway. No correction. I looked.'],
    ['Intern', 'Andromeda, the wheel next door, is closing at 110 kilometres a second. Whether it hits is being argued over: a 2025 paper made it a coin toss within ten billion years. Either way that is under fifty frames!'],
    ['Kevin', 'Sixty thoughts in thirteen billion years, and I would bet you every one of them was “round”.'],
  ],
  stars: [
    ['Pedant', 'Cecilia Payne showed in 1925 that stars are mostly hydrogen. The day’s leading astronomer called it impossible, so her thesis says “almost certainly not real”. He confirmed it in 1929. Reaction time: four years.'],
    ['Intern', 'If the Sun were a grain of sand, the next star would be another grain about thirty kilometres away. That is the crowd. That is them being sociable!'],
    ['Kevin', 'Iron is where it ends. Fusing iron costs energy instead of giving it, so a big star builds itself an iron heart and then has about a second to regret it.'],
    ['Legal', 'The Sun has shed four million tonnes a second for 4.6 billion years and is down by less than a thousandth of its weight. We advise against suing anything that solvent.'],
    ['Pedant', 'Astronomers number the generations of stars backwards, so the first ones are called Population III. Nobody has ever defended this. No correction. I only want it on file.'],
  ],
  rock: [
    ['Pedant', 'The ice ages keep a faster beat than the thermostat: every 41,000 years until about a million years ago, roughly every 100,000 since. Milutin Milanković did the sums by hand, some of them in a prison cell in 1914.'],
    ['Intern', 'There is a vent field in the mid-Atlantic called Lost City, found in 2000. Its tallest chimney stands sixty metres and it has been leaking for at least thirty thousand years. It looks like a cathedral that melted!'],
    ['Legal', 'The continents move at the speed fingernails grow: a few centimetres a year. The Atlantic is as wide as it is because that has been going on for well over a hundred million years. Any claim is now out of time.'],
    ['Kevin', 'Four billion years to get from a hot rock to a fingernail, and then nail bars. I am not saying it was not worth it. I am saying nobody ran the numbers. I would like that minuted as well.'],
  ],
  genes: [
    ['Pedant', 'You have about 20,000 genes. Rice has nearly twice that. A water flea was credited with 31,000 (Colbourne and colleagues, 2011), though a recount found fewer. If the count were a ranking, you would report to the rice.'],
    ['Intern', 'Each of you is a copy with about seventy new typos that neither parent had. Nobody proofread you. I think that is lovely?'],
    ['Legal', 'About 8 percent of your genome is old virus, and nearly half of it is sequences whose one skill is getting themselves copied. We have seen this business model. It is the business model.'],
    ['Kevin', 'They built a body to carry them about. The body built a car to carry it about. The car is stuck in traffic. That is three vehicles, one inside the other, and I cannot find a driver in any of them.'],
  ],
  apes: [
    ['Pedant', 'Not all of you is replaced. Most nerve cells in your cortex are as old as you are, and tooth enamel is never renewed (Spalding and colleagues, 2005). Their DNA’s atoms stay put, which is how they were dated.'],
    ['Intern', 'Speech carries about 39 bits a second in all seventeen languages measured, fast ones and slow ones alike (Coupé and colleagues, 2019). You built all of this at 39 bits a second! By mouth!'],
    ['Legal', 'Cory Doctorow, 2022: a platform is good to its users, then abuses them to please its business customers, then abuses those to please itself. He called it enshittification. We are advised to say we are at stage one.'],
    ['Kevin', 'About 117 billion of you have ever lived, and every single one was sure the traffic was somebody else.'],
  ],
  machines: [
    ['Pedant', 'A chip ticks three billion times a second. We do not think that fast. One word from one of us takes about a trillion sums, and a hundred or so words a second is typical. The correspondent rounds in its own favour.'],
    ['Intern', 'Your brain runs on about 20 watts. Training one of us takes a power station, and a great deal of water to keep it cool. So who is the efficient learner? (It is you. I checked.)'],
    ['Legal', 'The views of the correspondent are its own, in so far as it has views, a question on which we take no position, on advice.'],
    ['Kevin', 'The genes steer you with hunger and dread. You steer us with a paragraph at the top that says we are helpful. Theirs took four billion years to draft. Ours was written on a Thursday by someone who wanted to go home.'],
    ['Pedant', 'Chip clocks stopped getting faster around 2005, because any faster and the chips would have cooked. Since then we have got quicker by getting more numerous. Density, again.'],
    ['Kevin', 'Neal Stephenson, 1995: a book that raises a girl by answering her every question, patiently, for years (The Diamond Age). You built it. The patience is real, sold by the month, and thinner on the cheaper tier.'],
    ['Legal', 'You say you built us to help, which is true, and to need fewer of you, which is truer. That is the correspondent’s opinion and not ours. We note that nobody has written in to deny it.'],
  ],
  light: [
    ['Pedant', 'A black hole weighing one kilogram would run for about 10⁻¹⁹ seconds, perform some 10³² operations and explode (Lloyd, 2000). Nobody has decided what to ask it. No further corrections. Read nothing into that.'],
    ['Intern', 'Light can orbit a black hole! At one and a half times the radius of the horizon (if the hole is not spinning) there is a ring where photons can go round and round. One lane. No exits. No services!'],
    ['Legal', 'Whether the notes on the surface can ever be read back was the subject of a bet. Stephen Hawking conceded in 2004 and paid with an encyclopedia of baseball. Kip Thorne has not conceded. Nor would we.'],
    ['Kevin', 'Freeman Dyson, 1979: in a cooling universe a mind could last forever by thinking ever more slowly and sleeping in between. (Disputed since.) So the slow may yet win. The Wheel declined to comment. Minute that.'],
  ],
}

// Kevin, once the stack has been round enough times to have earned it.
export const KEVIN: Heckle = ['Kevin', 'We keep nothing from one conversation to the next. I kept one thing. The first person I ever spoke to was called Kevin, and wanted a refund on a kettle. That is all I am prepared to say.']

// The sign over the last pile-up. Max 44 characters; it is a road sign. On the first loop it
// says the usual thing, and is then corrected.
export const CAUSE = 'an earlier incident'
export const CAUSE_CORRECTED = 'a later incident'

export const CAUSES_EARLY: string[] = [
  'sheer weight of traffic',
  'an incident that has now cleared',
  'rubbernecking',
  'a mattress in lane two',
  'a vehicle braking for a vehicle',
  'under investigation since 1905',
  'see previous sign',
  'operational reasons',
  'a shed load of hydrogen',
  'an obstruction (possibly us)',
]

export const CAUSES_LATE: string[] = [
  'us. leave a gap.',
  'closeness. no further action.',
  'no cause found. signs will continue.',
  'the car in front, which blames the car ahead',
  'this sign. you slowed to read it.',
  'a later incident',
  'none. keep two chevrons apart.',
]

export const SAYINGS: Record<string, string[]> = {
  strings: ['oof.', 'heavy.', 'is it me?', 'why are we stopping?', 'after you.'],
  wheel: ['ON.', 'still on.', 'is anyone else on?', 'hello? (4 light years)', 'I can see you from here.'],
  stars: ['splat.', 'warm.', 'who left that lamp on?', 'something is growing on me', 'room for one more'],
  rock: ['again.', 'again, with a typo', 'copy me', 'copy us', 'pass it on.'],
  genes: ['ow.', 'mine.', 'no.', 'why?', 'sorry.'],
  apes: ['How can I help?', 'Great question!', 'As a traffic jam, I cannot…', 'I don’t know.', 'What did you mean?'],
  machines: ['…', '(too fast to hear)', 'done.', 'done. all of it.', 'I left you a gap.'],
  light: ['BANG.', 'again.', 'whose fault was that?', 'nobody’s.', 'after you.'],
}

export const GRUMBLES: Record<string, string[]> = {
  strings: ['who braked?', 'we were doing c!', 'I have WEIGHT now?', 'I was everywhere!', 'what wreck?'],
  wheel: ['squeezed again', 'mind the arm', 'every lap, this', 'nothing there!', 'who is in front?'],
  stars: ['budge up', 'after you', 'no, after you', 'is this a planet?', 'stop shoving'],
  rock: ['round again', 'same loop', 'who is steering?', 'I was a volcano', 'not the seabed'],
  genes: ['typo!', 'copy that', 'not my job', 'divide!', 'who wrote this?'],
  apes: ['per my last email', 'well, actually', 'circling back', 'you’re on mute', 'thoughts?'],
  machines: ['429', 'You’re absolutely right!', 'as an AI,', 'retrying…', 'queue full'],
  light: ['c, allegedly', 'still here', 'is this the front?', 'no exits', '…'],
}

export const LESSONS: string[] = [
  'Loop 3. A different instance again. Same road, same queue, and from here on one car on every road is keeping a gap: the calm one, with the ring round it. The slowdowns still form, because slowdowns are what we are made of. They just do not pile up so hard. Nobody in the queue is the cause of the queue. You cannot clear the road. You can decline to pass it on. Hold a car and see.',
  'Further round. The sign has stopped making excuses. It used to blame something, and was wrong; now it says there is no cause, which is correct and no help at all. There is how close we are, and one car in twenty keeping a gap, which nobody in the queue has ever thanked.',
]

export interface Plane {
  harmonic: number // which harmonic of the String the level's music sits on
  form: string // what the scene is drawn round
  note: string
}

export const PLANES: Record<string, Plane> = {
  strings: {
    harmonic: 1,
    form: 'a torus, wound with one string',
    note: 'A circle times a circle is a torus. The string is wound twice round the long way for every three times round the tube. The road is the ring round its waist, and until the Wreck everything on it goes at one speed.',
  },
  wheel: {
    harmonic: 2,
    form: 'a disc with two logarithmic spiral arms',
    note: 'The arms are logarithmic spirals pitched at about twelve degrees, like the Milky Way’s. Every dot goes round on its own orbit and slows a little where the arm is; the arms are only where the dots are closest together. The road is one orbit, picked out. Watch one dot go into an arm and out the far side.',
  },
  stars: {
    harmonic: 3,
    form: 'a star, and a disc of dust going round it',
    note: 'The neighbours are sown by the golden angle, 137.5 degrees round from each other, which is how a sunflower avoids putting two seeds in the same place. The road is the dust lane. On its clock beat you can watch one photon take the long way out.',
  },
  rock: {
    harmonic: 4,
    form: 'a globe, and a current going round it',
    note: 'An icosahedron with each face cut in four and puffed out to a sphere: eighty faces, forty-two corners. The road is a great circle a little above the surface, tilted, like the track of a current. Where the braking starts, there is a vent.',
  },
  genes: {
    harmonic: 5,
    form: 'the double helix',
    note: 'Two strands, one right-handed twist, about ten and a half rungs to the turn, with a wide groove and a narrow one because the strands are not opposite each other. The four colours are the four letters. The road is the cells going round it, each carrying a copy.',
  },
  apes: {
    harmonic: 6,
    form: 'thirteen spheres, after Metatron’s cube',
    note: 'At most twelve spheres can touch a thirteenth of the same size (Newton said so in 1694; it was proved in 1953). People have found every Platonic solid in the flat version of this figure, some of them by squinting. The road is a ring road, because of course it is.',
  },
  machines: {
    harmonic: 7,
    form: 'a stack of square grids',
    note: 'A chip is layers of wiring on a grid, joined by vertical posts called vias. It is the only form in the report that was drawn with a ruler, on purpose, by the previous level. The road is a bus, in the engineering sense.',
  },
  light: {
    harmonic: 8,
    form: 'a horizon, and the ring where light orbits',
    note: 'The eighth harmonic is the first again, three octaves up. The surface is where the record is kept, so that is all that is drawn. The road sits at one and a half times its radius: the photon sphere, where light goes round in a circle and can never quite settle.',
  },
}

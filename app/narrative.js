'use strict';
/* MAIN STAGE OR BUST — offline narrative engine. Flavor ONLY: never touches game state.
   All functions are pure (input -> strings). Pass a seeded rng for determinism. */
function narPick(rng, arr) { return arr[Math.floor((rng || Math.random)() * arr.length) % arr.length]; }

const GENRES = ['pop-punk', 'hardcore', 'ska', 'emo', 'metalcore', 'indie rock'];
const HOMETOWNS = ['Asbury Park', 'Gainesville', 'Riverside', 'Tacoma', 'Lowell', 'Tempe', 'Richmond', 'Iowa City'];
const VAN_NAMES = ['The Mold Mobile', 'Sir Vansalot', 'Bertha', 'The Sardine Can', 'Moldy Goldie', 'The Practice Space'];
const FAN_NAMES = { 'pop-punk': 'parking-lot kids', hardcore: 'pile-on crew', ska: 'rude boys & girls', emo: 'crying-in-the-car club', metalcore: 'windmill squad', 'indie rock': 'tote-bag contingent' };

function fanName(side) { return (FAN_NAMES[(side.flavor || {}).genre] || 'crowd'); }
const HOME_FLAVOR_IDS = ['coffee', 'vfw', 'house', 'laundry', 'pizza'];
function homeVenueName(venue, side) {
  const town = side && side.flavor && side.flavor.hometown;
  if (town && HOME_FLAVOR_IDS.includes(venue.id)) return town + ' ' + venue.name;
  return venue.name;
}
function bandTag(side) {
  const f = side.flavor || {};
  return `${side.name}${f.genre ? ` (${f.genre} from ${f.hometown || 'nowhere'})` : ''}`;
}

function weekIntro(game, side, rng) {
  const w = game.week, r = rng || Math.random;
  if (w === 1) return narPick(r, [
    `${side.name} load borrowed gear into ${vanName(side)} and point it at the highway. Twelve weeks. No plan B.`,
    `First week. The set is shaky, the van smells, and somehow that feels exactly right.`,
  ]);
  if (w === 12) return `Last week of the season. Whatever happens tonight goes in the ${vanName(side)} log forever.`;
  if (side.morale <= 1) return `Morale is in the ditch. The band is communicating exclusively in gas-station snacks.`;
  if (side.van <= 2) return `${vanName(side)} is making a noise nobody wants to name. The mechanic's number is on the fridge of everyone's mind.`;
  if (side.cash < 5) return `The band fund is $${side.cash}. Dinner tonight is whatever the green room pretends is food.`;
  if (side.fame >= 45) return `Word travels fast. Strangers are showing up wearing YOUR shirt. This is really happening.`;
  if (side.fame >= 26) return `Regional buzz is real — promoters have started spelling the band name right.`;
  if (side.fame >= 12) return `The local scene knows the name now. Time to act like it.`;
  return narPick(r, [
    `Week ${w}. Strings changed, lies told about bedtimes, ${vanName(side)} rolls on.`,
    `Week ${w}. Someone's cousin promised to come tonight. They won't. Play like they did.`,
    `Week ${w}. The setlist has opinions now. So does the drummer.`,
  ]);
}
function vanName(side) { return ((side.flavor || {}).van) || 'the van'; }

function offerFlavor(venueId, rng) {
  const T = {
    coffee: ['The espresso machine is louder than the PA. Intimate. Loud milk.', 'Daytime crowd, nighttime dreams. The tip jar believes in you.'],
    vfw: ['Folding chairs, cheap beer, a disco ball with seniority. Classic.', 'The bartender has seen everything and is mildly impressed.'],
    house: ['The floor will bounce. The neighbors have been warned (they have not).', 'Forty kids, one bathroom, zero regrets.'],
    record: ['Play between the racks. Vinyl doesn\'t lie — bring the good set.', 'Crate-diggers judge silently. Convert them.'],
    dive: ['Sticky floors, loud regulars, a sound guy named Brick. Earn it.', 'The jukebox goes quiet when you start. That\'s respect.'],
    college: ['The station streams to dozens. DOZENS. The DJ will mispronounce everything lovingly.', 'Campus crowd: half curious, half lost, all filmable.'],
    rock: ['Real green room. Real rider (potato chips). Don\'t touch the headliner\'s hummus.', 'The room that makes bands. Or breaks drumsticks. Both, usually.'],
    fest: ['Side stage, main-stage dreams. Play like the overflow crowd is the whole world.', 'Festival dust, borrowed shade, a thousand potential new fans walking past RIGHT NOW.'],
    laundry: ['Warm dryers, cold folding tables, surprisingly honest reverb.', 'The regulars applaud between cycles. A captive, lint-rolled crowd.'],
    pizza: ['Play by the ovens. The cheese pulls when you hit the chorus.', 'Kids on benches, parents on phones, everybody fed.'],
    bowling: ['Between the lanes and the league. Roll strikes between songs.', 'Shoe-spray scent, pin-crash applause. Weirdly perfect.'],
    community: ['The quad at golden hour. Flyers on every corkboard.', 'Half the crowd is studying you. The other half is studying.'],
    drivein: ['Headlights for house lights. Honk twice for an encore.', 'A field of windshields, all pointed at you.'],
    fair: ['Between the Ferris wheel and the fried dough. Biggest small room yet.', 'The midway goes quiet for your set. Then it screams.'],
    home: ['Your people. The room that taught you the words.', 'No pretense, no entry fee, just the home crowd singing along.'],
    warped: ['The main stage. The sun, the dust, the sea of wristbands. Everything you drove 10,000 miles for is on the other side of this set.', 'This is the one they\'ll ask about forever. Tune up. Breathe. Go.'],
  };
  return narPick(rng, T[venueId] || ['A room. A crowd. A chance.']);
}

function showFlavor(rec, venue, side, rng) {
  const r = rng || Math.random, margin = rec.show - rec.D, fans = fanName(side);
  if (rec.result === 'win' && margin >= 5) return narPick(r, [
    `Absolute demolition. The ${fans} carry the chorus back at the band, louder than the monitors.`,
    `People climbed on people. Security gave up and started nodding along.`,
  ]);
  if (rec.result === 'win') return narPick(r, [
    `Tight set, big finish — the ${fans} leave hoarse and converted.`,
    `Encore chants before the last song even ends. That's how you know.`,
    `${venue.name} just became a stronghold. New faces mouth the words by verse two.`,
  ]);
  if (margin >= -2) return narPick(r, [
    `So close. One flat chorus, one broken string — the room almost tipped and didn't.`,
    `A good band has a bad night in front of good people. The ${fans} stay kind about it.`,
  ]);
  return narPick(r, [
    `Trainwreck. Wrong city energy, forgotten lyrics, a cymbal in the pizza. The ${fans} pretend it was avant-garde.`,
    `Some nights the highway wins. Forgotten intro, feedback storm, early curfew — shake it off by morning.`,
  ]);
}

function workFlavor(action, die, res, side, rng) {
  const r = rng || Math.random;
  if (action === 'merch') {
    if (res.cash >= 8) return narPick(r, ['Merch table mobbed — sharpie runs dry.', 'Someone buys three shirts. "One for my brother\'s band. They suck."']);
    if (res.cash <= 0) return `Nobody stops. The shirts fold themselves, judgmentally.`;
    return narPick(r, ['Steady trickle at the table. Every shirt is a billboard.', 'A kid counts crumpled dollars for a sticker. Core memory unlocked.']);
  }
  if (action === 'flyer') {
    if (die >= 5) return `Wheat-pasting at midnight. By morning the whole block knows the name.`;
    if (die >= 4) return `Flyers on every windshield. The scene stirs.`;
    return `Flyers handed to people who immediately look for a trash can. Punk rock.`;
  }
  if (die === 6) return `Cash-in-hand day job AND ${vanName(side)} gets some love. The hustle sustains the dream.`;
  if (die >= 4) return narPick(r, ['Somebody\'s uncle pays cash for loading a truck. Tour fund grows.', 'Day-job dollars, laundered into rock and roll.']);
  return `A few bucks for gas-station coffee. It all counts. It all counts.`;
}

function songFlavor(n, rng) {
  const titles = ['"Gas Station Roses"', '"Van Ghost"', '"Encore for Nobody"', '"Merch Table Blues"', '"Soundcheck Heart"', '"Exit 12"', '"Feedback Hymn"', '"Basement Forever"'];
  const t = titles[(n - 1) % titles.length];
  return narPick(rng, [`New song finished: ${t}. The set gets sharper.`, `${t} is born in the back seat at 2am. Instant classic (to the band).`]);
}
function albumFlavor() { return `ALBUM DONE — four songs, one story. The crowd can finally hold something that holds you back. +1 show hype forever.`; }
function anthemFlavor(rng) { return narPick(rng, ['ANTHEM! Four of a kind — the kind of moment songs get written about. +5 fans, +3 fame.', 'LIGHTNING. The room will tell this story wrong for years. +5 fans, +3 fame.']); }
function roadFlavor(roll, avoided, side, rng) {
  const r = rng || Math.random, v = vanName(side);
  const T = {
    1: avoided ? `${v} coughs blood. $8 later, she purrs. Mechanics are angels with invoices.` : `${v} dies singing on the shoulder. Two hours, four blisters, −2 van. The show goes on anyway.`,
    2: `Storm the whole state line. The hype got rained on (−2), but the band harmonized with thunder.`,
    3: `Rest-stop encounter: a caravan of fans heading the same way. +3 fans, instant caravan.`,
    4: `Someone at the truck stop buys the whole life story AND six shirts. +$6. America.`,
    5: `College paper runs a photo: "LOCAL BAND ACTUALLY GOOD?" +2 fame. Mom frames it.`,
    6: `Perfect miles. Windows down, new song on repeat, nobody fights. Found $3 in the seat cracks. +1 morale.`,
  };
  return T[roll] || narPick(r, [`${v} hums along. The white lines keep time.`]);
}
function hireFlavor(what, rng) {
  return { roadie: 'Roadie hired. Gear moves like magic; the van fears them.', tech: 'Guitar tech hired. Every chord rings like it means it (+1 show).', manager: 'Manager hired. They smell like opportunity and own a gold pen. Gold die unlocked.' }[what];
}
function flyerCopy(rec, venue, side, rng) {
  const r = rng || Math.random, win = rec.result === 'win';
  const headline = win
    ? narPick(r, [`${side.name.toUpperCase()} DESTROY ${venue.name.toUpperCase()}`, `SOLD-OUT ENERGY IN A HALF-FULL ROOM`, `THE NIGHT ${side.name.toUpperCase()} ARRIVED`, `ENCORE! ENCORE! (${venue.name})`])
    : narPick(r, [`${side.name.toUpperCase()} SURVIVE ${venue.name.toUpperCase()}`, `ROUGH NIGHT. LOUDER TOMORROW.`, `THE HIGHWAY FIGHTS BACK`, `OFF NIGHT, ON RECORD`]);
  const blurb = showFlavor(rec, venue, side, r);
  return { headline, blurb };
}
function stateWarnings(side) {
  const w = [];
  if (side.morale <= 1) w.push('Morale critical — a fail means forced rest.');
  else if (side.morale <= 2) w.push('Morale shaky.');
  if (side.van <= 2) w.push(`${vanName(side)} barely runs — breakdown risk.`);
  if (side.cash < venueEntryFloor()) w.push('Band fund nearly dry — day jobs beckon.');
  if (side.songs === 3 || side.songs === 7) w.push('One song from an album.');
  if (side.fame >= 40) w.push('The main stage is watching.');
  return w;
}
function venueEntryFloor() { return 6; }
function pressQuote(side, rank, rng) {
  return narPick(rng, [
    `"${side.name} are the best argument for quitting your job." — Basement Zine`,
    `"I saw them in a room that smelled like mop water. I'd do it again." — Campus Radio`,
    `"${side.name} played like the rent was due. It was." — Tour Diary Press`,
  ]) + ` Final rank: ${rank}.`;
}
function rivalFlavor(rival, rec, venue, rng) {
  return rec.result === 'win'
    ? narPick(rng, [`The Stagedivers post a smug van selfie from ${venue.name}.`, `Word is the Stagedivers killed at ${venue.name}. Of course they did.`])
    : `The Stagedivers eat it at ${venue.name}. You allow yourself one (1) smile.`;
}

if (typeof module !== 'undefined') {
  module.exports = { GENRES, HOMETOWNS, VAN_NAMES, fanName, bandTag, weekIntro, vanName, offerFlavor, showFlavor, workFlavor, songFlavor, albumFlavor, anthemFlavor, roadFlavor, hireFlavor, flyerCopy, stateWarnings, pressQuote, rivalFlavor, narPick };
}

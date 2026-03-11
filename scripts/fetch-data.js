// =================================================================
// scripts/fetch-data.js
// Battle of the Sexes — Sleeper data fetcher
//
// Run by GitHub Actions every Monday at 6am ET, or manually.
// Fetches ALL Sleeper data, processes it server-side, and writes
// data.json so the website just loads one tiny cached file.
//
// Usage:  node scripts/fetch-data.js
// =================================================================

const https = require('https');
const fs    = require('fs');
const path  = require('path');

// ── Rate limiting: pause between requests to be nice to Sleeper API ──
const DELAY_MS = 150;
const delay = ms => new Promise(r => setTimeout(r, ms));

// ── Fetch helper ──
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'BattleOfTheSexes/1.0' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(new Error('JSON parse error for ' + url + ': ' + e.message)); }
      });
    }).on('error', reject);
  });
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await delay(DELAY_MS);
      return await fetchJSON(url);
    } catch(e) {
      if (i === retries - 1) throw e;
      console.warn(`  Retry ${i+1}/${retries} for ${url}`);
      await delay(1000 * (i + 1));
    }
  }
}

const DIVISIONS = [
  { name: "SwiftSheeran",          leagueId: "1236740618596651008" },
  { name: "MileyBillyRay",         leagueId: "1236741564819066880" },
  { name: "BlondieTalkingHeads",   leagueId: "1236741882713735168" },
  { name: "JoplinHendrix",         leagueId: "1236742330451509248" },
  { name: "GagaMercury",           leagueId: "1236742674262798336" },
  { name: "StreisandDiamond",      leagueId: "1236742923207311360" },
  { name: "HeartAerosmith",        leagueId: "1236743120192806912" },
  { name: "NicksPetty",            leagueId: "1236743336136552448" },
  { name: "PartonRodgers",         leagueId: "1236743698981601280" },
  { name: "LauperJoel",            leagueId: "1236743761120215040" },
  { name: "MadonnaMichael",        leagueId: "1236743831139930112" },
  { name: "GibsonAstley",          leagueId: "1236743899674849280" },
  { name: "SaltNPepaPublicEnemy",  leagueId: "1236743974748704768" },
  { name: "HoleNirvana",           leagueId: "1236744028393832448" },
  { name: "SpiceGirlsBackstreetBoys", leagueId: "1236744093669801984" },
  { name: "BligeBiggie",           leagueId: "1236744275908116480" },
  { name: "SpearsTimberlake",      leagueId: "1236744357277614080" },
  { name: "TLCOutkast",            leagueId: "1236744417008680960" },
  { name: "ChristinaEminem",       leagueId: "1236744489792446464" },
  { name: "BeyonceJayZ",           leagueId: "1236744551356444672" },
  { name: "CardigansKillers",      leagueId: "1236744794126954496" },
  { name: "AdeleJohnLegend",       leagueId: "1236744866508062720" },
  { name: "UnderwoodStapleton",    leagueId: "1236744936116731904" },
  { name: "LaineyJellyRole",       leagueId: "1236745006375518208" },
  { name: "StefaniShelton",        leagueId: "1238537074777272320" },
  { name: "SimonTaylor",           leagueId: "1247030266963185664" },
  { name: "HillMcGraw",            leagueId: "1247969838534504448" },
  { name: "ClarksonLevine",        leagueId: "1248020028331139072" },
];

const USER_LOOKUP = {
  "aysolis": { display: "Amanda Solis", team: "ladies" },
  "kellyh711": { display: "Kelly Hall", team: "ladies" },
  "lauree": { display: "Lauree Foster", team: "ladies" },
  "ballersmeg": { display: "Meghan Orme", team: "ladies" },
  "mkim521": { display: "Min Kim", team: "ladies" },
  "rk23": { display: "Rhiannon Kuroda", team: "ladies" },
  "haus": { display: "Aram Hauslaib", team: "gents" },
  "footballdiehard": { display: "Bob Harris", team: "gents" },
  "commishcasey": { display: "Casey Symonds", team: "gents" },
  "borgjohn715": { display: "John Borges", team: "gents" },
  "pigbirdjetfan": { display: "Mike Miller", team: "gents" },
  "marathoner_rg": { display: "Ryan Gruhlke", team: "gents" },
  "amberalertff": { display: "Amber Phillips", team: "ladies" },
  "dmiller10nc": { display: "Destiny Miller", team: "ladies" },
  "fantasygranny": { display: "Kelly Dickerman", team: "ladies" },
  "kvalenzuela": { display: "Kendall Valenzuela", team: "ladies" },
  "shanfan": { display: "Shannon Blunt", team: "ladies" },
  "bigmama720": { display: "Tracy Hall", team: "ladies" },
  "andrewcooper": { display: "Andrew Cooper", team: "gents" },
  "andrewhallff": { display: "Andrew Hall", team: "gents" },
  "rotobuzzguy": { display: "Howard Bender", team: "gents" },
  "snokone86": { display: "James Landrum", team: "gents" },
  "5yardrushmurf": { display: "Murf", team: "gents" },
  "sincityheat": { display: "Scott Frankel", team: "gents" },
  "bethanylpeters": { display: "Bethany L Peters", team: "ladies" },
  "foxworth07": { display: "Brittney", team: "ladies" },
  "dinasty7": { display: "Diana Green", team: "ladies" },
  "laserjane": { display: "Janiecia Marshall", team: "ladies" },
  "urfootballqueen": { display: "Jodi Newsome", team: "ladies" },
  "katsourisff": { display: "Kats", team: "ladies" },
  "bestballjonesy": { display: "Adam Jones", team: "gents" },
  "tzley22": { display: "Jason Teasley", team: "gents" },
  "consultfantasy": { display: "Jason Willan", team: "gents" },
  "geekmill": { display: "Jeff Milliner", team: "gents" },
  "luckyfantasyguy": { display: "Martin Weeks", team: "gents" },
  "grubbaf": { display: "Rick Koehler", team: "gents" },
  "hokieyogi": { display: "Amanda Jones", team: "ladies" },
  "swifttdera1387": { display: "Amy Mezera", team: "ladies" },
  "dianezaw": { display: "Diane Zawada", team: "ladies" },
  "klaber615": { display: "Kristina Laber", team: "ladies" },
  "rhodestola": { display: "Lindsay Rhodes", team: "ladies" },
  "lindshines21": { display: "Lindsay Trammell", team: "ladies" },
  "spicytunaroll": { display: "Darin Quach", team: "gents" },
  "rodayrodriguez": { display: "James Roday Rodriguez", team: "gents" },
  "mraladdin23": { display: "Michael Salwan", team: "gents" },
  "rickohio": { display: "Richard Salwan", team: "gents" },
  "ryan2340": { display: "Ryan Turner", team: "gents" },
  "tonyfel": { display: "Tony Feldkamp", team: "gents" },
  "alexkuroda": { display: "Alexandra Kuroda", team: "ladies" },
  "alyssah209": { display: "Alyssa Hartman", team: "ladies" },
  "aridotcom": { display: "Ariel Hobbs", team: "ladies" },
  "rorschacher": { display: "Melissa Waybright", team: "ladies" },
  "wentzdayadams": { display: "Kyra Wiaterowski", team: "ladies" },
  "reraclarke": { display: "Rachael Clarke", team: "ladies" },
  "kangasman91": { display: "Charles Kangas", team: "gents" },
  "toph013": { display: "Chris Kuroda", team: "gents" },
  "colinmct": { display: "Colin McTamany", team: "gents" },
  "joefrk": { display: "Joe Frick", team: "gents" },
  "rayfink88": { display: "Liam Platt", team: "gents" },
  "thegamersdome": { display: "Scott Gerhardt", team: "gents" },
  "mrsdsalinger": { display: "Danielle Salinger", team: "ladies" },
  "awkwardtastical": { display: "Heather Murray", team: "ladies" },
  "jmmispilkin77": { display: "Jaime Mispilkin Frazier", team: "ladies" },
  "kfloyd108": { display: "Kim Floyd", team: "ladies" },
  "snipermel": { display: "Melissa", team: "ladies" },
  "thefantasygirl": { display: "Rosalie Michaels", team: "ladies" },
  "the1ceman": { display: "Aaron Duddles", team: "gents" },
  "goldrazz": { display: "Bob Goldman", team: "gents" },
  "nefan12": { display: "Collin Sutrick", team: "gents" },
  "tribalchief60": { display: "Jim Duddles", team: "gents" },
  "rhinostrong71": { display: "Ron Karres", team: "gents" },
  "unclemercy10": { display: "Stevan Hulick", team: "gents" },
  "leashleo": { display: "Alicia Leo", team: "ladies" },
  "snazzycat24": { display: "Amy", team: "ladies" },
  "charrr721": { display: "Charlene Friedman", team: "ladies" },
  "jkc497": { display: "Jenna Carlone", team: "ladies" },
  "mustangsal2006": { display: "Sally Kurjan", team: "ladies" },
  "sprice8907": { display: "Samantha Price", team: "ladies" },
  "schardt312": { display: "Brian", team: "gents" },
  "semtexmex": { display: "Justin Herrera", team: "gents" },
  "larrymonkey": { display: "LarryMonkey", team: "gents" },
  "markringo": { display: "Mark Ringo", team: "gents" },
  "fritobandit0": { display: "Richard Gonzalez", team: "gents" },
  "wolfrunner": { display: "Rod Humphrey", team: "gents" },
  "ashleydubz": { display: "Ashley", team: "ladies" },
  "jvinzant14": { display: "Judy Vinzant", team: "ladies" },
  "dono5641": { display: "kelley donovan", team: "ladies" },
  "madifenton": { display: "Madison Fenton", team: "ladies" },
  "mmoon335": { display: "Mollie Moon", team: "ladies" },
  "suzcute": { display: "Susan Curran", team: "ladies" },
  "jro3829": { display: "John Romaker", team: "gents" },
  "jmart3022": { display: "Jonathan Martorano", team: "gents" },
  "lukesawhook": { display: "Luke Sawhook", team: "gents" },
  "nomad1600": { display: "Rick Brusuelas", team: "gents" },
  "rbraven30": { display: "Rory Bawtree", team: "gents" },
  "superfricke": { display: "Zach Fricke", team: "gents" },
  "ajgruhlks": { display: "Andrea Gruhlke", team: "ladies" },
  "angelamichaels": { display: "Angela", team: "ladies" },
  "rowdygirl20": { display: "Christie", team: "ladies" },
  "claudiamking": { display: "Claudia King", team: "ladies" },
  "caliluv15": { display: "Jenny Marvin", team: "ladies" },
  "leanneva1226": { display: "Leanne Berman", team: "ladies" },
  "hermanam87": { display: "Aaron Herman", team: "gents" },
  "dirtydan2133": { display: "Bryan Miracle", team: "gents" },
  "brocal44": { display: "Calvin brown", team: "gents" },
  "derekf17": { display: "Derek Forster", team: "gents" },
  "th3realjimshady": { display: "Jimmy", team: "gents" },
  "goody55": { display: "Josh Goodman", team: "gents" },
  "huntinmillions": { display: "Alisha Hunt", team: "ladies" },
  "mightybouch": { display: "Claire Bouchard", team: "ladies" },
  "kamo2002": { display: "Kelli O’Neil", team: "ladies" },
  "lindellions": { display: "Linda", team: "ladies" },
  "subeat": { display: "Susan Beaty", team: "ladies" },
  "wendiearley": { display: "Wendi Earley", team: "ladies" },
  "beard82": { display: "Daniel O\'Connell", team: "gents" },
  "dmicmedia": { display: "Dennis Michelsen", team: "gents" },
  "hawaii3g": { display: "Greg Grauman", team: "gents" },
  "zirgrush": { display: "Jonathan Criswell", team: "gents" },
  "mstencel": { display: "Mike Stencel", team: "gents" },
  "vincemapstone": { display: "Vince Mapstone", team: "gents" },
  "cyndiqberg": { display: "Cyndi", team: "ladies" },
  "dameoverboard": { display: "Darcy", team: "ladies" },
  "nobleg711": { display: "Gina Noble", team: "ladies" },
  "queenroxanne12": { display: "Roxanne", team: "ladies" },
  "samawesome87": { display: "Samantha Holt", team: "ladies" },
  "stephaniab": { display: "Stephania Bell", team: "ladies" },
  "killerclownz": { display: "Brian Covert", team: "gents" },
  "kartn43": { display: "Craig Noble", team: "gents" },
  "mrscampers": { display: "Gabriel", team: "gents" },
  "heisenberg44": { display: "Jacob Norton", team: "gents" },
  "bbilw": { display: "Jerome Roy", team: "gents" },
  "jajjeo4": { display: "Michael Bachi", team: "gents" },
  "amyb620": { display: "Amy Brodkorb", team: "ladies" },
  "1gridirongoddess": { display: "Angie Hatfield", team: "ladies" },
  "jenswigs": { display: "Jen Schweigert", team: "ladies" },
  "mroseaceto": { display: "Mary Rose Aceto", team: "ladies" },
  "sbpp": { display: "Sarah Payne-Poff", team: "ladies" },
  "stacyp83": { display: "Stacy Perez", team: "ladies" },
  "pfirshizzle": { display: "Eric Pfirman", team: "gents" },
  "jerryb83": { display: "Jerry Bagshaw", team: "gents" },
  "daubs23": { display: "Jim Daubs", team: "gents" },
  "dreamersffl": { display: "Kevin Payne", team: "gents" },
  "buyandsellyou": { display: "Sam Schneider", team: "gents" },
  "troybbb": { display: "Troy barnes", team: "gents" },
  "ccpick": { display: "Clair Pickering", team: "ladies" },
  "emilyetaylor23": { display: "Emily Taylor", team: "ladies" },
  "kerrymarcum": { display: "Kerry Marcum", team: "ladies" },
  "saravvv": { display: "Sara Vandenberg", team: "ladies" },
  "sarahchiz": { display: "Sarah Chisick", team: "ladies" },
  "sully4485": { display: "Shannon Sullivan", team: "ladies" },
  "biggamejames777": { display: "Jamie Perog", team: "gents" },
  "natemarcum": { display: "Nate Marcum", team: "gents" },
  "salletoff": { display: "Sal Leto", team: "gents" },
  "jayygriff": { display: "Jared Griffin", team: "gents" },
  "bjones304": { display: "Bryce Jones", team: "gents" },
  "professorplum": { display: "Andrew", team: "gents" },
  "ahenneman": { display: "Ashlie Henneman", team: "ladies" },
  "jennay01": { display: "Jennifer Sons", team: "ladies" },
  "kmo304fan": { display: "Kim Moss", team: "ladies" },
  "triplef": { display: "Mandy Flores", team: "ladies" },
  "msheils1": { display: "Melissa Sheils", team: "ladies" },
  "sc0regasms": { display: "Tiffany Totah", team: "ladies" },
  "thedukecrusher": { display: "Bobby Duke", team: "gents" },
  "mortonsaltboy": { display: "Erick Schroeder", team: "gents" },
  "jorgebedwards": { display: "Jorge B Edwards", team: "gents" },
  "justinmasonfwfb": { display: "Justin Mason", team: "gents" },
  "ktompkinsii": { display: "Kevin Tompkins", team: "gents" },
  "pestell": { display: "Mark Pestell", team: "gents" },
  "tatas4touchdowns": { display: "Diana Frye", team: "ladies" },
  "domoogion15": { display: "Hannah Record", team: "ladies" },
  "juliapapworth": { display: "Julia Papworth", team: "ladies" },
  "kellyinphoenix": { display: "Kelly Singh", team: "ladies" },
  "stoppooping": { display: "Lindsay Nahum", team: "ladies" },
  "gigiswanson": { display: "Lisa Swanson", team: "ladies" },
  "notsuredude": { display: "Carl Wells", team: "gents" },
  "topherk44": { display: "Christopher Kurt", team: "gents" },
  "imthatsupi": { display: "John Supowitz", team: "gents" },
  "legzilla": { display: "Justin Sokoloff", team: "gents" },
  "mrecord2121": { display: "Matt Record", team: "gents" },
  "bolander2": { display: "Roel Zavala", team: "gents" },
  "macapplechic": { display: "Alicia", team: "ladies" },
  "bloodbathnbyond": { display: "Cassandra Blake", team: "ladies" },
  "kangel79": { display: "Karina Ángel", team: "ladies" },
  "meaghanmariaa": { display: "Meaghan D’Amico", team: "ladies" },
  "poppykimish": { display: "Poppy Kimish", team: "ladies" },
  "stephmiller40": { display: "Stephanie Miller", team: "ladies" },
  "bigboneded": { display: "Brendon Booth", team: "gents" },
  "derrickbrown73": { display: "Derrick Brown", team: "gents" },
  "orkneybowl": { display: "Johnny Edwards", team: "gents" },
  "wildguns": { display: "Marcos", team: "gents" },
  "bigpoppathomp": { display: "Michael Thompson", team: "gents" },
  "sean_mccormick": { display: "Sean McCormick", team: "gents" },
  "luvtractor3": { display: "Courtney Burrows", team: "ladies" },
  "highhopes77": { display: "Hope Meyers", team: "ladies" },
  "wildrosie": { display: "Karen Combs", team: "ladies" },
  "lhartman916": { display: "LeighAnn Hartman", team: "ladies" },
  "mclarkson23": { display: "Marissa Clarkson", team: "ladies" },
  "morganhallam": { display: "Morgan Hallam", team: "ladies" },
  "bamzclaz": { display: "Anthony Knarr", team: "gents" },
  "chubzburger": { display: "Brandon Lane", team: "gents" },
  "idp_iggy": { display: "Iggy Gilbert", team: "gents" },
  "jeffro303": { display: "Jeff Maldonado", team: "gents" },
  "lososos": { display: "Joe Wiggans", team: "gents" },
  "krenz492": { display: "Kevan Renz", team: "gents" },
  "alligarbage": { display: "Alli Potter", team: "ladies" },
  "jfein507": { display: "Jessica Feinberg", team: "ladies" },
  "auntydiluvian": { display: "Shasta Turner", team: "ladies" },
  "bratalion": { display: "Brittain", team: "ladies" },
  "careatl": { display: "Carrie Calamia", team: "ladies" },
  "lilmomma13104": { display: "Amy Schumaker", team: "ladies" },
  "kcaw": { display: "Alex Williams", team: "gents" },
  "lacesout13": { display: "Rob", team: "gents" },
  "grrrroooooovvvy": { display: "Gary Thorpe", team: "gents" },
  "fatboybenoy": { display: "Nick Benoy", team: "gents" },
  "raykuhn57": { display: "Ray Kuhn", team: "gents" },
  "markvix2": { display: "Mark Vickers", team: "gents" },
  "cutlet15": { display: "ALYSSA", team: "ladies" },
  "puppers4lyfe": { display: "Ariel / trashsandwiches", team: "ladies" },
  "theonlyjensmith": { display: "Jen Smith", team: "ladies" },
  "picklesandwich": { display: "Jess Muto", team: "ladies" },
  "unnecruffness": { display: "Kiersten Ruff", team: "ladies" },
  "megsok": { display: "Meghan", team: "ladies" },
  "bigguyfs": { display: "Bob Lung", team: "gents" },
  "overtimeireland": { display: "Colm Kelly", team: "gents" },
  "jttcupcommish": { display: "Matt Cullen", team: "gents" },
  "rhettdt": { display: "Rhett Taylor", team: "gents" },
  "kstatefan101": { display: "Rob Rounbehler)", team: "gents" },
  "ryanhallam": { display: "Ryan Hallam", team: "gents" },
  "ffqueenb": { display: "Bonnie Robinson", team: "ladies" },
  "brendasue": { display: "Brenda Felan", team: "ladies" },
  "laurenjump": { display: "Lauren Jump", team: "ladies" },
  "mjar20": { display: "Meghan Jarvis", team: "ladies" },
  "nrojo": { display: "Nicolette Rojo", team: "ladies" },
  "tootsiepop6": { display: "Rachel", team: "ladies" },
  "abehrens53": { display: "Andy Behrens", team: "gents" },
  "murkinseas0n": { display: "Chris Charles", team: "gents" },
  "deejbag3": { display: "DJ Jarvis", team: "gents" },
  "davenport35": { display: "Drew Davenport", team: "gents" },
  "kyleisnotthepitts": { display: "LaDarius Brown", team: "gents" },
  "brucewayne0305": { display: "Steven Molina", team: "gents" },
  "thenfelle": { display: "Cassie", team: "ladies" },
  "krisbelle11": { display: "Kristin B", team: "ladies" },
  "kylee": { display: "Kylee Redman", team: "ladies" },
  "thespinzone": { display: "Lauren Joffe", team: "ladies" },
  "calmb4thescore": { display: "Michelle Wilson", team: "ladies" },
  "renee28": { display: "Renee", team: "ladies" },
  "wjschuler1976": { display: "Bill Schuler", team: "gents" },
  "optimushind": { display: "Chris Hind", team: "gents" },
  "dredsea": { display: "Dale Redman", team: "gents" },
  "jamesonrulez": { display: "Jameson Hutchison", team: "gents" },
  "haldane": { display: "Martin Haldane", team: "gents" },
  "pwee31": { display: "Pierre Wilson", team: "gents" },
  "eregis27": { display: "Erin Regis", team: "ladies" },
  "kaceykasem": { display: "Kacey", team: "ladies" },
  "islandninjaz": { display: "Karla Ross", team: "ladies" },
  "shetalksfootbal": { display: "Ms Gina", team: "ladies" },
  "bonehed80": { display: "Rita Rice", team: "ladies" },
  "sfly": { display: "Sarah Flynn", team: "ladies" },
  "dgeorge40": { display: "Derek George", team: "gents" },
  "greggels17": { display: "Greg Berthiaume", team: "gents" },
  "smitty1221": { display: "Jason Smith", team: "gents" },
  "lfgvikes22": { display: "Matt", team: "gents" },
  "grindberg99": { display: "Mike Lindberg", team: "gents" },
  "ricosmodernworld": { display: "Roderick Lawrence (Rico)", team: "gents" },
  "gummybear15": { display: "Addison Kennedy", team: "ladies" },
  "bellcows32": { display: "Bella Noble", team: "ladies" },
  "unicornfp": { display: "Julia Snyder", team: "ladies" },
  "niyahlator8": { display: "Niah Marable", team: "ladies" },
  "sneakymaisy": { display: "Sneaky Girls", team: "ladies" },
  "soccerstar36": { display: "Sydney Josephson", team: "ladies" },
  "ogdavefantasy": { display: "Dave", team: "gents" },
  "spydes78": { display: "Jayson Snyder", team: "gents" },
  "jonymaine37185": { display: "Jonathan Marable", team: "gents" },
  "wildcatwr": { display: "Nick Josephson", team: "gents" },
  "ryanmkennedy22": { display: "Ryan Kennedy", team: "gents" },
  "aprilbalasq": { display: "April Balasquide", team: "ladies" },
  "neverenough": { display: "gl tyler", team: "ladies" },
  "haleyalexis": { display: "Haley", team: "ladies" },
  "lfbaxter": { display: "Louise Tobin", team: "ladies" },
  "maksimus": { display: "Maks", team: "ladies" },
  "sweatingglitter247": { display: "Sharlene Ericson", team: "ladies" },
  "djpaulhoward914": { display: "Chinua Olushegun", team: "gents" },
  "evdokios": { display: "John", team: "gents" },
  "theprupatel": { display: "Pruthvish Patel", team: "gents" },
  "wilson27": { display: "RJ Wilson", team: "gents" },
  "ace978": { display: "Shawn Green", team: "gents" },
  "jtwasrb1": { display: "Spencer Adkins", team: "gents" },
  "amerika108": { display: "Erika", team: "ladies" },
  "hannahr": { display: "Hannah", team: "ladies" },
  "heth2512": { display: "Heather Joyce", team: "ladies" },
  "megankaplan23": { display: "Megan Kaplan", team: "ladies" },
  "religioamoris": { display: "Monica Waterston", team: "ladies" },
  "pizookierookie": { display: "Karen W", team: "ladies" },
  "aaronstdenis": { display: "Aaron St. Denis", team: "gents" },
  "rabbitdad": { display: "Benjamin Ditlevson", team: "gents" },
  "jkaplanwinning": { display: "Jonathan Kaplan", team: "gents" },
  "cantaloupeff": { display: "Jordan Loupe", team: "gents" },
  "joshbrickner": { display: "Josh Brickner", team: "gents" },
  "tvf2k": { display: "Tom Van Fleet", team: "gents" },
  "rowdy357": { display: "Anne Dunn", team: "ladies" },
  "brettskies": { display: "Brett Siegel", team: "ladies" },
  "kjn333": { display: "Kim Newman", team: "ladies" },
  "lisahipp": { display: "Lisa Hippeard", team: "ladies" },
  "melindako": { display: "Melinda", team: "ladies" },
  "mdl86": { display: "Melissa", team: "ladies" },
  "packerfansara": { display: "Sara Hoggatt", team: "ladies" },
  "bogle0904": { display: "Brian Ogle", team: "gents" },
  "jwn71": { display: "John Wesley", team: "gents" },
  "stiles08": { display: "Matthew Stiles", team: "gents" },
  "theffrealist": { display: "Michael Hauff", team: "gents" },
  "sjcobe01": { display: "Scott cobe", team: "gents" },
  "estefytdf": { display: "Estefania Tamez", team: "ladies" },
  "giarose": { display: "Gianna Hamilton", team: "ladies" },
  "pinkpuppy": { display: "Lily Snyder", team: "ladies" },
  "swimsister": { display: "Mesa Josephson", team: "ladies" },
  "dolphin1027": { display: "Nessa Marable", team: "ladies" },
  "sydneyjean": { display: "Sydney Doehnert", team: "ladies" },
  "deuce1184": { display: "Drew Hamilton", team: "gents" },
  "pactameztdf": { display: "Jaime Tamez", team: "gents" },
  "jeremy_d": { display: "Jeremy Doehnert", team: "gents" },
  "bubbashley": { display: "Ashley McLellan", team: "ladies" },
  "flyersgrl28": { display: "Heather Morton", team: "ladies" },
  "kimberlyd1313": { display: "Kimberly Adkison", team: "ladies" },
  "mrsstefanski": { display: "Lana Carrino", team: "ladies" },
  "sarahmclevin": { display: "Sarah levin", team: "ladies" },
  "dchoosiergirl": { display: "Stacy Glanzman", team: "ladies" },
  "fantasyfish": { display: "Anthony Fishwick", team: "gents" },
  "eliotprops": { display: "Eliot Levin", team: "gents" },
  "sportyg10": { display: "Garrett Jensen", team: "gents" },
  "jcmoneydesign": { display: "JC", team: "gents" },
  "streetzathonchi": { display: "Michael Serpico", team: "gents" },
  "thespatula300": { display: "Steve Bulanda", team: "gents" }
};

// ── TWITTER HANDLE LOOKUP (keyed by Sleeper username, lowercase) ──
const TWITTER_LOOKUP = {
  "aysolis":"manda_ays","kellyh711":"indygirlinMA","lauree":"laureefoster","ballersmeg":"ballers_meg","mkim521":"Mkim521","rk23":"rk23","haus":"AramsHaus","footballdiehard":"footballdiehard","commishcasey":"CommishCasey","borgjohn715":"Borgjohn715","pigbirdjetfan":"Pigbirdjetfan","marathoner_rg":"marathoner_RG","amberalertff":"Amberalert_ff","dmiller10nc":"Dmiller10nc","fantasygranny":"kelly_dickerman","kvalenzuela":"kvalenzuela17","shanfan":"shannonb_lunt","andrewcooper":"CoopAFiasco","andrewhallff":"AndrewHallFF","rotobuzzguy":"rotobuzzguy","snokone86":"Snokone86","5yardrushmurf":"murf_nfl","sincityheat":"scottfrankel13","bethanylpeters":"BethanyLPeters","foxworth07":"Bfoxworth07","laserjane":"Janiecia4","urfootballqueen":"ItsJodiNewsome","katsourisff":"katsourisff","bestballjonesy":"Bestballjonesy","tzley22":"ProtocolSon22","consultfantasy":"ConsultFantasy","geekmill":"geek_mill","luckyfantasyguy":"LuckyFantasyGuy","grubbaf":"Mister_Wu","rhodestola":"lindsay_rhodes","mraladdin23":"mraladdin23","alexkuroda":"alex_kurodaa","rorschacher":"RorschacherWay","wentzdayadams":"PhantasyFFkyra","reraclarke":"RachClarke203","kangasman91":"KANGASMAN_FS","toph013":"chrisck5","colinmct":"Colin_McT","joefrk":"joefrk","rayfink88":"LAPlatt1","thegamersdome":"TheGamersDome","awkwardtastical":"awkwardtastical","jmmispilkin77":"jmmispilkin","kfloyd108":"Kfloyd108","snipermel":"Mel91120024","goldrazz":"rhgoldmancpa","nefan12":"CSutrickCFD","rhinostrong71":"comishrhino","unclemercy10":"StevanHulick","leashleo":"leashleo","snazzycat24":"TrstTheJrny24","jkc497":"jcarlone5","mustangsal2006":"sally3510","sprice8907":"Sprice8907","schardt312":"Schardt312","semtexmex":"Semtexmex93","larrymonkey":"ffLarryMonkey","markringo":"MarkRingo12","fritobandit0":"FritoBandito_FF","ashleydubz":"Ashley_DUBZ","jvinzant14":"JudyVinzant","dono5641":"kdcheermom","madifenton":"Madi_Fenton","mmoon335":"pwfishing","suzcute":"skacurran","jro3829":"JohnnyRo","jmart3022":"Jmart3022","lukesawhook":"lukesawhook","nomad1600":"rbrusuelas","rbraven30":"Nutsforsport30","superfricke":"FrickeFantasyFB","ajgruhlks":"ajgruhlks","angelamichaels":"FantasyGoblin99","rowdygirl20":"rowdygirl","hermanam87":"DE_aaron","dirtydan2133":"Danman2133","brocal44":"BroCal44","derekf17":"derekforster","th3realjimshady":"FF_Jim_Shady","huntinmillions":"huntinmillions","mightybouch":"AZClaire","kamo2002":"kellioneil02","lindellions":"lindellions","wendiearley":"WendiEarley","beard82":"Beard_82","dmicmedia":"DMICmedia","hawaii3g":"littleglenlake","zirgrush":"zirgrush","mstencel":"Munson1897","vincemapstone":"VinceMapstone","cyndiqberg":"Cyndiqberg","dameoverboard":"DameOverboard","nobleg711":"NobleG_FF","queenroxanne12":"FQueenroxanne","samawesome87":"SamanthaRHolt","stephaniab":"Stephania_ESPN","killerclownz":"briancovert7","kartn43":"Kartn43","mrscampers":"_MrScampers","heisenberg44":"Heisenberg3144","bbilw":"JeromeRoy99","jajjeo4":"jajjeo4","amyb620":"aebrodkorb","1gridirongoddess":"GridironAngie","jenswigs":"jenschweigert","mroseaceto":"MRoseAceto","sbpp":"Sarah_BPP","stacyp83":"stacy_perez83","pfirshizzle":"EricPfirman","jerryb83":"jerryb1983","daubs23":"daubs23","dreamersffl":"DreamersFFL","buyandsellyou":"BuyAndSellYou","troybbb":"Troybbb","emilyetaylor23":"emilyetaylor23","saravvv":"sbvandenberg","sully4485":"sully4485","natemarcum":"natemarcum","salletoff":"SalLetoFF","jayygriff":"FantasyHumble","bjones304":"B_Jones304","professorplum":"OnTheTotem","sc0regasms":"tntotah","thedukecrusher":"TheBobbyDuke","notsuredude":"notsuredude","topherk44":"Topherk44","imthatsupi":"imthatsupi","legzilla":"LegZilla7","mrecord2121":"mrecord21","bolander2":"bolander2","kangel79":"k_Marmota","meaghanmariaa":"arkh4m_","poppykimish":"PoppyGK","stephmiller40":"stephmiller57","bigboneded":"bigbonededFFB","derrickbrown73":"DerrickBrown73","orkneybowl":"BowlOrkney","wildguns":"WildGunsi","bigpoppathomp":"Bigpoppathomp","sean_mccormick":"Lunchbox031","luvtractor3":"Luvtractor3","highhopes77":"High_Hopes77","wildrosie":"WildOneRosie","lhartman916":"leighannyall","bamzclaz":"Bamzclaz","chubzburger":"CHUBZBURGER","idp_iggy":"IDP_Iggy","jeffro303":"303jeffro","lososos":"OPJoee","grrrroooooovvvy":"Grrrroooooovvvy","fatboybenoy":"fatboybenoy","raykuhn57":"Ray_kuhn_28","markvix2":"FlagOnThePlayUK","cutlet15":"Cutlet15","puppers4lyfe":"trashsandwiches","theonlyjensmith":"TheOnlyJenSmith","picklesandwich":"jessmuto","unnecruffness":"unnecruffness","bigguyfs":"bob_lung","overtimeireland":"OvertimeIreland","jttcupcommish":"coo84_ff","rhettdt":"RDT_MD","ryanhallam":"Fightingchance","ffqueenb":"FantasyQueenB","brendasue":"FelanBrenda","laurenjump":"bootsyjump","mjar20":"msteps20","abehrens53":"andybehrens","murkinseas0n":"Kavorka324","deejbag3":"deej_jarvis","davenport35":"DrewDavenportFF","kyleisnotthepitts":"ladarius_brown","brucewayne0305":"Brucewayne0305","thenfelle":"TheNFElle","krisbelle11":"krisbelle11","kylee":"kyleeredman","thespinzone":"thespinzone","calmb4thescore":"GoPackGo411","renee28":"ReneeFreakNFL","wjschuler1976":"WilliamSchule20","optimushind":"Iceman_1013","dredsea":"DTRedman","jamesonrulez":"Jamesonrulez","haldane":"Haldane_88","pwee31":"pwee31","eregis27":"eregis27","kaceykasem":"thekaceykasem","islandninjaz":"boxingedgar","shetalksfootbal":"SheTalksFootball","sfly":"sjflynn","dgeorge40":"DGeorge40","greggels17":"greggels17","smitty1221":"JTSMITH1221","lfgvikes22":"pattyp_22","grindberg99":"FFCanuck99","ricosmodernworld":"RicoModernWorld","spydes78":"Spydes78","jonymaine37185":"Jonymaine37185","aprilbalasq":"aprilbalasquide","neverenough":"gladysLtyler","maksimus":"sfantasyfb","sweatingglitter247":"ciaobella1981","djpaulhoward914":"DjPaUlHoWaRd","evdokios":"evdokios","theprupatel":"ThePruPatel","wilson27":"Wilson27","ace978":"Tha_green_1","jtwasrb1":"JTwasRB1","hannahr":"hanrowland","heth2512":"heth2512","religioamoris":"ReligioAmoris","pizookierookie":"LadyLuckWeeks","aaronstdenis":"FFMadScientist","rabbitdad":"FFRabbitDad","jkaplanwinning":"Jkaplanwinning","cantaloupeff":"CantALoupe_FF","joshbrickner":"joshbrickner","tvf2k":"TomVanFleet","kjn333":"kjn333","lisahipp":"lhippeard","melindako":"Melinda__K","packerfansara":"Football_Sara","jwn71":"JWN7113","stiles08":"stiles08","theffrealist":"theffrealist","sjcobe01":"Sjcobe1","pactameztdf":"PacTamezTDF","jeremy_d":"reddit_ff","bubbashley":"ashley_mc7","kimberlyd1313":"Hottytoddy43","mrsstefanski":"stefanskigirl","dchoosiergirl":"DCHoosiergirl","fantasyfish":"Ffootballfish","eliotprops":"Eliotprops","sportyg10":"SportyGman10","jcmoneydesign":"JCMoneyDesign","streetzathonchi":"streetzathon","thespatula300":"TheSpatula300","ryanmkennedy22":"RyanKennedy_22","sc0regasms":"tntotah","bratalion":"him_hersports","careatl":"carrielynnxox","mdl86":"mdl86","rowdy357":"rowdy357"
};

// Returns clickable @handle link if Twitter handle exists, otherwise empty string
function twitterLink(username) {
  const handle = TWITTER_LOOKUP[username ? username.toLowerCase() : ''];
  if (handle) {
    return '<a href="https://x.com/' + handle + '" target="_blank" rel="noopener" style="color:#1d9bf0;text-decoration:none;font-weight:600">@' + handle + '</a>';
  }
  return '';
}

// ── STATE ──
let allData = [];
let maxWeek = 0;
let lbFilter = 'all';
let currentPage = 'home';

// ── CORS-SAFE FETCH ──
const PROXY = 'https://corsproxy.io/?';
async function fetchJSON(url) {
  try {
    const r = await fetch(url, { mode: 'cors' });
    if (r.ok) return r.json();
  } catch(_) {}
  const r2 = await fetch(PROXY + encodeURIComponent(url));
  if (!r2.ok) throw new Error('HTTP ' + r2.status);
  return r2.json();
}

// Weeks to subtract from cumulative roster totals to get week 1-13 only


const PLAYOFF_WKS = [14, 15, 16, 17, 18];
const REG_WEEKS   = [1,2,3,4,5,6,7,8,9,10,11,12,13];
const ALL_WEEKS   = [...REG_WEEKS, ...PLAYOFF_WKS];

// ── Process one league's raw data into clean roster objects ──
function processLeague({ division, rosters, users, wkPtsMap, wkRaw }) {
  const userMapById = {};
  for (const u of users) {
    if (u.user_id) userMapById[String(u.user_id)] = u;
  }

  // Compute per-week W/L for playoff weeks (to subtract from cumulative totals)
  const wkWL = {};
  for (const w of PLAYOFF_WKS) {
    const raw = wkRaw[w] || [];
    if (!raw.length) continue;
    const matchupGroups = {}, ptsThisWeek = {};
    for (const m of raw) {
      if (!m.roster_id) continue;
      ptsThisWeek[m.roster_id] = (ptsThisWeek[m.roster_id] || 0) + (m.points || 0);
      if (m.matchup_id) {
        if (!matchupGroups[m.matchup_id]) matchupGroups[m.matchup_id] = [];
        matchupGroups[m.matchup_id].push(m.roster_id);
      }
    }
    const allScores = Object.values(ptsThisWeek).sort((a,b) => a - b);
    const mid = Math.floor(allScores.length / 2);
    const median = allScores.length % 2 === 0
      ? (allScores[mid-1] + allScores[mid]) / 2 : allScores[mid];

    for (const rid of Object.keys(ptsThisWeek)) {
      const myPts = ptsThisWeek[rid];
      if (!wkWL[rid]) wkWL[rid] = { wins:0, losses:0 };
      let h2hWin = false;
      for (const [, group] of Object.entries(matchupGroups)) {
        if (group.includes(Number(rid)) || group.includes(rid)) {
          const opp = group.find(id => String(id) !== String(rid));
          if (opp !== undefined) h2hWin = myPts > (ptsThisWeek[opp] || 0);
          break;
        }
      }
      const medianWin = myPts > median;
      wkWL[rid].wins   += (h2hWin ? 1 : 0) + (medianWin ? 1 : 0);
      wkWL[rid].losses += (h2hWin ? 0 : 1) + (medianWin ? 0 : 1);
    }
  }

  const processed = rosters.map(r => {
    const userObj = userMapById[String(r.owner_id)] || {};
    const sleeperUsername    = (userObj.username     || '').toLowerCase().trim();
    const sleeperDisplayName = (userObj.display_name || '').toLowerCase().trim();
    const lookupKey = USER_LOOKUP[sleeperDisplayName]
      ? sleeperDisplayName : USER_LOOKUP[sleeperUsername] ? sleeperUsername : null;
    const lookup = lookupKey
      ? USER_LOOKUP[lookupKey]
      : { display: userObj.display_name || sleeperUsername || 'Unknown', team: 'unknown' };

    const s = r.settings || {};
    const totalPtsAll = (s.fpts || 0) + (s.fpts_decimal || 0) / 100;
    const winsAll     = s.wins   || 0;
    const lossesAll   = s.losses || 0;
    const ties        = s.ties   || 0;

    let subtractPts = 0;
    const playoffWkPts = {};
    for (const w of PLAYOFF_WKS) {
      const pts = (wkPtsMap[w] || {})[r.roster_id] || 0;
      playoffWkPts[w] = pts;
      subtractPts += pts;
    }

    const ridWL  = wkWL[r.roster_id] || { wins:0, losses:0 };
    const totalPts = Math.max(0, totalPtsAll - subtractPts);
    const wins     = Math.max(0, winsAll   - ridWL.wins);
    const losses   = Math.max(0, lossesAll - ridWL.losses);

    return {
      rosterId: r.roster_id,
      username: sleeperUsername,
      lookupKey,
      display:  lookup.display,
      team:     lookup.team,
      totalPts,
      wins,
      losses,
      ties,
      ptsAgainst: (s.fpts_against || 0) + (s.fpts_against_decimal || 0) / 100,
      playoffWkPts,
    };
  });

  return { divisionName: division.name, leagueId: division.leagueId, rosters: processed };
}

// ── Build H2H matchup data for all reg-season weeks ──
function buildH2HData(allLeagues) {
  const h2hByWeek = {};
  for (const { divisionName, leagueId, rosters, wkRaw } of allLeagues) {
    const rosterMap = {};
    for (const r of rosters) rosterMap[r.rosterId] = r;

    for (const w of REG_WEEKS) {
      const raw = wkRaw[w] || [];
      if (!raw.length) continue;
      if (!h2hByWeek[w]) h2hByWeek[w] = [];

      const ptsMap = {}, matchupGroups = {};
      for (const m of raw) {
        if (!m.roster_id) continue;
        ptsMap[m.roster_id] = (ptsMap[m.roster_id] || 0) + (m.points || 0);
        if (m.matchup_id) {
          if (!matchupGroups[m.matchup_id]) matchupGroups[m.matchup_id] = [];
          matchupGroups[m.matchup_id].push(m.roster_id);
        }
      }

      for (const [, group] of Object.entries(matchupGroups)) {
        if (group.length < 2) continue;
        const [a, b] = group;
        const aInfo = rosterMap[a], bInfo = rosterMap[b];
        if (!aInfo || !bInfo || aInfo.team === bInfo.team) continue;
        const ladyInfo = aInfo.team === 'ladies' ? aInfo : bInfo;
        const gentInfo = aInfo.team === 'gents'  ? aInfo : bInfo;
        const ladyId   = aInfo.team === 'ladies' ? a : b;
        const gentId   = aInfo.team === 'gents'  ? a : b;
        const ladyPts  = ptsMap[ladyId] || 0;
        const gentPts  = ptsMap[gentId] || 0;
        h2hByWeek[w].push({
          ladyPts, gentPts,
          ladyName: ladyInfo.display,
          gentName: gentInfo.display,
          divName:  divisionName,
          diff:     Math.abs(ladyPts - gentPts),
          winner:   ladyPts >= gentPts ? 'ladies' : 'gents',
        });
      }
    }
  }
  return h2hByWeek;
}

// ── Main fetch + build ──
// ── Fetch and process draft picks for all divisions ──
async function fetchDraftPicks(division, users) {
  const lid = division.leagueId;
  try {
    // Get draft list for this league
    const drafts = await fetchWithRetry(`https://api.sleeper.app/v1/league/${lid}/drafts`);
    if (!drafts || !drafts.length) return [];

    // Use the first (usually only) draft
    const draft = drafts[0];
    const draftId = draft.draft_id;

    // Get all picks
    const picks = await fetchWithRetry(`https://api.sleeper.app/v1/draft/${draftId}/picks`);
    if (!picks || !picks.length) return [];

    // Build user lookup for this league
    const userByRosterId = {};
    for (const u of users) {
      if (u.user_id) {
        const sleeperUsername = (u.username || '').toLowerCase().trim();
        const sleeperDisplay  = (u.display_name || '').toLowerCase().trim();
        const lookupKey = USER_LOOKUP[sleeperDisplay] ? sleeperDisplay
                        : USER_LOOKUP[sleeperUsername] ? sleeperUsername : null;
        const lookup = lookupKey ? USER_LOOKUP[lookupKey]
                     : { display: u.display_name || sleeperUsername || 'Unknown', team: 'unknown' };
        userByRosterId[u.roster_id] = { ...lookup, username: sleeperUsername };
      }
    }

    return picks.map(p => {
      const picker = userByRosterId[p.roster_id] || { display: 'Unknown', team: 'unknown' };
      return {
        pickNumber:   p.pick_no,
        round:        p.round,
        roundPick:    p.draft_slot,
        playerName:   (p.metadata?.first_name || '') + ' ' + (p.metadata?.last_name || '').trim() || p.player_id,
        position:     p.metadata?.position || '?',
        nflTeam:      p.metadata?.team || '?',
        pickerName:   picker.display,
        pickerTeam:   picker.team,
        divisionName: division.name,
        leagueId:     lid,
      };
    });
  } catch(e) {
    console.warn(`  Draft fetch failed for ${division.name}: ${e.message}`);
    return [];
  }
}


async function main() {
  console.log(`\n🏈 Battle of the Sexes — Data Fetch`);
  console.log(`   Started: ${new Date().toISOString()}`);
  console.log(`   Fetching ${DIVISIONS.length} divisions across ${ALL_WEEKS.length} weeks...\n`);

  const allLeagues   = [];
  const allDraftPicks = [];
  let done = 0;

  for (const division of DIVISIONS) {
    const lid = division.leagueId;
    process.stdout.write(`  [${String(++done).padStart(2)}/${DIVISIONS.length}] ${division.name}...`);

    try {
      const [rosters, users] = await Promise.all([
        fetchWithRetry(`https://api.sleeper.app/v1/league/${lid}/rosters`),
        fetchWithRetry(`https://api.sleeper.app/v1/league/${lid}/users`),
      ]);

      const wkRaw = {}, wkPtsMap = {};

      // Fetch all weeks (reg season + playoffs) sequentially to avoid hammering API
      for (const w of ALL_WEEKS) {
        try {
          const raw = await fetchWithRetry(`https://api.sleeper.app/v1/league/${lid}/matchups/${w}`);
          wkRaw[w] = Array.isArray(raw) ? raw : [];
          wkPtsMap[w] = {};
          for (const m of wkRaw[w]) {
            if (m.roster_id) wkPtsMap[w][m.roster_id] = (wkPtsMap[w][m.roster_id] || 0) + (m.points || 0);
          }
        } catch(_) {
          wkRaw[w] = []; wkPtsMap[w] = {};
        }
      }

      const processed = processLeague({ division, rosters, users, wkPtsMap, wkRaw });
      const divDraftPicks = await fetchDraftPicks(division, users);
      allLeagues.push({ ...processed, wkRaw });
      process.stdout.write(` ✓ (${processed.rosters.length} rosters, ${divDraftPicks.length} draft picks)\n`);
      allDraftPicks.push(...divDraftPicks);

    } catch(err) {
      process.stdout.write(` ✗ FAILED: ${err.message}\n`);
    }
  }

  console.log(`\n  Building H2H matchup data...`);
  const h2hByWeek = buildH2HData(allLeagues);
  const h2hWeeksAvailable = Object.keys(h2hByWeek).map(Number).sort((a,b) => a-b);
  const totalH2H = Object.values(h2hByWeek).reduce((s, arr) => s + arr.length, 0);
  console.log(`  ✓ ${totalH2H} cross-gender matchups across ${h2hWeeksAvailable.length} weeks`);

  // Strip wkRaw from output (not needed by the browser, saves file size)
  const leaguesForOutput = allLeagues.map(({ wkRaw: _, ...rest }) => rest);

  // Sort draft picks by pick number overall
  allDraftPicks.sort((a,b) => a.pickNumber - b.pickNumber);

  const output = {
    meta: {
      generatedAt:      new Date().toISOString(),
      totalDivisions:   leaguesForOutput.length,
      totalRosters:     leaguesForOutput.reduce((s, l) => s + l.rosters.length, 0),
      totalDraftPicks:  allDraftPicks.length,
      weeksWithH2H:     h2hWeeksAvailable,
    },
    leagues:    leaguesForOutput,
    draftPicks: allDraftPicks,
    h2hByWeek,
  };

  const outPath = path.join(__dirname, '..', 'data.json');
  fs.writeFileSync(outPath, JSON.stringify(output));

  const kb = Math.round(fs.statSync(outPath).size / 1024);
  console.log(`\n✅ data.json written (${kb} KB)`);
  console.log(`   ${output.meta.totalDivisions} divisions, ${output.meta.totalRosters} rosters`);
  console.log(`   Finished: ${new Date().toISOString()}\n`);
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});

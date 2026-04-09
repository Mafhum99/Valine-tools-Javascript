// ========================================
// DOM Helpers
// ========================================
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'className') el.className = value;
        else if (key === 'textContent') el.textContent = value;
        else if (key === 'innerHTML') el.innerHTML = value;
        else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
        else el.setAttribute(key, value);
    });
    children.forEach(child => {
        if (typeof child === 'string') el.appendChild(document.createTextNode(child));
        else if (child instanceof Node) el.appendChild(child);
    });
    return el;
}

// ========================================
// Storage Helpers (localStorage)
// ========================================
const Storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch { return defaultValue; }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch { return false; }
    },
    remove(key) { localStorage.removeItem(key); },
    clear() { localStorage.clear(); }
};

// ========================================
// Copy to Clipboard
// ========================================
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!');
        return true;
    } catch {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copied to clipboard!');
        return true;
    }
}

// ========================================
// Toast Notification
// ========================================
function showToast(message, duration = 2000) {
    let toast = $('#toast-notification');
    if (!toast) {
        toast = createElement('div', {
            id: 'toast-notification',
            style: 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(100px);background:#1f2937;color:#fff;padding:0.75rem 1.5rem;border-radius:0.5rem;font-size:0.875rem;z-index:9999;transition:transform 0.3s ease;box-shadow:0 4px 6px rgba(0,0,0,0.1);'
        });
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(100px)';
    }, duration);
}

// ========================================
// Number Formatting
// ========================================
function formatNumber(num, decimals = 2) {
    if (isNaN(num) || num === null) return '0';
    return Number(num).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function formatPercent(value, decimals = 2) {
    return formatNumber(value * 100, decimals) + '%';
}

// ========================================
// Math Utilities
// ========================================
function percentage(part, whole) { return (part / whole) * 100; }
function percentageOf(percent, whole) { return (percent / 100) * whole; }
function percentageChange(oldValue, newValue) { return ((newValue - oldValue) / Math.abs(oldValue)) * 100; }
function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }
function lerp(start, end, t) { return start + (end - start) * t; }
function mapRange(value, inMin, inMax, outMin, outMax) { return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin; }

// ========================================
// String Utilities
// ========================================
function slugify(text) {
    return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').trim();
}
function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
function titleCase(str) { return str.toLowerCase().replace(/\b\w/g, capitalize); }
function camelCase(str) { return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase()); }
function snakeCase(str) { return str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.join('_').toLowerCase() || str.toLowerCase(); }
function kebabCase(str) { return str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.join('-').toLowerCase() || str.toLowerCase(); }

// ========================================
// Date Utilities
// ========================================
function formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    return format.replace('YYYY', d.getFullYear()).replace('MM', String(d.getMonth() + 1).padStart(2, '0')).replace('DD', String(d.getDate()).padStart(2, '0')).replace('HH', String(d.getHours()).padStart(2, '0')).replace('mm', String(d.getMinutes()).padStart(2, '0')).replace('ss', String(d.getSeconds()).padStart(2, '0'));
}
function daysBetween(date1, date2) { const oneDay = 24 * 60 * 60 * 1000; return Math.round(Math.abs((date1 - date2) / oneDay)); }
function addDays(date, days) { const result = new Date(date); result.setDate(result.getDate() + days); return result; }

// ========================================
// Color Utilities
// ========================================
const Color = {
    rgbToHex(r, g, b) { return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join(''); },
    hexToRgb(hex) { const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null; },
    rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) { h = s = 0; }
        else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        return { h: h * 360, s: s * 100, l: l * 100 };
    },
    hslToRgb(h, s, l) {
        h /= 360; s /= 100; l /= 100;
        let r, g, b;
        if (s === 0) { r = g = b = l; }
        else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1; if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1/3);
        }
        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    },
    random() { return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'); }
};

// ========================================
// Random Utilities
// ========================================
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomFloat(min, max, decimals = 2) { return Number((Math.random() * (max - min) + min).toFixed(decimals)); }
function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomString(length = 10, chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ========================================
// Debounce & Throttle
// ========================================
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
function throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) { func.apply(this, args); inThrottle = true; setTimeout(() => inThrottle = false, limit); }
    };
}

// ========================================
// Validation
// ========================================
function isEmail(str) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str); }
function isURL(str) { try { new URL(str); return true; } catch { return false; } }
function isNumber(str) { return !isNaN(str) && !isNaN(parseFloat(str)); }

// ========================================
// Tool Init Helper
// ========================================
function initTool(toolInfo) {
    if (toolInfo?.name) document.title = `${toolInfo.icon || '🛠️'} ${toolInfo.name} - Mini Tools`;
}

// ========================================
// TOOL LOGIC BELOW
// ========================================

/**
 * Anagram Solver
 * Shuffle characters to create random anagrams
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Anagram Solver', icon: '🔀' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const solveBtn = $('#solve');
    const clearBtn = $('#clear');

    // Fisher-Yates shuffle
    function shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function generateAnagram(text) {
        const chars = text.split('');
        let shuffled;
        // Make sure it's actually different from the original
        do {
            shuffled = shuffleArray(chars);
        } while (shuffled.join('') === text && text.length > 1);

        return shuffled.join('');
    }

    // Common word list for finding meaningful anagrams
    const commonWords = new Set([
        'act','art','ate','bat','bit','bot','bow','box','boy','bus','but','can',
        'cat','cob','cod','con','cop','cot','cow','cub','dam','den','dew','did',
        'die','dig','dim','din','dip','doe','dog','dot','dry','dub','dud','due',
        'dug','dun','duo','ear','eat','eel','egg','ego','elm','end','eve','ewe',
        'eye','fan','far','fat','fax','fed','fee','few','fig','fin','fir','fit',
        'fix','flu','fly','fog','for','fox','fro','fun','fur','gag','gal','gap',
        'gas','gay','gel','gem','get','gig','gin','god','got','gum','gun','gut',
        'guy','gym','had','hag','ham','has','hat','hay','hen','her','hew','hex',
        'hid','him','hip','his','hit','hog','hop','hot','how','hub','hue','hug',
        'hum','hut','ice','icy','ill','imp','ink','inn','ion','ire','irk','its',
        'ivy','jab','jag','jam','jar','jaw','jay','jet','jig','job','jog','jot',
        'joy','jug','jut','keg','ken','key','kid','kin','kit','lab','lad','lag',
        'lap','law','lax','lay','led','leg','let','lid','lie','lip','lit','log',
        'lot','low','lug','mad','man','map','mat','maw','max','may','men','met',
        'mid','mix','mob','moc','mod','mop','mow','mud','mug','mum','nab','nag',
        'nap','nay','net','new','nil','nip','nit','nob','nod','nor','not','now',
        'nun','nut','oaf','oak','oar','oat','odd','ode','off','oft','oil','old',
        'one','orb','ore','our','out','owe','owl','own','pad','pal','pan','pap',
        'par','pat','paw','pay','pea','peg','pen','pep','per','pet','pew','pie',
        'pig','pin','pit','ply','pod','pop','pot','pow','pox','pro','pry','pub',
        'pun','pup','pus','put','rag','ram','ran','rap','rat','raw','ray','red',
        'ref','rep','res','rib','rid','rig','rim','rip','rob','rod','rot','row',
        'rub','rug','rum','run','rut','rye','sac','sad','sag','sap','sat','saw',
        'say','sea','sec','see','set','sew','sex','she','shy','sin','sip','sir',
        'sis','sit','six','ski','sky','sly','sob','sod','son','sop','sot','sow',
        'soy','spa','spy','sub','sum','sun','tab','tag','tam','tan','tap','tar',
        'tax','tea','ten','the','thy','tic','tie','tin','tip','toe','tog','ton',
        'too','top','tot','tow','toy','try','tub','tug','two','urn','use','van',
        'vat','vet','vex','via','vie','vow','wad','wag','war','was','wax','way',
        'web','wed','wet','who','why','wig','win','wit','woe','wok','won','woo',
        'wow','wry','yak','yam','yap','yaw','way','yes','yet','yin','you','zag',
        'zap','zen','zig','zip','zoo','able','ache','acre','aged','aide','also',
        'area','army','away','axis','baby','back','bait','bake','bald','bale',
        'ball','balm','band','bane','bang','bank','bare','bark','barn','base',
        'bath','bead','beak','beam','bean','bear','beat','beds','been','beer',
        'bell','belt','bend','bent','berg','best','beta','bets','bias','bike',
        'bill','bind','bird','bite','blow','blue','blur','boar','boat','body',
        'boil','bold','bolt','bomb','bond','bone','book','boot','bore','born',
        'boss','both','bowl','boya','boys','brag','bran','bray','brew','brim',
        'buck','bulk','bull','burn','burst','busy','bute','buys','buzz','byte',
        'cafe','cage','cake','call','calm','came','camp','cane','cape','card',
        'care','carl','carp','cars','cart','case','cash','cast','cats','cave',
        'cell','chap','char','chat','chef','chew','chin','chip','chop','cite',
        'city','clad','clam','clan','clap','clay','clip','clip','club','clue',
        'coal','coat','code','coil','coin','cold','cole','come','cone','cook',
        'cool','cope','copy','cord','core','cork','corn','cost','cosy','cove',
        'crab','crew','crop','crow','crud','cube','cure','curl','cute','dare',
        'dark','dart','dash','data','date','dawn','days','dead','deaf','deal',
        'dean','dear','debt','deck','deed','deem','deep','deer','demo','deny',
        'desks','dial','dice','diet','digs','dike','dill','dime','dine','ding',
        'dip','dire','dirt','disc','dish','disk','dive','dock','does','dome',
        'done','doom','door','dose','dots','dove','down','doze','drag','drain',
        'drama','drank','draw','dream','dress','drew','dried','drift','drill',
        'drink','drive','drop','drown','drum','dry','dual','duck','duct','dude',
        'dull','dumb','dump','dune','dusk','dust','duty','each','earl','earn',
        'ease','east','easy','echo','edge','edit','else','emit','envy','epic',
        'even','ever','evil','exam','face','fact','fade','fail','fair','fake',
        'fall','fame','fare','farm','fast','fate','fawn','fear','feat','feed',
        'feel','feet','fell','felt','fern','feud','file','fill','film','find',
        'fine','fire','firm','fish','fist','five','flag','flap','flat','flaw',
        'flea','fled','flew','flex','flip','flit','flog','flop','flow','flue',
        'foam','foil','fold','folk','fond','font','food','fool','foot','ford',
        'fore','fork','form','fort','foul','found','four','fowl','fox','free',
        'from','fuel','full','fund','fury','fuse','fuss','gain','gait','gale',
        'game','gang','gape','garb','gate','gave','gaze','gear','gene','gift',
        'gild','gill','gilt','girl','gist','give','glad','glow','glue','glut',
        'gnat','gnaw','goat','goes','gold','golf','gone','good','gore','gown',
        'grab','gram','gray','grew','grid','grim','grin','grip','grit','grow',
        'gulf','gull','gulp','guru','gush','gust','hack','hail','hair','half',
        'hall','halt','hand','hang','hard','hare','harm','harp','hash','haste',
        'hate','haul','have','hawk','haze','hazy','head','heal','heap','hear',
        'heat','heed','heel','heir','held','hell','help','hemp','herb','herd',
        'here','hero','hers','hike','hill','hilt','hind','hint','hire','hold',
        'hole','holy','home','hone','hono','hood','hook','hoop','hope','horn',
        'hose','host','hour','howl','huge','hull','hung','hunt','hurl','hurt',
        'hymn','ibex','ice','icon','idea','idle','inch','info','into','iron',
        'isle','item','jack','jade','jail','jazz','jean','jest','jibe','jilt',
        'jinx','jive','job','jock','join','joke','jolt','jowl','jump','jury',
        'just','keen','keep','kept','kick','kill','kind','king','kiss','kite',
        'knob','knot','know','lace','lack','lady','laid','lake','lamb','lame',
        'lamp','land','lane','lard','lark','lash','lass','last','late','lawn',
        'laws','lazy','lead','leaf','leak','lean','leap','left','lend','lens',
        'lent','less','lest','liar','lice','lick','lids','lied','lien','lies',
        'life','lift','like','lily','limb','lime','limp','line','link','lint',
        'lion','list','live','load','loaf','loan','lock','loft','logo','lone',
        'long','look','loom','loop','loose','lord','lore','lose','loss','lost',
        'lots','loud','love','luck','lump','lung','lure','lurk','lush','lynx',
        'mace','made','maid','mail','main','make','male','mall','malt','mane',
        'many','mare','mark','mars','mart','mask','mass','mast','mate','maze',
        'meal','mean','meat','meet','melt','memo','mend','menu','mere','mesh',
        'mess','mild','mile','milk','mill','mime','mind','mine','mint','mire',
        'miss','mist','mite','moan','moat','mock','mode','mold','mole','molt',
        'monk','mood','moon','moor','mope','more','morn','moss','most','moth',
        'move','much','muck','mule','mull','murk','muse','mute','myth','nail',
        'name','navy','near','neat','neck','need','neon','nest','news','next',
        'nice','nick','nine','node','none','nook','noon','norm','nose','nose',
        'note','noun','nude','null','numb','oath','odds','open','oral','orbs',
        'oven','over','owe','own','pace','pack','pact','page','paid','pail',
        'pain','pair','pale','pall','palm','pane','pant','papa','pare','park',
        'part','pass','past','path','pave','pawn','pay','peak','peal','pear',
        'peas','peat','peck','peek','peel','peer','pelt','pend','penny','perch',
        'pest','pick','pier','pike','pile','pill','pine','pink','pint','pipe',
        'plan','play','plea','plew','plot','plow','ploy','plug','plum','plus',
        'poem','poet','poke','pole','poll','pond','pool','poor','pope','pops',
        'pore','pork','port','pose','post','pour','pray','prey','prod','prop',
        'prow','pubs','pull','pulp','pump','punch','punk','pupil','pure','push',
        'quit','quiz','race','rack','raft','rage','raid','rail','rain','rake',
        'ramp','rang','rank','rant','rare','rash','rate','rave','rays','read',
        'real','ream','reap','rear','reel','rely','rent','rest','rice','rich',
        'rick','ride','rift','ring','ripe','rise','risk','rite','road','roam',
        'roar','robe','rock','rode','role','roll','romp','rood','roof','rook',
        'room','root','rope','rose','ross','rosy','rot','rouge','rough','round',
        'rout','rove','row','rows','rub','ruby','rude','ruin','rule','rung',
        'runt','ruse','rush','rust','sack','safe','sage','said','sail','sake',
        'sale','salt','same','sand','sane','sang','sank','save','scan','scar',
        'seal','seam','sear','seat','sect','seed','seek','seem','seen','sees',
        'self','sell','send','sent','sept','serf','sets','sew','sham','shay',
        'shed','shin','ship','shod','shoe','shoo','shop','shot','show','shut',
        'sick','side','sift','sigh','sign','silk','sill','silo','silt','sing',
        'sink','sire','site','sit','size','skid','skim','skin','skip','skis',
        'slab','slam','slap','slat','slay','sled','slew','slid','slim','slip',
        'slit','slob','sloe','slop','slot','slow','slug','slum','slur','smut',
        'snap','snag','snip','snob','snow','snub','snug','soak','soap','soar',
        'sock','soda','sofa','soft','soil','sold','sole','some','son','song',
        'soon','sore','sort','soul','soup','sour','sown','span','spar','spas',
        'spat','spay','spec','sped','spew','spin','spit','spot','spry','spud',
        'spur','stab','star','stay','stem','step','stew','stir','stop','stud',
        'stun','such','suit','sulk','sum','sung','sunk','sure','surf','swab',
        'swag','swam','swan','swap','swat','sway','swim','swum','tack','tact',
        'tail','take','tale','talk','tall','tame','tamp','tank','taps','tare',
        'tarn','tart','task','taxi','teal','team','tear','teas','teem','teen',
        'tell','tend','tent','term','test','text','than','that','thee','them',
        'then','they','thin','this','thus','tick','tide','tidy','tidy','tied',
        'tier','ties','tile','till','tilt','time','tiny','tire','toad','toe',
        'toga','togs','toil','told','toll','tomb','tome','tone','tong','tons',
        'tony','took','tool','tops','tore','torn','toss','tour','town','trap',
        'tray','tree','trek','trig','trim','trio','trip','trod','trot','trout',
        'trug','tuck','tuft','tug','tugs','tuna','tune','turf','turn','tusk',
        'twig','twin','type','ugly','undo','unit','unto','upon','urge','used',
        'user','uses','vain','vale','vane','vary','vase','vast','veal','veil',
        'vein','vent','verb','very','vest','veto','vial','vice','view','vine',
        'visa','void','volt','vote','wade','wage','wail','wait','wake','walk',
        'wall','walt','wand','want','ward','warm','warn','warp','wart','wash',
        'wasp','watt','wave','wavy','waxy','ways','weak','weal','wean','wear',
        'webs','wed','wed','weed','week','weep','weld','well','welt','went',
        'wept','were','west','wet','wham','what','when','whet','whom','whys',
        'wide','wife','wild','will','wilt','wily','wind','wine','wing','wink',
        'win','wire','wise','wish','wisp','with','wits','woe','wolf','womb',
        'wood','wool','word','wore','work','worm','worn','wort','wrap','wren',
        'writ','yank','yard','yarn','yawn','year','yeast','yell','yoga','yoke',
        'yolk','your','yuan','zero','zest','zinc','zone','zoom','about','above',
        'abuse','actor','acute','admit','adopt','adult','after','again','agent',
        'agree','ahead','alarm','album','alert','alike','alive','allow','alone',
        'along','alter','among','angel','anger','angle','angry','ankle','apart',
        'apple','apply','arena','argue','arise','armor','array','aside','asset',
        'avoid','awake','award','aware','awful','basic','basis','beach','began',
        'begin','being','below','bench','bible','birth','black','blade','blame',
        'blank','blast','blaze','bleed','blend','bless','blind','block','blood',
        'blown','board','bonus','boost','booth','bound','brain','brand','brave',
        'bread','break','breed','brick','bride','brief','bring','broad','broke',
        'brown','brush','buddy','build','bunch','burst','buyer','cabin','cable',
        'carry','catch','cause','chain','chair','chalk','champ','chant','chaos',
        'charm','chart','chase','cheap','check','cheek','chess','chest','chief',
        'child','china','chunk','civil','claim','clash','class','clean','clear',
        'clerk','click','cliff','climb','cling','clock','close','cloth','cloud',
        'coach','coast','color','couch','count','court','cover','crack','craft',
        'crash','crawl','crazy','cream','crime','cross','crowd','crown','crude',
        'crush','curve','cycle','daily','dance','death','debut','decay','delay',
        'delta','dense','depth','devil','diary','dirty','doubt','dozen','draft',
        'drain','drama','drank','draw','dream','dress','dried','drift','drill',
        'drink','drive','drove','drunk','dry','dump','dust','eager','early',
        'earth','eight','elder','elect','elite','empty','enemy','enjoy','enter',
        'entry','equal','error','event','every','exact','exile','exist','extra',
        'fable','faith','false','fancy','fatal','fault','feast','fence','fever',
        'fiber','field','fifth','fifty','fight','final','first','fixed','flame',
        'flash','fleet','flesh','float','flood','floor','flour','fluid','flush',
        'focal','focus','force','forge','forth','forum','found','frame','frank',
        'fraud','fresh','front','frost','froze','fruit','fully','funny','giant',
        'given','glass','globe','glory','going','grace','grade','grain','grand',
        'grant','graph','grasp','grass','grave','great','greed','green','greet',
        'grief','grill','grind','groan','gross','group','grove','grown','guard',
        'guess','guest','guide','guild','guilt','habit','happy','harsh','heart',
        'heavy','hence','honor','horse','hotel','house','human','humor','hurry',
        'ideal','image','imply','index','inner','input','irony','ivory','jewel',
        'joint','joker','judge','juice','juicy','knock','known','label','labor',
        'large','laser','later','laugh','layer','learn','lease','least','leave',
        'legal','lemon','level','light','limit','linen','liver','local','lodge',
        'logic','login','loose','lover','lower','loyal','lucky','lunch','lying',
        'magic','major','maker','manor','maple','march','match','mayor','media',
        'mercy','merge','merit','metal','meter','midst','might','minor','minus',
        'mirth','model','money','month','moral','motor','mount','mouse','mouth',
        'mover','movie','music','naive','nerve','never','newly','night','noble',
        'noise','north','noted','novel','nurse','nylon','occur','ocean','offer',
        'often','olive','onset','opera','orbit','order','organ','other','ought',
        'outer','owned','owner','oxide','ozone','paint','panel','panic','paper',
        'party','paste','patch','pause','peace','pearl','penny','phase','phone',
        'photo','piano','piece','pilot','pitch','pixel','pizza','place','plain',
        'plane','plant','plate','plaza','plead','pluck','point','polar','porch',
        'poser','pound','power','press','price','pride','prime','prince','print',
        'prior','prize','probe','prone','proof','prose','proud','prove','psalm',
        'pulse','pupil','purse','queen','query','quest','queue','quick','quiet',
        'quite','quota','quote','radar','radio','raise','rally','range','rapid',
        'ratio','reach','react','ready','realm','rebel','refer','reign','relax',
        'reply','rider','ridge','rifle','right','rigid','risky','rival','river',
        'robin','rocky','rough','round','route','royal','rugby','ruler','rural',
        'sadly','saint','salad','sauce','scale','scare','scene','scent','scope',
        'score','scout','scrap','sense','serve','setup','seven','shade','shaft',
        'shake','shall','shame','shape','share','sharp','sheep','sheer','sheet',
        'shelf','shell','shift','shine','shirt','shock','shoot','shore','short',
        'shout','sight','sigma','silly','since','sixth','sixty','sized','skill',
        'skull','slash','slate','sleep','slice','slide','slope','small','smart',
        'smell','smile','smoke','snake','solar','solid','solve','sorry','sound',
        'south','space','spare','spark','speak','speed','spell','spend','spent',
        'spice','spine','spite','split','spoke','spoon','sport','spray','squad',
        'stack','staff','stage','stain','stair','stake','stale','stall','stamp',
        'stand','stare','stark','start','state','stays','steady','steam','steel',
        'steep','steer','stern','stick','stiff','still','stock','stole','stone',
        'stood','store','storm','story','stout','stove','strap','straw','stray',
        'strip','stuck','study','stuff','style','sugar','suite','super','surge',
        'swamp','swear','sweat','sweet','swept','swift','swing','sword','swore',
        'sworn','syrup','table','taste','teach','teeth','tempo','tense','terms',
        'theft','theme','thick','thing','think','third','thorn','those','three',
        'threw','throw','thumb','tight','timer','tired','title','today','token',
        'topic','total','touch','tough','towel','tower','toxic','trace','track',
        'trade','trail','train','trait','trash','treat','trend','trial','tribe',
        'trick','tried','troop','truck','truly','trump','trunk','trust','truth',
        'tumor','twice','twist','tying','ultra','uncle','under','unite','unity',
        'until','upper','upset','urban','usage','usual','utter','valid','value',
        'valve','vault','venue','verse','vigor','vinyl','viral','virus','visit',
        'vista','vital','vivid','vocal','voice','voter','wagon','waste','watch',
        'water','weary','weave','wedge','weigh','weird','whale','wheat','wheel',
        'where','which','while','white','whole','whose','wider','widow','width',
        'witch','woman','women','world','worry','worse','worst','worth','would',
        'wound','wrath','write','wrong','wrote','yacht','yield','young','youth'
    ]);

    function findWordAnagrams(text) {
        const cleaned = text.toLowerCase().replace(/[^a-z]/g, '');
        if (cleaned.length < 2) return [];

        const charCount = {};
        for (const c of cleaned) {
            charCount[c] = (charCount[c] || 0) + 1;
        }

        const found = [];
        for (const word of commonWords) {
            if (word.length < 2 || word.length > cleaned.length) continue;
            if (word === text.toLowerCase()) continue;

            const wordCount = {};
            for (const c of word) {
                wordCount[c] = (wordCount[c] || 0) + 1;
            }

            let isAnagram = true;
            for (const [char, count] of Object.entries(wordCount)) {
                if (!charCount[char] || charCount[char] < count) {
                    isAnagram = false;
                    break;
                }
            }

            if (isAnagram) {
                found.push(word);
            }
        }

        return found;
    }

    function generateShuffledAnagrams(text, count = 10) {
        const anagrams = new Set();
        let attempts = 0;
        const maxAttempts = count * 20;

        while (anagrams.size < count && attempts < maxAttempts) {
            const anagram = generateAnagram(text);
            if (anagram !== text) {
                anagrams.add(anagram);
            }
            attempts++;
        }

        return Array.from(anagrams);
    }

    function solve() {
        const input = inputEl.value.trim();

        if (!input) {
            outputEl.textContent = 'Please enter a word or phrase';
            return;
        }

        try {
            const cleaned = input.replace(/[^a-zA-Z]/g, '');
            if (cleaned.length < 2) {
                outputEl.textContent = 'Please enter at least 2 letters';
                return;
            }

            let html = '<div class="anagram-results">';

            // Find meaningful word anagrams
            const wordAnagrams = findWordAnagrams(input);
            if (wordAnagrams.length > 0) {
                html += '<div class="anagram-section">';
                html += `<h4>Found ${wordAnagrams.length} word anagram(s):</h4>`;
                html += '<div class="anagram-list">';
                wordAnagrams.forEach(word => {
                    html += `<span class="anagram-word">${escapeHtml(word)}</span>`;
                });
                html += '</div></div>';
            }

            // Generate shuffled anagrams
            const shuffled = generateShuffledAnagrams(input, 10);
            if (shuffled.length > 0) {
                html += '<div class="anagram-section">';
                html += `<h4>Random shuffled anagrams:</h4>`;
                html += '<div class="anagram-list">';
                shuffled.forEach(anagram => {
                    html += `<span class="anagram-word">${escapeHtml(anagram)}</span>`;
                });
                html += '</div></div>';
            }

            // Letter breakdown
            const letterCount = {};
            for (const c of cleaned.toLowerCase()) {
                letterCount[c] = (letterCount[c] || 0) + 1;
            }
            html += '<div class="anagram-section">';
            html += '<h4>Letter Breakdown:</h4>';
            html += '<div class="letter-count">';
            for (const [letter, count] of Object.entries(letterCount).sort()) {
                html += `<span class="letter-badge">${letter} × ${count}</span>`;
            }
            html += '</div></div>';

            html += '</div>';
            outputEl.innerHTML = html;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clear() {
        inputEl.value = '';
        outputEl.textContent = '-';
        inputEl.focus();
    }

    solveBtn.addEventListener('click', solve);
    clearBtn.addEventListener('click', clear);
});

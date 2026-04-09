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
 * Crossword Solver
 * Solve crossword puzzle clues
 */

// Common English word dictionary
const DICTIONARY = [
    // 2-letter words
    "am","an","as","at","be","by","do","go","he","hi","if","in","is","it","me","my","no","of","oh","ok",
    "on","or","ox","so","to","up","us","we",
    // 3-letter words
    "act","add","age","ago","air","all","and","any","are","arm","art","ask","ate","bad","bag","ban","bar",
    "bat","bay","bed","bee","beg","bet","bid","big","bit","bow","box","boy","but","buy","can","cap","car",
    "cat","cop","cow","cry","cut","dad","day","den","did","die","dig","dim","dip","dog","dry","due","dug",
    "eat","egg","ego","elf","elm","end","eve","eye","fan","far","fat","fed","fee","few","fit","fix","fly",
    "fog","for","fox","fry","fun","fur","gab","gap","gas","gel","gem","get","god","got","gum","gun",
    "gut","guy","had","has","hat","hay","her","hid","him","hip","his","hit","hog","hop","hot","how","hub",
    "hue","hug","hum","hut","ice","icy","ill","imp","ink","inn","ion","ire","irk","its","ivy","jam","jar",
    "jaw","jay","jet","job","jog","joy","jug","jut","key","kid","kit","lab","lad","lag","lap","law","lay",
    "led","leg","let","lid","lie","lip","lit","log","lot","low","lug","mad","man","map","mar","mat","may",
    "men","met","mid","mix","mob","mod","mom","mop","mud","mug","mum","nag","nap","nay","net","new","nil",
    "nod","nor","not","now","nun","nut","oak","odd","off","oft","oil","old","one","orb","ore","our","out",
    "owe","owl","own","pad","pan","pap","par","pat","paw","pay","pen","per","pet","pie","pig","pin","pit",
    "pod","pop","pot","pro","pry","pub","pun","put","rag","ram","ran","rap","rat","raw","ray","red","rib",
    "rid","rig","rim","rip","rob","rod","rot","row","rub","rug","rum","run","rut","rye","sad","sag","sap",
    "sat","saw","say","sea","set","sew","she","shy","sin","sip","sir","sit","six","ski","sky","sly","sob",
    "sod","son","sow","soy","spy","sty","sub","sum","sun","tab","tad","tag","tan","tap","tar","tax","tea",
    "ten","the","thy","tic","tie","tin","tip","toe","ton","too","top","tot","tow","toy","try","tub","tug",
    "two","urn","use","van","vat","vet","vow","war","was","wax","way","web","wed","wet","who","wig","win",
    "wit","woe","won","wry","yak","yam","yap","yaw","yay","yea","yes","yet","yin","yon","you","zap","zen",
    "zip","zoo",
    // 4-letter words
    "able","ache","acid","aged","aide","aisle","alias","alibi","ally","aloe","also","alto","amber","amend",
    "amid","among","amply","anger","angle","angry","ankle","apart","apple","apply","apron","arena","argue",
    "arise","armor","array","aside","asset","atlas","attic","audio","audit","aunt","avail","avert","avoid",
    "await","awake","award","aware","awful","axe","axis","bacon","badge","badly","bagel","baker","ballet",
    "balloon","bamboo","banjo","bank","banner","barely","bargain","barrel","base","basin","basis","basket",
    "batch","bathe","beach","beam","bean","bear","beat","beauty","bed","bee","beef","beer","before","began",
    "begin","begun","behind","being","below","belt","bench","bend","beneath","bent","best","bet","better",
    "between","beyond","bias","bid","big","bike","bill","bind","bird","birth","bit","bite","black","blade",
    "blame","blank","blast","blaze","bleed","blend","bless","blind","blink","bliss","block","blond","blood",
    "bloom","blow","blue","blur","board","boast","boat","body","boil","bold","bolt","bomb","bond","bone",
    "bonus","book","boost","boot","border","bore","born","borrow","boss","both","bother","bottle","bottom",
    "bound","bow","bowl","box","boy","brace","brain","brake","branch","brand","brave","bread","break",
    "breath","breed","brick","bride","brief","bring","broad","broke","broken","bronze","brother","brought",
    "brown","brush","buddy","budget","build","built","bulb","bulk","bullet","bunch","bundle","burden",
    "burst","bury","bush","busy","button","buy","buyer","by","cab","cabin","cable","cafe","cake","call",
    "calm","came","camera","camp","can","canal","cancel","cancer","candle","candy","cap","capable","cape",
    "carbon","card","care","career","careful","cargo","carpet","carry","cart","case","cash","cast","cat",
    "catch","cause","cave","ceiling","cell","chain","chair","chalk","champ","chance","change","chaos",
    "chapel","charge","charm","chart","chase","cheap","check","cheek","cheer","chef","chess","chest","chew",
    "chief","child","chill","chip","choir","choose","chop","chorus","chose","chosen","church","cinema",
    "circle","cite","city","claim","clap","clash","class","clay","clean","clear","clerk","clever","click",
    "cliff","climb","cling","clip","cloak","clock","close","cloth","cloud","club","clue","coach","coal",
    "coast","coat","code","coffee","coil","coin","cold","collar","colony","color","column","comb","come",
    "comedy","comic","command","common","cook","cool","copper","copy","coral","cord","core","cork","corn",
    "cost","cotton","couch","could","count","country","county","couple","courage","course","court","cousin",
    "cover","cow","crack","craft","crane","crash","crawl","crazy","cream","create","credit","creek","crew",
    "crime","crop","cross","crowd","crown","crude","crush","cry","cube","cult","cup","cure","curious",
    "curl","current","curse","curve","custom","cut","cute","cycle","dad","daily","damage","damp","dance",
    "danger","dare","dark","data","date","dawn","day","dead","deaf","deal","dean","dear","death","debate",
    "debt","decade","decay","deceit","deck","deed","deem","deep","deer","delay","delight","deliver","demand",
    "demise","demo","dense","dental","deny","depart","depend","depth","deputy","derive","desert","design",
    "desire","desk","despite","destroy","detail","detect","device","devise","devote","dial","diamond",
    "diary","dictate","did","die","diet","differ","digital","dignity","dilemma","dine","dinner","dip",
    "direct","dirt","dirty","disco","dish","dismiss","display","ditch","dive","divide","divorce","dock",
    "doctor","dodge","dog","dome","done","door","dose","dot","double","doubt","down","dozen","draft",
    "drag","drain","drama","drank","draw","drawer","dream","dress","drew","dried","drift","drill","drink",
    "drip","drive","drop","drove","drug","drum","dry","duck","due","duke","dull","dumb","dump","during",
    "dusk","dust","duty","each","eager","ear","early","earn","earth","ease","east","easy","eat","echo",
    "edge","edit","educate","effect","effort","egg","ego","eight","either","elbow","elder","elect","elite",
    "else","empty","enable","end","enemy","energy","engage","engine","enjoy","enough","ensure","enter",
    "entire","entry","envy","equal","equip","era","error","escape","essay","estate","even","evening","event",
    "ever","every","evidence","evil","exact","exam","example","excel","except","excess","excite","excuse",
    "execute","exit","expand","expect","expert","export","extend","extent","extra","extreme","eye","face",
    "fact","fade","fail","faint","fair","faith","fall","false","fame","family","famous","fan","fancy","far",
    "fare","farm","fast","fat","fate","father","fault","favor","fear","feast","feather","feature","fed",
    "feed","feel","fellow","female","fence","festival","fever","few","fiber","fiction","field","fierce",
    "fifteen","fifth","fifty","fight","figure","file","fill","film","final","finance","find","fine","finger",
    "finish","fire","firm","first","fish","fit","five","fix","flag","flame","flash","flat","flavor","flee",
    "flesh","flight","float","flood","floor","flour","flow","flower","fluid","flush","fly","foam","focus",
    "fog","fold","folk","follow","fond","food","fool","foot","for","force","ford","forecast","forest","forever",
    "forge","forget","forgive","fork","form","formal","format","former","forth","fortune","forum","forward",
    "fossil","foster","fought","found","four","fourth","fox","frame","frank","fraud","free","freedom","freeze",
    "freight","french","fresh","friend","fright","fringe","from","front","frost","frown","froze","fruit",
    "fuel","full","fun","fund","funny","fur","fury","future","gain","galaxy","gallery","game","gang","gap",
    "garage","garden","garlic","gas","gate","gather","gauge","gaze","gear","gene","general","genius","genre",
    "gentle","genuine","germ","ghost","giant","gift","girl","give","given","glad","glance","glass","glide",
    "globe","gloom","glory","glove","glow","glue","goal","goat","god","goes","going","gold","golf","gone",
    "good","govern","grace","grade","grain","grand","grant","grape","graph","grasp","grass","grave","great",
    "greed","green","greet","grew","grief","grill","grin","grind","grip","groan","grocer","groom","grope",
    "gross","ground","group","grove","grow","guard","guess","guest","guide","guilt","guitar","gun","guy",
    "habit","hair","half","hall","halt","hand","handle","handsome","hang","happen","happy","harbor","hard",
    "harm","harsh","harvest","has","hate","have","hay","hazard","head","heal","health","heap","hear","heart",
    "heat","heaven","heavy","heel","height","heir","held","hell","hello","help","hence","her","herb","here",
    "hero","hers","hide","high","hill","hint","hire","history","hit","hold","hole","holiday","holy","home",
    "honest","honor","hood","hook","hope","horror","horse","host","hostile","hot","hotel","hour","house",
    "hover","how","huge","human","humble","humor","hundred","hung","hunger","hunt","hurry","hurt","husband",
    "hut","ice","icon","idea","ideal","ill","image","imply","inch","income","indeed","index","indoor",
    "industry","infant","inform","injury","ink","inner","innocent","input","insect","inside","insight",
    "inspect","inspire","install","instance","instead","instinct","instruct","insure","intend","intent",
    "interest","into","invest","invite","involve","iron","island","isolate","issue","it","item","its",
    "ivory","jacket","jade","jail","jam","jar","jazz","jeans","jet","jewel","job","join","joint","joke",
    "journey","joy","judge","juice","jump","jungle","junior","jury","just","keen","keep","kept","key",
    "kick","kid","kill","kind","king","kiss","kit","kitchen","kite","knee","knew","knife","knock","knot",
    "know","known","lab","label","labor","lack","ladder","lady","lake","lamp","land","lane","language",
    "lap","large","laser","last","late","laugh","launch","law","lawn","lawsuit","lawyer","lay","layer",
    "lazy","lead","leader","leaf","league","lean","leap","learn","lease","least","leave","lecture","left",
    "leg","legacy","legal","legend","leisure","lend","length","lens","lent","less","lesson","let","letter",
    "level","liberty","library","license","lid","lie","life","lift","light","like","limb","lime","limit",
    "line","link","lion","lip","list","listen","liter","live","liver","load","loan","lobby","local","lock",
    "lodge","log","logic","lonely","long","look","loop","loose","lord","lose","loss","lost","lot","loud",
    "lounge","love","low","loyal","luck","lucky","luggage","lunch","lung","luxury","lying","machine","mad",
    "made","magic","magnet","maid","mail","main","maintain","major","make","male","mall","mammal","manage",
    "manner","manual","many","map","marble","march","margin","marine","mark","market","marriage","married",
    "marry","mask","mass","master","match","material","math","matter","may","maybe","mayor","meal","mean",
    "means","measure","meat","medal","media","medical","medium","meet","member","memory","mental","mention",
    "menu","mercy","mere","merge","merit","mess","message","metal","meter","method","midst","might","mild",
    "mile","military","milk","mill","mind","mine","mineral","minimum","minor","minute","miracle","mirror",
    "miss","missile","mission","mistake","mix","mixed","mixture","mobile","mode","model","modem","modern",
    "modest","module","moist","mold","moment","money","monitor","monkey","month","mood","moon","moral",
    "more","morning","mortgage","most","motel","mother","motion","motor","mount","mountain","mouse","mouth",
    "move","movie","much","mud","mug","multiply","murder","muscle","museum","music","must","my","myth",
    "nail","name","napkin","narrow","nation","native","nature","near","neat","neck","need","needle","neglect",
    "nerve","nest","net","network","neutral","never","new","news","next","nice","night","nine","noble","nod",
    "noise","none","noon","nor","north","nose","not","note","notice","novel","now","nuclear","number","nurse",
    "nut","oak","obey","object","oblige","observe","obtain","obvious","occur","ocean","odd","of","off",
    "offend","offer","office","officer","often","oil","okay","old","olive","omit","on","once","one","only",
    "onto","open","opera","operate","opinion","oppose","opt","option","or","oral","orange","orbit","order",
    "ordinary","organ","orient","origin","other","ought","ounce","our","out","outdoor","outer","output",
    "outrage","oval","oven","over","owe","own","owner","pace","pack","package","page","paid","pain","paint",
    "pair","palace","pale","palm","pan","panel","panic","paper","parade","parcel","pardon","parent","park",
    "part","particle","partly","partner","party","pass","passage","past","patch","path","patience","patient",
    "patrol","pattern","pause","pay","payment","peace","peak","pear","pearl","peasant","pen","pencil",
    "people","pepper","per","perfect","perform","perhaps","period","permit","person","pet","phase","phone",
    "photo","phrase","piano","pick","picture","pie","piece","pig","pile","pilot","pin","pine","pink","pioneer",
    "pipe","pistol","pit","pitch","pizza","place","plain","plan","plane","planet","plant","plastic","plate",
    "platform","play","player","plea","please","pledge","plenty","plot","plug","plunge","plus","pocket",
    "poem","poet","point","poison","pole","police","policy","polish","polite","poll","pond","pool","poor",
    "pop","popular","port","portion","pose","position","positive","possess","possible","post","pot","potato",
    "pound","pour","poverty","powder","power","practice","praise","pray","prayer","preach","precise","prefer",
    "prepare","present","press","pretty","prevent","previous","price","pride","priest","primary","prime",
    "prince","print","prior","prize","problem","process","produce","product","profile","profit","program",
    "progress","project","promise","promote","proof","proper","property","prose","protect","proud","prove",
    "provide","public","pull","pump","punch","punish","pupil","purchase","pure","purple","purpose","purse",
    "push","put","puzzle","pyramid","quality","quarter","queen","quest","question","quick","quiet","quit",
    "quite","quote","race","rack","radar","radiant","radio","rail","rain","raise","rally","ranch","random",
    "range","rank","rapid","rare","rat","rate","rather","ratio","raw","ray","reach","react","read","ready",
    "real","realize","reason","rebel","recall","receive","recent","recipe","record","recover","red","reduce",
    "refer","reform","refuse","regard","regime","region","regret","reject","relate","relax","release","relief",
    "rely","remain","remark","remedy","remember","remind","remove","render","rent","repair","repeat","reply",
    "report","represent","request","require","rescue","research","resemble","reserve","resist","resolve",
    "resort","resource","respect","respond","rest","restore","result","resume","retail","retain","retire",
    "return","reveal","revenue","reverse","review","revise","reward","rhythm","rib","ribbon","rice","rich",
    "rid","ride","ridge","rifle","right","rigid","ring","riot","rip","ripe","rise","risk","ritual","rival",
    "river","road","roar","roast","rob","robe","robot","rock","rocket","rod","role","roll","romance","roof",
    "room","root","rope","rose","rough","round","route","routine","row","royal","rub","rubber","rude","rug",
    "ruin","rule","rumor","run","rural","rush","rust","sacred","sad","saddle","sadly","safe","safety","sail",
    "saint","sake","salad","salary","sale","salmon","salt","same","sample","sand","satisfy","save","scale",
    "scan","scare","scene","scent","schedule","scheme","scholar","school","science","scope","score","screen",
    "screw","script","sea","seal","search","season","seat","second","secret","section","sector","secure",
    "see","seed","seek","seem","seen","select","self","sell","send","senior","sense","sentence","series",
    "serious","servant","serve","service","session","set","settle","seven","severe","sew","sex","shade",
    "shadow","shake","shall","shame","shape","share","sharp","shave","she","shed","sheep","sheet","shelf",
    "shell","shelter","shield","shift","shine","ship","shirt","shock","shoe","shoot","shop","shore","short",
    "shot","should","shoulder","shout","show","shower","shut","shy","sick","side","sigh","sight","sign",
    "signal","silence","silent","silk","silly","silver","similar","simple","sin","since","sing","single",
    "sink","sir","sister","sit","site","six","size","skill","skin","skirt","sky","slam","slap","sleep",
    "slice","slide","slight","slip","slow","small","smart","smash","smell","smile","smoke","smooth","snake",
    "snap","snow","so","soap","soccer","social","society","sock","soft","soil","solar","soldier","sole",
    "solid","solve","some","son","song","soon","sore","sorrow","sort","soul","sound","soup","south","space",
    "spade","spare","speak","special","species","speech","speed","spell","spend","sphere","spice","spider",
    "spike","spin","spirit","spite","split","spoil","spoke","sport","spot","spray","spread","spring","spy",
    "square","stable","stack","staff","stage","stain","stair","stamp","stand","star","start","starve","state",
    "station","stay","steady","steal","steam","steel","steep","steer","stem","step","stick","stiff","still",
    "sting","stir","stock","stomach","stone","stood","stool","stop","store","storm","story","stove","strain",
    "strange","strap","straw","stream","street","stress","stretch","strike","string","strip","stroke","strong",
    "struck","study","stuff","stupid","style","subject","submit","subtle","such","sudden","suffer","sugar",
    "suggest","suit","summer","sun","super","supply","support","sure","surface","surge","surprise","surround",
    "survey","survive","suspect","sustain","swallow","swear","sweat","sweep","sweet","swell","swept","swift",
    "swim","swing","sword","swore","sworn","symbol","system","table","tablet","tackle","tactic","tail",
    "take","tale","talent","talk","tall","tank","tap","tape","target","task","taste","tax","tea","teach",
    "team","tear","tech","teeth","tell","temper","temple","tempo","tenant","tend","tender","tennis","tension",
    "tent","term","terrible","test","text","than","thank","that","the","theater","theme","then","theory",
    "there","these","they","thick","thief","thin","thing","think","third","thirst","this","thorn","those",
    "though","thought","thread","threat","three","threw","thrill","thrive","throat","throne","through",
    "throw","thumb","thunder","thus","ticket","tide","tie","tight","till","time","timid","tiny","tip",
    "tired","title","toast","today","toe","together","toilet","token","told","tomato","tone","tongue","tonight",
    "too","took","tool","tooth","top","topic","toss","total","touch","tough","tour","towel","tower","town",
    "toxic","toy","trace","track","trade","trail","train","trait","tramp","trap","trash","travel","tray",
    "treasure","treat","tree","trend","trial","tribe","trick","tried","trim","trip","triumph","troop","trouble",
    "truck","true","truly","trunk","trust","truth","try","tube","tune","tunnel","turkey","turn","turtle",
    "twelve","twenty","twice","twin","twist","two","type","typical","ugly","ultimate","uncle","under",
    "undo","undress","unfair","unfold","unhappy","union","unique","unit","unite","unity","universal",
    "universe","unknown","unless","until","unusual","up","update","upon","upper","upset","urban","urge",
    "urgent","us","use","used","useful","usual","utility","vacant","valley","valuable","value","van","vanish",
    "vary","vast","vegetable","vehicle","veil","vein","venture","verb","verse","version","very","vessel",
    "veteran","via","vice","victim","victory","video","view","village","vine","violate","violence","virtue",
    "virus","visa","visible","visit","visual","vital","voice","volume","volunteer","vote","vowel","voyage",
    "wage","wait","wake","walk","wall","wander","want","war","warm","warn","wash","waste","watch","water",
    "wave","wax","way","we","weak","wealth","weapon","wear","weather","weave","web","wedding","week",
    "weigh","weight","weird","welcome","welfare","well","west","wet","whale","what","wheat","wheel","when",
    "where","which","while","whisper","white","who","whole","whose","why","wicked","wide","widow","width",
    "wife","wild","will","win","wind","window","wine","wing","winner","winter","wipe","wire","wise","wish",
    "with","within","without","witness","wolf","woman","wonder","wood","wool","word","work","world","worm",
    "worry","worse","worst","worth","would","wound","wrap","wrath","wreck","wrist","write","wrong","yard",
    "year","yell","yellow","yes","yesterday","yet","yield","you","young","your","youth","zero","zone"
];

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Crossword Solver', icon: '\u{1F9E9}' });

    const patternEl = $('#pattern');
    const outputEl = $('#output');
    const solveBtn = $('#solve');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function solve() {
        const pattern = patternEl.value.trim().toLowerCase();

        if (!pattern) {
            outputEl.textContent = 'Please enter a pattern (use ? for unknown letters)';
            return;
        }

        if (!/^[a-z?]+$/.test(pattern)) {
            outputEl.textContent = 'Error: Pattern must contain only letters and question marks (?)';
            return;
        }

        try {
            const regex = new RegExp('^' + pattern.replace(/\?/g, '.') + '$');
            const matches = DICTIONARY.filter(word => regex.test(word));

            if (matches.length === 0) {
                outputEl.textContent = 'No matches found for pattern: ' + pattern;
                return;
            }

            const result = matches.slice(0, 100).join('\n');
            const suffix = matches.length > 100 ? '\n\n... and ' + (matches.length - 100) + ' more' : '';
            outputEl.textContent = result + suffix;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clear() {
        patternEl.value = '';
        outputEl.textContent = '-';
        patternEl.focus();
    }

    solveBtn.addEventListener('click', solve);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(outputEl.textContent);
        });
    }

    patternEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') solve();
    });
});

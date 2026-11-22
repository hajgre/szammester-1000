'use strict';

// Számmester 1000 V7 – feladatkártyák az alaki és valódi értékhez; V6 funkciók megőrizve.
// Nem hivatalos Roblox-termék; nincsenek külső képek vagy játékosadat-kérések.
// 1. A feladatokat a makeQuestion() készíti.
// 2. A render() rajzolja ki a játékot.
// 3. A gombokra kattintást az eseménykezelők dolgozzák fel.

const MODES = [
  { id: 'order', name: 'Számsorrend', emoji: '🔢', desc: 'Rendezd sorba a számokat!' },
  { id: 'place', name: 'Helyi érték', emoji: '🏠', desc: 'Egyes, tízes, százas, ezres.' },
  { id: 'face', name: 'Alaki érték', emoji: '🎯', desc: 'Mennyit ér a számjegy önmagában?' },
  { id: 'real', name: 'Valódi érték', emoji: '💎', desc: 'Mennyit ér a számjegy a helyén?' },
  { id: 'neighbors', name: 'Számszomszédok', emoji: '↔️', desc: 'Kisebb és nagyobb szomszédok.' },
  { id: 'exchange', name: 'Beváltások', emoji: '🧮', desc: 'Százasok, tízesek, egyesek.' },
  { id: 'line', name: 'Számegyenes', emoji: '📏', desc: 'Találd meg a szám helyét!' },
  { id: 'mixed', name: 'Vegyes kihívás', emoji: '🌟', desc: 'Mindenféle feladat egy játékban.' }
];
const LEVELS = [
  { name: 'Kezdő', emoji: '🌱', text: 'Egyszerűbb számok és közvetlen számszomszédok.' },
  { name: 'Haladó', emoji: '⚡', text: 'Változatosabb számok, tízes szomszédok és beváltások.' },
  { name: 'Mester', emoji: '🏆', text: 'Közeli számok, százas szomszédok és összetett beváltások.' }
];
// A kártyapakli külön játékmód, NEM része a 7 kapus kalandnak.
const DIGIT_CARD_MODE = {id:'digitcards',name:'Számjegykártyák',emoji:'🎴',desc:'Kisebb–nagyobb, alaki–valódi érték.'};
const DIGIT_CARD_KINDS = ['face-min','face-max','real-min','real-max'];
const DIGIT_CARDS_PER_GAME = 12;
const QUESTIONS_PER_GAME = 10;
const ADVENTURE_QUESTIONS = 5;
const ADVENTURE_STAGES = MODES.filter(mode => mode.id !== 'mixed');
const HEROES = [
  { id: 'fox', emoji: '🦊', name: 'Róka kalandor' },
  { id: 'cat', emoji: '🐱', name: 'Cica felfedező' },
  { id: 'dragon', emoji: '🐲', name: 'Sárkány őr' }
];
const BOARD_REGIONS = [
  { name:'Számmező', color:'mint', badge:'🌿' },
  { name:'Helyiérték-város', color:'sky', badge:'🏘️' },
  { name:'Számjegyerdő', color:'lilac', badge:'🌳' },
  { name:'Kristályhegy', color:'gold', badge:'💎' },
  { name:'Szomszéd-sziget', color:'blue', badge:'🌊' },
  { name:'Cserebarlang', color:'peach', badge:'🪙' },
  { name:'Számegyenes-vár', color:'rose', badge:'🏰' }
];
// A V2-es mentési kulcsot változatlanul hagyjuk, így a korábbi eredmények megmaradnak.
const HERO_SAVE_KEY = 'szammester1000_board_hero_v3';
// ÚJ mentések külön kulcson. A régi V1–V4 haladást sosem írjuk felül.
const REWARDS_SAVE_KEY = 'szammester1000_rewards_v5_';
const SOUND_SAVE_KEY = 'szammester1000_sound_v5';
const BOSS_QUESTIONS = 2;
// V6: önálló hibagyakorlási mentés minden nehézségi szinthez.
const SMART_SAVE_KEY = 'szammester1000_smart_v6_';
const SMART_TOPICS = [...ADVENTURE_STAGES, DIGIT_CARD_MODE];
const SMART_QUEUE_LIMIT = 60;
const SMART_REVIEWS_TO_MASTER = 2;
const BOSSES = [
  {name:'Számzavaró Manó', icon:'👹', badge:'Számmező hőse', motto:'A sorrend titkát senki sem fejti meg!', type:'moss'},
  {name:'A Tízes Torony Robotja', icon:'🤖', badge:'Helyiérték-védő', motto:'Találd meg a számjegyek helyét!', type:'steel'},
  {name:'Az Álcaerdő Szelleme', icon:'👻', badge:'Számjegynyomozó', motto:'Tudod, mennyit ér a számjegy?', type:'violet'},
  {name:'Kristálykolosszus', icon:'🪨', badge:'Kristálymester', motto:'A valódi érték a kulcs!', type:'crystal'},
  {name:'Szigetóriás', icon:'🐙', badge:'Szomszédkapitány', motto:'Ismered a számok szomszédait?', type:'ocean'},
  {name:'Beváltások Őrzője', icon:'🧌', badge:'Érmealkimista', motto:'Váltsd be, amit összegyűjtöttél!', type:'ember'},
  {name:'A Számegyenes Sárkánya', icon:'🐉', badge:'Számország bajnoka', motto:'Megtalálod az utolsó titkos helyet?', type:'rose'}
];

// A 3 nehézségi szint kalandmentései egymástól függetlenek.
const ADVENTURE_SAVE_KEY = 'szammester1000_adventure_v1_';
const PLACE_NAMES = ['egyesek', 'tízesek', 'százasok', 'ezresek'];
const PLACE_SHORT = ['egyes', 'tízes', 'százas', 'ezres'];
const app = document.getElementById('app');
const state = {
  view: 'home', mode: 'mixed', level: 0,
  questions: [], index: 0, stars: 0,
  mistakes: false, locked: false, selected: [], inputs: {},
  feedback: null, lastChoice: null, chosenTick: null, best: 0,
  playKind: 'practice', adventureStage: 0, adventureData: null, hero: 'fox', boardAnimationFrom: null,
  rewardData: null, rewardTile: -1, rewardReturn: 'map', rewardClaimed: false, rewardAmount: 0,
  bossStageStars: 0, bossNewBadge: false, bossCoins: 0, soundEnabled: false,
  autoSmartScheduled: 0, reviewWins: 0, reviewMastered: 0, reviewTopic: 'all', reviewFeedback: ''
};

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (items) => items[rand(0, items.length - 1)];
function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function uniqueChoices(correct, candidates, count = 4) {
  const options = [String(correct)];
  for (const candidate of shuffle(candidates)) {
    if (options.length >= count) break;
    const option = String(candidate);
    if (!options.includes(option)) options.push(option);
  }
  while (options.length < count) {
    const option = String(rand(0, 1000));
    if (!options.includes(option)) options.push(option);
  }
  return shuffle(options);
}
function numberParts(number) { return String(number).split('').map(Number); }
function highlightedNumber(number, index) {
  return `<div class="big-number" aria-label="${number}">${numberParts(number).map((d, i) => i === index ? `<span class="highlight-digit">${d}</span>` : `<span>${d}</span>`).join('')}</div>`;
}
function regularNumber(number) { return `<div class="big-number">${number}</div>`; }
function makeOrdering(level) {
  const count = level === 0 ? 4 : level === 1 ? 5 : 6;
  let numbers;
  if (level === 2) {
    const base = rand(80, 930);
    const pool = new Set();
    while (pool.size < count) pool.add(Math.max(0, Math.min(1000, base + rand(-36, 36))));
    numbers = [...pool];
  } else {
    const pool = new Set();
    while (pool.size < count) pool.add(level === 0 ? rand(0, 100) * 10 : rand(0, 1000));
    numbers = [...pool];
  }
  const ascending = Math.random() < .5;
  const sorted = [...numbers].sort((a, b) => ascending ? a - b : b - a);
  return {
    type: 'order', label: 'Számsorrend', title: `Rendezd a számokat ${ascending ? 'növekvő' : 'csökkenő'} sorrendbe!`,
    hint: `Kattints a számokra abban a sorrendben, ahogyan követik egymást. (${ascending ? 'A legkisebbtől indulj.' : 'A legnagyobbtól indulj.'})`,
    numbers: shuffle(numbers), answer: sorted,
    tip: ascending ? 'Hasonlítsd össze a százasokat, utána a tízeseket és az egyeseket!' : 'Először a legnagyobb számot keresd meg!',
    explain: `A helyes sorrend: ${sorted.join(' <span aria-hidden="true">→</span> ')}.`
  };
}
function makePlace(level) {
  const number = level === 2 && rand(1, 7) === 1 ? 1000 : rand(level === 0 ? 100 : 101, 999);
  const digits = numberParts(number);
  const index = rand(0, digits.length - 1);
  const pos = digits.length - 1 - index;
  const askPlace = Math.random() < .5;
  if (askPlace) {
    return {
      type: 'place', label: 'Helyi érték', title: 'Melyik helyi értéken áll a kiemelt számjegy?',
      hint: 'A számjegy helye határozza meg a helyi értékét.',
      number, highlight: index, answer: PLACE_SHORT[pos],
      options: shuffle(PLACE_SHORT.slice(0, digits.length)),
      tip: 'Jobbról balra haladva: egyesek, tízesek, százasok, ezresek.',
      explain: `A(z) ${digits[index]} a(z) <strong>${PLACE_NAMES[pos]}</strong> helyén áll.`
    };
  }
  const answer = digits[index];
  return {
    type: 'place', label: 'Helyi érték', title: `Melyik számjegy áll a(z) ${PLACE_NAMES[pos]} helyén?`,
    hint: 'Figyeld a számjegyek helyét! Jobbról indulj az egyesektől.',
    number, highlight: -1, answer: String(answer),
    options: uniqueChoices(answer, [...digits, ...Array.from({ length: 10 }, (_, n) => n)]),
    tip: 'A legutolsó számjegy az egyes, előtte a tízes, az előtt a százas.',
    explain: `A(z) <strong>${PLACE_NAMES[pos]}</strong> helyén a(z) <strong>${answer}</strong> számjegy áll.`
  };
}
function makeFace(level) {
  const number = level === 2 && rand(1, 7) === 1 ? 1000 : rand(level === 0 ? 100 : 101, 999);
  const digits = numberParts(number);
  const index = rand(0, digits.length - 1);
  const answer = digits[index];
  return {
    type: 'face', label: 'Alaki érték', title: 'Mennyi a kiemelt számjegy alaki értéke?',
    hint: 'Az alaki érték maga a számjegy – függetlenül attól, hol áll.',
    number, highlight: index, answer: String(answer),
    options: uniqueChoices(answer, [...digits, ...Array.from({ length: 10 }, (_, n) => n)]),
    tip: 'Az alaki értéknél csak azt nézd, melyik számjegyet látod!',
    explain: `A kiemelt számjegy <strong>${answer}</strong>, ezért az alaki értéke is <strong>${answer}</strong>.`
  };
}
function makeReal(level) {
  const number = level === 2 && rand(1, 7) === 1 ? 1000 : rand(level === 0 ? 100 : 101, 999);
  const digits = numberParts(number);
  const viable = digits.map((d, index) => ({ d, index })).filter(item => item.d !== 0);
  const { d, index } = pick(viable);
  const pos = digits.length - 1 - index;
  const answer = d * (10 ** pos);
  const plausible = [d, d * 10, d * 100, d * 1000, 10 ** pos, 10 ** Math.min(3, pos + 1),
    ...Array.from({ length: 12 }, (_, i) => rand(1, 9) * (10 ** rand(0, 3)))].filter(v => v <= 1000);
  return {
    type: 'real', label: 'Valódi érték', title: 'Mennyi a kiemelt számjegy valódi értéke?',
    hint: 'Figyeld meg a számjegyet ÉS a helyét!',
    number, highlight: index, answer: String(answer), options: uniqueChoices(answer, plausible),
    tip: 'Valódi érték = számjegy × helyi érték (1, 10, 100 vagy 1000).',
    explain: `A(z) ${d} a(z) ${PLACE_NAMES[pos]} helyén áll: <strong>${d} × ${10 ** pos} = ${answer}</strong>.`
  };
}
function makeNeighbors(level) {
  const step = [1, 10, 100][level];
  let n = rand(1, 999);
  if (step > 1) while (n % step === 0) n = rand(1, 999);
  const low = step === 1 ? n - 1 : Math.floor(n / step) * step;
  const high = step === 1 ? n + 1 : low + step;
  const kind = ['egyes', 'tízes', 'százas'][level];
  return {
    type: 'neighbors', label: 'Számszomszédok', title: `Melyek a(z) ${n} ${kind} szomszédai?`,
    hint: `Add meg a kisebb és a nagyobb ${kind} szomszédot is.`,
    n, answer: [low, high],
    tip: level === 0 ? 'Az egyes szomszédok: eggyel kisebb és eggyel nagyobb szám.' :
      `A ${kind} szomszédok a számot közvetlenül körülvevő ${step}-zel osztható számok.`,
    explain: `A(z) ${n} ${kind} szomszédai: <strong>${low}</strong> és <strong>${high}</strong>.`
  };
}
function makeExchange(level) {
  let sz, t, e;
  if (level === 0) { sz = rand(1, 8); t = rand(0, 9); e = rand(0, 9); }
  else if (level === 1) { sz = rand(1, 7); t = rand(10, 19); e = rand(0, 9); }
  else { sz = rand(1, 6); t = rand(10, 19); e = rand(10, 49); }
  const answer = sz * 100 + t * 10 + e;
  return {
    type: 'exchange', label: 'Beváltások', title: 'Melyik számot írja le a felbontás?',
    hint: 'Váltsd át a százasokat, tízeseket és egyeseket, majd add össze!',
    expression: `${sz}sz + ${t}t + ${e}e`, answer,
    tip: '1 százas = 100 egyes, 1 tízes = 10 egyes. A tízesből 10 darab 1 százas.',
    explain: `<strong>${sz} × 100 + ${t} × 10 + ${e} = ${answer}</strong>.`
  };
}
function makeNumberline(level) {
  const step = [100, 20, 10][level];
  const start = level === 0 ? 0 : rand(0, Math.floor((1000 - 10 * step) / step)) * step;
  const targetIndex = rand(1, 9);
  const target = start + targetIndex * step;
  return {
    type: 'line', label: 'Számegyenes', title: `Hol helyezkedik el a(z) ${target} a számegyenesen?`,
    hint: 'Kattints a megfelelő osztásra! Minden szakasz egyforma hosszú.',
    start, step, target, targetIndex,
    tip: `A két szélső szám között 10 egyforma szakasz van. Egy szakasz ${step}-at ér.`,
    explain: `A(z) ${target} a(z) <strong>${targetIndex + 1}. jelölésnél</strong> van, mert ${start} + ${targetIndex} × ${step} = ${target}.`
  };
}
// V7 – négyféle kártya 3-3 példányban, véletlen sorrendben.
// Minden számjegy különböző, így mindig pontosan egy jó válasz van.
function makeDigitCard(kind, level) {
  let digits;
  if (level === 0) digits = shuffle([1,2,3,4,5,6]).slice(0,3);
  else if (level === 1) digits = shuffle([1,2,3,4,5,6,7,8,9]).slice(0,3);
  else {
    // Haladó helyzet: a 0 is megjelenhet a tízesek vagy egyesek között.
    digits = shuffle([1,2,3,4,5,6,7,8,9]).slice(0,3);
    if (Math.random()<.55) digits[rand(1,2)]=0;
  }
  const number=digits[0]*100+digits[1]*10+digits[2];
  const realValues=digits.map((digit,i)=>digit*[100,10,1][i]);
  const measure=kind.startsWith('face')?digits:realValues;
  const isMin=kind.endsWith('min');
  const value=isMin?Math.min(...measure):Math.max(...measure);
  const answerIndex=measure.indexOf(value);
  const answer=String(digits[answerIndex]);
  const what=kind.startsWith('face')?'alaki':'valódi';
  const size=isMin?'legkisebb':'legnagyobb';
  const explanation=what==='alaki'
    ? `A számjegyek alaki értéke: <strong>${digits.join(', ')}</strong>. A ${size} a <strong>${answer}</strong>.`
    : `Valódi értékek: <strong>${digits[0]} → ${realValues[0]}</strong>, <strong>${digits[1]} → ${realValues[1]}</strong>, <strong>${digits[2]} → ${realValues[2]}</strong>. A ${size} érték <strong>${value}</strong>, ezért a helyes számjegy: <strong>${answer}</strong>.`;
  return {
    type:'digitcards', cardKind:kind, number, label:'🎴 Számjegykártya',
    title:`Melyik számjegynek a ${size} ${what==='alaki'?'az alaki':'a valódi'} értéke?`,
    hint:'Kattints a 3 számjegy közül a megfelelőre!', answer,
    options:shuffle(digits.map(String)), highlight:-1,
    explain:explanation,
    tip:what==='alaki'?'Alaki érték: magát a számjegyet hasonlítsd össze!':
      'Valódi érték: százas × 100, tízes × 10, egyes × 1. Figyelj a nullára is!'
  };
}
function makeDigitCardDeck(level) {
  const kinds=[];
  for(let round=0;round<3;round++) {
    const group=shuffle(DIGIT_CARD_KINDS);
    // Ne ismétlődjön közvetlenül ugyanaz a kérdéstípus a két kör határán.
    if(kinds.length && group[0]===kinds[kinds.length-1]) [group[0],group[1]]=[group[1],group[0]];
    kinds.push(...group);
  }
  return kinds.map(kind=>makeDigitCard(kind,level));
}
function insertSavedDigitCards(questions) {
  const entries=smartRead().queue.filter(e=>e.q.type==='digitcards'&&DIGIT_CARD_KINDS.includes(e.q.cardKind))
    .sort((a,b)=>a.successes-b.successes||a.last-b.last).slice(0,2);
  const used=new Set();
  entries.forEach(entry=>{
    const index=questions.findIndex((q,i)=>i>=3 && !used.has(i) && q.cardKind===entry.q.cardKind);
    if(index>=0){ questions[index]=smartQuestion(entry); used.add(index); }
  });
  return questions;
}
function makeQuestion(type, level) {
  switch (type) {
    case 'order': return makeOrdering(level);
    case 'place': return makePlace(level);
    case 'face': return makeFace(level);
    case 'real': return makeReal(level);
    case 'neighbors': return makeNeighbors(level);
    case 'exchange': return makeExchange(level);
    case 'line': return makeNumberline(level);
    default: throw new Error('Ismeretlen feladattípus: ' + type);
  }
}
// CSS-sel rajzolt, animált blokkfigurák: nincs szükség képfájlra.
function blockAvatar(heroId, size = 'default', celebration = false) {
  const id = HEROES.some(hero => hero.id === heroId) ? heroId : 'fox';
  return `<span class="block-avatar block-avatar--${id} block-avatar--${size} ${celebration ? 'is-celebrating' : ''}" aria-hidden="true">
    <span class="avatar-tail"></span><span class="avatar-leg avatar-leg-left"></span><span class="avatar-leg avatar-leg-right"></span>
    <span class="avatar-arm avatar-arm-left"></span><span class="avatar-arm avatar-arm-right"></span>
    <span class="avatar-torso"><span class="avatar-mark">★</span></span>
    <span class="avatar-head"><span class="avatar-ears"></span><span class="avatar-eye avatar-eye-left"></span><span class="avatar-eye avatar-eye-right"></span><span class="avatar-smile"></span></span>
  </span>`;
}
// --- V6: az elrontott feladatok ismétlődő, helyben tárolt gyakorlása ---
// Minden nehézségi szinthez külön lista tartozik. A korábbi V1-V5 kulcsokat nem írjuk át.
function smartFresh() { return { queue: [], mastered: 0, wrongTotal: 0 }; }
function smartQuestionCore(question) {
  // A kijelzőn felbukkanó, eredetileg generált feladat pontos másolata.
  const cloned = { ...question };
  delete cloned.__smartId;
  return cloned;
}
function smartQuestionId(question) {
  const q=smartQuestionCore(question);
  // A kanonikus válaszokból készülő stabil azonosító. Nem igényel hálózatot.
  return JSON.stringify([q.type,q.number,q.highlight,q.n,q.start,q.step,q.targetIndex,
    q.expression,q.numbers,q.answer,q.title,q.cardKind]);
}
function smartRead() {
  const d=smartFresh();
  try {
    const saved=JSON.parse(window.localStorage.getItem(SMART_SAVE_KEY+state.level)||'null');
    if (!saved || !Array.isArray(saved.queue)) return d;
    d.mastered=Number.isSafeInteger(saved.mastered)?Math.max(0,saved.mastered):0;
    d.wrongTotal=Number.isSafeInteger(saved.wrongTotal)?Math.max(0,saved.wrongTotal):0;
    d.queue=saved.queue.filter(entry=>entry && typeof entry==='object' &&
      entry.q && typeof entry.q==='object' && SMART_TOPICS.some(m=>m.id===entry.q.type) &&
      typeof entry.q.title==='string' && typeof entry.q.explain==='string' &&
      entry.q.title.length<400 && entry.q.explain.length<800 &&
      typeof entry.id==='string' && entry.id===smartQuestionId(entry.q))
      .slice(0,SMART_QUEUE_LIMIT).map(entry=>({
        id:entry.id, q:smartQuestionCore(entry.q),
        successes:Math.max(0,Math.min(1,Number(entry.successes)||0)),
        wrongs:Math.max(1,Math.min(999,Number(entry.wrongs)||1)),
        last:Number.isFinite(entry.last)?entry.last:0
      }));
  } catch(error) { /* Tárhely tiltásakor is játszható marad. */ }
  return d;
}
function smartWrite(d) {
  try { window.localStorage.setItem(SMART_SAVE_KEY+state.level,JSON.stringify(d)); }
  catch(error) { /* Nem érinti a V5 játékmenetet. */ }
}
function smartPendingCount(topic='all') {
  return smartRead().queue.filter(e=>topic==='all'||e.q.type===topic).length;
}
function smartQuestion(entry) { return {...smartQuestionCore(entry.q), __smartId:entry.id}; }
function insertSavedSmartQuestions(questions, topic) {
  const chosen=smartRead().queue.filter(e=>topic==='mixed'||e.q.type===topic)
    .sort((a,b)=>a.successes-b.successes || a.last-b.last).slice(0,2);
  const indices=[3,7];
  chosen.forEach((entry,i)=>{if(indices[i]<questions.length)questions[indices[i]]=smartQuestion(entry);});
  return questions;
}
function smartRememberMistake(q) {
  const d=smartRead(), id=smartQuestionId(q);
  let entry=d.queue.find(e=>e.id===id);
  if (!entry) {
    entry={id,q:smartQuestionCore(q),successes:0,wrongs:1,last:Date.now()};
    if (d.queue.length>=SMART_QUEUE_LIMIT) d.queue.shift();
    d.queue.push(entry);
  } else {
    entry.successes=0; entry.wrongs+=1; entry.last=Date.now();
  }
  d.wrongTotal+=1;
  smartWrite(d);
  // A sima gyakorlásban egy hibás feladat 3 későbbi kérdéssel ismét megjelenhet.
  // A kaland és a főellenfél rögzített 5/2 feladatos menetéhez nem nyúlunk.
  if ((state.playKind==='practice'||state.playKind==='cards') && !q.__smartId && state.autoSmartScheduled<2) {
    for (let k=state.index+3;k<state.questions.length;k++) {
      if (!state.questions[k].__smartId &&
          (state.playKind!=='cards'||state.questions[k].cardKind===q.cardKind)) {
        state.questions[k]=smartQuestion(entry);
        state.autoSmartScheduled+=1;
        break;
      }
    }
  }
}
function smartRewardReview(q) {
  if (!q.__smartId) return '';
  const d=smartRead(), entry=d.queue.find(e=>e.id===q.__smartId);
  if (!entry) return '';
  if (state.mistakes) return 'A helyes megoldás után még gyakoroljuk ezt a feladatot.';
  entry.successes+=1;
  if (state.playKind==='review') state.reviewWins+=1;
  if (entry.successes>=SMART_REVIEWS_TO_MASTER) {
    d.queue=d.queue.filter(e=>e.id!==entry.id);
    d.mastered+=1;
    if (state.playKind==='review') state.reviewMastered+=1;
    smartWrite(d);
    return '🏅 Kétszer önállóan sikerült! Ezt a feladatot már megtanultad.';
  }
  entry.last=Date.now();
  smartWrite(d);
  return '🌱 Megvan az első önálló jó megoldás! Egy későbbi körben még egyszer ellenőrizzük.';
}
function renderSmartHub() {
  const d=smartRead();
  const count=smartPendingCount(state.reviewTopic);
  const all=d.queue.length;
  app.innerHTML=`<section class="smart-hub">
    <button type="button" class="text-button" data-action="home">← Vissza a főmenübe</button>
    <div class="smart-hub-title"><span class="smart-hub-icon" aria-hidden="true">🧠</span>
      <div><p class="eyebrow">V6 • OKOS GYAKORLÁS</p><h1>Hibáimból tanulok</h1>
      <p>Nem baj, ha valami elsőre nem sikerül. A feladatot félretesszük, és később újra elővesszük. Két külön alkalommal, segítség nélkül adott jó válasz után lekerül a gyakorlólistáról.</p></div>
    </div>
    <div class="smart-counters"><div><span>📌</span><strong>${all}</strong><small>gyakorlásra vár</small></div>
      <div><span>🏅</span><strong>${d.mastered}</strong><small>már megtanultad</small></div>
      <div><span>🔄</span><strong>${d.queue.filter(e=>e.successes===1).length}</strong><small>még egy jó válasz kell</small></div></div>
    <div class="smart-pick-level"><strong>Válassz nehézséget!</strong>
      <div class="level-buttons">${LEVELS.map((lev,i)=>`<button type="button" class="level-button ${state.level===i?'selected':''}" data-action="review-level" data-level="${i}" aria-pressed="${state.level===i}">${lev.emoji} ${lev.name}</button>`).join('')}</div></div>
    <h2>Melyik témakört gyakoroljuk?</h2>
    <div class="smart-topic-grid">
      <button type="button" class="smart-topic ${state.reviewTopic==='all'?'chosen':''}" data-action="review-topic" data-topic="all" aria-pressed="${state.reviewTopic==='all'}"><span>🌈</span><strong>Mindegyik témakör</strong><small>${all} feladat</small></button>
      ${SMART_TOPICS.map(mode=>`<button type="button" class="smart-topic ${state.reviewTopic===mode.id?'chosen':''}" data-action="review-topic" data-topic="${mode.id}" aria-pressed="${state.reviewTopic===mode.id}"><span>${mode.emoji}</span><strong>${mode.name}</strong><small>${smartPendingCount(mode.id)} feladat</small></button>`).join('')}
    </div>
    <div class="smart-launch">
      <div><strong>${count?`${count} feladat vár a kiválasztott témában`:'Minden feladatod rendben van! 🎉'}</strong>
      <p>${count?'Egy körben legfeljebb 5 különböző hibás feladat jön elő. Nincs időkorlát és érmelevonás.':'Játssz egy szokásos kört! Ha valami nem sikerül, megjelenik itt a gyakorlólistádban.'}</p></div>
      <button type="button" class="primary-button" data-action="review-start" ${count?'':'disabled'}>🔁 ${count?'Ismétlés indítása':'Most nincs ismételnivaló'}</button>
    </div>
    <p class="smart-privacy">🔐 A gyakorlólista kizárólag ebben a böngészőben tárolódik. Név, fiók és internetkapcsolat nem szükséges; más eszközön nem jelenik meg automatikusan.</p>
  </section>`;
}
function beginSmartReview() {
  const entries=smartRead().queue.filter(e=>state.reviewTopic==='all'||e.q.type===state.reviewTopic)
    .sort((a,b)=>a.successes-b.successes || a.last-b.last).slice(0,5);
  if (!entries.length) { state.view='smart'; render(); return; }
  state.playKind='review';
  state.mode=state.reviewTopic==='all'?'mixed':state.reviewTopic;
  state.questions=entries.map(smartQuestion);
  state.index=0; state.stars=0; state.reviewWins=0; state.reviewMastered=0;
  state.view='game'; resetQuestionState(); render();
}
function renderSmartResult() {
  const d=smartRead();
  app.innerHTML=`<section class="result-screen smart-result">
    <div class="result-emoji" aria-hidden="true">🧠</div>
    <p class="eyebrow">ISMETLŐ KÖR TELJESÍTVE</p><h1>Szép munka, tanultál a hibákból!</h1>
    <p>A gyakorlás célja a megértés, nem a gyorsaság. Minden visszatérő feladattal egyre biztosabb lesz a tudásod.</p>
    <div class="smart-counters"><div><span>✅</span><strong>${state.reviewWins}</strong><small>elsőre jó válasz</small></div>
      <div><span>🏅</span><strong>${state.reviewMastered}</strong><small>most megtanult feladat</small></div>
      <div><span>📌</span><strong>${d.queue.length}</strong><small>még gyakorolható</small></div></div>
    <div class="result-buttons"><button type="button" class="primary-button" data-action="review-home">🧠 Gyakorlóműhely</button><button type="button" class="secondary-button" data-action="home">Főmenü</button></div>
    <p class="info-bar">Egy elrontott feladat csak két külön ismétlés során adott, elsőre helyes válasz után kerül le a listáról. A kincsek, főellenfelek és kalandmentések érintetlenek maradnak.</p>
  </section>`;
}
function renderHome() {
  app.innerHTML = `
    <section class="home-hero">
      <div class="hero-text">
        <p class="eyebrow">✦ TANULJ JÁTSZVA!</p>
        <h1>Légy te a <span>számok mestere!</span></h1>
        <p class="hero-sub">Izgalmas matematikai küldetések az 1000-es számkörben. Válassz játékmódot, gyűjts csillagokat, és fejlődj a saját tempódban!</p>
      </div>
      <div class="number-visual" aria-hidden="true"><span class="visual-chip">7</span><span class="visual-chip">100</span><span class="visual-chip">42</span><span class="visual-chip">✦</span></div>
    </section>
    <section class="adventure-feature" aria-label="Új kalandmód">
      <div class="adventure-feature-icon block-feature-icon" aria-hidden="true">${blockAvatar(state.hero, 'feature')}</div>
      <div class="adventure-feature-text">
        <span class="adventure-kicker">V6 • KINCSVADÁSZAT + OKOS GYAKORLÁS</span>
        <h2>Számország: Kincsvadászat</h2>
        <p>Fedezd fel a 35 mezős blokkvilágot! Nyiss 14 kincsesládát, találj 7 meglepetésmezőt, és győzd le a 7 birodalom főellenfelét!</p>
      </div>
      <button type="button" class="adventure-enter" data-action="map">Induljon a kaland! →</button>
    </section>
    <section class="digitcard-feature" aria-label="Számjegykártyák">
      <div class="digitcard-feature-art" aria-hidden="true"><span>9</span><span>3</span><span>6</span></div>
      <div><span class="digitcard-kicker">ÚJDONSÁG • V7 🎴</span><h2>Számjegykártya-kihívás</h2>
        <p>12 kártya · Legkisebb és legnagyobb <strong>alaki</strong> vagy <strong>valódi</strong> érték. A kérdések váltakoznak, a számok mindig újak!</p>
        <p class="digitcard-example">Például: <strong>936</strong> – melyik számjegy valódi értéke a legkisebb?</p></div>
      <button class="digitcard-enter" type="button" data-action="cards">Kártyák indítása →</button>
    </section>
    <section class="smart-feature" aria-label="Okos gyakorlás">
      <div class="smart-feature-mark" aria-hidden="true">🧠</div>
      <div><span class="smart-small-heading">ÚJDONSÁG • V6</span><h2>Hibáimból tanulok</h2>
      <p>A nehezebb feladatok nem vesznek el! Később újra kérdezzük őket, amíg kétszer önállóan jól nem sikerülnek.</p>
      <div class="smart-feature-stats"><span>📌 ${smartPendingCount()} gyakorlásra vár</span><span>🏅 ${smartRead().mastered} megtanult feladat</span></div></div>
      <button class="smart-enter" type="button" data-action="review-home">Irány a gyakorlóműhely →</button>
    </section>
    <section class="home-body" aria-label="Játék beállításai">
      <div class="section-head"><h2>🎮 Válassz egy küldetést!</h2><span>8 játékmód</span></div>
      <div class="mode-grid" role="group" aria-label="Játékmódok">
        ${MODES.map(mode => `<button type="button" class="mode-card ${mode.id === state.mode ? 'selected' : ''}" aria-pressed="${mode.id === state.mode}" data-action="set-mode" data-mode="${mode.id}">
           <span class="mode-emoji" aria-hidden="true">${mode.emoji}</span><span class="mode-name">${mode.name}</span><span class="mode-description">${mode.desc}</span>
        </button>`).join('')}
      </div>
      <div class="level-row">
        <div>
          <p class="level-label">🌈 Milyen nehéz legyen?</p>
          <div class="level-buttons" role="group" aria-label="Nehézségi szint">
            ${LEVELS.map((lev, i) => `<button type="button" class="level-button ${i === state.level ? 'selected' : ''}" data-action="set-level" data-level="${i}" aria-pressed="${i === state.level}">${lev.emoji} ${lev.name}</button>`).join('')}
          </div>
          <p class="level-explain">${LEVELS[state.level].text}</p>
        </div>
        <div class="start-area">
          <button class="primary-button" type="button" data-action="start">Kezdődjön a játék! <span aria-hidden="true">→</span></button>
          <p class="start-note">10 feladat · Nincs időkorlát · Bármikor újrakezdhető</p>
        </div>
      </div>
      <div class="info-bar">💡 <strong>Tipp:</strong> Hibázni ér! A V6 megjegyzi az elrontott feladatokat, és később újra megmutatja őket. A kaland mentései, érméi és jelvényei változatlanok.</div>
    </section>`;
}
function beginGame() {
  // A kártyapakli elkülönül a korábbi nyolc gyakorlómódtól és a hét kaputól.
  if (state.mode==='digitcards') {
    state.playKind='cards';
    state.questions=insertSavedDigitCards(makeDigitCardDeck(state.level));
    state.view='game';state.index=0;state.stars=0;
    state.autoSmartScheduled=state.questions.filter(q=>q.__smartId).length;
    resetQuestionState();render();return;
  }
  state.playKind = 'practice';
  const types = MODES.filter(m => m.id !== 'mixed').map(m => m.id);
  const sequence = state.mode === 'mixed'
    ? shuffle([...types, ...Array.from({ length: QUESTIONS_PER_GAME - types.length }, () => pick(types))])
    : Array(QUESTIONS_PER_GAME).fill(state.mode);
  state.questions = insertSavedSmartQuestions(sequence.map(type => makeQuestion(type, state.level)), state.mode);
  state.view = 'game';
  state.index = 0;
  state.stars = 0;
  state.autoSmartScheduled = state.questions.filter(q => q.__smartId).length;
  resetQuestionState();
  render();
}
function resetQuestionState() {
  state.mistakes = false;
  state.locked = false;
  state.selected = [];
  state.inputs = {};
  state.feedback = null;
  state.lastChoice = null;
  state.chosenTick = null;
  state.reviewFeedback = '';
}

// --- V5: külön mentett jutalmak, továbbra is csak ezen a böngészőn ---
function newRewardData() {
  return { coins:0, chests:Array(35).fill(false), surprises:Array(35).fill(false), tileCoins:Array(35).fill(false),
    bosses:Array(7).fill(false), bossDraft:null };
}
function readRewardData() {
  const fresh=newRewardData();
  try {
    const saved=JSON.parse(window.localStorage.getItem(REWARDS_SAVE_KEY+state.level)||'null');
    if (!saved || typeof saved!=='object') return fresh;
    fresh.coins=Number.isFinite(saved.coins)?Math.max(0,Math.min(999999,Math.floor(saved.coins))):0;
    for (const key of ['chests','surprises','tileCoins','bosses']) {
      if (Array.isArray(saved[key])) fresh[key]=fresh[key].map((_,i)=>saved[key][i]===true);
    }
    const d=saved.bossDraft;
    if (d && Number.isInteger(d.stage) && d.stage>=0 && d.stage<7 &&
        Array.isArray(d.questions) && d.questions.length===BOSS_QUESTIONS &&
        d.questions.every(q=>q && q.type===ADVENTURE_STAGES[d.stage].id) &&
        Number.isInteger(d.index) && d.index>=0 && d.index<BOSS_QUESTIONS) fresh.bossDraft=d;
  } catch(error) { /* Rossz vagy tiltott helyi tárhely esetén kezdő jutalomállapot. */ }
  return fresh;
}
function writeRewardData() {
  if (!state.rewardData) return;
  try { window.localStorage.setItem(REWARDS_SAVE_KEY+state.level, JSON.stringify(state.rewardData)); }
  catch(error) { /* Tárhely nélkül is folytatható a játék. */ }
}
function rewardKind(tile) {
  const local=tile%5;
  return local===1||local===3?'chest':local===2?'surprise':null;
}
function rewardCollected(tile) {
  const kind=rewardKind(tile);
  if (!kind || !state.rewardData) return false;
  return kind==='chest'?state.rewardData.chests[tile]:state.rewardData.surprises[tile];
}
function canCollectBoardReward(tile, progress) {
  const stage=Math.floor(tile/5);
  if (!rewardKind(tile) || !isAdventureUnlocked(stage)) return false;
  const reached=progress.completed[stage] ||
    (progress.draft?.stage===stage && progress.draft.index+(progress.draft.locked?1:0)>=tile%5+1);
  return Boolean(reached && !rewardCollected(tile));
}
function pendingRewardTile() {
  if (state.playKind!=='adventure' || !state.locked) return -1;
  const tile=state.adventureStage*5+state.index;
  return rewardKind(tile) && !rewardCollected(tile) ? tile : -1;
}
function startRewardEvent(tile, returnTo='map') {
  if (!Number.isInteger(tile)||tile<0||tile>=35 || !rewardKind(tile) || rewardCollected(tile)) return;
  state.rewardTile=tile;
  state.rewardReturn=returnTo;
  state.rewardClaimed=false;
  state.rewardAmount=0;
  state.view='reward';
  render();
  playSound('mystery');
}
function claimReward() {
  const tile=state.rewardTile;
  if (state.view!=='reward'||state.rewardClaimed||tile<0||tile>=35||rewardCollected(tile)) return;
  const kind=rewardKind(tile);
  const amount=kind==='chest' ? tile%5===1?12:18 : 7+((tile*5+state.level*3)%3)*5;
  state.rewardData[kind==='chest'?'chests':'surprises'][tile]=true;
  state.rewardData.coins+=amount;
  state.rewardClaimed=true;
  state.rewardAmount=amount;
  writeRewardData();
  playSound('treasure');
  render();
}
function leaveRewardEvent() {
  if (!state.rewardClaimed) return;
  if (state.rewardReturn==='game' && state.playKind==='adventure') {
    state.view='game'; state.index+=1;
    if (state.index>=state.questions.length) { startBossFight(state.adventureStage, state.stars); return; }
    resetQuestionState(); saveAdventureDraft(); render();
  } else openAdventureMap();
}
function saveBossDraft() {
  if (state.playKind!=='boss'||state.view!=='game'||!state.rewardData) return;
  state.rewardData.bossDraft={stage:state.adventureStage,questions:state.questions,index:state.index,
    stars:state.stars,stageStars:state.bossStageStars,mistakes:state.mistakes,locked:state.locked,
    selected:state.selected,inputs:state.inputs,feedback:state.feedback,
    lastChoice:state.lastChoice,chosenTick:state.chosenTick};
  writeRewardData();
}
function saveCurrentGame() {
  if (state.playKind==='boss') saveBossDraft();
  else saveAdventureDraft();
}
function startBossFight(stage, stageStars=0) {
  state.rewardData=state.rewardData||readRewardData();
  state.adventureData=state.adventureData||readAdventureData();
  if (!Number.isInteger(stage)||stage<0||stage>=7||!isAdventureUnlocked(stage)) return;
  const draft=state.rewardData.bossDraft;
  state.playKind='boss'; state.adventureStage=stage;
  state.mode=ADVENTURE_STAGES[stage].id;
  state.bossStageStars=Math.max(0,Math.min(5,Number(stageStars)||0));
  if (draft && draft.stage===stage) {
    state.questions=draft.questions;
    state.index=draft.index;
    state.stars=Math.max(0,Math.min(2,Number(draft.stars)||0));
    state.bossStageStars=Math.max(0,Math.min(5,Number(draft.stageStars)||0));
    state.mistakes=Boolean(draft.mistakes); state.locked=Boolean(draft.locked);
    state.selected=Array.isArray(draft.selected)?draft.selected:[];
    state.inputs=draft.inputs||{};
    state.feedback=draft.feedback||null;
    state.lastChoice=draft.lastChoice??null;
    state.chosenTick=draft.chosenTick??null;
  } else {
    state.questions=Array.from({length:BOSS_QUESTIONS},()=>makeQuestion(state.mode,state.level));
    state.index=0; state.stars=0; resetQuestionState();
  }
  state.view='game';
  saveBossDraft(); render();
  playSound('boss');
}
function completeBossFight() {
  const stage=state.adventureStage;
  state.adventureData.completed[stage]=true;
  state.adventureData.best[stage]=Math.max(state.adventureData.best[stage],state.bossStageStars);
  if (state.adventureData.draft?.stage===stage) state.adventureData.draft=null;
  writeAdventureData();
  state.bossNewBadge=!state.rewardData.bosses[stage];
  state.bossCoins=state.bossNewBadge?25:0;
  if (state.bossNewBadge) {
    state.rewardData.bosses[stage]=true;
    state.rewardData.coins+=25;
  }
  state.rewardData.bossDraft=null;
  writeRewardData();
  state.stars=state.bossStageStars;
  state.view='adventure-result';
  render();
  playSound('victory');
}
function renderReward() {
  const tile=state.rewardTile;
  const chest=rewardKind(tile)==='chest';
  const title=chest?'Kincsesláda!':'Meglepetésmező!';
  app.innerHTML=`<section class="reward-scene ${state.rewardClaimed?'reward-open':''}">
    <p class="eyebrow">✨ ${Math.floor(tile/5)+1}. BIRODALOM · ${tile+1}. MEZŐ</p>
    <div class="reward-object" aria-hidden="true">${state.rewardClaimed?'💰':chest?'🎁':'❓'}</div>
    <h1>${state.rewardClaimed?'Kincs megszerezve!':title}</h1>
    <p>${state.rewardClaimed?'A jutalom már a kincstáradban van.':'A kincs mindig játékbeli jutalom, nem kell hozzá vásárolni.'}</p>
    ${state.rewardClaimed?`<div class="reward-payout">🪙 +${state.rewardAmount} érme</div><p class="reward-total">Összes érméd: <strong>${state.rewardData.coins}</strong></p>`:''}
    <div class="result-buttons"><button type="button" class="primary-button" data-action="${state.rewardClaimed?'reward-continue':'reward-claim'}">${state.rewardClaimed?'Kaland folytatása →':'✨ Felfedem a jutalmat!'}</button></div>
    ${state.rewardClaimed?confettiMarkup():''}
  </section>`;
}
function confettiMarkup() {
  return `<div class="reward-confetti" aria-hidden="true">${Array.from({length:18},(_,i)=>`<span style="--i:${i};--c:${i%4}">${i%2?'✦':'■'}</span>`).join('')}</div>`;
}
function renderBossArena() {
  const b=BOSSES[state.adventureStage];
  const hit=state.index+(state.locked?1:0);
  return `<div class="boss-arena boss-${b.type}" aria-label="Főellenfél: ${b.name}">
     <div class="boss-avatar ${state.locked?'boss-hit':''}" aria-hidden="true">${b.icon}<span class="boss-glow"></span></div>
     <div class="boss-copy"><span class="boss-kicker">⚔️ BIRODALMI FŐELLENFÉL</span>
       <h2>${b.name}</h2><p>„${b.motto}”</p>
       <div class="boss-health" role="progressbar" aria-valuemin="0" aria-valuemax="${BOSS_QUESTIONS}" aria-valuenow="${BOSS_QUESTIONS-hit}" aria-label="Főellenfél megmaradt kihívásai">${Array.from({length:BOSS_QUESTIONS},(_,i)=>`<span class="${i<hit?'lost':''}">${i<hit?'✦':'❤️'}</span>`).join('')}</div>
       <small>${hit} / ${BOSS_QUESTIONS} sikeres kihívás · Nincs időkorlát</small>
     </div>
  </div>`;
}
function renderBadgeShelf() {
  const earned=state.rewardData.bosses.filter(Boolean).length;
  return `<section class="badge-shelf" aria-label="Jutalmak és jelvények">
    <div class="section-head"><h2>🏅 Jelvénygyűjtemény</h2><span>${earned}/7 megszerzett jelvény</span></div>
    <p>Győzd le a birodalmak főellenfeleit! A jelvények és érmék csak játékbeli jutalmak.</p>
    <div class="badge-grid">${BOSSES.map((boss,i)=>`<div class="earned-badge ${state.rewardData.bosses[i]?'is-earned':'is-locked'}"><span aria-hidden="true">${state.rewardData.bosses[i]?boss.icon:'🔒'}</span><strong>${boss.badge}</strong><small>${state.rewardData.bosses[i]?'Megszerezve!':'Még zárolva'}</small></div>`).join('')}</div>
    <div class="milestone-row"><span>${earned>=3?'🥈':'🔒'} Ezüst kalandor – 3 jelvény</span><span>${earned===7?'🏆':'🔒'} Arany számmester – 7 jelvény</span></div>
  </section>`;
}
let audioCtx=null;
function playSound(kind) {
  if (!state.soundEnabled) return;
  try {
    const AudioEngine=window.AudioContext||window.webkitAudioContext;
    if (!AudioEngine) return;
    if (!audioCtx) audioCtx=new AudioEngine();
    if (audioCtx.state==='suspended') audioCtx.resume().catch(()=>{});
    const patterns={
      correct:[[520,0,.09],[700,.11,.11]],error:[[270,0,.1],[240,.12,.12]],
      mystery:[[450,0,.08],[560,.12,.08]],treasure:[[510,0,.10],[640,.13,.1],[780,.28,.16],[990,.47,.19]],
      boss:[[240,0,.12],[300,.16,.12],[375,.32,.15]],victory:[[400,0,.11],[530,.12,.11],[670,.24,.12],[880,.40,.24]],
      click:[[600,0,.09]]};
    const now=audioCtx.currentTime;
    (patterns[kind]||patterns.click).forEach(([hz,delay,duration])=>{
      const oscillator=audioCtx.createOscillator(), gain=audioCtx.createGain();
      oscillator.type=kind==='error'?'triangle':'sine';oscillator.frequency.value=hz;
      gain.gain.setValueAtTime(.0001,now+delay);
      gain.gain.exponentialRampToValueAtTime(.045,now+delay+.014);
      gain.gain.exponentialRampToValueAtTime(.0001,now+delay+duration);
      oscillator.connect(gain);gain.connect(audioCtx.destination);
      oscillator.start(now+delay);oscillator.stop(now+delay+duration+.03);
    });
  } catch(error) { /* A hang nem akadályozhatja meg a játékot. */ }
}
function soundButton() {
  return `<button type="button" class="sound-toggle" data-action="sound" aria-pressed="${state.soundEnabled}" aria-label="Játékhangok ${state.soundEnabled?'kikapcsolása':'bekapcsolása'}">${state.soundEnabled?'🔊 Hang: be':'🔇 Hang: ki'}</button>`;
}

// --- Kaland mód: térkép, 7 kapu, automatikus helyi mentés ---
function emptyAdventureData() {
  return { completed: Array(ADVENTURE_STAGES.length).fill(false), best: Array(ADVENTURE_STAGES.length).fill(0), draft: null };
}
function readAdventureData() {
  const fresh = emptyAdventureData();
  try {
    const saved = JSON.parse(window.localStorage.getItem(ADVENTURE_SAVE_KEY + state.level) || 'null');
    if (!saved || !Array.isArray(saved.completed) || !Array.isArray(saved.best)) return fresh;
    fresh.completed = fresh.completed.map((_, i) => saved.completed[i] === true);
    fresh.best = fresh.best.map((_, i) => Math.max(0, Math.min(ADVENTURE_QUESTIONS, Number(saved.best[i]) || 0)));
    const d = saved.draft;
    if (d && Number.isInteger(d.stage) && d.stage >= 0 && d.stage < ADVENTURE_STAGES.length &&
        Array.isArray(d.questions) && d.questions.length === ADVENTURE_QUESTIONS &&
        Number.isInteger(d.index) && d.index >= 0 && d.index < ADVENTURE_QUESTIONS &&
        d.questions.every(q => q && q.type === ADVENTURE_STAGES[d.stage].id)) {
      fresh.draft = d;
    }
  } catch (error) {
    // Sérült vagy tiltott böngészőtárhely esetén is játszható marad.
  }
  return fresh;
}
function writeAdventureData() {
  if (!state.adventureData) return;
  try { window.localStorage.setItem(ADVENTURE_SAVE_KEY + state.level, JSON.stringify(state.adventureData)); }
  catch (error) { /* Helyi tárhely nélkül az aktuális kör működik tovább. */ }
}
function saveAdventureDraft() {
  if (state.playKind !== 'adventure' || state.view !== 'game' || !state.adventureData) return;
  state.adventureData.draft = {
    stage: state.adventureStage,
    questions: state.questions,
    index: state.index, stars: state.stars,
    mistakes: state.mistakes, locked: state.locked,
    selected: state.selected, inputs: state.inputs,
    feedback: state.feedback, lastChoice: state.lastChoice, chosenTick: state.chosenTick
  };
  writeAdventureData();
}
function openAdventureMap() {
  state.adventureData = readAdventureData();
  state.rewardData = readRewardData();
  // A térképre visszatérve a bábu a legutóbbi jó válasz helyéről ugrik előre.
  if (state.view === 'game' && state.playKind === 'adventure' && state.lastStepFrom !== undefined) {
    state.boardAnimationFrom = state.lastStepFrom;
  } else { state.boardAnimationFrom = null; }
  state.view = 'map';
  render();
}
function isAdventureUnlocked(stage) {
  return stage === 0 || state.adventureData.completed[stage - 1];
}
function startAdventureStage(stage) {
  state.boardAnimationFrom = null;
  state.lastStepFrom = undefined;
  if (!Number.isInteger(stage) || stage < 0 || stage >= ADVENTURE_STAGES.length) return;
  state.adventureData = state.adventureData || readAdventureData();
  state.rewardData = state.rewardData || readRewardData();
  if (!isAdventureUnlocked(stage)) return;
  if (state.rewardData.bossDraft?.stage === stage) { startBossFight(stage); return; }
  state.playKind = 'adventure';
  state.adventureStage = stage;
  state.mode = ADVENTURE_STAGES[stage].id;
  const draft = state.adventureData.draft;
  if (draft && draft.stage === stage) {
    state.questions = draft.questions;
    state.index = draft.index;
    state.stars = Math.max(0, Math.min(ADVENTURE_QUESTIONS, Number(draft.stars) || 0));
    state.mistakes = Boolean(draft.mistakes);
    state.locked = Boolean(draft.locked);
    state.selected = Array.isArray(draft.selected) ? draft.selected : [];
    state.inputs = draft.inputs || {};
    state.feedback = draft.feedback || null;
    state.lastChoice = draft.lastChoice ?? null;
    state.chosenTick = draft.chosenTick ?? null;
  } else {
    state.questions = Array.from({ length: ADVENTURE_QUESTIONS }, () => makeQuestion(state.mode, state.level));
    state.index = 0;
    state.stars = 0;
    resetQuestionState();
  }
  state.view = 'game';
  saveAdventureDraft();
  render();
}
function completeAdventureStage() {
  const progress = state.adventureData;
  const stage = state.adventureStage;
  progress.completed[stage] = true;
  progress.best[stage] = Math.max(progress.best[stage], state.stars);
  progress.draft = null;
  writeAdventureData();
  state.view = 'adventure-result';
}
// A pálya 35 mezős: hét tematikus szakasz, szakaszonként öt mező.
// Páros sorok balról jobbra, páratlan sorok jobbról balra haladnak.
function boardCoord(tileIndex) {
  const row = Math.floor(tileIndex / ADVENTURE_QUESTIONS);
  const spot = tileIndex % ADVENTURE_QUESTIONS;
  const column = row % 2 === 0 ? spot : 4 - spot;
  return { x: 180 + column * 185, y: 178 + row * 147 };
}
function boardRoadPath() {
  let path = 'M 82 178 L 180 178';
  for (let row=0; row<7; row++) {
    const y=178+row*147;
    const endX = row%2===0 ? 920 : 180;
    path += ` L ${endX} ${y}`;
    if (row < 6) {
      const edge = row%2===0 ? 1012 : 88;
      const ny=y+147;
      path += ` Q ${edge} ${y} ${edge} ${y+73.5} Q ${edge} ${ny} ${endX} ${ny}`;
    }
  }
  return path;
}
function boardPosition(progress) {
  const draft=progress.draft;
  if (draft) return Math.max(0, Math.min(35, draft.stage*5 + draft.index + (draft.locked ? 1 : 0)));
  let count=0;
  while (count<7 && progress.completed[count]) count++;
  return count*5;
}
function voxelWorld() {
  // Eredeti, képmentes SVG: blokkok, kockafák, tornyok és kristályok.
  // Minden animáció a böngészőben fut, így GitHub Pages-en is működik.
  const bandColors = ['#85e9a7','#6ccbf5','#82e0c5','#b899fa','#71d1ef','#ffc47c','#ef98d5'];
  const scene = [
    ['tree',36,240,1], ['tree',1045,245,.85], ['coin',1052,118,1], ['cube',875,69,1.1],
    ['house',45,347,.95], ['house',976,335,1], ['cube',1053,390,.75],
    ['tree',41,535,1], ['tree',1011,527,.9], ['tree',967,587,.78],
    ['crystal',42,667,1.15], ['crystal',988,672,.95], ['cube',1034,731,.7],
    ['island',47,854,1], ['island',969,828,.95], ['cube',1040,884,1],
    ['crystal',45,1018,.82], ['coin',998,1007,1], ['cube',1024,1072,.7],
    ['castle',35,1114,1], ['castle',980,1136,.88], ['coin',936,1164,.65]
  ].map(([type,x,y,scale]) => {
    const dims={tree:[110,130],house:[130,140],crystal:[95,130],cube:[85,85],island:[140,120],coin:[90,95],castle:[150,145]};
    const [width,height]=dims[type];
    return `<use href="#voxel-${type}" width="${width}" height="${height}" transform="translate(${x} ${y}) scale(${scale})"/>`;
  }).join('');
  const blockDecor=Array.from({length:7},(_,i)=>{
    const top=i*175;
    return `<g opacity=".23" fill="none" stroke="#ffffff" stroke-width="3"><path d="M0 ${top+32} H1100" stroke-dasharray="20 24"/><path d="M0 ${top+150} H1100" stroke-dasharray="20 26"/></g>`;
  }).join('');
  const road = boardRoadPath();
  return `<svg class="board-landscape voxel-landscape" viewBox="0 0 1100 1225" preserveAspectRatio="none" aria-hidden="true">
   <defs>
    <pattern id="voxelGrid" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M44 0H0V44" fill="none" stroke="#0f2d58" stroke-opacity=".11" stroke-width="2"/></pattern>
    <linearGradient id="voxelRoad" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffcd8"/><stop offset="1" stop-color="#f5ddba"/></linearGradient>
    <symbol id="voxel-tree" viewBox="0 0 110 130"><rect x="45" y="60" width="18" height="55" rx="2" fill="#90653b"/><path d="M45 60l11-6 18 8-11 6Z" fill="#c69a62"/><path d="M10 52L47 28 95 49 59 76Z" fill="#b4f86d"/><path d="M10 52L59 76V103L10 79Z" fill="#36a96c"/><path d="M59 76L95 49V77L59 103Z" fill="#197e63"/><path d="M33 15L60 0 93 18 65 36Z" fill="#cffd88"/><path d="M33 15L65 36V58L33 37Z" fill="#65cf67"/><path d="M65 36L93 18V42L65 58Z" fill="#26a867"/></symbol>
    <symbol id="voxel-house" viewBox="0 0 130 140"><path d="M12 50L72 21 120 46 59 79Z" fill="#ffe39c" stroke="#304d8a" stroke-width="4"/><path d="M12 50L59 79V129L12 103Z" fill="#e47e73" stroke="#304d8a" stroke-width="4"/><path d="M59 79L120 46V99L59 129Z" fill="#fcb4a0" stroke="#304d8a" stroke-width="4"/><path d="M23 43L72 9 124 37 73 70Z" fill="#ae70f9" stroke="#304d8a" stroke-width="4"/><rect x="74" y="88" width="26" height="27" fill="#4cb5fb" stroke="#304d8a" stroke-width="3"/></symbol>
    <symbol id="voxel-crystal" viewBox="0 0 95 130"><path d="M15 43L48 2 85 43 72 115 31 115Z" fill="#bfc0ff" stroke="#514eac" stroke-width="5"/><path d="M48 2L48 115 15 43Z" fill="#f2ddff"/><path d="M48 2L85 43 48 115Z" fill="#7d64db"/><path d="M15 43L48 115 31 115Z" fill="#6854be"/></symbol>
    <symbol id="voxel-cube" viewBox="0 0 85 85"><path d="M6 25L42 4 79 25 43 46Z" fill="#ffe58a" stroke="#4b4783" stroke-width="4"/><path d="M6 25L43 46V80L6 58Z" fill="#e99253" stroke="#4b4783" stroke-width="4"/><path d="M43 46L79 25V58L43 80Z" fill="#c46cb5" stroke="#4b4783" stroke-width="4"/></symbol>
    <symbol id="voxel-island" viewBox="0 0 140 120"><path d="M14 59L67 35 124 60 72 85Z" fill="#a1f7f0" stroke="#287f9b" stroke-width="4"/><path d="M14 59L72 85 71 112 14 88Z" fill="#42a7dd"/><path d="M72 85L124 60V90L71 112Z" fill="#146bb9"/><path d="M36 47L66 31 98 46 68 62Z" fill="#d7fba5"/><path d="M36 47L68 62V70L36 55Z" fill="#5dcb96"/></symbol>
    <symbol id="voxel-coin" viewBox="0 0 90 95"><path d="M22 15L60 4 76 19V72L34 88 18 74Z" fill="#af741c" stroke="#6a427c" stroke-width="4"/><path d="M18 19L59 7 70 20V69L29 82 18 74Z" fill="#ffe47d" stroke="#6a427c" stroke-width="4"/><path d="M43 23L47 36 61 38 50 47 53 62 39 54 26 64 31 47 24 38 37 36Z" fill="#f8a340"/></symbol>
    <symbol id="voxel-castle" viewBox="0 0 150 145"><path d="M25 70L55 55 128 81 96 99Z" fill="#f4cefd"/><path d="M25 70L96 99V140L25 111Z" fill="#8b75e7"/><path d="M96 99L128 81V122L96 140Z" fill="#5548ae"/><path d="M10 45L39 26 62 39 32 58Z" fill="#f6cfff"/><path d="M10 45L32 58V112L10 96Z" fill="#b29cfa"/><path d="M32 58L62 39V96L32 112Z" fill="#745cd4"/><path d="M98 38L122 23 144 37 120 52Z" fill="#f6cfff"/><path d="M98 38L120 52V110L98 99Z" fill="#b29cfa"/><path d="M120 52L144 37V99L120 110Z" fill="#745cd4"/><path d="M20 13L48 0 65 13 37 27Z" fill="#ffe07b"/><path d="M105 12L130 0 149 15 123 27Z" fill="#ffe07b"/><path d="M68 103L86 94 96 99V139L68 126Z" fill="#4a427e"/></symbol>
   </defs>
   ${bandColors.map((color,i)=>`<rect x="0" y="${i*175}" width="1100" height="175" fill="${color}"/>`).join('')}
   <rect width="1100" height="1225" fill="url(#voxelGrid)"/>
   ${blockDecor}
   <path d="M0 780L80 752 160 780 240 751 320 781 400 753 480 784 560 752 640 779 720 756 800 782 880 748 960 773 1100 746" stroke="#fef4b0" stroke-width="13" fill="none" opacity=".28"/>
   ${scene}
   <path d="${road}" fill="none" stroke="#26345e" stroke-width="100" stroke-linecap="round" stroke-linejoin="round" opacity=".25" transform="translate(0 12)"/>
   <path d="${road}" fill="none" stroke="#38456d" stroke-width="90" stroke-linecap="round" stroke-linejoin="round"/>
   <path d="${road}" fill="none" stroke="url(#voxelRoad)" stroke-width="79" stroke-linecap="round" stroke-linejoin="round"/>
   <path d="${road}" fill="none" stroke="#f0bf7a" stroke-width="4" stroke-dasharray="10 18" stroke-linecap="round"/>
  </svg>`;
}
function renderBoard(progress) {
  const position=boardPosition(progress);
  const pawn = position === 0 ? { x: 84, y: 178 } : boardCoord(position-1);
  const oldPosition = Number.isInteger(state.boardAnimationFrom) ? state.boardAnimationFrom : null;
  const origin=oldPosition === null || oldPosition === position ? pawn : oldPosition === 0 ? {x:84,y:178} : boardCoord(Math.min(34,oldPosition-1));
  const moving=oldPosition !== null && oldPosition !== position;
  const regionLabels = BOARD_REGIONS.map((r,i) => {
    const isRight=i%2===1;
    return `<div class="board-region region-${r.color} ${isRight?'region-right':''}" style="left:${isRight?73:27}%;top:${(100+i*147)/1225*100}%"><span>${r.badge} ${r.name}</span></div>`;
  }).join('');
  const tiles = Array.from({length:35},(_,tileIndex)=>{
    const stage=Math.floor(tileIndex/5);
    const loc=boardCoord(tileIndex);
    const stageProgress=progress.completed[stage] ? 5 : progress.draft?.stage===stage ? progress.draft.index+(progress.draft.locked?1:0) : 0;
    const completed=stageProgress>=tileIndex%5+1;
    const unlocked=stage===0 || progress.completed[stage-1];
    const gate=tileIndex%5===4;
    const special=rewardKind(tileIndex);
    const collect=canCollectBoardReward(tileIndex,progress);
    const symbol=gate?'⚔️':special==='chest'?'🎁':special==='surprise'?'❔':'';
    const mark=collect?'revealable':rewardCollected(tileIndex)?'collected':'';
    return `<button type="button" class="board-tile voxel-tile ${completed?'tile-done':''} ${unlocked?'tile-unlocked':'tile-locked'} ${gate?'tile-gate':''} ${special?'tile-reward '+mark:''} ${position===tileIndex+1?'tile-current':''}" style="left:${loc.x/1100*100}%;top:${loc.y/1225*100}%" data-action="${collect?'collect-tile':'stage'}" data-stage="${stage}" data-tile="${tileIndex}" ${unlocked?'':'disabled'} aria-label="${tileIndex+1}. mező, ${ADVENTURE_STAGES[stage].name}${collect?', átvehető jutalom':unlocked?', megnyitható':', lezárva'}" title="${ADVENTURE_STAGES[stage].name}"><span class="board-tile-number">${gate?'★':tileIndex+1}</span>${symbol?`<span class="tile-gift-icon" aria-hidden="true">${symbol}</span>`:''}</button>`;
  }).join('');
  const hero=HEROES.find(h=>h.id===state.hero) || HEROES[0];
  return `<div class="board-scroll" role="region" tabindex="0" aria-label="35 mezős blokkvilág társasjátéktábla; kisebb kijelzőn oldalra görgethető">
   <div class="board-world voxel-world">${voxelWorld()}
     ${regionLabels}
     <div class="board-start-flag">START</div><div class="board-finish-flag">CÉL 🏆</div>
     ${tiles}
     <div class="board-pawn voxel-pawn ${moving?'pawn-advancing':''}" style="left:${pawn.x/1100*100}%;top:${pawn.y/1225*100}%;--pawn-x:${(origin.x-pawn.x)/1100*100}%;--pawn-y:${(origin.y-pawn.y)/1225*100}%" role="img" aria-label="${hero.name} bábu, ${position}. mező">${blockAvatar(state.hero,'board')}</div>
   </div></div>`;
}
function renderAdventureMap() {
  state.adventureData = readAdventureData();
  state.rewardData=readRewardData();
  const progress = state.adventureData;
  const done = progress.completed.filter(Boolean).length;
  const totalStars = progress.best.reduce((sum, n) => sum + n, 0);
  const draft = progress.draft;
  const position=boardPosition(progress);
  app.innerHTML = `<section class="adventure-hero board-hero">
    <button class="text-button adventure-back" type="button" data-action="home">← Vissza a főmenübe</button>
    <p class="eyebrow">🎁 KINCSVADÁSZAT • V6</p>
    <h1>Számország <span>kincsvadászata</span></h1>
    <p>Járd be a hét blokk-birodalmat! Oldj meg matekfeladatokat, nyiss kincsesládákat, gyűjts jelvényeket, és győzd le a hét főellenfelet. <strong>Minden helyes megoldás egy mezővel visz előrébb.</strong></p>
    <div class="adventure-hero-stats"><span>🎲 ${position} / 35 mező</span><span>🔓 ${done} / 7 kapu</span><span>⭐ ${totalStars} / 35 csillag</span><span>🪙 ${state.rewardData.coins} érme</span><span>🏅 ${state.rewardData.bosses.filter(Boolean).length} / 7 jelvény</span></div>
  </section>
  <section class="adventure-map-body board-body">
    <div class="board-toolbar">
      <div><h2>Válassz nehézséget!</h2><p>Mindegyik szintnek saját mentése van.</p></div>
      <div class="level-buttons adventure-level-buttons" role="group" aria-label="Kaland nehézsége">${LEVELS.map((lev,i)=>`<button type="button" class="level-button ${state.level===i?'selected':''}" data-action="map-level" data-level="${i}" aria-pressed="${i===state.level}">${lev.emoji} ${lev.name}</button>`).join('')}</div>
    </div>
    <div class="reward-sound-row"><span>🎵 A hangeffektek szabadon ki-be kapcsolhatók.</span>${soundButton()}</div>
    <div class="smart-map-link"><div><strong>🧠 Hibáimból tanulok</strong><p>${smartPendingCount()} feladat vár ismétlésre ezen a nehézségi szinten.</p></div><button type="button" class="secondary-button" data-action="review-home">Gyakorlóműhely →</button></div>
    <div class="hero-picker voxel-hero-picker"><strong>🧍 Válassz egy blokk-hőst!</strong><div class="hero-options" role="group" aria-label="Játékbábu kiválasztása">${HEROES.map(hero=>`<button type="button" class="hero-option ${state.hero===hero.id?'active':''}" data-action="hero" data-hero="${hero.id}" aria-pressed="${state.hero===hero.id}">${blockAvatar(hero.id,'picker')}<span class="hero-name">${hero.name}</span></button>`).join('')}</div></div>
    ${state.rewardData.bossDraft?`<div class="adventure-resume boss-resume"><div><strong>⚔️ Félbehagyott főellenfél!</strong><span>${BOSSES[state.rewardData.bossDraft.stage].name}</span></div><button type="button" class="primary-button" data-action="boss" data-stage="${state.rewardData.bossDraft.stage}">Folytatom →</button></div>`:''}
    ${draft && !state.rewardData.bossDraft ? `<div class="adventure-resume"><div><strong>📌 Félbehagyott küldetésed van</strong><span>${ADVENTURE_STAGES[draft.stage].name} · ${draft.index+1}. feladat az 5-ből</span></div><button type="button" class="primary-button" data-action="stage" data-stage="${draft.stage}">Folytatom →</button></div>` : ''}
    <div class="board-frame"><div class="board-heading"><span>🧱 BLOKKVILÁG TÁRSASTÁBLA</span><span>7 BIRODALOM · 35 MEZŐ</span></div>${renderBoard(progress)}<p class="board-scroll-tip">📱 Telefonon a pályát oldalirányban is görgetheted.</p></div>
    <div class="board-legend"><span>🧍 A blokk-hősöd jelzi, hol tartasz</span><span>✅ Zöld mező: teljesítve</span><span>🔒 Szürke mező: még zárva</span><span>🎁 Kincsesláda · ❔ Meglepetés · ⚔️ Főellenfél</span></div>
    <div class="board-missions"><h2>🚩 Válassz megnyitott állomást!</h2><p>Öt mező után a birodalom főellenfele vár rád: két extra matekfeladattal győzheted le. A korábban teljesített V4-pályák továbbra is nyitva maradnak.</p>
      <div class="board-mission-grid">${ADVENTURE_STAGES.map((mode,i)=>{
        const unlocked=isAdventureUnlocked(i), completed=progress.completed[i];
        const battleAvailable=completed||state.rewardData.bossDraft?.stage===i;
        return `<div class="mission-group"><button type="button" class="board-mission ${completed?'mission-complete':''}" data-action="stage" data-stage="${i}" ${unlocked?'':'disabled'}><span class="board-mission-emoji">${unlocked?mode.emoji:'🔒'}</span><span><strong>${i+1}. ${mode.name}</strong><small>${completed?`⭐ ${progress.best[i]}/5 · Újrajátszható`:draft?.stage===i?'▶ Folytatás':unlocked?'▶ Kezdés':'Még zárva'}</small></span><span class="board-mission-arrow">${unlocked?'→':'·'}</span></button>${battleAvailable?`<button type="button" class="boss-shortcut" data-action="boss" data-stage="${i}">${state.rewardData.bosses[i]?'🏅 Főellenfél újrakihívása':'⚔️ Főellenfél kihívása'}</button>`:''}</div>`;
      }).join('')}</div></div>
    ${renderBadgeShelf()}
    ${done===7?'<div class="adventure-treasure">🏆 <strong>Gratulálok! Számország minden kapuját kinyitottad!</strong><p>A megszerzett csillagokat a táblán újrajátszással is gyarapíthatod.</p></div>':''}
    <p class="adventure-save-note">💾 A haladás és a bábu választása ezen az eszközön, ebben a böngészőben mentődik. Nem szinkronizálódik automatikusan más eszközre. A korábbi Kaland mód eredményei és a V4-ben megnyitott birodalmak megmaradnak.</p>
  </section>`;
}
function renderAdventureResult() {
  const stage=state.adventureStage;
  const mode=ADVENTURE_STAGES[stage];
  const boss=BOSSES[stage];
  const last=stage===ADVENTURE_STAGES.length-1;
  app.innerHTML=`<section class="result-screen adventure-result victory-result">
    ${confettiMarkup()}
    <div class="result-block-hero">${blockAvatar(state.hero,'victory',true)}</div>
    <div class="result-emoji" aria-hidden="true">${last?'🏆':'🎖️'}</div>
    <p class="eyebrow">🎉 ${stage+1}. BIRODALOM MEGMENTVE!</p>
    <h1>${last?'Számország bajnoka lettél!':'Legyőzted a főellenfelet!'}</h1>
    <p><strong>${boss.name}</strong> legyőzve! ${mode.name}: a kapu öt feladatát és a főellenfél két kihívását is megoldottad.</p>
    <div class="victory-prizes"><span>⭐ ${state.stars} / 5 csillag</span><span>🏅 ${boss.badge}</span><span>🪙 ${state.bossNewBadge?'+25 új érme':'A jelvény már megvolt'}</span></div>
    <p class="best-score">A birodalom eddigi legjobb eredménye: ${state.adventureData.best[stage]} / 5 csillag.</p>
    <div class="result-buttons">${last?'':`<button type="button" class="primary-button" data-action="next-stage">Következő birodalom →</button>`}
       <button type="button" class="secondary-button" data-action="map">🗺️ Vissza a térképhez</button><button type="button" class="secondary-button" data-action="review-home">🧠 Hibáimból tanulok (${smartPendingCount()})</button></div>
    <p class="info-bar">Minden főellenfél gyakorolható újra. Az érméket és a jelvényeket az első győzelemért kapod, így nincsen végtelen jutalomgyűjtés.</p>
  </section>`;
}
function renderChoices(q) {
  return `<div class="choices" role="group" aria-label="Válaszlehetőségek">
    ${q.options.map(value => `<button type="button" data-action="choose" data-value="${value}" class="choice ${state.locked && String(value) === String(q.answer) ? 'correct-choice' : ''}" ${state.locked ? 'disabled' : ''}>${value}</button>`).join('')}
  </div>`;
}
function renderOrder(q) {
  return `<div class="small-label">Választható számok</div>
    <div class="order-pool">${q.numbers.map((number, i) => `<button type="button" data-action="order-pick" data-value="${i}" class="order-tile" ${state.selected.includes(i) || state.locked ? 'disabled' : ''}>${number}</button>`).join('')}</div>
    <div class="small-label">A te sorrended</div>
    <div class="order-selected" aria-live="polite">${state.selected.length ? state.selected.map(i => `<span class="order-tile">${q.numbers[i]}</span>`).join('') : '<span class="order-placeholder">Ide kerülnek a kiválasztott számok.</span>'}</div>
    ${state.locked ? '' : `<div class="inline-actions"><button type="button" class="secondary-button" data-action="order-undo" ${state.selected.length ? '' : 'disabled'}>↶ Visszavonás</button><button type="button" class="secondary-button" data-action="order-clear" ${state.selected.length ? '' : 'disabled'}>↺ Újrakezdés</button><button type="button" class="primary-button" data-action="order-check" ${state.selected.length === q.numbers.length ? '' : 'disabled'}>Ellenőrzés ✓</button></div>`}`;
}
function renderNeighbors(q) {
  return `<div class="big-number" aria-label="${q.n}">${q.n}</div>
    <form data-form="neighbors" class="answer-form">
      <div class="double-answer">
        <label>Kisebb szomszéd<input name="low" class="answer-input" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" placeholder="?" value="${state.inputs.low || ''}" ${state.locked ? 'disabled' : ''} required></label>
        <label>Nagyobb szomszéd<input name="high" class="answer-input" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" placeholder="?" value="${state.inputs.high || ''}" ${state.locked ? 'disabled' : ''} required></label>
      </div>
      ${state.locked ? '' : '<div class="inline-actions"><button type="submit" class="primary-button">Ellenőrzés ✓</button></div>'}
    </form>`;
}
function renderExchange(q) {
  return `<div class="equation" aria-label="${q.expression}">${q.expression}</div>
    <p class="math-legend">sz = százas (100) · t = tízes (10) · e = egyes (1)</p>
    <form data-form="exchange" class="answer-form">
      <label class="sr-only" for="exchangeAnswer">A kapott szám</label>
      <input id="exchangeAnswer" name="answer" class="answer-input" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" placeholder="Írd ide a számot!" value="${state.inputs.answer || ''}" ${state.locked ? 'disabled' : ''} required>
      ${state.locked ? '' : '<div class="inline-actions"><button type="submit" class="primary-button">Ellenőrzés ✓</button></div>'}
    </form>`;
}
function renderNumberline(q) {
  const values = Array.from({ length: 11 }, (_, i) => q.start + i * q.step);
  return `<div class="numberline" role="group" aria-label="Számegyenes, válaszd ki a megfelelő osztást">
    <div class="line-track">${values.map((v, i) => {
      const label = i === 0 || i === 10 || (state.level === 0 && i === 5) ? String(v) : '&nbsp;';
      const classes = `${state.chosenTick === i ? 'selected' : ''} ${state.locked && q.targetIndex === i ? 'correct' : ''}`;
      return `<button type="button" data-action="tick" data-value="${i}" class="tick ${classes}" aria-label="${i + 1}. jelölés, balról számolva" ${state.locked ? 'disabled' : ''}><span class="tick-dot"></span><span class="tick-label" aria-hidden="true">${label}</span></button>`;
    }).join('')}</div>
    <p class="line-callout">Kattints az egyik függőleges jelölésre! A két végpont között 10 egyenlő szakasz van.</p>
  </div>`;
}
function renderDigitCard(q) {
  const tag=q.cardKind.startsWith('face')?'ALAKI ÉRTÉK':'VALÓDI ÉRTÉK';
  const group=q.cardKind.endsWith('min')?'🔽 LEGKISEBB':'🔼 LEGNAGYOBB';
  const digits=numberParts(q.number);
  return `<div class="digitcard-paper" aria-label="Számjegykártya: ${q.number}">
    <div class="digitcard-paper-top"><span>✦ SZÁMMESTER PAKLI</span><span>${tag}</span></div>
    <div class="digitcard-paper-number">${digits.map(d=>`<span>${d}</span>`).join('')}</div>
    <div class="digitcard-paper-kind">${group}</div>
    <div class="digitcard-paper-bottom">Válaszd ki a megfelelő <strong>számjegyet!</strong></div>
  </div>
  <div class="digitcard-choice-label">Kattints egy válaszkártyára:</div>
  <div class="digitcard-choices" role="group" aria-label="Válaszkártyák">
    ${q.options.map(v=>`<button type="button" class="digitcard-choice ${state.locked && String(v)===String(q.answer)?'digitcard-correct':''}" data-action="choose" data-value="${v}" ${state.locked?'disabled':''}>${v}</button>`).join('')}
  </div>`;
}
function renderQuestionContents(q) {
  switch (q.type) {
    case 'order': return renderOrder(q);
    case 'place': case 'face': case 'real':
      return `${q.highlight >= 0 ? highlightedNumber(q.number, q.highlight) : regularNumber(q.number)}${renderChoices(q)}`;
    case 'neighbors': return renderNeighbors(q);
    case 'exchange': return renderExchange(q);
    case 'line': return renderNumberline(q);
    case 'digitcards': return renderDigitCard(q);
    default: return '';
  }
}
function renderBoardMini() {
  const step=state.index+(state.locked?1:0);
  const hero=HEROES.find(h=>h.id===state.hero) || HEROES[0];
  return `<div class="mini-board" aria-label="Társasjáték-állás: ${step} az 5 mezőből"><span class="mini-board-label">🧱 A blokk-hősöd minden jó megoldás után ugrik egyet!</span><div class="mini-track"><span class="mini-start">START</span>${Array.from({length:5},(_,i)=>`<span class="mini-tile ${i<step?'mini-done':''} ${i===step-1?'mini-current':''}">${i===step-1?`<span class="mini-pawn">${blockAvatar(state.hero,'mini')}</span>`:i===4?'⚔️':i===1||i===3?'🎁':i===2?'❔':i+1}</span>`).join('')}<span class="mini-gate">🔑</span></div></div>`;
}
function renderGame() {
  const q = state.questions[state.index];
  const progress = Math.round((state.index / state.questions.length) * 100);
  const bossMode=state.playKind==='boss';
  const reviewing=state.playKind==='review';
  app.innerHTML = `<div class="game-wrap ${bossMode?'game-boss':''}">
    <div class="game-topline"><button type="button" class="text-button" data-action="${state.playKind === 'adventure'||bossMode ? 'map' : reviewing ? 'review-home' : 'home'}">← ${state.playKind === 'adventure'||bossMode ? 'Vissza a térképhez' : reviewing ? 'Vissza a gyakorlóműhelybe' : 'Vissza a főmenübe'}</button><span class="stars">${bossMode?'⚔️ Főellenfél harc':reviewing?'🧠 Ismétlő kör':`⭐ ${state.stars} csillag`}</span>${soundButton()}</div>
    ${state.playKind === 'adventure' ? `<div class="adventure-game-label">🎲 Számország · ${state.adventureStage + 1}. kapu a 7-ből</div>${renderBoardMini()}` : bossMode?renderBossArena():''}
    <div class="game-meta"><span>${(MODES.find(m => m.id === state.mode)||DIGIT_CARD_MODE).name} · ${LEVELS[state.level].name}</span><span>${state.index + 1} / ${state.questions.length}. ${bossMode?'főellenfél-feladat':'feladat'}</span></div>
    <div class="progress-track" role="progressbar" aria-valuenow="${state.index}" aria-valuemin="0" aria-valuemax="${state.questions.length}" aria-label="A játék előrehaladása"><div class="progress-fill" style="width: ${progress}%"></div></div>
    <section class="question-box" aria-label="Aktuális feladat">
      <span class="question-tag">${q.label}</span>
      ${q.__smartId ? '<span class="smart-question-tag">🧠 Visszatérő gyakorlófeladat</span>' : ''}
      <h2 class="question-title">${q.title}</h2>
      <p class="question-hint">${q.hint}</p>
      ${renderQuestionContents(q)}
    </section>
    <div id="answer-feedback" aria-live="polite" aria-atomic="true">
      ${state.feedback ? `<div class="feedback ${state.feedback.type}"><strong>${state.feedback.type === 'success' ? (bossMode?'⚔️ Talált! Sérült a főellenfél!':'🌟 Ügyes vagy, jó megoldás!') : '💡 Próbáld meg még egyszer!'}</strong>${state.feedback.text}${state.feedback.type==='success' && state.reviewFeedback ? `<div class="smart-inline-feedback">${state.reviewFeedback}</div>` : ''}${state.feedback.type === 'success' && state.playKind === 'adventure' ? '<span class="answer-confetti" aria-hidden="true">✦ ✨ ✦</span>' : ''}</div>` : ''}
    </div>
    ${state.locked ? `<div class="question-footer"><button type="button" class="primary-button" data-action="next">${bossMode?(state.index===BOSS_QUESTIONS-1?'Főellenfél legyőzése 🏆':'Következő támadás ⚔️'):reviewing?(state.index===state.questions.length-1?'Ismétlés eredménye 🧠':'Következő gyakorlófeladat →'):pendingRewardTile()>=0?'Jutalommező felfedezése 🎁':state.index === state.questions.length - 1 ? (state.playKind === 'adventure' ? 'Főellenfél kihívása ⚔️' : 'Eredmény megtekintése 🏆') : 'Következő feladat →'}</button></div>` : ''}
  </div>`;
}
function storeBestScore() {
  const key = `szammester1000_${state.mode}_${state.level}`;
  let best = state.stars;
  try {
    const existing = Number(window.localStorage.getItem(key) || 0);
    best = Math.max(best, Number.isFinite(existing) ? existing : 0);
    window.localStorage.setItem(key, String(best));
  } catch (e) {
    // A játék privát böngészésben / tiltott tárhellyel is működik.
  }
  state.best = best;
}
function renderResult() {
  let title = 'Szép munka!';
  let message = 'Minden feladatot megoldottál. A gyakorlással egyre ügyesebb leszel!';
  const total=state.questions.length;
  if (state.playKind==='cards') { title='🎴 Pakli teljesítve!'; message='Mind a négy kérdéstípust gyakoroltad. A hibás kártyák visszakerülhetnek a Gyakorlóműhelybe.'; }
  else if (state.stars === total) { title = 'Tökéletes küldetés!'; message = 'Minden kérdést elsőre jól oldottál meg. Ez igazán remek teljesítmény!'; }
  else if (state.stars >= 7) { title = 'Nagyon ügyes voltál!'; message = 'Sok feladat sikerült elsőre. A többit is kitartóan megoldottad!'; }
  app.innerHTML = `<section class="result-screen">
    <div class="result-emoji" aria-hidden="true">🏆</div>
    <p class="eyebrow">KÜLDETÉS TELJESÍTVE</p>
    <h1>${title}</h1>
    <p>${message}</p>
    <div class="score-large" aria-label="${state.stars} a ${total} csillagból">⭐ ${state.stars}<span> / ${total}</span></div>
    <div class="best-score">🏅 Legjobb eredmény ebben a módban: ${state.best} / ${total}</div>
    <div class="result-buttons"><button type="button" class="primary-button" data-action="restart">🔁 Játssz újra!</button><button type="button" class="secondary-button" data-action="home">Másik küldetést választok</button><button type="button" class="secondary-button" data-action="review-home">🧠 Hibáimból tanulok (${smartPendingCount()})</button></div>
    <p class="info-bar">A csillag akkor jár, ha a feladat első próbálkozásra sikerül. Hibázás után is nyugodtan újrapróbálkozhatsz: a legfontosabb, hogy megértsd a megoldást.</p>
  </section>`;
}
function render() {
  if (state.view === 'home') renderHome();
  if (state.view === 'game') renderGame();
  if (state.view === 'result') renderResult();
  if (state.view === 'map') renderAdventureMap();
  if (state.view === 'adventure-result') renderAdventureResult();
  if (state.view === 'reward') renderReward();
  if (state.view === 'smart') renderSmartHub();
  if (state.view === 'smart-result') renderSmartResult();
}
function tryAnswer(correct, userFriendlyError) {
  const q = state.questions[state.index];
  if (state.locked) return;
  if (correct) {
    if (state.playKind === 'adventure') {
      state.lastStepFrom = state.adventureStage * ADVENTURE_QUESTIONS + state.index;
      const tile=state.lastStepFrom;
      if (!state.rewardData.tileCoins[tile]) {
        state.rewardData.tileCoins[tile]=true;
        state.rewardData.coins+=2; // Egyetlen alkalommal jár minden elért mezőért.
        writeRewardData();
      }
    }
    if (q.__smartId) state.reviewFeedback=smartRewardReview(q);
    if (!state.mistakes && state.playKind!=='review') state.stars += 1;
    playSound(state.playKind==='boss'?'boss':'correct');
    state.locked = true;
    state.feedback = { type: 'success', text: q.explain };
  } else {
    if (!state.mistakes) smartRememberMistake(q);
    state.mistakes = true;
    state.feedback = { type: 'error', text: userFriendlyError || q.tip };
    playSound('error');
  }
  render();
  saveCurrentGame();
}
function checkInteger(text) { return /^[0-9]{1,4}$/.test(String(text).trim()); }
function handleSubmit(form) {
  const q = state.questions[state.index];
  if (state.locked) return;
  if (form.dataset.form === 'exchange') {
    const answer = String(form.elements.answer.value).trim();
    state.inputs = { answer };
    if (!checkInteger(answer)) { state.feedback={type:'error',text:'Csak egy 0 és 1000 közötti egész számot írj be!'};render();return; }
    tryAnswer(Number(answer) === q.answer);
  } else if (form.dataset.form === 'neighbors') {
    const low = String(form.elements.low.value).trim();
    const high = String(form.elements.high.value).trim();
    state.inputs = { low, high };
    if (!checkInteger(low) || !checkInteger(high)) { state.feedback={type:'error',text:'Mindkét mezőbe írj egy egész számot!'};render();return; }
    tryAnswer(Number(low) === q.answer[0] && Number(high) === q.answer[1]);
  }
}
app.addEventListener('submit', event => {
  event.preventDefault();
  handleSubmit(event.target);
});
app.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button || !app.contains(button)) return;
  const action = button.dataset.action;
  if (action === 'map') { openAdventureMap(); return; }
  if (action === 'cards') { state.mode='digitcards'; beginGame(); return; }
  if (action==='review-home') { state.view='smart';state.reviewTopic='all';render();return; }
  if (action==='review-level') { const level=Number(button.dataset.level);if(level>=0 && level<LEVELS.length) {state.level=level;render();} return; }
  if (action==='review-topic') { const topic=button.dataset.topic;if(topic==='all'||SMART_TOPICS.some(m=>m.id===topic)){state.reviewTopic=topic;render();}return; }
  if (action==='review-start') { if(state.view==='smart')beginSmartReview();return; }
  if (action==='sound') {
    state.soundEnabled=!state.soundEnabled;
    try { window.localStorage.setItem(SOUND_SAVE_KEY, state.soundEnabled?'on':'off'); } catch(error) {}
    if (state.soundEnabled) playSound('click');
    render(); return;
  }
  if (action==='reward-claim') { claimReward(); return; }
  if (action==='reward-continue') { leaveRewardEvent(); return; }
  if (action==='collect-tile') {
    const tile=Number(button.dataset.tile);
    if (state.view==='map' && canCollectBoardReward(tile,state.adventureData)) startRewardEvent(tile,'map');
    return;
  }
  if (action==='boss') {
    const stage=Number(button.dataset.stage);
    state.adventureData=state.adventureData||readAdventureData();
    state.rewardData=state.rewardData||readRewardData();
    if (state.adventureData.completed[stage]||state.rewardData.bossDraft?.stage===stage) {
      startBossFight(stage,state.adventureData.best[stage]);
    }
    return;
  }
  if (action === 'hero') {
    const hero=button.dataset.hero;
    if (!HEROES.some(h=>h.id===hero)) return;
    state.hero=hero;
    try { window.localStorage.setItem(HERO_SAVE_KEY, hero); } catch(error) { /* Tárhely nélkül is működik. */ }
    render();
    return;
  }
  if (action === 'map-level') {
    state.level = Number(button.dataset.level);
    openAdventureMap();
    return;
  }
  if (action === 'stage') { startAdventureStage(Number(button.dataset.stage)); return; }
  if (action === 'next-stage') { startAdventureStage(state.adventureStage + 1); return; }
  if (action === 'set-mode') { state.mode = button.dataset.mode; render(); return; }
  if (action === 'set-level') { state.level = Number(button.dataset.level); render(); return; }
  if (action === 'start' || action === 'restart') { beginGame(); return; }
  if (action === 'home') { if (state.mode==='digitcards') state.mode='mixed'; state.view = 'home'; render(); return; }
  if (action === 'next') {
    if (!state.locked) return;
    const rewardTile=pendingRewardTile();
    if (rewardTile>=0) { startRewardEvent(rewardTile,'game'); return; }
    state.index+=1;
    if (state.index>=state.questions.length) {
      if (state.playKind==='boss') { completeBossFight(); return; }
      if (state.playKind==='review') { state.view='smart-result';render();return; }
      if (state.playKind==='adventure') { startBossFight(state.adventureStage,state.stars); return; }
      storeBestScore(); state.view='result';
    } else resetQuestionState();
    if (state.view==='game') saveCurrentGame();
    render();
    app.scrollIntoView({behavior:'smooth',block:'start'});
    return;
  }
  if (state.view !== 'game' || state.locked) return;
  const q = state.questions[state.index];
  if (action === 'choose') {
    state.lastChoice = button.dataset.value;
    tryAnswer(state.lastChoice === String(q.answer));
  } else if (action === 'tick') {
    state.chosenTick = Number(button.dataset.value);
    tryAnswer(state.chosenTick === q.targetIndex);
  } else if (action === 'order-pick') {
    const i = Number(button.dataset.value);
    if (!state.selected.includes(i) && i >= 0 && i < q.numbers.length) state.selected.push(i);
    state.feedback = null;
    render();
    saveCurrentGame();
  } else if (action === 'order-undo') {
    state.selected.pop(); state.feedback = null; render(); saveCurrentGame();
  } else if (action === 'order-clear') {
    state.selected = []; state.feedback = null; render(); saveCurrentGame();
  } else if (action === 'order-check') {
    if (state.selected.length !== q.numbers.length) return;
    const submitted = state.selected.map(i => q.numbers[i]);
    const correct = submitted.every((num, i) => num === q.answer[i]);
    if (!correct) state.selected = [];
    tryAnswer(correct);
  }
});
try {
  const savedHero=window.localStorage.getItem(HERO_SAVE_KEY);
  if (HEROES.some(h=>h.id===savedHero)) state.hero=savedHero;
} catch(error) { /* Tárhely nélkül az alapértelmezett róka bábu marad. */ }
try { state.soundEnabled=window.localStorage.getItem(SOUND_SAVE_KEY)==='on'; }
catch(error) { state.soundEnabled=false; }
const brandLink = document.getElementById('brandLink');
brandLink.addEventListener('click', event => { event.preventDefault(); if(state.mode==='digitcards') state.mode='mixed'; state.view = 'home'; render(); });
render();

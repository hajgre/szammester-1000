'use strict';

// Számmester 1000 V3 – társasjáték-stílusú kalandtábla, szerver nélkül.
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
const QUESTIONS_PER_GAME = 10;
const ADVENTURE_QUESTIONS = 5;
const ADVENTURE_STAGES = MODES.filter(mode => mode.id !== 'mixed');
const HEROES = [
  { id: 'fox', emoji: '🦊', name: 'Róka' },
  { id: 'cat', emoji: '🐱', name: 'Cica' },
  { id: 'dragon', emoji: '🐲', name: 'Sárkány' }
];
const BOARD_REGIONS = [
  { name:'Számok rétje', color:'mint' },
  { name:'A helyi értékek falva', color:'sky' },
  { name:'Számjegyek ligete', color:'lilac' },
  { name:'Értékek hegye', color:'gold' },
  { name:'Szomszédok tava', color:'blue' },
  { name:'Beváltás-barlang', color:'peach' },
  { name:'A számegyenes csúcsa', color:'rose' }
];
// A V2-es mentési kulcsot változatlanul hagyjuk, így a korábbi eredmények megmaradnak.
const HERO_SAVE_KEY = 'szammester1000_board_hero_v3';

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
  playKind: 'practice', adventureStage: 0, adventureData: null, hero: 'fox'
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
      <div class="adventure-feature-icon" aria-hidden="true">🗺️</div>
      <div class="adventure-feature-text">
        <span class="adventure-kicker">ÚJ • JÁTSZHATÓ TÁRSASJÁTÉKTÁBLA</span>
        <h2>Számország varázsösvénye</h2>
        <p>35 mező, 7 állomás, választott bábu és csillagok! Minden jó megoldás egy lépés a cél felé. A korábbi eredményeidet is megtartjuk.</p>
      </div>
      <button type="button" class="adventure-enter" data-action="map">Induljon a kaland! →</button>
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
      <div class="info-bar">💡 <strong>Tipp:</strong> Hibázni ér! Minden kérdésnél újrapróbálkozhatsz, és a helyes megoldás után magyarázatot is kapsz.</div>
    </section>`;
}
function beginGame() {
  state.playKind = 'practice';
  const types = MODES.filter(m => m.id !== 'mixed').map(m => m.id);
  const sequence = state.mode === 'mixed'
    ? shuffle([...types, ...Array.from({ length: QUESTIONS_PER_GAME - types.length }, () => pick(types))])
    : Array(QUESTIONS_PER_GAME).fill(state.mode);
  state.questions = sequence.map(type => makeQuestion(type, state.level));
  state.view = 'game';
  state.index = 0;
  state.stars = 0;
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
  state.view = 'map';
  render();
}
function isAdventureUnlocked(stage) {
  return stage === 0 || state.adventureData.completed[stage - 1];
}
function startAdventureStage(stage) {
  if (!Number.isInteger(stage) || stage < 0 || stage >= ADVENTURE_STAGES.length) return;
  state.adventureData = state.adventureData || readAdventureData();
  if (!isAdventureUnlocked(stage)) return;
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
function renderBoard(progress) {
  const position=boardPosition(progress);
  const pawn = position === 0 ? { x: 84, y: 178 } : boardCoord(position-1);
  const regionLabels = BOARD_REGIONS.map((r,i) => {
    const isRight=i%2===1;
    return `<div class="board-region region-${r.color} ${isRight?'region-right':''}" style="left:${isRight?74:26}%;top:${(105+i*147)/1225*100}%"><span>${ADVENTURE_STAGES[i].emoji} ${r.name}</span></div>`;
  }).join('');
  const tiles = Array.from({length:35},(_,tileIndex)=>{
    const stage=Math.floor(tileIndex/5);
    const loc=boardCoord(tileIndex);
    const stageProgress=progress.completed[stage] ? 5 : progress.draft?.stage===stage ? progress.draft.index+(progress.draft.locked?1:0) : 0;
    const completed=stageProgress>=tileIndex%5+1;
    const unlocked=stage===0 || progress.completed[stage-1];
    const gate=tileIndex%5===4;
    return `<button type="button" class="board-tile ${completed?'tile-done':''} ${unlocked?'tile-unlocked':'tile-locked'} ${gate?'tile-gate':''} ${position===tileIndex+1?'tile-current':''}" style="left:${loc.x/1100*100}%;top:${loc.y/1225*100}%" data-action="stage" data-stage="${stage}" ${unlocked?'':'disabled'} aria-label="${tileIndex+1}. mező, ${ADVENTURE_STAGES[stage].name}${unlocked?', megnyitható':', lezárva'}" title="${ADVENTURE_STAGES[stage].name}"><span class="board-tile-number">${gate?'✦':tileIndex+1}</span></button>`;
  }).join('');
  const road=boardRoadPath();
  const hero=HEROES.find(h=>h.id===state.hero) || HEROES[0];
  return `<div class="board-scroll" role="region" tabindex="0" aria-label="35 mezős matematikai társasjátéktábla; kisebb kijelzőn oldalra görgethető">
  <div class="board-world">
    <svg class="board-landscape" viewBox="0 0 1100 1225" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="boardGreen" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e1f6cf"/><stop offset=".53" stop-color="#fff3d5"/><stop offset="1" stop-color="#e1edf9"/></linearGradient><linearGradient id="boardRoad" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffedbb"/><stop offset="1" stop-color="#fffaf0"/></linearGradient></defs>
      <rect width="1100" height="1225" rx="32" fill="url(#boardGreen)"/>
      <path d="M0 300 Q200 212 390 316 T790 283 T1100 300 V445 Q850 363 710 414 T280 400 T0 448Z" fill="#b9deba" opacity=".42"/>
      <path d="M0 780 Q250 710 480 820 T1100 760 V1015 Q820 975 550 990 T0 990Z" fill="#c4d9e9" opacity=".48"/>
      <path d="M0 1080 Q180 1005 385 1090 T790 1085 T1100 1060 V1225H0Z" fill="#f4d8b5" opacity=".55"/>
      <path d="M-35 626 Q240 548 458 658 T1138 622" fill="none" stroke="#a9d8e1" stroke-width="44" opacity=".56"/>
      <path d="M-35 626 Q240 548 458 658 T1138 622" fill="none" stroke="#d5f6f9" stroke-width="26" opacity=".73"/>
      <g opacity=".55" fill="#f5fcf9"><ellipse cx="240" cy="86" rx="65" ry="21"/><ellipse cx="278" cy="75" rx="47" ry="27"/><ellipse cx="768" cy="438" rx="57" ry="17"/><ellipse cx="791" cy="422" rx="35" ry="25"/><ellipse cx="320" cy="861" rx="65" ry="19"/></g>
      <g fill="#91c5a9" opacity=".58"><path d="M56 440l25-52 25 52H93l21 39H47l21-39Z"/><path d="M1045 765l28-53 28 53h-17l23 45h-70l20-45Z"/><path d="M64 905l22-44 22 44H96l14 30H63l16-30Z"/><path d="M1021 280l20-44 20 44h-12l16 31h-48l13-31Z"/></g>
      <path d="${road}" fill="none" stroke="#c5a777" stroke-width="90" stroke-linecap="round" stroke-linejoin="round" opacity=".28"/>
      <path d="${road}" fill="none" stroke="url(#boardRoad)" stroke-width="78" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${road}" fill="none" stroke="#e3c98f" stroke-width="4" stroke-dasharray="5 18" stroke-linecap="round"/>
    </svg>
    <div class="board-deco deco-castle" aria-hidden="true">🏰</div><div class="board-deco deco-forest" aria-hidden="true">🌲🌳</div><div class="board-deco deco-lake" aria-hidden="true">🪷</div><div class="board-deco deco-star" aria-hidden="true">✨</div>
    ${regionLabels}
    <div class="board-start-flag">START</div><div class="board-finish-flag">CÉL 🏆</div>
    ${tiles}
    <div class="board-pawn" style="left:${pawn.x/1100*100}%;top:${pawn.y/1225*100}%" role="img" aria-label="A bábu a ${position}. mezőnél jár"><span>${hero.emoji}</span></div>
  </div></div>`;
}
function renderAdventureMap() {
  state.adventureData = readAdventureData();
  const progress = state.adventureData;
  const done = progress.completed.filter(Boolean).length;
  const totalStars = progress.best.reduce((sum, n) => sum + n, 0);
  const draft = progress.draft;
  const position=boardPosition(progress);
  app.innerHTML = `<section class="adventure-hero board-hero">
    <button class="text-button adventure-back" type="button" data-action="home">← Vissza a főmenübe</button>
    <p class="eyebrow">🎲 MATEMATIKAI TÁRSASJÁTÉK • 3. VERZIÓ</p>
    <h1>Számország <span>varázsösvénye</span></h1>
    <p>Válassz bábut, majd haladj végig a 35 mezős kalandpályán! <strong>Minden megoldott feladat egy mezővel visz előrébb.</strong> Itt a tudás számít, nem a szerencse.</p>
    <div class="adventure-hero-stats"><span>🎲 ${position} / 35 mező</span><span>🔓 ${done} / 7 kapu</span><span>⭐ ${totalStars} / 35 csillag</span></div>
  </section>
  <section class="adventure-map-body board-body">
    <div class="board-toolbar">
      <div><h2>Válassz nehézséget!</h2><p>Mindegyik szintnek saját mentése van.</p></div>
      <div class="level-buttons adventure-level-buttons" role="group" aria-label="Kaland nehézsége">${LEVELS.map((lev,i)=>`<button type="button" class="level-button ${state.level===i?'selected':''}" data-action="map-level" data-level="${i}" aria-pressed="${i===state.level}">${lev.emoji} ${lev.name}</button>`).join('')}</div>
    </div>
    <div class="hero-picker"><strong>🧍 Válaszd ki a bábudat!</strong><div class="hero-options" role="group" aria-label="Játékbábu kiválasztása">${HEROES.map(hero=>`<button type="button" class="hero-option ${state.hero===hero.id?'active':''}" data-action="hero" data-hero="${hero.id}" aria-pressed="${state.hero===hero.id}"><span aria-hidden="true">${hero.emoji}</span>${hero.name}</button>`).join('')}</div></div>
    ${draft ? `<div class="adventure-resume"><div><strong>📌 Félbehagyott küldetésed van</strong><span>${ADVENTURE_STAGES[draft.stage].name} · ${draft.index+1}. feladat az 5-ből</span></div><button type="button" class="primary-button" data-action="stage" data-stage="${draft.stage}">Folytatom →</button></div>` : ''}
    <div class="board-frame"><div class="board-heading"><span>🗺️ KALANDTÁBLA</span><span>START → 35 MEZŐ → CÉL</span></div>${renderBoard(progress)}<p class="board-scroll-tip">📱 Telefonon a pályát oldalirányban is görgetheted.</p></div>
    <div class="board-legend"><span>${(HEROES.find(h=>h.id===state.hero)||HEROES[0]).emoji} Bábu: itt tartasz</span><span>✅ Zöld mező: teljesítve</span><span>🔒 Szürke mező: még zárva</span></div>
    <div class="board-missions"><h2>🚩 Válassz megnyitott állomást!</h2><p>A következő kapu öt megoldott feladat után nyílik ki. A már teljesített pályákat bármikor újrajátszhatod.</p>
      <div class="board-mission-grid">${ADVENTURE_STAGES.map((mode,i)=>{
        const unlocked=isAdventureUnlocked(i), completed=progress.completed[i];
        return `<button type="button" class="board-mission ${completed?'mission-complete':''}" data-action="stage" data-stage="${i}" ${unlocked?'':'disabled'}><span class="board-mission-emoji">${unlocked?mode.emoji:'🔒'}</span><span><strong>${i+1}. ${mode.name}</strong><small>${completed?`⭐ ${progress.best[i]}/5 · Újrajátszható`:draft?.stage===i?'▶ Folytatás':unlocked?'▶ Kezdés':'Még zárva'}</small></span><span class="board-mission-arrow">${unlocked?'→':'·'}</span></button>`;
      }).join('')}</div></div>
    ${done===7?'<div class="adventure-treasure">🏆 <strong>Gratulálok! Számország minden kapuját kinyitottad!</strong><p>A megszerzett csillagokat a táblán újrajátszással is gyarapíthatod.</p></div>':''}
    <p class="adventure-save-note">💾 A haladás és a bábu választása ezen az eszközön, ebben a böngészőben mentődik. Nem szinkronizálódik automatikusan más eszközre. A korábbi Kaland mód eredményei megmaradnak.</p>
  </section>`;
}
function renderAdventureResult() {
  const stage = state.adventureStage;
  const mode = ADVENTURE_STAGES[stage];
  const last = stage === ADVENTURE_STAGES.length - 1;
  app.innerHTML = `<section class="result-screen adventure-result">
    <div class="result-emoji board-victory" aria-hidden="true">${last ? '🏆' : '🔑'}</div>
    <p class="eyebrow">🎉 ${stage + 1}. KAPU KINYITVA!</p>
    <h1>${last ? 'Megmentetted Számországot!' : 'Kinyitottad a következő kaput!'}</h1>
    <p>${mode.name}: mind az 5 feladatot megoldottad. ${last ? 'Mind a hét állomáson végigértél!' : 'Most már egy újabb állomás is elérhető a térképen.'}</p>
    <div class="score-large" aria-label="${state.stars} az 5 csillagból">⭐ ${state.stars}<span> / 5</span></div>
    <div class="best-score">🏅 Ezen a kapun a legjobb eredményed: ${state.adventureData.best[stage]} / 5</div>
    <div class="result-buttons">
       ${last ? '' : `<button type="button" class="primary-button" data-action="next-stage">Következő kapu →</button>`}
       <button type="button" class="secondary-button" data-action="map">🗺️ Vissza a térképhez</button>
    </div>
    <p class="info-bar">A csillag elsőre helyes megoldásért jár. Ha hibáztál, attól a küldetést még teljesítetted. Újrajátszással javíthatod a csillagjaid számát.</p>
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
function renderQuestionContents(q) {
  switch (q.type) {
    case 'order': return renderOrder(q);
    case 'place': case 'face': case 'real':
      return `${q.highlight >= 0 ? highlightedNumber(q.number, q.highlight) : regularNumber(q.number)}${renderChoices(q)}`;
    case 'neighbors': return renderNeighbors(q);
    case 'exchange': return renderExchange(q);
    case 'line': return renderNumberline(q);
    default: return '';
  }
}
function renderBoardMini() {
  const step=state.index+(state.locked?1:0);
  const hero=HEROES.find(h=>h.id===state.hero) || HEROES[0];
  return `<div class="mini-board" aria-label="Társasjáték-állás: ${step} az 5 mezőből"><span class="mini-board-label">🎲 Lépj előre a helyes megoldással!</span><div class="mini-track"><span class="mini-start">START</span>${Array.from({length:5},(_,i)=>`<span class="mini-tile ${i<step?'mini-done':''} ${i===step-1?'mini-current':''}">${i===step-1?`<span class="mini-pawn">${hero.emoji}</span>`:i+1}</span>`).join('')}<span class="mini-gate">🔑</span></div></div>`;
}
function renderGame() {
  const q = state.questions[state.index];
  const progress = Math.round((state.index / state.questions.length) * 100);
  app.innerHTML = `<div class="game-wrap">
    <div class="game-topline"><button type="button" class="text-button" data-action="${state.playKind === 'adventure' ? 'map' : 'home'}">← ${state.playKind === 'adventure' ? 'Vissza a térképhez' : 'Vissza a főmenübe'}</button><span class="stars">⭐ ${state.stars} csillag</span></div>
    ${state.playKind === 'adventure' ? `<div class="adventure-game-label">🎲 Számország · ${state.adventureStage + 1}. kapu a 7-ből</div>${renderBoardMini()}` : ''}
    <div class="game-meta"><span>${MODES.find(m => m.id === state.mode).name} · ${LEVELS[state.level].name}</span><span>${state.index + 1} / ${state.questions.length}. feladat</span></div>
    <div class="progress-track" role="progressbar" aria-valuenow="${state.index}" aria-valuemin="0" aria-valuemax="${state.questions.length}" aria-label="A játék előrehaladása"><div class="progress-fill" style="width: ${progress}%"></div></div>
    <section class="question-box" aria-label="Aktuális feladat">
      <span class="question-tag">${q.label}</span>
      <h2 class="question-title">${q.title}</h2>
      <p class="question-hint">${q.hint}</p>
      ${renderQuestionContents(q)}
    </section>
    <div id="answer-feedback" aria-live="polite" aria-atomic="true">
      ${state.feedback ? `<div class="feedback ${state.feedback.type}"><strong>${state.feedback.type === 'success' ? '🌟 Ügyes vagy, jó megoldás!' : '💡 Próbáld meg még egyszer!'}</strong>${state.feedback.text}</div>` : ''}
    </div>
    ${state.locked ? `<div class="question-footer"><button type="button" class="primary-button" data-action="next">${state.index === state.questions.length - 1 ? (state.playKind === 'adventure' ? 'Kapu kinyitása 🔑' : 'Eredmény megtekintése 🏆') : 'Következő feladat →'}</button></div>` : ''}
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
  if (state.stars === QUESTIONS_PER_GAME) { title = 'Tökéletes küldetés!'; message = 'Minden kérdést elsőre jól oldottál meg. Ez igazán remek teljesítmény!'; }
  else if (state.stars >= 7) { title = 'Nagyon ügyes voltál!'; message = 'Sok feladat sikerült elsőre. A többit is kitartóan megoldottad!'; }
  app.innerHTML = `<section class="result-screen">
    <div class="result-emoji" aria-hidden="true">🏆</div>
    <p class="eyebrow">KÜLDETÉS TELJESÍTVE</p>
    <h1>${title}</h1>
    <p>${message}</p>
    <div class="score-large" aria-label="${state.stars} a ${QUESTIONS_PER_GAME} csillagból">⭐ ${state.stars}<span> / ${QUESTIONS_PER_GAME}</span></div>
    <div class="best-score">🏅 Legjobb eredmény ebben a módban: ${state.best} / ${QUESTIONS_PER_GAME}</div>
    <div class="result-buttons"><button type="button" class="primary-button" data-action="restart">🔁 Játssz újra!</button><button type="button" class="secondary-button" data-action="home">Másik küldetést választok</button></div>
    <p class="info-bar">A csillag akkor jár, ha a feladat első próbálkozásra sikerül. Hibázás után is nyugodtan újrapróbálkozhatsz: a legfontosabb, hogy megértsd a megoldást.</p>
  </section>`;
}
function render() {
  if (state.view === 'home') renderHome();
  if (state.view === 'game') renderGame();
  if (state.view === 'result') renderResult();
  if (state.view === 'map') renderAdventureMap();
  if (state.view === 'adventure-result') renderAdventureResult();
}
function tryAnswer(correct, userFriendlyError) {
  const q = state.questions[state.index];
  if (state.locked) return;
  if (correct) {
    if (!state.mistakes) state.stars += 1;
    state.locked = true;
    state.feedback = { type: 'success', text: q.explain };
  } else {
    state.mistakes = true;
    state.feedback = { type: 'error', text: userFriendlyError || q.tip };
  }
  render();
  saveAdventureDraft();
}
function checkInteger(text) { return /^[0-9]{1,4}$/.test(String(text).trim()); }
function handleSubmit(form) {
  const q = state.questions[state.index];
  if (state.locked) return;
  if (form.dataset.form === 'exchange') {
    const answer = String(form.elements.answer.value).trim();
    state.inputs = { answer };
    if (!checkInteger(answer)) return tryAnswer(false, 'Csak egy 0 és 1000 közötti egész számot írj be!');
    tryAnswer(Number(answer) === q.answer);
  } else if (form.dataset.form === 'neighbors') {
    const low = String(form.elements.low.value).trim();
    const high = String(form.elements.high.value).trim();
    state.inputs = { low, high };
    if (!checkInteger(low) || !checkInteger(high)) return tryAnswer(false, 'Mindkét mezőbe írj egy egész számot!');
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
  if (action === 'home') { state.view = 'home'; render(); return; }
  if (action === 'next') {
    if (!state.locked) return;
    state.index += 1;
    if (state.index >= state.questions.length) {
      if (state.playKind === 'adventure') completeAdventureStage();
      else { storeBestScore(); state.view = 'result'; }
    }
    else resetQuestionState();
    if (state.view === 'game') saveAdventureDraft();
    render();
    app.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    saveAdventureDraft();
  } else if (action === 'order-undo') {
    state.selected.pop(); state.feedback = null; render(); saveAdventureDraft();
  } else if (action === 'order-clear') {
    state.selected = []; state.feedback = null; render(); saveAdventureDraft();
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
const brandLink = document.getElementById('brandLink');
brandLink.addEventListener('click', event => { event.preventDefault(); state.view = 'home'; render(); });
render();

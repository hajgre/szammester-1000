'use strict';

// Számmester 1000 – nincs szükség külső könyvtárra vagy szerverre.
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
const PLACE_NAMES = ['egyesek', 'tízesek', 'százasok', 'ezresek'];
const PLACE_SHORT = ['egyes', 'tízes', 'százas', 'ezres'];
const app = document.getElementById('app');
const state = {
  view: 'home', mode: 'mixed', level: 0,
  questions: [], index: 0, stars: 0,
  mistakes: false, locked: false, selected: [], inputs: {},
  feedback: null, lastChoice: null, chosenTick: null, best: 0
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
function renderGame() {
  const q = state.questions[state.index];
  const progress = Math.round((state.index / state.questions.length) * 100);
  app.innerHTML = `<div class="game-wrap">
    <div class="game-topline"><button type="button" class="text-button" data-action="home">← Vissza a főmenübe</button><span class="stars">⭐ ${state.stars} csillag</span></div>
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
    ${state.locked ? `<div class="question-footer"><button type="button" class="primary-button" data-action="next">${state.index === state.questions.length - 1 ? 'Eredmény megtekintése 🏆' : 'Következő feladat →'}</button></div>` : ''}
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
  if (action === 'set-mode') { state.mode = button.dataset.mode; render(); return; }
  if (action === 'set-level') { state.level = Number(button.dataset.level); render(); return; }
  if (action === 'start' || action === 'restart') { beginGame(); return; }
  if (action === 'home') { state.view = 'home'; render(); return; }
  if (action === 'next') {
    if (!state.locked) return;
    state.index += 1;
    if (state.index >= state.questions.length) { storeBestScore(); state.view = 'result'; }
    else resetQuestionState();
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
  } else if (action === 'order-undo') {
    state.selected.pop(); state.feedback = null; render();
  } else if (action === 'order-clear') {
    state.selected = []; state.feedback = null; render();
  } else if (action === 'order-check') {
    if (state.selected.length !== q.numbers.length) return;
    const submitted = state.selected.map(i => q.numbers[i]);
    const correct = submitted.every((num, i) => num === q.answer[i]);
    if (!correct) state.selected = [];
    tryAnswer(correct);
  }
});
const brandLink = document.getElementById('brandLink');
brandLink.addEventListener('click', event => { event.preventDefault(); state.view = 'home'; render(); });
render();

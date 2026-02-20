/* Monday Review Study — offline single-page app
   Data: CARDS in data.js
   Progress: localStorage key "mr_progress_v1"
*/

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const LS_KEY = "mr_progress_v1";
const DAY_MS = 24 * 60 * 60 * 1000;

// Multiple choice difficulty config (tuned for "confusing")
const MC_CONFIG = {
  choicesTotal: 4,           // 4 options
  useNearMissFirst: true,    // ✅ generate distractors from the correct answer itself
  allowSameCategoryPool: true,
  minSimilarity: 0.22,       // filter out unrelated stuff
};

function nowMs(){ return Date.now(); }
function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

function normalizeAnswer(ans){
  if (Array.isArray(ans)) return ans.join("; ");
  return String(ans);
}
function renderAnswer(ans){
  if (Array.isArray(ans)){
    return "<ul>" + ans.map(x => `<li>${escapeHtml(String(x))}</li>`).join("") + "</ul>";
  }
  return escapeHtml(String(ans));
}
function escapeHtml(s){
  return s.replace(/[&<>"']/g, (m)=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
}

function loadProgress(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(!raw) return {};
    const obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? obj : {};
  }catch{
    return {};
  }
}
function saveProgress(p){
  localStorage.setItem(LS_KEY, JSON.stringify(p));
}

function defaultCardState(){
  return { rep:0, interval:0, ef:2.5, due:0, seen:false, lapses:0, reviews:0, correct:0, last:0 };
}

// SM-2 style scheduling (q: 0..5)
function schedule(state, q){
  const s = { ...state };
  s.reviews = (s.reviews||0) + 1;
  s.last = nowMs();

  if (q < 3){
    s.rep = 0;
    s.interval = 1;
    s.lapses = (s.lapses||0) + 1;
  } else {
    if (s.rep === 0) s.interval = 1;
    else if (s.rep === 1) s.interval = 6;
    else s.interval = Math.round(s.interval * s.ef);

    s.rep = s.rep + 1;
    s.correct = (s.correct||0) + 1;
  }

  s.ef = clamp(s.ef + (0.1 - (5-q) * (0.08 + (5-q) * 0.02)), 1.3, 2.8);
  s.due = nowMs() + s.interval * DAY_MS;
  s.seen = true;
  return s;
}

function categories(){
  const set = new Set(CARDS.map(c=>c.category));
  return ["All"].concat(Array.from(set).sort((a,b)=>a.localeCompare(b)));
}

// ---------- Tabs ----------
function setTab(tab){
  $$(".tabbtn").forEach(btn=>{
    const active = btn.dataset.tab === tab;
    btn.setAttribute("aria-selected", active ? "true":"false");
  });
  ["study","quiz","browse","progress"].forEach(t=>{
    $(`#tab-${t}`).style.display = (t===tab) ? "" : "none";
  });
  if(tab==="browse") renderBrowse();
  if(tab==="progress") renderProgress();
  if(tab==="study") updateDuePill();
}
$$(".tabbtn").forEach(btn=> btn.addEventListener("click", ()=> setTab(btn.dataset.tab)));

// ---------- Toast ----------
let toastTimer = null;
function toast(msg){
  const t = $("#toast");
  t.textContent = msg;
  t.style.display = "block";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.style.display = "none", 1400);
}

// ---------- Study (flashcards) ----------
const prog = loadProgress();

const categorySelect = $("#categorySelect");
const modeSelect = $("#modeSelect");
const catPill = $("#catPill");

function fillCategorySelect(sel){
  sel.innerHTML = categories().map(c=> `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
}
fillCategorySelect(categorySelect);
fillCategorySelect($("#quizCategory"));
fillCategorySelect($("#browseCategory"));

categorySelect.addEventListener("change", ()=>{
  catPill.textContent = categorySelect.value === "All" ? "All categories" : categorySelect.value;
  pickNextCard(true);
});
modeSelect.addEventListener("change", ()=> pickNextCard(true));

let currentCard = null;
let flipped = false;

const qText = $("#qText");
const aText = $("#aText");
const cardMeta = $("#cardMeta");

function stateFor(id){
  if(!prog[id]) prog[id] = defaultCardState();
  return prog[id];
}

function filterCards(category){
  return CARDS.filter(c => category==="All" || c.category === category);
}

function dueCards(list){
  const t = nowMs();
  return list.filter(c => (stateFor(c.id).due || 0) <= t && (stateFor(c.id).seen));
}
function newCards(list){
  return list.filter(c => !stateFor(c.id).seen);
}

function pickCard(list){
  const due = dueCards(list);
  if(due.length){
    return due[Math.floor(Math.random()*due.length)];
  }
  return list[Math.floor(Math.random()*list.length)];
}

function pickNextCard(force=false){
  const category = categorySelect.value;
  const mode = modeSelect.value;
  const list = filterCards(category);

  if(!list.length){
    qText.textContent = "No cards in this category.";
    aText.style.display = "none";
    currentCard = null;
    return;
  }

  let next = null;
  if(mode === "review"){
    const due = dueCards(list);
    next = due.length ? due[Math.floor(Math.random()*due.length)] : pickCard(list);
  } else if(mode === "new"){
    const n = newCards(list);
    next = n.length ? n[Math.floor(Math.random()*n.length)] : pickCard(list);
  } else {
    next = pickCard(list);
  }

  if(!force && currentCard && next && next.id === currentCard.id && list.length > 1){
    for(let i=0;i<6;i++){
      const alt = pickCard(list);
      if(alt.id !== currentCard.id){ next = alt; break; }
    }
  }

  currentCard = next;
  flipped = false;
  renderCard();
  setGradeEnabled(false);
  updateDuePill();
}

function renderCard(){
  if(!currentCard) return;
  qText.textContent = currentCard.question;
  aText.innerHTML = renderAnswer(currentCard.answer);
  aText.style.display = flipped ? "" : "none";

  const s = stateFor(currentCard.id);
  const dueIn = s.seen ? Math.max(0, s.due - nowMs()) : null;
  const dueText = s.seen ? (dueIn===0 ? "due now" : `due in ${Math.ceil(dueIn / DAY_MS)}d`) : "new";
  cardMeta.textContent = `${currentCard.category} • ${dueText} • EF ${s.ef.toFixed(2)} • interval ${s.interval||0}d`;
}

function flip(){
  if(!currentCard) return;
  flipped = !flipped;
  aText.style.display = flipped ? "" : "none";
  setGradeEnabled(flipped);
}

function setGradeEnabled(on){
  ["gradeAgain","gradeHard","gradeGood","gradeEasy"].forEach(id=>{
    $("#"+id).disabled = !on;
  });
}

$("#flipBtn").addEventListener("click", flip);
$("#nextBtn").addEventListener("click", ()=> pickNextCard(false));

document.addEventListener("keydown", (e)=>{
  if(e.code === "Space"){
    if($("#tab-study").style.display !== "none"){
      e.preventDefault();
      flip();
    }
  }
  if(e.key.toLowerCase() === "n"){
    if($("#tab-study").style.display !== "none"){
      pickNextCard(false);
    }
  }
});

function grade(q){
  if(!currentCard) return;
  const s = stateFor(currentCard.id);
  const nextState = schedule(s, q);
  prog[currentCard.id] = nextState;
  saveProgress(prog);
  bumpDailyCount();
  toast("Saved");
  pickNextCard(false);
}

$("#gradeAgain").addEventListener("click", ()=> grade(1));
$("#gradeHard").addEventListener("click", ()=> grade(3));
$("#gradeGood").addEventListener("click", ()=> grade(4));
$("#gradeEasy").addEventListener("click", ()=> grade(5));

// daily count
const DAILY_KEY = "mr_daily_count_v1";
function todayKey(){
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function bumpDailyCount(){
  const k = todayKey();
  const obj = JSON.parse(localStorage.getItem(DAILY_KEY) || "{}");
  obj[k] = (obj[k]||0) + 1;
  localStorage.setItem(DAILY_KEY, JSON.stringify(obj));
  $("#streak").textContent = obj[k];
}
function loadDailyCount(){
  const k = todayKey();
  const obj = JSON.parse(localStorage.getItem(DAILY_KEY) || "{}");
  $("#streak").textContent = obj[k]||0;
}
loadDailyCount();

function updateDuePill(){
  const t = nowMs();
  const due = CARDS.filter(c => (stateFor(c.id).seen) && (stateFor(c.id).due||0) <= t).length;
  $("#duePill").textContent = `Due: ${due}`;
  $("#contentSummary").textContent = `${CARDS.length} cards across ${categories().length-1} categories.`;
}

// Reset
$("#resetBtn").addEventListener("click", ()=>{
  if(confirm("Reset all progress? This will clear your saved review schedule and stats.")){
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem(DAILY_KEY);
    location.reload();
  }
});

// ---------- Quiz ----------
let quiz = null;

function shuffleInPlace(a){
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}
function sample(arr, n){
  const a = arr.slice();
  shuffleInPlace(a);
  return a.slice(0,n);
}

function flatAnswer(card){
  return normalizeAnswer(card.answer).trim();
}

function isListCard(card){
  return Array.isArray(card.answer);
}

// similarity helpers (used only to filter unrelated “pool” answers)
function normSim(s){
  return String(s||"")
    .toLowerCase()
    .replace(/[“”]/g,'"')
    .replace(/[’]/g,"'")
    .replace(/[^a-z0-9%]+/g," ")
    .replace(/\s+/g," ")
    .trim();
}
function tokenSet(s){
  return new Set(normSim(s).split(" ").filter(Boolean));
}
function overlapCount(a, b){
  const A = tokenSet(a), B = tokenSet(b);
  let c = 0;
  for(const x of A) if(B.has(x)) c++;
  return c;
}
function jaccard(aSet, bSet){
  if(!aSet.size || !bSet.size) return 0;
  let inter = 0;
  for(const x of aSet) if(bSet.has(x)) inter++;
  const uni = aSet.size + bSet.size - inter;
  return uni ? inter/uni : 0;
}
function similarityScore(a, b){
  const A = tokenSet(a), B = tokenSet(b);
  const j = jaccard(A,B);
  const la = a.length, lb = b.length;
  const lenSim = 1 - (Math.abs(la-lb) / Math.max(la,lb,1));
  return (j*0.75) + (lenSim*0.25);
}

// ---- “Near-miss” distractor generator (the main change) ----
function uniqueStrings(arr){
  const out = [];
  const seen = new Set();
  for(const x of arr){
    const v = String(x||"").trim();
    if(!v) continue;
    if(seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function allListItems(filterFn){
  const items = [];
  CARDS.forEach(c=>{
    if(!Array.isArray(c.answer)) return;
    if(filterFn && !filterFn(c)) return;
    items.push(...c.answer.map(x=>String(x)));
  });
  return uniqueStrings(items);
}

// small “tweaks” to create almost-the-same options
function tweakItem(s){
  const x = String(s);

  const rules = [
    [/^Follow rules$/i, ["Follow standards","Follow procedures","Follow guidelines"]],
    [/^Follow and implement the system$/i, ["Follow and apply the system","Follow and maintain the system","Follow the system strictly"]],
    [/^Be willing to learn$/i, ["Be willing to improve","Be willing to adapt","Be open to feedback"]],
    [/^Work hard$/i, ["Work consistently","Work diligently","Work efficiently"]],
    [/^Be passionate$/i, ["Be committed","Be motivated","Be dedicated"]],
    [/^Co-?operate$/i, ["Collaborate","Communicate","Support teammates"]],
    [/^Safe and hygienic$/i, ["Safe and sanitary","Safe and clean","Clean and hygienic"]],
    [/^Clean and tidy$/i, ["Clean and organized","Neat and tidy","Clean and orderly"]],
    [/^Lively and comfortable$/i, ["Warm and comfortable","Lively and welcoming","Comfortable and relaxed"]],
  ];

  for(const [re, alts] of rules){
    if(re.test(x)){
      return alts[Math.floor(Math.random()*alts.length)];
    }
  }

  // fallback: tiny wording change
  return x.replace(/\b(and)\b/i,"&");
}

function listToValue(list){
  return list.map(x=>String(x).trim()).filter(Boolean).join("; ");
}

function makeNearMissListVariants(card){
  const base = card.answer.map(x=>String(x));
  const catPool = allListItems(c => c.category === card.category);
  const globalPool = allListItems(() => true);

  const pickPoolItem = (excludeSet) => {
    const pool = (catPool.length ? catPool : globalPool);
    // prefer pool items that share a token with the original answer
    const baseValue = listToValue(base);
    const scored = pool
      .filter(x=>!excludeSet.has(x))
      .map(x=>({x, s: similarityScore(baseValue, x)}))
      .sort((a,b)=>b.s-a.s);

    if(scored.length) return scored[0].x;
    return pool[Math.floor(Math.random()*pool.length)];
  };

  const variants = [];

  // 1) reorder only (subtle)
  {
    const v = base.slice();
    shuffleInPlace(v);
    variants.push(listToValue(v));
  }

  // 2) swap 1 item with a very related pool item
  {
    const v = base.slice();
    const i = Math.floor(Math.random()*v.length);
    const exclude = new Set(v);
    v[i] = pickPoolItem(exclude) || tweakItem(v[i]);
    variants.push(listToValue(v));
  }

  // 3) tweak 1 item wording (very blended)
  {
    const v = base.slice();
    const i = Math.floor(Math.random()*v.length);
    v[i] = tweakItem(v[i]);
    variants.push(listToValue(v));
  }

  // 4) replace 2 items (still close, but harder)
  if(base.length >= 4){
    const v = base.slice();
    const i1 = Math.floor(Math.random()*v.length);
    let i2 = Math.floor(Math.random()*v.length);
    if(i2 === i1) i2 = (i1+1) % v.length;

    const exclude = new Set(v);
    v[i1] = pickPoolItem(exclude) || tweakItem(v[i1]);
    exclude.add(v[i1]);
    v[i2] = pickPoolItem(exclude) || tweakItem(v[i2]);
    variants.push(listToValue(v));
  }

  // 5) remove 1 + add 1 (same length, super confusing)
  if(base.length >= 3){
    const v = base.slice();
    const removeIdx = Math.floor(Math.random()*v.length);
    v.splice(removeIdx, 1);

    const exclude = new Set(v);
    v.push(pickPoolItem(exclude) || "Be accountable");
    shuffleInPlace(v);
    variants.push(listToValue(v));
  }

  return uniqueStrings(variants);
}

function makeNearMissTextVariants(card){
  const correct = flatAnswer(card);

  const variants = [];
  const nums = correct.match(/\d+/g) || [];

  // numeric/time: change numbers slightly (most confusing for deadlines/percentages)
  if(nums.length){
    for(const delta of [1,2,3,5,7]){
      let v = correct;
      // change first number only to keep it “almost right”
      const m = v.match(/\d+/);
      if(m){
        const n = parseInt(m[0],10);
        const newN = Math.max(0, n + (Math.random()<0.5 ? -delta : delta));
        v = v.replace(/\d+/, String(newN));
        variants.push(v);
      }
    }
  } else {
    // short text: swap one keyword to something close
    const swaps = [
      ["business expansion","business growth"],
      ["face to face","in person"],
      ["in person","face to face"],
      ["honesty and integrity","honesty and responsibility"],
      ["positive and optimistic","positive and friendly"],
      ["friendly service","fast service"],
      ["pleasant atmosphere","comfortable atmosphere"],
      ["duplicate the franchise model","follow the franchise system"],
    ];

    const lower = correct.toLowerCase();
    for(const [a,b] of swaps){
      if(lower.includes(a)){
        variants.push(correct.replace(new RegExp(a,"ig"), b));
      }
    }

    // fallback: add/remove tiny phrase
    variants.push(correct.replace(/\.$/,"") + " (as scheduled).");
    variants.push("Generally, " + correct);
  }

  // also pull from same category if it looks similar
  const sameCat = CARDS.filter(c=>c.id!==card.id && c.category===card.category && !Array.isArray(c.answer));
  for(const c of sameCat){
    const a = flatAnswer(c);
    if(similarityScore(correct, a) >= MC_CONFIG.minSimilarity || overlapCount(correct,a) >= 2){
      variants.push(a);
    }
  }

  return uniqueStrings(variants);
}

function pickDistractors(card, correctValue, k){
  const candidates = [];

  if(MC_CONFIG.useNearMissFirst){
    if(isListCard(card)) candidates.push(...makeNearMissListVariants(card));
    else candidates.push(...makeNearMissTextVariants(card));
  }

  // optional: use same-category pool but ONLY if similar (prevents random unrelated lists)
  if(MC_CONFIG.allowSameCategoryPool){
    const pool = CARDS.filter(c=>c.id!==card.id && c.category===card.category);
    for(const c of pool){
      if(isListCard(card) && !Array.isArray(c.answer)) continue;
      if(!isListCard(card) && Array.isArray(c.answer)) continue;

      const val = flatAnswer(c);
      if(similarityScore(correctValue, val) >= MC_CONFIG.minSimilarity || overlapCount(correctValue, val) >= 2){
        candidates.push(val);
      }
    }
  }

  const cleaned = uniqueStrings(candidates).filter(v => v !== correctValue);

  // rank by similarity to correct (so they feel blended)
  cleaned.sort((a,b)=> similarityScore(correctValue,b) - similarityScore(correctValue,a));

  // take top K; if short, keep generating small near-miss tweaks
  const out = cleaned.slice(0,k);

  while(out.length < k){
    if(isListCard(card)){
      const more = makeNearMissListVariants(card).filter(v=>v!==correctValue && !out.includes(v));
      if(more.length) out.push(more[0]);
      else break;
    } else {
      const more = makeNearMissTextVariants(card).filter(v=>v!==correctValue && !out.includes(v));
      if(more.length) out.push(more[0]);
      else break;
    }
  }

  // absolute last fallback (should almost never happen)
  while(out.length < k){
    out.push(correctValue + " "); // tiny diff so it’s not equal
  }

  return out.slice(0,k);
}

function choiceHTML(value, isList){
  if(!isList) return escapeHtml(value);
  const parts = String(value).split(/\s*;\s*/).filter(Boolean);
  return parts.map(p=>`<div>• ${escapeHtml(p)}</div>`).join("");
}

function startQuiz(){
  const cat = $("#quizCategory").value;
  const mode = $("#quizMode").value;
  const len = parseInt($("#quizLen").value, 10);

  const pool = filterCards(cat);
  const picks = sample(pool, Math.min(len, pool.length));

  quiz = {
    mode, cat,
    order: picks,
    idx: 0,
    correct: 0,
    attempted: 0,
    locked: false
  };

  $("#qCorrect").textContent = "0";
  $("#qAttempted").textContent = "0";
  $("#qAcc").textContent = "0%";
  $("#quizPill").textContent = "In progress";
  $("#quizNext").disabled = true;
  renderQuizQ();
}

function renderQuizQ(){
  const card = quiz.order[quiz.idx];
  $("#quizQ").textContent = card.question;
  $("#quizFeedback").style.display = "none";
  $("#quizFeedback").innerHTML = "";
  $("#quizNext").disabled = true;
  quiz.locked = false;

  const meta = `${quiz.idx+1}/${quiz.order.length} • ${card.category}`;
  $("#quizMeta").textContent = meta;

  if(quiz.mode === "mc"){
    $("#mcArea").style.display = "";
    $("#typeArea").style.display = "none";
    renderMC(card);
  } else {
    $("#mcArea").style.display = "none";
    $("#typeArea").style.display = "";
    $("#typeInput").value = "";
    $("#typeInput").focus();
  }
}

function renderMC(card){
  const correctValue = flatAnswer(card);
  const listMode = isListCard(card);

  const need = Math.max(0, MC_CONFIG.choicesTotal - 1);
  const distractors = pickDistractors(card, correctValue, need);

  const options = distractors
    .map(v => ({ value: v, html: choiceHTML(v, listMode) }))
    .concat([{ value: correctValue, html: choiceHTML(correctValue, listMode) }]);

  shuffleInPlace(options);

  const wrap = $("#mcChoices");
  wrap.innerHTML = "";

  options.forEach(opt=>{
    const b = document.createElement("button");
    b.className = "btn";
    b.style.textAlign = "left";
    b.dataset.value = opt.value;
    b.innerHTML = opt.html;
    b.addEventListener("click", ()=> checkMC(card, opt.value, correctValue));
    wrap.appendChild(b);
  });
}

function showFeedback(ok, correctText){
  $("#quizFeedback").style.display = "";
  $("#quizFeedback").innerHTML = ok
    ? `<div style="color:var(--ok); font-weight:800; margin-bottom:6px">Correct ✅</div>`
      + `<div class="muted">Answer:</div>` + `<div>${escapeHtml(correctText)}</div>`
    : `<div style="color:var(--bad); font-weight:800; margin-bottom:6px">Not quite ❌</div>`
      + `<div class="muted">Correct answer:</div>` + `<div>${escapeHtml(correctText)}</div>`;
}

function updateQuizStats(){
  $("#qCorrect").textContent = quiz.correct;
  $("#qAttempted").textContent = quiz.attempted;
  const acc = quiz.attempted ? Math.round((quiz.correct/quiz.attempted)*100) : 0;
  $("#qAcc").textContent = `${acc}%`;
}

function checkMC(card, chosenValue, correctValue){
  if(quiz.locked) return;
  quiz.locked = true;

  const ok = chosenValue === correctValue;
  quiz.attempted += 1;
  if(ok) quiz.correct += 1;

  // disable + highlight using dataset.value (not textContent)
  $$("#mcChoices .btn").forEach(b=>{
    b.disabled = true;
    if(b.dataset.value === correctValue) b.classList.add("good");
    if(b.dataset.value === chosenValue && !ok) b.classList.add("again");
  });

  showFeedback(ok, correctValue);
  updateQuizStats();
  $("#quizNext").disabled = false;
}

function normalizeForCheck(s){
  return s.toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[“”]/g,'"')
    .replace(/[’]/g,"'")
    .trim();
}

function checkType(){
  if(!quiz || quiz.locked) return;
  const card = quiz.order[quiz.idx];
  const input = normalizeForCheck($("#typeInput").value);
  const correctRaw = flatAnswer(card);
  const correct = normalizeForCheck(correctRaw);

  const ok = input && (input === correct || correct.includes(input) || input.includes(correct));

  quiz.locked = true;
  quiz.attempted += 1;
  if(ok) quiz.correct += 1;

  showFeedback(ok, correctRaw);
  updateQuizStats();
  $("#quizNext").disabled = false;
}

$("#checkType").addEventListener("click", checkType);
$("#typeInput").addEventListener("keydown", (e)=>{
  if(e.key === "Enter"){
    e.preventDefault();
    checkType();
  }
});

$("#quizStart").addEventListener("click", startQuiz);
$("#quizNext").addEventListener("click", ()=>{
  if(!quiz) return;
  quiz.idx += 1;
  if(quiz.idx >= quiz.order.length){
    $("#quizPill").textContent = "Finished";
    $("#quizQ").textContent = `Done! Score: ${quiz.correct}/${quiz.attempted} (${quiz.attempted?Math.round((quiz.correct/quiz.attempted)*100):0}%)`;
    $("#mcArea").style.display = "none";
    $("#typeArea").style.display = "none";
    $("#quizNext").disabled = true;
    return;
  }
  renderQuizQ();
});

// ---------- Browse ----------
function renderBrowse(){
  const q = ($("#searchInput").value || "").toLowerCase().trim();
  const cat = $("#browseCategory").value;
  const sort = $("#browseSort").value;

  let list = filterCards(cat);
  if(q){
    list = list.filter(c => (c.question + " " + normalizeAnswer(c.answer) + " " + c.category).toLowerCase().includes(q));
  }

  if(sort === "alpha"){
    list.sort((a,b)=>a.question.localeCompare(b.question));
  } else {
    list.sort((a,b)=> (a.category === b.category ? a.question.localeCompare(b.question) : a.category.localeCompare(b.category)));
  }

  const wrap = $("#browseList");
  wrap.innerHTML = "";
  list.forEach(c=>{
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <div class="top">
        <h3>${escapeHtml(c.question)}</h3>
        <span class="pill">${escapeHtml(c.category)}</span>
      </div>
      <details>
        <summary>Show answer</summary>
        <div class="a">${renderAnswer(c.answer)}</div>
      </details>
    `;
    wrap.appendChild(div);
  });

  renderCheatSheet();
}

$("#searchInput").addEventListener("input", renderBrowse);
$("#browseCategory").addEventListener("change", renderBrowse);
$("#browseSort").addEventListener("change", renderBrowse);

function renderCheatSheet(){
  const byCat = {};
  CARDS.forEach(c=>{
    if(!byCat[c.category]) byCat[c.category] = [];
    byCat[c.category].push(c);
  });

  const catOrder = Object.keys(byCat).sort((a,b)=>a.localeCompare(b));
  const html = catOrder.map(cat=>{
    const items = byCat[cat].map(c=>{
      const a = Array.isArray(c.answer) ? c.answer.join(" • ") : c.answer;
      return `<li><strong>${escapeHtml(c.question)}</strong><br/><span class="muted">${escapeHtml(String(a))}</span></li>`;
    }).join("");
    return `<div style="margin-bottom:12px">
      <div style="font-weight:800; margin-bottom:6px">${escapeHtml(cat)}</div>
      <ol style="margin:0 0 0 18px; padding:0">${items}</ol>
    </div>`;
  }).join("");

  $("#cheatSheet").innerHTML = html;
}

// ---------- Progress ----------
function renderProgress(){
  const total = CARDS.length;
  const t = nowMs();
  let due = 0, mastered = 0;

  CARDS.forEach(c=>{
    const s = stateFor(c.id);
    if(s.seen && (s.due||0) <= t) due += 1;
    if(s.seen && (s.interval||0) >= 30) mastered += 1;
  });

  $("#pTotal").textContent = total;
  $("#pDue").textContent = due;
  $("#pMastered").textContent = mastered;
}

$("#exportBtn").addEventListener("click", ()=>{
  const blob = new Blob([JSON.stringify(prog, null, 2)], { type:"application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "monday-review-progress.json";
  a.click();
  URL.revokeObjectURL(url);
});

$("#importBtn").addEventListener("click", ()=> $("#importFile").click());
$("#importFile").addEventListener("change", async (e)=>{
  const f = e.target.files && e.target.files[0];
  if(!f) return;
  try{
    const txt = await f.text();
    const obj = JSON.parse(txt);
    if(!obj || typeof obj !== "object") throw new Error("Invalid file");
    Object.assign(prog, obj);
    saveProgress(prog);
    toast("Imported!");
    renderProgress();
    updateDuePill();
  }catch(err){
    alert("Could not import that file.");
  }finally{
    e.target.value = "";
  }
});

// init
updateDuePill();
pickNextCard(true);
renderBrowse();
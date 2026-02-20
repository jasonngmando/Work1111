/* Monday Review Study — offline single-page app
   Data: CARDS in data.js
   Progress: localStorage key "mr_progress_v1"
*/

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const LS_KEY = "mr_progress_v1";
const DAY_MS = 24 * 60 * 60 * 1000;

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

  // Ease factor update
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
  // Weighted: due first, then random among due; otherwise random among all
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
    // avoid repeats
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

function sample(arr, n){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a.slice(0,n);
}

function flatAnswer(card){
  return normalizeAnswer(card.answer).trim();
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
  const correct = flatAnswer(card);

  const others = CARDS
    .filter(c=>c.id!==card.id)
    .map(c=>flatAnswer(c))
    .filter(a=>a && a.length>=2);

  const choices = sample(others, 3).concat([correct]);
  // shuffle
  for(let i=choices.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [choices[i],choices[j]] = [choices[j],choices[i]];
  }

  const wrap = $("#mcChoices");
  wrap.innerHTML = "";
  choices.forEach(ch=>{
    const b = document.createElement("button");
    b.className = "btn";
    b.style.textAlign = "left";
    b.textContent = ch;
    b.addEventListener("click", ()=> checkMC(card, ch, correct, b));
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

function checkMC(card, chosen, correct, btn){
  if(quiz.locked) return;
  quiz.locked = true;

  const ok = chosen === correct;
  quiz.attempted += 1;
  if(ok) quiz.correct += 1;

  // style chosen buttons
  $$("#mcChoices .btn").forEach(b=>{
    b.disabled = true;
    if(b.textContent === correct) b.classList.add("good");
    if(b.textContent === chosen && !ok) b.classList.add("again");
  });

  showFeedback(ok, correct);
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

  // loose matching: accept if input is contained or equal, to help with long lists
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

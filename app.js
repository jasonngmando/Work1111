/* Monday Review Study — single-page app
   Data source: CARDS in data.js
   - Supports CARDS[i].answer as string or array
   - Supports CARDS[i].mcq as:
     {
       stem: "...",
       options: { A:"...", B:"...", C:"...", D:"..." },
       correct: "A"|"B"|"C"|"D",
       explanation: "..."
     }
   Progress saved in localStorage.
*/

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const LS_KEY = "mr_progress_v2";
const DAILY_KEY = "mr_daily_count_v2";
const DAY_MS = 24 * 60 * 60 * 1000;

// ---------- Performance helpers ----------
function debounce(fn, wait = 120){
  let timer = null;
  return (...args)=>{
    clearTimeout(timer);
    timer = setTimeout(()=> fn(...args), wait);
  };
}

function shouldUsePerfLite(){
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowCpu = Number(navigator.hardwareConcurrency || 8) <= 4;
  return reduceMotion || lowCpu;
}

function applyPerformanceMode(){
  if(shouldUsePerfLite()) document.documentElement.classList.add("perf-lite");
}

// ---------- Theme ----------
function applyTheme(){
  const t = "dark";
  document.documentElement.setAttribute("data-theme", t);
  if(document.body) document.body.setAttribute("data-theme", t);
}

// ---------- Utils ----------
function nowMs(){ return Date.now(); }
function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, (m)=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
}
function isArr(x){ return Array.isArray(x); }

function splitAnswerParts(ans){
  if (isArr(ans)) return ans.map(x=>String(x).trim()).filter(Boolean);

  const s = String(ans ?? "").trim();
  if (!s) return [];

  if (!s.includes(";")) return [s];
  return s.split(/\s*;\s*/).map(x=>x.trim()).filter(Boolean);
}

function normalizeAnswer(ans){
  return splitAnswerParts(ans).join("; ");
}
function renderAnswerHTML(ans){
  const items = splitAnswerParts(ans);
  if (items.length > 1){
    return "<ul>" + items.map(x => `<li>${escapeHtml(x)}</li>`).join("") + "</ul>";
  }
  return escapeHtml(items[0] || "");
}
function renderOptionHTML(text){
  // If it looks like a semicolon-separated list, render bullets for readability
  const s = String(text ?? "").trim();
  const parts = s.split(/\s*;\s*/).filter(Boolean);
  if (parts.length >= 3){
    return parts.map(p => `<div>• ${escapeHtml(p)}</div>`).join("");
  }
  return escapeHtml(s);
}
function todayKey(){
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
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
  return a.slice(0, n);
}

// ---------- Progress (SRS) ----------
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
function saveProgress(p){ localStorage.setItem(LS_KEY, JSON.stringify(p)); }

function defaultCardState(){
  return { rep:0, interval:0, ef:2.5, due:0, seen:false, lapses:0, reviews:0, correct:0, last:0 };
}

// SM-2-ish scheduling (q: 0..5)
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

// ---------- Data helpers ----------
function cardId(c){ return String(c.id); }
function cardCategory(c){ return c.section || c.category || "General"; }

function categories(){
  const set = new Set((CARDS||[]).map(c=>cardCategory(c)));
  return ["All"].concat(Array.from(set).sort((a,b)=>a.localeCompare(b)));
}
function filterCards(category){
  return (CARDS||[]).filter(c => category === "All" || cardCategory(c) === category);
}

// ---------- Tabs ----------
function setTab(tab){
  $$(".tabbtn").forEach(btn=>{
    const active = btn.dataset.tab === tab;
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });
  ["study","quiz","browse","progress"].forEach(t=>{
    const el = $(`#tab-${t}`);
    if(!el) return;
    const isActive = t === tab;
    el.style.display = isActive ? "" : "none";
    if(isActive){
      el.classList.remove("is-entering");
      requestAnimationFrame(()=> el.classList.add("is-entering"));
    }
  });

  if(tab==="browse") renderBrowse();
  if(tab==="progress") renderProgress();
  if(tab==="study") updateDuePill();
}
$$(".nav .tabbtn[data-tab]").forEach(btn => btn.addEventListener("click", ()=> setTab(btn.dataset.tab)));

// ---------- Toast ----------
let toastTimer = null;
function toast(msg){
  const t = $("#toast");
  if(!t) return;
  t.textContent = msg;
  t.style.display = "block";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.style.display = "none", 1400);
}

// ---------- Study (flashcards) ----------
const prog = loadProgress();

function stateFor(id){
  const k = String(id);
  if(!prog[k]) prog[k] = defaultCardState();
  return prog[k];
}

function dueCards(list){
  const t = nowMs();
  return list.filter(c => stateFor(cardId(c)).seen && (stateFor(cardId(c)).due || 0) <= t);
}
function newCards(list){
  return list.filter(c => !stateFor(cardId(c)).seen);
}
function pickCard(list){
  const due = dueCards(list);
  if(due.length) return due[Math.floor(Math.random()*due.length)];
  return list[Math.floor(Math.random()*list.length)];
}

let currentCard = null;
let flipped = false;

function setGradeEnabled(on){
  ["gradeAgain","gradeHard","gradeGood","gradeEasy"].forEach(id=>{
    const el = $("#"+id);
    if(el) el.disabled = !on;
  });
}

function renderCard(){
  if(!currentCard) return;
  const box = $("#cardBox");
  if(box) box.classList.toggle("is-flipped", flipped);

  $("#qText").textContent = currentCard.question || "—";
  $("#aText").innerHTML = renderAnswerHTML(currentCard.answer);
  $("#aText").style.display = flipped ? "" : "none";

  const s = stateFor(cardId(currentCard));
  const dueIn = s.seen ? Math.max(0, (s.due||0) - nowMs()) : null;
  const dueText = s.seen ? (dueIn===0 ? "due now" : `due in ${Math.ceil(dueIn / DAY_MS)}d`) : "new";

  const meta = `${cardCategory(currentCard)} • ${dueText} • EF ${s.ef.toFixed(2)} • interval ${s.interval||0}d`;
  $("#cardMeta").textContent = meta;
}

function pickNextCard(force=false){
  const category = $("#categorySelect").value;
  const mode = $("#modeSelect").value;
  const list = filterCards(category);

  if(!list.length){
    $("#qText").textContent = "No cards.";
    $("#aText").style.display = "none";
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

  if(!force && currentCard && next && cardId(next) === cardId(currentCard) && list.length > 1){
    for(let i=0;i<6;i++){
      const alt = pickCard(list);
      if(cardId(alt) !== cardId(currentCard)){ next = alt; break; }
    }
  }

  currentCard = next;
  flipped = false;
  renderCard();
  setGradeEnabled(false);
  updateDuePill();
}

function flip(){
  if(!currentCard) return;
  flipped = !flipped;
  const box = $("#cardBox");
  if(box) box.classList.toggle("is-flipped", flipped);
  $("#aText").style.display = flipped ? "" : "none";
  setGradeEnabled(flipped);
}

function bumpDailyCount(){
  const k = todayKey();
  const obj = JSON.parse(localStorage.getItem(DAILY_KEY) || "{}");
  obj[k] = (obj[k]||0) + 1;
  localStorage.setItem(DAILY_KEY, JSON.stringify(obj));
  $("#streak").textContent = obj[k]||0;
}
function loadDailyCount(){
  const k = todayKey();
  const obj = JSON.parse(localStorage.getItem(DAILY_KEY) || "{}");
  $("#streak").textContent = obj[k]||0;
}

function grade(q){
  if(!currentCard) return;
  const id = cardId(currentCard);
  prog[id] = schedule(stateFor(id), q);
  saveProgress(prog);
  bumpDailyCount();
  toast("Saved");
  pickNextCard(false);
}

function updateDuePill(){
  const t = nowMs();
  const due = (CARDS||[]).filter(c => {
    const s = stateFor(cardId(c));
    return s.seen && (s.due||0) <= t;
  }).length;
  $("#duePill").textContent = `Due: ${due}`;
  $("#contentSummary").textContent = `${(CARDS||[]).length} cards across ${categories().length-1} categories.`;
}

function wireStudyUI(){
  // fill selects
  const cats = categories();
  $("#categorySelect").innerHTML = cats.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
  $("#quizCategory").innerHTML = cats.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
  $("#browseCategory").innerHTML = cats.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");

  $("#categorySelect").addEventListener("change", ()=>{
    $("#catPill").textContent = ($("#categorySelect").value === "All") ? "All categories" : $("#categorySelect").value;
    pickNextCard(true);
  });
  $("#modeSelect").addEventListener("change", ()=> pickNextCard(true));

  $("#flipBtn").addEventListener("click", flip);
  $("#nextBtn").addEventListener("click", ()=> pickNextCard(false));

  $("#gradeAgain").addEventListener("click", ()=> grade(1));
  $("#gradeHard").addEventListener("click", ()=> grade(3));
  $("#gradeGood").addEventListener("click", ()=> grade(4));
  $("#gradeEasy").addEventListener("click", ()=> grade(5));

  $("#resetBtn").addEventListener("click", ()=>{
    if(confirm("Reset all progress? This clears saved schedule + stats.")){
      localStorage.removeItem(LS_KEY);
      localStorage.removeItem(DAILY_KEY);
      location.reload();
    }
  });

  document.addEventListener("keydown", (e)=>{
    if($("#tab-study").style.display === "none") return;
    if(e.code === "Space"){
      e.preventDefault();
      flip();
    }
    if(e.key.toLowerCase() === "n"){
      pickNextCard(false);
    }
  });
}

// ---------- Quiz ----------
let quiz = null;

function updateQuizLengthOptions(){
  const quizLen = $("#quizLen");
  const selectedValue = parseInt(quizLen.value || "0", 10);
  const poolCount = filterCards($("#quizCategory").value).length;

  const choices = [5, 10, 15, 20, 25, 30, 40, 50]
    .filter(n => n <= poolCount);

  if(poolCount > 0 && !choices.includes(poolCount)) choices.push(poolCount);
  if(poolCount === 0) choices.push(1);

  const uniqueSorted = Array.from(new Set(choices)).sort((a,b)=>a-b);
  quizLen.innerHTML = uniqueSorted
    .map(n=>`<option value="${n}">${n}${n === poolCount && poolCount > 20 ? " (All)" : ""}</option>`)
    .join("");

  const fallback = Math.min(20, Math.max(1, poolCount));
  if(uniqueSorted.includes(selectedValue)) quizLen.value = String(selectedValue);
  else quizLen.value = String(uniqueSorted.includes(fallback) ? fallback : uniqueSorted[uniqueSorted.length - 1]);
}

function hasMCQ(card){
  const m = card && card.mcq;
  if(!m) return false;
  if(!m.stem || !m.options || !m.correct) return false;
  const keys = Object.keys(m.options);
  return keys.includes("A") && keys.includes("B") && keys.includes("C") && keys.includes("D");
}

function startQuiz(){
  const cat = $("#quizCategory").value;
  const mode = $("#quizMode").value; // "mc" | "type"
  const len = parseInt($("#quizLen").value, 10);

  const pool = filterCards(cat);
  const picks = sample(pool, Math.min(len, pool.length));

  quiz = {
    mode,
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

function setQuizMeta(card){
  $("#quizMeta").textContent = `${quiz.idx+1}/${quiz.order.length} • ${cardCategory(card)}`;
}

function showFeedback(ok, correctText, explanation, detailsHTML = ""){
  $("#quizFeedback").style.display = "";
  const expl = explanation ? `<div class="muted" style="margin-top:8px">${escapeHtml(explanation)}</div>` : "";
  const details = detailsHTML ? `<div style="margin-top:8px">${detailsHTML}</div>` : "";
  $("#quizFeedback").innerHTML = ok
    ? `<div style="color:var(--ok); font-weight:800; margin-bottom:6px">Correct ✅</div>
       <div class="muted">Answer:</div><div>${renderAnswerHTML(correctText)}</div>${details}${expl}`
    : `<div style="color:var(--bad); font-weight:800; margin-bottom:6px">Not quite ❌</div>
       <div class="muted">Correct answer:</div><div>${renderAnswerHTML(correctText)}</div>${details}${expl}`;
}

function updateQuizStats(){
  $("#qCorrect").textContent = String(quiz.correct);
  $("#qAttempted").textContent = String(quiz.attempted);
  const acc = quiz.attempted ? Math.round((quiz.correct/quiz.attempted)*100) : 0;
  $("#qAcc").textContent = `${acc}%`;
}

function renderMC(card){
  const wrap = $("#mcChoices");
  wrap.innerHTML = "";

  if(!hasMCQ(card)){
    // Fallback: if mcq missing, degrade gracefully (still 4 options, but less rigorous)
    const correctText = normalizeAnswer(card.answer);
    const pool = filterCards(cardCategory(card));
    const others = pool.filter(x=>cardId(x)!==cardId(card)).map(x=>normalizeAnswer(x.answer)).filter(Boolean);
    const distractors = sample(others, 3);
    const options = [
      { k:"A", v: correctText },
      { k:"B", v: distractors[0] || (correctText + " ") },
      { k:"C", v: distractors[1] || (correctText + "  ") },
      { k:"D", v: distractors[2] || (correctText + "   ") },
    ];
    // keep as A-D displayed
    options.forEach(opt=>{
      const b = document.createElement("button");
      b.className = "btn";
      b.style.textAlign = "left";
      b.dataset.key = opt.k;
      b.dataset.value = opt.v;
      b.innerHTML = `<div style="font-weight:800; margin-bottom:4px">${opt.k}.</div><div>${renderOptionHTML(opt.v)}</div>`;
      b.addEventListener("click", ()=> checkMC(opt.k, opt.v, "A", correctText, "")); // correct forced to A here
      wrap.appendChild(b);
    });
    return;
  }

  const m = card.mcq;

  // Show stem from MCQ (not the flashcard question)
  $("#quizQ").textContent = m.stem;

  const order = ["A","B","C","D"]; // KEEP fixed so correct letter stays correct
  order.forEach(letter=>{
    const text = m.options[letter];
    const b = document.createElement("button");
    b.className = "btn";
    b.style.textAlign = "left";
    b.dataset.key = letter;
    b.dataset.value = String(text ?? "");
    b.innerHTML = `<div style="font-weight:800; margin-bottom:4px">${letter}.</div><div>${renderOptionHTML(text)}</div>`;
    b.addEventListener("click", ()=> checkMC(letter, String(text ?? ""), m.correct, m.options[m.correct], m.explanation || ""));
    wrap.appendChild(b);
  });
}

function checkMC(chosenLetter, chosenValue, correctLetter, correctValue, explanation){
  if(!quiz || quiz.locked) return;
  quiz.locked = true;

  const ok = chosenLetter === correctLetter;
  quiz.attempted += 1;
  if(ok) quiz.correct += 1;

  $$("#mcChoices .btn").forEach(b=>{
    b.disabled = true;
    if(b.dataset.key === correctLetter) b.classList.add("good");
    if(b.dataset.key === chosenLetter && !ok) b.classList.add("again");
  });

  showFeedback(ok, String(correctValue ?? ""), explanation);
  updateQuizStats();
  $("#quizNext").disabled = false;
}

function normalizeForCheck(s){
  return String(s||"")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[“”]/g,'"')
    .replace(/[’]/g,"'")
    .trim();
}

function isLooseTextMatch(input, correct){
  return !!input && (input === correct || correct.includes(input) || input.includes(correct));
}

function renderType(card){
  // For type mode, keep the original flashcard question
  $("#quizQ").textContent = card.question || "—";

  const wrap = $("#typeInputs");
  const answers = splitAnswerParts(card.answer);

  wrap.className = "type-inputs";
  wrap.innerHTML = answers.map((_, idx)=>{
    const id = `typeInput${idx}`;
    const slotLabel = answers.length > 1 ? `<div class="type-slot-label">Answer ${idx + 1}</div>` : "";
    return `<div>${slotLabel}<input id="${id}" class="typeInputSlot" placeholder="Type your answer here..." data-slot="${idx}" /></div>`;
  }).join("");

  const first = wrap.querySelector(".typeInputSlot");
  if(first) first.focus();
}

function checkType(){
  if(!quiz || quiz.locked) return;
  const card = quiz.order[quiz.idx];

  const inputs = $$("#typeInputs .typeInputSlot").map(el=> normalizeForCheck(el.value));
  const expected = splitAnswerParts(card.answer).map(x=> normalizeForCheck(x)).filter(Boolean);

  const correctRaw = normalizeAnswer(card.answer);

  let ok = false;
  if(inputs.length === expected.length){
    const used = new Array(expected.length).fill(false);
    ok = inputs.every(input=>{
      if(!input) return false;
      const idx = expected.findIndex((corr, i)=> !used[i] && isLooseTextMatch(input, corr));
      if(idx === -1) return false;
      used[idx] = true;
      return true;
    });
  }

  const slotRows = expected.map((corr, idx)=>{
    const rawInput = String(inputs[idx] || "").trim();
    const slotOK = isLooseTextMatch(rawInput, corr);
    const slotStatus = slotOK ? '<span style="color:var(--ok)">✅</span>' : '<span style="color:var(--bad)">❌</span>';
    return `<li><strong>Slot ${idx + 1}</strong> ${slotStatus}<br/><span class="muted">Your answer:</span> ${escapeHtml(rawInput || "(blank)")}<br/><span class="muted">Expected:</span> ${escapeHtml(corr)}</li>`;
  }).join("");
  const detailsHTML = expected.length > 1 ? `<div class="muted" style="margin-bottom:4px">Slot-by-slot check</div><ul style="margin:0 0 0 18px">${slotRows}</ul>` : "";

  quiz.locked = true;
  quiz.attempted += 1;
  if(ok) quiz.correct += 1;

  showFeedback(ok, correctRaw, "", detailsHTML);
  updateQuizStats();
  $("#quizNext").disabled = false;
}

function renderQuizQ(){
  const card = quiz.order[quiz.idx];
  $("#quizFeedback").style.display = "none";
  $("#quizFeedback").innerHTML = "";
  $("#quizNext").disabled = true;
  quiz.locked = false;

  setQuizMeta(card);

  if(quiz.mode === "mc"){
    $("#mcArea").style.display = "";
    $("#typeArea").style.display = "none";
    // default stem if missing:
    if(hasMCQ(card)) $("#quizQ").textContent = card.mcq.stem;
    else $("#quizQ").textContent = card.question || "—";
    renderMC(card);
  } else {
    $("#mcArea").style.display = "none";
    $("#typeArea").style.display = "";
    renderType(card);
  }
}

function wireQuizUI(){
  $("#quizStart").addEventListener("click", startQuiz);
  $("#quizCategory").addEventListener("change", updateQuizLengthOptions);

  $("#quizNext").addEventListener("click", ()=>{
    if(!quiz) return;
    quiz.idx += 1;

    if(quiz.idx >= quiz.order.length){
      $("#quizPill").textContent = "Finished";
      $("#quizQ").textContent = `Done! Score: ${quiz.correct}/${quiz.attempted} (${quiz.attempted?Math.round((quiz.correct/quiz.attempted)*100):0}%)`;
      $("#mcArea").style.display = "none";
      $("#typeArea").style.display = "none";
      $("#quizFeedback").style.display = "none";
      $("#quizNext").disabled = true;
      return;
    }
    renderQuizQ();
  });

  $("#checkType").addEventListener("click", checkType);
  $("#typeArea").addEventListener("keydown", (e)=>{
    if(e.key === "Enter" && e.target && e.target.classList.contains("typeInputSlot")){
      e.preventDefault();
      checkType();
    }
  });

  updateQuizLengthOptions();
}

// ---------- Browse ----------
function renderBrowse(){
  const q = ($("#searchInput").value || "").toLowerCase().trim();
  const cat = $("#browseCategory").value;
  const sort = $("#browseSort").value;

  let list = filterCards(cat);

  if(q){
    list = list.filter(c=>{
      const blob = `${c.question || ""} ${normalizeAnswer(c.answer)} ${cardCategory(c)}`.toLowerCase();
      return blob.includes(q);
    });
  }

  if(sort === "alpha"){
    list.sort((a,b)=> (a.question||"").localeCompare(b.question||""));
  } else {
    list.sort((a,b)=> {
      const ca = cardCategory(a), cb = cardCategory(b);
      return ca === cb ? (a.question||"").localeCompare(b.question||"") : ca.localeCompare(cb);
    });
  }

  const wrap = $("#browseList");
  wrap.innerHTML = "";
  list.forEach(c=>{
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <div class="top">
        <h3>${escapeHtml(c.question || "")}</h3>
        <span class="pill">${escapeHtml(cardCategory(c))}</span>
      </div>
      <details>
        <summary>Show answer</summary>
        <div class="a">${renderAnswerHTML(c.answer)}</div>
      </details>
    `;
    wrap.appendChild(div);
  });

}

function renderCheatSheet(){
  const byCat = {};
  (CARDS||[]).forEach(c=>{
    const cat = cardCategory(c);
    if(!byCat[cat]) byCat[cat] = [];
    byCat[cat].push(c);
  });

  const catOrder = Object.keys(byCat).sort((a,b)=>a.localeCompare(b));
  const html = catOrder.map(cat=>{
    const items = byCat[cat].map(c=>{
      const a = normalizeAnswer(c.answer);
      return `<li><strong>${escapeHtml(c.question || "")}</strong><br/><span class="muted">${escapeHtml(a)}</span></li>`;
    }).join("");
    return `<div style="margin-bottom:12px">
      <div style="font-weight:800; margin-bottom:6px">${escapeHtml(cat)}</div>
      <ol style="margin:0 0 0 18px; padding:0">${items}</ol>
    </div>`;
  }).join("");

  $("#cheatSheet").innerHTML = html;
}

function wireBrowseUI(){
  const debouncedBrowseRender = debounce(renderBrowse, 100);
  $("#searchInput").addEventListener("input", debouncedBrowseRender);
  $("#browseCategory").addEventListener("change", renderBrowse);
  $("#browseSort").addEventListener("change", renderBrowse);
}

// ---------- Progress page ----------
function renderProgress(){
  const total = (CARDS||[]).length;
  const t = nowMs();
  let due = 0, mastered = 0;

  (CARDS||[]).forEach(c=>{
    const s = stateFor(cardId(c));
    if(s.seen && (s.due||0) <= t) due += 1;
    if(s.seen && (s.interval||0) >= 30) mastered += 1;
  });

  $("#pTotal").textContent = String(total);
  $("#pDue").textContent = String(due);
  $("#pMastered").textContent = String(mastered);
}

function wireProgressUI(){
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
      if(!obj || typeof obj !== "object") throw new Error("Invalid");
      Object.assign(prog, obj);
      saveProgress(prog);
      toast("Imported!");
      renderProgress();
      updateDuePill();
    }catch{
      alert("Could not import that file.");
    }finally{
      e.target.value = "";
    }
  });
}

// ---------- Init ----------
(function init(){
  // safety: CARDS must exist
  if(typeof CARDS === "undefined" || !Array.isArray(CARDS)){
    console.error("CARDS not found. Falling back to an empty deck. Check data.js");
    globalThis.CARDS = [];
  }

  applyPerformanceMode();
  applyTheme();

  loadDailyCount();
  updateDuePill();

  wireStudyUI();
  wireQuizUI();
  wireBrowseUI();
  wireProgressUI();

  // initial renders
  pickNextCard(true);
  renderCheatSheet();
  renderBrowse();
})();

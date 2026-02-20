function renderMC(card){
  const correct = flatAnswer(card);

  // --- helpers for "more similar" distractors ---
  function norm(s){
    return String(s || "")
      .toLowerCase()
      .replace(/[“”]/g,'"')
      .replace(/[’]/g,"'")
      .replace(/[^a-z0-9%]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  function tokens(s){
    const t = norm(s).split(" ").filter(Boolean);
    return new Set(t);
  }
  function jaccard(aSet, bSet){
    if (!aSet.size || !bSet.size) return 0;
    let inter = 0;
    for (const x of aSet) if (bSet.has(x)) inter++;
    const uni = aSet.size + bSet.size - inter;
    return uni ? inter / uni : 0;
  }
  function lenScore(a, b){
    const la = a.length, lb = b.length;
    const denom = Math.max(la, lb, 1);
    const diff = Math.abs(la - lb) / denom; // 0..1
    return 1 - diff; // 1 best
  }

  const correctTok = tokens(correct);

  // Prefer same-category distractors if possible
  const sameCatCards = CARDS.filter(c => c.id !== card.id && c.category === card.category);
  const allOtherCards = CARDS.filter(c => c.id !== card.id);

  function buildCandidateList(cards){
    const seen = new Set([correct]);
    const out = [];
    for (const c of cards){
      const ans = flatAnswer(c);
      if (!ans || ans.length < 2) continue;
      if (seen.has(ans)) continue;
      seen.add(ans);

      const sim = jaccard(correctTok, tokens(ans));
      const lsim = lenScore(correct, ans);

      // weighted score: similarity + length match
      const score = (sim * 0.75) + (lsim * 0.25);

      out.push({ ans, score });
    }
    // most similar first
    out.sort((x,y) => y.score - x.score);
    return out;
  }

  let candidates = buildCandidateList(sameCatCards);
  if (candidates.length < 3){
    // not enough in the category → use whole deck
    candidates = buildCandidateList(allOtherCards);
  }

  // Take top 3 most similar as distractors
  const distractors = candidates.slice(0, 3).map(x => x.ans);

  // If still not enough (very small deck), fill randomly
  while (distractors.length < 3){
    const pick = flatAnswer(allOtherCards[Math.floor(Math.random() * allOtherCards.length)]);
    if (pick && pick !== correct && !distractors.includes(pick)) distractors.push(pick);
  }

  // Mix choices
  const choices = distractors.concat([correct]);
  for (let i = choices.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }

  const wrap = $("#mcChoices");
  wrap.innerHTML = "";
  choices.forEach(ch => {
    const b = document.createElement("button");
    b.className = "btn";
    b.style.textAlign = "left";
    b.textContent = ch;
    b.addEventListener("click", () => checkMC(card, ch, correct, b));
    wrap.appendChild(b);
  });
}
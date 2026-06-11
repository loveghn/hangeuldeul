
function decomposeChar(ch) {
  const code = ch.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return [ch];
  const cho = CHO[Math.floor(code / 28 / 21)];
  const jung = JUNG[Math.floor(code / 28) % 21];
  const jong = JONG[code % 28];
  const p = [cho];
  if (CJ[jung]) p.push(...CJ[jung]);
  else p.push(jung);
  if (jong) {
    if (CK[jong]) p.push(...CK[jong]);
    else p.push(jong);
  }
  return p;
}
function decompose(w) {
  return w.split("").flatMap(decomposeChar);
}

const VALID = RAW_WORDS.filter((w) => decompose(w).length === WORD_LEN);

function pickWord() {
  const idx = Math.floor(Date.now() / 86400000) % VALID.length;
  return VALID[idx];
}

let answer, ansPhon, currentRow, currentInput, guesses, gameOver, keyStates;

function pressKey(key) {
  const btn = document.querySelector(`[data-key="${key}"]`);

  if (!btn) return;

  btn.classList.add("pressed");

  setTimeout(() => {
    btn.classList.remove("pressed");
  }, 120);
}

function setMsg(m) {
  document.getElementById("message").textContent = m;
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1800);
}
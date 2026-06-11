function init() {
  answer = pickWord();
  ansPhon = decompose(answer);
  currentRow = 0;
  currentInput = [];
  guesses = [];
  gameOver = false;
  keyStates = {};
  setMsg("");
  document.getElementById("word-display").textContent = "";
  const old = document.querySelector(".action-row");
  if (old) old.remove();
  renderBoard();
  renderKeyboard();
}

function renderBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  for (let r = 0; r < MAX_TRIES; r++) {
    const row = document.createElement("div");
    row.className = "row";
    for (let c = 0; c < WORD_LEN; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.id = `cell-${r}-${c}`;
      const inner = document.createElement("div");
      inner.className = "cell-inner";
      const front = document.createElement("div");
      front.className = "cell-front";
      const back = document.createElement("div");
      back.className = "cell-back";
      if (r < guesses.length) {
        const g = guesses[r];
        front.textContent = g.phonemes[c] || "";
        back.textContent = g.phonemes[c] || "";
        back.classList.add(`back-${g.results[c]}`);
        inner.classList.add("flip");
        cell.classList.add("filled");
      } else if (r === currentRow) {
        front.textContent = currentInput[c] || "";
        if (c < currentInput.length) cell.classList.add("filled");
        if (c === currentInput.length && currentInput.length < WORD_LEN)
          cell.classList.add("active");
      }
      inner.appendChild(front);
      inner.appendChild(back);
      cell.appendChild(inner);
      row.appendChild(cell);
    }
    board.appendChild(row);
  }
}

function renderKeyboard() {
  const kb = document.getElementById("keyboard");
  kb.innerHTML = "";
  KB_ROWS.forEach((row) => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "kb-row";
    if (row[0] === "확인") rowDiv.style.display = "block";
    row.forEach((k) => {
      let btn;
      if (k === "확인") {
        btn = document.createElement("button");
        btn.className = "key-enter";
        btn.textContent = "확인";
        btn.dataset.key = "확인";
      } else if (k === "⌫") {
        btn = document.createElement("button");
        btn.className = "key key-del";
        btn.textContent = "⌫";
        btn.dataset.key = "⌫";
      } else {
        btn = document.createElement("button");
        btn.className = "key";
        btn.textContent = k;
        btn.dataset.key = k;
        if (keyStates[k]) btn.classList.add(keyStates[k]);
      }
      btn.addEventListener("click", () => handleKey(k));
      rowDiv.appendChild(btn);
    });
    kb.appendChild(rowDiv);
  });
}

function submit() {
  const inputWord = currentInput.join('');

  if (!ALLOWED_PHONEMES.has(inputWord)) {
    shakeRow(currentRow);
    setMsg('사전에 없는 단어예요.');
    return;
  }

  const results = Array(WORD_LEN).fill("absent");
  const aCopy = [...ansPhon],
    iCopy = [...currentInput];
  for (let i = 0; i < WORD_LEN; i++) {
    if (iCopy[i] === aCopy[i]) {
      results[i] = "correct";
      aCopy[i] = null;
      iCopy[i] = null;
    }
  }
  for (let i = 0; i < WORD_LEN; i++) {
    if (iCopy[i] === null) continue;
    const idx = aCopy.indexOf(iCopy[i]);
    if (idx !== -1) {
      results[i] = "present";
      aCopy[idx] = null;
    }
  }
  guesses.push({ phonemes: [...currentInput], results });
  currentInput.forEach((ph, i) => {
    if (!ALL_KEYS.includes(ph)) return;
    const prev = keyStates[ph],
      res = results[i];
    if (prev === "correct") return;
    if (prev === "present" && res !== "correct") return;
    keyStates[ph] = res;
  });
  const row = currentRow;
  currentRow++;
  currentInput = [];
  flipRow(row, guesses[row].phonemes, results, () => {
    renderKeyboard();
    const won = results.every((r) => r === "correct");
    if (won) {
      gameOver = true;
      setMsg(WIN_MSGS[row] || "성공!");
      showActions();
    } else if (currentRow >= MAX_TRIES) {
      gameOver = true;
      setMsg("아쉬워요! 정답은...");
      document.getElementById("word-display").textContent =
        `"${answer}"  (${ansPhon.join(" ")})`;
      showActions();
    }
  });
}

function handleKey(k) {
  if (gameOver) return;
  if (k === "⌫") {
    if (currentInput.length > 0) {
      currentInput.pop();
      renderBoard();
    }
    return;
  }
  if (k === "확인") {
    submit();
    return;
  }
  if (currentInput.length < WORD_LEN) {
    currentInput.push(k);
    renderBoard();
    const cell = document.getElementById(
      `cell-${currentRow}-${currentInput.length - 1}`,
    );
    if (cell) {
      cell.classList.remove("pop");
      void cell.offsetWidth;
      cell.classList.add("pop");
    }
  }
}

function flipRow(rowIdx, phonemes, results, onDone) {
  const DELAY = 120,
    DURATION = 500;
  for (let c = 0; c < WORD_LEN; c++) {
    const cell = document.getElementById(`cell-${rowIdx}-${c}`);
    if (!cell) continue;
    const inner = cell.querySelector(".cell-inner");
    const back = cell.querySelector(".cell-back");
    back.classList.add(`back-${results[c]}`);
    back.textContent = phonemes[c] || "";
    cell.querySelector(".cell-front").textContent = phonemes[c] || "";
    setTimeout(() => inner.classList.add("flip"), c * DELAY);
  }
  setTimeout(onDone, WORD_LEN * DELAY + DURATION);
}

function shakeRow(rowIdx) {
  for (let c = 0; c < WORD_LEN; c++) {
    const cell = document.getElementById(`cell-${rowIdx}-${c}`);
    if (!cell) continue;
    cell.classList.remove("shake");
    void cell.offsetWidth;
    cell.classList.add("shake");
  }
}


function showActions() {
  const div = document.createElement("div");
  div.className = "action-row";
  const shareBtn = document.createElement("button");
  shareBtn.className = "btn-share";
  shareBtn.textContent = "결과 공유하기";
  shareBtn.addEventListener("click", shareResult);
  const replayBtn = document.createElement("button");
  replayBtn.className = "btn-replay";
  replayBtn.textContent = "다시 하기";
  replayBtn.addEventListener("click", init);
  div.appendChild(shareBtn);
  div.appendChild(replayBtn);
  document.getElementById("keyboard").after(div);
}

function shareResult() {
  const won = guesses[guesses.length - 1]?.results.every(
    (r) => r === "correct",
  );
  const tries = won ? `${guesses.length}/${MAX_TRIES}` : `X/${MAX_TRIES}`;
  const grid = guesses
    .map((g) => g.results.map((r) => RESULT_EMOJI[r]).join(""))
    .join("\n");
  const text = `한글들 ${tries}\n\n${grid}\n\nhttps://loveghn.github.io/hangeuldeul`;
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => showToast("클립보드에 복사됐어요!"));
  } else {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast("클립보드에 복사됐어요!");
  }
}
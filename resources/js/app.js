document.addEventListener("keydown", (e) => {
  if (gameOver) return;

  if (e.key === "Backspace") {
    e.preventDefault();
    pressKey("⌫");
    handleKey("⌫");
    return;
  }

  if (e.key === "Enter") {
    e.preventDefault();
    pressKey("확인");
    handleKey("확인");
    return;
  }

  const koreanKey = KEY_MAP[e.code];

  // 매핑 없는 키는 무시
  if (!koreanKey) return;

  e.preventDefault();

  pressKey(koreanKey);
  handleKey(koreanKey);
});

init();

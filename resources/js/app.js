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

  // 키보드 레이아웃에 없는 키 무시
  if (!koreanKey) return;

  e.preventDefault();

  pressKey(koreanKey);
  handleKey(koreanKey);
});

init();

// ------------------------------------
// מאגר התמונות/מצבים של נאיה
// ------------------------------------
const originalMoods = [
  { name: "Fairy",    file: "Fairy.jpeg",    niceLabel: "Fairy 🧚"    },
  { name: "Hungry3",  file: "Hungry3.jpeg",  niceLabel: "Hungry 😋"   },
  { name: "Silly",    file: "Silly.jpeg",    niceLabel: "Silly 🤪"    },
  { name: "Tired",    file: "Tired.jpeg",    niceLabel: "Tired 😴"    },
];

// נכין עותק משוכפל ומעורבב (shuffle) בתחילת משחק
let nayaMoods = [];

// מצב משחק
let currentIndex = 0;
let gameOver = false;
let roundSolved = false; // האם הניחוש הנכון כבר בוצע בסיבוב הנוכחי

// אלמנטים מהדף
const imgEl = document.getElementById("naya-image");
const resultEl = document.getElementById("result");
const buttons = document.querySelectorAll(".mood-btn");
const nextBtn = document.getElementById("next-btn");
const finalMsgEl = document.getElementById("final-message");

// ------------------------------------
// פונקציה: ערבוב רשימה (Fisher-Yates shuffle)
// ------------------------------------
function shuffleArray(arr) {
  const a = arr.slice(); // העתק, לא משנות את המקור
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // החלפה
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ------------------------------------
// קונפטי כשמשתמש פגע בול
// ------------------------------------
function throwConfetti() {
  // איפה התמונה על המסך?
  const rect = imgEl.getBoundingClientRect();

  // נבחר נקודת יציאה בערך מאמצע התמונה
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  // כמה חלקיקים לירות
  const NUM_PIECES = 80; // יותר קונפטי 💖

  for (let i = 0; i < NUM_PIECES; i++) {
    const piece = document.createElement("div");
    piece.classList.add("confetti-piece");

    // נשים את זה ב-fixed יחסית למסך,
    // בדיוק סביב הפנים של נאיה (בערך)
    const spreadX = (Math.random() - 0.5) * rect.width * 0.8; // פיזור לרוחב
    const spreadY = (Math.random() - 0.5) * rect.height * 0.4; // פיזור לגובה קרוב להתחלה

    piece.style.left = originX + spreadX + "px";
    piece.style.top = originY + spreadY + "px";

    // צבע רנדומי בגוון מתוק
    piece.style.setProperty("--hue", Math.random());

    // גודל רנדומלי
    const size = Math.random() * 8 + 4; // 4px עד 12px
    piece.style.width = `${size}px`;
    piece.style.height = `${size}px`;

    // משך נפילה רנדומלי כדי שיראה טבעי
    piece.style.animationDuration = 1 + Math.random() * 1.5 + "s";

    // כל חתיכת קונפטי נופלת לזווית קצת שונה
    // נעשה לה רוטציה התחלתית שונה
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;

    document.body.appendChild(piece);

    // לנקות אחרי ~2 שניות כדי לא למלא את ה-DOM
    setTimeout(() => {
      piece.remove();
    }, 2000);
  }
}

// ------------------------------------
// רענון מסך לסיבוב הנוכחי
// ------------------------------------
function renderRound() {
  const current = nayaMoods[currentIndex];

  // מציגים את התמונה
  imgEl.src = `images/${current.file}`;

  // מאפסים תוצאה
  resultEl.textContent = "Make a guess 💭";
  resultEl.classList.remove("result-correct", "result-wrong");

  // מאפסים כפתור NEXT
  nextBtn.style.display = "none";
  nextBtn.disabled = false;

  // מאפסים מצב סיבוב
  roundSolved = false;

  // מנקים סימון שגוי ישן מהכפתורים ומאפשרים ללחוץ
  buttons.forEach((btn) => {
    btn.disabled = false;
    btn.classList.remove("wrong-guess");
  });

  // מסתירים הודעת סוף משחק
  finalMsgEl.style.display = "none";
}

// ------------------------------------
// מעבר לתמונה הבאה
// ------------------------------------
function goNext() {
  if (gameOver) return;

  currentIndex++;

  if (currentIndex >= nayaMoods.length) {
    // אין יותר תמונות -> סיום
    gameOver = true;
    showGameOver();
  } else {
    renderRound();
  }
}

// ------------------------------------
// מצב סוף משחק
// ------------------------------------
function showGameOver() {
  imgEl.src = "";
  resultEl.textContent = "";
  nextBtn.style.display = "none";
  finalMsgEl.style.display = "block";

  // לחיצה על כפתורים כבר לא הגיונית
  buttons.forEach((btn) => {
    btn.disabled = true;
  });
}

// ------------------------------------
// טיפול בלחיצה על תשובה
// ------------------------------------
buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (gameOver) return;

    const guessed = btn.getAttribute("data-mood"); // Fairy / Hungry3 / Silly / Tired
    const current = nayaMoods[currentIndex];
    const correct = guessed === current.name;

    if (correct) {
      // תשובה נכונה
      resultEl.textContent = `Correct! This is "${current.niceLabel}" 😍`;
      resultEl.classList.remove("result-wrong");
      resultEl.classList.add("result-correct");

      // בלון קונפטי 🎉
      throwConfetti();

      roundSolved = true;

      // ננעל את כל הכפתורים
      buttons.forEach((b) => {
        b.disabled = true;
      });

      // עכשיו מראים את NEXT
      nextBtn.style.display = "inline-block";

    } else {
      // תשובה לא נכונה
      resultEl.textContent = `Not this one 😅 Try again!`;
      resultEl.classList.remove("result-correct");
      resultEl.classList.add("result-wrong");

      // הכפתור שנלחץ מקבל סימון אדום/ורדרד
      btn.classList.add("wrong-guess");

      // שימי לב: אנחנו לא עוצרות את הסיבוב ולא מציגות NEXT
      // המשתמש עדיין יכול להמשיך לנחש עם כפתורים אחרים
    }
  });
});

// ------------------------------------
// לחיצה על NEXT ➜
// ------------------------------------
nextBtn.addEventListener("click", () => {
  if (gameOver) return;
  // רק אם כבר פתרו נכון את הסיבוב הנוכחי
  if (roundSolved) {
    goNext();
  } else {
    // אם לחצו Next בלי לפתור נכון, לא נאפשר לעבור
    // (אם את רוצה כן לאפשר, אפשר פשוט לקרוא goNext();)
    nextBtn.disabled = true;
    setTimeout(() => {
      nextBtn.disabled = false;
    }, 600);
  }
});

// ------------------------------------
// אתחול משחק
// ------------------------------------
function startGame() {
  // ערבוב סדר התמונות
  nayaMoods = shuffleArray(originalMoods);
  currentIndex = 0;
  gameOver = false;
  roundSolved = false;

  renderRound();
}

startGame();

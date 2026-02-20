/* ============================================================
   SCOREBOARD SHOWDOWN — script.js
   
   This file handles ALL the logic for the scoreboard app:
     1. SCORING — tracks Home & Away points, updates the display
     2. GAME CLOCK — a 12-minute countdown timer (start/pause/reset)
     3. PERIOD TRACKER — moves through periods 1–4
     4. POSSESSION ARROW — flips between Home and Away
   ============================================================ */


/* ---- SECTION 1: SCORING ---- */

/* These two variables hold the current score for each team.
   They start at 0 and go up when you click a +1, +2, or +3 button. */
let homeScore = 0;
let awayScore = 0;

/* These grab the HTML elements where the scores are displayed on screen.
   document.getElementById() looks in the HTML for an element with that id
   and gives us a reference to it so we can change its text later. */
const homeDisplay = document.getElementById("home-score");
const awayDisplay = document.getElementById("away-score");

/* This is the function that runs every time you click a scoring button.
   It takes two arguments:
     - team: either 'home' or 'away' (tells us WHICH team scored)
     - points: 1, 2, or 3 (tells us HOW MANY points to add)
   Then it adds the points to the right variable and updates the screen. */
function addScore(team, points) {
  if (team === 'home') {
    homeScore += points;
    homeDisplay.textContent = homeScore;
  } else {
    awayScore += points;
    awayDisplay.textContent = awayScore;
  }
}


/* ---- SECTION 1B: TIMEOUTS ---- */

/* Each team starts with 3 timeouts per half.
   These variables track how many each team has left. */
let homeTimeouts = 3;
let awayTimeouts = 3;

/* Grabs the container elements that hold the 3 dots for each team. */
const homeTimeoutDots = document.getElementById("home-timeouts");
const awayTimeoutDots = document.getElementById("away-timeouts");

/* This function is called when you click "Call Timeout" for either team.
   It checks if that team has any timeouts left:
     - If yes: subtract 1 and dim the rightmost active dot (turn it off).
     - If no: alert that there are none remaining.
   It also pauses the game clock automatically (like a real game). */
function useTimeout(team) {
  if (team === 'home') {
    if (homeTimeouts > 0) {
      homeTimeouts--;
      updateTimeoutDots('home');
      if (isRunning) startTimer();
    } else {
      alert("Home has no timeouts left!");
    }
  } else {
    if (awayTimeouts > 0) {
      awayTimeouts--;
      updateTimeoutDots('away');
      if (isRunning) startTimer();
    } else {
      alert("Away has no timeouts left!");
    }
  }
}

/* This function updates the visual dots to match the current timeout count.
   It loops through all 3 dot elements and adds/removes the "active" class
   depending on whether that dot should be lit up or dimmed. */
function updateTimeoutDots(team) {
  const dots = team === 'home'
    ? homeTimeoutDots.querySelectorAll(".dot")
    : awayTimeoutDots.querySelectorAll(".dot");
  const remaining = team === 'home' ? homeTimeouts : awayTimeouts;

  dots.forEach((dot, index) => {
    if (index < remaining) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });
}


/* ---- SECTION 2: GAME CLOCK ---- */

/* timeLeft stores the remaining time in SECONDS (12 min × 60 sec = 720).
   isRunning tracks whether the clock is currently counting down or paused. */
let timeLeft = 12 * 60;
let isRunning = false;

/* Grabs the clock display element from the HTML so we can update the time shown. */
const clockDisplay = document.getElementById("game-clock");

/* Grabs the Start/Pause button so we can change its label and listen for clicks. */
const startPauseBtn = document.getElementById("start-pause-clock");

/* Grabs the Reset Clock button. */
const resetClockBtn = document.getElementById("reset-clock");

/* This function converts timeLeft (a number in seconds like 720) into
   a readable "MM:SS" format (like "12:00") and puts it on screen.
   - Math.floor(timeLeft / 60) gets the minutes (720 / 60 = 12)
   - timeLeft % 60 gets the remaining seconds (720 % 60 = 0)
   - padStart(2, '0') makes sure single-digit seconds show as "05" not "5" */
function updateClock() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  clockDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/* timerInterval holds the ID of our repeating timer so we can stop it later.
   setInterval() runs a function over and over — we use it to tick once per second. */
let timerInterval;

/* startTimer() is a toggle — it either STARTS or PAUSES the clock:
   - If the clock is NOT running: start a 1-second interval that counts down.
     Each tick subtracts 1 from timeLeft and updates the display.
     When timeLeft hits 0, it stops the interval and alerts "Period over!"
   - If the clock IS running: stop the interval (pause it). */
function startTimer() {
  if (!isRunning) {
    isRunning = true;
    startPauseBtn.textContent = "Pause Clock";
    timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateClock();
      } else {
        clearInterval(timerInterval);
        isRunning = false;
        startPauseBtn.textContent = "Start Clock";
        /* If this was period 4, the game is over — trigger the celebration!
           Otherwise just alert that the period ended. */
        if (currentPeriod >= 4) {
          triggerVictory();
        } else {
          alert("Period over!");
        }
      }
    }, 1000);
  } else {
    clearInterval(timerInterval);
    isRunning = false;
    startPauseBtn.textContent = "Start Clock";
  }
}


/* ---- SECTION 3: PERIOD TRACKER ---- */

/* currentPeriod tracks which period we're in (1 through 4). */
let currentPeriod = 1;

/* Grabs the period display and Next Period button from the HTML. */
const periodDisplay = document.getElementById("period");
const nextPeriodBtn = document.getElementById("next-period");

/* When "Next Period" is clicked:
   - If we haven't hit period 4 yet, bump the period number up by 1,
     reset the clock back to 12:00, and pause it if it was running.
   - If we're already at period 4, alert that the game is over. */
nextPeriodBtn.addEventListener("click", () => {
  if (currentPeriod < 4) {
    currentPeriod++;
    periodDisplay.textContent = currentPeriod;
    timeLeft = 12 * 60;
    updateClock();
    startPauseBtn.textContent = "Start Clock";
    if (isRunning) startTimer();
  } else {
    triggerVictory();
  }
});


/* ---- SECTION 4: POSSESSION ARROW ---- */

/* homeHasPossession is a boolean (true/false).
   true = Home team has the ball, false = Away team has the ball. */
let homeHasPossession = true;

/* Grabs the possession arrow element and the Flip Possession button. */
const arrow = document.getElementById("possession-arrow");
const togglePossBtn = document.getElementById("toggle-possession");

/* This function updates the arrow on screen to point toward whichever
   team currently has possession, and swaps the CSS class for color styling. */
function updatePossession() {
  if (homeHasPossession) {
    arrow.textContent = "← HOME";
    arrow.className = "arrow home";
  } else {
    arrow.textContent = "AWAY →";
    arrow.className = "arrow away";
  }
}

/* When "Flip Possession" is clicked, toggle the boolean to the opposite value
   (true becomes false, false becomes true) then update the arrow display. */
togglePossBtn.addEventListener("click", () => {
  homeHasPossession = !homeHasPossession;
  updatePossession();
});


/* ---- SECTION 5: BUTTON LISTENERS & INITIALIZATION ---- */

/* When "Start Clock" / "Pause Clock" is clicked, run startTimer(). */
startPauseBtn.addEventListener("click", startTimer);

/* When "Reset Clock" is clicked, set the time back to 12:00 and pause
   the clock if it was running. */
resetClockBtn.addEventListener("click", () => {
  timeLeft = 12 * 60;
  updateClock();
  if (isRunning) startTimer();
});

/* These two calls run once when the page first loads to make sure
   the clock shows "12:00" and the possession arrow shows "← HOME"
   right away, before the user clicks anything. */
updateClock();
updatePossession();


/* ---- SECTION 6: VICTORY CELEBRATION ---- */

/* Grabs the victory overlay and its child elements. */
const victoryOverlay = document.getElementById("victory-overlay");
const victoryTitle = document.getElementById("victory-title");
const victoryTeam = document.getElementById("victory-team");
const victoryScoreText = document.getElementById("victory-score");
const confettiContainer = document.getElementById("confetti-container");
const newGameBtn = document.getElementById("new-game-btn");

/* This function triggers the end-of-game celebration.
   It compares the two scores, determines the winner (or tie),
   fills in the victory text, launches confetti, and shows the overlay. */
function triggerVictory() {
  let winnerName, winnerColor;

  if (homeScore > awayScore) {
    winnerName = "Team Tigers";
    winnerColor = "#00ffea";
    victoryTitle.textContent = "🎉 HOME WINS! 🎉";
  } else if (awayScore > homeScore) {
    winnerName = "Team Sharks";
    winnerColor = "#ffdd57";
    victoryTitle.textContent = "🎉 AWAY WINS! 🎉";
  } else {
    winnerName = "It's a Tie!";
    winnerColor = "#ffffff";
    victoryTitle.textContent = "😤 TIE GAME! 😤";
  }

  victoryTitle.style.color = winnerColor;
  victoryTeam.textContent = winnerName;
  victoryScoreText.textContent = `${homeScore}  –  ${awayScore}`;

  /* Show the overlay by removing the "hidden" class. */
  victoryOverlay.classList.remove("hidden");

  /* Launch confetti pieces. */
  launchConfetti(winnerColor);
}

/* Creates 80 confetti pieces — small colored squares that fall and spin
   across the screen using CSS animations. Each piece gets a random
   position, size, color, speed, and rotation to look chaotic and fun. */
function launchConfetti(teamColor) {
  confettiContainer.innerHTML = "";
  const colors = [teamColor, "#ff4d4d", "#ff6b6b", "#ffd93d", "#6bff6b", "#6bb5ff", "#ff6bff", "#ffffff"];

  for (let i = 0; i < 80; i++) {
    const piece = document.createElement("div");
    piece.classList.add("confetti-piece");

    /* Random horizontal position across the full screen width. */
    piece.style.left = Math.random() * 100 + "%";

    /* Random delay so they don't all fall at the same time. */
    piece.style.animationDelay = Math.random() * 3 + "s";

    /* Random fall duration between 2 and 5 seconds. */
    piece.style.animationDuration = (Math.random() * 3 + 2) + "s";

    /* Random color from our array. */
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

    /* Random size between 8px and 14px. */
    const size = Math.random() * 6 + 8;
    piece.style.width = size + "px";
    piece.style.height = size + "px";

    confettiContainer.appendChild(piece);
  }
}

/* Resets the entire game back to default — scores, clock, period,
   timeouts, possession — and hides the victory overlay. */
function resetGame() {
  /* Reset scores. */
  homeScore = 0;
  awayScore = 0;
  homeDisplay.textContent = "0";
  awayDisplay.textContent = "0";

  /* Reset clock. */
  timeLeft = 12 * 60;
  updateClock();
  if (isRunning) startTimer();
  startPauseBtn.textContent = "Start Clock";

  /* Reset period. */
  currentPeriod = 1;
  periodDisplay.textContent = "1";

  /* Reset timeouts. */
  homeTimeouts = 3;
  awayTimeouts = 3;
  updateTimeoutDots("home");
  updateTimeoutDots("away");

  /* Reset possession. */
  homeHasPossession = true;
  updatePossession();

  /* Hide the victory overlay and clear confetti. */
  victoryOverlay.classList.add("hidden");
  confettiContainer.innerHTML = "";
}

/* Wire up the "New Game" button on the victory screen. */
newGameBtn.addEventListener("click", resetGame);
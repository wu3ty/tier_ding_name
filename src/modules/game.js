import {
  LETTERS,
  SPIN_DURATION_MS,
  computeLetterRadius,
  computeSpinTargetRotation,
  formatTime,
  normalizeAngle,
  randomIndex,
  centerAngleForIndex,
  isFinalCountdown,
} from "./game-logic.js";

function extractRotationFromTransform(transformValue) {
  if (!transformValue || transformValue === "none") {
    return 0;
  }

  const matrix = new DOMMatrixReadOnly(transformValue);
  const angle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
  return normalizeAngle(angle);
}

function supportsAudio() {
  return Boolean(window.AudioContext || window.webkitAudioContext);
}

export function createGame(elements) {
  const {
    minutesInput,
    newRoundButton,
    wheel,
    wheelLetters,
    letterOutput,
    timerOutput,
    timerCard,
    roundEndBanner,
    messageOutput,
    getText = (key) => key,
  } = elements;

  let timeLeft = 0;
  let intervalId = null;
  let spinTimeoutId = null;
  let spinTickTimeoutId = null;
  let currentRotation = 0;
  let isSpinning = false;
  let audioContext = null;
  let currentMessageKey = "messageReady";

  function t(key) {
    return getText(key);
  }

  function setMessageByKey(key) {
    currentMessageKey = key;
    messageOutput.textContent = t(key);
  }

  function setCountdownWarning(isWarning) {
    timerCard.classList.toggle("timer-warning", isWarning);
  }

  function setRoundEndBannerVisible(isVisible) {
    roundEndBanner.hidden = !isVisible;
  }

  function setRoundControls(isRunning) {
    minutesInput.disabled = isRunning;
  }

  function ensureAudioContext() {
    if (!supportsAudio()) {
      return null;
    }

    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContextClass();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    return audioContext;
  }

  function playTone({
    frequency,
    durationMs = 100,
    type = "sine",
    gain = 0.035,
    attackMs = 8,
    releaseMs = 60,
  }) {
    const ctx = ensureAudioContext();
    if (!ctx) {
      return;
    }

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const startTime = ctx.currentTime;
    const endTime = startTime + durationMs / 1000;
    const attackTime = startTime + attackMs / 1000;
    const releaseStart = Math.max(attackTime, endTime - releaseMs / 1000);

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, startTime);
    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(gain, attackTime);
    gainNode.gain.setValueAtTime(gain, releaseStart);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(endTime);
  }

  function stopSpinSound() {
    if (spinTickTimeoutId) {
      clearTimeout(spinTickTimeoutId);
      spinTickTimeoutId = null;
    }
  }

  function scheduleSpinTickSound(startMs) {
    if (!isSpinning) {
      return;
    }

    const elapsed = performance.now() - startMs;
    const progress = Math.min(elapsed / SPIN_DURATION_MS, 1);
    const waitMs = 45 + progress * 150;
    const frequency = 920 - progress * 260;

    playTone({
      frequency,
      durationMs: 38,
      type: "triangle",
      gain: 0.022,
      attackMs: 4,
      releaseMs: 24,
    });

    if (progress < 1) {
      spinTickTimeoutId = window.setTimeout(() => {
        scheduleSpinTickSound(startMs);
      }, waitMs);
    }
  }

  function startSpinSound() {
    stopSpinSound();
    ensureAudioContext();
    scheduleSpinTickSound(performance.now());
  }

  function playWinDing() {
    playTone({
      frequency: 740,
      durationMs: 140,
      type: "sine",
      gain: 0.042,
      attackMs: 8,
      releaseMs: 85,
    });

    window.setTimeout(() => {
      playTone({
        frequency: 988,
        durationMs: 180,
        type: "sine",
        gain: 0.05,
        attackMs: 10,
        releaseMs: 100,
      });
    }, 100);
  }

  function playCountdownTick() {
    playTone({
      frequency: 1200,
      durationMs: 65,
      type: "square",
      gain: 0.045,
      attackMs: 3,
      releaseMs: 35,
    });
  }

  function playTimeUpAlarm() {
    playTone({
      frequency: 520,
      durationMs: 220,
      type: "sawtooth",
      gain: 0.06,
      attackMs: 10,
      releaseMs: 110,
    });
    window.setTimeout(() => {
      playTone({
        frequency: 390,
        durationMs: 340,
        type: "sawtooth",
        gain: 0.07,
        attackMs: 10,
        releaseMs: 140,
      });
    }, 110);
  }

  function stopTimer(reasonKey = "messageRoundEnded") {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    setRoundControls(false);
    setMessageByKey(reasonKey);
  }

  function stopSpin(reasonKey = "messageDrawCanceled") {
    if (spinTimeoutId) {
      clearTimeout(spinTimeoutId);
      spinTimeoutId = null;
    }
    stopSpinSound();
    if (!isSpinning) {
      return;
    }

    currentRotation = extractRotationFromTransform(getComputedStyle(wheel).transform);
    wheel.style.transition = "none";
    wheel.style.transform = `rotate(${currentRotation}deg)`;
    wheel.offsetHeight;
    wheel.style.transition = "";
    isSpinning = false;
    setRoundControls(false);
    setMessageByKey(reasonKey);
  }

  function resetCurrentRound() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }

    if (spinTimeoutId) {
      clearTimeout(spinTimeoutId);
      spinTimeoutId = null;
    }
    stopSpinSound();

    if (isSpinning) {
      currentRotation = extractRotationFromTransform(getComputedStyle(wheel).transform);
      wheel.style.transition = "none";
      wheel.style.transform = `rotate(${currentRotation}deg)`;
      wheel.offsetHeight;
      wheel.style.transition = "";
      isSpinning = false;
    }

    setCountdownWarning(false);
    setRoundEndBannerVisible(false);
    setRoundControls(false);
  }

  function tick() {
    timeLeft -= 1;
    timerOutput.textContent = formatTime(Math.max(timeLeft, 0));

    if (isFinalCountdown(timeLeft)) {
      setCountdownWarning(true);
      playCountdownTick();
    } else {
      setCountdownWarning(false);
    }

    if (timeLeft <= 0) {
      setCountdownWarning(false);
      setRoundEndBannerVisible(true);
      playTimeUpAlarm();
      stopTimer("messageTimeUp");
    }
  }

  function startTimer(minutes) {
    timeLeft = minutes * 60;
    timerOutput.textContent = formatTime(timeLeft);
    setCountdownWarning(false);
    setRoundEndBannerVisible(false);
    setRoundControls(true);
    setMessageByKey("messageRoundRunning");
    intervalId = setInterval(tick, 1000);
  }

  function drawWheelLetters() {
    wheelLetters.innerHTML = "";
    const letterRadius = computeLetterRadius(wheel.clientWidth);

    LETTERS.forEach((letter, index) => {
      const letterNode = document.createElement("span");
      const angle = centerAngleForIndex(index);
      letterNode.className = "wheel-letter";
      letterNode.textContent = letter;
      letterNode.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translateY(-${letterRadius}px)`;
      wheelLetters.append(letterNode);
    });
  }

  function spinWheel(minutes) {
    const targetIndex = randomIndex(LETTERS.length);
    const targetLetter = LETTERS[targetIndex];
    const fullSpins = 6 + randomIndex(4);
    const targetRotation = computeSpinTargetRotation({
      currentRotation,
      targetIndex,
      extraSpins: fullSpins,
    });

    isSpinning = true;
    setRoundControls(true);
    setMessageByKey("messageSpinning");
    letterOutput.textContent = "?";
    startSpinSound();

    wheel.style.transition = `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.16, 0.86, 0.14, 1)`;
    wheel.style.transform = `rotate(${targetRotation}deg)`;

    spinTimeoutId = window.setTimeout(() => {
      currentRotation = normalizeAngle(targetRotation);
      wheel.style.transition = "";
      wheel.style.transform = `rotate(${currentRotation}deg)`;
      isSpinning = false;
      spinTimeoutId = null;
      stopSpinSound();

      letterOutput.textContent = targetLetter;
      playWinDing();
      startTimer(minutes);
    }, SPIN_DURATION_MS);
  }

  function startRound() {
    const minutes = Number.parseInt(minutesInput.value, 10);
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 30) {
      setMessageByKey("messageValidation");
      return;
    }

    if (isSpinning || intervalId) {
      resetCurrentRound();
    }

    spinWheel(minutes);
  }

  newRoundButton.addEventListener("click", startRound);

  drawWheelLetters();
  window.addEventListener("resize", drawWheelLetters);
  timerOutput.textContent = formatTime(0);
  setCountdownWarning(false);
  setRoundEndBannerVisible(false);

  function refreshLanguage() {
    messageOutput.textContent = t(currentMessageKey);
    if (!roundEndBanner.hidden) {
      roundEndBanner.textContent = t("endRoundBanner");
    }
  }

  return {
    refreshLanguage,
  };
}

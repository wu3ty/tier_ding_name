import { createGame } from "./modules/game.js";

const translations = {
  de: {
    pageTitle: "Tier Ding Name",
    languageLabel: "Sprache",
    languageSelectAria: "Sprache waehlen",
    heroTag: "Das wilde Wortspiel fuer Kinder",
    heroText:
      "Dreht am Gluecksrad, ruft laut den Buchstaben und findet blitzschnell ein Tier, ein Ding und einen Namen!",
    minutesLabel: "Rundenzeit (Minuten)",
    newRoundButton: "Neue Runde starten",
    startLetterTitle: "Startbuchstabe",
    timeRemainingTitle: "Verbleibende Zeit",
    endRoundBanner: "Runde vorbei!",
    messageReady: "Waehle eine Zeit und starte eine Runde.",
    howtoTitle: "So macht das Spiel am meisten Spass",
    howtoOneTitle: "1. Rad drehen",
    howtoOneText:
      "Startet die Runde und schaut, wo der Zeiger stoppt. Der Buchstabe gilt fuer alle.",
    howtoTwoTitle: "2. Schnell denken",
    howtoTwoText: "Sammelt kreative Ideen. Je ausgefallener und passender, desto besser.",
    howtoThreeTitle: "3. Gemeinsam feiern",
    howtoThreeText:
      "Wenn die Zeit um ist, vergleicht ihr eure Begriffe. 2 Punkte fuer ein einzigartiges Wort, 1 Punkt bei gleicher Antwort, 0 Punkte ohne Antwort.",
    howtoFourTitle: "4. Gewinner ist",
    howtoFourText: "Wer nach mehreren Runden die meisten Punkte hat.",
    messageRoundEnded: "Runde beendet.",
    messageDrawCanceled: "Auslosung abgebrochen.",
    messageTimeUp: "Zeit ist um. Runde vorbei!",
    messageRoundRunning: "Runde laeuft. Findet Tier, Ding und Name!",
    messageSpinning: "Gluecksrad dreht...",
    messageValidation: "Bitte gib eine Zahl zwischen 1 und 30 Minuten ein.",
  },
  en: {
    pageTitle: "Animal Thing Name",
    languageLabel: "Language",
    languageSelectAria: "Choose language",
    heroTag: "The wild word game for kids",
    heroText:
      "Spin the wheel, call out the letter, and quickly find an animal, an object, and a name!",
    minutesLabel: "Round time (minutes)",
    newRoundButton: "Start new round",
    startLetterTitle: "Starting letter",
    timeRemainingTitle: "Time left",
    endRoundBanner: "Round over!",
    messageReady: "Choose a time and start a round.",
    howtoTitle: "How to make the game extra fun",
    howtoOneTitle: "1. Spin the wheel",
    howtoOneText:
      "Start the round and watch where the pointer stops. That letter is for everyone.",
    howtoTwoTitle: "2. Think fast",
    howtoTwoText: "Collect creative ideas. The more unique and fitting, the better.",
    howtoThreeTitle: "3. Celebrate together",
    howtoThreeText:
      "When time is up, compare answers. 2 points for a unique word, 1 point for a shared word, 0 if empty.",
    howtoFourTitle: "4. Winner is",
    howtoFourText: "Whoever has the most points after several rounds.",
    messageRoundEnded: "Round ended.",
    messageDrawCanceled: "Draw canceled.",
    messageTimeUp: "Time is up. Round over!",
    messageRoundRunning: "Round is running. Find animal, thing, and name!",
    messageSpinning: "Wheel is spinning...",
    messageValidation: "Please enter a number between 1 and 30 minutes.",
  },
};

const languageSelect = document.querySelector("#language-select");
const i18nNodes = document.querySelectorAll("[data-i18n]");

let currentLanguage = "de";

function getText(key) {
  return translations[currentLanguage][key] ?? key;
}

function applyLanguage(language) {
  currentLanguage = translations[language] ? language : "de";

  i18nNodes.forEach((node) => {
    const key = node.dataset.i18n;
    node.textContent = getText(key);
  });

  document.documentElement.lang = currentLanguage;
  document.title = getText("pageTitle");
  languageSelect.setAttribute("aria-label", getText("languageSelectAria"));
}

const game = createGame({
  minutesInput: document.querySelector("#minutes"),
  newRoundButton: document.querySelector("#new-round-btn"),
  wheel: document.querySelector("#wheel"),
  wheelLetters: document.querySelector("#wheel-letters"),
  letterOutput: document.querySelector("#letter"),
  timerOutput: document.querySelector("#timer"),
  timerCard: document.querySelector("#timer-card"),
  roundEndBanner: document.querySelector("#round-end-banner"),
  messageOutput: document.querySelector("#message"),
  getText,
});

languageSelect.value = "de";
applyLanguage("de");

actionOnLanguageChange();

function actionOnLanguageChange() {
  languageSelect.addEventListener("change", (event) => {
    applyLanguage(event.target.value);
    game.refreshLanguage();
  });
}

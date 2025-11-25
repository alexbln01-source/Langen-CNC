// ===============================
// Schnellzugriffe
// ===============================
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

const numInput   = $("#numInput");
const kundeInput = $("#kundeInput");

const kbPopup = $("#keyboardPopup");
const kbInput = $("#keyboardInput");
const kbGrid  = $("#keyboardGrid");
const kbTitle = $("#keyboardTitle");

let currentField = null;
let selectedType = null;

// ===============================
// Kundenliste
// ===============================
const kundenListe = [
  ["LP", "L&P"],
  ["LPEILT", "L&P EILT SEHR"],
  ["SCHUETTE", "Schütte"],
  ["SCHUETTEEILT", "Schütte EILT SEHR"],
  ["KLEY", "Kleymann"],
  ["KLEYEILT", "Kleymann EILT SEHR"],
  ["COMTEZN8", "Comte ZN8"],
  ["CHEMISCH", "Comte Chemisch Vernickeln"],
  ["DICK", "Comte Dickschichtpassivierung"],
  ["BLAU", "Comte Blau ZN8"],
  ["PENTZ", "Pentz & Gerdes ZN8"],
  ["RCS", "RCS Schweißen"],
  ["COATINC", "Coatinc 24 Verzinken"]
];

// Buttons erzeugen
const btnContainer = $("#kundenButtons");
kundenListe.forEach(k => {
  const b = document.createElement("button");
  b.textContent = k[1];
  b.dataset.type = k[0];
  b.classList.add("action");
  b.onclick = () => makeOutput(k[0]);
  btnContainer.appendChild(b);
});

// ===============================
// Auswahl markieren
// ===============================
function makeOutput(type) {
  selectedType = type;
  $$("#kundenButtons button").forEach(b => b.classList.remove("active"));
  document.querySelector(`[data-type="${type}"]`).classList.add("active");
}

// ===============================
// Popup-Tastatur
// ===============================
function buildKeyboard(type) {
  kbGrid.innerHTML = "";
  const chars = type === "numbers"
    ? ["1","2","3","4","5","6","7","8","9","0"]
    : "QWERTZUIOPÜASDFGHJKLÖÄYXCVBNM".split("");

  chars.forEach(ch => {
    const btn = document.createElement("button");
    btn.textContent = ch;
    btn.onclick = () => kbInput.value += ch;
    kbGrid.appendChild(btn);
  });
}

function openKeyboard(field, type) {
  currentField = field;

  kbTitle.textContent = type === "numbers" ? "Beistellnummer" : "Kundenname";
  kbInput.value = field.value;
  kbPopup.style.display = "flex";

  buildKeyboard(type);
}

// Aktionen
$("#btnDel").onclick = () => kbInput.value = kbInput.value.slice(0, -1);
$("#btnClose").onclick = () => kbPopup.style.display = "none";

$("#btnOk").onclick = () => {
  currentField.value = kbInput.value;
  kbPopup.style.display = "none";

  // Automatisch weiter zum Kundenname
  if (currentField === numInput) {
    openKeyboard(kundeInput, "letters");
  }
};

// Öffnen per Tap (Focus blockieren!)
numInput.addEventListener("focus", e => { e.preventDefault(); numInput.blur(); openKeyboard(numInput, "numbers"); });
kundeInput.addEventListener("focus", e => { e.preventDefault(); kundeInput.blur(); openKeyboard(kundeInput, "letters"); });

// ===============================
// Validierung
// ===============================
function validate() {
  if (!selectedType) return alert("Bitte Kundenart wählen!"), false;
  if (!numInput.value.trim()) return alert("Bitte Beistellnummer eingeben!"), false;

  const need = ["COMTEZN8","CHEMISCH","DICK","BLAU","PENTZ","RCS","COATINC"];
  if (need.includes(selectedType) && !kundeInput.value.trim()) {
    return alert("Bitte Kundenname eingeben!"), false;
  }
  return true;
}

// ===============================
// DRUCKEN → Öffnet druck.html
// ===============================
$("#btnDrucken").onclick = () => {
  if (!validate()) return;

  const payload = {
    selectedType,
    beistell: numInput.value.trim(),
    kundename: kundeInput.value.trim()
  };

  localStorage.setItem("DRUCKDATEN", JSON.stringify(payload));

  const win = window.open("druck.html", "_blank");

  // 1 Sekunde später App schließen
  setTimeout(() => window.close(), 1000);
};

// ===============================
// Zurück
// ===============================
$("#btnBack").onclick = () => window.location.href = "../index.html";
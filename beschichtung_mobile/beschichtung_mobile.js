// ===============================
// Schnellzugriffe
// ===============================
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

const numInput   = $("#numInput");
const kundeInput = $("#kundeInput");

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
  const btn = document.createElement("button");
  btn.textContent = k[1];
  btn.dataset.type = k[0];
  btn.classList.add("action");
  btn.onclick = () => makeOutput(k[0]);
  btnContainer.appendChild(btn);
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
// DRUCKEN – HTML Übergabe an druck.html
// ===============================
$("#btnDrucken").onclick = () => {
  if (!validate()) return;

  const beistell   = numInput.value.trim();
  const kundename  = kundeInput.value.trim();

  // Daten speichern
  const payload = { selectedType, beistell, kundename };
  localStorage.setItem("DRUCKDATEN", JSON.stringify(payload));

  // Druckseite öffnen
  window.open("druck.html", "_blank");
};

// Zurück
$("#btnBack").onclick = () => window.location.href = "../index.html";
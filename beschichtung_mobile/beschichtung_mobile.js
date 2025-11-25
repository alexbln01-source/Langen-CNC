// ===============================
// Schnellzugriffe
// ===============================
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

const out        = $("#output-content");
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

// ===============================
// Buttons erzeugen
// ===============================
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
// Ausgabe – Textblock wie PC
// ===============================
function buildOutput(type) {
  const n = numInput.value.trim();
  const k = kundeInput.value.trim();

  let z1 = n;
  let z2 = "";
  let z3 = "";
  let z4 = "";

  switch (type) {
    case "LP":           z2 = "L&P"; break;
    case "LPEILT":       z2 = "L&P"; z3 = "EILT SEHR"; break;

    case "SCHUETTE":     z2 = "Schütte"; break;
    case "SCHUETTEEILT": z2 = "Schütte"; z3 = "EILT SEHR"; break;

    case "KLEY":         z2 = "Kleymann"; break;
    case "KLEYEILT":     z2 = "Kleymann"; z3 = "EILT SEHR"; break;

    case "COMTEZN8":     z2 = "Comte"; z3 = "„ZN8“"; z4 = k; break;
    case "CHEMISCH":     z2 = "Comte"; z3 = "„Chemisch Vernickeln“"; z4 = k; break;
    case "DICK":         z2 = "Comte"; z3 = "„Dickschichtpassivierung“"; z4 = k; break;
    case "BLAU":         z2 = "Comte"; z3 = "„Blau ZN8“"; z4 = k; break;

    case "PENTZ":        z2 = "Pentz & Gerdes"; z3 = "„ZN8“"; z4 = k; break;
    case "RCS":          z2 = "RCS GmbH";       z3 = "„Schweißen“";    z4 = k; break;

    case "COATINC":      z2 = "Coatinc 24 GmbH"; z3 = "„Verzinken“";   z4 = k; break;
  }

  let html = "";

  html += `<div class="line line-big line-num">${z1}</div>`;
  if (z2) html += `<div class="line line-big line-main">${z2}</div>`;

  if (z3) {
    if (z3.includes("EILT SEHR")) {
      html += `<div class="line line-big line-eilt">„EILT SEHR“</div>`;
    } else {
      html += `<div class="line line-mid line-sub">${z3}</div>`;
    }
  }

  if (z4) html += `<div class="line line-mid line-name">(${z4})</div>`;

  return html;
}

// ===============================
// Vorschau aktualisieren
// ===============================
function makeOutput(type) {
  selectedType = type;

  $$("#kundenButtons button").forEach(b => b.classList.remove("active"));
  const activeBtn = document.querySelector(`#kundenButtons button[data-type="${type}"]`);
  if (activeBtn) activeBtn.classList.add("active");
}

// ===============================
// Tastatur
// ===============================
function buildKeyboard(type) {
  kbGrid.innerHTML = "";
  const chars = type === "numbers"
    ? ["1","2","3","4","5","6","7","8","9","0"]
    : "QWERTZUIOPÜASDFGHJKLÖÄYXCVBNM".split("");

  chars.forEach(ch => {
    const b = document.createElement("button");
    b.textContent = ch;
    b.onclick = () => kbInput.value += ch;
    kbGrid.appendChild(b);
  });
}

function openKeyboard(field, type) {
  currentField = field;
  kbTitle.textContent = type === "numbers" ? "Beistellnummer" : "Kundenname";

  kbInput.value = field.value || "";
  kbPopup.style.display = "flex";

  buildKeyboard(type);
  setTimeout(() => kbInput.focus(), 50);
}

$("#btnDel").onclick = () => kbInput.value = kbInput.value.slice(0, -1);
$("#btnClose").onclick = () => kbPopup.style.display = "none";

$("#btnOk").onclick = () => {
  if (!currentField) return;

  currentField.value = kbInput.value;
  kbPopup.style.display = "none";

  if (currentField === numInput) {
    openKeyboard(kundeInput, "letters");
  }
};

// Virtual Keyboard Triggering
numInput.addEventListener("focus", e => {
  e.preventDefault(); numInput.blur();
  openKeyboard(numInput, "numbers");
});
kundeInput.addEventListener("focus", e => {
  e.preventDefault(); kundeInput.blur();
  openKeyboard(kundeInput, "letters");
});

// ===============================
// Validierung
// ===============================
function validate() {
  if (!selectedType) {
    alert("Bitte einen Kunden wählen!");
    return false;
  }
  if (!numInput.value.trim()) {
    alert("Bitte Beistellnummer eingeben!");
    return false;
  }

  const need = [
    "COMTEZN8", "CHEMISCH", "DICK", "BLAU",
    "PENTZ", "RCS", "COATINC"
  ];
  if (need.includes(selectedType) && !kundeInput.value.trim()) {
    alert("Bitte Kundenname eingeben!");
    return false;
  }

  return true;
}

// ===============================
// PDF DRUCKEN
// ===============================
$("#btnDrucken").onclick = async () => {
  if (!validate()) return;

  out.innerHTML = buildOutput(selectedType);

  const canvas = await html2canvas(out, {
    backgroundColor: "#FFF",
    scale: 3
  });

  const img = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a6"
  });

  pdf.addImage(img, "PNG", 0, 0, 148, 105);

  const blob = pdf.output("blob");
  const url = URL.createObjectURL(blob);

  window.open(url, "_blank");
};

// ===============================
// Zurück
// ===============================
$("#btnBack").onclick = () => {
  window.location.href = "../index.html";
};

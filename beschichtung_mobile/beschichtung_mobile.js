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
b.classList.add("action");   // <- WICHTIG!
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

  // Zeile 1 – Beistellnummer
  html += `<div class="line line-big line-num">${z1}</div>`;

  // Zeile 2 – Kunde / Firma (immer groß & fett)
  if (z2) {
    html += `<div class="line line-big line-main">${z2}</div>`;
  }

  // Zeile 3 – Zusatz (EILT SEHR groß, der Rest kleiner)
  if (z3) {
    if (z3.includes("EILT SEHR")) {
      html += `<div class="line line-big line-eilt">„EILT SEHR“</div>`;
    } else {
      html += `<div class="line line-mid line-sub">${z3}</div>`;
    }
  }

  // Zeile 4 – Kundenname in Klammern
  if (z4) {
    html += `<div class="line line-mid line-name">(${z4})</div>`;
  }

  return html;
}

// Preview im rechten Bereich
function makeOutput(type) {
  selectedType = type;
  

  // aktive Buttonfarbe klar anzeigen
$$("#kundenButtons button").forEach(b => b.classList.remove("active"));
const activeBtn = document.querySelector(`#kundenButtons button[data-type="${type}"]`);
if (activeBtn) activeBtn.classList.add("active");
}

// ===============================
// Tastatur
// ===============================
function buildKeyboard(type) {
  kbGrid.innerHTML = "";
  const chars =
    type === "numbers"
      ? ["1","2","3","4","5","6","7","8","9","0"]
      : "QWERTZUIOPÜASDFGHJKLÖÄYXCVBNM".split("");

  chars.forEach(ch => {
    const b = document.createElement("button");
    b.textContent = ch;
    b.onclick = () => (kbInput.value += ch);
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

$("#btnDel").onclick   = () => (kbInput.value = kbInput.value.slice(0, -1));
$("#btnClose").onclick = () => (kbPopup.style.display = "none");

$("#btnOk").onclick = () => {
  if (!currentField) return;
  currentField.value = kbInput.value;
  kbPopup.style.display = "none";

  // nach Nummer automatisch Kunden-Tastatur öffnen
  if (currentField === numInput) {
    openKeyboard(kundeInput, "letters");
  }
};

// Echte Tastatur blockieren + Popup öffnen
numInput.addEventListener("focus", e => {
    e.preventDefault();
    numInput.blur();
    openKeyboard(numInput, "numbers");
});
kundeInput.addEventListener("focus", e => {
    e.preventDefault();
    kundeInput.blur();
    openKeyboard(kundeInput, "letters");
});

// Tipp-Events (z.B. Android)
numInput.addEventListener("click", () => {
    numInput.blur();
    openKeyboard(numInput, "numbers");
});
kundeInput.addEventListener("click", () => {
    kundeInput.blur();
    openKeyboard(kundeInput, "letters");
});
kbInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    $("#btnOk").click();
  }
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
    "COMTEZN8",
    "CHEMISCH",
    "DICK",
    "BLAU",
    "PENTZ",
    "RCS",
    "COATINC"
  ];
  if (need.includes(selectedType) && !kundeInput.value.trim()) {
    alert("Bitte Kundenname eingeben!");
    return false;
  }
  return true;
}

// ===============================
// Drucken – 1× A5 quer, Logo unten rechts
// ===============================
$("#btnDrucken").onclick = () => {
  if (!validate()) return;

  const outputHTML = buildOutput(selectedType);

  const pw = window.open("", "_blank", "width=1200,height=850");

  pw.document.write(`
    <html>
    <head>
      <style>
        @page {
          size: A5 landscape;
          margin: 0;
        }
        * {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        html, body {
          width: 210mm;
          height: 148mm;
          margin: 0;
          padding: 0;
          overflow: hidden;
          font-family: Arial, sans-serif;
        }
        #wrapper {
          position: relative;
          box-sizing: border-box;
          width: 210mm;
          height: 148mm;

          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;

          padding-bottom: 18mm; /* Platz für Logo abziehen */
        }
        .line {
          width: 100%;
          text-align: center;
          font-weight: 900;
          margin: 0;
          padding: 0;
        }
        .line-big {
          font-size: 60pt;
          line-height: 1.0;
        }
        .line-mid {
          font-size: 32pt;
          line-height: 1.0;
        }
        .line-num {
          margin-bottom: 4mm;
        }
        .line-main {
          margin-bottom: 2mm;
        }
        .line-sub {
          margin-top: 1mm;
        }
        .line-name {
          margin-top: 1mm;
        }
        #logo {
          position: absolute;
          right: 8mm;
          bottom: 6mm;
          width: 36mm;
          height: auto;
        }
      </style>
    </head>
    <body>
      <div id="wrapper">
        ${outputHTML}
        <img id="logo" src="../langen.png">
      </div>
    </body>
    </html>
  `);

  pw.document.close();

  setTimeout(() => {
    pw.print();
    pw.close();
  }, 350);
};

// ===============================
// Zurück
// ===============================
$("#btnBack").onclick = () => {
  window.location.href = "../index.html";
};
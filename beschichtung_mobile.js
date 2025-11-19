// beschichtung.js – FINAL VERSION

var $  = s => document.querySelector(s);
var $$ = s => Array.from(document.querySelectorAll(s));

var out            = $('#output-content');
var kundenContainer = $('#kunden');
var numInput       = $('#numInput');
var kundeInput     = $('#kundeInput');

var kbPopup  = $('#keyboardPopup');
var kbInput  = $('#keyboardInput');
var kbGrid   = $('#keyboardGrid');
var kbTitle  = $('#keyboardTitle');
var currentField = null;

var selectedType = null;


// ===============================
// Kundenliste
// ===============================
var kundenListe = [
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
function initKundenButtons() {
  kundenContainer.innerHTML = '';
  kundenListe.forEach(([type, label]) => {
    let b = document.createElement('button');
    b.className   = 'action';
    b.dataset.type = type;
    b.textContent = label;
    b.onclick = () => makeOutput(type);
    kundenContainer.appendChild(b);
  });
}


// ===============================
// Ausgabe generieren
// ===============================
function buildOutput(type) {

  let n = numInput.value.trim();
  let k = kundeInput.value.trim();

  let z1 = n, z2 = "", z3 = "", z4 = "";

  switch (type) {
    case 'LP': z2 = 'L&P'; break;
    case 'LPEILT': z2 = 'L&P'; z3 = '„EILT SEHR“'; break;

    case 'SCHUETTE': z2 = 'Schütte'; break;
    case 'SCHUETTEEILT': z2 = 'Schütte'; z3 = '„EILT SEHR“'; break;

    case 'KLEY': z2 = 'Kleymann'; break;
    case 'KLEYEILT': z2 = 'Kleymann'; z3 = '„EILT SEHR“'; break;

    case 'COMTEZN8': z2 = 'Comte'; z3 = 'ZN8'; z4 = k; break;
    case 'CHEMISCH': z2 = 'Comte'; z3 = 'Chemisch Vernickeln'; z4 = k; break;
    case 'DICK': z2 = 'Comte'; z3 = 'Dickschichtpassivierung'; z4 = k; break;
    case 'BLAU': z2 = 'Comte'; z3 = 'Blau ZN8'; z4 = k; break;

    case 'PENTZ': z2 = 'Pentz & Gerdes'; z3 = 'ZN8'; z4 = k; break;
    case 'RCS': z2 = 'RCS GmbH'; z3 = 'Schweißen'; z4 = k; break;
    case 'COATINC': z2 = 'Coatinc 24 GmbH'; z3 = 'Verzinken'; z4 = k; break;
  }

  let html = '';
  html += `<div style="font-size:60pt; margin-bottom:6mm;">${z1}</div>`;
  if (z2) html += `<div style="font-size:48pt; font-weight:900;">${z2}</div>`;
  if (z3) html += `<div style="font-size:32pt;">${z3}</div>`;
  if (z4) html += `<div style="font-size:32pt;">(${z4})</div>`;

  return html;
}


// ===============================
// Vorschau aktualisieren
// ===============================
function makeOutput(type) {
  selectedType = type;
  out.innerHTML = buildOutput(type);

  $$('#kunden button').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-type="${type}"]`).classList.add('active');
}


// ===============================
// Tastatur
// ===============================
function buildKeyboard(type) {
  kbGrid.innerHTML = '';

  let chars = (type === 'numbers')
    ? ['1','2','3','4','5','6','7','8','9','0']
    : 'QWERTZUIOPÜASDFGHJKLÖÄYXCVBNM'.split('');

  chars.forEach(c => {
    let b = document.createElement('button');
    b.textContent = c;
    b.className = "kbKey";
    b.onclick = () => kbInput.value += c;
    kbGrid.appendChild(b);
  });
}

function openKeyboard(field, type) {
  currentField = field;
  kbTitle.textContent = type === 'numbers'
    ? "Beistellnummer eingeben"
    : "Kundenname eingeben";
  kbInput.value = field.value || '';
  buildKeyboard(type);
  kbPopup.style.display = 'flex';
  setTimeout(() => kbInput.focus(), 100);
}

function closeKeyboard() {
  kbPopup.style.display = 'none';
}

function initKeyboard() {

  $('#btnDel').onclick = () =>
    kbInput.value = kbInput.value.slice(0, -1);

  $('#btnClose').onclick = closeKeyboard;

  $('#btnOk').onclick = () => {
    currentField.value = kbInput.value.trim();
    if (currentField === numInput) openKeyboard(kundeInput, 'letters');
    else closeKeyboard();
  };

  numInput.onclick   = () => openKeyboard(numInput, 'numbers');
  kundeInput.onclick = () => openKeyboard(kundeInput, 'letters');

  kbInput.addEventListener('keydown', e => {
    if (e.key === "Enter") {
      e.preventDefault();
      $('#btnOk').click();
    }
  });
}


// ===============================
// Validierung
// ===============================
function validate() {
  let n = numInput.value.trim();
  let k = kundeInput.value.trim();

  if (!selectedType) return alert("Bitte einen Kunden wählen.");
  if (!n) return alert("Bitte Beistellnummer eingeben.");

  let need = ['COMTEZN8','CHEMISCH','DICK','BLAU','PENTZ','RCS','COATINC'];
  if (need.includes(selectedType) && !k)
    return alert("Bitte Kundenname eingeben.");

  return true;
}


// ===============================
// DRUCKEN *** FINAL FIXED ***
// ===============================
function initPrintButton() {

  $('#btnDrucken').onclick = () => {

    if (!validate()) return;

    out.innerHTML = buildOutput(selectedType);

    let printArea = $('#printArea');
    let popup = window.open("", "_blank", "width=1200,height=850");

    popup.document.write(`
      <html>
      <head>
      <title>Drucken</title>
      <style>

      @page { size: A5 landscape; margin: 0; }

      html, body {
        margin: 0;
        padding: 0;
        width: 210mm;
        height: 148mm;
        background: white;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      #printArea {
        width: 210mm;
        height: 148mm;
        padding: 10mm;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
      }

      #output-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-weight: 700;
        font-family: Arial, Helvetica, sans-serif !important;
        text-align: center;
        line-height: 1.2;
      }

     #output-footer {
  position: absolute;
  bottom: 8mm;
  right: 8mm;
  width: auto;
  height: auto;
  margin: 0;
  padding: 0;
}
#output-footer img {
  width: 40mm;
  height: auto;
  max-height: 15mm;
}
      </style>
      </head>

      <body>
        ${printArea.outerHTML}
      </body>
      </html>
    `);

    popup.document.close();
    setTimeout(() => popup.print(), 200);
  };
}


// ===============================
// Zurück
// ===============================
function initBackButton() {
  $('#btnBack').onclick = () => window.location.href = "index.html";
}


// ===============================
// INIT
// ===============================
window.addEventListener('DOMContentLoaded', () => {
  initKundenButtons();
  initKeyboard();
  initPrintButton();
  initBackButton();
});
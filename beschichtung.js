/* ===========================================================
   beschichtung_core.js – FINAL VERSION
   PC + Mobile
   Alle Fixes integriert:
   - gleiche Schrift im Druck & Vorschau
   - Druck immer exakt 1 Seite
   - Text perfekt zwischen oben & Logo zentriert
   - Popup-Tastatur mit Fokus
   - Schriftgrößen 60 / 48 / 32 / 32
=========================================================== */

var $ = s => document.querySelector(s);
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

/* ===========================================================
   KUNDENLISTE
=========================================================== */
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

/* ===========================================================
   BUTTONS GENERIEREN
=========================================================== */
function initKundenButtons() {
  kundenContainer.innerHTML = "";
  kundenListe.forEach(([type, label]) => {
    var b = document.createElement('button');
    b.className = 'action';
    b.dataset.type = type;
    b.textContent = label;
    b.onclick = () => makeOutput(type);
    kundenContainer.appendChild(b);
  });
}

/* ===========================================================
   AUSGABE-HTML BAUEN
=========================================================== */
function buildOutput(type) {
  var n = numInput.value.trim();
  var k = kundeInput.value.trim();

  var z1 = n;
  var z2 = "";
  var z3 = "";
  var z4 = "";

  switch (type) {
    case 'LP': z2 = 'L&P'; break;
    case 'LPEILT': z2 = 'L&P'; z3 = 'EILT SEHR'; break;
    case 'SCHUETTE': z2 = 'Schütte'; break;
    case 'SCHUETTEEILT': z2 = 'Schütte'; z3 = 'EILT SEHR'; break;
    case 'KLEY': z2 = 'Kleymann'; break;
    case 'KLEYEILT': z2 = 'Kleymann'; z3 = 'EILT SEHR'; break;
    case 'COMTEZN8': z2 = 'Comte'; z3 = 'ZN8'; z4 = k; break;
    case 'CHEMISCH': z2 = 'Comte'; z3 = 'Chemisch Vernickeln'; z4 = k; break;
    case 'DICK': z2 = 'Comte'; z3 = 'Dickschichtpassivierung'; z4 = k; break;
    case 'BLAU': z2 = 'Comte'; z3 = 'Blau ZN8'; z4 = k; break;
    case 'PENTZ': z2 = 'Pentz & Gerdes'; z3 = 'ZN8'; z4 = k; break;
    case 'RCS': z2 = 'RCS GmbH'; z3 = 'Schweißen'; z4 = k; break;
    case 'COATINC': z2 = 'Coatinc 24 GmbH'; z3 = 'Verzinken'; z4 = k; break;
  }

  var html = "";

  html += `<div style="font-size:60pt;margin-bottom:6mm;">${z1}</div>`;
  if (z2) html += `<div style="font-size:48pt;font-weight:700;">${z2}</div>`;
  if (z3) html += `<div style="font-size:32pt;">${z3}</div>`;
  if (z4) html += `<div style="font-size:32pt;">(${z4})</div>`;

  return html;
}

/* ===========================================================
   PREVIEW AKTUALISIEREN
=========================================================== */
function makeOutput(type) {
  selectedType = type;
  out.innerHTML = buildOutput(type);

  $$('#kunden button').forEach(b => b.classList.remove('active'));
  var active = document.querySelector('[data-type="' + type + '"]');
  if (active) active.classList.add('active');
}

/* ===========================================================
   POPUP-TASTATUR
=========================================================== */
function buildKeyboard(type) {
  kbGrid.innerHTML = "";
  var chars = (type === "numbers")
    ? ['1','2','3','4','5','6','7','8','9','0']
    : 'QWERTZUIOPÜASDFGHJKLÖÄYXCVBNM'.split('');

  chars.forEach(c => {
    var b = document.createElement('button');
    b.textContent = c;
    b.style.cssText =
      "padding:10px;font-size:18px;border-radius:8px;border:1px solid #ccc;background:#f0f0f0;";
    b.onclick = () => kbInput.value += c;
    kbGrid.appendChild(b);
  });
}

function openKeyboard(field, type) {
  currentField = field;
  kbTitle.textContent = (type === "numbers")
    ? "Beistellnummer eingeben"
    : "Kundenname eingeben";

  kbInput.value = field.value || "";
  buildKeyboard(type);

  kbPopup.style.display = "flex";

  // ⭐ Fokusfix
  setTimeout(() => kbInput.focus(), 50);
}

function closeKeyboard() {
  kbPopup.style.display = "none";
}

function initKeyboard() {
  $('#btnDel').onclick = () => kbInput.value = kbInput.value.slice(0, -1);
  $('#btnClose').onclick = closeKeyboard;

  $('#btnOk').onclick = () => {
    currentField.value = kbInput.value.trim();
    if (currentField === numInput)
      openKeyboard(kundeInput, 'letters');
    else
      closeKeyboard();
  };

  numInput.onclick = () => openKeyboard(numInput, 'numbers');
  kundeInput.onclick = () => openKeyboard(kundeInput, 'letters');
}

/* ===========================================================
   VALIDIERUNG
=========================================================== */
function validate() {
  var n = numInput.value.trim();
  var k = kundeInput.value.trim();

  if (!selectedType) return alert("Bitte einen Kunden wählen!");
  if (!n) return alert("Bitte Beistellnummer eingeben!");

  var need = ['COMTEZN8','CHEMISCH','DICK','BLAU','PENTZ','RCS','COATINC'];
  if (need.includes(selectedType) && !k)
    return alert("Bitte Kundenname eingeben!");

  return true;
}

/* ===========================================================
   DRUCKEN
=========================================================== */
function initPrintButton() {
  $('#btnDrucken').onclick = () => {

    if (!validate()) return;

    out.innerHTML = buildOutput(selectedType);

    var printArea = $('#printArea');
    var popup = window.open("", "_blank", "width=1200,height=850");

    popup.document.write(`
      <html><head><title>Drucken</title>
      <style>

      @page {
        size: A5 landscape;
        margin: 0;
      }

      html, body {
        margin: 0;
        padding: 0;
        width: 210mm;
        height: 148mm;
        zoom: 1 !important;
        overflow: hidden;
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
        justify-content: space-between;
        align-items: center;
      }

      #output-content {
        text-align: center;
        font-family: Arial, Helvetica, sans-serif !important;
        font-weight: 700 !important;
        line-height: 1.1;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      #output-footer img {
        width: 35mm;
        height: auto;
        max-height: 12mm;
        object-fit: contain;
      }

      </style></head>
      <body>${printArea.outerHTML}</body></html>
    `);

    popup.document.close();
    popup.focus();

    setTimeout(() => popup.print(), 300);
    setTimeout(() => popup.close(), 600);
  };
}

/* ===========================================================
   ZURÜCK
=========================================================== */
function initBackButton() {
  $('#btnBack').onclick = () => (window.location.href = "index.html");
}

/* ===========================================================
   INIT
=========================================================== */
window.addEventListener('DOMContentLoaded', () => {
  initKundenButtons();
  initKeyboard();
  initPrintButton();
  initBackButton();
});

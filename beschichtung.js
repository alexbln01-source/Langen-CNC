// beschichtung_core.js – PC + Mobile
// Gemeinsame Logik, einfache Syntax (keine Optional-Chains)

var $  = function (s) { return document.querySelector(s); };
var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

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

// -------------------------
// Kundenliste
// -------------------------
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

// -------------------------
// Buttons erzeugen
// -------------------------
function initKundenButtons() {
  if (!kundenContainer) return;
  kundenContainer.innerHTML = '';
  kundenListe.forEach(function(entry) {
    var type  = entry[0];
    var label = entry[1];
    var b = document.createElement('button');
    b.className   = 'action';
    b.dataset.type = type;
    b.textContent = label;
    b.onclick = function () { makeOutput(type); };
    kundenContainer.appendChild(b);
  });
}

// -------------------------
// Ausgabe HTML bauen
// -------------------------
function buildOutput(type) {
  var n = numInput ? numInput.value.trim() : '';
  var k = kundeInput ? kundeInput.value.trim() : '';

  var z1 = n;   // Beistellnummer
  var z2 = '';  // Hauptkunde
  var z3 = '';  // Zusatz
  var z4 = '';  // Kundenname

  switch (type) {
    case 'LP':           z2 = 'L&P'; break;
    case 'LPEILT':       z2 = 'L&P'; z3 = 'EILT SEHR'; break;

    case 'SCHUETTE':     z2 = 'Schütte'; break;
    case 'SCHUETTEEILT': z2 = 'Schütte'; z3 = 'EILT SEHR'; break;

    case 'KLEY':         z2 = 'Kleymann'; break;
    case 'KLEYEILT':     z2 = 'Kleymann'; z3 = 'EILT SEHR'; break;

    case 'COMTEZN8':     z2 = 'Comte'; z3 = 'ZN8'; z4 = k; break;
    case 'CHEMISCH':     z2 = 'Comte'; z3 = 'Chemisch Vernickeln'; z4 = k; break;
    case 'DICK':         z2 = 'Comte'; z3 = 'Dickschichtpassivierung'; z4 = k; break;
    case 'BLAU':         z2 = 'Comte'; z3 = 'Blau ZN8'; z4 = k; break;

    case 'PENTZ':        z2 = 'Pentz & Gerdes'; z3 = 'ZN8'; z4 = k; break;
    case 'RCS':          z2 = 'RCS GmbH';       z3 = 'Schweißen'; z4 = k; break;
    case 'COATINC':      z2 = 'Coatinc 24 GmbH';z3 = 'Verzinken'; z4 = k; break;
  }

  var html = '';
  // Beistellnummer 60pt
  html += '<div style="font-size:60pt;margin-bottom:6mm;">' + z1 + '</div>';
  // Hauptkunde 48pt
  if (z2) html += '<div style="font-size:48pt;font-weight:900;">' + z2 + '</div>';
  // Zusatz 32pt
  if (z3) html += '<div style="font-size:32pt;">' + z3 + '</div>';
  // Kundenname 32pt in Klammern
  if (z4) html += '<div style="font-size:32pt;">(' + z4 + ')</div>';

  return html;
}

// -------------------------
// Preview aktualisieren
// -------------------------
function makeOutput(type) {
  selectedType = type;
  if (!out) return;

  out.innerHTML = buildOutput(type);

  // Buttons optisch markieren
  $$('#kunden button').forEach(function (b) {
    b.classList.remove('active');
  });
  var active = document.querySelector('[data-type="' + type + '"]');
  if (active) active.classList.add('active');
}

// -------------------------
// Mobile Touch-Zoom verhindern (optional)
// -------------------------
document.addEventListener('touchend', function (e) {
  // einfach übernehmen, schadet auf PC nicht
  // (kein doppel-zoom erlauben)
}, { passive: false });

// -------------------------
// Popup-Tastatur
// -------------------------
function buildKeyboard(type) {
  if (!kbGrid) return;
  kbGrid.innerHTML = '';

  var chars = (type === 'numbers')
    ? ['1','2','3','4','5','6','7','8','9','0']
    : 'QWERTZUIOPÜASDFGHJKLÖÄYXCVBNM'.split('');

  var i;
  for (i = 0; i < chars.length; i++) {
    var c = chars[i];
    var b = document.createElement('button');
    b.textContent = c;
    b.style.cssText = 'padding:10px;font-size:18px;border-radius:8px;border:1px solid #ccc;background:#f0f0f0;';
    b.onclick = (function (ch) {
      return function () { kbInput.value += ch; };
    })(c);
    kbGrid.appendChild(b);
  }
}

function openKeyboard(field, type) {
  currentField = field;
  if (kbTitle) kbTitle.textContent = (type === 'numbers') ? 'Beistellnummer eingeben' : 'Kundenname eingeben';
  if (kbInput) kbInput.value = field.value || '';
  buildKeyboard(type);
  if (kbPopup) kbPopup.style.display = 'flex';
}

function closeKeyboard() {
  if (kbPopup) kbPopup.style.display = 'none';
}

function initKeyboard() {
  if (!kbInput) return;

  var btnDel   = $('#btnDel');
  var btnClose = $('#btnClose');
  var btnOk    = $('#btnOk');

  if (btnDel)   btnDel.onclick   = function () { kbInput.value = kbInput.value.slice(0, -1); };
  if (btnClose) btnClose.onclick = closeKeyboard;
  if (btnOk)    btnOk.onclick    = function () {
    if (!currentField) return;
    currentField.value = kbInput.value.trim();
    if (currentField === numInput) openKeyboard(kundeInput, 'letters');
    else closeKeyboard();
  };

  if (numInput)   numInput.onclick   = function () { openKeyboard(numInput, 'numbers'); };
  if (kundeInput) kundeInput.onclick = function () { openKeyboard(kundeInput, 'letters'); };

  kbInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (btnOk) btnOk.click();
    }
  });
}

// -------------------------
// Validierung
// -------------------------
function validate() {
  if (!numInput || !kundeInput) return false;

  var n = numInput.value.trim();
  var k = kundeInput.value.trim();

  if (!selectedType) { alert('Bitte einen Kunden wählen.'); return false; }
  if (!n) { alert('Bitte Beistellnummer eingeben.'); return false; }

  var need = ['COMTEZN8','CHEMISCH','DICK','BLAU','PENTZ','RCS','COATINC'];
  if (need.indexOf(selectedType) !== -1 && !k) {
    alert('Bitte Kundenname eingeben.');
    return false;
  }
  return true;
}

// -------------------------
// Drucken
// -------------------------
function initPrintButton() {
  const btn = $('#btnDrucken');
  if (!btn) return;

  btn.onclick = () => {
    if (!validate()) return;

    if (out) out.innerHTML = buildOutput(selectedType);

    const printArea = $('#printArea');
    if (!printArea) return;

    const popup = window.open("", "_blank", "width=1200,height=850");

    popup.document.write(`
      <html>
      <head><title>Drucken</title>
      <style>

        /* --- DRUCKGENAUIGKEIT SICHERSTELLEN --- */
        @page { 
          size: A5 landscape; 
          margin: 0;
        }

        html, body {
          margin: 0;
          padding: 0;
          width: 210mm !important;
          height: 148mm !important;
          zoom: 1 !important;               /* verhindert Chrome-Auto-Skalierung */
          overflow: hidden !important;      /* verhindert Umbruch auf 2. Seite */
          background: white;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* --- DRUCKBEREICH EXACT DEFINIEREN --- */
        #printArea {
          width: 210mm !important;
          height: 148mm !important;
          overflow: hidden !important;
          position: relative;

          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        #output-content {
          text-align: center;
          font-weight: 900;
          line-height: 1.2;
        }

        #output-footer {
          position: absolute;
          bottom: 6mm;
          right: 8mm;
        }

        #output-footer img {
          width: 4.3cm;
          height: 1.6cm;
          object-fit: contain;
        }

      </style>
      </head>

      <body>
        ${printArea.outerHTML}
      </body>
      </html>
    `);

    popup.document.close();
    popup.focus();

    setTimeout(() => {
      popup.print();
      popup.close();
    }, 400);
  };
}

// -------------------------
// Zurück-Button
// -------------------------
function initBackButton() {
  var back = $('#btnBack');
  if (!back) return;
  back.onclick = function () {
    window.location.href = 'index.html';
  };
}

// -------------------------
// Init nach Laden
// -------------------------
window.addEventListener('DOMContentLoaded', function () {
  initKundenButtons();
  initKeyboard();
  initPrintButton();
  initBackButton();
});

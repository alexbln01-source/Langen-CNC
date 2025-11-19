// =========================
// DOM-Referenzen
// =========================
const out           = document.getElementById('output-content');
const numInput      = document.getElementById('numInput');
const kundeInput    = document.getElementById('kundeInput');
const kundenDiv     = document.getElementById('kunden');

const kbPopup       = document.getElementById('keyboardPopup');
const kbBox         = document.getElementById('keyboardBox');
const kbTitle       = document.getElementById('keyboardTitle');
const kbInput       = document.getElementById('keyboardInput');
const kbGrid        = document.getElementById('keyboardGrid');
const btnDel        = document.getElementById('btnDel');
const btnOk         = document.getElementById('btnOk');
const btnClose      = document.getElementById('btnClose');

let currentField = null;
let selectedType = null;

// =========================
// Kundenliste
// =========================
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

// Buttons existieren schon im HTML – keine Autoerzeugung nötig

// =========================
// Ausgabe HTML bauen
// =========================
function buildOutput(type) {
  const n = numInput.value.trim();
  const k = kundeInput.value.trim();

  let z1 = n;
  let z2 = "";
  let z3 = "";
  let z4 = "";

  switch (type) {
    case 'LP':          z2 = 'L&P'; break;
    case 'LPEILT':      z2 = 'L&P'; z3 = 'EILT SEHR'; break;

    case 'SCHUETTE':    z2 = 'Schütte'; break;
    case 'SCHUETTEEILT':z2 = 'Schütte'; z3 = 'EILT SEHR'; break;

    case 'KLEY':        z2 = 'Kleymann'; break;
    case 'KLEYEILT':    z2 = 'Kleymann'; z3 = 'EILT SEHR'; break;

    case 'COMTEZN8':    z2 = 'Comte'; z3 = '„ZN8“'; z4 = k; break;
    case 'CHEMISCH':    z2 = 'Comte'; z3 = '„Chemisch Vernickeln“'; z4 = k; break;
    case 'DICK':        z2 = 'Comte'; z3 = '„Dickschichtpassivierung“'; z4 = k; break;
    case 'BLAU':        z2 = 'Comte'; z3 = '„Blau ZN8“'; z4 = k; break;

    case 'PENTZ':       z2 = 'Pentz & Gerdes'; z3 = '„ZN8“'; z4 = k; break;
    case 'RCS':         z2 = 'RCS'; z3 = '„Schweißen“'; z4 = k; break;
    case 'COATINC':     z2 = 'Coatinc 24'; z3 = '„Verzinken“'; z4 = k; break;
  }

  let html = "";
  html += `<div style="font-size:60pt;margin-bottom:6mm;">${z1}</div>`;
  if (z2) html += `<div style="font-size:60pt;font-weight:900;">${z2}</div>`;

  // 🔥 Nur EILT SEHR groß (60pt)
  if (z3){
    if (z3.includes('EILT SEHR')) {
      html += `<div style="font-size:60pt;font-weight:900;">„EILT SEHR“</div>`;
    } else {
      html += `<div style="font-size:32pt;">${z3}</div>`;
    }
  }

  if (z4) html += `<div style="font-size:32pt;">(${z4})</div>`;

  return html;
}
// =========================
// Vorschau aktualisieren
// =========================
function makeOutput(type) {
  selectedType = type;
  if (!numInput.value.trim()) {
    alert('Bitte Beistellnummer eingeben');
    return;
  }

  out.innerHTML = buildOutput(type);

  // aktive Buttonfarbe
  document.querySelectorAll('#kunden .action').forEach(b => b.classList.remove('active'));
  const active = document.querySelector(`#kunden .action[data-type="${type}"]`);
  if (active) active.classList.add('active');
}

// Events für Kundenbuttons
document.querySelectorAll('#kunden .action').forEach(btn => {
  btn.addEventListener('click', () => makeOutput(btn.dataset.type));
});

// =========================
// Popup-Tastatur
// =========================
function buildKeyboard(type) {
  kbGrid.innerHTML = "";
  const chars = (type === 'numbers')
    ? ['1','2','3','4','5','6','7','8','9','0']
    : 'QWERTZUIOPÜASDFGHJKLÖÄYXCVBNM'.split('');

  chars.forEach(ch => {
    const b = document.createElement('button');
    b.textContent = ch;
    b.className = 'kb-key';
    b.addEventListener('click', () => kbInput.value += ch);
    kbGrid.appendChild(b);
  });
}

function openKeyboard(field, type) {
  currentField = field;
  kbTitle.textContent = (type === 'numbers')
    ? 'Beistellnummer eingeben'
    : 'Kundenname eingeben';

  kbInput.value = field.value || '';
  kbInput.dataset.type = type;

  buildKeyboard(type);

  kbPopup.style.display = 'flex';
  setTimeout(() => kbInput.focus(), 50);
}

function closeKeyboard() {
  kbPopup.style.display = 'none';
  currentField = null;
}

// Aktionen unten
btnDel.addEventListener('click', () => {
  kbInput.value = kbInput.value.slice(0, -1);
});

btnClose.addEventListener('click', () => {
  closeKeyboard();
});

btnOk.addEventListener('click', () => {
  if (!currentField) return;
  currentField.value = kbInput.value.trim();

  if (currentField === numInput) {
    // nach Nummer direkt zum Kunden springen
    openKeyboard(kundeInput, 'letters');
  } else {
    closeKeyboard();
  }
});

// Enter-Taste bei Hardware-Tastatur
kbInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    btnOk.click();
  }
});

// Klick auf Eingabefelder öffnet Tastatur
numInput.addEventListener('click', () => openKeyboard(numInput, 'numbers'));
kundeInput.addEventListener('click', () => openKeyboard(kundeInput, 'letters'));

// =========================
// Validierung
// =========================
function validate() {
  const n = numInput.value.trim();
  const k = kundeInput.value.trim();

  if (!selectedType) { alert('Bitte einen Kunden wählen.'); return false; }
  if (!n) { alert('Bitte Beistellnummer eingeben.'); return false; }

  const needName = ['COMTEZN8','CHEMISCH','DICK','BLAU','PENTZ','RCS','COATINC'];
  if (needName.includes(selectedType) && !k) {
    alert('Bitte Kundenname eingeben.');
    return false;
  }
  return true;
}

// =========================
// Drucken – 1 Seite A5 quer
// =========================
document.getElementById('btnDrucken').addEventListener('click', () => {
  if (!validate()) return;

  out.innerHTML = buildOutput(selectedType);
  const printArea = document.getElementById('printArea');

  const popup = window.open('', '_blank', 'width=1200,height=850');

  popup.document.write(`
    <html>
    <head>
      <title>Drucken</title>
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
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #ffffff;
          font-family: Arial, sans-serif;
        }
        #printArea {
          width: 210mm;
          height: 148mm;
          box-sizing: border-box;
          padding: 8mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
          overflow: hidden;
        }
        #output-content {
          text-align: center;
          font-weight: 700;
          line-height: 1.2;
          font-family: Arial, sans-serif;
        }
        #output-footer {
          position: absolute;
          right: 8mm;
          bottom: 6mm;
        }
        #output-footer img {
          width: 40mm;
          max-height: 15mm;
          height: auto;
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
    popup.close();   // 🔥 **NEU: Vorschau schließt sich automatisch**
  }, 300);
});

// =========================
// Zurück-Button
// =========================
document.getElementById('btnBack').addEventListener('click', () => {
  window.location.href = 'index.html';
});
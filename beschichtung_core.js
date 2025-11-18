// beschichtung_core.js – PC + Mobile komplett integriert
// ======================================================
// Gemeinsame Logik für beide Versionen (Option A)
// Schriftgrößen zeilenweise: 36 / 48 / 32 / 32
// Kundenname in Klammern
// Mobile-Tastatur + Touch-Fixes integriert

// =========================
// Helper
// =========================
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

// =========================
// DOM-Referenzen
// =========================
const out = $('#output-content');
const kundenContainer = $('#kunden');
let selectedType = null;

// Eingabefelder (PC & Mobile)
const numInput = $('#numInput');
const kundeInput = $('#kundeInput');

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

// =========================
// Buttons automatisch erzeugen
// =========================
if (kundenContainer) {
  kundenListe.forEach(([type, label]) => {
    const b = document.createElement('button');
    b.className = 'action';
    b.dataset.type = type;
    b.textContent = label;
    b.onclick = () => makeOutput(type);
    kundenContainer.appendChild(b);
  });
}

// =========================
// Ausgabe HTML generieren (Zeilenweise)
// =========================
function buildOutput(type) {
  const n = numInput?.value.trim() || '';
  const k = kundeInput?.value.trim() || '';

  let z1 = n;
  let z2 = '';
  let z3 = '';
  let z4 = '';

  switch(type) {
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

  let html = '';
  html += `<div style="font-size:60pt;margin-bottom:6mm;">${z1}</div>`;
  if (z2) html += `<div style="font-size:48pt;font-weight:900;">${z2}</div>`;
  if (z3) html += `<div style="font-size:32pt;">${z3}</div>`;
  if (z4) html += `<div style="font-size:32pt;">(${z4})</div>`;

  return html;
}

// =========================
// Vorschau aktualisieren
// =========================
function makeOutput(type) {
  selectedType = type;

  $$('#kunden button').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-type="${type}"]`)?.classList.add('active');

  if (out) out.innerHTML = buildOutput(type);
}

// =========================
// Mobile Touch-Zoom verhindern
// =========================
let lastTouchEnd = 0;
document.addEventListener('touchend', e => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) e.preventDefault();
  lastTouchEnd = now;
}, { passive:false });

document.addEventListener('touchmove', e => {
  if (e.touches.length > 1) e.preventDefault();
}, { passive:false });

// =========================
// Mobile Popup Tastatur
// =========================
const kbPopup = $('#keyboardPopup');
const kbInput = $('#keyboardInput');
const kbGrid  = $('#keyboardGrid');
let currentField = null;

function buildKeyboard(type) {
  if (!kbGrid) return;

  kbGrid.innerHTML = '';
  const chars = (type === 'numbers')
    ? ['1','2','3','4','5','6','7','8','9','0']
    : 'QWERTZUIOPÜASDFGHJKLÖÄYXCVBNM'.split('');

  const cols = (type === 'numbers') ? 5 : 10;
  kbGrid.style.gridTemplateColumns = `repeat(${cols},1fr)`;

  chars.forEach(c => {
    const b = document.createElement('button');
    b.textContent = c;
    b.onclick = () => kbInput.value += c;
    kbGrid.appendChild(b);
  });
}

function openKeyboard(field, type) {
  currentField = field;
  kbInput.value = field.value || '';
  buildKeyboard(type);
  if (kbPopup) kbPopup.style.display = 'flex';
}
function closeKeyboard() {
  if (kbPopup) kbPopup.style.display = 'none';
}

$('#btnDel')?.addEventListener('click', () => kbInput.value = kbInput.value.slice(0,-1));
$('#btnClose')?.addEventListener('click', closeKeyboard);
$('#btnOk')?.addEventListener('click', () => {
  if (!currentField) return;
  currentField.value = kbInput.value.trim();
  if (currentField === numInput) openKeyboard(kundeInput, 'letters');
  else closeKeyboard();
});

numInput?.addEventListener('click', () => openKeyboard(numInput, 'numbers'));
kundeInput?.addEventListener('click', () => openKeyboard(kundeInput, 'letters'));

kbInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    $('#btnOk').click();
  }
});

// =========================
// Validierung (PC + Mobile)
// =========================
function validate() {
  const n = numInput?.value.trim();
  const k = kundeInput?.value.trim();

  if (!selectedType) { alert('Bitte einen Kunden wählen.'); return false; }
  if (!n) { alert('Bitte Beistellnummer eingeben.'); return false; }

  const need = ['COMTEZN8','CHEMISCH','DICK','BLAU','PENTZ','RCS','COATINC'];
  if (need.includes(selectedType) && !k) {
    alert('Bitte Kundenname eingeben.');
    return false;
  }
  return true;
}

// =========================
// Druckfunktion (PC + Mobile)
// =========================
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
      <html><head><title>Drucken</title>
      <style>
        @page { size:A5 landscape; margin:0; } html, body { zoom:1 !important; }
        html,body{width:210mm;height:148mm;margin:0;padding:0;
          display:flex;justify-content:center;align-items:center;}
        #printArea{width:100%;height:100%;position:relative;display:flex;
          flex-direction:column;justify-content:center;align-items:center;}
        #output-content{text-align:center;font-weight:900;}
        #output

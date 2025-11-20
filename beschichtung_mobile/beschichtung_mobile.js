// ============================
// beschichtung_mobile.js – MOBILE VERSION (ohne Vorschau)
// ============================

var $  = s => document.querySelector(s);
var $$ = s => Array.from(document.querySelectorAll(s));

// DOM-Referenzen
var out            = $('#output-content');
var numInput       = $('#numInput');
var kundeInput     = $('#kundeInput');
var kundenContainer = $('#kunden');

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
// Ausgabe generieren (A5 Drucklayout)
// ===============================
function buildOutput(type) {
  var n = numInput.value.trim();
  var k = kundeInput.value.trim();

  var z1 = n, z2 = "", z3 = "", z4 = "";

  switch (type) {
    case 'LP':            z2 = 'L&P'; break;
    case 'LPEILT':        z2 = 'L&P'; z3 = 'EILT SEHR'; break;

    case 'SCHUETTE':      z2 = 'Schütte'; break;
    case 'SCHUETTEEILT':  z2 = 'Schütte'; z3 = 'EILT SEHR'; break;

    case 'KLEY':          z2 = 'Kleymann'; break;
    case 'KLEYEILT':      z2 = 'Kleymann'; z3 = 'EILT SEHR'; break;

    case 'COMTEZN8':      z2 = 'Comte'; z3 = '„ZN8“'; z4 = k; break;
    case 'CHEMISCH':      z2 = 'Comte'; z3 = '„Chemisch Vernickeln“'; z4 = k; break;
    case 'DICK':          z2 = 'Comte'; z3 = '„Dickschichtpassivierung“'; z4 = k; break;
    case 'BLAU':          z2 = 'Comte'; z3 = '„Blau ZN8“'; z4 = k; break;

    case 'PENTZ':         z2 = 'Pentz & Gerdes'; z3 = '„ZN8“'; z4 = k; break;
    case 'RCS':           z2 = 'RCS GmbH'; z3 = '„Schweißen“'; z4 = k; break;
    case 'COATINC':       z2 = 'Coatinc 24 GmbH'; z3 = '„Verzinken“'; z4 = k; break;
  }

  var html = '';
  html += '<div style="font-size:60pt;margin-bottom:6mm;">' + z1 + '</div>';
  if (z2) html += '<div style="font-size:60pt;font-weight:900;">' + z2 + '</div>';
  if (z3) html += '<div style="font-size:32pt;">' + z3 + '</div>';
  if (z4) html += '<div style="font-size:32pt;">(' + z4 + ')</div>';

  return html;
}


// ===============================
// Vorschau aktualisieren (rechte Seite)
// ===============================
function makeOutput(type) {
  selectedType = type;

  if (!numInput.value.trim()) {
    alert("Bitte Beistellnummer eingeben.");
    return;
  }

  out.innerHTML = buildOutput(type);

  $$('#kunden button').forEach(b => b.classList.remove('active'));
  var btn = document.querySelector('#kunden button[data-type="' + type + '"]');
  if (btn) btn.classList.add('active');
}

$$('#kunden button').forEach(btn => {
  btn.addEventListener('click', () => makeOutput(btn.dataset.type));
});


// ===============================
// Popup-Tastatur (bunte Tasten)
// ===============================
function buildKeyboard(type) {
  kbGrid.innerHTML = '';

  var chars = (type === 'numbers')
    ? ['1','2','3','4','5','6','7','8','9','0']
    : 'QWERTZUIOPÜASDFGHJKLÖÄYXCVBNM'.split('');

  chars.forEach(c => {
    var b = document.createElement('button');
    b.textContent = c;
    b.className = 'kb-key';
    b.addEventListener('click', () => kbInput.value += c);
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

$('#btnDel').onclick = () => {
  kbInput.value = kbInput.value.slice(0, -1);
};

$('#btnClose').onclick = () => {
  closeKeyboard();
};

$('#btnOk').onclick = () => {
  if (!currentField) return;
  currentField.value = kbInput.value.trim();

  if (currentField === numInput) {
    openKeyboard(kundeInput, 'letters');
  } else {
    closeKeyboard();
  }
};

// ENTER auf externer Tastatur
kbInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    $('#btnOk').click();
  }
});

// Eingabefelder öffnen Tastatur
numInput.onclick   = () => openKeyboard(numInput, 'numbers');
kundeInput.onclick = () => openKeyboard(kundeInput, 'letters');


// ===============================
// Validierung
// ===============================
function validate() {
  var n = numInput.value.trim();
  var k = kundeInput.value.trim();

  if (!selectedType) { alert('Bitte einen Kunden wählen.'); return false; }
  if (!n) { alert('Bitte Beistellnummer eingeben.'); return false; }

  var need = ['COMTEZN8','CHEMISCH','DICK','BLAU','PENTZ','RCS','COATINC'];
  if (need.includes(selectedType) && !k) {
    alert('Bitte Kundenname eingeben.');
    return false;
  }
  return true;
}


// ===============================
// DRUCKEN – direkt Systemdruck
// ===============================
function initPrintButton() {
  $('#btnDrucken').onclick = () => {

    if (!validate()) return;

    out.innerHTML = buildOutput(selectedType);

    window.print(); // System-Vorschau übernimmt alles
  };
}


// ===============================
// Zurück – eine Ebene hoch
// ===============================
function initBackButton() {
  $('#btnBack').onclick = () => {
    window.location.href = '../index.html';  // IMMER eine Ebene hoch
  };
}


// ===============================
// INIT
// ===============================
window.addEventListener('DOMContentLoaded', () => {
  initPrintButton();
  initBackButton();
});

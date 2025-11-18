// ======================================================
// beschichtung_core.js – FINAL VERSION 2025
// PC + MOBILE kompatibel
// Zentrierung & Druck 100% korrigiert
// ======================================================

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

// ==========================
// Kundenliste
// ==========================
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

// ==========================
// Buttons erzeugen
// ==========================
function initKundenButtons() {
  kundenContainer.innerHTML = '';
  kundenListe.forEach(function(entry) {
    var b = document.createElement('button');
    b.className   = 'action';
    b.dataset.type = entry[0];
    b.textContent = entry[1];
    b.onclick = function () { makeOutput(entry[0]); };
    kundenContainer.appendChild(b);
  });
}

// ==========================
// Ausgabe generieren
// ==========================
function buildOutput(type) {

  var n = numInput.value.trim();
  var k = kundeInput.value.trim();

  var z2='',z3='',z4='';

  switch (type) {
    case 'LP': z2='L&P'; break;
    case 'LPEILT': z2='L&P'; z3='EILT SEHR'; break;

    case 'SCHUETTE': z2='Schütte'; break;
    case 'SCHUETTEEILT': z2='Schütte'; z3='EILT SEHR'; break;

    case 'KLEY': z2='Kleymann'; break;
    case 'KLEYEILT': z2='Kleymann'; z3='EILT SEHR'; break;

    case 'COMTEZN8': z2='Comte'; z3='ZN8'; z4=k; break;
    case 'CHEMISCH': z2='Comte'; z3='Chemisch Vernickeln'; z4=k; break;
    case 'DICK': z2='Comte'; z3='Dickschichtpassivierung'; z4=k; break;
    case 'BLAU': z2='Comte'; z3='Blau ZN8'; z4=k; break;

    case 'PENTZ': z2='Pentz & Gerdes'; z3='ZN8'; z4=k; break;

    case 'RCS': z2='RCS GmbH'; z3='Schweißen'; z4=k; break;
    case 'COATINC': z2='Coatinc 24 GmbH'; z3='Verzinken'; z4=k; break;
  }

  var html = '';

  html += '<div style="font-size:60pt;margin-bottom:6mm;font-family:Arial; font-weight:700;">'+n+'</div>';
  if (z2) html += '<div style="font-size:48pt;font-weight:900;font-family:Arial;">'+z2+'</div>';
  if (z3) html += '<div style="font-size:32pt;font-family:Arial;">„'+z3+'“</div>';
  if (z4) html += '<div style="font-size:32pt;font-family:Arial;">('+z4+')</div>';

  return html;
}

// ==========================
// Vorschau anzeigen
// ==========================
function makeOutput(type) {
  selectedType = type;

  out.innerHTML = buildOutput(type);

  $$('#kunden button').forEach(b => b.classList.remove('active'));
  var active = document.querySelector('[data-type="'+type+'"]');
  if (active) active.classList.add('active');
}

// ==========================
// Tastatur
// ==========================
function buildKeyboard(type) {
  kbGrid.innerHTML = '';

  var chars = (type==='numbers') ?
    ['1','2','3','4','5','6','7','8','9','0'] :
    'QWERTZUIOPÜASDFGHJKLÖÄYXCVBNM'.split('');

  chars.forEach(function(c){
    var b=document.createElement('button');
    b.textContent=c;
    b.style.cssText='padding:10px;font-size:20px;border-radius:8px;border:1px solid #ccc;background:#f0f0f0;';
    b.onclick=function(){ kbInput.value+=c; };
    kbGrid.appendChild(b);
  });
}

function openKeyboard(field,type){
  currentField = field;
  kbTitle.textContent = (type==='numbers') ? 'Beistellnummer eingeben' : 'Kundenname eingeben';
  kbInput.value = field.value;

  buildKeyboard(type);
  kbPopup.style.display='flex';

  setTimeout(()=>kbInput.focus(),50);   // ⭐ Cursor-Fix
}

function closeKeyboard(){ kbPopup.style.display='none'; }

function initKeyboard(){
  $('#btnDel').onclick = ()=> kbInput.value = kbInput.value.slice(0,-1);
  $('#btnClose').onclick = closeKeyboard;
  $('#btnOk').onclick = ()=>{
    currentField.value = kbInput.value.trim();
    if (currentField===numInput) openKeyboard(kundeInput,'letters');
    else closeKeyboard();
  };

  numInput.onclick = ()=> openKeyboard(numInput,'numbers');
  kundeInput.onclick = ()=> openKeyboard(kundeInput,'letters');
}

// ==========================
// Validierung
// ==========================
function validate() {
  var need = ['COMTEZN8','CHEMISCH','DICK','BLAU','PENTZ','RCS','COATINC'];

  if (!selectedType) { alert("Bitte einen Kunden wählen."); return false; }
  if (!numInput.value.trim()) { alert("Bitte Beistellnummer eingeben."); return false; }
  if (need.includes(selectedType) && !kundeInput.value.trim()) { alert("Bitte Kundenname eingeben."); return false; }

  return true;
}

// ==========================
// DRUCKEN (1 Seite garantiert!)
// ==========================
function initPrintButton() {

  $('#btnDrucken').onclick = ()=>{

    if (!validate()) return;

    out.innerHTML = buildOutput(selectedType);

    var html = `
      <html>
      <head><title>Druck</title>
      <style>

        @page { size:A5 landscape; margin:0; }

        html, body {
          margin:0;
          padding:0;
          width:210mm;
          height:148mm;
          overflow:hidden;
          background:white;
          font-family:Arial, Helvetica, sans-serif;
          display:flex;
          justify-content:center;
          align-items:center;
        }

        #printArea {
          width:210mm;
          height:148mm;
          padding:10mm;
          box-sizing:border-box;

          display:flex;
          flex-direction:column;
        }

        #output-content {
          flex:1;
          display:flex;
          flex-direction:column;
          justify-content:center;
          align-items:center;
          text-align:center;
          font-weight:700;
        }

        #output-footer {
          margin-top:auto;
        }

        #output-footer img {
          width:35mm;
          max-height:12mm;
          object-fit:contain;
        }

      </style>
      </head>

      <body>
        ${$('#printArea').outerHTML}
      </body>
      </html>
    `;

    var w = window.open("", "_blank", "width=1200,height=850");
    w.document.write(html);
    w.document.close();

    setTimeout(()=>{ w.print(); w.close(); },400);
  };
}

// ==========================
// Zurück
// ==========================
function initBackButton(){
  $('#btnBack').onclick = ()=> window.location.href='index.html';
}

// ==========================
// INIT
// ==========================
window.onload = function () {
  initKundenButtons();
  initKeyboard();
  initPrintButton();
  initBackButton();
};

// ========================================
// Beschichtung Mobile – 5-Zoll optimiert
// ========================================

// --- Hilfsfunktionen
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

const numInput   = $('#numInput');
const kundeInput = $('#kundeInput');
const out        = $('#output-content');
const preview    = $('#previewPopup');
let currentField = null;
let selectedType = null;

// --- Kundenliste
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

// --- Kundenbuttons füllen
const kundenDiv = $('#kunden');
kundenListe.forEach(([type, label]) => {
  const b = document.createElement('button');
  b.textContent = label;
  b.dataset.type = type;
  b.onclick = () => chooseCustomer(type);
  kundenDiv.appendChild(b);
});

// --- Anti-Zoom auf Touch-Geräten
let lastTouchEnd = 0;
document.addEventListener('touchend', e=>{
  const now = Date.now();
  if(now - lastTouchEnd <= 300) e.preventDefault();
  lastTouchEnd = now;
},{passive:false});
document.addEventListener('touchmove', e=>{
  if(e.touches.length>1) e.preventDefault();
},{passive:false});

// --- Popup-Tastatur
const kbPopup = $('#keyboardPopup');
const kbInput = $('#keyboardInput');
const kbGrid  = $('#keyboardGrid');

function buildKeyboard(type){
  kbGrid.innerHTML = '';
  const chars = (type==='numbers')
    ? ['1','2','3','4','5','6','7','8','9','0']
    : 'QWERTZUIOPÜASDFGHJKLÖÄYXCVBNM'.split('');
  const cols  = (type==='numbers')?5:10;
  kbGrid.style.gridTemplateColumns = `repeat(${cols},1fr)`;
  chars.forEach(c=>{
    const b = document.createElement('button');
    b.textContent = c;
    b.onclick = ()=> kbInput.value += c;
    kbGrid.appendChild(b);
  });
}
function openKeyboard(field,type){
  currentField = field;
  kbInput.value = field.value || '';
  buildKeyboard(type);
  kbPopup.style.display='flex';
}
function closeKeyboard(){ kbPopup.style.display='none'; }
$('#btnDel').onclick   = ()=> kbInput.value = kbInput.value.slice(0,-1);
$('#btnClose').onclick = closeKeyboard;
$('#btnOk').onclick    = ()=>{
  if(!currentField) return;
  currentField.value = kbInput.value.trim();
  if(currentField===numInput) openKeyboard(kundeInput,'letters');
  else closeKeyboard();
};
numInput.onclick   = ()=> openKeyboard(numInput,'numbers');
kundeInput.onclick = ()=> openKeyboard(kundeInput,'letters');
kbInput.addEventListener('keydown',e=>{
  if(e.key==='Enter'){
    e.preventDefault();
    $('#btnOk').click();
  }
});

// --- Vorschau-Anzeige
function makeOutputHTML(type){
  const n = numInput.value.trim();
  const k = kundeInput.value.trim();
  let html = `<div style="font-size:36pt;margin-bottom:6mm;">${n}</div>`;
  const add=(main,sub='',name='')=>{
    html += `<div style="font-size:48pt;font-weight:900;">${main}</div>`;
    if(sub)  html += `<div style="font-size:32pt;">„${sub}“</div>`;
    if(name) html += `<div style="font-size:32pt;">(${name})</div>`;
  };
  switch(type){
    case'LP':add('L&P');break;
    case'LPEILT':add('L&P','EILT SEHR');break;
    case'SCHUETTE':add('Schütte');break;
    case'SCHUETTEEILT':add('Schütte','EILT SEHR');break;
    case'KLEY':add('Kleymann');break;
    case'KLEYEILT':add('Kleymann','EILT SEHR');break;
    case'COMTEZN8':add('Comte','ZN8',k);break;
    case'CHEMISCH':add('Comte','Chemisch Vernickeln',k);break;
    case'DICK':add('Comte','Dickschichtpassivierung',k);break;
    case'BLAU':add('Comte','Blau ZN8',k);break;
    case'PENTZ':add('Pentz & Gerdes','ZN8',k);break;
    case'RCS':add('RCS GmbH','Schweißen',k);break;
    case'COATINC':add('Coatinc 24 GmbH','Verzinken',k);break;
  }
  return html;
}

function chooseCustomer(type){
  selectedType = type;
  $$('#kunden button').forEach(b=>b.classList.remove('active'));
  document.querySelector(`[data-type="${type}"]`).classList.add('active');
  out.innerHTML = makeOutputHTML(type);
}

function validate(){
  const n = numInput.value.trim();
  const k = kundeInput.value.trim();
  if(!selectedType){alert('Bitte einen Kunden wählen.');return false;}
  if(!n){alert('Bitte Beistellnummer eingeben.');return false;}
  const need = ['COMTEZN8','CHEMISCH','DICK','BLAU','PENTZ','RCS','COATINC'];
  if(need.includes(selectedType) && !k){alert('Bitte Kundenname eingeben.');return false;}
  return true;
}

// --- Vorschau + Drucken
$('#btnDrucken').onclick=()=>{
  if(!validate())return;
  out.innerHTML = makeOutputHTML(selectedType);
  preview.style.display='flex';
};
$('#btnCancelPreview').onclick=()=> preview.style.display='none';
$('#btnPrintNow').onclick=()=>{
  const html = `
  <html><head><title>Drucken</title>
  <style>
  @page { size:A5 landscape; margin:0; }
  html,body{width:210mm;height:148mm;margin:0;padding:0;
  display:flex;justify-content:center;align-items:center;}
  #output-content{text-align:center;font-weight:900;}
  #output-footer{position:absolute;bottom:6mm;right:8mm;}
  </style></head>
  <body>
  <div id="printArea" style="width:100%;height:100%;display:flex;justify-content:center;align-items:center;position:relative;">
    ${$('#printArea').innerHTML}
  </div>
  </body></html>`;
  const w = window.open('', '_blank', 'width=900,height=600');
  w.document.write(html);
  w.document.close();
  setTimeout(()=>{w.print();w.close();},400);
  preview.style.display='none';
};

// --- Zurück-Button
$('#btnBack').onclick=()=> window.location.href='index.html';

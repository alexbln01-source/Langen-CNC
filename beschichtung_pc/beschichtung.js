// =========================
// DOM-Referenzen
// =========================
const out           = document.getElementById('output-content');
const numInput      = document.getElementById('numInput');
const kundeInput    = document.getElementById('kundeInput');

const kbPopup       = document.getElementById('keyboardPopup');
const kbTitle       = document.getElementById('keyboardTitle');
const kbInput       = document.getElementById('keyboardInput');
const kbGrid        = document.getElementById('keyboardGrid');

const btnDel        = document.getElementById('btnDel');
const btnOk         = document.getElementById('btnOk');
const btnClose      = document.getElementById('btnClose');

let currentField = null;
let selectedType = null;

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

  if (z3){
    if (z3.includes("EILT SEHR")) {
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
    alert("Bitte Beistellnummer eingeben");
    return;
  }

  out.innerHTML = buildOutput(type);

  document.querySelectorAll("#kunden .action").forEach(b => b.classList.remove("active"));
  const active = document.querySelector(`#kunden .action[data-type="${type}"]`);
  if (active) active.classList.add("active");
}

document.querySelectorAll("#kunden .action").forEach(btn => {
  btn.addEventListener("click", () => makeOutput(btn.dataset.type));
});

// =========================
// Tastatur
// =========================
function buildKeyboard(type){
  kbGrid.innerHTML = "";
  const chars = (type==="numbers")
    ? ['1','2','3','4','5','6','7','8','9','0']
    : "QWERTZUIOPÜASDFGHJKLÖÄYXCVBNM".split("");

  chars.forEach(ch => {
    const b = document.createElement("button");
    b.textContent = ch;
    b.addEventListener("click", () => kbInput.value += ch);
    kbGrid.appendChild(b);
  });
}

function openKeyboard(field,type){
  currentField = field;

  kbTitle.textContent = (type==="numbers")
    ? "Beistellnummer eingeben"
    : "Kundenname eingeben";

  kbInput.value = field.value || "";
  kbInput.dataset.type = type;

  buildKeyboard(type);

  kbPopup.style.display = "flex";

  // ✅ Cursor sofort im Eingabefeld
  setTimeout(() => {
    kbInput.focus();
  }, 10);
}

function closeKeyboard(){
  kbPopup.style.display = "none";
}

btnDel.onclick = () => kbInput.value = kbInput.value.slice(0,-1);
btnClose.onclick = closeKeyboard;

btnOk.onclick = () => {
  if (!currentField) return;

  currentField.value = kbInput.value.trim();

  if (currentField === numInput) {
    openKeyboard(kundeInput, "letters");
  } else {
    closeKeyboard();
  }
};

// =========================
// Enter / Return Eingabe
// =========================
kbInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    btnOk.click();
  }
});

numInput.onclick   = () => openKeyboard(numInput, "numbers");
kundeInput.onclick = () => openKeyboard(kundeInput, "letters");


// =========================
// Drucken – exakt wie Vorschau
// =========================
document.getElementById("btnDrucken").onclick = () => {
  if (!selectedType) return alert("Bitte Kunde wählen!");

  out.innerHTML = buildOutput(selectedType);
  const printArea = document.getElementById("printArea");

  const w = window.open("", "_blank", "width=1200,height=850");

  w.document.write(`
    <html>
    <head>
      <style>
        @page { size: A5 landscape; margin:0; }

        html,body{
          margin:0;
          padding:0;
          width:210mm;
          height:148mm;
          font-family:Arial, sans-serif;
        }

        body{
          display:flex;
          justify-content:center;
          align-items:center;
        }

        #printArea{
          background:#ffffff;
          width:210mm;
          height:148mm;
          box-sizing:border-box;
          padding:8mm;
          position:relative;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
        }

        #output-content{
          text-align:center;
          font-weight:700;
          line-height:1.2;
          font-family:Arial, sans-serif;
        }

        #output-footer{
          position:absolute;
          right:8mm;
          bottom:6mm;
        }

        #output-footer img{
          width:40mm;
          height:auto;
          max-height:15mm;
          object-fit:contain;
        }
      </style>
    </head>
    <body>${printArea.outerHTML}</body>
    </html>
  `);

  w.document.close();
  w.focus();

  setTimeout(() => {
    w.print();
    w.close();
  }, 300);
};

// =========================
// Zurück
// =========================
document.getElementById("btnBack").onclick = () => {
  window.location.href = "../index.html";
};
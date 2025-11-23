// =========================
// DOM-Referenzen
// =========================
const out        = document.getElementById('output-content');

const kbPopup    = document.getElementById('keyboardPopup');
const kbTitle    = document.getElementById('keyboardTitle');
const kbInput    = document.getElementById('keyboardInput');
const kbGrid     = document.getElementById('keyboardGrid');

const btnDel     = document.getElementById('btnDel');
const btnOk      = document.getElementById('btnOk');
const btnClose   = document.getElementById('btnClose');

let selectedCustomer = "";
let customCustomer   = "";

// =========================
// Vorschau bauen
// =========================
function buildOutput() {
  const kunde = customCustomer || selectedCustomer || "";
  if (!kunde) return "";

  let html = "";
  html += `<div style="font-size:30pt;margin-bottom:8mm;">${kunde}</div>`;
  html += `<div style="font-size:24pt;margin-bottom:8mm;">Kanten</div>`;
  html += `<div style="font-size:20pt;margin-bottom:4mm;">K-Termin: ________</div>`;
  html += `<div style="font-size:20pt;">Palettennummer: ________</div>`;
  return html;
}

function updateOutput() {
  out.innerHTML = buildOutput();
}

// =========================
// Tastatur – wie Beschichtung
// =========================
function buildKeyboardLetters() {
  kbGrid.innerHTML = "";
  const chars = "QWERTZUIOPÜASDFGHJKLÖÄYXCVBNM1234567890".split("");
  chars.forEach(ch => {
    const b = document.createElement("button");
    b.textContent = ch;
    b.addEventListener("click", () => {
      kbInput.value += ch;
      kbInput.focus();
    });
    kbGrid.appendChild(b);
  });
}

function openKeyboardForCustomer() {
  kbTitle.textContent = "Kundenname eingeben";
  kbInput.value = customCustomer || "";
  buildKeyboardLetters();
  kbPopup.style.display = "flex";

  setTimeout(() => kbInput.focus(), 10);
}

function closeKeyboard() {
  kbPopup.style.display = "none";
}

btnDel.onclick   = () => kbInput.value = kbInput.value.slice(0, -1);
btnClose.onclick = closeKeyboard;

btnOk.onclick = () => {
  customCustomer   = kbInput.value.trim();
  selectedCustomer = "";
  closeKeyboard();
  updateOutput();
};

// Enter bestätigt wie bei Beschichtung
kbInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") btnOk.click();
});

// =========================
// Kunden-Buttons
// =========================
document.querySelectorAll("#kunden .action").forEach(btn => {
  btn.addEventListener("click", () => {
    // optische Markierung
    document.querySelectorAll("#kunden .action")
      .forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const type = btn.dataset.kunde;

    if (type === "SONSTIGE") {
      openKeyboardForCustomer();
    } else {
      selectedCustomer = btn.textContent.trim();
      customCustomer   = "";
      updateOutput();
    }
  });
});

// =========================
// Drucken – A6 quer
// =========================
document.getElementById("btnDruckenKanten").onclick = () => {
  if (!selectedCustomer && !customCustomer) {
    alert("Bitte Kunde wählen!");
    return;
  }

  // Ausgabe sicherstellen
  updateOutput();
  const printArea = document.getElementById("printArea");

  const w = window.open("", "_blank", "width=1200,height=850");

  w.document.write(`
    <html>
    <head>
      <style>
        @page { size: A6 landscape; margin:0; }

        html,body{
          margin:0;
          padding:0;
          width:148mm;
          height:105mm;
          font-family:Arial, sans-serif;
        }

        body{
          display:flex;
          justify-content:center;
          align-items:center;
        }

        #printArea{
          background:#ffffff;
          width:148mm;
          height:105mm;
          box-sizing:border-box;
          padding:8mm;
          position:relative;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          border:1px solid #000;
        }

        #output-content{
          text-align:center;
          font-weight:700;
          line-height:1.2;
          font-family:Arial, sans-serif;
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
// Zurück – wie Beschichtung
// =========================
document.getElementById("btnBackKanten").onclick = () => {
  window.location.href = "../index.html";
};
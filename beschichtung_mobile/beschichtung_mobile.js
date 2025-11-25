// ===============================
// Schnellzugriffe
// ===============================
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

const numInput   = $("#numInput");
const kundeInput = $("#kundeInput");

const kbPopup = $("#keyboardPopup");
const kbInput = $("#keyboardInput");
const kbGrid  = $("#keyboardGrid");
const kbTitle = $("#keyboardTitle");

let currentField = null;
let selectedType = null;

// ===============================
// LOGO als eingebettete BASE64-Grafik
// ===============================
const logoBase64 = "data:image/jpeg;base64,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";

// ===============================
// Kundenliste
// ===============================
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

// Buttons erzeugen
const btnContainer = $("#kundenButtons");
kundenListe.forEach(k => {
  const b = document.createElement("button");
  b.textContent = k[1];
  b.dataset.type = k[0];
  b.classList.add("action");
  b.onclick = () => makeOutput(k[0]);
  btnContainer.appendChild(b);
});

// ===============================
// Vorschau markieren
// ===============================
function makeOutput(type) {
  selectedType = type;
  $$("#kundenButtons button").forEach(b => b.classList.remove("active"));
  const activeBtn = document.querySelector(`[data-type="${type}"]`);
  if (activeBtn) activeBtn.classList.add("active");
}

// ===============================
// Tastatur
// ===============================
function buildKeyboard(type) {
  kbGrid.innerHTML = "";
  const chars = type === "numbers"
    ? ["1","2","3","4","5","6","7","8","9","0"]
    : "QWERTZUIOPÜASDFGHJKLÖÄYXCVBNM".split("");

  chars.forEach(ch => {
    const b = document.createElement("button");
    b.textContent = ch;
    b.onclick = () => kbInput.value += ch;
    kbGrid.appendChild(b);
  });
}

function openKeyboard(field, type) {
  currentField = field;
  kbTitle.textContent = type === "numbers" ? "Beistellnummer" : "Kundenname";

  kbInput.value = field.value || "";
  kbPopup.style.display = "flex";

  buildKeyboard(type);
  setTimeout(() => kbInput.focus(), 50);
}

$("#btnDel").onclick   = () => kbInput.value = kbInput.value.slice(0, -1);
$("#btnClose").onclick = () => kbPopup.style.display = "none";

$("#btnOk").onclick = () => {
  if (!currentField) return;
  currentField.value = kbInput.value;
  kbPopup.style.display = "none";
  if (currentField === numInput) openKeyboard(kundeInput, "letters");
};

numInput.addEventListener("focus",  e => { e.preventDefault(); numInput.blur();  openKeyboard(numInput, "numbers"); });
kundeInput.addEventListener("focus",e => { e.preventDefault(); kundeInput.blur(); openKeyboard(kundeInput, "letters"); });

// ===============================
// Validierung
// ===============================
function validate() {
  if (!selectedType) return alert("Bitte einen Kunden wählen!"), false;
  if (!numInput.value.trim()) return alert("Bitte Beistellnummer eingeben!"), false;

  const need = ["COMTEZN8","CHEMISCH","DICK","BLAU","PENTZ","RCS","COATINC"];
  if (need.includes(selectedType) && !kundeInput.value.trim()) {
    return alert("Bitte Kundenname eingeben!"), false;
  }
  return true;
}

// ===============================
// PDF ERSTELLEN + AN druck.html ÜBERGEBEN
// ===============================
$("#btnDrucken").onclick = () => {
    if (!validate()) return;

    const n = numInput.value.trim();
    const k = kundeInput.value.trim();

    let z1 = n, z2="", z3="", z4="";

    switch(selectedType){
        case "LP": z2="L&P"; break;
        case "LPEILT": z2="L&P"; z3="EILT SEHR"; break;

        case "SCHUETTE": z2="Schütte"; break;
        case "SCHUETTEEILT": z2="Schütte"; z3="EILT SEHR"; break;

        case "KLEY": z2="Kleymann"; break;
        case "KLEYEILT": z2="Kleymann"; z3="EILT SEHR"; break;

        case "COMTEZN8": z2="Comte"; z3="„ZN8“"; z4=k; break;
        case "CHEMISCH": z2="Comte"; z3="„Chemisch Vernickeln“"; z4=k; break;
        case "DICK": z2="Comte"; z3="„Dickschichtpassivierung“"; z4=k; break;
        case "BLAU": z2="Comte"; z3="„Blau ZN8“"; z4=k; break;

        case "PENTZ": z2="Pentz & Gerdes"; z3="„ZN8“"; z4=k; break;
        case "RCS": z2="RCS"; z3="„Schweißen“"; z4=k; break;
        case "COATINC": z2="Coatinc 24"; z3="„Verzinken“"; z4=k; break;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation:"landscape", unit:"mm", format:"a5" });

    const W = pdf.internal.pageSize.getWidth();
    const H = pdf.internal.pageSize.getHeight();
    const C = W/2;

    pdf.setFont("helvetica","bold");

    pdf.setFontSize(60);
    pdf.text(z1, C, 50, {align:"center"});

    if(z2){ pdf.setFontSize(60); pdf.text(z2, C, 85, {align:"center"}); }

    if(z3){
        if(z3.includes("EILT SEHR")){
            pdf.setFontSize(60);
            pdf.text("„EILT SEHR“", C, 120, {align:"center"});
        } else {
            pdf.setFontSize(32);
            pdf.text(z3, C, 120, {align:"center"});
        }
    }

    if(z4){
        pdf.setFontSize(32);
        pdf.text(`(${z4})`, C, 140, {align:"center"});
    }


   // LOGO EINBINDEN (BASE64)
pdf.addImage(logoBase64, "JPEG", W - 48, H - 22, 40, 14);


    // PDF → Base64 String
    const pdfBase64 = pdf.output("datauristring");

    // Speichern
    localStorage.setItem("PDF_PRINT", pdfBase64);

    // druck.html öffnen
    window.open("druck.html", "_blank");
};
// ===============================
// Zurück
// ===============================
$("#btnBack").onclick = () => window.location.href = "../index.html";

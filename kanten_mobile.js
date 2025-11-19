let selectedCustomer = "";

// EINSTELLBARE ABSTÄNDE
const ABSTAND_OBEN = 20;
const ABSTAND_UNTEN = 20;
const ABSTAND_KUNDE_ZU_KANTEN = 10;
const ABSTAND_KANTEN_ZU_TERMIN = 40;
const ABSTAND_TERMIN_ZU_PALETTE = 40;


// ======================================
// Vorschau erzeugen
// ======================================
function updatePreview() {
    if (!selectedCustomer) return;

    const out = document.getElementById("output-content");

    out.innerHTML = `
        <div style="font-size:26pt; margin-top:${ABSTAND_OBEN}px; margin-bottom:${ABSTAND_KUNDE_ZU_KANTEN}px;">
            ${selectedCustomer}
        </div>

        <div style="font-size:26pt; margin-bottom:${ABSTAND_KANTEN_ZU_TERMIN}px;">
            Kanten
        </div>

        <div style="font-size:16pt; text-align:left; margin-bottom:${ABSTAND_TERMIN_ZU_PALETTE}px;">
            K-Termin: ________________
        </div>

        <div style="font-size:16pt; text-align:left; margin-bottom:${ABSTAND_UNTEN}px;">
            Palettennummer: __________
        </div>
    `;

    autoscalePreview();
}


// ======================================
// AUTOMATISCHE SKALIERUNG
// ======================================
function autoscalePreview() {
    const box = document.getElementById("previewBox");
    const content = document.getElementById("output-content");

    let scale = 1;

    while (content.scrollHeight * scale > box.clientHeight - 20) {
        scale -= 0.02;
        if (scale < 0.40) break;
    }

    content.style.transform = `scale(${scale})`;
}


// ======================================
// Buttons: Kunden wählen
// ======================================
document.querySelectorAll("#kunden button").forEach(btn => {
    btn.onclick = () => {
        const name = btn.dataset.name;

        if (name === "Sonstige Kunden") {
            openKeyboard();
            return;
        }

        selectedCustomer = name;
        document.getElementById("previewPopup").style.display = "flex";
        updatePreview();
    };
});


// ======================================
// Druck-Buttons
// ======================================
document.getElementById("btnBack").onclick = () => history.back();

document.getElementById("btnDrucken").onclick = () => {
    if (!selectedCustomer) return;
    document.getElementById("previewPopup").style.display = "flex";
    updatePreview();
};

document.getElementById("btnCancelPreview").onclick = () => {
    document.getElementById("previewPopup").style.display = "none";
};

document.getElementById("btnPrintNow").onclick = () => {
    const printArea = document.getElementById("printArea");
    printArea.innerHTML = document.getElementById("output-content").innerHTML;
    window.print();
};


// ======================================
// Tastatur
// ======================================
function openKeyboard() {
    document.getElementById("keyboardPopup").style.display = "flex";
    document.getElementById("keyboardInput").value = "";
}

document.getElementById("btnClose").onclick = () => {
    document.getElementById("keyboardPopup").style.display = "none";
};

document.getElementById("btnDel").onclick = () => {
    const inp = document.getElementById("keyboardInput");
    inp.value = inp.value.slice(0, -1);
};

document.getElementById("btnOk").onclick = () => {
    const val = document.getElementById("keyboardInput").value.trim();
    if (val.length > 0) {
        selectedCustomer = val;
        document.getElementById("keyboardPopup").style.display = "none";
        document.getElementById("previewPopup").style.display = "flex";
        updatePreview();
    }
};


// Tastatur Tasten
const keys = "QWERTZUIOPASDFGHJKLYXCVBNMÄÖÜ0123456789".split("");
const grid = document.getElementById("keyboardGrid");

keys.forEach(k => {
    const b = document.createElement("button");
    b.textContent = k;
    b.onclick = () => {
        document.getElementById("keyboardInput").value += k;
    };
    grid.appendChild(b);
});
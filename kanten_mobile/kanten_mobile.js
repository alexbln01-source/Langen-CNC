let selectedCustomer = "";
let customCustomer   = "";

/* =====================================
   KUNDEN-LAYOUTS (Zeilensystem)
===================================== */

const kundenLayouts = {

    "Bergmann M-H": [
        { text: "<kunde>", size: "48pt", marginTop: "1mm" },
        { text: "Kanten", size: "48pt", marginTop: "2mm" },
        { text: "K-Termin: ________", size: "28pt", marginTop: "12mm" },
        { text: "Palettennummer: ________", size: "28pt", marginTop: "12mm" }
    ],

    "Bücker": [
        { text: "<kunde>", size: "48pt", marginTop: "1mm" },
        { text: "Kanten", size: "48pt", marginTop: "2mm" },
        { text: "K-Termin: ________", size: "28pt", marginTop: "12mm" },
        { text: "Palettennummer: ________", size: "28pt", marginTop: "12mm" }
    ],

    "Grimme": [
        { text: "<kunde>", size: "48pt", marginTop: "1mm" },
        { text: "Kanten", size: "48pt", marginTop: "2mm" },
        { text: "K-Termin: ________", size: "28pt", marginTop: "12mm" },
        { text: "Palettennummer: ________", size: "28pt", marginTop: "12mm" }
    ],

    "Janzen": [
        { text: "<kunde>", size: "48pt", marginTop: "1mm" },
        { text: "Kanten", size: "48pt", marginTop: "2mm" },
        { text: "K-Termin: ________", size: "28pt", marginTop: "12mm" },
        { text: "Palettennummer: ________", size: "28pt", marginTop: "12mm" }
    ],

    "Krone Spelle": [
        { text: "<kunde>", size: "48pt", marginTop: "1mm" },
        { text: "Kanten", size: "48pt", marginTop: "2mm" },
        { text: "K-Termin: ________", size: "28pt", marginTop: "12mm" },
        { text: "Palettennummer: ________", size: "28pt", marginTop: "12mm" }
    ],

    "L.Bergmann": [
        { text: "<kunde>", size: "48pt", marginTop: "1mm" },
        { text: "Kanten", size: "48pt", marginTop: "2mm" },
        { text: "K-Termin: ________", size: "28pt", marginTop: "12mm" },
        { text: "Palettennummer: ________", size: "28pt", marginTop: "12mm" }
    ],

    "PAUS": [
        { text: "<kunde>", size: "48pt", marginTop: "14mm" },
        { text: "Kanten", size: "48pt", marginTop: "2mm" },
        { text: "K-Termin: ________", size: "28pt", marginTop: "12mm" }
        
    ],

    "TOS": [
        { text: "<kunde>", size: "48pt", marginTop: "18mm" },
        { text: "Kanten", size: "48pt", marginTop: "2mm" }
],

    "SONSTIGE": [
        { text: "<kundeneingabe>", size: "48pt", marginTop: "1mm" },
        { text: "Kanten", size: "48pt", marginTop: "2mm" },
        { text: "K-Termin: ________", size: "28pt", marginTop: "12mm" },
        { text: "Palettennummer: ________", size: "28pt", marginTop: "12mm" }
    ]
};

/* =============================
   Kunden-Auswahl
============================= */

const kundenButtons = document.querySelectorAll(".kunde-btn");

kundenButtons.forEach(btn => {
    btn.addEventListener("click", () => {

        kundenButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const kunde = btn.dataset.kunde;

        if (kunde === "SONSTIGE") {
            openKeyboard();
        } else {
            selectedCustomer = kunde;
        }
    });
});

/* =============================
   Popup Tastatur (neu, schön)
============================= */

const kbPopup = document.getElementById("keyboardPopup");
const kbInput = document.getElementById("keyboardInput");
const kbGrid  = document.getElementById("keyboardGrid");

function openKeyboard() {
    kbInput.value = customCustomer;
    kbPopup.style.display = "flex";
    kbInput.focus();
    buildKeyboard();
}

function closeKeyboard() {
    kbPopup.style.display = "none";
}

function buildKeyboard() {

    kbGrid.innerHTML = "";

    const chars = "Q W E R T Z U I O P Ü A S D F G H J K L Ö Ä Y X C V B N M".split(" ");

    chars.forEach(ch => {
        const key = document.createElement("button");
        key.textContent = ch;
        key.onclick = () => { kbInput.value += ch; };
        kbGrid.appendChild(key);
    });
}

document.getElementById("kbDel").onclick = () => {
    kbInput.value = kbInput.value.slice(0, -1);
};

document.getElementById("kbOk").onclick = () => {
    const val = kbInput.value.trim();
    if (!val) return alert("Bitte Kundenname eingeben.");

    customCustomer = val;
    selectedCustomer = "SONSTIGE";
    closeKeyboard();
};

document.getElementById("kbClose").onclick = closeKeyboard;

/* =============================
   Navigation
============================= */

document.getElementById("backBtn").onclick = () => history.back();

/* =============================
   DRUCK
============================= */

document.getElementById("printBtn").onclick = () => {

    if (!selectedCustomer) {
        alert("Bitte Kunde auswählen!");
        return;
    }

    const data = {
        kunde: selectedCustomer,
        custom: customCustomer,
        layout: kundenLayouts[selectedCustomer]
    };

    window.location.href =
        "druck_kanten.html?data=" + encodeURIComponent(JSON.stringify(data));
};

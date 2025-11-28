//--------------------------------------------
// KUNDEN-Buttons & Eingaben
//--------------------------------------------

const kundenMap = {
    "LP": "L&P",
    "LPEILT": "L&P – „EILT SEHR“",
    "SCHUETTE": "Schütte",
    "SCHUETTEEILT": "Schütte – „EILT SEHR“",
    "KLEY": "Kleymann",
    "KLEYEILT": "Kleymann – „EILT SEHR“",
    "COMTEZN8": "Comte – ZN8",
    "CHEMISCH": "Comte – Chemisch Vernickeln",
    "DICK": "Comte – Dickschichtpassivierung",
    "BLAU": "Comte – Blau ZN8",
    "PENTZ": "Pentz & Gerdes – ZN8",
    "RCS": "RCS – Schweißen",
    "COATINC": "Coatinc 24 – Verzinken"
};

const kundenKeys = Object.keys(kundenMap);

// Buttons erzeugen
const kundenButtons = document.getElementById("kundenButtons");
kundenKeys.forEach(key => {
    const btn = document.createElement("button");
    btn.textContent = kundenMap[key];
    btn.dataset.type = key;
    btn.onclick = () => selectType(key, btn);
    kundenButtons.appendChild(btn);
});

let selectedType = null;

function selectType(type, btn) {
    selectedType = type;
    document.querySelectorAll("#kundenButtons button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
}

//--------------------------------------------
// Virtuelle Tastatur für Felder
//--------------------------------------------

let activeInput = null;

document.querySelectorAll(".fake-input").forEach(inp => {
    inp.addEventListener("focus", () => openKeyboard(inp));
    inp.addEventListener("click", () => openKeyboard(inp));
});

function openKeyboard(inp) {
    activeInput = inp;
    keyboardInput.value = inp.value;
    keyboardTitle.textContent = inp.placeholder;
    keyboardPopup.style.display = "flex";
}

btnOk.onclick = () => {
    activeInput.value = keyboardInput.value;
    keyboardPopup.style.display = "none";
};

btnClose.onclick = () => {
    keyboardPopup.style.display = "none";
};

btnDel.onclick = () => {
    keyboardInput.value = keyboardInput.value.slice(0,-1);
};

// Tastatur-Grid erzeugen
const grid = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
grid.forEach(ch => {
    const b = document.createElement("button");
    b.textContent = ch;
    b.onclick = () => keyboardInput.value += ch;
    keyboardGrid.appendChild(b);
});

//--------------------------------------------
// Drucken – NEU: Übergabe per URL an druck.html
//--------------------------------------------

btnDrucken.onclick = () => {

    if (!selectedType) {
        alert("Bitte einen Kunden auswählen!");
        return;
    }

    const beistell   = document.getElementById("numInput").value.trim();
    const kundename  = document.getElementById("kundeInput").value.trim();

    const payload = {
        selectedType,
        beistell,
        kundename
    };

    // Optional: weiterhin im localStorage ablegen (Fallback)
    localStorage.setItem("DRUCKDATEN", JSON.stringify(payload));

    // Daten als JSON kodiert in die URL packen
    const encoded = encodeURIComponent(JSON.stringify(payload));

    // Neues Fenster/Tab im normalen Chrome -> dort wird gedruckt
    window.open("druck.html?data=" + encoded, "_blank");
};

// SAUBER ZURÜCK
document.getElementById("btnBack").onclick = () => {
  window.location.href = "../index.html";
};
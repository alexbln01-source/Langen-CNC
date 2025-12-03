let activeInput = null;
let currentColor = "red";

/* Farbknöpfe */
document.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentColor = btn.dataset.color;
    });
});

/* Tastatur-Buttons erzeugen */
const grid = document.getElementById("keyboardKeys");
["1","2","3","4","5","6","7","8","9","0"].forEach(c => {
    const b = document.createElement("button");
    b.textContent = c;
    b.onclick = () => keyboardInput.value += c;
    grid.appendChild(b);
});

/* Felder öffnen Tastatur */
kommission.onclick = () => openKeyboard("kommission");
lieferdatum.onclick = () => openKeyboard("lieferdatum");

function openKeyboard(id) {
    activeInput = document.getElementById(id);
    keyboardInput.value = "";
    keyboardPopup.style.display = "flex";
    keyboardTitle.textContent =
        id === "kommission" ? "Kommissionsnummer" : "Lieferdatum";
}

/* Keyboard Aktionen */
keyboardClose.onclick = () => keyboardPopup.style.display = "none";

keyboardDelete.onclick = () =>
    keyboardInput.value = keyboardInput.value.slice(0, -1);

keyboardOK.onclick = handleKeyboardOK;

function handleKeyboardOK() {
    if (!activeInput) return;

    let val = keyboardInput.value.trim();

    // Datum formatieren
    if (activeInput.id === "lieferdatum") {
        val = val.replace(/\D/g, "");
        if (val.length === 3) val = "0" + val;
        if (val.length === 4) val = val.slice(0,2) + "." + val.slice(2);
    }

    activeInput.value = val;

    // Automatisch zum Feld weiter
    if (activeInput.id === "kommission") {
        openKeyboard("lieferdatum");
        return;
    }

    keyboardPopup.style.display = "none";
}

/* Drucken */
nextBtn.onclick = () => {
    if (!kommission.value.trim()) {
        alert("Bitte Kommissionsnummer eingeben!");
        return;
    }

    const data = {
        kommission: kommission.value.trim(),
        lieferdatum: lieferdatum.value.trim(),
        vorgezogen: chkVorgezogen.checked,
        farbe: currentColor
    };

    const json = JSON.stringify(data);

    window.location.href =
        "paus_druck.html?data=" + encodeURIComponent(json);
};

backBtn.onclick = () => history.back();

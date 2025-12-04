let activeInput = null;
let currentColor = "red";

/* Prüft, ob Gerät ein Smartphone/Tablet ist */
function isMobile() {
    return /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
}

/* =============================
   PC → normale Tastatur erlauben
============================= */
if (!isMobile()) {
    kommission.removeAttribute("readonly");
    lieferdatum.removeAttribute("readonly");
}

/* =============================
   PC: AUTOMATISCHE DATUMFORMATIERUNG
============================= */
lieferdatum.addEventListener("input", () => {
    let v = lieferdatum.value.replace(/\D/g, ""); // nur Zahlen

    if (v.length === 3) {
        v = "0" + v;
    }

    if (v.length >= 4) {
        v = v.slice(0, 2) + "." + v.slice(2, 4) + ".";
    }

    lieferdatum.value = v;
});

/* ENTER → weiter zum Datum */
kommission.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        lieferdatum.focus();
    }
});

/* =============================
   Farbe auswählen
============================= */
document.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentColor = btn.dataset.color;
    });
});

/* =============================
   Popup Tastatur erstellen
============================= */
const grid = document.getElementById("keyboardKeys");
["1","2","3","4","5","6","7","8","9","0"].forEach(c => {
    const b = document.createElement("button");
    b.textContent = c;
    b.onclick = () => keyboardInput.value += c;
    grid.appendChild(b);
});

/* Eingabefeld Klick → nur Handy */
kommission.onclick = () => {
    if (isMobile()) openKeyboard("kommission");
};

lieferdatum.onclick = () => {
    if (isMobile()) openKeyboard("lieferdatum");
};

function openKeyboard(id) {
    activeInput = document.getElementById(id);
    keyboardInput.value = "";
    keyboardPopup.style.display = "flex";
    keyboardTitle.textContent =
        id === "kommission" ? "Kommissionsnummer" : "Lieferdatum";

    setTimeout(() => keyboardInput.focus(), 100);
}

/* =============================
   Popup Tasten
============================= */
keyboardClose.onclick = () => keyboardPopup.style.display = "none";
keyboardDelete.onclick = () => keyboardInput.value = keyboardInput.value.slice(0,-1);
keyboardOK.onclick = handleKeyboardOK;

keyboardInput.addEventListener("keydown", e => {
    if (e.key === "Enter") handleKeyboardOK();
});

/* =============================
   Popup Eingabe bestätigen
============================= */
function handleKeyboardOK() {
    if (!activeInput) return;

    let val = keyboardInput.value.trim();

    /* Datum automatisch formatieren */
    if (activeInput.id === "lieferdatum") {

        val = val.replace(/\D/g, "");

        if (val.length === 3) {
            val = "0" + val;
        }

        if (val.length >= 4) {
            val = val.slice(0,2) + "." + val.slice(2,4) + ".";
        }
    }

    activeInput.value = val;

    /* Nach Kommission automatisch zum Datum weiter */
    if (activeInput.id === "kommission") {
        if (isMobile()) openKeyboard("lieferdatum");
        return;
    }

    keyboardPopup.style.display = "none";
}

/* =============================
   DRUCKEN
============================= */
druckenBtn.onclick = () => {

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

    /* Android App */
    if (window.Android && typeof Android.printPaus === "function") {
        Android.printPaus(json);
        return;
    }

    /* Web-Druckseite */
    window.location.href =
        "paus_druck.html?data=" + encodeURIComponent(json);
};

/* =============================
   ZURÜCK
============================= */
backBtn.onclick = () => history.back();

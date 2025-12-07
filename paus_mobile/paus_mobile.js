let activeInput = null;
let currentColor = "red";
let scanBuffer = "";

/* ============================
   DEVICE DETECTION
============================ */
const ua = navigator.userAgent.toLowerCase();
const sw = window.screen.width;
const sh = window.screen.height;
const dpr = window.devicePixelRatio;

// TC21
const isTC21 = ua.includes("android") && sw === 360 && sh === 640;

// TC22
const isTC22 = ua.includes("android") && sw === 360 && sh === 720 && dpr === 3;

// Zebra generell
const isZebra = ua.includes("zebra") || isTC21 || isTC22;

// Mobile (Android/iOS)
const isMobile = /android|iphone|ipad|ipod/i.test(ua);

// PC = kein Mobile + kein Zebra
const isPC = !isMobile && !isZebra;

// CSS Klasse setzen
if (isPC) document.body.classList.add("pc-device");

document.getElementById("deviceInfo").textContent =
    isTC22 ? "Gerät: Zebra TC22" :
    isTC21 ? "Gerät: Zebra TC21" :
    isZebra ? "Gerät: Zebra" :
    isMobile ? "Gerät: Mobil" : "Gerät: PC";

/* ============================
   ELEMENTE
============================ */
const kommission = document.getElementById("kommission");
const lieferdatum = document.getElementById("lieferdatum");

const keyboardPopup = document.getElementById("keyboardPopup");
const openKeyboardBtn = document.getElementById("openKeyboardBtn");
const keyboardInput = document.getElementById("keyboardInput");
const keyboardDelete = document.getElementById("keyboardDelete");
const keyboardOK = document.getElementById("keyboardOK");
const keyboardClose = document.getElementById("keyboardClose");
const keyboardKeys = document.getElementById("keyboardKeys");

const druckenBtn = document.getElementById("druckenBtn");
const backBtn    = document.getElementById("backBtn");
const chkVorgezogen = document.getElementById("chkVorgezogen");

/* ============================
   BUILD INFO
============================ */
function buildNumber() {
    const d = new Date(document.lastModified);
    const stamp =
        d.getFullYear() + "-" +
        String(d.getMonth()+1).padStart(2,"0") + "-" +
        String(d.getDate()).padStart(2,"0") + "." +
        String(d.getHours()).padStart(2,"0") +
        String(d.getMinutes()).padStart(2,"0");

    document.getElementById("buildInfo").textContent = "Build " + stamp;
}

/* ============================
   HILFSFUNKTIONEN FÜR BLINK-CURSOR
============================ */
function setBlinkOn(input) {
    kommission.classList.remove("input-blink");
    lieferdatum.classList.remove("input-blink");
    if (input) {
        input.classList.add("input-blink");
    }
}

/* ============================
   INITIAL FOCUS (Zebra / PC)
============================ */
window.onload = () => {
    kommission.value = "";
    lieferdatum.value = "";

    buildNumber();

    if (isZebra) {
        // Zebra: Felder bleiben readonly im HTML, Scanner schreibt trotzdem rein
        kommission.readOnly = false;
        lieferdatum.readOnly = false;

        kommission.focus();
        setBlinkOn(kommission);
    } else {
        // PC darf normal tippen
        kommission.removeAttribute("readonly");
        lieferdatum.removeAttribute("readonly");
        openKeyboardBtn.style.display = "none";  // Button auf PC unnötig
    }
};

/* ============================
   FARBAUSWAHL
============================ */
document.querySelectorAll(".color-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentColor = btn.dataset.color;
    };
});

/* ============================
   POPUP TASTATUR (Zebra only)
============================ */
const KEY_LAYOUT = ["1","2","3","4","5","6","7","8","9","0",
                    "A","B","C","D","E","F","G","H","I","J",
                    "K","L","M","N","O","P","Q","R","S","T",
                    "U","V","W","X","Y","Z"];

function renderKeyboard() {
    keyboardKeys.innerHTML = "";
    KEY_LAYOUT.forEach(k => {
        const b = document.createElement("button");
        b.textContent = k;
        b.type = "button";
        b.onclick = () => keyboardInput.value += k;
        keyboardKeys.appendChild(b);
    });
}
renderKeyboard();

function openKeyboard(id) {
    activeInput = document.getElementById(id);
    keyboardInput.value = activeInput.value;
    keyboardPopup.style.display = "flex";

    // Blink-Cursor auf dem aktiven Feld
    setBlinkOn(activeInput);

    setTimeout(() => keyboardInput.focus(), 20);
}

/* NICHT automatisch öffnen → nur per Button */
openKeyboardBtn.onclick = () => {
    if (!isZebra) return;    // Sicherheit: nur auf Zebra sinnvoll
    openKeyboard("kommission");
};

/* OK */
keyboardOK.onclick = () => {
    if (!activeInput) return;

    let v = keyboardInput.value;

    // Datum formatieren
    if (activeInput.id === "lieferdatum") {
        v = v.replace(/\D/g, "");
        if (v.length === 3) v = "0" + v;
        if (v.length >= 4) v = v.slice(0,2) + "." + v.slice(2,4);
    }

    activeInput.value = v;

    // Weiter zum Datum
    if (activeInput.id === "kommission") {
        openKeyboard("lieferdatum");
        return;
    }

    // Popup schließen nach Datum
    keyboardPopup.style.display = "none";
    setBlinkOn(null); // nach fertiger Eingabe Blink aus
};

/* Delete */
keyboardDelete.onclick = () =>
    keyboardInput.value = keyboardInput.value.slice(0, -1);

/* Close */
keyboardClose.onclick = () => {
    keyboardPopup.style.display = "none";
    // optional: Blink auf Kommission zurück
    if (isZebra) {
        kommission.focus();
        setBlinkOn(kommission);
    } else {
        setBlinkOn(null);
    }
};

/* ============================
   SCANNER (Zebra DataWedge)
============================ */
document.addEventListener("keydown", e => {

    if (isZebra) {
        if (e.key === "Enter") {

            let text = scanBuffer.trim();

            if (text.includes("K:") && text.includes("D:")) {

                const kom = text.match(/K:(.*?);/)[1];
                const raw = text.match(/D:(.*)/)[1].replace(/\D/g, "");

                let dat = raw;
                if (dat.length === 3) dat = "0" + dat;
                if (dat.length >= 4) dat = dat.slice(0,2) + "." + dat.slice(2,4);

                kommission.value = kom;
                lieferdatum.value = dat;

                // Nach Scan Blink auf Kommission
                kommission.focus();
                setBlinkOn(kommission);
            }

            scanBuffer = "";
        } else {
            scanBuffer += e.key;
        }
    }
});

/* ============================
   DRUCKEN
============================ */
druckenBtn.onclick = () => {

    if (!kommission.value.trim()) return alert("Bitte Kommissionsnummer eingeben!");
    if (!lieferdatum.value.trim()) return alert("Bitte Lieferdatum eingeben!");

    const data = {
        kommission: kommission.value.trim(),
        lieferdatum: lieferdatum.value.trim(),
        vorgezogen: chkVorgezogen.checked,
        farbe: currentColor
    };

    const json = JSON.stringify(data);

    // Zebra App?
    if (window.Android && typeof Android.printPaus === "function") {
        Android.printPaus(json);
    } else {
        window.location.href = "paus_druck.html?data=" + encodeURIComponent(json);
    }
};

/* BACK */
backBtn.onclick = () => history.back();

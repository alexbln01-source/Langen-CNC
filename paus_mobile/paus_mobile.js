let activeInput = null;
let currentColor = "red";
let scanBuffer = "";
let scanTimeout = null;

/* ============================
   DEVICE DETECTION
============================ */
const ua = navigator.userAgent.toLowerCase();
const sw = window.screen.width;
const sh = window.screen.height;
const dpr = window.devicePixelRatio;

const isTC21 = ua.includes("android") && sw === 360 && sh === 640;
const isTC22 = ua.includes("android") && sw === 360 && sh === 720 && dpr === 3;
const isZebra = isTC21 || isTC22 || ua.includes("zebra");
const isMobile = /android|iphone|ipad|ipod/i.test(ua);
const isPC = !isZebra && !isMobile;

if (isPC) document.body.classList.add("pc-device");

/* ============================
   ELEMENTE
============================ */
const kommission   = document.getElementById("kommission");
const lieferdatum  = document.getElementById("lieferdatum");

const keyboardPopup  = document.getElementById("keyboardPopup");
const keyboardInput  = document.getElementById("keyboardInput");
const keyboardKeys   = document.getElementById("keyboardKeys");
const keyboardOK     = document.getElementById("keyboardOK");
const keyboardDelete = document.getElementById("keyboardDelete");
const keyboardClose  = document.getElementById("keyboardClose");
const openKeyboardBtn = document.getElementById("openKeyboardBtn");

const deviceInfo = document.getElementById("deviceInfo");
const buildInfo  = document.getElementById("buildInfo");

/* ============================
   DEVICE INFO & BUILD
============================ */
function buildNumber() {
    if (!buildInfo) return;
    const d = new Date(document.lastModified);
    if (isNaN(d.getTime())) return;

    const stamp =
        d.getFullYear() + "-" +
        String(d.getMonth() + 1).padStart(2, "0") + "-" +
        String(d.getDate()).padStart(2, "0") + "." +
        String(d.getHours()).padStart(2, "0") +
        String(d.getMinutes()).padStart(2, "0");

    buildInfo.textContent = "Build " + stamp;
}

if (deviceInfo) {
    deviceInfo.textContent =
        isTC22 ? "Gerät: Zebra TC22" :
        isTC21 ? "Gerät: Zebra TC21" :
        isZebra ? "Gerät: Zebra" :
        isMobile ? "Gerät: Mobil" :
        "Gerät: PC";
}

/* ============================
   STARTVERHALTEN
============================ */
window.onload = () => {
    kommission.value  = "";
    lieferdatum.value = "";

    buildNumber();

    if (isPC) {
        // PC: normale Eingabe, kein Popup-Button nötig
        kommission.removeAttribute("readonly");
        lieferdatum.removeAttribute("readonly");
        if (openKeyboardBtn) openKeyboardBtn.style.display = "none";
        return;
    }

    // Zebra/Handy: keine Systemtastatur
    kommission.readOnly  = true;
    lieferdatum.readOnly = true;

    // Eingabefeld nur fürs Anzeigen, nicht zum Tippen → keine Android-Tastatur
    keyboardInput.readOnly = true;

    if (isZebra) {
        // Scanner schreibt trotzdem in die Seite
        kommission.focus();
    }
};

/* ============================
   FARBAUSWAHL
============================ */
document.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".color-btn")
            .forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentColor = btn.dataset.color;
    });
});

/* ============================
   POPUP ZAHLEN-TASTATUR
   (nur eigene Buttons, keine Android-Tastatur)
============================ */
const NUMBER_KEYS = ["1","2","3","4","5","6","7","8","9","0"];

function renderKeyboard() {
    keyboardKeys.innerHTML = "";
    NUMBER_KEYS.forEach(k => {
        const b = document.createElement("button");
        b.textContent = k;
        b.type = "button";
        b.className = "kb-btn";
        b.onclick = () => {
            // wir ändern den Wert im "Display"-Feld
            keyboardInput.value += k;
        };
        keyboardKeys.appendChild(b);
    });
}
renderKeyboard();

function openKeyboard(id) {
    activeInput = document.getElementById(id);
    keyboardInput.value = activeInput.value;
    keyboardPopup.style.display = "flex";

    // NICHT fokussieren → Systemtastatur bleibt aus
    // (keyboardInput ist zusätzlich readOnly)
}

if (openKeyboardBtn) {
    openKeyboardBtn.onclick = () => openKeyboard("kommission");
}

keyboardOK.onclick = () => {
    if (!activeInput) return;

    let val = keyboardInput.value;

    if (activeInput.id === "lieferdatum") {
        val = val.replace(/\D/g, "");
        if (val.length === 3) val = "0" + val;
        if (val.length >= 4) val = val.slice(0, 2) + "." + val.slice(2, 4);
        activeInput.value = val;
        keyboardPopup.style.display = "none";
        return;
    }

    // Kommission fertig → direkt Datum-Popup
    activeInput.value = val;
    openKeyboard("lieferdatum");
};

keyboardDelete.onclick = () => {
    keyboardInput.value = keyboardInput.value.slice(0, -1);
};

keyboardClose.onclick = () => {
    keyboardPopup.style.display = "none";
};

/* ============================
   ZEBRA SCAN (DataWedge)
   Erkennung von "K:9876543;D:2412"
   → ohne ENTER nötig (Timeout-Variante)
============================ */
function processScanBuffer() {
    if (!scanBuffer) return;

    const text = scanBuffer.trim();
    scanBuffer = "";

    // Muster K:<irgendwas>;D:<3–4 Ziffern>
    const m = text.match(/K:([^;]+);D:(\d{3,4})/);
    if (!m) return;

    const kom = m[1];
    let raw   = m[2];

    if (raw.length === 3) raw = "0" + raw;
    const dat = raw.slice(0, 2) + "." + raw.slice(2, 4);

    kommission.value  = kom;
    lieferdatum.value = dat;
}

document.addEventListener("keypress", e => {
    if (!isZebra) return;

    scanBuffer += e.key;

    // Nach jedem Zeichen Timer neu setzen.
    if (scanTimeout) clearTimeout(scanTimeout);
    // Nach 80 ms ohne neues Zeichen → Scan fertig
    scanTimeout = setTimeout(processScanBuffer, 80);
});

/* ============================
   DRUCKEN
============================ */
document.getElementById("druckenBtn").onclick = () => {

    if (!kommission.value.trim()) {
        alert("Bitte Kommissionsnummer eingeben!");
        return;
    }
    if (!lieferdatum.value.trim()) {
        alert("Bitte Lieferdatum eingeben!");
        return;
    }

    const data = {
        kommission: kommission.value.trim(),
        lieferdatum: lieferdatum.value.trim(),
        vorgezogen: document.getElementById("chkVorgezogen").checked,
        farbe: currentColor
    };

    const json = JSON.stringify(data);

    if (window.Android && typeof Android.printPaus === "function") {
        Android.printPaus(json);
    } else {
        window.location.href = "paus_druck.html?data=" + encodeURIComponent(json);
    }
};

/* ============================
   ZURÜCK
============================ */
document.getElementById("backBtn").onclick = () => history.back();

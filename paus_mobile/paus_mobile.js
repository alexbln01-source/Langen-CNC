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

/* ============================
   UI ELEMENTE
============================ */
const kommission = document.getElementById("kommission");
const lieferdatum = document.getElementById("lieferdatum");

const openKeyboardBtn = document.getElementById("openKeyboardBtn");
const keyboardPopup = document.getElementById("keyboardPopup");
const keyboardInput = document.getElementById("keyboardInput");
const keyboardKeys = document.getElementById("keyboardKeys");
const keyboardOK = document.getElementById("keyboardOK");
const keyboardDelete = document.getElementById("keyboardDelete");
const keyboardClose = document.getElementById("keyboardClose");

document.getElementById("deviceInfo").textContent =
    isTC22 ? "Gerät: Zebra TC22" :
    isTC21 ? "Gerät: Zebra TC21" :
    isZebra ? "Gerät: Zebra" :
    isMobile ? "Gerät: Mobil" : "Gerät: PC";

/* ============================
   START
============================ */
window.onload = () => {

    kommission.value = "";
    lieferdatum.value = "";

    buildNumber();

    if (isPC) {
        kommission.removeAttribute("readonly");
        lieferdatum.removeAttribute("readonly");
        openKeyboardBtn.style.display = "none";
        return;
    }

    // Zebra darf NICHT schreiben → Popup only
    kommission.readOnly = true;
    lieferdatum.readOnly = true;
    keyboardInput.readOnly = true;

    if (isZebra) kommission.focus();
};

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
   FARBAUSWAHL FIX
============================ */
document.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentColor = btn.dataset.color;
    });
});

/* ============================
   POPUP TASTATUR
============================ */
const NUMBER_KEYS = ["1","2","3","4","5","6","7","8","9","0"];

function renderKeyboard() {
    keyboardKeys.innerHTML = "";
    NUMBER_KEYS.forEach(k => {
        const b = document.createElement("button");
        b.textContent = k;
        b.className = "kb-btn";
        b.onclick = () => keyboardInput.value += k;
        keyboardKeys.appendChild(b);
    });
}
renderKeyboard();

function openKeyboard(id) {
    activeInput = document.getElementById(id);
    keyboardInput.value = activeInput.value;
    keyboardPopup.style.display = "flex";
}

openKeyboardBtn.onclick = () => openKeyboard("kommission");

keyboardOK.onclick = () => {
    if (!activeInput) return;

    let val = keyboardInput.value;

    if (activeInput.id === "lieferdatum") {
        val = val.replace(/\D/g, "");
        if (val.length === 3) val = "0" + val;
        if (val.length >= 4) val = val.slice(0,2) + "." + val.slice(2,4);
        activeInput.value = val;
        keyboardPopup.style.display = "none";
        return;
    }

    activeInput.value = val;
    openKeyboard("lieferdatum");
};

keyboardDelete.onclick = () =>
    keyboardInput.value = keyboardInput.value.slice(0,-1);

keyboardClose.onclick = () =>
    keyboardPopup.style.display = "none";

/* ============================
   SCANNER – ROBUSTER UNIVERSAL-MODUS
============================ */

// 1) ALLE Zeichen einfangen: keypress, keydown & input
function collectScan(char) {
    scanBuffer += char;

    // Neustarten
    if (scanTimeout) clearTimeout(scanTimeout);

    // 50–80 ms Pause → Scan fertig
    scanTimeout = setTimeout(processScan, 70);
}

document.addEventListener("keypress", e => {
    if (isZebra) collectScan(e.key);
});
document.addEventListener("keydown", e => {
    if (isZebra && e.key.length === 1) collectScan(e.key);
});
document.addEventListener("input", e => {
    if (isZebra && e.data) collectScan(e.data);
});

function processScan() {
    const text = scanBuffer.trim();
    scanBuffer = "";

    const m = text.match(/K:([^;]+);D:(\d{3,4})/);
    if (!m) return;

    const kom = m[1];
    let raw = m[2];

    if (raw.length === 3) raw = "0" + raw;
    const dat = raw.substring(0,2) + "." + raw.substring(2,4);

    kommission.value = kom;
    lieferdatum.value = dat;
}

/* ============================
   DRUCKEN
============================ */
document.getElementById("druckenBtn").onclick = () => {

    if (!kommission.value.trim()) return alert("Bitte Kommissionsnummer eingeben!");
    if (!lieferdatum.value.trim()) return alert("Bitte Lieferdatum eingeben!");

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

document.getElementById("backBtn").onclick = () => history.back();

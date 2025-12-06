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

// TC22 (dein Scanner)
const isTC22 = ua.includes("android") && sw === 360 && sh === 720 && dpr === 3;

// Zebra allgemein
const isZebra = isTC21 || isTC22 || ua.includes("zebra");

// Mobile = Android/iOS
const isMobile = /android|iphone|ipad|ipod/i.test(ua);

// PC = alles andere
const isPC = !isZebra && !isMobile;

// CSS Klasse für Layout
if (isPC) document.body.classList.add("pc-device");

/* ============================
   DEVICE INFO & BUILD
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

/* ============================
   STARTVERHALTEN
============================ */
window.onload = () => {

    kommission.value = "";
    lieferdatum.value = "";

    buildNumber();

    if (isPC) {
        // PC: normale Eingabe
        kommission.removeAttribute("readonly");
        lieferdatum.removeAttribute("readonly");
        openKeyboardBtn.style.display = "none";
        return;
    }

    // Zebra / Handy:
    kommission.readOnly = true;
    lieferdatum.readOnly = true;

    kommission.focus();
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
   POPUP KEYBOARD (wie Beschichtung)
============================ */
const KEY_LAYOUT = [
    "1","2","3","4","5",
    "6","7","8","9","0",
    "A","B","C","D","E",
    "F","G","H","I","J",
    "K","L","M","N","O",
    "P","Q","R","S","T",
    "U","V","W","X","Y","Z"
];

function renderKeyboard() {
    keyboardKeys.innerHTML = "";
    KEY_LAYOUT.forEach(k => {
        const b = document.createElement("button");
        b.textContent = k;
        b.onclick = () => keyboardInput.value += k;
        keyboardKeys.appendChild(b);
    });
}

renderKeyboard();

function openKeyboard(id) {
    activeInput = document.getElementById(id);
    keyboardInput.value = activeInput.value;
    keyboardPopup.style.display = "flex";
    setTimeout(() => keyboardInput.focus(), 50);
}

openKeyboardBtn.onclick = () => openKeyboard("kommission");

/* OK gedrückt */
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

    // Kommission → weiter zu Datum
    activeInput.value = val;
    openKeyboard("lieferdatum");
};

/* Delete */
keyboardDelete.onclick = () =>
    keyboardInput.value = keyboardInput.value.slice(0,-1);

/* Close */
keyboardClose.onclick = () =>
    keyboardPopup.style.display = "none";

/* ============================
   ZEBRA SCAN (DataWedge)
============================ */
document.addEventListener("keydown", e => {

    if (!isZebra) return;

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
        }

        scanBuffer = "";
    } else {
        scanBuffer += e.key;
    }
});

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

    // Wenn Android App vorhanden:
    if (window.Android && typeof Android.printPaus === "function") {
        Android.printPaus(json);
    } else {
        window.location.href = "paus_druck.html?data=" + encodeURIComponent(json);
    }
};

document.getElementById("backBtn").onclick = () => history.back();

/* ============================
   Grundvariablen
============================ */
let activeInput = null;
let currentColor = "red";
let scanBuffer = "";

/* Elemente */
const kommission = document.getElementById("kommission");
const lieferdatum = document.getElementById("lieferdatum");
const keyboardPopup = document.getElementById("keyboardPopup");
const keyboardInput = document.getElementById("keyboardInput");
const keyboardTitle = document.getElementById("keyboardTitle");
const keyboardKeys = document.getElementById("keyboardKeys");

const openRow = document.getElementById("openRow");
const deviceInfo = document.getElementById("deviceInfo");

/* ============================
   Gerät erkennen
============================ */
const ua = navigator.userAgent.toLowerCase();
const sw = window.screen.width;
const sh = window.screen.height;
const dpr = window.devicePixelRatio;

const isTC22 = ua.includes("android") && sw === 360 && sh === 720 && dpr === 3;
const isTC21 = ua.includes("android") && sw === 360 && sh === 640;
const isMobile = /android|iphone|ipad|ipod/i.test(ua) && !isTC22 && !isTC21;

if (isTC22) document.body.classList.add("zebra-tc22");
if (isTC21) document.body.classList.add("zebra-tc21");
if (!isMobile && !isTC21 && !isTC22) document.body.classList.add("pc-device");

/* Geräteanzeige */
if (isTC22) deviceInfo.textContent = "Gerät: Zebra TC22";
else if (isTC21) deviceInfo.textContent = "Gerät: Zebra TC21";
else if (isMobile) deviceInfo.textContent = "Gerät: Handy";
else deviceInfo.textContent = "Gerät: PC";

/* ============================
   Startfokus für TC
============================ */
window.onload = () => {
    kommission.value = "";
    lieferdatum.value = "";

    if (isTC22 || isTC21) {
        kommission.readOnly = true;
        lieferdatum.readOnly = true;
        kommission.focus();
    } else {
        kommission.readOnly = false;
        lieferdatum.readOnly = false;
        kommission.focus();
    }
};

/* ============================
   Popup-Tastatur erzeugen
============================ */
function buildKeyboard() {
    keyboardKeys.innerHTML = "";
    const chars = "12345ABCDE67890FGHIJ";

    chars.split("").forEach(c => {
        const b = document.createElement("button");
        b.textContent = c;
        b.onclick = () => keyboardInput.value += c;
        keyboardKeys.appendChild(b);
    });
}
buildKeyboard();

/* ============================
   Tastatur öffnen
============================ */
function openKeyboard(id) {
    activeInput = document.getElementById(id);

    keyboardInput.value = "";
    keyboardTitle.textContent = id === "kommission" ? "Kommissionsnummer" : "Lieferdatum";

    keyboardPopup.style.display = "flex";
    setTimeout(() => keyboardInput.focus(), 80);
}

document.getElementById("openKeyboardBtn").onclick = () => openKeyboard("kommission");

/* ============================
   Tastatur Buttons
============================ */
document.getElementById("keyboardDelete").onclick =
    () => keyboardInput.value = keyboardInput.value.slice(0, -1);

document.getElementById("keyboardClose").onclick =
    () => keyboardPopup.style.display = "none";

document.getElementById("keyboardOK").onclick = () => {

    if (!activeInput) return;

    let val = keyboardInput.value.replace(/\D/g, "");

    // Datum formatieren
    if (activeInput.id === "lieferdatum") {
        if (val.length === 3) val = "0" + val;
        if (val.length >= 4) val = val.slice(0,2) + "." + val.slice(2,4);
        keyboardPopup.style.display = "none";
    } else {
        // von Kommission → Datum springen
        openKeyboard("lieferdatum");
    }

    activeInput.value = val;
};

/* ENTER im Popup */
keyboardInput.addEventListener("keydown", e => {
    if (e.key === "Enter") document.getElementById("keyboardOK").click();
});

/* ============================
   Scanner (TC22 / TC21)
============================ */
document.addEventListener("keydown", e => {

    if (e.key === "Enter") {
        const t = scanBuffer.trim();
        scanBuffer = "";

        if (t.includes("K:") && t.includes("D:")) {
            const kom = t.match(/K:(.*?);/)[1];
            const raw = t.match(/D:(.*)/)[1].replace(/\D/g,"");

            let dat = raw;
            if (dat.length === 3) dat = "0" + dat;
            if (dat.length >= 4) dat = dat.slice(0,2)+"."+dat.slice(2,4);

            kommission.value = kom;
            lieferdatum.value = dat;
        }
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
        kommission: kommission.value,
        lieferdatum: lieferdatum.value,
        vorgezogen: document.getElementById("chkVorgezogen").checked,
        farbe: currentColor
    };

    if (window.Android?.printPaus) {
        Android.printPaus(JSON.stringify(data));
        return;
    }

    window.location.href = "paus_druck.html?data=" +
        encodeURIComponent(JSON.stringify(data));
};

document.getElementById("backBtn").onclick = () => history.back();

/* ============================
   Build-Nummer
============================ */
document.addEventListener("DOMContentLoaded", () => {
    const now = new Date();
    const b =
        now.getFullYear() +
        String(now.getMonth()+1).padStart(2,"0") +
        String(now.getDate()).padStart(2,"0") + "." +
        String(now.getHours()).padStart(2,"0") +
        String(now.getMinutes()).padStart(2,"0");

    const el = document.getElementById("buildInfo");
    if (el) el.textContent = "Build " + b;
});

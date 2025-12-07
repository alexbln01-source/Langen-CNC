/* ============================================================
   ZEBRA SCANNER – 100% zuverlässig (TC21/TC22)
============================================================ */

let scanString = "";
let scanStarted = false;

// BEFOREINPUT → DataWedge blockweise
document.addEventListener("beforeinput", e => {
    if (e.inputType === "insertText") {
        scanStarted = true;
        scanString += e.data ?? "";
    }
});

// KEYPRESS → fallback
document.addEventListener("keypress", e => {
    scanStarted = true;
    scanString += e.key;
});

// ENTER = Scan abgeschlossen → auswerten
document.addEventListener("keydown", e => {

    if (e.key !== "Enter" || !scanStarted) return;

    scanStarted = false;
    const text = scanString.trim();
    scanString = "";

    console.log("SCAN:", text);

    const k = text.match(/K:([^;]+)/);
    const d = text.match(/D:(\d+)/);

    if (!k || !d) return;

    const kom = k[1];
    let dat = d[1];

    if (dat.length === 3) dat = "0" + dat;
    if (dat.length >= 4) dat = dat.slice(0,2) + "." + dat.slice(2,4);

    document.getElementById("kommission").value = kom;
    document.getElementById("lieferdatum").value = dat;
    document.getElementById("kommission").focus();
});

/* ============================================================
   DEVICE DETECTION
============================================================ */
const ua = navigator.userAgent.toLowerCase();
const sw = window.screen.width;
const sh = window.screen.height;
const dpr = window.devicePixelRatio;

const isTC22 = ua.includes("android") && sw === 360 && sh === 720 && dpr === 3;
const isTC21 = ua.includes("android") && sw === 360 && sh === 640;
const isZebra = isTC22 || isTC21 || ua.includes("zebra");
const isMobile = /android|iphone|ipad|ipod/i.test(ua);
const isPC = !isZebra && !isMobile;

if (isPC) document.body.classList.add("pc-device");

/* ============================================================
   DOM ELEMENTE
============================================================ */
const kommission = document.getElementById("kommission");
const lieferdatum = document.getElementById("lieferdatum");
const openKeyboardBtn = document.getElementById("openKeyboardBtn");
const keyboardPopup = document.getElementById("keyboardPopup");
const keyboardInput = document.getElementById("keyboardInput");
const keyboardKeys = document.getElementById("keyboardKeys");
const keyboardOK = document.getElementById("keyboardOK");
const keyboardDelete = document.getElementById("keyboardDelete");
const keyboardClose = document.getElementById("keyboardClose");

let activeInput = null;

/* ============================================================
   START
============================================================ */
window.onload = () => {

    kommission.value = "";
    lieferdatum.value = "";

    if (!isPC) {
        // Android Tastatur ausschalten
        [kommission, lieferdatum, keyboardInput].forEach(inp => {
            inp.setAttribute("inputmode", "none");
            inp.setAttribute("autocomplete", "off");
            inp.setAttribute("autocorrect", "off");
            inp.setAttribute("autocapitalize", "off");
            inp.setAttribute("spellcheck", "false");
        });
    } else {
        kommission.removeAttribute("readonly");
        lieferdatum.removeAttribute("readonly");
    }

    if (isZebra) kommission.focus();
};

/* ============================================================
   FARBEN
============================================================ */
document.querySelectorAll(".color-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    };
});

/* ============================================================
   POPUP TASTATUR
============================================================ */
const NUM_KEYS = ["1","2","3","4","5","6","7","8","9","0"];

function renderKeyboard() {
    keyboardKeys.innerHTML = "";
    NUM_KEYS.forEach(k => {
        const b = document.createElement("button");
        b.textContent = k;
        b.onclick = () => keyboardInput.value += k;
        keyboardKeys.appendChild(b);
    });
}
renderKeyboard();

openKeyboardBtn.onclick = () => openKeyboard("kommission");

function openKeyboard(id) {
    activeInput = document.getElementById(id);
    keyboardInput.value = activeInput.value;
    keyboardPopup.style.display = "flex";
    setTimeout(() => keyboardInput.focus(), 20);
}

keyboardOK.onclick = () => {
    let val = keyboardInput.value;

    if (activeInput.id === "lieferdatum") {
        val = val.replace(/\D/g, "");
        if (val.length === 3) val = "0" + val;
        if (val.length >= 4) val = val.slice(0,2) + "." + val.slice(2,4);
        keyboardPopup.style.display = "none";
    } else {
        openKeyboard("lieferdatum");
    }

    activeInput.value = val;
};

keyboardDelete.onclick = () =>
    keyboardInput.value = keyboardInput.value.slice(0, -1);

keyboardClose.onclick = () =>
    keyboardPopup.style.display = "none";

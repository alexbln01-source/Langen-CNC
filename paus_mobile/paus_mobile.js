let activeInput = null;
let currentColor = "red";

/* ============================================================
   BLINK-FUNKTION
============================================================ */
function setBlink(el) {
    kommission.classList.remove("input-blink");
    lieferdatum.classList.remove("input-blink");
    if (el) el.classList.add("input-blink");
}

/* ============================================================
   DEVICE DETECTION
============================================================ */
const ua = navigator.userAgent.toLowerCase();
const sw = screen.width;
const sh = screen.height;
const dpr = devicePixelRatio;

const isTC21 = ua.includes("android") && sw === 360 && sh === 640;
const isTC22 = ua.includes("android") && sw === 360 && sh === 720 && dpr === 3;
const isZebra = isTC21 || isTC22 || ua.includes("zebra");
const isMobile = /android|iphone|ipad|ipod/i.test(ua);
const isPC     = !isZebra && !isMobile;

/* PC = normale Tastatur */
if (isPC) document.body.classList.add("pc-device");

/* ============================================================
   ELEMENTE
============================================================ */
const kommission     = document.getElementById("kommission");
const lieferdatum    = document.getElementById("lieferdatum");

const keyboardPopup  = document.getElementById("keyboardPopup");
const keyboardInput  = document.getElementById("keyboardInput");
const keyboardKeys   = document.getElementById("keyboardKeys");
const keyboardOK     = document.getElementById("keyboardOK");
const keyboardDelete = document.getElementById("keyboardDelete");
const keyboardClose  = document.getElementById("keyboardClose");
const openKeyboardBtn = document.getElementById("openKeyboardBtn");

/* ============================================================
   STARTVERHALTEN
============================================================ */
window.onload = () => {

    kommission.value = "";
    lieferdatum.value = "";

    buildNumber();

    if (isPC) {
        kommission.removeAttribute("readonly");
        lieferdatum.removeAttribute("readonly");
        return;
    }

    // Zebra → verhindert Android Tastatur
    [kommission, lieferdatum].forEach(inp => {
        inp.readOnly = true;
        inp.setAttribute("inputmode","none");
    });

    kommission.focus();
    setBlink(kommission);
};

/* ============================================================
   BUILD INFO
============================================================ */
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

/* ============================================================
   FARBBUTTONS
============================================================ */
document.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".color-btn")
            .forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentColor = btn.dataset.color;
    });
});

/* ============================================================
   POPUP KEYBOARD (NUMPAD)
============================================================ */
const NUMBER_KEYS = ["1","2","3","4","5","6","7","8","9","0"];

function renderKeyboard() {
    keyboardKeys.innerHTML = "";
    NUMBER_KEYS.forEach(k => {
        const b = document.createElement("button");
        b.textContent = k;
        b.onclick = () => keyboardInput.value += k;
        keyboardKeys.appendChild(b);
    });
}
renderKeyboard();

function openKeyboard(id) {
    activeInput = document.getElementById(id);

    // Popup → kein Blink!
    kommission.classList.remove("input-blink");
    lieferdatum.classList.remove("input-blink");

    keyboardInput.value = activeInput.value;
    keyboardPopup.style.display = "flex";
    setTimeout(() => keyboardInput.focus(), 30);
}

openKeyboardBtn.onclick = () => openKeyboard("kommission");

keyboardOK.onclick = () => {
    if (!activeInput) return;

    let v = keyboardInput.value;

    if (activeInput.id === "lieferdatum") {
        v = v.replace(/\D/g,"");
        if (v.length === 3) v = "0"+v;
        if (v.length >= 4) v = v.slice(0,2)+"."+v.slice(2,4);
        activeInput.value = v;

        keyboardPopup.style.display = "none";
        setBlink(lieferdatum);
        lieferdatum.focus();
        return;
    }

    activeInput.value = v;
    openKeyboard("lieferdatum");
};

keyboardDelete.onclick = () =>
    keyboardInput.value = keyboardInput.value.slice(0,-1);

keyboardClose.onclick = () => {
    keyboardPopup.style.display = "none";
    setBlink(kommission);
    kommission.focus();
};

/* ============================================================
   ZEBRA SCANNER – FINAL VERSION
============================================================ */
let scanData = "";
let isScanning = false;

// BEFOREINPUT → komplette Scan-Daten
document.addEventListener("beforeinput", e => {
    if (!isZebra) return;
    if (e.inputType === "insertText") {
        isScanning = true;
        scanData += e.data ?? "";
    }
});

// ENTER = Scan komplett
document.addEventListener("keydown", e => {

    if (!isZebra) return;

    if (e.key === "Enter" && isScanning) {

        const text = scanData.trim();
        scanData = "";
        isScanning = false;

        if (!text.includes("K:") || !text.includes("D:")) return;

        const kom = text.match(/K:(.*?);/)[1];
        let dat  = text.match(/D:(.*)/)[1].replace(/\D/g,"");

        if (dat.length === 3) dat = "0"+dat;
        if (dat.length >= 4) dat = dat.slice(0,2)+"."+dat.slice(2,4);

        kommission.value = kom;
        lieferdatum.value = dat;

        setBlink(lieferdatum);
        lieferdatum.focus();
    }
});

/* ============================================================
   DRUCKEN
============================================================ */
document.getElementById("druckenBtn").onclick = () => {

    if (!kommission.value.trim()) return alert("Bitte Kommissionsnummer eingeben!");
    if (!lieferdatum.value.trim()) return alert("Bitte Lieferdatum eingeben!");

    const data = {
        kommission: kommission.value,
        lieferdatum: lieferdatum.value,
        vorgezogen: document.getElementById("chkVorgezogen").checked,
        farbe: currentColor
    };

    const json = JSON.stringify(data);

    if (window.Android && Android.printPaus)
        Android.printPaus(json);
    else
        location.href = "paus_druck.html?data=" + encodeURIComponent(json);
};

document.getElementById("backBtn").onclick = () => history.back();

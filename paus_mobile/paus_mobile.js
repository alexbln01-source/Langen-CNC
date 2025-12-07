let activeInput = null;
let currentColor = "red";

/* ============================
   DEVICE DETECTION
============================ */
const ua = navigator.userAgent.toLowerCase();
const sw = screen.width;
const sh = screen.height;
const dpr = devicePixelRatio;

const isTC21 = ua.includes("android") && sw === 360 && sh === 640;
const isTC22 = ua.includes("android") && sw === 360 && sh === 720 && dpr === 3;
const isZebra = isTC21 || isTC22 || ua.includes("zebra");
const isMobile = /android|iphone|ipad|ipod/i.test(ua);
const isPC = !isZebra && !isMobile;

if (isPC) document.body.classList.add("pc-device");

/* ============================
   ELEMENTE
============================ */
const kommission = document.getElementById("kommission");
const lieferdatum = document.getElementById("lieferdatum");

const keyboardPopup = document.getElementById("keyboardPopup");
const openKeyboardBtn = document.getElementById("openKeyboardBtn");
const keyboardInput = document.getElementById("keyboardInput");
const keyboardKeys = document.getElementById("keyboardKeys");
const keyboardOK = document.getElementById("keyboardOK");
const keyboardDelete = document.getElementById("keyboardDelete");
const keyboardClose = document.getElementById("keyboardClose");

const buildInfo = document.getElementById("buildInfo");
const deviceInfo = document.getElementById("deviceInfo");

/* ============================
   BUILD
============================ */
function buildNumber() {
    const d = new Date(document.lastModified);
    const s =
        d.getFullYear() + "-" +
        String(d.getMonth()+1).padStart(2,"0") + "-" +
        String(d.getDate()).padStart(2,"0") + "." +
        String(d.getHours()).padStart(2,"0") +
        String(d.getMinutes()).padStart(2,"0");
    buildInfo.textContent = "Build " + s;
}

/* ============================
   START BEHAVIOR
============================ */
window.onload = () => {

    kommission.value = "";
    lieferdatum.value = "";

    buildNumber();

    deviceInfo.textContent =
        isTC22 ? "Gerät: Zebra TC22" :
        isTC21 ? "Gerät: Zebra TC21" :
        isZebra ? "Gerät: Zebra" :
        isPC ? "Gerät: PC" : "Gerät: Mobil";

    if (isPC) {
        kommission.removeAttribute("readonly");
        lieferdatum.removeAttribute("readonly");
        openKeyboardBtn.style.display = "none";
        return;
    }

    // Zebra / Handy → Android Tastatur komplett blockieren
    [kommission, lieferdatum].forEach(inp => {
        inp.readOnly = true;
        inp.setAttribute("inputmode", "none");
        inp.setAttribute("autocomplete", "off");
        inp.setAttribute("autocorrect", "off");
        inp.setAttribute("autocapitalize", "off");
        inp.setAttribute("spellcheck", "false");
    });

    kommission.focus();
};

/* ============================
   COLOR SELECTION
============================ */
document.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentColor = btn.dataset.color;
    });
});

/* ============================
   POPUP KEYBOARD
============================ */
const NUMBER_KEYS = ["1","2","3","4","5","6","7","8","9","0"];

function renderKeyboard() {
    keyboardKeys.innerHTML = "";
    NUMBER_KEYS.forEach(k => {
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
    setTimeout(() => keyboardInput.focus(), 50);
}

openKeyboardBtn.onclick = () => openKeyboard("kommission");

keyboardOK.onclick = () => {
    if (!activeInput) return;
    let v = keyboardInput.value;

    if (activeInput.id === "lieferdatum") {
        v = v.replace(/\D/g, "");
        if (v.length === 3) v = "0" + v;
        if (v.length >= 4) v = v.slice(0,2) + "." + v.slice(2,4);
        activeInput.value = v;
        keyboardPopup.style.display = "none";
    } else {
        activeInput.value = v;
        openKeyboard("lieferdatum");
    }
};

keyboardDelete.onclick = () =>
    keyboardInput.value = keyboardInput.value.slice(0, -1);

keyboardClose.onclick = () =>
    keyboardPopup.style.display = "none";

/* =============================
   UNIVERSAL ZEBRA SCANNER
============================= */

let scanData = "";

// 1) Fängt key-by-key ankommende Scannerzeichen ab
document.addEventListener("keypress", e => {
    if (!isZebra) return;
    scanData += e.key;
});

// 2) Fängt komplette Strings ab (DataWedge "Basic Data" Mode)
document.addEventListener("beforeinput", e => {
    if (!isZebra) return;
    if (e.inputType === "insertText") {
        scanData += e.data ?? "";
    }
});

// 3) ENTER → Scan auswerten
document.addEventListener("keydown", e => {

    if (!isZebra) return;

    if (e.key !== "Enter") return;

    const text = scanData.trim();
    scanData = "";

    console.log("SCAN EMPFANGEN:", text);

    if (!text.includes("K:") || !text.includes("D:")) {
        console.warn("Scan-Format unpassend:", text);
        return;
    }

    const komMatch = text.match(/K:(.*?);/);
    const dMatch = text.match(/D:(.*)/);

    if (!komMatch || !dMatch) return;

    const kom = komMatch[1];
    let dat = dMatch[1].replace(/\D/g, "");

    if (dat.length === 3) dat = "0" + dat;
    if (dat.length >= 4) dat = dat.slice(0,2) + "." + dat.slice(2,4);

    kommission.value = kom;
    lieferdatum.value = dat;

    kommission.focus();
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

    const json = JSON.stringify(data);

    if (window.Android && Android.printPaus)
        Android.printPaus(json);
    else
        location.href = "paus_druck.html?data=" + encodeURIComponent(json);
};

document.getElementById("backBtn").onclick = () => history.back();

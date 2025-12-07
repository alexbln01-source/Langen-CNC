let scanString = "";
let scanStarted = false;
let activeInput = null;

/* ============================================================
   DEVICE DETECTION
============================================================ */
const ua  = navigator.userAgent.toLowerCase();
const sw  = window.screen.width;
const sh  = window.screen.height;
const dpr = window.devicePixelRatio;

const isTC22  = ua.includes("android") && sw === 360 && sh === 720 && dpr === 3;
const isTC21  = ua.includes("android") && sw === 360 && sh === 640;
const isZebra = isTC22 || isTC21 || ua.includes("zebra");
const isMobile = /android|iphone|ipad|ipod/.test(ua);
const isPC     = !isZebra && !isMobile;

/* ============================================================
   DOM ELEMENTE
============================================================ */
const kommission     = document.getElementById("kommission");
const lieferdatum    = document.getElementById("lieferdatum");

const openKeyboardBtn = document.getElementById("openKeyboardBtn");
const keyboardPopup   = document.getElementById("keyboardPopup");
const keyboardInput   = document.getElementById("keyboardInput");
const keyboardKeys    = document.getElementById("keyboardKeys");
const keyboardOK      = document.getElementById("keyboardOK");
const keyboardDelete  = document.getElementById("keyboardDelete");
const keyboardClose   = document.getElementById("keyboardClose");

const druckenBtn = document.getElementById("druckenBtn");
const backBtn    = document.getElementById("backBtn");
const deviceInfo = document.getElementById("deviceInfo");
const buildInfo  = document.getElementById("buildInfo");

/* Device-Text */
deviceInfo.textContent =
    isTC22 ? "Gerät: Zebra TC22" :
    isTC21 ? "Gerät: Zebra TC21" :
    isZebra ? "Gerät: Zebra" :
    isMobile ? "Gerät: Mobil" : "Gerät: PC";

/* PC-Layout */
if (isPC) document.body.classList.add("pc-device");


/* ============================================================
   START
============================================================ */
window.onload = () => {

    kommission.value  = "";
    lieferdatum.value = "";

    buildNumber();

    if (!isPC) {
        // Android-Tastatur ausschalten, aber Cursor sichtbar lassen
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

    // TC-Scanner: gleich im Kommissionsfeld blinken
    if (isZebra) kommission.focus();

    /* Buttons unten */
    backBtn.onclick = () => history.back();

    druckenBtn.onclick = () => {
        if (!kommission.value.trim())  return alert("Bitte Kommissionsnummer eingeben!");
        if (!lieferdatum.value.trim()) return alert("Bitte Lieferdatum eingeben!");

        const data = {
            kommission : kommission.value.trim(),
            lieferdatum: lieferdatum.value.trim(),
            vorgezogen : document.getElementById("chkVorgezogen").checked,
            farbe      : document.querySelector(".color-btn.active").dataset.color
        };

        const json = JSON.stringify(data);

        if (window.Android && Android.printPaus) {
            Android.printPaus(json);
        } else {
            location.href = "paus_druck.html?data=" + encodeURIComponent(json);
        }
    };
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

    buildInfo.textContent = "Build " + stamp;
}


/* ============================================================
   FARBWAHL
============================================================ */
document.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});


/* ============================================================
   POPUP TASTATUR (nur über Button öffnen)
============================================================ */
const NUM_KEYS = ["1","2","3","4","5","6","7","8","9","0"];

function renderKeyboard() {
    keyboardKeys.innerHTML = "";
    NUM_KEYS.forEach(k => {
        const b = document.createElement("button");
        b.textContent = k;
        b.type = "button";
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
    if (!activeInput) return;

    let val = keyboardInput.value;

    if (activeInput.id === "lieferdatum") {
        val = val.replace(/\D/g, "");
        if (val.length === 3)  val = "0" + val;
        if (val.length >= 4)  val = val.slice(0,2) + "." + val.slice(2,4);
        keyboardPopup.style.display = "none";
    } else {
        // erst Kommission setzen, dann Popup sofort für Datum öffnen
        activeInput.value = val;
        openKeyboard("lieferdatum");
        return;
    }

    activeInput.value = val;
};

keyboardDelete.onclick = () =>
    keyboardInput.value = keyboardInput.value.slice(0,-1);

keyboardClose.onclick = () =>
    keyboardPopup.style.display = "none";


/* ============================================================
   ZEBRA SCANNER – FIXED VERSION (trennt IMMER K und D)
============================================================ */

let scanString = "";
let scanStarted = false;

// beforeinput -> DataWedge liefert Textblöcke
document.addEventListener("beforeinput", e => {
    if (e.inputType === "insertText") {
        scanStarted = true;
        scanString += e.data ?? "";
    }
});

// keypress -> fallback
document.addEventListener("keypress", e => {
    scanStarted = true;
    scanString += e.key;
});

// ENTER = Scan fertig
document.addEventListener("keydown", e => {

    if (e.key !== "Enter" || !scanStarted) return;

    scanStarted = false;
    let text = scanString.trim();
    scanString = "";

    console.log("SCAN:", text);

    // --- EXAKTE Muster extrahieren ---
    const komMatch = text.match(/K:([^;]+)/i);
    const datMatch = text.match(/D:([0-9]+)/i);

    if (!komMatch || !datMatch) {
        console.warn("Scan konnte nicht geparst werden:", text);
        return;
    }

    let kom = komMatch[1];     // z.B. 2148416
    let dat = datMatch[1];     // z.B. 1212

    // Datum TT.MM formatieren
    if (dat.length === 3) dat = "0" + dat;
    if (dat.length >= 4) dat = dat.slice(0,2) + "." + dat.slice(2,4);

    // Felder korrekt befüllen
    document.getElementById("kommission").value = kom;
    document.getElementById("lieferdatum").value = dat;

    // FOKUS wieder auf Kommission
    document.getElementById("kommission").focus();
});

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
const keyboardInput = document.getElementById("keyboardInput");
const keyboardKeys = document.getElementById("keyboardKeys");
const keyboardOK = document.getElementById("keyboardOK");
const keyboardDelete = document.getElementById("keyboardDelete");
const keyboardClose = document.getElementById("keyboardClose");
const openKeyboardBtn = document.getElementById("openKeyboardBtn");

/* ============================
   INITIAL START        
============================ */
window.onload = () => {

    kommission.value = "";
    lieferdatum.value = "";

    if (isPC) {
        kommission.removeAttribute("readonly");
        lieferdatum.removeAttribute("readonly");
        openKeyboardBtn.style.display = "none";
        return;
    }

    // 🚫 WICHTIG — Android-Tastatur verhindern
    kommission.readOnly = true;
    lieferdatum.readOnly = true;

    if (isZebra) kommission.focus();

    buildNumber();
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
   POPUP ZAHLENTASTATUR
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

    // 🚫 WICHTIG → damit Android-Tastatur NICHT aufgeht
    setTimeout(() => keyboardInput.focus(), 50);
}

openKeyboardBtn.onclick = () => openKeyboard("kommission");

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

    // Kommission fertig → weiter zum Datum
    activeInput.value = val;
    openKeyboard("lieferdatum");
};

keyboardDelete.onclick = () =>
    keyboardInput.value = keyboardInput.value.slice(0, -1);

keyboardClose.onclick = () =>
    keyboardPopup.style.display = "none";

/* ============================
   ZEBRA SCAN (DataWedge - ohne ENTER!)
============================ */
document.addEventListener("keypress", e => {
    if (!isZebra) return;

    // Zeichen sammeln
    scanBuffer += e.key;

    // Trigger: Wir haben ein Semikolon → könnte Paket sein
    if (e.key === ";") {

        // Prüfen ob vollständiges Paket drin ist
        if (scanBuffer.includes("K:") && scanBuffer.includes("D:")) {

            const komMatch = scanBuffer.match(/K:(.*?);/);
            const dMatch = scanBuffer.match(/D:(\d+)/);

            if (komMatch && dMatch) {

                const kom = komMatch[1];
                let raw = dMatch[1];

                // Datum formatieren
                if (raw.length === 3) raw = "0" + raw;
                if (raw.length >= 4) raw = raw.slice(0,2) + "." + raw.slice(2,4);

                kommission.value = kom;
                lieferdatum.value = raw;
            }

            // Buffer leeren nach Verarbeitung
            scanBuffer = "";
        }
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

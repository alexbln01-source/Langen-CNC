let activeInput = null;
let currentColor = "red";
let scanBuffer = "";

/* ========================================
   Gerät erkennen
========================================= */
function detectDevice() {
    const ua = navigator.userAgent;

    const sw = window.screen.width;
    const sh = window.screen.height;
    const dpr = window.devicePixelRatio;

    const isTC22 = /Zebra|TC22/.test(ua) || (sw === 360 && sh === 720 && dpr === 3);
    const isTC21 = /TC21/.test(ua);

    if (isTC21 || isTC22) return "tc";

    if (/Android|iPhone|iPad|iPod/i.test(ua)) return "mobile";

    return "pc";
}

const device = detectDevice();

/* === Klassen hinzufügen === */
if (device === "pc") document.body.classList.add("pc-device");
else document.body.classList.add("tc-device");

/* === Device Info anzeigen === */
document.getElementById("deviceInfo").textContent =
    "Gerät: " + (device === "pc" ? "PC" : device === "tc" ? "Zebra TC" : "Mobile");

/* === Build Info === */
document.getElementById("buildInfo").textContent =
    "Build " + new Date().toISOString().replace(/[T:]/g, "").slice(0, 12);

/* ========================================
   Felder vorbereiten
========================================= */
const kom = document.getElementById("kommission");
const dat = document.getElementById("lieferdatum");

kom.readOnly = true;
dat.readOnly = true;

/* TC → Cursor sofort im Kommissionsfeld */
if (device === "tc") {
    setTimeout(() => { kom.blur(); }, 300);
}

/* ========================================
   Popup Tastatur öffnen
========================================= */
function openKeyboard(inputField) {
    activeInput = inputField;

    document.getElementById("keyboardPopup").style.display = "flex";
    document.getElementById("keyboardInput").value = "";
    document.getElementById("keyboardTitle").textContent =
        inputField.id === "kommission" ? "Kommissionsnummer" : "Lieferdatum";

    setTimeout(() => {
        document.getElementById("keyboardInput").focus();
    }, 100);
}

/* === Button "Tastatur öffnen" === */
document.getElementById("openKeyboardBtn").onclick = () => openKeyboard(kom);

/* ========================================
   Popup Tastatur Logik
========================================= */
document.getElementById("keyboardDelete").onclick = () => {
    const inp = document.getElementById("keyboardInput");
    inp.value = inp.value.slice(0, -1);
};

document.getElementById("keyboardOK").onclick = () => {
    const inp = document.getElementById("keyboardInput");

    if (activeInput.id === "lieferdatum") {
        let v = inp.value.replace(/\D/g, "");
        if (v.length === 3) v = "0" + v;
        if (v.length >= 4) v = v.slice(0, 2) + "." + v.slice(2, 4);
        activeInput.value = v;
        document.getElementById("keyboardPopup").style.display = "none";
        return;
    }

    // Kommission → danach automatisch Datum
    activeInput.value = inp.value;
    openKeyboard(dat);
};

document.getElementById("keyboardClose").onclick = () => {
    document.getElementById("keyboardPopup").style.display = "none";
};

/* ========================================
   Zebra Scanner
========================================= */
document.addEventListener("keydown", e => {

    if (device !== "tc") return; // nur Zebra Scanner

    if (e.key === "Enter") {

        const s = scanBuffer.trim();
        scanBuffer = "";

        if (s.includes("K:") && s.includes("D:")) {

            const komNr = s.match(/K:(.*?);/)[1];
            const raw = s.match(/D:(.*)/)[1].replace(/\D/g, "");

            let datStr = raw;
            if (datStr.length === 3) datStr = "0" + datStr;
            if (datStr.length >= 4)
                datStr = datStr.slice(0, 2) + "." + datStr.slice(2, 4);

            kom.value = komNr;
            dat.value = datStr;
        }
    } else {
        scanBuffer += e.key;
    }
});

/* ========================================
   Drucken
========================================= */
document.getElementById("druckenBtn").onclick = () => {
    if (!kom.value.trim()) return alert("Bitte Kommissionsnummer eingeben!");
    if (!dat.value.trim()) return alert("Bitte Lieferdatum eingeben!");

    const data = {
        kommission: kom.value,
        lieferdatum: dat.value,
        vorgezogen: document.getElementById("chkVorgezogen").checked,
        farbe: currentColor
    };

    window.location.href =
        "paus_druck.html?data=" + encodeURIComponent(JSON.stringify(data));
};

document.getElementById("backBtn").onclick = () => history.back();

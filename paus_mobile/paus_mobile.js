/* ============================================================
   GLOBAL
============================================================ */
let activeInput = null;
let currentColor = "red";
let scanBuffer = "";

/* ============================================================
   DEVICE DETECTION
============================================================ */
const ua = navigator.userAgent.toLowerCase();
const sw = window.screen.width;
const sh = window.screen.height;
const dpr = window.devicePixelRatio;

const isMobile = /android|iphone|ipad|ipod/.test(ua);
const isZebraTC21 = ua.includes("zebra") || (sw === 360 && sh === 640);
const isZebraTC22 = ua.includes("zebra") || (sw === 360 && sh === 720 && dpr === 3);

if (!isMobile && !isZebraTC21 && !isZebraTC22) {
    document.body.classList.add("pc-device");   // wichtig für CSS
}

/* Geräteanzeige */
const deviceInfo = document.getElementById("deviceInfo");
if (deviceInfo) {
    if (isZebraTC22) deviceInfo.textContent = "Gerät: Zebra TC22";
    else if (isZebraTC21) deviceInfo.textContent = "Gerät: Zebra TC21";
    else if (isMobile) deviceInfo.textContent = "Gerät: Mobilgerät";
    else deviceInfo.textContent = "Gerät: PC";
}

/* Build Info */
const buildInfo = document.getElementById("buildInfo");
if (buildInfo) {
    const d = new Date(document.lastModified);
    const b = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}.${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}`;
    buildInfo.textContent = "Build " + b;
}

/* ============================================================
   ELEMENTE
============================================================ */
const kommission = document.getElementById("kommission");
const lieferdatum = document.getElementById("lieferdatum");

const keyboardPopup = document.getElementById("keyboardPopup");
const keyboardInput = document.getElementById("keyboardInput");
const keyboardTitle = document.getElementById("keyboardTitle");

const keyboardDelete = document.getElementById("keyboardDelete");
const keyboardClose = document.getElementById("keyboardClose");
const keyboardOK = document.getElementById("keyboardOK");

/* ============================================================
   INITIALISIERUNG
============================================================ */
window.onload = () => {
    kommission.value = "";
    lieferdatum.value = "";

    // TC Geräte → Cursor sofort im Kommissionsfeld
    if (isZebraTC21 || isZebraTC22) {
        kommission.focus();
    }

    // PC → Eingabe frei
    if (document.body.classList.contains("pc-device")) {
        kommission.removeAttribute("readonly");
        lieferdatum.removeAttribute("readonly");
    }
};

/* ============================================================
   POPUP KEYBOARD
============================================================ */
function openKeyboardFor(id) {
    activeInput = document.getElementById(id);

    keyboardPopup.style.display = "flex";

    keyboardTitle.textContent =
        id === "kommission" ? "Kommissionsnummer" : "Lieferdatum";

    keyboardInput.value = activeInput.value;

    setTimeout(() => keyboardInput.focus(), 50);
}

/* Button „Tastatur öffnen“ → immer Kommission */
document.getElementById("openKeyboardBtn").onclick = () => {
    openKeyboardFor("kommission");
};

/* Close */
keyboardClose.onclick = () => {
    keyboardPopup.style.display = "none";
};

/* Delete */
keyboardDelete.onclick = () => {
    keyboardInput.value = keyboardInput.value.slice(0, -1);
};

/* OK gedrückt */
keyboardOK.onclick = () => {
    let val = keyboardInput.value.replace(/\D/g, "");

    /* ------- Kommission OK ------- */
    if (activeInput.id === "kommission") {

        kommission.value = val;

        // Direkt zur Datumseingabe → Tastatur bleibt offen
        openKeyboardFor("lieferdatum");
        return;
    }

    /* ------- Datum OK ------- */
    if (activeInput.id === "lieferdatum") {

        if (val.length === 3) val = "0" + val;
        if (val.length >= 4) val = val.slice(0, 2) + "." + val.slice(2, 4);

        lieferdatum.value = val;

        // Popup schließen
        keyboardPopup.style.display = "none";
        return;
    }
};

/* Enter im Popup = OK */
keyboardInput.addEventListener("keydown", e => {
    if (e.key === "Enter") keyboardOK.onclick();
});

/* ============================================================
   DATUM → PC Formatierung
============================================================ */
lieferdatum.addEventListener("blur", () => {

    if (!lieferdatum.value) return;

    let v = lieferdatum.value.replace(/\D/g, "");

    if (v.length === 3) v = "0" + v;
    if (v.length >= 4) v = v.slice(0, 2) + "." + v.slice(2, 4);

    lieferdatum.value = v;
});

/* ============================================================
   FARBWAHL
============================================================ */
document.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentColor = btn.dataset.color;
    });
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
        vorgezogen: chkVorgezogen.checked,
        farbe: currentColor
    };

    const json = JSON.stringify(data);

    // Zebra / Android
    if (window.Android && typeof Android.printPaus === "function") {
        Android.printPaus(json);
        return;
    }

    // Browser
    window.location.href = "paus_druck.html?data=" + encodeURIComponent(json);
};

/* ============================================================
   ZURÜCK
============================================================ */
document.getElementById("backBtn").onclick = () => history.back();

/* ============================================================
   BARCODE-SCANNER (Zebra)
============================================================ */
document.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        let text = scanBuffer.trim();

        if (text.includes("K:") && text.includes("D:")) {

            const kom = text.match(/K:(.*?);/)[1];
            const raw = text.match(/D:(.*)/)[1].replace(/\D/g, "");

            let dat = raw;
            if (dat.length === 3) dat = "0" + dat;
            if (dat.length >= 4) dat = dat.slice(0, 2) + "." + dat.slice(2, 4);

            kommission.value = kom;
            lieferdatum.value = dat;
        }

        scanBuffer = "";
    } else {
        scanBuffer += e.key;
    }
});

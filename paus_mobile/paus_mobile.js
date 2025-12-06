/* =====================================================================
   GERÄTE ERKENNEN
===================================================================== */
const ua = navigator.userAgent.toLowerCase();
const sw = window.screen.width;
const sh = window.screen.height;
const dpr = window.devicePixelRatio;

const isMobile = /android|iphone|ipad|ipod/.test(ua);
const isZebra = /zebra|tc21|tc22|tc26/.test(ua);
const isTC21 = isZebra || (sw === 360 && sh === 640);
const isTC22 = isZebra || (sw === 360 && sh === 720 && dpr === 3);

if (!isMobile) document.body.classList.add("pc-device");
if (isTC21) document.body.classList.add("tc21");
if (isTC22) document.body.classList.add("tc22");

/* Device Info oben */
const deviceInfo = document.getElementById("deviceInfo");
if (deviceInfo) {
    if (isTC22) deviceInfo.textContent = "Zebra TC22";
    else if (isTC21) deviceInfo.textContent = "Zebra TC21";
    else if (isMobile) deviceInfo.textContent = "Android";
    else deviceInfo.textContent = "PC";
}

/* =====================================================================
   REFERENZEN
===================================================================== */
const kommission = document.getElementById("kommission");
const lieferdatum = document.getElementById("lieferdatum");

const popup = document.getElementById("keyboardPopup");
const popupInput = document.getElementById("keyboardInput");
const popupTitle = document.getElementById("keyboardTitle");

let activeField = null;

/* =====================================================================
   STARTVERHALTEN
===================================================================== */
window.onload = () => {

    // Felder immer readonly (Popup verhindert Android-Tastatur)
    kommission.setAttribute("readonly", true);
    lieferdatum.setAttribute("readonly", true);

    // PC – normale Eingabe
    if (document.body.classList.contains("pc-device")) {
        kommission.removeAttribute("readonly");
        lieferdatum.removeAttribute("readonly");
    }

    // TC → immer Kommission aktiv
    if (isTC21 || isTC22) {
        kommission.focus();
    }

    kommission.value = "";
    lieferdatum.value = "";
};

/* =====================================================================
   POPUP TASTATUR
===================================================================== */
function openPopup(inputName) {
    activeField = inputName;
    popup.style.display = "flex";

    popupTitle.textContent = inputName === "kommission"
        ? "Kommissionsnummer"
        : "Lieferdatum";

    popupInput.value = "";
    setTimeout(() => popupInput.focus(), 50);
}

document.getElementById("openKeyboardBtn").onclick = () => {
    openPopup("kommission");
};

document.getElementById("keyboardClose").onclick = () => {
    popup.style.display = "none";
};

document.getElementById("keyboardDelete").onclick = () => {
    popupInput.value = popupInput.value.slice(0, -1);
};

document.getElementById("keyboardOK").onclick = () => {

    let val = popupInput.value.replace(/\D/g, "");

    if (activeField === "kommission") {
        kommission.value = val;
        openPopup("datum");
        return;
    }

    if (activeField === "datum") {
        if (val.length === 3) val = "0" + val;
        if (val.length >= 4) val = val.slice(0,2) + "." + val.slice(2,4);

        lieferdatum.value = val;
        popup.style.display = "none";
    }
};

popupInput.onkeydown = e => {
    if (e.key === "Enter") document.getElementById("keyboardOK").click();
};

/* =====================================================================
   BARCODE-SCAN (ZEBRA)
===================================================================== */
let scanBuffer = "";

document.addEventListener("keydown", e => {

    // ENTER → Scan fertig
    if (e.key === "Enter") {

        const raw = scanBuffer.trim();

        // Beispiel: "K:12345;D:2403"
        const kom = raw.match(/K:(.*?);/);
        const dat = raw.match(/D:(.*)/);

        if (kom && dat) {

            kommission.value = kom[1];

            let d = dat[1].replace(/\D/g, "");
            if (d.length === 3) d = "0" + d;
            if (d.length >= 4) d = d.slice(0,2) + "." + d.slice(2,4);

            lieferdatum.value = d;
        }

        scanBuffer = "";
        return;
    }

    // Sonst Zeichen sammeln
    if (e.key.length === 1) scanBuffer += e.key;
});

/* =====================================================================
   FARBWAHL
===================================================================== */
let currentColor = "red";
document.querySelectorAll(".color-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentColor = btn.dataset.color;
    };
});

/* =====================================================================
   DRUCKEN
===================================================================== */
document.getElementById("druckenBtn").onclick = () => {

    if (!kommission.value) return alert("Kommissionsnummer fehlt!");
    if (!lieferdatum.value) return alert("Datum fehlt!");

    const data = {
        kommission: kommission.value,
        lieferdatum: lieferdatum.value,
        vorgezogen: chkVorgezogen.checked,
        farbe: currentColor
    };

    const json = JSON.stringify(data);

    if (window.Android && Android.printPaus)
        return Android.printPaus(json);

    window.location.href = "paus_druck.html?data=" + encodeURIComponent(json);
};

document.getElementById("backBtn").onclick = () => history.back();

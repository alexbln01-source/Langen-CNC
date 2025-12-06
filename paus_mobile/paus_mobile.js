let activeInput = null;
let currentColor = "red";
let scanBuffer = "";

/*****************************************
    GERÄT ERKENNEN
*****************************************/
const ua = navigator.userAgent.toLowerCase();
const sw = window.screen.width;
const sh = window.screen.height;
const dpr = window.devicePixelRatio;

const isZebraTC22 = ua.includes("android") && sw === 360 && sh === 720 && dpr === 3;
const isZebraTC21 = ua.includes("android") && sw === 360 && sh === 640;
const isMobile = /android|iphone|ipad|ipod/.test(ua) && !isZebraTC22 && !isZebraTC21;

if (isZebraTC22) document.body.classList.add("zebra-tc22");
if (isZebraTC21) document.body.classList.add("zebra-tc21");
if (!isMobile && !isZebraTC22 && !isZebraTC21) document.body.classList.add("pc-device");

/*****************************************
    Geräteanzeige
*****************************************/
const deviceInfo = document.getElementById("deviceInfo");

if (isZebraTC22) deviceInfo.textContent = "Gerät: Zebra TC22";
else if (isZebraTC21) deviceInfo.textContent = "Gerät: Zebra TC21";
else if (isMobile) deviceInfo.textContent = "Gerät: Mobile";
else deviceInfo.textContent = "Gerät: PC";

/*****************************************
    Elemente
*****************************************/
const kommission = document.getElementById("kommission");
const lieferdatum = document.getElementById("lieferdatum");

const openKeyboardBtn = document.getElementById("openKeyboardBtn");
const keyboardPopup = document.getElementById("keyboardPopup");
const keyboardInput = document.getElementById("keyboardInput");
const keyboardTitle = document.getElementById("keyboardTitle");

const keyboardOK = document.getElementById("keyboardOK");
const keyboardDelete = document.getElementById("keyboardDelete");
const keyboardClose = document.getElementById("keyboardClose");

/*****************************************
    INITIALISIERUNG
*****************************************/
window.onload = () => {
    kommission.value = "";
    lieferdatum.value = "";

    // TC22 → sofort Kommission fokussieren
    if (isZebraTC22) kommission.focus();

    // Build-Nummer setzen
    const d = new Date(document.lastModified);
    document.getElementById("buildInfo").textContent =
        "Build " +
        d.getFullYear() + "-" +
        String(d.getMonth()+1).padStart(2,"0") + "-" +
        String(d.getDate()).padStart(2,"0") + "." +
        String(d.getHours()).padStart(2,"0") +
        String(d.getMinutes()).padStart(2,"0");
};

/*****************************************
    POPUP-TASTATUR
*****************************************/
function openKeyboard(id) {
    activeInput = document.getElementById(id);

    keyboardInput.value = activeInput.value;
    keyboardTitle.textContent =
        id === "kommission" ? "Kommissionsnummer" : "Lieferdatum";

    keyboardPopup.style.display = "flex";

    setTimeout(() => keyboardInput.focus(), 50);
}

openKeyboardBtn.onclick = () => openKeyboard("kommission");

keyboardClose.onclick = () => keyboardPopup.style.display = "none";
keyboardDelete.onclick = () => {
    keyboardInput.value = keyboardInput.value.slice(0, -1);
};

keyboardOK.onclick = () => {
    if (!activeInput) return;

    let val = keyboardInput.value.replace(/\D/g, "");

    if (activeInput.id === "lieferdatum") {
        if (val.length === 3) val = "0" + val;
        if (val.length >= 4) val = val.slice(0,2) + "." + val.slice(2,4);
    }

    activeInput.value = val;

    if (activeInput.id === "kommission") {
        openKeyboard("lieferdatum");
        return;
    }

    keyboardPopup.style.display = "none";
};

/*****************************************
    FARBAUSWAHL
*****************************************/
document.querySelectorAll(".color-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentColor = btn.dataset.color;
    };
});

/*****************************************
    SCANNER (TC22)
*****************************************/
document.addEventListener("keydown", e => {

    if (e.key === "Enter") {
        let t = scanBuffer.trim();

        if (t.includes("K:") && t.includes("D:")) {

            const kom = t.match(/K:(.*?);/)[1];
            const raw = t.match(/D:(.*)/)[1].replace(/\D/g, "");

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

/*****************************************
    DRUCKEN
*****************************************/
document.getElementById("druckenBtn").onclick = () => {

    if (!kommission.value.trim()) return alert("Bitte Kommissionsnummer eingeben!");
    if (!lieferdatum.value.trim()) return alert("Bitte Lieferdatum eingeben!");

    const data = {
        kommission: kommission.value,
        lieferdatum: lieferdatum.value,
        farbe: currentColor,
        vorgezogen: document.getElementById("chkVorgezogen").checked
    };

    const json = JSON.stringify(data);

    if (window.Android && Android.printPaus)
        return Android.printPaus(json);

    window.location.href =
        "paus_druck.html?data=" + encodeURIComponent(json);
};

document.getElementById("backBtn").onclick = () => history.back();

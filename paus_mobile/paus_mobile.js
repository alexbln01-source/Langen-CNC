let activeInput = null;
let currentColor = "red";
let scanBuffer = "";

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

/* CSS class for PC */
if (isPC) document.body.classList.add("pc-device");

/* ============================
   BUILD + DEVICE INFO
============================ */
function buildNumber() {
    const d = new Date(document.lastModified);
    const s =
        d.getFullYear() + "-" +
        String(d.getMonth()+1).padStart(2,"0") + "-" +
        String(d.getDate()).padStart(2,"0") + "." +
        String(d.getHours()).padStart(2,"0") +
        String(d.getMinutes()).padStart(2,"0");

    document.getElementById("buildInfo").textContent = "Build " + s;
}

document.getElementById("deviceInfo").textContent =
    isTC22 ? "Gerät: Zebra TC22" :
    isTC21 ? "Gerät: Zebra TC21" :
    isZebra ? "Gerät: Zebra" :
    isMobile ? "Gerät: Mobil" : "Gerät: PC";

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

/* ============================
   START BEHAVIOR
============================ */
window.onload = () => {

    kommission.value = "";
    lieferdatum.value = "";

    buildNumber();

    if (isPC) {
        kommission.removeAttribute("readonly");
        lieferdatum.removeAttribute("readonly");
        openKeyboardBtn.style.display = "none";
        return;
    }

    kommission.readOnly = true;
    lieferdatum.readOnly = true;

    if (isZebra) kommission.focus();
};

/* ============================
   COLOR SELECTION
============================ */
document.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();

        document.querySelectorAll(".color-btn")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");
        currentColor = btn.dataset.color;
    });
});

/* ============================
   POPUP KEYBOARD (Beschichtung Style)
============================ */
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
    keyboardInput.value = activeInput.value;
    keyboardPopup.style.display = "flex";

    setTimeout(() => keyboardInput.focus(), 30);
}

openKeyboardBtn.onclick = () => openKeyboard("kommission");

keyboardOK.onclick = () => {
    if (!activeInput) return;

    let val = keyboardInput.value;

    if (activeInput.id === "lieferdatum") {
        val = val.replace(/\D/g, "");
        if (val.length === 3) val = "0" + val;
        if (val.length >= 4) val = val.slice(0,2) + "." + val.slice(2,4);
        activeInput.value = val;
        keyboardPopup.style.display = "none";
        return;
    }

    activeInput.value = val;
    openKeyboard("lieferdatum");
};

keyboardDelete.onclick = () =>
    keyboardInput.value = keyboardInput.value.slice(0,-1);

keyboardClose.onclick = () =>
    keyboardPopup.style.display = "none";

/* ============================
   SCANNER (Zebra DataWedge)
============================ */
document.addEventListener("keypress", e => {
    if (isZebra) scanBuffer += e.key;
});

document.addEventListener("keydown", e => {
    if (!isZebra) return;

    if (e.key === "Enter") {
        const text = scanBuffer.trim();
        scanBuffer = "";

        const kom = text.match(/K:(.*?);/);
        const dat = text.match(/D:(.*)/);

        if (!kom || !dat) return;

        kommission.value = kom[1];

        let raw = dat[1].replace(/\D/g,"");
        if (raw.length === 3) raw = "0" + raw;
        if (raw.length >= 4) raw = raw.slice(0,2) + "." + raw.slice(2,4);

        lieferdatum.value = raw;
    }
});

/* ============================
   DRUCKEN
============================ */
druckenBtn.onclick = () => {

    if (!kommission.value.trim()) return alert("Bitte Kommissionsnummer eingeben!");
    if (!lieferdatum.value.trim()) return alert("Bitte Lieferdatum eingeben!");

    const data = {
        kommission: kommission.value,
        lieferdatum: lieferdatum.value,
        vorgezogen: chkVorgezogen.checked,
        farbe: currentColor
    };

    const json = JSON.stringify(data);

    if (window.Android && Android.printPaus)
        Android.printPaus(json);
    else
        location.href = "paus_druck.html?data=" + encodeURIComponent(json);
};

backBtn.onclick = () => history.back();

/* ============================================================
   ZEBRA SCANNER – GANZ OBEN
============================================================ */
let scanData = "";
let scanActive = false;

document.addEventListener("beforeinput", e => {
    if (e.inputType === "insertText") {
        scanActive = true;
        scanData += e.data ?? "";
    }
});

document.addEventListener("keypress", e => {
    scanActive = true;
    scanData += e.key;
});

document.addEventListener("keydown", e => {

    if (e.key !== "Enter" || !scanActive) return;

    const txt = scanData.trim();
    scanActive = false;
    scanData = "";

    console.log("SCAN:", txt);

    if (!txt.includes("K:") || !txt.includes("D:")) return;

    const kom = txt.match(/K:(.*?);/)[1];
    let dat  = txt.match(/D:(.*)/)[1].replace(/\D/g, "");

    if (dat.length === 3) dat = "0" + dat;
    if (dat.length >= 4) dat = dat.slice(0,2) + "." + dat.slice(2,4);

    document.getElementById("kommission").value = kom;
    document.getElementById("lieferdatum").value = dat;

    focusField("kommission");
});

/* ============================================================
   DEVICE DETECTION
============================================================ */
let activeInput = null;
let currentColor = "red";

const ua  = navigator.userAgent.toLowerCase();
const sw  = screen.width;
const sh  = screen.height;
const dpr = devicePixelRatio;

const isTC21 = ua.includes("android") && sw === 360 && sh === 640;
const isTC22 = ua.includes("android") && sw === 360 && sh === 720 && dpr === 3;
const isZebra = isTC21 || isTC22 || ua.includes("zebra");
const isMobile = /android|iphone|ipad|ipod/i.test(ua);
const isPC = !isZebra && !isMobile;

/* PC = normales Keyboard */
if (isPC) document.body.classList.add("pc-device");

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

document.getElementById("deviceInfo").textContent =
    isTC22 ? "Gerät: Zebra TC22" :
    isTC21 ? "Gerät: Zebra TC21" :
    isZebra ? "Gerät: Zebra" :
    isMobile ? "Gerät: Mobil" : "Gerät: PC";

/* ============================================================
   ELEMENTE
============================================================ */
const kommission   = document.getElementById("kommission");
const lieferdatum  = document.getElementById("lieferdatum");

const keyboardPopup = document.getElementById("keyboardPopup");
const keyboardInput = document.getElementById("keyboardInput");
const keyboardKeys  = document.getElementById("keyboardKeys");
const keyboardOK    = document.getElementById("keyboardOK");
const keyboardDelete= document.getElementById("keyboardDelete");
const keyboardClose = document.getElementById("keyboardClose");
const openKeyboardBtn = document.getElementById("openKeyboardBtn");

/* ============================================================
   BLINK MARKIERUNG
============================================================ */
function focusField(id) {
    kommission.classList.remove("input-blink");
    lieferdatum.classList.remove("input-blink");

    document.getElementById(id).classList.add("input-blink");
}

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
        openKeyboardBtn.style.display = "none";
        return;
    }

    // ANDROID TASTATUR ABSCHALTEN
    [kommission, lieferdatum, keyboardInput].forEach(inp => {
        inp.setAttribute("inputmode", "none");
        inp.setAttribute("autocomplete", "off");
        inp.setAttribute("autocorrect", "off");
        inp.setAttribute("autocapitalize", "off");
        inp.setAttribute("spellcheck", "false");
    });

    kommission.readOnly = false;
    lieferdatum.readOnly = false;

    focusField("kommission");
};

/* ============================================================
   FARBAUSWAHL
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
   POPUP ZAHLEN-TASTATUR
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
    keyboardInput.value = activeInput.value;

    keyboardPopup.style.display = "flex";

    setTimeout(() => keyboardInput.focus(), 20);
}

openKeyboardBtn.onclick = () => openKeyboard("kommission");

keyboardOK.onclick = () => {

    let v = keyboardInput.value;

    if (activeInput.id === "lieferdatum") {
        v = v.replace(/\D/g, "");
        if (v.length === 3) v = "0" + v;
        if (v.length >= 4) v = v.slice(0,2) + "." + v.slice(2,4);
        activeInput.value = v;
        keyboardPopup.style.display = "none";
        focusField("lieferdatum");
        return;
    }

    activeInput.value = v;
    openKeyboard("lieferdatum");
    focusField("lieferdatum");
};

keyboardDelete.onclick = () =>
    keyboardInput.value = keyboardInput.value.slice(0,-1);

keyboardClose.onclick = () =>
    keyboardPopup.style.display = "none";

/* ============================================================
   DRUCKEN
============================================================ */
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

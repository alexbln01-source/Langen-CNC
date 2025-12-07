/* ============================================================
   SCANNER – GANZ OBEN, DAMIT ER IMMER PRIORITÄT HAT
============================================================ */
let scanBuffer = "";
let scanActive = false;

document.addEventListener("beforeinput", e => {
    if (e.inputType === "insertText") {
        scanActive = true;
        scanBuffer += e.data ?? "";
    }
});

document.addEventListener("keypress", e => {
    scanActive = true;
    scanBuffer += e.key;
});

document.addEventListener("keydown", e => {
    if (e.key !== "Enter" || !scanActive) return;

    scanActive = false;

    const raw = scanBuffer.trim();
    scanBuffer = "";

    console.log("SCAN:", raw);

    if (!raw.includes("K:") || !raw.includes("D:")) return;

    const kom = raw.match(/K:(.*?);/)[1];
    let dat  = raw.match(/D:(.*)/)[1].replace(/\D/g, "");

    if (dat.length === 3) dat = "0" + dat;
    if (dat.length >= 4) dat = dat.slice(0,2) + "." + dat.slice(2,4);

    document.getElementById("kommission").value   = kom;
    document.getElementById("lieferdatum").value  = dat;

    // Fokus zurück auf Kommission
    const inp = document.getElementById("kommission");
    inp.focus();
    setBlink(inp);
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

if (isPC) document.body.classList.add("pc-device");

/* ============================================================
   ELEMENTS
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

const druckenBtn = document.getElementById("druckenBtn");
const backBtn    = document.getElementById("backBtn");
const chkVorgezogen = document.getElementById("chkVorgezogen");

/* ============================================================
   BLINKCURSOR
============================================================ */
function setBlink(element) {
    kommission.classList.remove("input-blink");
    lieferdatum.classList.remove("input-blink");
    if (element) element.classList.add("input-blink");
}

/* ============================================================
   STARTUP
============================================================ */
window.onload = () => {

    kommission.value  = "";
    lieferdatum.value = "";

    buildNumber();

    if (!isPC) {
        kommission.readOnly = false;
        lieferdatum.readOnly = false;

        kommission.setAttribute("inputmode", "none");
        lieferdatum.setAttribute("inputmode", "none");

        kommission.focus();
        setBlink(kommission);
    } else {
        openKeyboardBtn.style.display = "none";
    }
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
   POPUP ZAHLENTASTATUR
============================================================ */
const KEYS = ["1","2","3","4","5","6","7","8","9","0"];

function renderKeyboard() {
    keyboardKeys.innerHTML = "";
    KEYS.forEach(k => {
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

    setBlink(activeInput);
    keyboardPopup.style.display = "flex";

    setTimeout(() => keyboardInput.focus(), 20);
}

openKeyboardBtn.onclick = () => openKeyboard("kommission");

/* OK */
keyboardOK.onclick = () => {

    if (!activeInput) return;

    let v = keyboardInput.value;

    if (activeInput.id === "lieferdatum") {
        v = v.replace(/\D/g,"");
        if (v.length === 3) v = "0"+v;
        if (v.length >= 4) v = v.slice(0,2)+"."+v.slice(2,4);
        activeInput.value = v;
        keyboardPopup.style.display = "none";
        return;
    }

    activeInput.value = v;
    openKeyboard("lieferdatum");
};

/* DELETE */
keyboardDelete.onclick = () =>
    keyboardInput.value = keyboardInput.value.slice(0,-1);

/* CLOSE */
keyboardClose.onclick = () =>
    keyboardPopup.style.display = "none";

/* ============================================================
   DRUCKEN
============================================================ */
druckenBtn.onclick = () => {

    if (!kommission.value.trim()) return alert("Bitte Kommissionsnummer eingeben!");
    if (!lieferdatum.value.trim()) return alert("Bitte Lieferdatum eingeben!");

    const data = {
        kommission: kommission.value.trim(),
        lieferdatum: lieferdatum.value.trim(),
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

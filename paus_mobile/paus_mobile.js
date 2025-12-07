/* ============================================================
   ZEBRA SCANNER – MUSS GANZ OBEN STEHEN DAMIT ALLES FUNKTIONIERT
   (DataWedge liefert beforeinput + keypress → alles abfangen)
============================================================ */
let scanData = "";
let scanActive = false;

function cleanScan(str) {
    return str
        .replace(/(.)\1+/g, "$1") // doppelte Zeichen entfernen
        .replace(/[^A-Za-z0-9:;]/g, ""); // Sonderzeichen raus
}

// BEFOREINPUT (Hauptquelle bei TC22)
document.addEventListener("beforeinput", e => {
    if (e.inputType === "insertText") {
        scanActive = true;
        scanData += e.data ?? "";
    }
});

// KEYPRESS (Backup)
document.addEventListener("keypress", e => {
    scanActive = true;
    scanData += e.key;
});

// ENTER = Scan fertig
document.addEventListener("keydown", e => {

    if (e.key !== "Enter" || !scanActive) return;

    let text = cleanScan(scanData);
    scanActive = false;
    scanData = "";

    console.log("SCAN BEREINIGT:", text);

    const komMatch = text.match(/K:([0-9]+)/);
    const datMatch = text.match(/D:([0-9]+)/);

    if (!komMatch || !datMatch) return;

    const kom = komMatch[1];
    let raw = datMatch[1];

    if (raw.length === 3) raw = "0" + raw;
    if (raw.length >= 4) raw = raw.slice(0,2) + "." + raw.slice(2,4);

    document.getElementById("kommission").value = kom;
    document.getElementById("lieferdatum").value = raw;

    document.getElementById("kommission").focus();
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
const isPC = !isMobile && !isZebra;

/* PC Layout */
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

    // Zebra → Android Tastatur blockieren
    [kommission, lieferdatum].forEach(inp => {
        inp.setAttribute("inputmode", "none");
        inp.setAttribute("autocomplete", "off");
        inp.setAttribute("autocorrect", "off");
        inp.setAttribute("autocapitalize", "off");
        inp.setAttribute("spellcheck", "false");
    });

    kommission.readOnly = false;
    lieferdatum.readOnly = false;

    kommission.focus();
};


/* ============================================================
   FARBAUSWAHL
============================================================ */
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


/* ============================================================
   POPUP ZAHLENTASTATUR
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

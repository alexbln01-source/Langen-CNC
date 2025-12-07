let activeInput = null;
let currentColor = "red";

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
        // PC: normale Eingabe
        kommission.removeAttribute("readonly");
        lieferdatum.removeAttribute("readonly");
        openKeyboardBtn.style.display = "none";
        return;
    }

    // Zebra / Handy → wir lassen Eingabe zu (für Scanner),
    // versuchen aber die Soft-Tastatur zu bremsen
    if (isZebra) {
        kommission.readOnly = false;
        lieferdatum.readOnly = false;

        [kommission, lieferdatum].forEach(inp => {
            inp.setAttribute("inputmode", "none");
            inp.setAttribute("autocorrect", "off");
            inp.setAttribute("autocomplete", "off");
            inp.setAttribute("autocapitalize", "off");
            inp.setAttribute("spellcheck", "false");
        });

        kommission.focus();
    }
};

/* ============================
   COLOR SELECTION
============================ */
document.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", e => {
        e.preventDefault();

        document.querySelectorAll(".color-btn")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");
        currentColor = btn.dataset.color;
    });
});

/* ============================
   POPUP NUMERIC KEYBOARD
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
        kommission.focus();
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
   ZEBRA SCANNER – EINFACHE VARIANTE
   Wir werten einfach das Kommissionsfeld aus,
   sobald Enter gedrückt wird.
============================ */
document.addEventListener("keydown", e => {

    if (!isZebra) return;
    if (e.key !== "Enter") return;

    // Standard-Enter-Verhalten verhindern
    e.preventDefault();

    // Text aus dem Kommissionsfeld nehmen (z.B. "K:9876543;D:2412")
    let text = kommission.value.trim();
    if (!text) return;

    if (!text.includes("K:") || !text.includes("D:")) {
        // kein Barcode-Format → nichts tun
        return;
    }

    const komMatch = text.match(/K:([^;]+)/);
    const dMatch   = text.match(/D:(\d+)/);

    if (!komMatch || !dMatch) return;

    const kom = komMatch[1];     // z.B. "9876543"
    let raw   = dMatch[1];       // z.B. "2412"

    // Datum in TT.MM
    if (raw.length === 3) raw = "0" + raw;
    let dat = raw;
    if (raw.length >= 4) {
        dat = raw.slice(0,2) + "." + raw.slice(2,4);   // 2412 → 24.12
    }

    // Felder sauber setzen
    kommission.value = kom;
    lieferdatum.value = dat;

    // Fokus wieder auf Kommission für nächsten Scan
    kommission.focus();
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

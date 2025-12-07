// ============================================================
//  GLOBALE VARIABLEN
// ============================================================
let activeInput = null;

// ============================================================
//  DEVICE DETECTION
// ============================================================
const ua  = navigator.userAgent.toLowerCase();
const sw  = window.screen.width;
const sh  = window.screen.height;
const dpr = window.devicePixelRatio;

const isTC22  = ua.includes("android") && sw === 360 && sh === 720 && dpr === 3;
const isTC21  = ua.includes("android") && sw === 360 && sh === 640;
const isZebra = isTC22 || isTC21 || ua.includes("zebra");
const isMobile = /android|iphone|ipad|ipod/.test(ua);
const isPC     = !isZebra && !isMobile;

// ============================================================
//  DOM ELEMENTE
// ============================================================
const kommission     = document.getElementById("kommission");
const lieferdatum    = document.getElementById("lieferdatum");

const openKeyboardBtn = document.getElementById("openKeyboardBtn");
const keyboardPopup   = document.getElementById("keyboardPopup");
const keyboardInput   = document.getElementById("keyboardInput");
const keyboardKeys    = document.getElementById("keyboardKeys");
const keyboardOK      = document.getElementById("keyboardOK");
const keyboardDelete  = document.getElementById("keyboardDelete");
const keyboardClose   = document.getElementById("keyboardClose");

const druckenBtn = document.getElementById("druckenBtn");
const backBtn    = document.getElementById("backBtn");
const deviceInfo = document.getElementById("deviceInfo");
const buildInfo  = document.getElementById("buildInfo");

// ============================================================
//  DEVICE INFO
// ============================================================
deviceInfo.textContent =
    isTC22 ? "Gerät: Zebra TC22" :
    isTC21 ? "Gerät: Zebra TC21" :
    isZebra ? "Gerät: Zebra" :
    isMobile ? "Gerät: Mobil" : "Gerät: PC";

if (isPC) document.body.classList.add("pc-device");

// ============================================================
//  START
// ============================================================
window.onload = () => {

    kommission.value  = "";
    lieferdatum.value = "";

    buildNumber();

    // Android Tastatur aus (aber Cursor sichtbar!)
    if (!isPC) {
        [kommission, lieferdatum, keyboardInput].forEach(inp => {
            inp.setAttribute("inputmode", "none");
            inp.setAttribute("autocomplete", "off");
            inp.setAttribute("autocorrect", "off");
            inp.setAttribute("autocapitalize", "off");
            inp.setAttribute("spellcheck", "false");
        });
    } else {
        kommission.removeAttribute("readonly");
        lieferdatum.removeAttribute("readonly");
    }

    // Sofort Cursor im Kommissionsfeld → Scanner ready
    if (isZebra) kommission.focus();

    // ===== Buttons =====
    backBtn.onclick = () => history.back();

    druckenBtn.onclick = () => {

        // vor dem Drucken sicherstellen, dass K/D getrennt ist
        parseKommissionField();

        if (!kommission.value.trim())  return alert("Bitte Kommissionsnummer eingeben!");
        if (!lieferdatum.value.trim()) return alert("Bitte Lieferdatum eingeben!");

        const colorBtn = document.querySelector(".color-btn.active");
        const farbe = colorBtn ? colorBtn.dataset.color : "red";

        const data = {
            kommission : kommission.value.trim(),
            lieferdatum: lieferdatum.value.trim(),
            vorgezogen : document.getElementById("chkVorgezogen").checked,
            farbe
        };

        const json = JSON.stringify(data);

        if (window.Android && typeof Android.printPaus === "function") {
            Android.printPaus(json);
        } else {
            location.href = "paus_druck.html?data=" + encodeURIComponent(json);
        }
    };
};

// ============================================================
//  BUILD INFO
// ============================================================
function buildNumber() {
    const d = new Date(document.lastModified);
    const stamp =
        d.getFullYear() + "-" +
        String(d.getMonth()+1).padStart(2,"0") + "-" +
        String(d.getDate()).padStart(2,"0") + "." +
        String(d.getHours()).padStart(2,"0") +
        String(d.getMinutes()).padStart(2,"0");

    buildInfo.textContent = "Build " + stamp;
}

// ============================================================
//  FARBWAHL
// ============================================================
document.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".color-btn")
            .forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});

// ============================================================
//  POPUP TASTATUR
// ============================================================
const NUM_KEYS = ["1","2","3","4","5","6","7","8","9","0"];

function renderKeyboard() {
    keyboardKeys.innerHTML = "";
    NUM_KEYS.forEach(k => {
        const b = document.createElement("button");
        b.textContent = k;
        b.type = "button";
        b.onclick = () => keyboardInput.value += k;
        keyboardKeys.appendChild(b);
    });
}
renderKeyboard();

openKeyboardBtn.onclick = () => openKeyboard("kommission");

function openKeyboard(id) {
    activeInput = document.getElementById(id);
    keyboardInput.value = activeInput.value;
    keyboardPopup.style.display = "flex";
    setTimeout(() => keyboardInput.focus(), 20);
}

keyboardOK.onclick = () => {
    if (!activeInput) return;

    let val = keyboardInput.value;

    if (activeInput.id === "lieferdatum") {
        val = val.replace(/\D/g, "");
        if (val.length === 3) val = "0" + val;
        if (val.length >= 4) val = val.slice(0,2) + "." + val.slice(2,4);
        keyboardPopup.style.display = "none";
    } else {
        activeInput.value = val;
        openKeyboard("lieferdatum");
        return;
    }

    activeInput.value = val;
};

keyboardDelete.onclick = () =>
    keyboardInput.value = keyboardInput.value.slice(0,-1);

keyboardClose.onclick = () =>
    keyboardPopup.style.display = "none";


// ============================================================
//  K:...;D:... AUTOMATISCH TRENNEN
//  (Scanner schreibt alles in kommission; wir parsen danach)
// ============================================================

function parseKommissionField() {

    let text = kommission.value.trim();
    if (!text) return;

    // Nur reagieren, wenn wirklich K: und D: drin stehen
    if (!text.includes("K:") || !text.includes("D:")) return;

    // K-Teil
    let kom = "";
    if (text.includes("K:")) {
        let startK = text.indexOf("K:") + 2;
        let endK   = text.indexOf(";", startK);
        if (endK === -1 || endK > text.indexOf("D:")) endK = text.indexOf("D:");
        if (endK === -1) endK = text.length;
        kom = text.substring(startK, endK).trim();
    }

    // D-Teil
    let dat = "";
    if (text.includes("D:")) {
        let startD = text.indexOf("D:") + 2;
        dat = text.substring(startD).replace(/\D/g, "").trim();
    }

    if (!kom || !dat) return;

    if (dat.length === 3) dat = "0" + dat;
    if (dat.length >= 4) dat = dat.slice(0,2) + "." + dat.slice(2,4);

    kommission.value  = kom;
    lieferdatum.value = dat;
}

// Wenn Scanner TAB schickt und das Feld verlässt → direkt trennen
kommission.addEventListener("blur",  parseKommissionField);
kommission.addEventListener("change", parseKommissionField);

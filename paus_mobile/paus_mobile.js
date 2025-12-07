// ============================================================
//  GLOBALE VARIABLEN
// ============================================================
let activeInput = null;
let scanString  = "";
let scanStarted = false;

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
//  DEVICE INFO & PC-LAYOUT
// ============================================================
deviceInfo.textContent =
    isTC22 ? "Gerät: Zebra TC22" :
    isTC21 ? "Gerät: Zebra TC21" :
    isZebra ? "Gerät: Zebra" :
    isMobile ? "Gerät: Mobil" : "Gerät: PC";

if (isPC) {
    document.body.classList.add("pc-device");
}


// ============================================================
//  START
// ============================================================
window.onload = () => {

    kommission.value  = "";
    lieferdatum.value = "";

    buildNumber();

    // Android-Tastatur auf Zebra / Handy abschalten
    if (!isPC) {
        [kommission, lieferdatum, keyboardInput].forEach(inp => {
            inp.setAttribute("inputmode", "none");
            inp.setAttribute("autocomplete", "off");
            inp.setAttribute("autocorrect", "off");
            inp.setAttribute("autocapitalize", "off");
            inp.setAttribute("spellcheck", "false");
        });
    } else {
        // PC: normale Eingabe erlauben
        kommission.removeAttribute("readonly");
        lieferdatum.removeAttribute("readonly");
    }

    // TC: direkt Kommissionsfeld fokussieren → Scanner kann sofort reinballern
    if (isZebra) {
        kommission.focus();
    }

    // Buttons unten
    backBtn.onclick = () => history.back();

    druckenBtn.onclick = () => {
        if (!kommission.value.trim())  return alert("Bitte Kommissionsnummer eingeben!");
        if (!lieferdatum.value.trim()) return alert("Bitte Lieferdatum eingeben!");

        const colorBtn = document.querySelector(".color-btn.active");
        const farbe    = colorBtn ? colorBtn.dataset.color : "red";

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
        if (val.length === 3)  val = "0" + val;
        if (val.length >= 4)  val = val.slice(0,2) + "." + val.slice(2,4);
        keyboardPopup.style.display = "none";
    } else {
        // Kommission fertig → direkt Datum-Popup öffnen
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
//  ZEBRA SCANNER – KUNDENSPEZIFISCHES PARSING
//  Erwartetes Format: K:12345;D:0103
// ============================================================

// beforeinput → DataWedge-Textblöcke (optimal)
document.addEventListener("beforeinput", e => {
    if (!isZebra) return;
    if (e.inputType === "insertText") {
        scanStarted = true;
        scanString += e.data ?? "";
    }
});

// keypress → Fallback
document.addEventListener("keypress", e => {
    if (!isZebra) return;
    scanStarted = true;
    scanString += e.key;
});

// ENTER = Scan fertig → jetzt manuell K und D trennen
document.addEventListener("keydown", e => {
    if (!isZebra) return;
    if (e.key !== "Enter" || !scanStarted) return;

    scanStarted = false;
    let text = scanString.trim();
    scanString = "";

    console.log("SCAN-ROH:", JSON.stringify(text));

    // ------- MANUELLES PARSING OHNE REGEX -------

    const idxK = text.indexOf("K:");
    const idxD = text.indexOf("D:");

    if (idxK === -1 || idxD === -1) {
        console.warn("Scan ohne K: oder D: → ignoriert:", text);
        return;
    }

    // Kommission: nach "K:" bis zum ersten ";" oder bis "D:"
    let endKom = text.indexOf(";", idxK);
    if (endKom === -1 || endKom > idxD) endKom = idxD;

    let kom = text.substring(idxK + 2, endKom).trim();

    // Datum: alles nach "D:" → nur Ziffern rausziehen
    let datRaw = text.substring(idxD + 2);
    datRaw = datRaw.replace(/\D/g, ""); // nur Zahlen

    if (!kom || !datRaw) {
        console.warn("K oder D leer nach Parsing:", kom, datRaw);
        return;
    }

    // Datum TT.MM formatieren
    if (datRaw.length === 3) datRaw = "0" + datRaw;
    if (datRaw.length >= 4) datRaw = datRaw.slice(0,2) + "." + datRaw.slice(2,4);

    // In Felder schreiben
    kommission.value  = kom;
    lieferdatum.value = datRaw;

    // Fokus wieder auf Kommission
    kommission.focus();
});

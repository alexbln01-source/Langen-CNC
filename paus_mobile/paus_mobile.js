/* ============================================================
   ZEBRA SCANNER – beforeinput = 100% zuverlässig auf TC21/TC22
============================================================ */
let scan = "";
let scanRunning = false;

document.addEventListener("beforeinput", e => {
    if (e.inputType === "insertText") {
        scanRunning = true;
        scan += e.data ?? "";
    }
});

document.addEventListener("keydown", e => {

    // ENTER = Scan abgeschlossen
    if (e.key === "Enter" && scanRunning) {
        const txt = scan.trim();
        scan = "";
        scanRunning = false;

        // Prüfen ob korrektes Format
        if (!txt.includes("K:") || !txt.includes("D:")) return;

        const kom = txt.match(/K:(.*?);/)[1];
        let dat = txt.match(/D:(.*)/)[1].replace(/\D/g, "");

        // Datum formatieren
        if (dat.length === 3) dat = "0" + dat;
        if (dat.length >= 4) dat = dat.slice(0,2) + "." + dat.slice(2,4);

        // Füllen
        document.getElementById("kommission").value = kom;
        document.getElementById("lieferdatum").value = dat;

        // Visueller Blink-Effekt
        focusField("lieferdatum");
        return;
    }
});

/* ============================================================
   DEVICE DETECTION
============================================================ */
const ua = navigator.userAgent.toLowerCase();
const sw = screen.width;
const sh = screen.height;
const dpr = devicePixelRatio;

const isTC21 = ua.includes("android") && sw === 360 && sh === 640;
const isTC22 = ua.includes("android") && sw === 360 && sh === 720 && dpr === 3;
const isZebra = isTC21 || isTC22 || ua.includes("zebra");
const isMobile = /android|iphone|ipad|ipod/i.test(ua);
const isPC = !isZebra && !isMobile;

if (isPC) document.body.classList.add("pc-device");

/* ============================================================
   STARTVERHALTEN
============================================================ */
window.onload = () => {

    kommission.value = "";
    lieferdatum.value = "";

    buildNumber();

    // PC → normale Eingabe
    if (isPC) {
        kommission.removeAttribute("readonly");
        lieferdatum.removeAttribute("readonly");
        openKeyboardBtn.style.display = "none";
        return;
    }

    // Android-Tastatur ausschalten vollständig
    [kommission, lieferdatum].forEach(inp => {
        inp.setAttribute("inputmode", "none");
        inp.setAttribute("autocomplete", "off");
        inp.setAttribute("autocorrect", "off");
        inp.setAttribute("autocapitalize", "off");
        inp.setAttribute("spellcheck", "false");
        inp.readOnly = false; // wichtig: zebra muss reinschreiben können
    });

    kommission.focus();
    focusField("kommission");
};

/* ============================================================
   BLINK-EFFEKT
============================================================ */
function focusField(id) {
    kommission.classList.remove("input-blink");
    lieferdatum.classList.remove("input-blink");

    document.getElementById(id).classList.add("input-blink");
}

/* ============================================================
   POPUP KEYBOARD (funktioniert ohne Android-Tastatur)
============================================================ */
const NUMBER_KEYS = ["1","2","3","4","5","6","7","8","9","0"];
let activeInput = null;

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

    // FÜR POPUP → readonly MUSS drin bleiben!
    setTimeout(() => keyboardInput.focus(), 50);
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
    keyboardInput.value = keyboardInput.value.slice(0, -1);

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

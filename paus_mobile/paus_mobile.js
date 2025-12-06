let activeInput = null;
let currentColor = "red";

/* =============================
   GERÄTE ERKENNUNG
============================= */
const ua  = navigator.userAgent.toLowerCase();
const sw  = window.screen.width;
const sh  = window.screen.height;
const dpr = window.devicePixelRatio;

const isMobile = /android|iphone|ipad|ipod/i.test(ua);

const isZebraTC21 = ua.includes("android") && sw === 360 && sh === 640;
const isZebraTC22 = ua.includes("android") && sw === 360 && sh === 720 && dpr === 3;

if (isZebraTC21) document.body.classList.add("zebra-tc21");
if (isZebraTC22) document.body.classList.add("zebra-tc22");
if (!isMobile && !isZebraTC21 && !isZebraTC22) document.body.classList.add("pc-device");

/* Geräteanzeige */
const dev = document.getElementById("deviceInfo");
if (isZebraTC22) dev.textContent = "Gerät: Zebra TC22";
else if (isZebraTC21) dev.textContent = "Gerät: Zebra TC21";
else if (!isMobile) dev.textContent = "Gerät: PC";
else dev.textContent = "Gerät: Mobil";

/* =============================
   FELDER
============================= */
const kommission = document.getElementById("kommission");
const lieferdatum = document.getElementById("lieferdatum");

/* Felder frei schalten auf PC */
if (!isMobile) {
    kommission.removeAttribute("readonly");
    lieferdatum.removeAttribute("readonly");
}

/* =============================
   BUILD INFO
============================= */
document.addEventListener("DOMContentLoaded", () => {
    const d = new Date(document.lastModified);
    const build =
        d.getFullYear().toString() +
        String(d.getMonth()+1).padStart(2,"0") +
        String(d.getDate()).padStart(2,"0") + "." +
        String(d.getHours()).padStart(2,"0") +
        String(d.getMinutes()).toString().padStart(2,"0");

    document.getElementById("buildInfo").textContent = "Build " + build;
});

/* =============================
   POPUP TASTATUR
============================= */
const keyboardPopup = document.getElementById("keyboardPopup");
const keyboardInput = document.getElementById("keyboardInput");
const keyboardKeys  = document.getElementById("keyboardKeys");
const keyboardTitle = document.getElementById("keyboardTitle");

const keyboardOK     = document.getElementById("keyboardOK");
const keyboardDelete = document.getElementById("keyboardDelete");
const keyboardClose  = document.getElementById("keyboardClose");

document.getElementById("openKeyboardBtn").onclick = () => {
    activeInput = (kommission === document.activeElement) ? kommission : kommission;
    keyboardTitle.textContent = "Eingabe";
    keyboardInput.value = "";
    keyboardPopup.style.display = "flex";
    setTimeout(() => keyboardInput.focus(), 50);
};

/* Tastaturbelegung */
const keys = "12345 67890".replace(/ /g,"").split("");
keyboardKeys.innerHTML = "";
keys.forEach(k => {
    const b = document.createElement("button");
    b.textContent = k;
    b.onclick = () => keyboardInput.value += k;
    keyboardKeys.appendChild(b);
});

/* Aktionen */
keyboardDelete.onclick = () => {
    keyboardInput.value = keyboardInput.value.slice(0, -1);
};

keyboardOK.onclick = () => {
    if (!activeInput) return;

    let val = keyboardInput.value.replace(/\D/g,"");

    if (activeInput.id === "lieferdatum") {
        if (val.length === 3) val = "0" + val;
        if (val.length >= 4) val = val.slice(0,2) + "." + val.slice(2,4);
    }

    activeInput.value = val;
    keyboardPopup.style.display = "none";
};

keyboardClose.onclick = () => {
    keyboardPopup.style.display = "none";
};

/* =============================
   FARBAUSWAHL
============================= */
document.querySelectorAll(".color-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentColor = btn.dataset.color;
    };
});

/* =============================
   DRUCKEN
============================= */
document.getElementById("druckenBtn").onclick = () => {

    if (!kommission.value.trim()) return alert("Kommissionsnummer fehlt!");
    if (!lieferdatum.value.trim()) return alert("Datum fehlt!");

    const data = {
        kommission: kommission.value,
        lieferdatum: lieferdatum.value,
        farbe: currentColor,
        vorgezogen: chkVorgezogen.checked
    };

    window.location.href =
        "paus_druck.html?data=" + encodeURIComponent(JSON.stringify(data));
};

/* =============================
   ZURÜCK
============================= */
document.getElementById("backBtn").onclick = () => history.back();

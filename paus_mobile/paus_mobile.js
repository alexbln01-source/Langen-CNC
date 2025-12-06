let activeInput = null;
let currentColor = "red";

/* =============================
   DEVICE DETECTION
============================= */
const ua = navigator.userAgent.toLowerCase();
const sw = window.screen.width;
const sh = window.screen.height;
const dpr = window.devicePixelRatio;

const isMobile = /android|iphone|ipad|ipod/.test(ua);
const isZebraTC21 = ua.includes("zebra") || (sw === 360 && sh === 640);
const isZebraTC22 = ua.includes("zebra") || (sw === 360 && sh === 720 && dpr === 3);

if (!isMobile && !isZebraTC21 && !isZebraTC22) {
    document.body.classList.add("pc-device");
}

/* Geräteinfo UI */
const deviceInfo = document.getElementById("deviceInfo");
if (isZebraTC22) deviceInfo.textContent = "Gerät: Zebra TC22";
else if (isZebraTC21) deviceInfo.textContent = "Gerät: Zebra TC21";
else if (isMobile)    deviceInfo.textContent = "Gerät: Handy";
else                  deviceInfo.textContent = "Gerät: PC";

/* BUILD INFO */
document.addEventListener("DOMContentLoaded", () => {
    const t = new Date(document.lastModified);
    const build =
        t.getFullYear().toString() +
        String(t.getMonth() + 1).padStart(2, "0") +
        String(t.getDate()).padStart(2, "0") + "." +
        String(t.getHours()).padStart(2, "0") +
        String(t.getMinutes()).padStart(2, "0");

    document.getElementById("buildInfo").textContent = "Build " + build;
});

/* =============================
   ELEMENTE
============================= */
const kommission = document.getElementById("kommission");
const lieferdatum = document.getElementById("lieferdatum");
const keyboardPopup = document.getElementById("keyboardPopup");
const keyboardInput = document.getElementById("keyboardInput");
const keyboardTitle = document.getElementById("keyboardTitle");
const keyboardClose = document.getElementById("keyboardClose");
const keyboardDelete = document.getElementById("keyboardDelete");
const keyboardOK = document.getElementById("keyboardOK");
const druckenBtn = document.getElementById("druckenBtn");
const backBtn = document.getElementById("backBtn");

/* =============================
   PC → Eingabe direkt
============================= */
if (document.body.classList.contains("pc-device")) {
    kommission.removeAttribute("readonly");
    lieferdatum.removeAttribute("readonly");
}

/* =============================
   NUMMERNEINGABE FORMATIERUNG
============================= */
lieferdatum.addEventListener("input", () => {
    lieferdatum.value = lieferdatum.value.replace(/[^\d.]/g, "");
});

lieferdatum.addEventListener("blur", () => {
    let v = lieferdatum.value.replace(/\D/g, "");
    if (v.length === 3) v = "0" + v;
    if (v.length >= 4) v = v.slice(0, 2) + "." + v.slice(2, 4);
    lieferdatum.value = v;
});

/* =============================
   POPUP TASTATUR (NUR MOBILE)
============================= */
function openKeyboard(id) {
    if (document.body.classList.contains("pc-device")) return;

    activeInput = document.getElementById(id);
    keyboardInput.value = "";
    keyboardTitle.textContent = id === "kommission" ? "Kommissionsnummer" : "Lieferdatum";

    keyboardPopup.style.display = "flex";
    setTimeout(() => keyboardInput.focus(), 50);
}

document.getElementById("openKeyboardBtn").onclick = () => {
    openKeyboard("kommission");
};

/* =============================
   POPUP BUTTONS
============================= */
keyboardClose.onclick = () => keyboardPopup.style.display = "none";
keyboardDelete.onclick = () =>
    keyboardInput.value = keyboardInput.value.slice(0, -1);

keyboardOK.onclick = () => {
    if (!activeInput) return;

    let val = keyboardInput.value.replace(/\D/g, "");

    if (activeInput.id === "lieferdatum") {
        if (val.length === 3) val = "0" + val;
        if (val.length >= 4) val = val.slice(0, 2) + "." + val.slice(2, 4);
    }

    activeInput.value = val;
    keyboardPopup.style.display = "none";
};

/* =============================
   FARBWAHL
============================= */
document.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentColor = btn.dataset.color;
    });
});

/* =============================
   DRUCKEN
============================= */
druckenBtn.onclick = () => {
    if (!kommission.value.trim()) return alert("Bitte Kommissionsnummer eingeben!");
    if (!lieferdatum.value.trim()) return alert("Bitte Lieferdatum eingeben!");

    const json = JSON.stringify({
        kommission: kommission.value,
        lieferdatum: lieferdatum.value,
        vorgezogen: chkVorgezogen.checked,
        farbe: currentColor
    });

    if (window.Android && Android.printPaus)
        return Android.printPaus(json);

    location.href = "paus_druck.html?data=" + encodeURIComponent(json);
};

backBtn.onclick = () => history.back();

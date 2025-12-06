let activeInput = null;
let currentColor = "red";
let scanBuffer = "";

/* ============================================================
   GERÄTEERKENNUNG
============================================================ */
function detectDevice() {

    const ua  = navigator.userAgent.toLowerCase();
    const sw  = window.screen.width;
    const sh  = window.screen.height;
    const dpr = window.devicePixelRatio;

    let text = "Gerät: ";

    if (/zebra|tc21|tc26/i.test(ua)) { text += "Zebra TC21/26"; }
    else if (/tc22/.test(ua) || (sw === 360 && sh === 720 && dpr === 3))
        text += "Zebra TC22";
    else if (/android/.test(ua)) text += "Android";
    else if (/iphone|ipad|ipod/.test(ua)) text += "iOS";
    else text += "PC";

    document.getElementById("deviceInfo").textContent = text;
}

detectDevice();

/* ============================================================
   BUILD NUMMER AUTOMATISCH
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    const lastMod = new Date(document.lastModified);
    const b =
        lastMod.getFullYear() +
        String(lastMod.getMonth() + 1).padStart(2, "0") +
        String(lastMod.getDate()).padStart(2, "0") + "." +
        String(lastMod.getHours()).padStart(2, "0") +
        String(lastMod.getMinutes()).padStart(2, "0");

    document.getElementById("buildInfo").textContent = "Build " + b;
});

/* =============================
   KEIN AUTOMATISCHES ÖFFNEN!
============================= */
function isMobileDevice() {
    const ua = navigator.userAgent;
    if (/Zebra|TC21|TC22|TC26/i.test(ua)) return false;
    return /Android|iPhone|iPad|iPod/i.test(ua);
}

/* Handy → Felder readonly, aber öffnen NICHT automatisch */
if (!isMobileDevice()) {
    kommission.removeAttribute("readonly");
    lieferdatum.removeAttribute("readonly");
}

/* =============================
   TASTATUR ÖFFNEN NUR PER BUTTON
============================= */
openKeyboardBtn.onclick = () => {
    activeInput = kommission; // Standard
    keyboardTitle.textContent = "Eingabe";
    keyboardInput.value = "";
    keyboardPopup.style.display = "flex";

    setTimeout(() => keyboardInput.focus(), 50);
};

/* =============================
   DATUMSFORMAT
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
   POPUP-TASTATUR
============================= */
keyboardClose.onclick = () => keyboardPopup.style.display = "none";
keyboardDelete.onclick = () => keyboardInput.value = keyboardInput.value.slice(0, -1);

keyboardOK.onclick = () => {
    let val = keyboardInput.value.replace(/\D/g, "");
    kommission.value = val;
    keyboardPopup.style.display = "none";
};

/* =============================
   SCANNER (Zebra)
============================= */
document.addEventListener("keydown", e => {
    if (e.key === "Enter") {

        let text = scanBuffer.trim();

        if (text.includes("K:") && text.includes("D:")) {

            const kom = text.match(/K:(.*?);/)[1];
            const raw = text.match(/D:(.*)/)[1].replace(/\D/g, "");

            let dat = raw;
            if (dat.length === 3) dat = "0" + dat;
            if (dat.length >= 4) dat = dat.slice(0, 2) + "." + dat.slice(2, 4);

            kommission.value = kom;
            lieferdatum.value = dat;
        }

        scanBuffer = "";
    } else {
        scanBuffer += e.key;
    }
});

/* =============================
   DRUCKEN
============================= */
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

    if (window.Android && Android.printPaus) {
        Android.printPaus(json);
        return;
    }

    window.location.href = "paus_druck.html?data=" + encodeURIComponent(json);
};

backBtn.onclick = () => history.back();

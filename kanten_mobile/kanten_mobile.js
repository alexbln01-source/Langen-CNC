let selectedCustomer = "";
let customCustomer = "";
let selectedArt = "kanten";

/* ============================================================
   GERÄTEERKENNUNG
============================================================ */
const ua  = navigator.userAgent.toLowerCase();
const sw  = window.screen.width;
const sh  = window.screen.height;
const dpr = window.devicePixelRatio;

// generell mobile?
const isMobile = /android|iphone|ipad|ipod/i.test(ua);

// TC21 (optional)
const isZebraTC21 = ua.includes("android") && sw === 360 && sh === 640;

// TC22 (dein Gerät)
const isZebraTC22 = ua.includes("android") && sw === 360 && sh === 720 && dpr === 3;

// Klassen setzen
if (isZebraTC21) document.body.classList.add("zebra-tc21");
if (isZebraTC22) document.body.classList.add("zebra-tc22");

// PC erkennen (NICHT mobil + kein Zebra)
if (!isMobile && !isZebraTC21 && !isZebraTC22) {
    document.body.classList.add("pc-device");
}

/* Debug-Ausgabe */
const deviceInfo = document.getElementById("deviceInfo");
if (deviceInfo) {
    if (isZebraTC22) deviceInfo.textContent = "Gerät: Zebra TC22";
    else if (isZebraTC21) deviceInfo.textContent = "Gerät: Zebra TC21";
    else if (isMobile) deviceInfo.textContent = "Gerät: Android / iOS";
    else deviceInfo.textContent = "Gerät: PC";
}
/* ============================================================
   BUILD INFO
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    const lastMod = new Date(document.lastModified);
    const build =
        lastMod.getFullYear().toString() +
        String(lastMod.getMonth() + 1).padStart(2, "0") +
        String(lastMod.getDate()).padStart(2, "0") + "." +
        String(lastMod.getHours()).padStart(2, "0") +
        String(lastMod.getMinutes()).padStart(2, "0");

    const el = document.getElementById("buildInfo");
    if (el) el.textContent = "Build " + build;
});
/* ===========================================
   POPUP – Sonstige Kunden
=========================================== */

const popupOverlay = document.getElementById("popupOverlay");
const popupInput = document.getElementById("popupInput");
const popupOk = document.getElementById("popupOk");
const popupCancel = document.getElementById("popupCancel");
const sonstigeBtn = document.getElementById("sonstigeBtn");

function openPopup() {
    popupOverlay.style.display = "flex";
    popupInput.value = "";
    popupInput.focus();
}

function closePopup() {
    popupOverlay.style.display = "none";
}

// Enter = OK
popupInput.addEventListener("keydown", e => {
    if (e.key === "Enter") popupOk.click();
});

// OK klicken
popupOk.onclick = () => {
    const name = popupInput.value.trim();
    if (!name) return;

    customCustomer = name;
    selectedCustomer = "SONSTIGE";

    sonstigeBtn.textContent = name;
    closePopup();
};

// Abbrechen
popupCancel.onclick = () => {
    closePopup();
};



/* ===========================================
   KUNDENAUSWAHL
=========================================== */

document.querySelectorAll(".kunde-btn").forEach(btn => {
    btn.onclick = () => {

        document.querySelectorAll(".kunde-btn")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        const kunde = btn.dataset.kunde;

        if (kunde === "SONSTIGE") {
            openPopup();
            return;
        }

        selectedCustomer = kunde;

        // Sonstige zurücksetzen
        customCustomer = "";
        sonstigeBtn.textContent = "Sonstige Kunden";
    };
});



/* ===========================================
   DRUCKART
=========================================== */

const btnKanten = document.getElementById("btnKanten");
const btnSchweissen = document.getElementById("btnSchweissen");

btnKanten.onclick = () => {
    selectedArt = "kanten";
    btnKanten.classList.add("active");
    btnSchweissen.classList.remove("active");
};

btnSchweissen.onclick = () => {
    selectedArt = "schweissen";
    btnSchweissen.classList.add("active");
    btnKanten.classList.remove("active");
};



/* ===========================================
   DRUCKEN
=========================================== */

document.getElementById("druckBtn").onclick = () => {

    if (!selectedCustomer) {
        alert("Bitte einen Kunden auswählen!");
        return;
    }

    let kundeName =
        selectedCustomer === "SONSTIGE"
            ? customCustomer
            : selectedCustomer;

    if (!kundeName || kundeName.trim() === "") {
        alert("Bitte Kundennamen eingeben!");
        return;
    }

    const url =
        "druck_kanten.html?kunde=" +
        encodeURIComponent(kundeName) +
        "&art=" + encodeURIComponent(selectedArt);

    window.location.href = url;
};



/* ===========================================
   ZURÜCK BUTTON
=========================================== */

document.getElementById("backBtn").onclick = () => history.back();

let selectedCustomer = "";
let customCustomer = "";
let selectedArt = "kanten";
/* ============================================================
   GERÄTEERKENNUNG (PC / iOS / Android / TC21 / TC22)
============================================================ */
const ua  = navigator.userAgent.toLowerCase();
const sw  = window.screen.width;
const sh  = window.screen.height;
const dpr = window.devicePixelRatio;

// generell mobile?
const isMobile = /android|iphone|ipad|ipod/i.test(ua);

// TC21
const isZebraTC21 = ua.includes("android") && sw === 360 && sh === 640;

// TC22
const isZebraTC22 = ua.includes("android") && sw === 360 && sh === 720 && dpr === 3;

// Klassen setzen
if (isZebraTC21) document.body.classList.add("zebra-tc21");
if (isZebraTC22) document.body.classList.add("zebra-tc22");

// PC erkennen (NICHT mobil + kein Zebra)
if (!isMobile && !isZebraTC21 && !isZebraTC22) {
    document.body.classList.add("pc-device");
}

/* Debug-Ausgabe oben links */
const deviceInfo = document.getElementById("deviceInfo");
if (deviceInfo) {
    if (isZebraTC22) deviceInfo.textContent = "Gerät: Zebra TC22";
    else if (isZebraTC21) deviceInfo.textContent = "Gerät: Zebra TC21";
    else if (isMobile) deviceInfo.textContent = "Gerät: Android / iOS";
    else deviceInfo.textContent = "Gerät: PC";
}
/* Kunden-Auswahl */
document.querySelectorAll(".kundeBtn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".kundeBtn")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        const kunde = btn.dataset.kunde;

        if (kunde === "SONSTIGE") {
            openKeyboard();
            return;
        }

        selectedCustomer = kunde;
    };
});

/* Art-Auswahl */
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

/* Drucken */
document.getElementById("btnDrucken").onclick = () => {
    if (!selectedCustomer) {
        alert("Bitte einen Kunden auswählen!");
        return;
    }

    const kunde =
        selectedCustomer === "SONSTIGE"
            ? customCustomer
            : selectedCustomer;

    window.location.href =
        "druck_kanten.html?kunde=" +
        encodeURIComponent(kunde) +
        "&art=" +
        encodeURIComponent(selectedArt);
};

/* Popup Tastatur */
const popup = document.getElementById("keyboardPopup");
const kbInput = document.getElementById("keyboardInput");

function openKeyboard() {
    popup.style.display = "flex";
    kbInput.value = "";
    kbInput.focus();
}

document.getElementById("kbCancel").onclick = () => {
    popup.style.display = "none";
};

document.getElementById("kbClear").onclick = () => {
    kbInput.value = "";
};

document.getElementById("kbOk").onclick = () => {
    const name = kbInput.value.trim();
    if (!name) return;

    customCustomer = name;
    selectedCustomer = "SONSTIGE";

    document.getElementById("sonstigeBtn").textContent = name;
    popup.style.display = "none";
};

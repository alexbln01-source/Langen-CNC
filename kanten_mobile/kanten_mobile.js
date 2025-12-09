let selectedCustomer = "";
let customCustomer = "";
let selectedArt = "kanten";

/* ===========================================
   GERÄTEINFO + BUILDINFO
=========================================== */
(function () {
    const ua = navigator.userAgent.toLowerCase();
    const body = document.body;

    let device = "Unbekanntes Gerät";

    if (ua.includes("zebra")) {
        if (ua.includes("tc21")) device = "Zebra TC21";
        else if (ua.includes("tc22")) device = "Zebra TC22";
        else if (ua.includes("tc26")) device = "Zebra TC26";
        else if (ua.includes("tc27")) device = "Zebra TC27";
        else device = "Zebra Scanner";
    } else if (ua.includes("android")) {
        device = "Android Gerät";
    } else if (ua.includes("iphone") || ua.includes("ipad")) {
        device = "iOS Gerät";
    } else {
        device = "PC";
        body.classList.add("pc-device");
    }

    document.getElementById("deviceInfo").textContent = "Gerät: " + device;

    // Build erzeugen
    const now = new Date();
    const build =
        now.getFullYear().toString() +
        (now.getMonth()+1).toString().padStart(2, "0") +
        now.getDate().toString().padStart(2, "0") + "." +
        now.getHours().toString().padStart(2, "0") +
        now.getMinutes().toString().padStart(2, "0");

    document.getElementById("buildInfo").textContent = "Build " + build;
})();
    

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

// Enter speichern
popupInput.addEventListener("keydown", e => {
    if (e.key === "Enter") popupOk.click();
});

// Popup OK
popupOk.onclick = () => {
    const name = popupInput.value.trim();
    if (!name) return;

    customCustomer = name;
    selectedCustomer = "SONSTIGE";

    sonstigeBtn.textContent = name;

    closePopup();
};

// Popup abbrechen
popupCancel.onclick = () => {
    closePopup();
};


/* ===========================================
   KUNDENAUSWAHL
=========================================== */
document.querySelectorAll(".kunde-btn").forEach(btn => {
    btn.onclick = () => {
        // Active entfernen
        document.querySelectorAll(".kunde-btn")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        const kunde = btn.dataset.kunde;

        if (kunde === "SONSTIGE") {
            openPopup();
            return;
        }

        // Normaler Kunde
        selectedCustomer = kunde;

        // Button zurücksetzen!
        sonstigeBtn.textContent = "Sonstige Kunden";

        customCustomer = "";
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

    // korrekter Name für Übergabe
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
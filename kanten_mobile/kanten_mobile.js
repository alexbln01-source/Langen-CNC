/************************************************************
 *  KANTEN – MOBILE VERSION (modernes Layout, alte Logik)
 ************************************************************/

let selectedCustomer = "";
let customCustomer = "";

/* ============================================================
   DEVICE-ERKENNUNG (wie Beschichtung)
============================================================ */
(function detectDevice() {
    const ua = navigator.userAgent.toLowerCase();
    const body = document.body;

    const isZebra = ua.includes("zebra");
    const isTC21 = isZebra && (ua.includes("tc21") || ua.includes("tc26"));
    const isTC22 = isZebra && (ua.includes("tc22") || ua.includes("tc27"));
    const isMobile = /android|iphone|ipad/.test(ua);

    if (isTC21) body.classList.add("zebra-tc21");
    if (isTC22) body.classList.add("zebra-tc22");
    if (!isMobile && !isZebra) body.classList.add("pc-device");

    const info = document.getElementById("deviceInfo");
    if (info) {
        if (isTC21) info.textContent = "Gerät: Zebra TC21";
        else if (isTC22) info.textContent = "Gerät: Zebra TC22";
        else if (isMobile) info.textContent = "Gerät: Mobilgerät";
        else info.textContent = "Gerät: PC";
    }

    const buildInfo = document.getElementById("buildInfo");
    if (buildInfo) {
        const now = new Date();
        const build = now.getFullYear().toString() +
                      (now.getMonth() + 1).toString().padStart(2, "0") +
                      now.getDate().toString().padStart(2, "0") + "." +
                      now.getHours().toString().padStart(2, "0") +
                      now.getMinutes().toString().padStart(2, "0");

        buildInfo.textContent = "Build " + build;
    }
})();

/* ============================================================
   KUNDEN-LAYOUTS (unverändert)
============================================================ */
const kundenLayouts = {
    "Bergmann M-H": [
        { text: "<kunde>", size: "48pt", marginTop: "1mm" },
        { text: "Kanten", size: "48pt", marginTop: "2mm" },
        { text: "K-Termin: ________", size: "28pt", marginTop: "12mm" },
        { text: "Palettennummer: ________", size: "28pt", marginTop: "12mm" }
    ],
    "Bücker": [
        { text: "<kunde>", size: "48pt", marginTop: "1mm" },
        { text: "Kanten", size: "48pt", marginTop: "2mm" },
        { text: "K-Termin: ________", size: "28pt", marginTop: "12mm" },
        { text: "Palettennummer: ________", size: "28pt", marginTop: "12mm" }
    ],
    "Grimme": [
        { text: "<kunde>", size: "48pt", marginTop: "1mm" },
        { text: "Kanten", size: "48pt", marginTop: "2mm" },
        { text: "K-Termin: ________", size: "28pt", marginTop: "12mm" },
        { text: "Palettennummer: ________", size: "28pt", marginTop: "12mm" }
    ],
    "Janzen": [
        { text: "<kunde>", size: "48pt", marginTop: "1mm" },
        { text: "Kanten", size: "48pt", marginTop: "2mm" },
        { text: "K-Termin: ________", size: "28pt", marginTop: "12mm" },
        { text: "Palettennummer: ________", size: "28pt", marginTop: "12mm" }
    ],
    "Krone Spelle": [
        { text: "<kunde>", size: "48pt", marginTop: "1mm" },
        { text: "Kanten", size: "48pt", marginTop: "2mm" },
        { text: "K-Termin: ________", size: "28pt", marginTop: "12mm" },
        { text: "Palettennummer: ________", size: "28pt", marginTop: "12mm" }
    ],
    "L.Bergmann": [
        { text: "<kunde>", size: "48pt", marginTop: "1mm" },
        { text: "Kanten", size: "48pt", marginTop: "2mm" },
        { text: "K-Termin: ________", size: "28pt", marginTop: "12mm" },
        { text: "Palettennummer: ________", size: "28pt", marginTop: "12mm" }
    ],
    "PAUS": [
        { text: "<kunde>", size: "48pt", marginTop: "14mm" },
        { text: "Kanten", size: "48pt", marginTop: "2mm" },
        { text: "K-Termin: ________", size: "28pt", marginTop: "12mm" }
    ],
    "TOS": [
        { text: "<kunde>", size: "48pt", marginTop: "18mm" },
        { text: "Kanten", size: "48pt", marginTop: "2mm" }
    ],
    "SONSTIGE": [
        { text: "<kundeneingabe>", size: "48pt", marginTop: "1mm" },
        { text: "Kanten", size: "48pt", marginTop: "2mm" },
        { text: "K-Termin: ________", size: "28pt", marginTop: "12mm" },
        { text: "Palettennummer: ________", size: "28pt", marginTop: "12mm" }
    ]
};

/* ============================================================
   KUNDEN-AUSWAHL
============================================================ */
document.querySelectorAll(".kunde-btn").forEach(btn => {
    btn.addEventListener("click", () => {

        document.querySelectorAll(".kunde-btn")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        const kunde = btn.dataset.kunde;

        if (kunde === "SONSTIGE") {
            openKeyboard();
            return;
        }

        selectedCustomer = kunde;
    });
});

/* ============================================================
   POPUP FÜR „SONSTIGE KUNDEN“
============================================================ */
const kbPopup   = document.getElementById("keyboardPopup");
const kbOverlay = document.getElementById("keyboardOverlay");
const kbInput   = document.getElementById("kbInput");

document.getElementById("kbCloseBtn").onclick = () => closeKeyboard();
document.getElementById("kbClearBtn").onclick = () => kbInput.value = "";

document.getElementById("kbOkBtn").onclick = () => {
    const val = kbInput.value.trim();
    if (!val) {
        alert("Bitte Kundenname eingeben.");
        return;
    }

    customCustomer = val;
    selectedCustomer = "SONSTIGE";

    closeKeyboard();
};

function openKeyboard() {
    kbInput.value = customCustomer;
    kbPopup.style.display = "flex";
    kbOverlay.style.display = "block";
    kbInput.focus();
}

function closeKeyboard() {
    kbPopup.style.display = "none";
    kbOverlay.style.display = "none";
}

/* ============================================================
   NAVIGATION
============================================================ */
document.getElementById("backBtn").onclick = () => history.back();

/* ============================================================
   DRUCKEN
============================================================ */
document.getElementById("druckBtn").onclick = () => {

    if (!selectedCustomer) {
        alert("Bitte Kunde wählen!");
        return;
    }

    const data = {
        kunde: selectedCustomer,
        custom: customCustomer,
        layout: kundenLayouts[selectedCustomer]
    };

    window.location.href =
        "druck_kanten.html?data=" + encodeURIComponent(JSON.stringify(data));
};
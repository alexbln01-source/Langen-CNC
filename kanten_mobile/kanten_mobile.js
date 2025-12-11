let selectedCustomer = "";
let customCustomer = "";
let selectedArt = "kanten";

/* ========== GERÄTE-ERKENNUNG ========== */
const ua = navigator.userAgent.toLowerCase();
const sw = window.screen.width;
const sh = window.screen.height;
const dpr = window.devicePixelRatio;

const isMobile = /android|iphone|ipad|ipod/i.test(ua);
const isZebraTC21 = ua.includes("android") && sw === 360 && sh === 640;
const isZebraTC22 = ua.includes("android") && sw === 360 && sh === 720 && dpr === 3;

if (isZebraTC21) document.body.classList.add("zebra-tc21");
if (isZebraTC22) document.body.classList.add("zebra-tc22");
if (!isMobile && !isZebraTC21 && !isZebraTC22) document.body.classList.add("pc-device");

/* ========== KUNDEN-AUSWAHL ========== */
document.querySelectorAll(".kundeBtn").forEach(btn => {
    btn.onclick = () => {

        document.querySelectorAll(".kundeBtn")
            .forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const kunde = btn.dataset.kunde;

        // SONSTIGE
        if (kunde === "SONSTIGE") {
            selectedCustomer = "SONSTIGE";
            const row = document.getElementById("sonstigeInputRow");
            const input = document.getElementById("sonstigeInput");

            row.style.display = "block";
            input.value = "";
            input.focus();  // → öffnet Android Tastatur
            return;
        }

        // normale Kunden
        selectedCustomer = kunde;

        // Eingabefeld ausblenden falls vorher sichtbar
        document.getElementById("sonstigeInputRow").style.display = "none";
    };
});

/* ========== ART-AUSWAHL ========== */
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

/* ========== DRUCKEN ========== */
document.getElementById("btnDrucken").onclick = () => {

    let kundeName = "";

    if (selectedCustomer === "SONSTIGE") {
        kundeName = document.getElementById("sonstigeInput").value.trim();
        if (!kundeName) {
            alert("Bitte Kundennamen eingeben!");
            return;
        }
    } else {
        kundeName = selectedCustomer;
    }

    window.location.href =
        "druck_kanten.html?kunde=" + encodeURIComponent(kundeName) +
        "&art=" + encodeURIComponent(selectedArt);
};

/* ========== ZURÜCK ========== */
document.getElementById("btnBack").onclick = () => history.back();

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
        document.querySelectorAll(".kundeBtn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const kunde = btn.dataset.kunde;

        if (kunde === "SONSTIGE") {
            openKeyboard();
            return;
        }

        selectedCustomer = kunde;
    };
});

/* ========== ART-AUSWAHL ========== */
document.getElementById("btnKanten").onclick = () => {
    selectedArt = "kanten";
    btnKanten.classList.add("active");
    btnSchweissen.classList.remove("active");
};

document.getElementById("btnSchweissen").onclick = () => {
    selectedArt = "schweissen";
    btnSchweissen.classList.add("active");
    btnKanten.classList.remove("active");
};

/* ========== DRUCKEN ========== */
document.getElementById("btnDrucken").onclick = () => {
    if (!selectedCustomer) {
        alert("Bitte einen Kunden auswählen!");
        return;
    }

    const kundeName = selectedCustomer === "SONSTIGE" ? customCustomer : selectedCustomer;

    window.location.href =
        "druck_kanten.html?kunde=" + encodeURIComponent(kundeName) +
        "&art=" + encodeURIComponent(selectedArt);
};

/* ========== ZURÜCK ========== */
document.getElementById("btnBack").onclick = () => history.back();

/* ========== POPUP ========== */
const popup = document.getElementById("keyboardPopup");
const kbInput = document.getElementById("keyboardInput");

function openKeyboard() {
    popup.style.display = "flex";
    kbInput.value = "";
    kbInput.focus();
}

document.getElementById("kbCancel").onclick = () => popup.style.display = "none";
document.getElementById("kbClear").onclick = () => kbInput.value = "";
document.getElementById("kbOk").onclick = () => {
    const name = kbInput.value.trim();
    if (!name) return;

    customCustomer = name;
    selectedCustomer = "SONSTIGE";
    document.getElementById("sonstigeBtn").textContent = name;

    popup.style.display = "none";
};

/* ========== TASTATUR ========== */
const keyboardGrid = document.getElementById("keyboardGrid");
const keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

keyboardGrid.innerHTML = "";
keys.forEach(k => {
    const btn = document.createElement("button");
    btn.textContent = k;
    btn.onclick = () => kbInput.value += k;
    keyboardGrid.appendChild(btn);
});

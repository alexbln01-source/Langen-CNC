let selectedCustomer = "";
let selectedArt = "";

/* =========================
   KUNDEN BUTTONS
========================= */
document.querySelectorAll(".kundeBtn").forEach(btn => {
    btn.onclick = () => {

        document.querySelectorAll(".kundeBtn")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        const kunde = btn.dataset.kunde;

        // ⬇️ TASTATUR NUR BEI SONSTIGE
        if (kunde === "SONSTIGE") {
            selectedCustomer = "SONSTIGE";
            openKeyboard();
        } else {
            selectedCustomer = kunde;
            closeKeyboard();
        }
    };
});

/* =========================
   ART BUTTONS
========================= */
const btnKanten = document.getElementById("btnKanten");
const btnSchweissen = document.getElementById("btnSchweissen");
const btnBohrwerk = document.getElementById("btnBohrwerk");

btnKanten.onclick = () => setArt("kanten", btnKanten);
btnSchweissen.onclick = () => setArt("schweissen", btnSchweissen);
btnBohrwerk.onclick = () => setArt("bohrwerk", btnBohrwerk);

function setArt(art, btn) {
    selectedArt = art;
    document.querySelectorAll(".artBtn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
}

/* =========================
   DRUCKEN
========================= */
document.getElementById("btnDrucken").onclick = () => {

    if (!selectedCustomer) {
        alert("Bitte Kunden auswählen!");
        return;
    }

    if (!selectedArt) {
        alert("Bitte Art auswählen!");
        return;
    }

    let kundeName = selectedCustomer;

    if (selectedCustomer === "SONSTIGE") {
        kundeName = keyboardInput.value.trim();
        if (!kundeName) {
            alert("Bitte Kundennamen eingeben!");
            return;
        }
    }

    location.href =
        "druck_kanten.html?kunde=" + encodeURIComponent(kundeName) +
        "&art=" + encodeURIComponent(selectedArt);
};

/* =========================
   ZURÜCK
========================= */
document.getElementById("btnBack").onclick = () => history.back();

/* =========================
   TASTATUR
========================= */
const popup = document.getElementById("keyboardPopup");
const keyboardInput = document.getElementById("keyboardInput");
const sonstigeBtn = document.getElementById("sonstigeBtn");

function openKeyboard() {
    popup.style.display = "flex";
    keyboardInput.value = "";
    keyboardInput.focus();
}

function closeKeyboard() {
    popup.style.display = "none";
}

/* Buchstaben */
document.querySelectorAll(".kb").forEach(k => {
    k.onclick = () => {
        if (k.id === "kbDelete") return;
        if (k.id === "kbSpace") return;
        if (k.id === "kbOk") return;
        keyboardInput.value += k.textContent;
    };
});

/* Sondertasten */
kbDelete.onclick = () => {
    keyboardInput.value = keyboardInput.value.slice(0, -1);
};

kbSpace.onclick = () => {
    keyboardInput.value += " ";
};

kbOk.onclick = () => {
    const name = keyboardInput.value.trim();
    if (!name) return;

    sonstigeBtn.textContent = name;
    selectedCustomer = name;
    closeKeyboard();
};

kbCancel.onclick = closeKeyboard;

/* =========================
   ✅ ENTER / RETURN AM PC
========================= */
keyboardInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        e.preventDefault();
        kbOk.click();
    }
});

/* ============================================================
   GERÄTEERKENNUNG
============================================================ */
const ua  = navigator.userAgent.toLowerCase();
const sw  = window.screen.width;
const sh  = window.screen.height;
const dpr = window.devicePixelRatio;

const isMobile = /android|iphone|ipad|ipod/i.test(ua);
const isZebraTC21 = ua.includes("android") && sw === 360 && sh === 640;
const isZebraTC22 = ua.includes("android") && sw === 360 && sh === 720 && dpr === 3;

// Klassen setzen
if (isZebraTC21) document.body.classList.add("zebra-tc21");
if (isZebraTC22) document.body.classList.add("zebra-tc22");
if (!isMobile && !isZebraTC21 && !isZebraTC22) {
    document.body.classList.add("pc-device");
}

// Anzeige oben
const deviceInfo = document.getElementById("deviceInfo");
if (deviceInfo) {
    if (isZebraTC22) deviceInfo.textContent = "Gerät: Zebra TC22";
    else if (isZebraTC21) deviceInfo.textContent = "Gerät: Zebra TC21";
    else if (isMobile) deviceInfo.textContent = "Gerät: Mobile";
    else deviceInfo.textContent = "Gerät: PC";
}

/* ============================================================
   BUILD INFO
============================================================ */
const lastMod = new Date(document.lastModified);
const build =
    lastMod.getFullYear() +
    String(lastMod.getMonth() + 1).padStart(2, "0") +
    String(lastMod.getDate()).padStart(2, "0") + "." +
    String(lastMod.getHours()).padStart(2, "0") +
    String(lastMod.getMinutes()).padStart(2, "0");

const buildInfo = document.getElementById("buildInfo");
if (buildInfo) {
    buildInfo.textContent = "Build " + build;
}

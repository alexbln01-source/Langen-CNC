let selectedCustomer = "";
let selectedArt = "";

/* =========================
   DOM REFS
========================= */
const popup = document.getElementById("keyboardPopup");
const keyboardInput = document.getElementById("keyboardInput");
const sonstigeBtn = document.getElementById("sonstigeBtn");
const kundenArea = document.getElementById("kundenArea");

/* ✅ POPUP IMMER ZU BEIM START */
popup.style.display = "none";
kundenArea.classList.add("disabled");

/* =========================
   KUNDEN BUTTONS
========================= */
document.querySelectorAll(".kundeBtn").forEach(btn => {
    btn.onclick = () => {

        document.querySelectorAll(".kundeBtn")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        const kunde = btn.dataset.kunde;

        if (kunde === "SONSTIGE") {
            selectedCustomer = "SONSTIGE";
            openKeyboard();            // 👈 NUR HIER
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

    kundenArea.classList.remove("disabled"); // 👈 Kunden erst jetzt aktiv
}

/* =========================
   DRUCKEN
========================= */
document.getElementById("btnDrucken").onclick = () => {

    if (!selectedArt) {
        alert("Bitte Art auswählen!");
        return;
    }

    if (!selectedCustomer) {
        alert("Bitte Kunden auswählen!");
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
   TASTATUR FUNKTIONEN
========================= */
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

/* ENTER auf PC */
keyboardInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        e.preventDefault();
        kbOk.click();
    }
});

/* =========================
   GERÄTEERKENNUNG
========================= */
const ua  = navigator.userAgent.toLowerCase();
const sw  = screen.width;
const sh  = screen.height;
const dpr = devicePixelRatio;

const isMobile = /android|iphone|ipad|ipod/i.test(ua);
const isTC21 = ua.includes("android") && sw === 360 && sh === 640;
const isTC22 = ua.includes("android") && sw === 360 && sh === 720 && dpr === 3;

if (isTC21) document.body.classList.add("zebra-tc21");
if (isTC22) document.body.classList.add("zebra-tc22");
if (!isMobile && !isTC21 && !isTC22) {
    document.body.classList.add("pc-device");
}

const deviceInfo = document.getElementById("deviceInfo");
if (deviceInfo) {
    deviceInfo.textContent =
        isTC22 ? "Gerät: Zebra TC22" :
        isTC21 ? "Gerät: Zebra TC21" :
        isMobile ? "Gerät: Mobile" :
        "Gerät: PC";
}

/* =========================
   BUILD INFO
========================= */
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

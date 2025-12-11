let selectedCustomer = "";
let customCustomer = "";
let selectedArt = "kanten";

/* ==========================
   Geräte-Erkennung
========================== */
const ua = navigator.userAgent.toLowerCase();
const sw = screen.width;
const sh = screen.height;
const dpr = devicePixelRatio;

const isMobile = /android|iphone|ipad|ipod/i.test(ua);
const isTC21 = ua.includes("android") && sw === 360 && sh === 640;
const isTC22 = ua.includes("android") && sw === 360 && sh === 720 && dpr === 3;

if (isTC21) document.body.classList.add("zebra-tc21");
if (isTC22) document.body.classList.add("zebra-tc22");
if (!isMobile && !isTC21 && !isTC22) document.body.classList.add("pc-device");

/* ==========================
   Kunden-Auswahl
========================== */
document.querySelectorAll(".kundeBtn").forEach(btn => {
    btn.onclick = () => {

        document.querySelectorAll(".kundeBtn")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        const kunde = btn.dataset.kunde;

        if (kunde === "SONSTIGE") {
            selectedCustomer = "SONSTIGE";
            openKeyboard();
            return;
        }

        selectedCustomer = kunde;
    };
});

/* ==========================
   Art Auswahl
========================== */
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

/* ==========================
   Drucken
========================== */
btnDrucken.onclick = () => {

    let kundeName = "";

    if (selectedCustomer === "SONSTIGE") {
        kundeName = keyboardInput.value.trim();
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

/* ==========================
   Zurück
========================== */
btnBack.onclick = () => history.back();

/* ==========================
   Popup Tastatur
========================== */
const popup = document.getElementById("keyboardPopup");
const inputField = document.getElementById("keyboardInput");

function openKeyboard() {
    popup.style.display = "flex";
    inputField.value = "";
    inputField.focus();
}

/* Zeichen anhängen */
document.querySelectorAll(".kb").forEach(key => {

    key.onclick = () => {

        if (key.id === "kbDelete") return;
        if (key.id === "kbSpace") return;
        if (key.id === "kbOk") return;

        inputField.value += key.textContent;
    };
});

document.getElementById("kbDelete").onclick = () => {
    inputField.value = inputField.value.slice(0, -1);
};

document.getElementById("kbSpace").onclick = () => {
    inputField.value += " ";
};

document.getElementById("kbOk").onclick = () => {
    customCustomer = inputField.value.trim();
    if (!customCustomer) return;

    document.getElementById("sonstigeBtn").textContent = customCustomer;
    popup.style.display = "none";
};

document.getElementById("kbCancel").onclick = () => {
    popup.style.display = "none";
};

/* ==========================
   ENTER / RETURN am PC
========================== */
inputField.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        e.preventDefault();
        document.getElementById("kbOk").click();
    }
});

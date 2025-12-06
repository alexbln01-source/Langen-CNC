let activeInput = null;
let currentColor = "red";
let scanBuffer = "";

/* =============================
   GERÄTEKENNUNG
============================= */
const ua = navigator.userAgent;
const sw = screen.width;
const sh = screen.height;
const dpr = devicePixelRatio;

const isTC21 = ua.includes("TC21");
const isTC22 = ua.includes("TC22") || (sw === 360 && sh === 720 && dpr === 3);
const isAndroid = /android/i.test(ua);
const isMobile = isTC21 || isTC22 || isAndroid;

document.getElementById("deviceInfo").textContent =
    isTC22 ? "Gerät: Zebra TC22" :
    isTC21 ? "Gerät: Zebra TC21" :
    isAndroid ? "Gerät: Android" :
    "Gerät: PC";

/* =============================
   PC → Eingaben normal
============================= */
if (!isMobile) {
    document.getElementById("openKeyboardBtn").style.display = "none";
    document.getElementById("kommission").removeAttribute("readonly");
    document.getElementById("lieferdatum").removeAttribute("readonly");
}

/* =============================
   TC → Cursor sofort im Kommissionsfeld
============================= */
window.onload = () => {
    document.getElementById("kommission").value = "";
    document.getElementById("lieferdatum").value = "";

    if (isMobile) document.getElementById("kommission").focus();
};

/* =============================
   FARBWAHL
============================= */
document.querySelectorAll(".color-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentColor = btn.dataset.color;
    };
});

/* =============================
   POPUP TASTATUR
============================= */
const popup = document.getElementById("keyboardPopup");
const popupInput = document.getElementById("keyboardInput");
const title = document.getElementById("keyboardTitle");

function openKeyboard(inputId) {
    activeInput = document.getElementById(inputId);
    title.textContent = inputId === "kommission" ? "Kommissionsnummer" : "Lieferdatum";
    popupInput.value = "";
    popup.style.display = "flex";
    setTimeout(() => popupInput.focus(), 50);
}

/* Öffnen */
document.getElementById("openKeyboardBtn").onclick = () => openKeyboard("kommission");

/* Schließen */
document.getElementById("keyboardClose").onclick = () => {
    popup.style.display = "none";
};

/* Löschen */
document.getElementById("keyboardDelete").onclick = () =>
    popupInput.value = popupInput.value.slice(0, -1);

/* OK */
document.getElementById("keyboardOK").onclick = () => {
    if (!activeInput) return;

    let value = popupInput.value.replace(/\D/g, "");

    if (activeInput.id === "lieferdatum") {
        if (value.length === 3) value = "0" + value;
        if (value.length >= 4)
            value = value.slice(0, 2) + "." + value.slice(2, 4);
        activeInput.value = value;
        popup.style.display = "none";
        return;
    }

    // Kommission
    activeInput.value = value;
    popup.style.display = "none";

    // weiter zu Datum
    openKeyboard("lieferdatum");
};

/* ENTER im Popup */
popupInput.addEventListener("keydown", e => {
    if (e.key === "Enter") document.getElementById("keyboardOK").onclick();
});

/* =============================
   SCANNER (TC)
============================= */
document.addEventListener("keydown", e => {

    if (!isMobile) return;

    if (e.key === "Enter") {
        let text = scanBuffer.trim();

        if (text.includes("K:") && text.includes("D:")) {
            const kom = text.match(/K:(.*?);/)[1];
            const raw = text.match(/D:(.*)/)[1].replace(/\D/g, "");

            let dat = raw;
            if (dat.length === 3) dat = "0" + dat;
            if (dat.length >= 4)
                dat = dat.slice(0, 2) + "." + dat.slice(2, 4);

            document.getElementById("kommission").value = kom;
            document.getElementById("lieferdatum").value = dat;
        }

        scanBuffer = "";
    } else {
        scanBuffer += e.key;
    }
});

/* =============================
   DRUCKEN
============================= */
document.getElementById("druckenBtn").onclick = () => {

    const kom = document.getElementById("kommission").value.trim();
    const dat = document.getElementById("lieferdatum").value.trim();

    if (!kom) return alert("Bitte Kommissionsnummer eingeben!");
    if (!dat) return alert("Bitte Lieferdatum eingeben!");

    const data = {
        kommission: kom,
        lieferdatum: dat,
        vorgezogen: document.getElementById("chkVorgezogen").checked,
        farbe: currentColor
    };

    const json = JSON.stringify(data);

    // Android App?
    if (window.Android && typeof Android.printPaus === "function") {
        Android.printPaus(json);
        return;
    }

    window.location.href = "paus_druck.html?data=" + encodeURIComponent(json);
};

/* =============================
   ZURÜCK
============================= */
document.getElementById("backBtn").onclick = () => history.back();

/* =============================
   BUILD NUMMER
============================= */
document.addEventListener("DOMContentLoaded", () => {
    const lastMod = new Date(document.lastModified);
    const build =
        lastMod.getFullYear() + "-" +
        String(lastMod.getMonth()+1).padStart(2,"0") +
        "-" +
        String(lastMod.getDate()).padStart(2,"0") +
        "." +
        String(lastMod.getHours()).padStart(2,"0") +
        String(lastMod.getMinutes()).padStart(2,"0");

    document.getElementById("buildInfo").textContent = "Build " + build;
});

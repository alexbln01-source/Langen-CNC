let activeField = null;
let currentColor = "red";
let scanBuffer = "";

/* =============================
   Geräte erkennen
============================= */
const ua = navigator.userAgent;
const sw = window.screen.width;
const sh = window.screen.height;
const dpr = window.devicePixelRatio;

const isZebraTC21 = ua.includes("Android") && sw === 360 && sh === 640;
const isZebraTC22 = ua.includes("Android") && sw === 360 && sh === 720 && dpr === 3;
const isMobile = /Android|iPhone|iPad|iPod/i.test(ua) && !isZebraTC21 && !isZebraTC22;

if (!isMobile && !isZebraTC21 && !isZebraTC22) {
    document.body.classList.add("pc-device");
}

const deviceInfo = document.getElementById("deviceInfo");
if (deviceInfo) {
    if (isZebraTC22) deviceInfo.textContent = "Gerät: Zebra TC22";
    else if (isZebraTC21) deviceInfo.textContent = "Gerät: Zebra TC21";
    else if (isMobile) deviceInfo.textContent = "Gerät: Android";
    else deviceInfo.textContent = "Gerät: PC";
}

/* =============================
   Build Nummer
============================= */
document.addEventListener("DOMContentLoaded", () => {
    const d = new Date(document.lastModified);
    const b = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}.${String(d.getHours()).padStart(2,"0")}${String(d.getMinutes()).padStart(2,"0")}`;
    document.getElementById("buildInfo").textContent = "Build " + b;
});

/* =============================
   Farbwahl
============================= */
document.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentColor = btn.dataset.color;
    });
});

/* =============================
   Popup Tastatur öffnen
============================= */
const numKb = document.getElementById("numKeyboard");
const kbInput = document.getElementById("kbInput");
const kbTitle = document.getElementById("kbTitle");

document.getElementById("openKeyboardBtn").onclick = () => {
    activeField = document.getElementById("kommission");
    kbTitle.textContent = "Kommissionsnummer";
    kbInput.value = "";
    numKb.style.display = "flex";
    setTimeout(() => kbInput.focus(), 50);
};

/* =============================
   Popup Zahlen-Tastatur Logik
============================= */
document.querySelectorAll(".kb-key").forEach(key => {
    key.onclick = () => kbInput.value += key.textContent;
});

document.getElementById("kbDel").onclick = () => {
    kbInput.value = kbInput.value.slice(0, -1);
};

document.getElementById("kbOk").onclick = () => {
    if (!activeField) return;

    activeField.value = kbInput.value;

    if (activeField.id === "kommission") {
        activeField = document.getElementById("lieferdatum");
        kbTitle.textContent = "Lieferdatum (TTMM)";
        kbInput.value = "";
        return;
    }

    if (activeField.id === "lieferdatum") {
        numKb.style.display = "none";
        activeField = null;
    }
};

/* =============================
   Scanner — Zebra
============================= */
document.addEventListener("keydown", (e) => {
    if (numKb.style.display === "flex") return; // Popup offen? Kein Scan

    if (e.key === "Enter") {
        const txt = scanBuffer.trim();

        if (txt.includes("K:") && txt.includes("D:")) {
            const kom = txt.match(/K:(.*?);/)[1];
            let dat = txt.match(/D:(.*)/)[1].replace(/\D/g, "");

            if (dat.length === 3) dat = "0" + dat;
            if (dat.length >= 4) dat = dat.slice(0, 2) + "." + dat.slice(2, 4);

            document.getElementById("kommission").value = kom;
            document.getElementById("lieferdatum").value = dat;
        }

        scanBuffer = "";
    } else {
        scanBuffer += e.key;
    }
});

/* =============================
   Drucken
============================= */
document.getElementById("druckenBtn").onclick = () => {
    const kom = kommission.value.trim();
    const dat = lieferdatum.value.trim();

    if (!kom) return alert("Bitte Kommissionsnummer eingeben!");
    if (!dat) return alert("Bitte Lieferdatum eingeben!");

    const data = {
        kommission: kom,
        lieferdatum: dat,
        vorgezogen: chkVorgezogen.checked,
        farbe: currentColor
    };

    window.location.href = "paus_druck.html?data=" + encodeURIComponent(JSON.stringify(data));
};

document.getElementById("backBtn").onclick = () => history.back();

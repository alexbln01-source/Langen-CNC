let selectedType = null;
let isEilt = false;

/* ============================================================
   GRUNDREFERENZEN
============================================================ */
const beistell   = document.getElementById("beistellInput");
const kundenname = document.getElementById("kundeInput");
const numKb      = document.getElementById("numKeyboard");
const alphaKb    = document.getElementById("alphaKeyboard");

const backBtn    = document.getElementById("backBtn");
const druckenBtn = document.getElementById("druckenBtn");
const eiltBtn    = document.getElementById("eiltBtn");

const kundenButtons = Array.from(document.querySelectorAll(".kunde-btn"));

let activeInput       = null;
let lastCustomerIndex = 0;

/* ============================================================
   GERÄTEERKENNUNG
============================================================ */
const ua  = navigator.userAgent.toLowerCase();
const sw  = window.screen.width;
const sh  = window.screen.height;
const dpr = window.devicePixelRatio;

// generell mobile?
const isMobile = /android|iphone|ipad|ipod/i.test(ua);

// vorbereiteter TC21 (Werte ggf. anpassen)
const isZebraTC21 = ua.includes("android") && sw === 360 && sh === 640;

// dein TC22: 360 × 720, DPR 3
const isZebraTC22 = ua.includes("android") && sw === 360 && sh === 720 && dpr === 3;

if (isZebraTC21) {
    document.body.classList.add("zebra-tc21");
}
if (isZebraTC22) {
    document.body.classList.add("zebra-tc22");
}

// Debug-Anzeige im UI
const deviceInfo = document.getElementById("deviceInfo");
if (deviceInfo) {
    if (isZebraTC22) {
        deviceInfo.textContent = "Gerät: Zebra TC22";
    } else if (isZebraTC21) {
        deviceInfo.textContent = "Gerät: Zebra TC21";
    } else if (/android/i.test(ua)) {
        deviceInfo.textContent = "Gerät: Android (kein Zebra)";
    } else if (/iphone|ipad|ipod/i.test(ua)) {
        deviceInfo.textContent = "Gerät: iOS";
    } else {
        deviceInfo.textContent = "Gerät: PC / Unbekannt";
    }
}

/* ============================================================
   MOBIL: POPUP-TASTATUREN
============================================================ */
if (isMobile) {

    beistell.readOnly   = true;
    kundenname.readOnly = true;

    // Beistell klicken
    beistell.addEventListener("click", () => {
        activeInput = beistell;

        beistell.classList.add("mobile-focus");
        kundenname.classList.remove("mobile-focus");
        beistell.classList.remove("input-blink");

        numKb.style.display   = "block";
        alphaKb.style.display = "none";
    });

    // Kundenname klicken
    kundenname.addEventListener("click", () => {
        activeInput = kundenname;

        kundenname.classList.add("mobile-focus");
        beistell.classList.remove("mobile-focus");
        kundenname.classList.remove("input-blink");

        numKb.style.display   = "none";
        alphaKb.style.display = "block";
    });

    /* ===========================
       NUMMER-KEYBOARD
    ============================ */
    document.querySelectorAll("#numKeyboard .kbm-key").forEach(key => {
        key.addEventListener("click", () => {
            if (!activeInput) return;

            if (key.id === "numDel") {
                activeInput.value = activeInput.value.slice(0, -1);
                return;
            }

            if (key.id === "numOk") {
                numKb.style.display = "none";
                activeInput.blur();

                beistell.classList.remove("mobile-focus");
                kundenname.classList.add("mobile-focus");
                kundenname.classList.add("input-blink");

                activeInput = kundenname;
                alphaKb.style.display = "block";
                return;
            }

            // Ziffer (inkl. 0)
            activeInput.value += key.textContent;
        });
    });

    /* ===========================
       ALPHA-KEYBOARD
    ============================ */
    document.querySelectorAll("#alphaKeyboard .kbm-key").forEach(key => {
        key.addEventListener("click", () => {
            if (!activeInput) return;

            if (key.id === "alphaDel") {
                activeInput.value = activeInput.value.slice(0, -1);
                return;
            }

            if (key.id === "alphaSpace") {
                activeInput.value += " ";
                return;
            }

            if (key.id === "alphaOk") {
                alphaKb.style.display = "none";
                activeInput.blur();
                kundenname.classList.remove("input-blink");
                kundenname.classList.remove("mobile-focus");
                return;
            }

            // normaler Buchstabe
            activeInput.value += key.textContent;
        });
    });

} else {

    /* ============================================================
       PC MODUS
    ============================================================ */
    numKb.style.display   = "none";
    alphaKb.style.display = "none";

    beistell.readOnly   = false;
    kundenname.readOnly = false;

    beistell.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            kundenname.focus();
        }
    });

    kundenname.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (kundenButtons.length > 0) {
                kundenButtons[0].focus();
            }
        }
    });
}

/* ============================================================
   EILT BUTTON
============================================================ */
eiltBtn.onclick = () => {
    isEilt = !isEilt;

    if (isEilt) {
        eiltBtn.textContent = "EILT SEHR: AN";
        eiltBtn.classList.add("on");
        druckenBtn.focus();
    } else {
        eiltBtn.textContent = "EILT SEHR: AUS";
        eiltBtn.classList.remove("on");
    }
};

/* ============================================================
   KUNDENBUTTON NAVIGATION + AUSWAHL
============================================================ */
kundenButtons.forEach((btn, index) => {

    const selectCustomer = () => {
        kundenButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        selectedType = btn.dataset.type;
        lastCustomerIndex = index;

        eiltBtn.focus();
    };

 btn.onclick = () => {
    selectCustomer();

    // Tastaturen schließen
    alphaKb.style.display = "none";
    numKb.style.display = "none";

    // Mobile Fokus entfernen
    beistell.classList.remove("mobile-focus");
    kundenname.classList.remove("mobile-focus");

    // Blink-Cursor entfernen
    beistell.classList.remove("input-blink");
    kundenname.classList.remove("input-blink");

    activeInput = null;
};

    btn.addEventListener("focus", () => {
        lastCustomerIndex = index;
    });

    btn.addEventListener("keydown", (e) => {
        const cols = 3;
        const upIndex = index - cols;
        const downIndex = index + cols;

        if (e.key === "ArrowLeft" && index > 0) {
            e.preventDefault();
            kundenButtons[index - 1].focus();
        }

        if (e.key === "ArrowRight" && index < kundenButtons.length - 1) {
            e.preventDefault();
            kundenButtons[index + 1].focus();
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            if (upIndex >= 0) kundenButtons[upIndex].focus();
            else kundenname.focus();
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (downIndex < kundenButtons.length) kundenButtons[downIndex].focus();
            else eiltBtn.focus();
        }

        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            selectCustomer();
        }
    });
});

/* ============================================================
   DRUCKEN
============================================================ */
druckenBtn.onclick = () => {

    const beistellwert  = beistell.value.trim();
    const kundenameWert = kundenname.value.trim();

    if (!beistellwert) {
        alert("Bitte Beistellnummer eingeben!");
        return;
    }

    if (!selectedType) {
        alert("Bitte einen Kunden auswählen!");
        return;
    }

    let finalType = selectedType;

    if (isEilt) {
        if (selectedType === "LP")       finalType = "LPEILT";
        if (selectedType === "SCHUETTE") finalType = "SCHUETTEEILT";
        if (selectedType === "KLEY")     finalType = "KLEYEILT";
    }

    const data = {
        beistell:     beistellwert,
        selectedType: finalType,
        kundename:    kundenameWert
    };

    window.location.href =
        "druck.html?data=" + encodeURIComponent(JSON.stringify(data));
};

/* ============================================================
   AUTOMATISCHE BUILD NUMMER
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    const lastMod = new Date(document.lastModified);
    if (isNaN(lastMod.getTime())) return;

    const build =
        lastMod.getFullYear().toString() +
        String(lastMod.getMonth() + 1).padStart(2, "0") +
        String(lastMod.getDate()).padStart(2, "0") + "." +
        String(lastMod.getHours()).padStart(2, "0") +
        String(lastMod.getMinutes()).padStart(2, "0");

    const el = document.getElementById("buildInfo");
    if (el) el.textContent = "Build " + build;
});

/* ============================================================
   ZURÜCK BUTTON
============================================================ */
backBtn.onclick = () => history.back();

let activeInput = null;
let currentColor = "red";
let scanBuffer   = "";

/* ============================================================
   GRUNDREFERENZEN
============================================================ */
const kommission   = document.getElementById("kommission");
const lieferdatum  = document.getElementById("lieferdatum");
const chkVorgezogen = document.getElementById("chkVorgezogen");

const druckenBtn   = document.getElementById("druckenBtn");
const backBtn      = document.getElementById("backBtn");

const numKb        = document.getElementById("numKeyboard"); // Mini-Tastatur
const deviceInfo   = document.getElementById("deviceInfo");  // kleine Anzeige oben (optional)
const buildInfo    = document.getElementById("buildInfo");   // Build-Text unten (optional)

/* ============================================================
   GERÄTEERKENNUNG (PC / ANDROID / ZEBRA TC21 / TC22)
============================================================ */
const ua  = navigator.userAgent.toLowerCase();
const sw  = window.screen.width;
const sh  = window.screen.height;
const dpr = window.devicePixelRatio;

// generell mobile?
const isMobileDevice = /android|iphone|ipad|ipod/i.test(ua);

// vorbereiteter TC21 (Werte ggf. anpassen)
const isZebraTC21 = ua.includes("android") && sw === 360 && sh === 640;

// dein TC22: 360 × 720, DPR 3
const isZebraTC22 = ua.includes("android") && sw === 360 && sh === 720 && dpr === 3;

// Body-Klassen vergeben
if (!isMobileDevice && !isZebraTC21 && !isZebraTC22) {
    document.body.classList.add("pc-device");
}
if (isZebraTC21) {
    document.body.classList.add("zebra-tc21");
}
if (isZebraTC22) {
    document.body.classList.add("zebra-tc22");
}

// Anzeige oben links (Debug / Info)
if (deviceInfo) {
    if (isZebraTC22) {
        deviceInfo.textContent = "Gerät: Zebra TC22";
    } else if (isZebraTC21) {
        deviceInfo.textContent = "Gerät: Zebra TC21";
    } else if (/android/i.test(ua)) {
        deviceInfo.textContent = "Gerät: Android";
    } else if (/iphone|ipad|ipod/i.test(ua)) {
        deviceInfo.textContent = "Gerät: iOS";
    } else {
        deviceInfo.textContent = "Gerät: PC";
    }
}

/* ============================================================
   START / FOKUS / FELDER LEEREN
============================================================ */
window.addEventListener("load", () => {
    kommission.value  = "";
    lieferdatum.value = "";
    kommission.focus();

    // Build aus letztem Änderungsdatum
    const lastMod = new Date(document.lastModified);
    if (!isNaN(lastMod.getTime()) && buildInfo) {
        const build =
            lastMod.getFullYear().toString() +
            String(lastMod.getMonth() + 1).padStart(2, "0") +
            String(lastMod.getDate()).padStart(2, "0") + "." +
            String(lastMod.getHours()).padStart(2, "0") +
            String(lastMod.getMinutes()).padStart(2, "0");
        buildInfo.textContent = "Build " + build;
    }
});

/* ============================================================
   MOBIL: MINI-NUMMERNTASTATUR UNTEN
============================================================ */
if (isMobileDevice || isZebraTC21 || isZebraTC22) {

    // Systemtastatur unterdrücken
    kommission.readOnly  = true;
    lieferdatum.readOnly = true;

    // Kommission klicken → Tastatur auf
    ["click", "touchstart"].forEach(evt => {
        kommission.addEventListener(evt, () => {
            activeInput = kommission;
            numKb.style.display = "block";
        });

        lieferdatum.addEventListener(evt, () => {
            activeInput = lieferdatum;
            numKb.style.display = "block";
        });
    });

    // Tasten der Mini-Tastatur
    document.querySelectorAll("#numKeyboard .kbm-key").forEach(key => {
        key.addEventListener("click", () => {
            if (!activeInput) return;

            // Löschen
            if (key.id === "numDel") {
                activeInput.value = activeInput.value.slice(0, -1);
                return;
            }

            // OK
            if (key.id === "numOk") {

                // Lieferdatum beim Bestätigen formatieren
                if (activeInput.id === "lieferdatum") {
                    let v = activeInput.value.replace(/\D/g, "");
                    if (v.length === 3) {
                        v = "0" + v;
                    }
                    if (v.length >= 4) {
                        v = v.slice(0, 2) + "." + v.slice(2, 4);
                    }
                    activeInput.value = v;
                }

                // Tastatur zu
                numKb.style.display = "none";
                activeInput = null;
                return;
            }

            // Ziffer (inkl. 0)
            activeInput.value += key.textContent;
        });
    });

} else {
    /* ============================================================
       PC: Normale Eingabe
    ============================================================ */
    if (numKb) numKb.style.display = "none";

    kommission.removeAttribute("readonly");
    lieferdatum.removeAttribute("readonly");

    // ENTER → weiter zum Datum
    kommission.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            lieferdatum.focus();
        }
    });
}

/* ============================================================
   DATUM – Eingabe & Formatierung (auch für PC)
============================================================ */
lieferdatum.addEventListener("input", () => {
    // während der Eingabe nur Zahlen und Punkt erlauben
    lieferdatum.value = lieferdatum.value.replace(/[^\d.]/g, "");
});

lieferdatum.addEventListener("blur", () => {
    let v = lieferdatum.value.replace(/\D/g, "");
    if (!v) return;

    if (v.length === 3) v = "0" + v;
    if (v.length >= 4) v = v.slice(0, 2) + "." + v.slice(2, 4);

    lieferdatum.value = v;
});

/* ============================================================
   FARBEN WÄHLEN
============================================================ */
document.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentColor = btn.dataset.color;
    });
});

/* ============================================================
   DRUCKEN
============================================================ */
druckenBtn.onclick = () => {

    if (!kommission.value.trim()) {
        alert("Bitte Kommissionsnummer eingeben!");
        return;
    }
    if (!lieferdatum.value.trim()) {
        alert("Bitte Lieferdatum eingeben!");
        return;
    }

    const data = {
        kommission:  kommission.value,
        lieferdatum: lieferdatum.value,
        vorgezogen:  chkVorgezogen.checked,
        farbe:       currentColor
    };

    const json = JSON.stringify(data);

    // Android–Spezialfunktion (wenn vorhanden)
    if (window.Android && typeof Android.printPaus === "function") {
        Android.printPaus(json);
        return;
    }

    // Standard → eigene Druckseite
    window.location.href = "paus_druck.html?data=" + encodeURIComponent(json);
};

/* ZURÜCK */
backBtn.onclick = () => history.back();

/* ============================================================
   ZEBRA SCANNER – BARCODE „K:…;D:…“
============================================================ */
document.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        const text = scanBuffer.trim();

        if (text.includes("K:") && text.includes("D:")) {

            const kom = text.match(/K:(.*?);/)[1];
            const raw = text.match(/D:(.*)/)[1].replace(/\D/g, "");

            let dat = raw;
            if (dat.length === 3) dat = "0" + dat;
            if (dat.length >= 4) dat = dat.slice(0, 2) + "." + dat.slice(2, 4);

            kommission.value  = kom;
            lieferdatum.value = dat;
        }

        scanBuffer = "";
    } else {
        scanBuffer += e.key;
    }
});

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

// Geräteerkennung
const isMobile = /Android|iPhone|iPad|iPod|Zebra|TC21|TC22/i.test(navigator.userAgent);


/* ============================================================
   MOBIL: SCREENKEYBOARDS
============================================================ */
if (isMobile) {

    beistell.readOnly   = true;
    kundenname.readOnly = true;

    /* -------- Beistellnummer öffnen → NUM KEYPAD -------- */
    beistell.addEventListener("click", () => {
        activeInput = beistell;

        beistell.classList.add("mobile-focus");
        kundenname.classList.remove("mobile-focus");
        kundenname.classList.remove("input-blink");

        numKb.style.display   = "block";
        alphaKb.style.display = "none";
    });

    /* -------- Kundenname öffnen → QWERTZ KEYPAD -------- */
    kundenname.addEventListener("click", () => {
        activeInput = kundenname;

        kundenname.classList.add("mobile-focus");
        beistell.classList.remove("mobile-focus");
        beistell.classList.remove("input-blink");

        numKb.style.display   = "none";
        alphaKb.style.display = "block";
    });

    /* ============================================================
       ZAHLENTASTATUR
    ============================================================ */
    document.querySelectorAll("#numKeyboard .kbm-key").forEach(key => {
        key.addEventListener("click", () => {
            if (!activeInput) return;

            const val = key.textContent;

            // DELETE
            if (key.id === "numDel") {
                activeInput.value = activeInput.value.slice(0, -1);
                return;
            }

            // OK → Zahlenkeyboard schließen, QWERTZ öffnen
            if (key.id === "numOk") {
                numKb.style.display = "none";

                // Auf Kundenname wechseln
                beistell.classList.remove("mobile-focus");
                kundenname.classList.add("mobile-focus");
                kundenname.classList.add("input-blink");

                activeInput = kundenname;
                alphaKb.style.display = "block";
                return;
            }

            // Normale Eingabe
            activeInput.value += val;
        });
    });

    /* ============================================================
       QWERTZ–TASTATUR
    ============================================================ */
    document.querySelectorAll("#alphaKeyboard .kbm-key").forEach(key => {
        key.addEventListener("click", () => {
            if (!activeInput) return;

            const val = key.textContent;

            // DELETE
            if (key.id === "alphaDel") {
                activeInput.value = activeInput.value.slice(0, -1);
                return;
            }

            // OK → schließen
            if (key.id === "alphaOk") {
                alphaKb.style.display = "none";
                kundenname.classList.remove("input-blink");
                kundenname.classList.remove("mobile-focus");
                return;
            }

            // SPACE
            if (val === " " || key.id === "alphaSpace") {
                activeInput.value += " ";
                return;
            }

            // Normale Eingabe
            activeInput.value += val;
        });
    });

} else {

/* ============================================================
   PC TASTATUR (normal)
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
   KUNDENBUTTONS
============================================================ */
kundenButtons.forEach((btn, index) => {

    const selectCustomer = () => {
        kundenButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        selectedType = btn.dataset.type;
        lastCustomerIndex = index;

        eiltBtn.focus();
    };

    btn.onclick = () => selectCustomer();
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
   ZURÜCK BUTTON
============================================================ */
backBtn.onclick = () => history.back();

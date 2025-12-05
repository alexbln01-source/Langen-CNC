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

// Geräteerkennung (Zebra / Android / iPhone)
const isMobile = /Android|iPhone|iPad|iPod|Zebra|TC21|TC22/i.test(navigator.userAgent);


/* ============================================================
   MOBIL: POPUP-TASTATUREN
============================================================ */
if (isMobile) {

    beistell.readOnly   = true;
    kundenname.readOnly = true;

    /* -------- Beistell-Input klicken → Nur Zahlentastatur -------- */
    beistell.addEventListener("click", () => {
        activeInput = beistell;

        beistell.classList.add("mobile-focus");
        kundenname.classList.remove("mobile-focus");
        kundenname.classList.remove("input-blink");

        numKb.style.display   = "block";
        alphaKb.style.display = "none";
    });

    /* -------- Kundenname klicken → QWERTZ-Keyboard -------- */
    kundenname.addEventListener("click", () => {
        activeInput = kundenname;

        kundenname.classList.add("mobile-focus");
        beistell.classList.remove("mobile-focus");
        beistell.classList.remove("input-blink");

        numKb.style.display   = "none";
        alphaKb.style.display = "block";
    });

    /* ============================================================
       ZAHLENTASTATUR (0–9, Delete, OK)
    ============================================================ */
    document.querySelectorAll("#numKeyboard .kbm-key").forEach(key => {
        key.addEventListener("click", () => {

            if (!activeInput) return;
            const value = key.textContent;

            // DELETE
            if (value === "⌫") {
                activeInput.value = activeInput.value.slice(0, -1);
                return;
            }

            // OK → zu Kundenname springen
            if (value === "OK") {
                numKb.style.display = "none";

                beistell.classList.remove("mobile-focus");
                kundenname.classList.add("mobile-focus");
                kundenname.classList.add("input-blink");

                activeInput = kundenname;
                alphaKb.style.display = "block";
                return;
            }

            // Normale Eingabe
            activeInput.value += value;
        });
    });

    /* ============================================================
       QWERTZ-TASTATUR (Delete, Space, OK)
    ============================================================ */
    document.querySelectorAll("#alphaKeyboard .kbm-key").forEach(key => {
        key.addEventListener("click", () => {

            if (!activeInput) return;
            const value = key.textContent;

            // DELETE
            if (value === "⌫") {
                activeInput.value = activeInput.value.slice(0, -1);
                return;
            }

            // SPACE (Taste mit flex:3)
            if (value === "" && key.style.flex === "3") {
                activeInput.value += " ";
                return;
            }

            // OK → schließen
            if (value === "OK") {
                alphaKb.style.display = "none";
                kundenname.classList.remove("input-blink");
                kundenname.classList.remove("mobile-focus");
                activeInput.blur();
                return;
            }

            // Normale Eingabe
            activeInput.value += value;
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
   EILT BUTTON – AUTO-SPRUNG
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
   KUNDENBUTTONS – NAVIGATION
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

    btn.addEventListener("focus", () => {
        lastCustomerIndex = index;
    });

    btn.addEventListener("keydown", (e) => {
        const cols = 3; 
        const upIndex = index - cols;
        const downIndex = index + cols;

        if (e.key === "ArrowLeft") {
            e.preventDefault();
            if (index > 0) kundenButtons[index - 1].focus();
        }

        if (e.key === "ArrowRight") {
            e.preventDefault();
            if (index < kundenButtons.length - 1) kundenButtons[index + 1].focus();
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
   EILT NAVIGATION
============================================================ */
eiltBtn.addEventListener("keydown", (e) => {

    if (e.key === "ArrowUp") {
        e.preventDefault();
        kundenButtons[lastCustomerIndex].focus();
    }

    if (e.key === "ArrowDown") {
        e.preventDefault();
        druckenBtn.focus();
    }

    if (e.key === "ArrowLeft") {
        e.preventDefault();
        backBtn.focus();
    }

    if (e.key === "ArrowRight") {
        e.preventDefault();
        druckenBtn.focus();
    }

    if (e.key === "Enter") {
        e.preventDefault();
        eiltBtn.click();
    }
});


/* ============================================================
   DRUCKEN
============================================================ */
druckenBtn.addEventListener("keydown", (e) => {

    if (e.key === "ArrowUp") {
        e.preventDefault();
        eiltBtn.focus();
    }

    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        backBtn.focus();
    }

    if (e.key === "Enter") {
        e.preventDefault();
        druckenBtn.click();
    }
});


/* ============================================================
   ZURÜCK
============================================================ */
backBtn.addEventListener("keydown", (e) => {

    if (e.key === "ArrowUp") {
        e.preventDefault();
        eiltBtn.focus();
    }

    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        druckenBtn.focus();
    }

    if (e.key === "Enter") {
        e.preventDefault();
        backBtn.click();
    }
});


/* ============================================================
   DRUCKLOGIK
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

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

// Handy-Erkennung
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);


/* ============================================================
   MOBIL: POPUP-TASTATUREN
============================================================ */
if (isMobile) {

    beistell.readOnly   = true;
    kundenname.readOnly = true;

    beistell.addEventListener("click", () => {
        activeInput = beistell;
        numKb.style.display   = "block";
        alphaKb.style.display = "none";
    });

    kundenname.addEventListener("click", () => {
        activeInput = kundenname;
        numKb.style.display   = "none";
        alphaKb.style.display = "block";
    });

  // Nummerntasten
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
            return;
        }

        activeInput.value += key.textContent;
    });
});

// Buchstabentasten
document.querySelectorAll("#alphaKeyboard .kbm-key").forEach(key => {
    key.addEventListener("click", () => {
        if (!activeInput) return;

        if (key.id === "alphaDel") {
            activeInput.value = activeInput.value.slice(0, -1);
            return;
        }
        if (key.id === "alphaOk") {
            alphaKb.style.display = "none";
            activeInput.blur();
            return;
        }

        activeInput.value += key.textContent;
    });
});

} else {

    /* ============================================================
       PC TASTATUR
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
   EILT BUTTON – JETZT MIT AUTO-SPRUNG ZU DRUCKEN
============================================================ */
eiltBtn.onclick = () => {
    isEilt = !isEilt;

    if (isEilt) {
        eiltBtn.textContent = "EILT SEHR: AN";
        eiltBtn.classList.add("on");

        // >>> NEU: Wenn EILT aktiviert wird → sofort DRUCKEN
        druckenBtn.focus();

    } else {
        eiltBtn.textContent = "EILT SEHR: AUS";
        eiltBtn.classList.remove("on");
    }
};


/* ============================================================
   KUNDENBUTTONS – FREIE NAVIGATION IM 3xN GRID
============================================================ */
kundenButtons.forEach((btn, index) => {

    const selectCustomer = () => {
        kundenButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        selectedType = btn.dataset.type;
        lastCustomerIndex = index;

        eiltBtn.focus();  // Nur nach Auswahl
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
            if (index > 0)
                kundenButtons[index - 1].focus();
        }

        if (e.key === "ArrowRight") {
            e.preventDefault();
            if (index < kundenButtons.length - 1)
                kundenButtons[index + 1].focus();
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            if (upIndex >= 0) {
                kundenButtons[upIndex].focus();
            } else {
                kundenname.focus();
            }
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (downIndex < kundenButtons.length) {
                kundenButtons[downIndex].focus();
            } else {
                eiltBtn.focus();
            }
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

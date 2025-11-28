let selectedType = null;
let isEilt = false;

/* ============================================================
   POPUP TASTATUREN (NUM / ALPHA)
   — NICHTS am Design verändert
============================================================ */
let activeInput = null;

const numKb = document.getElementById("numKeyboard");
const alphaKb = document.getElementById("alphaKeyboard");

const beistell = document.getElementById("beistellInput");
const kundenname = document.getElementById("kundeInput");

// Systemtastatur ganz deaktivieren
beistell.readOnly = true;
kundenname.readOnly = true;

/* === BEISTELLNUMMER → NUMERISCHE TASTATUR === */
beistell.addEventListener("click", () => {
    activeInput = beistell;
    alphaKb.style.display = "none";
    numKb.style.display = "block";
});

/* === KUNDENNAME → ALPHA TASTATUR === */
kundenname.addEventListener("click", () => {
    activeInput = kundenname;
    numKb.style.display = "none";
    alphaKb.style.display = "block";
});

/* === NUMERISCHE TASTEN === */
document.querySelectorAll("#numKeyboard .kb-key").forEach(key => {
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

/* === ALPHA TASTEN (QWERTZ, NUR GROSZ) === */
document.querySelectorAll("#alphaKeyboard .kb-key").forEach(key => {
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



/* ============================================================
   EILT BUTTON
============================================================ */
const eiltBtn = document.getElementById("eiltBtn");

eiltBtn.onclick = () => {
    isEilt = !isEilt;
    if (isEilt) {
        eiltBtn.textContent = "EILT SEHR: AN";
        eiltBtn.classList.add("on");
    } else {
        eiltBtn.textContent = "EILT SEHR: AUS";
        eiltBtn.classList.remove("on");
    }
};



/* ============================================================
   KUNDEN BUTTONS
============================================================ */
document.querySelectorAll(".kunde-btn").forEach(btn => {

    btn.onclick = () => {

        document.querySelectorAll(".kunde-btn")
          .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        selectedType = btn.getAttribute("data-type");
    };

});



/* ============================================================
   DRUCKEN BUTTON
============================================================ */
document.getElementById("druckenBtn").onclick = () => {

    const beistellwert = beistell.value.trim();
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

    // EILT gilt nur für LP, SCHUETTE, KLEY
    if (isEilt) {
        if (selectedType === "LP") finalType = "LPEILT";
        if (selectedType === "SCHUETTE") finalType = "SCHUETTEEILT";
        if (selectedType === "KLEY") finalType = "KLEYEILT";
    }

    const data = {
        beistell: beistellwert,
        selectedType: finalType,
        kundename: kundenameWert
    };

    window.location.href =
      "druck.html?data=" + encodeURIComponent(JSON.stringify(data));
};



/* ============================================================
   ZURÜCK BUTTON
============================================================ */
document.getElementById("backBtn").onclick = () => {
    history.back();
};
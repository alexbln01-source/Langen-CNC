let selectedCustomer = "";
let selectedArt = "";

/* =========================
   KUNDEN BUTTONS
========================= */
document.querySelectorAll(".kundeBtn").forEach(btn => {
    btn.onclick = () => {

        document.querySelectorAll(".kundeBtn")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        const kunde = btn.dataset.kunde;

        // ⬇️ TASTATUR NUR BEI SONSTIGE
        if (kunde === "SONSTIGE") {
            selectedCustomer = "SONSTIGE";
            openKeyboard();
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
}

/* =========================
   DRUCKEN
========================= */
document.getElementById("btnDrucken").onclick = () => {

    if (!selectedCustomer) {
        alert("Bitte Kunden auswählen!");
        return;
    }

    if (!selectedArt) {
        alert("Bitte Art auswählen!");
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
   TASTATUR
========================= */
const popup = document.getElementById("keyboardPopup");
const keyboardInput = document.getElementById("keyboardInput");
const sonstigeBtn = document.getElementById("sonstigeBtn");

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

/* =========================
   ✅ ENTER / RETURN AM PC
========================= */
keyboardInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        e.preventDefault();
        kbOk.click();
    }
});
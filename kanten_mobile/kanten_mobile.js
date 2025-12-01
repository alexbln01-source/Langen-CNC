let selectedCustomer = "";
let customCustomer   = "";

// Alle Kundenbuttons
const kundenButtons = document.querySelectorAll(".kunde-btn");
const backBtn       = document.getElementById("backBtn");
const druckenBtn    = document.getElementById("druckenBtn");

// Tastatur-Elemente
const kbPopup = document.getElementById("keyboardPopup");
const kbInput = document.getElementById("keyboardInput");
const kbGrid  = document.getElementById("keyboardGrid");
const kbDel   = document.getElementById("kbDel");
const kbOk    = document.getElementById("kbOk");
const kbClose = document.getElementById("kbClose");

/* =============================
   Kundenwahl
============================= */
kundenButtons.forEach(btn => {
    btn.addEventListener("click", () => {

        kundenButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        if (btn.dataset.kunde === "SONSTIGE") {
            openKeyboard();
        } else {
            selectedCustomer = btn.dataset.kunde;
            customCustomer   = "";
        }
    });
});

/* =============================
   Tastatur für "Sonstige Kunden"
============================= */
function openKeyboard() {
    kbInput.value = customCustomer;
    kbPopup.style.display = "flex";
    kbInput.focus();
    buildKeyboard();
}

function closeKeyboard() {
    kbPopup.style.display = "none";
}

function buildKeyboard() {
    kbGrid.innerHTML = "";
    const chars = "QWERTZUIOPÜASDFGHJKLÖÄYXCVBNM".split("");

    chars.forEach(ch => {
        const b = document.createElement("button");
        b.textContent = ch;
        b.type = "button";
        b.onclick = () => {
            kbInput.value += ch;
        };
        kbGrid.appendChild(b);
    });
}

kbDel.onclick = () => {
    kbInput.value = kbInput.value.slice(0, -1);
};

kbOk.onclick = () => {
    customCustomer = kbInput.value.trim();
    if (!customCustomer) {
        alert("Bitte Kundennamen eingeben!");
        return;
    }
    selectedCustomer = customCustomer;
    closeKeyboard();
};

kbClose.onclick = () => {
    closeKeyboard();
};

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && kbPopup.style.display === "flex") {
        closeKeyboard();
    }
});

/* =============================
   Navigation
============================= */
backBtn.onclick = () => {
    history.back();
};

/* =============================
   Drucken → druck_kanten.html (A6 quer)
============================= */
druckenBtn.onclick = () => {

    if (!selectedCustomer) {
        alert("Bitte Kunde auswählen!");
        return;
    }

    const data = encodeURIComponent(JSON.stringify({
        kunde: selectedCustomer
    }));

    window.location.href = "druck_kanten.html?data=" + data;
};
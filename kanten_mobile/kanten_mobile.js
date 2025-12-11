let selectedCustomer = "";
let customCustomer = "";
let selectedArt = "kanten";

/* Kunden-Auswahl */
document.querySelectorAll(".kundeBtn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".kundeBtn")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        const kunde = btn.dataset.kunde;

        if (kunde === "SONSTIGE") {
            openKeyboard();
            return;
        }

        selectedCustomer = kunde;
    };
});

/* Art-Auswahl */
const btnKanten = document.getElementById("btnKanten");
const btnSchweissen = document.getElementById("btnSchweissen");

btnKanten.onclick = () => {
    selectedArt = "kanten";
    btnKanten.classList.add("active");
    btnSchweissen.classList.remove("active");
};

btnSchweissen.onclick = () => {
    selectedArt = "schweissen";
    btnSchweissen.classList.add("active");
    btnKanten.classList.remove("active");
};

/* Drucken */
document.getElementById("btnDrucken").onclick = () => {
    if (!selectedCustomer) {
        alert("Bitte einen Kunden auswählen!");
        return;
    }

    const kunde =
        selectedCustomer === "SONSTIGE"
            ? customCustomer
            : selectedCustomer;

    window.location.href =
        "druck_kanten.html?kunde=" +
        encodeURIComponent(kunde) +
        "&art=" +
        encodeURIComponent(selectedArt);
};

/* Popup Tastatur */
const popup = document.getElementById("keyboardPopup");
const kbInput = document.getElementById("keyboardInput");

function openKeyboard() {
    popup.style.display = "flex";
    kbInput.value = "";
    kbInput.focus();
}

document.getElementById("kbCancel").onclick = () => {
    popup.style.display = "none";
};

document.getElementById("kbClear").onclick = () => {
    kbInput.value = "";
};

document.getElementById("kbOk").onclick = () => {
    const name = kbInput.value.trim();
    if (!name) return;

    customCustomer = name;
    selectedCustomer = "SONSTIGE";

    document.getElementById("sonstigeBtn").textContent = name;
    popup.style.display = "none";
};

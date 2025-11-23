// =========================
// DOM-Referenzen
// =========================
const kbPopup    = document.getElementById("keyboardPopup");
const kbInput    = document.getElementById("keyboardInput");
const kbGrid     = document.getElementById("keyboardGrid");

let selectedCustomer = "";
let customCustomer   = "";

// =========================
// Tastatur
// =========================
function buildKeyboardLetters() {
  kbGrid.innerHTML = "";
  const chars = "QWERTZUIOPÜASDFGHJKLÖÄYXCVBNM1234567890".split("");

  chars.forEach(ch => {
    const b = document.createElement("button");
    b.textContent = ch;
    b.addEventListener("click", () => {
      kbInput.value += ch;
      kbInput.focus();
    });
    kbGrid.appendChild(b);
  });
}

function openKeyboardForCustomer() {
  kbInput.value = customCustomer || "";
  buildKeyboardLetters();
  kbPopup.style.display = "flex";
  setTimeout(() => kbInput.focus(), 10);
}

function closeKeyboard() {
  kbPopup.style.display = "none";
}

document.getElementById("btnDel").onclick   = () => kbInput.value = kbInput.value.slice(0, -1);
document.getElementById("btnClose").onclick = closeKeyboard;

document.getElementById("btnOk").onclick = () => {
  customCustomer   = kbInput.value.trim();
  selectedCustomer = "";
  closeKeyboard();
};

kbInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("btnOk").click();
});

// =========================
// Kundenbuttons
// =========================
document.querySelectorAll(".kundeBtn").forEach(btn => {
  btn.addEventListener("click", () => {

    document.querySelectorAll(".kundeBtn")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    const type = btn.dataset.kunde;

    if (type === "SONSTIGE") {
      openKeyboardForCustomer();
    } else {
      selectedCustomer = btn.textContent.trim();
      customCustomer   = "";
    }
  });
});

// =========================
// Drucken
// =========================
document.getElementById("btnDrucken").onclick = () => {

  const kunde = customCustomer || selectedCustomer;

  if (!kunde) {
    alert("Bitte Kunde wählen!");
    return;
  }

  const druckText =
`${kunde}
Kanten
K-Termin: ________
Palettennummer: ________`;

  document.body.setAttribute("data-print", druckText);

  window.print();
};

// =========================
// Zurück
// =========================
document.getElementById("btnBack").onclick = () => {
  window.location.href = "../index.html";
};
// --- Elemente ---
const num = document.getElementById("numInput");
const kunde = document.getElementById("kundeInput");
const popup = document.getElementById("keyboardPopup");
const kbInput = document.getElementById("keyboardInput");
const kbGrid = document.getElementById("keyboardGrid");
const title = document.getElementById("keyboardTitle");
let currentField = null;

// ---------------- Tastatur ----------------
function buildKeyboard(type) {
  kbGrid.innerHTML = "";
  const chars = type === "numbers"
    ? ["1","2","3","4","5","6","7","8","9","0"]
    : "QWERTZUIOPASDFGHJKLYXCVBNM".split("");

  chars.forEach(ch => {
    const b = document.createElement("button");
    b.textContent = ch;
    b.onclick = () => kbInput.value += ch;
    kbGrid.appendChild(b);
  });
}

function openKeyboard(field, type) {
  currentField = field;
  kbInput.value = field.value;
  title.textContent = type === "numbers"
    ? "Beistellnummer eingeben"
    : "Kundenname eingeben";

  buildKeyboard(type);
  popup.style.display = "flex";
}

function closeKeyboard() {
  popup.style.display = "none";
}

document.getElementById("btnDel").onclick = () =>
  kbInput.value = kbInput.value.slice(0,-1);

document.getElementById("btnClose").onclick = closeKeyboard;

document.getElementById("btnOk").onclick = () => {
  currentField.value = kbInput.value.trim();
  closeKeyboard();
  if (currentField === num) {
    openKeyboard(kunde, "letters");
  }
};

num.onclick = () => openKeyboard(num,"numbers");
kunde.onclick = () => openKeyboard(kunde,"letters");

// ---------------- Zurück ----------------
document.getElementById("btnBack").onclick = () => {
  window.location.href = "../index.html";
};

// ---------------- Druck ----------------
document.getElementById("btnDrucken").onclick = () => {
  alert("Drucken ist auf Mobilgeräten nur über den Browser möglich.");
};

// ------------------------------------------------------------
// Buttons füllen nur das UI (wie bei PC-Version)
// ------------------------------------------------------------
document.querySelectorAll("#kundenButtons button").forEach(btn => {
  btn.addEventListener("click", () => {
    alert(`${btn.innerText} ausgewählt — Druck nur auf PC möglich`);
  });
});
let selectedCustomer = "";
let customCustomer   = "";

// Kundenbutton Auswahl
document.querySelectorAll(".kundeBtn").forEach(btn => {
  btn.addEventListener("click", () => {

    document.querySelectorAll(".kundeBtn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    if (btn.dataset.kunde === "SONSTIGE") {
      openKeyboard();
    } else {
      selectedCustomer = btn.dataset.kunde;
      customCustomer = "";
    }
  });
});

// Tastatur
const kbPopup  = document.getElementById("keyboardPopup");
const kbInput  = document.getElementById("keyboardInput");
const kbGrid   = document.getElementById("keyboardGrid");

function openKeyboard(){
  kbInput.value = customCustomer;
  kbPopup.style.display = "flex";
  buildKeyboard();
}

function buildKeyboard(){
  kbGrid.innerHTML = "";
  const chars = "QWERTZUIOPÜASDFGHJKLÖÄYXCVBNM".split("");

  chars.forEach(ch =>{
    const b=document.createElement("button");
    b.textContent=ch;
    b.onclick=()=>kbInput.value+=ch;
    kbGrid.appendChild(b);
  });
}

document.getElementById("kbDel").onclick = ()=>kbInput.value = kbInput.value.slice(0,-1);
document.getElementById("kbClose").onclick = ()=>kbPopup.style.display="none";

document.getElementById("kbOk").onclick = ()=>{
  customCustomer = kbInput.value.trim();
  selectedCustomer = customCustomer;
  kbPopup.style.display="none";
};

// Zurück
document.getElementById("btnBack").onclick = ()=>{
  history.back();
};

// Drucken mit Popup-Vorschau (A6 quer) + Auto-Return nach dem Druck
document.getElementById("btnDrucken").onclick = ()=>{

  if (!selectedCustomer) {
    alert("Bitte Kunde auswählen!");
    return;
  }

  document.getElementById("printPreview").innerHTML = `
    <div style="font-size:46pt; font-weight:900;">${selectedCustomer}</div>
    <div style="font-size:32pt; margin-top:6mm;">Kanten</div>
    <div style="font-size:26pt; margin-top:4mm;">K-Termin: ________</div>
    <div style="font-size:26pt; margin-top:4mm;">Palettennummer: ________</div>
  `;

  document.getElementById("printPopup").style.display = "flex";
};

// Abbrechen
document.getElementById("cancelPrint").onclick = ()=>{
  document.getElementById("printPopup").style.display = "none";
};

// Drucken + automatisch zurück zur Kundenauswahl
document.getElementById("doPrint").onclick = ()=>{
  window.print();
  document.getElementById("printPopup").style.display = "none";

  // kurze Verzögerung, damit mobile Browser fertig sind
  setTimeout(()=>{
    // zurück zur Auswahl
    window.location.reload();
  }, 600);
};
};

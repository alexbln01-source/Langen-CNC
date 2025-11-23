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

// Drucken (K3 – wie Beschichtung Style)
document.getElementById("btnDrucken").onclick = ()=>{

  if (!selectedCustomer) {
    alert("Bitte Kunde auswählen!");
    return;
  }

  const w = window.open("", "_blank", "width=1200,height=850");

  w.document.write(`
    <html>
    <head>
      <style>
        @page { size: A6 landscape; margin:0; }
        body{
          margin:0;
          display:flex;
          justify-content:center;
          align-items:center;
          width:148mm;
          height:105mm;
          font-family:Arial, sans-serif;
        }
        #printArea{
          text-align:center;
          font-weight:900;
        }
        .big{
          font-size:46pt;
        }
        .mid{
          font-size:32pt;
          margin-top:6mm;
        }
        .line{
          font-size:26pt;
          margin-top:4mm;
        }
      </style>
    </head>
    <body>
      <div id="printArea">
        <div class="big">${selectedCustomer}</div>
        <div class="mid">Kanten</div>
        <div class="line">K-Termin: ________</div>
        <div class="line">Palettennummer: ________</div>
      </div>
    </body>
    </html>
  `);

  w.document.close();
  w.focus();

  setTimeout(()=>{ w.print(); w.close(); }, 300);
};
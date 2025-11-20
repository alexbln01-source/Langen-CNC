var $ = s => document.querySelector(s);
var $$ = s => Array.from(document.querySelectorAll(s));

var numInput  = $("#numInput");
var kundeInput = $("#kundeInput");
var kbPopup = $("#keyboardPopup");
var kbInput = $("#keyboardInput");
var kbGrid  = $("#keyboardGrid");
var kbTitle = $("#keyboardTitle");
var currentField = null;
var selectedType = null;

// Kundenliste
var kundenListe = [
  ["LP","L&P"],
  ["LPEILT","L&P EILT SEHR"],
  ["SCHUETTE","Schütte"],
  ["SCHUETTEEILT","Schütte EILT SEHR"],
  ["KLEY","Kleymann"],
  ["KLEYEILT","Kleymann EILT SEHR"],
  ["COMTEZN8","Comte ZN8"],
  ["CHEMISCH","Comte Chemisch Vernickeln"],
  ["DICK","Comte Dickschichtpassivierung"],
  ["BLAU","Comte Blau ZN8"],
  ["PENTZ","Pentz & Gerdes ZN8"],
  ["RCS","RCS Schweißen"],
  ["COATINC","Coatinc 24 Verzinken"]
];

// Buttons erzeugen
var btnContainer = $("#kundenButtons");
kundenListe.forEach(k => {
  let b = document.createElement("button");
  b.textContent = k[1];
  b.dataset.type = k[0];
  b.onclick = () => chooseCustomer(k[0]);
  btnContainer.appendChild(b);
});

function chooseCustomer(type){
  selectedType = type;
  $$("#kundenButtons button").forEach(b => b.classList.remove("active"));
  document.querySelector(`[data-type="${type}"]`).classList.add("active");
}

// Build Output
function buildOutput(type){
  var n = numInput.value.trim();
  var k = kundeInput.value.trim();

  var z2="",z3="",z4="";

  switch(type){
    case"LP":z2="L&P";break;
    case"LPEILT":z2="L&P";z3="EILT SEHR";break;
    case"SCHUETTE":z2="Schütte";break;
    case"SCHUETTEEILT":z2="Schütte";z3="EILT SEHR";break;
    case"KLEY":z2="Kleymann";break;
    case"KLEYEILT":z2="Kleymann";z3="EILT SEHR";break;
    case"COMTEZN8":z2="Comte";z3="„ZN8“";z4=k;break;
    case"CHEMISCH":z2="Comte";z3="„Chemisch Vernickeln“";z4=k;break;
    case"DICK":z2="Comte";z3="„Dickschichtpassivierung“";z4=k;break;
    case"BLAU":z2="Comte";z3="„Blau ZN8“";z4=k;break;
    case"PENTZ":z2="Pentz & Gerdes";z3="„ZN8“";z4=k;break;
    case"RCS":z2="RCS GmbH";z3="„Schweißen“";z4=k;break;
    case"COATINC":z2="Coatinc 24 GmbH";z3="„Verzinken“";z4=k;break;
  }

  let html = `
    <div style="font-size:60pt;margin-bottom:8mm;">${n}</div>
    <div style="font-size:60pt;font-weight:900;">${z2}</div>
  `;
  if(z3) html += `<div style="font-size:32pt;">${z3}</div>`;
  if(z4) html += `<div style="font-size:32pt;">(${z4})</div>`;

  return html;
}

// Tastatur
function buildKeyboard(type){
  kbGrid.innerHTML="";
  var chars=(type==="numbers")?['1','2','3','4','5','6','7','8','9','0']:"QWERTZUIOPÜASDFGHJKLÖÄYXCVBNM".split("");
  chars.forEach(ch=>{
    let b=document.createElement("button");
    b.textContent=ch;
    b.onclick=()=>kbInput.value+=ch;
    kbGrid.appendChild(b);
  });
}

function openKeyboard(field,type){
  currentField=field;
  kbTitle.textContent=(type==="numbers")?"Beistellnummer":"Kunde";
  kbInput.value=field.value||"";
  buildKeyboard(type);
  kbPopup.style.display="flex";
}

$("#btnDel").onclick=()=>kbInput.value=kbInput.value.slice(0,-1);
$("#btnClose").onclick=()=>kbPopup.style.display="none";
$("#btnOk").onclick=()=>{
  currentField.value=kbInput.value.trim();
  kbPopup.style.display="none";
};

numInput.onclick=()=>openKeyboard(numInput,"numbers");
kundeInput.onclick=()=>openKeyboard(kundeInput,"letters");

// Drucken
$("#btnDrucken").onclick=()=>{

  if(!selectedType) return alert("Kunde wählen!");
  if(!numInput.value.trim()) return alert("Beistellnummer fehlt!");

  var html = buildOutput(selectedType);

  var win = window.open("", "_blank", "width=1200,height=850");

  win.document.write(`
    <html><head>
      <style>
        @page { size: A5 landscape; margin:0; }
        body {
          margin:0;
          width:210mm;
          height:148mm;
          display:flex;
          justify-content:center;
          align-items:center;
          font-family:Arial;
        }
        #print { text-align:center; }
        img { width:40mm; margin-top:10mm; }
      </style>
    </head>
    <body>
      <div id="print">
        ${html}
        <img src="../langen.png">
      </div>
    </body>
    </html>
  `);

  win.document.close();
  setTimeout(()=>{
    win.print();
    win.close();
  },300);
};

// Zurück
$("#btnBack").onclick=()=>location.href="../index.html";
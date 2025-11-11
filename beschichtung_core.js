// Gemeinsame Funktionen

const out = document.getElementById('output-content');
const kundenContainer = document.getElementById('kunden');
const kundenListe = [
  ["LP", "L&P"],
  ["LPEILT", "L&P EILT SEHR"],
  ["SCHUETTE", "Schütte"],
  ["SCHUETTEEILT", "Schütte EILT SEHR"],
  ["KLEY", "Kleymann"],
  ["KLEYEILT", "Kleymann EILT SEHR"],
  ["COMTEZN8", "Comte ZN8"],
  ["CHEMISCH", "Comte Chemisch Vernickeln"],
  ["DICK", "Comte Dickschichtpassivierung"],
  ["BLAU", "Comte Blau ZN8"],
  ["PENTZ", "Pentz & Gerdes ZN8"],
  ["RCS", "RCS Schweißen"],
  ["COATINC", "Coatinc 24 Verzinken"]
];

// Buttons generieren
kundenListe.forEach(([type, label]) => {
  const b = document.createElement("button");
  b.className = "action";
  b.dataset.type = type;
  b.textContent = label;
  b.onclick = () => makeOutput(type);
  kundenContainer.appendChild(b);
});

function showPreview(txt) {
  if (out) out.innerHTML = txt;
}

function makeOutput(type) {
  const n = document.getElementById('numInput')?.value.trim() || "";
  const k = document.getElementById('kundeInput')?.value.trim() || "";
  if (!n) return alert("Bitte Beistellnummer eingeben!");

  let html = `<div style="font-size:36pt;margin-bottom:6mm;">${n}</div>`;
  const add = (main, sub = '', name = '') => {
    html += `<div style="font-size:48pt;font-weight:900;">${main}</div>`;
    if (sub) html += `<div style="font-size:32pt;">„${sub}“</div>`;
    if (name) html += `<div style="font-size:32pt;">(${name})</div>`;
  };

  switch (type) {
    case 'LP': add('L&P'); break;
    case 'LPEILT': add('L&P', 'EILT SEHR'); break;
    case 'SCHUETTE': add('Schütte'); break;
    case 'SCHUETTEEILT': add('Schütte', 'EILT SEHR'); break;
    case 'KLEY': add('Kleymann'); break;
    case 'KLEYEILT': add('Kleymann', 'EILT SEHR'); break;
    case 'COMTEZN8': add('Comte', 'ZN8', k); break;
    case 'CHEMISCH': add('Comte', 'Chemisch Vernickeln', k); break;
    case 'DICK': add('Comte', 'Dickschichtpassivierung', k); break;
    case 'BLAU': add('Comte', 'Blau ZN8', k); break;
    case 'PENTZ': add('Pentz & Gerdes', 'ZN8', k); break;
    case 'RCS': add('RCS GmbH', 'Schweißen', k); break;
    case 'COATINC': add('Coatinc 24 GmbH', 'Verzinken', k); break;
  }

  showPreview(html);
  document.querySelectorAll('#kunden button').forEach(b => b.classList.remove('active'));
  document.querySelector(`button[data-type="${type}"]`)?.classList.add('active');
}

// Druckfunktion – PC
if (document.getElementById('btnDrucken')) {
  document.getElementById('btnDrucken').onclick = () => {
    if (!out || out.innerHTML.trim() === "") return alert("Bitte zuerst einen Kunden wählen!");
    const printArea = document.getElementById('printArea');
    if (printArea) {
      const popup = window.open("", "_blank", "width=900,height=600");
      popup.document.write(`
        <html><head><title>Drucken</title>
        <style>
          @page { size: A5 landscape; margin: 0; }
          html, body {
            width: 210mm; height: 148mm; margin: 0; padding: 0;
            display: flex; justify-content: center; align-items: center;
          }
          #printArea { transform: scale(0.95); transform-origin: center center; }
        </style>
        </head><body>${printArea.outerHTML}</body></html>
      `);
      popup.document.close();
      popup.focus();
      popup.print();
      popup.close();
    }
  };
}
const num = document.getElementById('numInput');
const kunde = document.getElementById('kundeInput');
const popup = document.getElementById('keyboardPopup');
const kbInput = document.getElementById('keyboardInput');
const kbGrid = document.getElementById('keyboardGrid');
const title = document.getElementById('keyboardTitle');
let currentField = null;

/* Tastatur */
function buildKeyboard(type) {
  kbGrid.innerHTML = '';
  const chars = (type === 'numbers')
    ? ['1','2','3','4','5','6','7','8','9','0']
    : 'QWERTZUIOPASDFGHJKLYXCVBNM'.split('');

  chars.forEach(c => {
    const b = document.createElement('button');
    b.textContent = c;
    b.onclick = () => kbInput.value += c;
    kbGrid.appendChild(b);
  });
}

function openKeyboard(field, type) {
  currentField = field;
  title.textContent = (type === 'numbers')
    ? 'Beistellnummer eingeben'
    : 'Kundenname eingeben';
  kbInput.value = field.value || '';
  kbInput.dataset.type = type;
  buildKeyboard(type);
  popup.style.display = 'flex';
  setTimeout(() => kbInput.focus(), 100);
}

function closeKeyboard() {
  popup.style.display = 'none';
}

document.getElementById('btnDel').onclick = () =>
  kbInput.value = kbInput.value.slice(0, -1);

document.getElementById('btnClose').onclick = closeKeyboard;

document.getElementById('btnOk').onclick = () => {
  currentField.value = kbInput.value.trim();
  closeKeyboard();
  if (currentField === num && kbInput.value.trim() !== '') {
    openKeyboard(kunde, 'letters');
  }
};

num.onclick = () => openKeyboard(num, 'numbers');
kunde.onclick = () => openKeyboard(kunde, 'letters');

/* Vorschau + Druck */
function makeOutput(type) {
  const n = num.value.trim(), k = kunde.value.trim();
  if (!n || !k) {
    alert('Bitte Beistellnummer UND Kunde eingeben.');
    return;
  }

  let html = `<div style="font-size:36pt;margin-bottom:6mm;">${n}</div>`;

  const add = (main, sub = '', name = '') => {
    html += `<div data-fit style="font-size:48pt;">${main}</div>`;
    if (sub) html += `<div data-fit style="font-size:36pt;">„${sub}“</div>`;
    if (name) html += `<div data-fit style="font-size:32pt;">(${name})</div>`;
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

  document.getElementById('output-content').innerHTML = html;
  document.getElementById('previewPopup').style.display = 'flex';
  autoResizeText();
}

document.querySelectorAll('#kunden button').forEach(btn =>
  btn.onclick = () => makeOutput(btn.dataset.type)
);

document.getElementById('btnPrintNow').onclick = () => {
  window.print();
  document.getElementById('previewPopup').style.display = 'none';
};

document.getElementById('btnCancelPreview').onclick = () =>
  document.getElementById('previewPopup').style.display = 'none';

document.getElementById('btnClosePreview').onclick = () =>
  document.getElementById('previewPopup').style.display = 'none';

document.getElementById('btnBack').onclick = () => history.back();

/* Dynamische Schriftgrößenanpassung */
function autoResizeText() {
  const elements = document.querySelectorAll('#output-content [data-fit]');
  elements.forEach(el => {
    let size = parseFloat(el.style.fontSize);
    while (el.scrollWidth > el.clientWidth && size > 10) {
      size -= 1;
      el.style.fontSize = size + 'pt';
    }
  });
}
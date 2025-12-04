let activeInput = null;
let currentColor = "red";
let scanBuffer = "";

/* =============================
   Gerät erkennen (Zebra → kein Popup)
============================= */
function isMobile() {

    const ua = navigator.userAgent;

    // Zebra-Scanner erkennen
    if (/Zebra|TC21|TC22|TC26|SDC/i.test(ua)) {
        return false;  // Popup NICHT automatisch öffnen
    }

    // Smartphones
    return /Android|iPhone|iPad|iPod|Windows Phone/i.test(ua);
}

/* PC → Eingabe erlauben */
if (!isMobile()) {
    kommission.removeAttribute("readonly");
    lieferdatum.removeAttribute("readonly");
}

/* ⭐ Beim Start sofort Kommission fokussieren */
window.onload = () => {
    kommission.focus();
};

/* =============================
   ⭐ NEUE DATUMFORMATIERUNG (FEHLERFREI)
============================= */

/* Beim Tippen nur Zahlen erlauben */
lieferdatum.addEventListener("input", () => {
    lieferdatum.value = lieferdatum.value.replace(/\D/g, "");
});

/* Beim Verlassen formatieren */
lieferdatum.addEventListener("blur", () => {
    let v = lieferdatum.value.replace(/\D/g, "");

    if (v.length === 0) {
        lieferdatum.value = "";
        return;
    }

    if (v.length === 3) {
        v = "0" + v;     // 111 → 0111 → 01.11
    }

    if (v.length >= 4) {
        v = v.slice(0, 2) + "." + v.slice(2, 4);
    }

    lieferdatum.value = v;
});

/* ENTER → weiter zum Datum */
kommission.addEventListener("keydown", (e) => {
    if (e.key === "Enter") lieferdatum.focus();
});

/* =============================
   Farben auswählen
============================= */
document.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentColor = btn.dataset.color;
    });
});

/* =============================
   Popup Tastatur erzeugen
============================= */
const grid = document.getElementById("keyboardKeys");
["1","2","3","4","5","6","7","8","9","0"].forEach(c => {
    const b = document.createElement("button");
    b.textContent = c;
    b.onclick = () => keyboardInput.value += c;
    grid.appendChild(b);
});

/* Eingabefeld öffnet Popup (nur Handy) */
kommission.onclick = () => { if (isMobile()) openKeyboard("kommission"); };
lieferdatum.onclick = () => { if (isMobile()) openKeyboard("lieferdatum"); };

function openKeyboard(id) {
    activeInput = document.getElementById(id);
    keyboardInput.value = "";
    keyboardPopup.style.display = "flex";
    keyboardTitle.textContent = id === "kommission" ? "Kommissionsnummer" : "Lieferdatum";

    setTimeout(() => keyboardInput.focus(), 100);
}

/* ========= Manuelle Tastatur öffnen ========= */
openKeyboardBtn.onclick = () => {
    activeInput = kommission;
    openKeyboard("kommission");
};

/* Popup Buttons */
keyboardClose.onclick = () => keyboardPopup.style.display = "none";
keyboardDelete.onclick = () => keyboardInput.value = keyboardInput.value.slice(0,-1);
keyboardOK.onclick = handleKeyboardOK;

keyboardInput.addEventListener("keydown", e => {
    if (e.key === "Enter") handleKeyboardOK();
});

/* Popup Eingabe übernehmen */
function handleKeyboardOK() {

    if (!activeInput) return;

    let val = keyboardInput.value.replace(/\D/g, "");

    if (activeInput.id === "lieferdatum") {

        if (val.length === 3) val = "0" + val;
        if (val.length >= 4)
            val = val.slice(0,2) + "." + val.slice(2,4);
    }

    activeInput.value = val;
    keyboardPopup.style.display = "none";
}

/* =============================
   DRUCKEN
============================= */
druckenBtn.onclick = () => {

    if (!kommission.value.trim()) {
        alert("Bitte Kommissionsnummer eingeben!");
        return;
    }

    if (!lieferdatum.value.trim()) {
        alert("Bitte Lieferdatum eingeben!");
        return;
    }

    const data = {
        kommission: kommission.value.trim(),
        lieferdatum: lieferdatum.value.trim(),
        vorgezogen: chkVorgezogen.checked,
        farbe: currentColor
    };

    const json = JSON.stringify(data);

    if (window.Android && typeof Android.printPaus === "function") {
        Android.printPaus(json);
        return;
    }

    window.location.href = "paus_druck.html?data=" + encodeURIComponent(json);
};

/* Zurück */
backBtn.onclick = () => history.back();

/* =============================
   ⭐ ZEBRA SCANNER — Datum & Kommission einfüllen
============================= */
document.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        let text = scanBuffer.trim();

        if (text.includes("K:") && text.includes("D:")) {

            const kom = text.match(/K:(.*?);/)[1];
            const raw = text.match(/D:(.*)/)[1].replace(/\D/g, "");

            let dat = raw;
            if (dat.length === 3) dat = "0" + dat;
            if (dat.length >= 4)
                dat = dat.slice(0,2) + "." + dat.slice(2,4);

            kommission.value = kom;
            lieferdatum.value = dat;
        }

        scanBuffer = "";
    } 
    else {
        scanBuffer += e.key;
    }
});
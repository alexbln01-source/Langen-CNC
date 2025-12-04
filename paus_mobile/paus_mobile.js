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
   PC: Automatische Datumformatierung
============================= */
lieferdatum.addEventListener("input", () => {
    let v = lieferdatum.value.replace(/\D/g, "");

    if (v.length === 3) v = "0" + v;
    if (v.length >= 4) v = v.slice(0, 2) + "." + v.slice(2, 4) + ".";

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

    let val = keyboardInput.value.trim();

    if (activeInput.id === "lieferdatum") {
        val = val.replace(/\D/g, "");
        if (val.length === 3) val = "0" + val;
        if (val.length >= 4) val = val.slice(0,2) + "." + val.slice(2,4) + ".";
    }

    activeInput.value = val;

    if (activeInput.id === "kommission" && isMobile()) {
        openKeyboard("lieferdatum");
        return;
    }

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
   ⭐ ZEBRA SCANNER — Kommission + Datum automatisch einfüllen
============================= */
document.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        let text = scanBuffer.trim();

        if (text.includes("K:") && text.includes("D:")) {

            const kom = text.match(/K:(.*?);/)[1];
            const datRaw = text.match(/D:(.*)/)[1].replace(/\D/g, "");

            let dat = datRaw;
            if (dat.length === 3) dat = "0" + dat;
            if (dat.length >= 4) dat = dat.slice(0,2) + "." + dat.slice(2,4) + ".";

            kommission.value = kom;
            lieferdatum.value = dat;

            // ⭐ Kein Weiter-Klick → Bediener muss noch Vorgezogen & Farbe setzen
        }

        scanBuffer = "";
    } 
    else {
        scanBuffer += e.key;
    }
});
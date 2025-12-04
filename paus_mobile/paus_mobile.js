let activeInput = null;
let currentColor = "red";
let scanBuffer = "";

/* =============================
   Gerät erkennen (Zebra → kein Popup)
============================= */
function isMobile() {

    const ua = navigator.userAgent;

    if (/Zebra|TC21|TC22|TC26|SDC/i.test(ua)) {
        return false;
    }
    return /Android|iPhone|iPad|iPod/i.test(ua);
}

/* PC darf normal tippen */
if (!isMobile()) {
    kommission.removeAttribute("readonly");
    lieferdatum.removeAttribute("readonly");
}

/* =============================
   Focus beim Start & Felder leeren
============================= */
window.onload = () => {
    kommission.value = "";
    lieferdatum.value = "";
    kommission.focus();
};

/* =============================
   DATUM → nur bei blur formatieren
============================= */
lieferdatum.addEventListener("input", () => {
    // während der Eingabe nur Zahlen und Punkt erlauben
    lieferdatum.value = lieferdatum.value.replace(/[^\d.]/g, "");
});

lieferdatum.addEventListener("blur", () => {
    let v = lieferdatum.value.replace(/\D/g, ""); // Zahlen extrahieren

    if (v.length === 0) return;

    if (v.length === 3) {
        v = "0" + v;
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
   Farben wählen
============================= */
document.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentColor = btn.dataset.color;
    });
});

/* =============================
   POPUP TASTATUR 
============================= */
function openKeyboard(id) {
    activeInput = document.getElementById(id);

    keyboardInput.value = "";
    keyboardTitle.textContent = id === "kommission" ? "Kommissionsnummer" : "Lieferdatum";
    keyboardPopup.style.display = "flex";

    setTimeout(() => keyboardInput.focus(), 50);
}

/* Handy öffnet Popup */
["click","touchstart"].forEach(evt => {
    kommission.addEventListener(evt, () => { if (isMobile()) openKeyboard("kommission"); });
    lieferdatum.addEventListener(evt, () => { if (isMobile()) openKeyboard("lieferdatum"); });
});

/* Tastatur–Buttons */
keyboardClose.onclick = () => keyboardPopup.style.display = "none";
keyboardDelete.onclick = () => keyboardInput.value = keyboardInput.value.slice(0, -1);

keyboardOK.onclick = () => {
    if (!activeInput) return;

    let val = keyboardInput.value.replace(/\D/g, "");

    if (activeInput.id === "lieferdatum") {
        if (val.length === 3) val = "0" + val;
        if (val.length >= 4) val = val.slice(0, 2) + "." + val.slice(2, 4);
    }

    activeInput.value = val;
    keyboardPopup.style.display = "none";
};

/* ENTER im Popup */
keyboardInput.addEventListener("keydown", e => {
    if (e.key === "Enter") keyboardOK.onclick();
});

/* =============================
   DRUCKEN
============================= */
druckenBtn.onclick = () => {

    if (!kommission.value.trim()) return alert("Bitte Kommissionsnummer eingeben!");
    if (!lieferdatum.value.trim()) return alert("Bitte Lieferdatum eingeben!");

    const data = {
        kommission: kommission.value,
        lieferdatum: lieferdatum.value,
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

backBtn.onclick = () => history.back();

/* =============================
   ZEBRA SCANNER
============================= */
document.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        let text = scanBuffer.trim();

        if (text.includes("K:") && text.includes("D:")) {

            const kom = text.match(/K:(.*?);/)[1];
            const raw = text.match(/D:(.*)/)[1].replace(/\D/g, "");

            let dat = raw;
            if (dat.length === 3) dat = "0" + dat;
            if (dat.length >= 4) dat = dat.slice(0, 2) + "." + dat.slice(2, 4);

            kommission.value = kom;
            lieferdatum.value = dat;
        }

        scanBuffer = "";
    } else {
        scanBuffer += e.key;
    }
});

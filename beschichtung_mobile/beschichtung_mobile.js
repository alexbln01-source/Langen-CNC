let activeInput = null;
let currentColor = "red";
let scanBuffer = "";

const kommission = document.getElementById("kommission");
const lieferdatum = document.getElementById("lieferdatum");

/* =============================
   GERÄTE ERKENNEN
============================= */

function detectDevice() {
    const ua = navigator.userAgent;
    const sw = screen.width;
    const sh = screen.height;

    if (/TC21|TC22|TC26|Zebra/i.test(ua)) return "zebra";

    if (/Android|iPhone|iPad/i.test(ua)) return "mobile";

    return "pc";
}

const deviceType = detectDevice();

document.getElementById("deviceInfo").textContent =
    deviceType === "zebra" ? "Gerät: Zebra TC22"
  : deviceType === "mobile" ? "Gerät: Mobil"
  : "Gerät: PC";

/* =============================
   PC → keine Popup Tastatur
============================= */
if (deviceType === "pc") {
    document.body.classList.add("pc-device");

    kommission.removeAttribute("readonly");
    lieferdatum.removeAttribute("readonly");

    document.getElementById("openKeyboardBtn").style.display = "none";
    document.getElementById("keyboardPopup").style.display = "none";
}

/* =============================
   Zebra → Popup, Cursor setzen
============================= */
if (deviceType === "zebra") {
    kommission.readOnly = true;
    lieferdatum.readOnly = true;

    setTimeout(() => kommission.focus(), 300);
}

/* =============================
   MOBILE TASTATUR → Popup
============================= */

function openKeyboard(field) {
    activeInput = field;

    keyboardInput.value = field.value;
    keyboardTitle.textContent = field.id === "kommission"
        ? "Kommissionsnummer"
        : "Lieferdatum";

    keyboardPopup.style.display = "flex";

    setTimeout(() => keyboardInput.focus(), 50);
}

openKeyboardBtn.onclick = () => openKeyboard(kommission);

kommission.addEventListener("click", () => {
    if (deviceType !== "pc") openKeyboard(kommission);
});
lieferdatum.addEventListener("click", () => {
    if (deviceType !== "pc") openKeyboard(lieferdatum);
});

/* KEYS erzeugen */
const letters = "12345ABCDE67890FGHIJ";
keyboardKeys.innerHTML = "";
for (let c of letters) {
    let b = document.createElement("button");
    b.textContent = c;
    b.onclick = () => keyboardInput.value += c;
    keyboardKeys.appendChild(b);
}

keyboardDelete.onclick = () => {
    keyboardInput.value = keyboardInput.value.slice(0, -1);
};

keyboardClose.onclick = () => {
    keyboardPopup.style.display = "none";
};

keyboardOK.onclick = () => {
    let val = keyboardInput.value;

    if (activeInput.id === "lieferdatum") {
        let raw = val.replace(/\D/g, "");
        if (raw.length === 3) raw = "0" + raw;
        if (raw.length >= 4) raw = raw.slice(0,2) + "." + raw.slice(2,4);
        val = raw;
    }

    activeInput.value = val;
    keyboardPopup.style.display = "none";

    if (activeInput.id === "kommission") {
        lieferdatum.focus();
    }
};

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

    if (window.Android?.printPaus) {
        Android.printPaus(json);
    } else {
        location.href = "paus_druck.html?data=" + encodeURIComponent(json);
    }
};

/* =============================
   FARBAUSWAHL
============================= */
document.querySelectorAll(".color-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentColor = btn.dataset.color;
    };
});

/* =============================
   SCANNER (Zebra)
============================= */
document.addEventListener("keydown", e => {

    if (deviceType !== "zebra") return;

    if (e.key === "Enter") {
        const text = scanBuffer.trim();

        if (text.includes("K:") && text.includes("D:")) {
            kommission.value = text.match(/K:(.*?);/)[1];
            let d = text.match(/D:(.*)/)[1].replace(/\D/g, "");
            if (d.length === 3) d = "0" + d;
            if (d.length >= 4) d = d.slice(0,2) + "." + d.slice(2,4);
            lieferdatum.value = d;
        }

        scanBuffer = "";
    } else {
        scanBuffer += e.key;
    }
});

/* =============================
   BUILD INFO
============================= */
document.addEventListener("DOMContentLoaded", () => {
    const d = new Date(document.lastModified);
    const build =
        d.getFullYear() + "-" +
        String(d.getMonth()+1).padStart(2,"0") + "-" +
        String(d.getDate()).padStart(2,"0") + " " +
        String(d.getHours()).padStart(2,"0") +
        String(d.getMinutes()).padStart(2,"0");

    document.getElementById("buildInfo").textContent = "Build " + build;
});

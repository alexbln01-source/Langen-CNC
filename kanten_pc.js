let selectedCustomer = "";

// EINSTELLBARE ABSTÄNDE (Pixel)
const ABSTAND_OBEN = 50;                 // Abstand oberer Rand → Block
const ABSTAND_UNTEN = 0;               // Abstand Block → unterer Rand

const ABSTAND_KUNDE_ZU_KANTEN = 20;     // Kunde → Kanten
const ABSTAND_KANTEN_ZU_TERMIN = 50;    // Kanten → K-Termin
const ABSTAND_TERMIN_ZU_PALETTE = 50;   // K-Termin → Palettennummer


// ==========================
// Vorschau aktualisieren
// ==========================
function updatePreview() {
    if (!selectedCustomer) return;

    const output = document.getElementById("output-content");
    const box = document.querySelector(".output-box");

    // Außenabstände setzen
    box.style.display = "flex";
    box.style.flexDirection = "column";
    box.style.justifyContent = "flex-start";
    box.style.paddingTop = ABSTAND_OBEN + "px";
    box.style.paddingBottom = ABSTAND_UNTEN + "px";

    // Inhalt erzeugen
    output.innerHTML = `
        <div style="font-size:28pt; margin-bottom:${ABSTAND_KUNDE_ZU_KANTEN}px;">
            ${selectedCustomer}
        </div>

        <div style="font-size:28pt; margin-bottom:${ABSTAND_KANTEN_ZU_TERMIN}px;">
            Kanten
        </div>

        <div style="font-size:18pt; text-align:center; width:100%; margin-bottom:${ABSTAND_TERMIN_ZU_PALETTE}px;">
            K-Termin: ________________
        </div>

        <div style="font-size:18pt; text-align:center; width:100%;">
            Palettennummer: __________
        </div>
    `;
}


// ============================
// Button-Klicks
// ============================
document.querySelectorAll(".action").forEach(btn => {
    btn.addEventListener("click", () => {
        const text = btn.textContent.trim();

        if (text === "⬅️ Zurück") {
            history.back();
            return;
        }

        if (text === "🖨 Drucken") {
            window.print();
            return;
        }

        selectedCustomer = btn.dataset.customer || text;
        updatePreview();
    });
});
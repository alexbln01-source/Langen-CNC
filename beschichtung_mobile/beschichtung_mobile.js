document.addEventListener("DOMContentLoaded", () => {
  const beistellInput = document.getElementById("beistellInput");
  const kundeInput = document.getElementById("kundeInput");
  const kundenButtons = document.querySelectorAll(".kunde-btn");
  const eiltBtn = document.getElementById("eiltBtn");
  const druckenBtn = document.getElementById("druckenBtn");

  let selectedType = null;
  let eiltActive = false;

  // Kunde wählen
  kundenButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      kundenButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedType = btn.dataset.type || null;
    });
  });

  // EILT Toggle
  eiltBtn.addEventListener("click", () => {
    eiltActive = !eiltActive;
    if (eiltActive) {
      eiltBtn.classList.add("active");
      eiltBtn.textContent = "EILT SEHR: EIN";
    } else {
      eiltBtn.classList.remove("active");
      eiltBtn.textContent = "EILT SEHR: AUS";
    }
  });

  // Drucken / Weiter zur Druckvorschau
  druckenBtn.addEventListener("click", () => {
    if (!selectedType) {
      alert("Bitte einen Kunden auswählen!");
      return;
    }

    const beistell = beistellInput.value.trim();
    const kundename = kundeInput.value.trim();

    if (!beistell) {
      alert("Bitte eine Beistellnummer eingeben!");
      return;
    }

    // Typ inkl. EILT für L&P, Schütte, Kleymann
    let typeToSend = selectedType;

    if (eiltActive) {
      if (selectedType === "LP") {
        typeToSend = "LPEILT";
      } else if (selectedType === "SCHUETTE") {
        typeToSend = "SCHUETTEEILT";
      } else if (selectedType === "KLEY") {
        typeToSend = "KLEYEILT";
      }
      // für alle anderen Kunden bleibt EILT ohne Wirkung
    }

    const payload = {
      selectedType: typeToSend,
      beistell,
      kundename
    };

    const encoded = encodeURIComponent(JSON.stringify(payload));

    // zur Druckseite gehen (kein automatischer Druck, nur Vorschau)
    window.open("druck.html?data=" + encoded, "_blank");
  });
});
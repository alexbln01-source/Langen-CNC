document.addEventListener("DOMContentLoaded", () => {
  const beistellInput = document.getElementById("beistellInput");
  const kundeInput = document.getElementById("kundeInput");
  const kundenBtns = document.querySelectorAll(".kunde-btn");
  const eiltBtn = document.getElementById("eiltBtn");
  const druckenBtn = document.getElementById("druckenBtn");
  const backBtn = document.getElementById("backBtn");

  let selectedType = null;
  let eilt = false;

  // Kunde auswählen
  kundenBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      kundenBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedType = btn.dataset.type;
    });
  });

  // EILT Toggle
  eiltBtn.addEventListener("click", () => {
    eilt = !eilt;
    if (eilt) {
      eiltBtn.classList.add("active");
      eiltBtn.textContent = "EILT SEHR: EIN";
    } else {
      eiltBtn.classList.remove("active");
      eiltBtn.textContent = "EILT SEHR: AUS";
    }
  });

  // ZURÜCK-BUTTON (funktioniert IMMER)
  backBtn.addEventListener("click", () => {
    window.location.href = "../index.html";
  });

  // DRUCKEN
  druckenBtn.addEventListener("click", () => {
    if (!selectedType) {
      alert("Bitte Kunde wählen!");
      return;
    }

    if (!beistellInput.value.trim()) {
      alert("Beistellnummer fehlt!");
      return;
    }

    let outType = selectedType;

    // EILT nur bei L&P, Schütte, Kleymann
    if (eilt) {
      if (selectedType === "LP") outType = "LPEILT";
      if (selectedType === "SCHUETTE") outType = "SCHUETTEEILT";
      if (selectedType === "KLEY") outType = "KLEYEILT";
    }

    const payload = {
      selectedType: outType,
      beistell: beistellInput.value.trim(),
      kundename: kundeInput.value.trim()
    };

    const encoded = encodeURIComponent(JSON.stringify(payload));

    window.open("druck.html?data=" + encoded, "_blank");
  });

});
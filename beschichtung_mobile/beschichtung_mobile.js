let activeInput = null;

// ===== Eingabefelder aktivieren =====

document.getElementById("beistellInput").addEventListener("click", () => {
    activeInput = document.getElementById("beistellInput");

    // Keyboard sichtbar
    document.getElementById("numKeyboard").style.display = "block";
    document.getElementById("alphaKeyboard").style.display = "none";
});

document.getElementById("kundeInput").addEventListener("click", () => {
    activeInput = document.getElementById("kundeInput");

    // Keyboard sichtbar
    document.getElementById("alphaKeyboard").style.display = "block";
    document.getElementById("numKeyboard").style.display = "none";
});


// ===== Zahlen-Keyboard =====

document.querySelectorAll("#numKeyboard .kbm-key").forEach(key => {
    key.addEventListener("click", () => {
        const val = key.innerText;

        if (!activeInput) return;

        if (val === "⌫") {
            activeInput.value = activeInput.value.slice(0, -1);
        } 
        else if (val === "OK") {
            document.getElementById("numKeyboard").style.display = "none";
        } 
        else {
            activeInput.value += val;
        }
    });
});


// ===== QWERTZ-Keyboard =====

document.querySelectorAll("#alphaKeyboard .kbm-key").forEach(key => {
    key.addEventListener("click", () => {
        const val = key.innerText;

        if (!activeInput) return;

        if (val === "⌫") {
            activeInput.value = activeInput.value.slice(0, -1);
        } 
        else if (val === "OK") {
            document.getElementById("alphaKeyboard").style.display = "none";
        } 
        else {
            activeInput.value += val;
        }
    });
});

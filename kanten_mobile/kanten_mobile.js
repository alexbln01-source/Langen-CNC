/* ============================================================
   GLOBAL
============================================================ */
* {
    box-sizing: border-box;
}

html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    background: #eef1f4;
    font-family: Arial, sans-serif;

    display: flex;
    justify-content: center;
    align-items: flex-start;
    overflow: hidden;
}

/* ============================================================
   PAGE (kein weißes Card mehr)
============================================================ */
#card {
    width: 94%;
    margin-top: 20px;
    background: transparent;
    padding-bottom: 20px;
}

/* ============================================================
   TITEL
============================================================ */
h1 {
    text-align: center;
    color: #003a73;
    font-size: 32px;
    margin-bottom: 10px;
    font-weight: 900;
}

/* ============================================================
   Kanten / Schweißen Buttons
============================================================ */
.art-btn-row {
    display: flex;
    justify-content: center;
    gap: 12px;
    width: 100%;
    margin-bottom: 18px;
}

.artBtn {
    flex: 1;
    padding: 14px 0;
    font-size: 20px;
    font-weight: bold;
    background: #e7ecf5;
    color: #003a73;
    border: none;
    border-radius: 14px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.25);
}

.artBtn.active {
    background: #007bff;
    color: #fff;
}

/* ============================================================
   GRID LABEL
============================================================ */
.grid-label {
    font-size: 18px;
    font-weight: 900;
    text-align: center;
    color: #003a73;
    margin-bottom: 10px;
}

/* ============================================================
   KUNDEN GRID – 3 SPALTEN!
============================================================ */
#kundenArea {
    display: grid;
    grid-template-columns: repeat(3, 1fr); /* ← 3 NEBENAN! */
    gap: 14px;
    width: 100%;
    padding: 0 10px;
}

/* ============================================================
   KUNDEN BUTTONS
============================================================ */
.kundeBtn {
    width: 100%;
    padding: 18px 0;

    font-size: 18px;
    font-weight: bold;

    background: white;
    color: #003a73;

    border: none;
    border-radius: 14px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.25);

    text-align: center;
}

.kundeBtn.active {
    background: #007bff;
    color: white;
    transform: scale(0.98);
}

/* ============================================================
   UNTERE BUTTONS
============================================================ */
#actionButtons {
    display: flex;
    justify-content: space-between;
    margin-top: 25px;
}

#btnBack,
#btnDrucken {
    width: 48%;
    padding: 18px 0;
    font-size: 22px;
    font-weight: bold;
    border-radius: 16px;
    border: none;
    color: white;
}

#btnBack { background: #444; }
#btnDrucken { background: #00963d; }

/* ============================================================
   POPUP (Sonstige)
============================================================ */
#keyboardPopup {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    justify-content: center;
    align-items: center;
    z-index: 9000;
}

#keyboardBox {
    background: white;
    padding: 25px;
    border-radius: 20px;
    width: 90%;
    max-width: 380px;
}

#keyboardInput {
    width: 100%;
    padding: 14px;
    font-size: 22px;
    border: 2px solid #004a87;
    border-radius: 10px;
    margin-bottom: 12px;
}

/* ============================================================
   TASTATUR
============================================================ */
#keyboardGrid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}

#keyboardGrid button {
    width: 18%;
    margin: 4px;
    padding: 14px 0;
    font-size: 20px;
    border-radius: 10px;
}

#kbActions {
    display: flex;
    justify-content: space-between;
    margin-top: 15px;
}

#kbActions button {
    width: 32%;
    padding: 14px 0;
    font-size: 18px;
    border-radius: 10px;
}

/* ============================================================
   TC21 / TC22 Anpassungen
============================================================ */
body.zebra-tc21 .kundeBtn {
    font-size: 14px;
    padding: 12px 0;
}

body.zebra-tc22 .kundeBtn {
    font-size: 17px;
    padding: 16px 0;
}

/* ============================================================
   PC Layout
============================================================ */
body.pc-device #card {
    width: 80%;
    margin-top: 40px;
}

body.pc-device #kundenArea {
    max-width: 900px;
}

body.pc-device .kundeBtn {
    font-size: 20px;
}

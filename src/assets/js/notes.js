// Global state variables
let notes = []; // Array to store all notes
let editingNoteId = null; // ID of the note currently being edited
let currentFilter = "all"; // Current filter view: "all", "archived", or "statistics"

// Color theme configuration for the application
const COLOR_THEMES = {
    blue: "#4194e2",
    orange: "#F5871E",
    yellow: "#FCC419",
    green: "#83C70E",
    purple: "#CC5DE8",
    pink: "#ED64C8",
};

/**************************************/
/*     DATA PERSISTENCE FUNCTIONS     */
/**************************************/

/**
 * Loads notes from localStorage
 * @returns {Array} Array of notes or empty array if none exist
 */
function loadNotes() {
    const savedNotes = localStorage.getItem("quickNotes");
    return savedNotes ? JSON.parse(savedNotes) : [];
}

/**
 * Saves notes array to localStorage
 */
function saveNotes() {
    localStorage.setItem("quickNotes", JSON.stringify(notes));
}

/**
 * Generates a unique ID for new notes
 * @returns {string} Timestamp-based unique ID
 */
function generateId() {
    return Date.now().toString();
}

/**************************************/
/*       ALERT SYSTEM FUNCTIONS       */
/**************************************/

/**
 * Shows a customizable alert modal with various styling options
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {boolean} isConfirmation - Whether to show confirm/cancel buttons
 * @param {Function} confirmCallback - Callback function for confirmation
 */
function showCustomAlert(title, message, isConfirmation = false, confirmCallback = null) {
    const alertBox = document.getElementById("customAlert");
    const alertTitle = document.getElementById("alertTitle");
    const alertMessage = document.getElementById("alertMessage");
    const confirmBtn = document.getElementById("confirmAlertBtn");
    const cancelBtn = document.getElementById("cancelAlertBtn");
    const alertButtons = document.querySelector(".alert-buttons");
    alertTitle.textContent = title;
    alertMessage.textContent = message;
    confirmBtn.className = "alert-btn";
    cancelBtn.className = "alert-btn cancel";
    confirmBtn.removeAttribute("style");
    cancelBtn.removeAttribute("style");
    alertTitle.removeAttribute("style");
    const isError = /error|failed|duplicate|no notes/i.test(title.toLowerCase());
    if (isError) {
        alertTitle.style.color = "#e74c3c";
        confirmBtn.classList.add("error");
    } else {
        alertTitle.style.color = getComputedStyle(document.body).getPropertyValue("--brand-color");
        confirmBtn.classList.add("confirm");
    }
    if (isConfirmation) {
        alertButtons.style.display = "flex";
        confirmBtn.textContent = "Confirm";
        confirmBtn.classList.add("error");
        cancelBtn.style.display = "block";
        if (confirmCallback) {
            confirmBtn.onclick = function () {
                confirmCallback();
                closeCustomAlert();
            };
        } else {
            confirmBtn.onclick = closeCustomAlert;
        }
        cancelBtn.onclick = closeCustomAlert;
    } else {
        alertButtons.style.display = "flex";
        confirmBtn.textContent = "OK";
        cancelBtn.style.display = "none";
        confirmBtn.onclick = closeCustomAlert;
    }
    alertBox.classList.remove("hidden");
}

/**
 * Closes the custom alert modal
 */
function closeCustomAlert() {
    document.getElementById("customAlert").classList.add("hidden");
}

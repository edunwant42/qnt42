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

/**************************************/
/*      NOTE MANAGEMENT FUNCTIONS     */
/**************************************/

/**
 * Saves a new note or updates an existing one
 * Handles form validation, keyword processing, and duplicate detection
 * @param {Event} event - Form submit event
 */
function saveNote(event) {
    event.preventDefault();
    const title = document.getElementById("noteTitle").value.trim();
    const content = document.getElementById("noteContent").value.trim();
    const keywordsInput = document.getElementById("noteKeywords").value.trim();

    // Process keywords: split, trim, convert to lowercase, and remove duplicates
    const rawKeywords = keywordsInput ? keywordsInput.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean) : [];
    const uniqueKeywords = [...new Set(rawKeywords)];
    const MAX_KEYWORDS = 5;

    // Validate keywords
    if (rawKeywords.length !== uniqueKeywords.length) {
        showCustomAlert("Duplicate Keywords", "You have entered duplicate keywords. Only unique keywords will be saved.", false);
    }
    if (uniqueKeywords.length > MAX_KEYWORDS) {
        showCustomAlert("Too Many Keywords", `You can only add up to ${MAX_KEYWORDS} keywords. The first ${MAX_KEYWORDS} will be used.`, false);
        uniqueKeywords.splice(MAX_KEYWORDS);
    }

    const now = new Date().toISOString();

    // Update existing note or create new one
    if (editingNoteId) {
        const noteIndex = notes.findIndex((note) => note.id === editingNoteId);
        notes[noteIndex] = {
            ...notes[noteIndex],
            title,
            content,
            modifiedAt: now,
            keywords: uniqueKeywords,
        };
    } else {
        // Create new note and add to beginning of array
        notes.unshift({
            id: generateId(),
            title,
            content,
            createdAt: now,
            modifiedAt: now,
            keywords: uniqueKeywords,
            pinned: false,
            archived: false,
        });
    }

    // Clean up and refresh UI
    closeNoteDialog();
    saveNotes();
    renderNotes();
    document.getElementById("searchInput").value = "";
}

/**
 * Deletes a specific note by ID
 * @param {string} noteId - ID of the note to delete
 */
function deleteNote(noteId) {
    closeExpandedHeader();
    notes = notes.filter((note) => note.id !== noteId);
    saveNotes();
    renderNotes();
}

/**
 * Deletes all notes after user confirmation
 */
function deleteAllNotes() {
    closeExpandedHeader();
    if (notes.length === 0) {
        showCustomAlert("No Notes", "There are no notes to delete.", false);
        return;
    }
    showCustomAlert("Delete All Notes?", "Are you sure you want to delete ALL notes? This action cannot be undone.", true, function () {
        notes = [];
        saveNotes();
        renderNotes();
    });
}

/**
 * Toggles the pinned status of a note
 * @param {string} noteId - ID of the note to toggle
 */
function togglePin(noteId) {
    closeExpandedHeader();
    const note = notes.find((n) => n.id === noteId);
    if (note) {
        note.pinned = !note.pinned;
        note.modifiedAt = new Date().toISOString();
        saveNotes();
        renderNotes();
    }
}

/**
 * Toggles the archived status of a note
 * @param {string} noteId - ID of the note to toggle
 */
function toggleArchive(noteId) {
    closeExpandedHeader();
    const note = notes.find((n) => n.id === noteId);
    if (note) {
        note.archived = !note.archived;
        note.modifiedAt = new Date().toISOString();
        saveNotes();
        renderNotes();
    }
}


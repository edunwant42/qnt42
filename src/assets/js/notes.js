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

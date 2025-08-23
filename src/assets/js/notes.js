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

/**************************************/
/*   RENDERING AND DISPLAY FUNCTIONS  */
/**************************************/

/**
 * Renders notes in the main container based on current filter
 * Handles three views: statistics, notes grid, and empty state
 * @param {Array} filteredNotes - Optional pre-filtered array of notes
 */
function renderNotes(filteredNotes) {
    const container = document.getElementById("notesContainer");
    let notesToRender = Array.isArray(filteredNotes) ? filteredNotes : notes;

    // Handle statistics view
    if (currentFilter === "statistics") {
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.justifyContent = "center";
        container.style.alignItems = "center";

        // Calculate statistics
        const total = notes.length;
        const active = notes.filter((n) => !n.archived).length;
        const archived = notes.filter((n) => n.archived).length;
        const pinned = notes.filter((n) => n.pinned).length;
        const keywords = new Set(notes.flatMap((n) => n.keywords)).size;

        // Render statistics cards
        container.innerHTML = ` 
            <div class="stats-view active"> 
                <h2 class="stats-title"> Statistics</h2> 
                <div class="stats-grid"> 
                    <div class="stat-card"> 
                        <i class="ri-file-list-3-line stat-icon"></i> 
                        <h3>Total Notes</h3> 
                        <p class="stat-number" data-value="${total}">0</p> 
                    </div> 
                    <div class="stat-card"> 
                        <i class="ri-edit-2-line stat-icon"></i> 
                        <h3>Active Notes</h3> 
                        <p class="stat-number" data-value="${active}">0</p> 
                    </div> 
                    <div class="stat-card"> 
                        <i class="ri-archive-line stat-icon"></i> 
                        <h3>Archived</h3> 
                        <p class="stat-number" data-value="${archived}">0</p> 
                    </div> 
                    <div class="stat-card"> 
                        <i class="ri-pushpin-line stat-icon"></i> 
                        <h3>Pinned</h3> 
                        <p class="stat-number" data-value="${pinned}">0</p> 
                    </div> 
                    <div class="stat-card"> 
                        <i class="ri-price-tag-3-line stat-icon"></i> 
                        <h3>Unique Keywords</h3> 
                        <p class="stat-number" data-value="${keywords}">0</p> 
                    </div> 
                </div> 
            </div> 
        `;

        // Animate statistics numbers with counting effect
        container.querySelectorAll(".stat-number").forEach((el) => {
            const target = +el.dataset.value;
            let count = 0;
            const step = Math.max(1, Math.floor(target / 30));
            const interval = setInterval(() => {
                count += step;
                if (count >= target) {
                    el.textContent = target;
                    clearInterval(interval);
                } else {
                    el.textContent = count;
                }
            }, 50);
        });
        return;
    }

    // Filter notes based on current view
    if (currentFilter === "archived") {
        notesToRender = notesToRender.filter((note) => note.archived);
    } else {
        notesToRender = notesToRender.filter((note) => !note.archived);
    }

    // Handle empty state
    if (notesToRender.length === 0) {
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.justifyContent = "center";
        container.style.alignItems = "center";

        container.innerHTML = ` 
            <div class="empty-state"> 
                <img class="no-notes-image" src="assets/images/no-item.webp" alt="No Notes" /> 
                <p>${currentFilter === "archived" ?
                "<h1>No archived notes found.</h1><br> Create a new note, or archive some existing notes!" :
                "<h1>No notes found.</h1><br> Create your first note to get started!"
            }</p> 
                <button class="add-note-btn" onclick="openNoteDialog()"> 
                    <i class="ri-add-line"></i> Add Your First Note 
                </button> 
            </div> 
        `;
        return;
    }

    // Sort notes: pinned first, then by creation date (newest first)
    const sortedNotes = [...notesToRender].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Set up grid layout for notes
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(auto-fill, minmax(350px, 1fr))";
    container.style.gap = "1.5rem";
    container.style.alignItems = "start";
    container.style.justifyContent = "center";
    container.style.padding = "1rem";

    // Render note cards
    container.innerHTML = sortedNotes.map((note) => ` 
        <div class="note-card"> 
            <div class="note-body"> 
                <h3 class="note-title"> 
                    <i class="pin-icon ri-${note.pinned ? "pushpin-fill" : "pushpin-line"}" 
                       onclick="togglePin('${note.id}')" 
                       title="${note.pinned ? "Unpin Note" : "Pin Note"}" 
                       style="cursor: pointer; margin-right: 0.5rem; vertical-align: middle;"></i> 
                    ${note.title} 
                </h3> 
                <hr class="note-separator" /> 
                <p class="note-content">${note.content}</p> 
            </div> 
            <div class="note-keywords"> 
                ${note.keywords.map((kw) => `<span class="keyword-tag">${kw}</span>`).join("")} 
            </div> 
            <div class="note-actions"> 
                <button class="edit-btn" onclick="openNoteDialog('${note.id}')" title="Edit Note"> 
                    <i class="ri-pencil-line"></i> 
                </button> 
                <button class="edit-btn" onclick="toggleArchive('${note.id}')" title="${note.archived ? "Unarchive Note" : "Archive Note"}"> 
                    <i class="ri-archive-${note.archived ? "line" : "fill"}"></i> 
                </button> 
                <button class="delete-btn" onclick="deleteNote('${note.id}')" title="Delete Note"> 
                    <i class="ri-delete-bin-6-line"></i> 
                </button> 
            </div> 
        </div> 
    `).join("");
}

/**************************************/
/*    SEARCH AND FILTER FUNCTIONS     */
/**************************************/

/**
 * Filters notes based on search query and current filter
 * Searches through title, content, and keywords
 * @param {string} query - Search query string
 * @returns {Array} Filtered array of notes
 */
function filterNotes(query) {
    const lowerQuery = query.toLowerCase().trim();
    if (currentFilter === "statistics") return notes;

    return notes.filter((note) => {
        // Filter by archive status first
        if (note.archived && currentFilter === "all") return false;
        if (!note.archived && currentFilter === "archived") return false;

        // Then filter by search query
        const searchableString = [note.title, note.content, note.keywords.join(" ")].join(" ").toLowerCase();
        return searchableString.includes(lowerQuery);
    });
}

/**
 * Sets the current filter view and updates UI
 * @param {string} filterType - Filter type: "all", "archived", or "statistics"
 */
function setFilter(filterType) {
    closeExpandedHeader();
    currentFilter = filterType;

    // Update filter button states
    document.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.classList.remove("active");
    });
    document.querySelector(`.filter-btn[onclick="setFilter('${filterType}')"]`).classList.add("active");

    // Clear search and re-render
    document.getElementById("searchInput").value = "";
    renderNotes();
}

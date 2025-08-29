document.addEventListener("DOMContentLoaded", () => {
    // Get URL parameters and handle form mode switching
    const urlParams = new URLSearchParams(window.location.search);
    let action = urlParams.get('action'); // Use 'let' for potential reassignment

    // Get the container element
    const container = document.getElementById("container");

    // Define action-to-class mapping for each page
    const actionClassMap = {
        authenticate: {
            login: "", // Base form
            register: "signin-signup-mode",
        },
        recover: {
            forgot: "", // Base form
            request: "forgot-request-mode",
        },
        secure: {
            verify: "", // Base form
            reset: "verify-reset-mode",
        },
    };

    // Define base action for each page
    const baseActions = {
        authenticate: "login",
        recover: "forgot",
        secure: "verify",
    };

    // Determine current page based on the title or a unique identifier
    const pageKey = document.title.includes("Authenticate")
        ? "authenticate"
        : document.title.includes("Recover")
        ? "recover"
        : document.title.includes("Secure")
        ? "secure"
        : null;

    if (!pageKey) return; // Exit if the page is not recognized

    // Validate the action parameter, default to base form if invalid
    const validActions = Object.keys(actionClassMap[pageKey]);
    if (!validActions.includes(action)) {
        action = baseActions[pageKey]; // Default to base action
        updateUrl(action); // Update the URL with the base action
    }

    // Function to switch forms based on action
    function switchForm(actionType) {
        const className = actionClassMap[pageKey][actionType] || "";
        for (const key in actionClassMap[pageKey]) {
            const classToRemove = actionClassMap[pageKey][key];
            if (classToRemove) {
                container.classList.remove(classToRemove); // Remove non-empty class names
            }
        }
        if (className) {
            container.classList.add(className); // Add the new class name
        }
    }

    // Initialize the form based on URL parameter
    switchForm(action);

    // Get references to the buttons (use dynamic IDs for better flexibility)
    const buttonIds = {
        authenticate: {
            login: "sign-in-btn",
            register: "sign-up-btn",
        },
        recover: {
            forgot: "forgot-btn",
            request: "request-btn",
        },
        secure: {
            verify: "verify-btn",
            reset: "reset-btn",
        },
    };

    const buttons = buttonIds[pageKey];
    if (buttons) {
        for (const actionType in buttons) {
            const button = document.getElementById(buttons[actionType]);
            if (button) {
                button.addEventListener("click", () => {
                    switchForm(actionType); // Switch to the appropriate form
                    updateUrl(actionType);  // Update the URL
                });
            }
        }
    }

    // Function to update the URL without reloading the page
    function updateUrl(actionType) {
        const url = new URL(window.location.href);
        url.searchParams.set('action', actionType);
        window.history.pushState({}, '', url);
    }

    // Handle the gender select element behavior
    const genderSelect = document.getElementById("gender-select");
    if (genderSelect) {
        genderSelect.style.color = "#aaa"; // Set initial color for placeholder

        genderSelect.addEventListener("change", function () {
            if (genderSelect.value !== "") {
                genderSelect.style.color = "#464242"; // Change color to selected option
            } else {
                genderSelect.style.color = "#aaa"; // Revert to placeholder color
            }
        });
    }
});

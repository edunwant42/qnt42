import {
    sanitizeInput,
    checkEmptyField,
    validateEmail,
    sendTemplateEmail,
} from "./utils.js";

/**
 * Initialize contact form with EmailJS
 */
export function initContactForm({
    formId = "contact-form",
    submitBtnId = "submit-btn",
    reloadAfterSend = true,
}) {
    const contactForm = document.getElementById(formId);
    const submitBtn = document.getElementById(submitBtnId);

    if (!contactForm) return;

    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const fromName = sanitizeInput(document.getElementById("from_name").value);
        const fromEmail = sanitizeInput(
            document.getElementById("from_email").value
        );
        const subject = sanitizeInput(document.getElementById("subject").value);
        const message = sanitizeInput(document.getElementById("message").value);

        if (
            !checkEmptyField("Full Name", fromName) ||
            !checkEmptyField("Email Address", fromEmail) ||
            !checkEmptyField("Subject", subject) ||
            !checkEmptyField("Message", message) ||
            !validateEmail(fromEmail)
        )
            return;

        const templateParams = {
            from_name: fromName,
            from_email: fromEmail,
            subject,
            message,
            sent_time: new Date().toLocaleString(),
        };

        const success = await sendTemplateEmail(
            "contact",
            "contact",
            templateParams,
            submitBtn
        );

        if (success) {
            contactForm.reset();
            if (reloadAfterSend) window.location.reload();
        }
    });
}

/**
 * Send account-related emails (welcome, password reset, verification, etc.)
 *
 * @param {string} type - The type of email to send
 * @param {string} userEmail - The recipient's email address
 * @param {string} userName - The recipient's name
 * @param {Object} additionalParams - Additional template parameters
 * @returns {Promise<boolean>} Success status
 */
export async function sendAccountEmail(
    type,
    userEmail,
    userName,
    additionalParams = {}
) {
    const emailConfig = {
        welcome: {
            account: "Updates",
            templateKey: "welcome",
            defaultParams: {
                email: userEmail,
                to_name: userName,
            },
        },
        passwordResetSuccess: {
            account: "Security",
            templateKey: "reset",
            defaultParams: {
                email: userEmail,
                to_name: userName,
            },
        },
        verifyAccount: {
            account: "Security",
            templateKey: "verify",
            defaultParams: {
                email: userEmail,
                to_name: userName,
            },
        },
        forgotPassword: {
            account: "Support",
            templateKey: "forgot",
            defaultParams: {
                email: userEmail,
                to_name: userName,
            },
        },
        recoverOtp: {
            account: "Support",
            templateKey: "recoverOtp",
            defaultParams: {
                email: userEmail,
                to_name: userName,
            },
        },
    };

    const config = emailConfig[type];
    if (!config) {
        console.error(`Unsupported email type: ${type}`);
        return false;
    }

    const templateParams = {
        ...config.defaultParams,
        ...additionalParams,
    };

    return await sendTemplateEmail(
        config.account,
        config.templateKey,
        templateParams,
        null // No submit button for automated emails
    );
}

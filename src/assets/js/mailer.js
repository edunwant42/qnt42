
// Initialize EmailJS
emailjs.init("Qqhic5QGBOAI1R4qv"); // Replace with your public key

import {
  sanitizeInput,
  checkEmptyField,
  validateEmail,
} from "/src/assets/js/utils.js";

document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.getElementById("contact-form");
  const submitBtn = document.getElementById("submit-btn");

  if (contactForm) {
    contactForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      // Collect raw inputs
      let fromName = document.getElementById("from_name").value;
      let fromEmail = document.getElementById("from_email").value;
      let subject = document.getElementById("subject").value;
      let message = document.getElementById("message").value;

      // Sanitize inputs
      fromName = sanitizeInput(fromName);
      fromEmail = sanitizeInput(fromEmail);
      subject = sanitizeInput(subject);
      message = sanitizeInput(message);

      if (
        !checkEmptyField("Full Name", fromName) ||
        !checkEmptyField("Email Address", fromEmail) ||
        !checkEmptyField("Subject", subject) ||
        !checkEmptyField("Message", message) ||
        !validateEmail(fromEmail)
      ) {
        return; // Stop if validation failed
      }

      // Prepare template parameters
      const templateParams = {
        from_name: fromName,
        from_email: fromEmail,
        subject: subject,
        message: message,
        to_name: "QNT42 Contact Team",
        sent_time: new Date().toLocaleString(),
      };

      try {
        // Show loading inside button
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML =
          '<i class="fa-solid fa-spinner fa-spin-pulse"></i> Sending ...';

        await emailjs.send(
          "srvc-v7pfbpe_qnt42",
          "tmpl-2v3fjwo_qnt42",
          templateParams
        );

        sessionStorage.setItem(
          "success",
          "Success: Your message has been sent! We'll get back to you soon."
        );
        contactForm.reset();
      } catch (error) {
        console.error("EmailJS Error:", error);
        sessionStorage.setItem(
          "error",
          "Error: There was an issue sending your message. Please try again later."
        );
      } finally {
        // Restore button
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit";

        window.location.reload(); // To show notification
      }
    });
  }
});

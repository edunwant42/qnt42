// Initialize reset password page
function initResetPasswordPage() {
    const resetForm = document.getElementById("resetPasswordForm");
    
    if (resetForm) {
        const resetButton = resetForm.querySelector('button[type="submit"]');
        
        resetForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            // Store original button content
            const originalText = resetButton.innerHTML;
            const originalDisabled = resetButton.disabled;
            
            // Show loading state
            resetButton.disabled = true;
            resetButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin-pulse"></i> Processing...';
            
            // Simulate processing time
            setTimeout(() => {
                // Show info message
                sessionStorage.setItem(
                    "info",
                    "Info: Password reset feature is currently under development and will be available in a future update."
                );
                
                // Reset button state
                resetButton.disabled = originalDisabled;
                resetButton.innerHTML = originalText;
                
                window.location.reload();
            }, 1500);
        });
    }
}

// Initialize the reset password page when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    initResetPasswordPage();
});

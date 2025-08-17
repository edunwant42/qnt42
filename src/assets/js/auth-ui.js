/**
 * Authentication UI Controller
 * Handles all frontend interactions for login and register forms
 */
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.querySelector('input[type="password"]');
    const toggleButton = document.querySelector('.toggle-password');
    const generatePassword = document.querySelector('.generate-password');

    // Password Security Setup
    if (passwordInput) {
        passwordInput.setAttribute('autocomplete', 'new-password');
        passwordInput.setAttribute('data-lpignore', 'true');
        passwordInput.setAttribute('data-1p-ignore', 'true');
        
        // Clear any autofilled values on focus (login page)
        passwordInput.addEventListener('focus', function() {
            if (this.value) {
                this.value = '';
            }
        });
        
        // Prevent paste for security
        passwordInput.addEventListener('paste', function(e) {
            e.preventDefault();
        });
    }

    // Password Visibility Toggle
    window.isPasswordVisible = false;
    if (toggleButton) {
        toggleButton.addEventListener('click', function() {
            const passwordInput = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');
            
            if (window.isPasswordVisible) {
                passwordInput.type = 'password';
                icon.className = 'fas fa-eye-slash';
                window.isPasswordVisible = false;
            } else {
                passwordInput.type = 'text';
                icon.className = 'fas fa-eye';
                window.isPasswordVisible = true;
            }
        });
    }

    // Password Generator (Register Page Only)
    if (generatePassword) {
        const gearIcon = generatePassword.querySelector('i');
        
        generatePassword.addEventListener('mouseenter', function() {
            gearIcon.className = 'fa-solid fa-gear fa-spin';
        });
        
        generatePassword.addEventListener('mouseleave', function() {
            gearIcon.className = 'fa-solid fa-gear';
        });

        generatePassword.addEventListener('click', function() {
            const generatedPassword = generateSecurePassword();
            passwordInput.value = generatedPassword;
            
            // Force show password when generated
            passwordInput.type = 'text';
            const toggleIcon = toggleButton.querySelector('i');
            toggleIcon.className = 'fas fa-eye';
            window.isPasswordVisible = true;
        });
    }

    // Secure Password Generator Functions
    function generateSecurePassword() {
        const uppercase = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers   = '1234567890';
        const symbols   = '!-._+&^*<=>$';
        
        const allChars = uppercase + lowercase + numbers + symbols;
        
        let password = '';
        password += getRandomChar(uppercase);
        password += getRandomChar(lowercase);
        password += getRandomChar(numbers);
        password += getRandomChar(symbols);

        let usedSymbols = new Set(password.split('').filter(c => symbols.includes(c)));

        while (password.length < 16) {
            let char = getRandomChar(allChars);
            if (symbols.includes(char) && usedSymbols.has(char)) continue;
            password += char;
            if (symbols.includes(char)) usedSymbols.add(char);
        }
        
        return shuffleString(password);
    }
    
    function getRandomChar(str) {
        return str.charAt(Math.floor(Math.random() * str.length));
    }
    
    function shuffleString(str) {
        const arr = str.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join('');
    }
});

/**
 * Connexion Logic - FINEE 2026
 * Offline Mode: Using localStorage for authentication
 */

function togglePass(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.innerText = 'visibility_off';
    } else {
        input.type = 'password';
        icon.innerText = 'visibility';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('loginError');
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            if (!email || !password) {
                if (errorDiv) {
                    errorDiv.textContent = "Veuillez remplir tous les champs.";
                    errorDiv.classList.remove('hidden');
                    setTimeout(() => errorDiv.classList.add('hidden'), 3000);
                }
                return;
            }

            // --- MOCK LOGIN LOGIC (LOCALSTORAGE) ---
            
            // Get users from localStorage
            const users = JSON.parse(localStorage.getItem('finee_users')) || [];
            
            // Find user
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                submitBtn.innerHTML = `
                    <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion...
                `;
                submitBtn.disabled = true;

                setTimeout(() => {
                    localStorage.setItem('finee_session', JSON.stringify(user));
                    window.location.href = 'index.html';
                }, 800);
            } else {
                if (errorDiv) {
                    errorDiv.textContent = "Identifiants incorrects ou compte inexistant.";
                    errorDiv.classList.remove('hidden');
                    setTimeout(() => errorDiv.classList.add('hidden'), 3000);
                } else {
                    alert("Identifiants incorrects.");
                }
            }
        });
    }

    window.togglePass = togglePass;
});

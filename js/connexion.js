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

    // --- RECOVERY MODAL LOGIC ---
    const recoveryModal = document.getElementById('recoveryModal');
    const recoveryStep1 = document.getElementById('recoveryStep1');
    const recoveryStep2 = document.getElementById('recoveryStep2');
    const recoveryError = document.getElementById('recoveryError');
    let targetUserEmail = "";

    window.openRecoveryModal = () => {
        if (!recoveryModal) return;
        recoveryModal.classList.remove('hidden');
        recoveryModal.classList.add('flex');
        recoveryStep1.classList.remove('hidden');
        recoveryStep2.classList.add('hidden');
        recoveryError.classList.add('hidden');
    };

    window.closeRecoveryModal = () => {
        if (!recoveryModal) return;
        recoveryModal.classList.add('hidden');
        recoveryModal.classList.remove('flex');
    };

    window.handleRecoveryVerify = () => {
        const email = document.getElementById('recoveryEmail').value.trim();
        if (!email) {
            recoveryError.textContent = "Veuillez entrer votre email";
            recoveryError.classList.remove('hidden');
            return;
        }

        const users = JSON.parse(localStorage.getItem('finee_users')) || [];
        const user = users.find(u => u.email === email);

        if (user) {
            targetUserEmail = email;
            recoveryStep1.classList.add('hidden');
            recoveryStep2.classList.remove('hidden');
            recoveryError.classList.add('hidden');
        } else {
            recoveryError.textContent = "Email non trouvé dans notre base";
            recoveryError.classList.remove('hidden');
        }
    };

    window.handleRecoveryReset = () => {
        const newPass = document.getElementById('newPassword').value;
        const confirmPass = document.getElementById('confirmNewPassword').value;

        if (!newPass || newPass.length < 4) {
            recoveryError.textContent = "Le mot de passe est trop court";
            recoveryError.classList.remove('hidden');
            return;
        }

        if (newPass !== confirmPass) {
            recoveryError.textContent = "Les mots de passe ne correspondent pas";
            recoveryError.classList.remove('hidden');
            return;
        }

        let users = JSON.parse(localStorage.getItem('finee_users')) || [];
        const userIndex = users.findIndex(u => u.email === targetUserEmail);

        if (userIndex !== -1) {
            users[userIndex].password = newPass;
            localStorage.setItem('finee_users', JSON.stringify(users));
            
            // Success animation or alert
            alert("Succès ! Votre mot de passe a été mis à jour.");
            closeRecoveryModal();
        }
    };
});

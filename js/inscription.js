/**
 * Inscription Logic - FINEE 2026
 * Offline Mode: Using localStorage for persistent storage
 */

document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationForm');
    const successModal = document.getElementById('successModal');
    const facultySelect = document.getElementById('faculte');

    if (facultySelect) {
        facultySelect.addEventListener('change', filterDepartments);
    }

    if (registrationForm) {
        registrationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const firstName = document.getElementById('prenom').value.trim();
            const lastName = document.getElementById('nom').value.trim();
            const email = document.getElementById('email').value.trim();
            const sexe = document.getElementById('sexe').value;
            const faculty = document.getElementById('faculte').value;
            const department = document.getElementById('departement').value;
            const level = document.getElementById('niveau').value;
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (!firstName || !lastName || !email || !sexe || !faculty || !department || !level || !password) {
                alert("Veuillez remplir tous les champs obligatoires.");
                return;
            }

            if (password !== confirmPassword) {
                alert("Les mots de passe ne correspondent pas !");
                return;
            }

            // --- MOCK DATABASE LOGIC (LOCALSTORAGE) ---
            
            // Get existing users
            let users = JSON.parse(localStorage.getItem('finee_users')) || [];
            
            // Check if email already exists
            if (users.find(u => u.email === email)) {
                alert("Cette adresse email est déjà enregistrée.");
                return;
            }

            submitBtn.innerHTML = `
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Création en cours...
            `;
            submitBtn.disabled = true;

            // Simulate server delay
            setTimeout(() => {
                const newUser = {
                    id: Date.now(), // Unique ID
                    firstname: firstName,
                    lastname: lastName,
                    email: email,
                    sexe: sexe,
                    faculty: faculty,
                    department: department,
                    level: level,
                    password: password,
                    created_at: new Date().toISOString()
                };

                users.push(newUser);
                localStorage.setItem('finee_users', JSON.stringify(users));
                
                // Automatically log in the user
                localStorage.setItem('finee_session', JSON.stringify(newUser));

                if (successModal) {
                    successModal.classList.remove('hidden');
                    successModal.classList.add('flex');
                }
            }, 800);
        });
    }
});

function filterDepartments() {
    const facultySelect = document.getElementById('faculte');
    const deptSelect = document.getElementById('departement');
    if (!facultySelect || !deptSelect) return;

    const selectedFaculty = facultySelect.value;
    const options = deptSelect.querySelectorAll('option.dept-option');
    
    deptSelect.value = "";
    options.forEach(opt => {
        if (opt.getAttribute('data-faculty') === selectedFaculty) {
            opt.style.display = 'block';
        } else {
            opt.style.display = 'none';
        }
    });
    
    if (selectedFaculty === "") {
        deptSelect.options[0].text = "Choisir une faculté d'abord !";
    } else {
        deptSelect.options[0].text = "Sélectionner un département";
    }
}

function togglePass(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = 'visibility_off';
    } else {
        input.type = 'password';
        icon.textContent = 'visibility';
    }
}

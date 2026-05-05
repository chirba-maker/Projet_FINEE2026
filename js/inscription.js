document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationForm');
    const successModal = document.getElementById('successModal');
    const facultySelect = document.getElementById('faculte');
    const roleSelect = document.getElementById('role');
    const studentFields = document.getElementById('studentFields');
    const adminFields = document.getElementById('adminFields');
    const formTitle = document.getElementById('formTitle');

    // --- ROLE SWITCHING LOGIC ---
    if (roleSelect) {
        roleSelect.addEventListener('change', (e) => {
            const role = e.target.value;
            if (role === 'admin') {
                studentFields.classList.add('hidden');
                adminFields.classList.remove('hidden');
                formTitle.innerHTML = `Inscription Administrateur <a href="../index.html" class="flex items-center justify-center w-10 h-10 bg-slate-100 text-slate-400 hover:text-primary hover:bg-slate-200 rounded-xl transition-all" title="Retour à l'accueil"><span class="material-symbols-outlined text-[20px]">home</span></a>`;
                
                // Clear required attributes for student fields
                document.getElementById('niveau').required = false;
                document.getElementById('faculte').required = false;
                document.getElementById('departement').required = false;
                
                // Set required for admin fields
                document.getElementById('birthYear').required = true;
                document.getElementById('phone').required = true;
            } else {
                studentFields.classList.remove('hidden');
                adminFields.classList.add('hidden');
                formTitle.innerHTML = `Inscription Premium <a href="../index.html" class="flex items-center justify-center w-10 h-10 bg-slate-100 text-slate-400 hover:text-primary hover:bg-slate-200 rounded-xl transition-all" title="Retour à l'accueil"><span class="material-symbols-outlined text-[20px]">home</span></a>`;
                
                // Set required for student fields
                document.getElementById('niveau').required = true;
                document.getElementById('faculte').required = true;
                document.getElementById('departement').required = true;
                
                // Clear required for admin fields
                document.getElementById('birthYear').required = false;
                document.getElementById('phone').required = false;
            }
        });
    }

    if (facultySelect) {
        facultySelect.addEventListener('change', filterDepartments);
    }

    if (registrationForm) {
        registrationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const role = roleSelect.value;
            const firstName = document.getElementById('prenom').value.trim();
            const lastName = document.getElementById('nom').value.trim();
            const email = document.getElementById('email').value.trim();
            const sexe = document.getElementById('sexe').value;
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (password !== confirmPassword) {
                alert("Les mots de passe ne correspondent pas !");
                return;
            }

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

            setTimeout(() => {
                const newUser = {
                    id: Date.now(),
                    firstname: firstName,
                    lastname: lastName,
                    email: email,
                    sexe: sexe,
                    role: role,
                    password: password,
                    created_at: new Date().toISOString()
                };

                // Add specific fields
                if (role === 'admin') {
                    newUser.birthYear = document.getElementById('birthYear').value;
                    newUser.phone = document.getElementById('phone').value;
                } else {
                    newUser.faculty = document.getElementById('faculte').value;
                    newUser.department = document.getElementById('departement').value;
                    newUser.level = document.getElementById('niveau').value;
                }

                users.push(newUser);
                localStorage.setItem('finee_users', JSON.stringify(users));
                
                localStorage.setItem('finee_session', JSON.stringify(newUser));
                localStorage.setItem('finee_welcome_toast', 'true');

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

/**
 * Dashboard Logic - FINEE 2026
 * Multi-Role Support: Student & Admin
 */

document.addEventListener('DOMContentLoaded', () => {
    const session = JSON.parse(localStorage.getItem('finee_session'));
    if (!session || !session.email) {
        window.location.href = 'connexion.html';
        return;
    }

    // --- SEED INITIAL DATA (IF EMPTY) ---
    seedMockData();

    let currentProjectId = null;

    // --- UI ELEMENTS ---
    const userNameSidebar = document.getElementById('userNameSidebar');
    const userFacultySidebar = document.getElementById('userFacultySidebar');
    const userInitialsSidebar = document.getElementById('userInitialsSidebar');
    const logoutBtn = document.getElementById('logoutBtn');
    const navLinks = document.querySelectorAll('.nav-link, .nav-link-mobile');
    const sectionTitle = document.getElementById('sectionTitle');
    const toggleSidebar = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    const welcomeName = document.getElementById('welcomeName');
    const userHeaderInitials = document.getElementById('userHeaderInitials');
    const userHeaderName = document.getElementById('userHeaderName');

    // --- INITIALIZATION ---
    function updateUIWithSession() {
        const currentSession = JSON.parse(localStorage.getItem('finee_session'));
        const role = currentSession.role || 'user';

        // Update Role-based Sidebar visibility
        const adminLinks = document.getElementById('adminLinks');
        const studentLinks = document.getElementById('studentLinks');
        
        if (role === 'admin') {
            if (adminLinks) adminLinks.classList.remove('hidden');
            if (studentLinks) studentLinks.classList.add('hidden');
        } else {
            if (adminLinks) adminLinks.classList.add('hidden');
            if (studentLinks) studentLinks.classList.remove('hidden');
        }

        if (userNameSidebar) userNameSidebar.textContent = `${currentSession.firstname} ${currentSession.lastname}`;
        if (userFacultySidebar) userFacultySidebar.textContent = currentSession.faculty || (role === 'admin' ? "Administrateur" : "Étudiant");
        
        const profileImg = currentSession.profile_image;
        const initials = `${currentSession.firstname[0]}${currentSession.lastname[0]}`;

        [userInitialsSidebar, userHeaderInitials, document.getElementById('badgeInitials'), document.getElementById('profilePreview')].forEach(el => {
            if (el) {
                if (profileImg) {
                    el.innerHTML = `<img src="${profileImg}" class="w-full h-full object-cover rounded-xl shadow-lg border border-white/20">`;
                    el.classList.remove('bg-primary', 'text-white');
                } else {
                    el.textContent = initials;
                    el.classList.add('bg-primary', 'text-white');
                    el.innerHTML = initials;
                }
            }
        });
        
        if (welcomeName) welcomeName.textContent = currentSession.firstname;
        if (userHeaderName) userHeaderName.textContent = `${currentSession.firstname} ${currentSession.lastname}`;

        // Update banner profile image
        const welcomeUserImg = document.getElementById('welcomeUserImg');
        if (welcomeUserImg && profileImg) {
            welcomeUserImg.src = profileImg;
            welcomeUserImg.classList.replace('opacity-0', 'opacity-100');
        }
    }

    updateUIWithSession();

    // --- SIDEBAR TOGGLE (MOBILE) ---
    if (toggleSidebar && sidebar) {
        toggleSidebar.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });

        document.addEventListener('click', (e) => {
            if (window.innerWidth < 768 && !sidebar.contains(e.target) && !toggleSidebar.contains(e.target)) {
                sidebar.classList.add('-translate-x-full');
            }
        });
    }

    // --- NAVIGATION ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            switchSection(section);
        });
    });

    window.switchSection = function(sectionId) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (sidebar && window.innerWidth < 768) sidebar.classList.add('-translate-x-full');

        navLinks.forEach(l => {
            l.classList.remove('active', 'text-primary', 'bg-white', 'shadow-sm');
            l.classList.add('text-slate-400');
        });
        document.querySelectorAll(`[data-section="${sectionId}"]`).forEach(l => {
            l.classList.add('active', 'text-primary', 'bg-white', 'shadow-sm');
            l.classList.remove('text-slate-400');
        });

        document.querySelectorAll('.dashboard-section').forEach(s => s.classList.add('hidden'));
        
        const target = document.getElementById(`section-${sectionId}`);
        if (target) {
            target.classList.remove('hidden');
            const titles = {
                'overview': 'Tableau de Bord',
                'projects': 'Mes Projets',
                'tracker': 'Suivi d\'Avancement',
                'voting': 'Vote & Classement',
                'badge': 'Mon Badge',
                'settings': 'Paramètres',
                'admin-overview': 'Dashboard Administrateur',
                'admin-validation': 'Validation Projets',
                'admin-users': 'Gestion Utilisateurs'
            };
            if (sectionTitle) sectionTitle.textContent = titles[sectionId];
        }

        // Section Loaders
        if (sectionId === 'overview' || sectionId === 'projects') loadUserProjects();
        if (sectionId === 'voting') loadAllProjectsForVoting();
        if (sectionId === 'participants') loadParticipants();
        if (sectionId === 'tracker') loadTracker();
        if (sectionId === 'badge') initBadge();
        if (sectionId === 'settings') initSettings();
        
        // Admin Specific Loaders
        if (sectionId === 'admin-overview') loadAdminDashboard();
        if (sectionId === 'admin-validation') loadAdminValidation();
        if (sectionId === 'admin-users') loadAdminUsers();
    };

    // --- ADMIN LOGIC ---
    function loadAdminDashboard() {
        const projects = JSON.parse(localStorage.getItem('finee_projects')) || [];
        const users = JSON.parse(localStorage.getItem('finee_users')) || [];
        
        const totalVotes = projects.reduce((acc, p) => acc + (p.votes || 0), 0);
        const pending = projects.filter(p => p.statut === 'En attente').length;

        document.getElementById('adminTotalProjects').textContent = projects.length;
        document.getElementById('adminPendingProjects').textContent = pending;
        document.getElementById('adminTotalUsers').textContent = users.length;
        document.getElementById('adminTotalVotes').textContent = totalVotes;

        initAdminGlobalChart();
    }

    function loadAdminValidation() {
        const projects = JSON.parse(localStorage.getItem('finee_projects')) || [];
        const table = document.getElementById('adminValidationTable');
        if (!table) return;

        table.innerHTML = projects.map(p => `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-8 py-5">
                    <p class="text-sm font-black text-primary">${p.titre}</p>
                    <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">${p.categorie}</p>
                </td>
                <td class="px-8 py-5 text-sm font-bold text-slate-600">${p.prenom} ${p.nom}</td>
                <td class="px-8 py-5 text-xs text-slate-400">${new Date(p.created_at || Date.now()).toLocaleDateString()}</td>
                <td class="px-8 py-5">
                    <span class="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${p.statut === 'Validé' ? 'bg-green-100 text-green-600' : (p.statut === 'Rejeté' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600')}">
                        ${p.statut}
                    </span>
                </td>
                <td class="px-8 py-5">
                    <div class="flex gap-2">
                        <button onclick="updateProjectStatus(${p.id}, 'Validé')" class="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-500 hover:text-white transition-all">
                            <span class="material-symbols-outlined text-sm">check</span>
                        </button>
                        <button onclick="updateProjectStatus(${p.id}, 'Rejeté')" class="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                            <span class="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    window.updateProjectStatus = function(id, status) {
        let projects = JSON.parse(localStorage.getItem('finee_projects')) || [];
        const index = projects.findIndex(p => p.id == id);
        if (index !== -1) {
            projects[index].statut = status;
            localStorage.setItem('finee_projects', JSON.stringify(projects));
            loadAdminValidation();
            alert(`Projet mis à jour: ${status}`);
        }
    };

    function loadAdminUsers() {
        const users = JSON.parse(localStorage.getItem('finee_users')) || [];
        const table = document.getElementById('adminUsersTable');
        if (!table) return;

        table.innerHTML = users.map(u => `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-8 py-5">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-bold text-xs">
                            ${u.profile_image ? `<img src="${u.profile_image}" class="w-full h-full object-cover rounded-xl">` : `${u.firstname[0]}${u.lastname[0]}`}
                        </div>
                        <div>
                            <p class="text-sm font-black text-primary">${u.firstname} ${u.lastname}</p>
                            <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">${u.faculty || 'FINEE'}</p>
                        </div>
                    </div>
                </td>
                <td class="px-8 py-5 text-sm font-bold text-slate-600">${u.email}</td>
                <td class="px-8 py-5">
                    <span class="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black uppercase tracking-widest text-primary">
                        ${u.role || 'Étudiant'}
                    </span>
                </td>
                <td class="px-8 py-5">
                    <button onclick="deleteUser(${u.id})" class="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                        <span class="material-symbols-outlined text-sm">delete</span>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    window.deleteUser = function(id) {
        if (!confirm("Supprimer cet utilisateur ?")) return;
        let users = JSON.parse(localStorage.getItem('finee_users')) || [];
        users = users.filter(u => u.id != id);
        localStorage.setItem('finee_users', JSON.stringify(users));
        loadAdminUsers();
    };

    // --- STUDENT LOGIC ---
    function loadUserProjects() {
        const session = JSON.parse(localStorage.getItem('finee_session'));
        const projects = JSON.parse(localStorage.getItem('finee_projects')) || [];
        const userProjects = projects.filter(p => p.user_id === session.id);
        
        renderProjects(userProjects);
        
        if (document.getElementById('activeProjectsCount')) document.getElementById('activeProjectsCount').textContent = userProjects.length;
        const totalVotes = userProjects.reduce((acc, p) => acc + (p.votes || 0), 0);
        if (document.getElementById('totalVotesCount')) document.getElementById('totalVotesCount').textContent = totalVotes;
    }

    function renderProjects(projets) {
        const grid = document.getElementById('projectsGrid');
        const overviewList = document.getElementById('projectListOverview');
        if (!grid) return;

        if (projets.length === 0) {
            grid.innerHTML = '<p class="col-span-full text-center py-20 text-slate-300 font-bold uppercase tracking-widest">Aucun projet soumis.</p>';
        } else {
            grid.innerHTML = projets.map((p, i) => `
                <div class="premium-card p-8 group animate-fade-in relative overflow-hidden cursor-pointer" style="animation-delay: ${i * 0.1}s" onclick="openProjectDetails(${p.id})">
                    <div class="flex justify-between items-start mb-6">
                        <span class="px-4 py-1.5 bg-primary/5 text-primary rounded-xl text-[9px] font-black uppercase tracking-widest">${p.categorie}</span>
                        <span class="text-[9px] font-black uppercase tracking-widest ${p.statut === 'Validé' ? 'text-green-500' : 'text-orange-400'}">${p.statut}</span>
                    </div>
                    <h4 class="text-xl font-black text-primary mb-3 leading-tight group-hover:text-secondary transition-colors">${p.titre}</h4>
                    <p class="text-sm text-slate-400 font-medium mb-8 line-clamp-2">${p.description_courte || 'Pas de description.'}</p>
                    <div class="flex items-center justify-between pt-6 border-t border-slate-100">
                        <span class="text-xs font-black text-primary">${p.votes || 0} votes</span>
                        <span class="material-symbols-outlined text-secondary text-sm">arrow_forward</span>
                    </div>
                </div>
            `).join('');
        }

        if (overviewList) {
            overviewList.innerHTML = projets.slice(0, 3).map(p => `
                <div class="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer" onclick="openProjectDetails(${p.id})">
                    <div class="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center text-xs font-black shadow-lg shadow-primary/10">${p.titre[0]}</div>
                    <div class="flex-grow">
                        <h5 class="text-xs font-black text-primary">${p.titre}</h5>
                        <p class="text-[9px] text-slate-400 font-bold uppercase">${p.statut}</p>
                    </div>
                </div>
            `).join('');
        }
    }

    function loadAllProjectsForVoting() {
        const projects = JSON.parse(localStorage.getItem('finee_projects')) || [];
        renderLeaderboard(projects.sort((a, b) => (b.votes || 0) - (a.votes || 0)));
    }

    function renderLeaderboard(projets) {
        const list = document.getElementById('leaderboardList');
        if (!list) return;

        list.innerHTML = projets.map((p, index) => `
            <div class="flex items-center gap-6 p-6 bg-white rounded-[32px] border border-slate-50 shadow-sm hover:shadow-xl transition-all group animate-fade-in" style="animation-delay: ${index * 0.1}s">
                <div class="text-2xl font-black ${index < 3 ? 'text-secondary' : 'text-slate-200'}">${index + 1}</div>
                <div class="flex-grow">
                    <h4 class="font-black text-primary text-lg group-hover:text-secondary transition-colors">${p.titre}</h4>
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">${p.prenom} ${p.nom}</p>
                </div>
                <div class="text-right flex items-center gap-4">
                    <div>
                        <p class="text-xl font-black text-primary">${p.votes || 0}</p>
                        <p class="text-[8px] font-black text-slate-400 uppercase">Votes</p>
                    </div>
                    <button onclick="voteForProject(${p.id})" class="w-12 h-12 rounded-xl bg-slate-50 text-slate-300 hover:bg-orange-50 hover:text-orange-500 transition-all flex items-center justify-center">
                        <span class="material-symbols-outlined">favorite</span>
                    </button>
                </div>
            </div>
        `).join('');
    }

    window.voteForProject = function(projetId) {
        let projects = JSON.parse(localStorage.getItem('finee_projects')) || [];
        const index = projects.findIndex(p => p.id === projetId);
        if (index !== -1) {
            projects[index].votes = (projects[index].votes || 0) + 1;
            localStorage.setItem('finee_projects', JSON.stringify(projects));
            loadAllProjectsForVoting();
            alert("Vote enregistré !");
        }
    };

    function loadTracker() {
        const container = document.getElementById('trackerProjectList');
        if (!container) return;
        const projects = JSON.parse(localStorage.getItem('finee_projects')) || [];
        const userProjects = projects.filter(p => p.user_id === session.id);

        container.innerHTML = userProjects.length ? userProjects.map(p => `
            <div class="space-y-6 p-8 bg-slate-50 rounded-3xl border border-slate-100">
                <div class="flex justify-between items-center">
                    <h4 class="text-xl font-black text-primary">${p.titre}</h4>
                    <span class="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-white border border-slate-200 text-primary">${p.statut}</span>
                </div>
                <div class="flex justify-between items-center px-4">
                    <div class="flex flex-col items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center"><span class="material-symbols-outlined text-sm">check</span></div>
                        <span class="text-[8px] font-black uppercase">Soumis</span>
                    </div>
                    <div class="h-0.5 flex-grow bg-slate-200 mx-4"></div>
                    <div class="flex flex-col items-center gap-2">
                        <div class="w-8 h-8 rounded-full ${p.statut === 'Validé' ? 'bg-green-500 text-white' : 'bg-white border border-slate-200 text-slate-300'} flex items-center justify-center">
                            <span class="material-symbols-outlined text-sm">${p.statut === 'Validé' ? 'check' : 'hourglass_empty'}</span>
                        </div>
                        <span class="text-[8px] font-black uppercase">Validé</span>
                    </div>
                </div>
            </div>
        `).join('') : '<div class="text-center py-20 text-slate-300">Aucun projet à suivre.</div>';
    }

    // --- SHARED LOGIC ---
    function initSettings() {
        const form = document.getElementById('settingsForm');
        if (!form) return;

        ['editFirstName', 'editLastName', 'editEmail', 'editFaculty', 'editDepartment', 'editSexe', 'editNiveau'].forEach(id => {
            const field = document.getElementById(id);
            const key = id.replace('edit', '').toLowerCase();
            if (field) field.value = session[key] || '';
        });

        form.onsubmit = function(e) {
            e.preventDefault();
            const updatedUser = { ...session };
            ['FirstName', 'LastName', 'Email', 'Faculty', 'Department', 'Sexe', 'Niveau'].forEach(suffix => {
                updatedUser[suffix.toLowerCase()] = document.getElementById('edit' + suffix).value;
            });
            
            const newPass = document.getElementById('editPassword').value;
            if (newPass) updatedUser.password = newPass;

            localStorage.setItem('finee_session', JSON.stringify(updatedUser));
            
            const users = JSON.parse(localStorage.getItem('finee_users')) || [];
            const idx = users.findIndex(u => u.id === updatedUser.id);
            if (idx !== -1) {
                users[idx] = updatedUser;
                localStorage.setItem('finee_users', JSON.stringify(users));
            }

            updateUIWithSession();
            alert("Profil mis à jour !");
        };
    }

    function initBadge() {
        document.getElementById('badgeFullName').textContent = `${session.firstname} ${session.lastname}`;
        document.getElementById('badgeFaculty').textContent = session.faculty || (session.role === 'admin' ? "Administrateur" : "Étudiant");
        document.getElementById('badgeId').textContent = `#F26-${session.id.toString().slice(-4)}`;
        
        const qrImg = document.getElementById('badgeQRCode');
        if (qrImg) qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=FINEE-2026-VERIFY-${session.id}`;
    }

    function initStatsChart() {
        const ctx = document.getElementById('statsChart');
        if (!ctx) return;
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                datasets: [{
                    label: 'Vues',
                    data: [5, 12, 8, 15, 20, 18, 25],
                    borderColor: '#00677c',
                    backgroundColor: 'rgba(0, 103, 124, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
        });
    }

    function initAdminGlobalChart() {
        const ctx = document.getElementById('adminGlobalChart');
        if (!ctx) return;
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['FST', 'FLSH', 'FSAG', 'MIAGE'],
                datasets: [{
                    label: 'Projets par Faculté',
                    data: [12, 8, 5, 15],
                    backgroundColor: ['#002045', '#00677c', '#e88532', '#4fd9fd']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    function seedMockData() {
        if (!localStorage.getItem('finee_users')) {
            localStorage.setItem('finee_users', JSON.stringify([
                { id: 1, firstname: "Admin", lastname: "FINEE", email: "admin@finee.gn", password: "admin", role: "admin" },
                { id: 2, firstname: "Mamadou", lastname: "Diallo", email: "user@finee.gn", password: "123", role: "user", faculty: "FST", department: "MIAGE" }
            ]));
        }
        if (!localStorage.getItem('finee_projects')) {
            localStorage.setItem('finee_projects', JSON.stringify([
                { id: 101, titre: "Solar Labé", user_id: 2, prenom: "Mamadou", nom: "Diallo", faculte: "FST", votes: 45, categorie: "Énergie", statut: "Validé", created_at: new Date().toISOString() }
            ]));
        }
    }

    if (logoutBtn) logoutBtn.onclick = () => { localStorage.removeItem('finee_session'); window.location.href = 'connexion.html'; };

    // Initial Section
    const initialSection = session.role === 'admin' ? 'admin-overview' : 'overview';
    switchSection(initialSection);
    initStatsChart();

    // Modal Generic handlers
    window.openProjectDetails = (id) => {
        const p = (JSON.parse(localStorage.getItem('finee_projects')) || []).find(x => x.id == id);
        if (!p) return;
        document.getElementById('modalProjectTitle').textContent = p.titre;
        document.getElementById('modalProjectDesc').textContent = p.description_courte;
        document.getElementById('projectModal').classList.replace('hidden', 'flex');
    };
    window.closeProjectModal = () => document.getElementById('projectModal').classList.replace('flex', 'hidden');
});


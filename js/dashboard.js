/**
 * Dashboard Logic - FINEE 2026
 * Offline Mode: Using localStorage for all operations
 */

document.addEventListener('DOMContentLoaded', () => {
    const session = JSON.parse(localStorage.getItem('finee_session'));
    if (!session) {
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
    // --- INITIALIZATION ---
    function updateUIWithSession() {
        const currentSession = JSON.parse(localStorage.getItem('finee_session'));
        if (userNameSidebar) userNameSidebar.textContent = `${currentSession.firstname} ${currentSession.lastname}`;
        if (userFacultySidebar) userFacultySidebar.textContent = currentSession.faculty || "Étudiant";
        
        const profileImg = currentSession.profile_image;
        const initials = `${currentSession.firstname[0]}${currentSession.lastname[0]}`;

        if (userInitialsSidebar) {
            if (profileImg) {
                userInitialsSidebar.innerHTML = `<img src="${profileImg}" class="w-full h-full object-cover rounded-2xl">`;
                userInitialsSidebar.classList.remove('bg-primary', 'text-white');
            } else {
                userInitialsSidebar.textContent = initials;
                userInitialsSidebar.classList.add('bg-primary', 'text-white');
                userInitialsSidebar.innerHTML = initials;
            }
        }
        
        if (welcomeName) welcomeName.textContent = currentSession.firstname;

        if (userHeaderInitials) {
            if (profileImg) {
                userHeaderInitials.innerHTML = `<img src="${profileImg}" class="w-full h-full object-cover rounded-full">`;
                userHeaderInitials.classList.remove('bg-primary', 'text-white');
            } else {
                userHeaderInitials.textContent = initials;
                userHeaderInitials.classList.add('bg-primary', 'text-white');
                userHeaderInitials.innerHTML = initials;
            }
        }
        if (userHeaderName) userHeaderName.textContent = `${currentSession.firstname} ${currentSession.lastname}`;
        
        // Update badge too
        const badgeInitials = document.getElementById('badgeInitials');
        if (badgeInitials) {
            if (profileImg) {
                badgeInitials.innerHTML = `<img src="${profileImg}" class="w-full h-full object-cover rounded-[40px]">`;
            } else {
                badgeInitials.textContent = initials;
                badgeInitials.innerHTML = initials;
            }
        }

        // Update banner profile image (Circular)
        const welcomeUserImg = document.getElementById('welcomeUserImg');
        if (welcomeUserImg && profileImg) {
            welcomeUserImg.src = profileImg;
            welcomeUserImg.classList.remove('opacity-0');
            welcomeUserImg.classList.add('opacity-100');
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
        // Scroll to top to simulate page transition
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Close sidebar on mobile
        if (sidebar && window.innerWidth < 768) {
            sidebar.classList.add('-translate-x-full');
        }

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
                'participants': 'Participants',
                'badge': 'Mon Badge',
                'settings': 'Paramètres du Profil'
            };
            if (sectionTitle) sectionTitle.textContent = titles[sectionId];
        }

        if (sectionId === 'overview' || sectionId === 'projects') loadUserProjects();
        if (sectionId === 'voting') loadAllProjectsForVoting();
        if (sectionId === 'participants') loadParticipants();
        if (sectionId === 'tracker') loadTracker();
        if (sectionId === 'settings') initSettings();
        if (sectionId === 'badge') initBadge();
    };

    // --- DATA HANDLING (LOCAL STORAGE) ---

    function loadUserProjects() {
        const currentSession = JSON.parse(localStorage.getItem('finee_session'));
        const projects = JSON.parse(localStorage.getItem('finee_projects')) || [];
        const userProjects = projects.filter(p => p.user_id === currentSession.id);
        
        renderProjects(userProjects);
        
        if (document.getElementById('activeProjectsCount')) {
            document.getElementById('activeProjectsCount').textContent = userProjects.length;
        }
        
        let totalVotes = 0;
        userProjects.forEach(p => totalVotes += parseInt(p.votes || 0));
        if (document.getElementById('totalVotesCount')) {
            document.getElementById('totalVotesCount').textContent = totalVotes;
        }
    }

    function renderProjects(projets) {
        const grid = document.getElementById('projectsGrid');
        const overviewList = document.getElementById('projectListOverview');
        if (!grid) return;

        if (projets.length === 0) {
            grid.innerHTML = '<p class="col-span-full text-center py-20 text-slate-400 font-bold uppercase tracking-widest">Aucun projet soumis pour le moment.</p>';
        } else {
            grid.innerHTML = '';
            projets.forEach((p, index) => {
                const progress = Math.floor(Math.random() * 40) + 60; 
                grid.innerHTML += `
                    <div class="premium-card p-8 group animate-fade-in relative overflow-hidden cursor-pointer" 
                         style="animation-delay: ${index * 0.1}s" 
                         onclick="openProjectDetails(${p.id})">
                        <div class="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors"></div>
                        <div class="flex justify-between items-start mb-6">
                            <span class="px-4 py-1.5 bg-primary/5 text-primary rounded-xl text-[9px] font-black uppercase tracking-widest border border-primary/5">${p.categorie}</span>
                            <div class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full ${p.statut === 'Validé' ? 'bg-green-500' : 'bg-orange-400'}"></span>
                                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">${p.statut}</span>
                            </div>
                        </div>
                        <h4 class="text-xl font-black text-primary mb-3 leading-tight group-hover:text-secondary transition-colors">${p.titre}</h4>
                        <p class="text-sm text-slate-400 font-medium mb-8 line-clamp-2 leading-relaxed">${p.description_courte || 'Pas de description.'}</p>
                        <div class="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                            <div class="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                <span>Progression</span>
                                <span class="text-primary">${progress}%</span>
                            </div>
                            <div class="progress-container !h-2">
                                <div class="progress-bar" style="width: ${progress}%"></div>
                            </div>
                        </div>
                        <div class="flex items-center justify-between pt-6 border-t border-slate-100">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                                    <span class="material-symbols-outlined text-sm font-bold">favorite</span>
                                </div>
                                <span class="text-xs font-black text-primary">${p.votes || 0} <span class="text-slate-400 font-bold">votes</span></span>
                            </div>
                            <button class="flex items-center gap-2 text-[10px] font-black text-secondary uppercase tracking-widest hover:gap-3 transition-all">
                                Gérer <span class="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        if (overviewList) {
            overviewList.innerHTML = projets.slice(0, 3).map(p => {
                const progress = Math.floor(Math.random() * 30) + 70;
                return `
                <div class="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all group cursor-pointer" onclick="openProjectDetails(${p.id})">
                    <div class="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center text-lg font-black shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                        ${p.titre[0]}
                    </div>
                    <div class="flex-grow">
                        <div class="flex justify-between items-center mb-1">
                            <h5 class="text-sm font-black text-primary">${p.titre}</h5>
                            <span class="text-[9px] font-black px-2 py-0.5 bg-slate-100 rounded-full text-slate-400 uppercase tracking-widest">${p.categorie}</span>
                        </div>
                        <div class="progress-container !h-1.5">
                            <div class="progress-bar" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    <div class="text-right ml-4">
                        <p class="text-xs font-black text-primary">${progress}%</p>
                    </div>
                </div>
                `;
            }).join('');
        }
    }

    function loadAllProjectsForVoting() {
        const projects = JSON.parse(localStorage.getItem('finee_projects')) || [];
        renderLeaderboard(projects.sort((a, b) => b.votes - a.votes));
    }

    function renderLeaderboard(projets) {
        const list = document.getElementById('leaderboardList');
        if (!list) return;

        list.innerHTML = projets.map((p, index) => `
            <div class="flex items-center gap-6 p-6 bg-white rounded-[32px] border border-slate-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group animate-fade-in" style="animation-delay: ${index * 0.1}s">
                <div class="relative w-12 h-12 flex items-center justify-center shrink-0">
                    <div class="absolute inset-0 bg-primary/5 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform"></div>
                    <div class="relative text-2xl font-black ${index < 3 ? 'text-secondary' : 'text-slate-300'}">
                        ${index + 1}
                    </div>
                </div>
                <div class="flex-grow">
                    <h4 class="font-black text-primary text-lg leading-tight group-hover:text-secondary transition-colors">${p.titre}</h4>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">${p.prenom} ${p.nom} • ${p.faculte || 'Étudiant'}</p>
                </div>
                <div class="text-right flex items-center gap-6">
                    <div class="hidden sm:block">
                        <p class="text-2xl font-black text-primary">${p.votes || 0}</p>
                        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Votes</p>
                    </div>
                    <button onclick="voteForProject(${p.id})" class="w-14 h-14 rounded-2xl bg-slate-50 text-slate-300 hover:bg-orange-50 hover:text-orange-500 hover:scale-110 transition-all flex items-center justify-center border border-transparent hover:border-orange-100 shadow-inner">
                        <span class="material-symbols-outlined text-3xl">favorite</span>
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
            document.getElementById('surveyModal').classList.remove('hidden');
            document.getElementById('surveyModal').classList.add('flex');
        }
    }

    window.closeSurvey = function() {
        document.getElementById('surveyModal').classList.add('hidden');
        document.getElementById('surveyModal').classList.remove('flex');
    }

    const surveyForm = document.getElementById('surveyForm');
    if (surveyForm) {
        surveyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert("Merci pour votre participation !");
            closeSurvey();
        });
    }

    function loadTracker() {
        const container = document.getElementById('trackerProjectList');
        if (!container) return;
        const currentSession = JSON.parse(localStorage.getItem('finee_session'));
        const projects = JSON.parse(localStorage.getItem('finee_projects')) || [];
        const userProjects = projects.filter(p => p.user_id === currentSession.id);

        if (userProjects.length > 0) {
            container.innerHTML = userProjects.map(p => {
                const steps = [
                    { label: 'Soumission', status: 'completed' },
                    { label: 'Validation', status: p.statut === 'Validé' ? 'completed' : 'active' },
                    { label: 'Pitch', status: p.statut === 'Validé' ? 'pending' : 'locked' },
                    { label: 'Finale', status: 'locked' }
                ];
                return `
                    <div class="space-y-6 p-8 bg-slate-50 rounded-3xl border border-slate-100">
                        <div class="flex justify-between items-center">
                            <h4 class="text-xl font-black text-primary">${p.titre}</h4>
                            <span class="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-green-100 text-green-600">
                                ${p.statut}
                            </span>
                        </div>
                        <div class="relative flex justify-between items-start pt-4">
                            <div class="absolute top-[35px] left-0 w-full h-0.5 bg-slate-200 -z-0"></div>
                            ${steps.map(step => `
                                <div class="relative z-10 flex flex-col items-center gap-3">
                                    <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
                                        step.status === 'completed' ? 'bg-green-500 text-white' : 
                                        (step.status === 'active' ? 'bg-primary text-white scale-110 ring-4 ring-primary/20' : 'bg-white text-slate-300')
                                    }">
                                        <span class="material-symbols-outlined text-sm font-bold">
                                            ${step.status === 'completed' ? 'check' : 'radio_button_checked'}
                                        </span>
                                    </div>
                                    <span class="text-[10px] font-black uppercase tracking-widest ${step.status === 'locked' ? 'text-slate-300' : 'text-primary'}">${step.label}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            container.innerHTML = `<div class="text-center py-20 text-slate-400">Aucun projet à suivre.</div>`;
        }
    }

    function loadParticipants() {
        const table = document.getElementById('participantTable');
        if (!table) return;
        const users = JSON.parse(localStorage.getItem('finee_users')) || [];
        table.innerHTML = users.map(u => `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-8 py-5">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-bold text-xs">${u.firstname[0]}${u.lastname[0]}</div>
                        <div>
                            <p class="text-sm font-black text-primary">${u.firstname} ${u.lastname}</p>
                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: #F26-${u.id.toString().slice(-4)}</p>
                        </div>
                    </div>
                </td>
                <td class="px-8 py-5">
                    <p class="text-sm font-bold text-slate-600">${u.faculty}</p>
                    <p class="text-[10px] text-slate-400 font-bold uppercase">${u.department}</p>
                </td>
                <td class="px-8 py-5"><span class="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">Actif</span></td>
                <td class="px-8 py-5">
                    <button class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all">
                        <span class="material-symbols-outlined text-sm">visibility</span>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // --- BADGE ---
    function initBadge() {
        const currentSession = JSON.parse(localStorage.getItem('finee_session'));
        const els = {
            name: document.getElementById('badgeFullName'),
            fac: document.getElementById('badgeFaculty'),
            init: document.getElementById('badgeInitials'),
            id: document.getElementById('badgeId')
        };
        if (els.name) els.name.textContent = `${currentSession.firstname} ${currentSession.lastname}`;
        if (els.fac) els.fac.textContent = currentSession.faculty || "Étudiant";
        
        if (els.init) {
            const profileImg = currentSession.profile_image;
            if (profileImg) {
                els.init.innerHTML = `<img src="${profileImg}" class="w-full h-full object-cover rounded-2xl">`;
            } else {
                els.init.textContent = `${currentSession.firstname[0]}${currentSession.lastname[0]}`;
                els.init.innerHTML = `${currentSession.firstname[0]}${currentSession.lastname[0]}`;
            }
        }
        if (els.id) els.id.textContent = `#F26-${currentSession.id.toString().slice(-4)}`;

        // Dynamic QR Code (Pointing to live verification page)
        const qrImg = document.getElementById('badgeQRCode');
        const qrLink = document.getElementById('badgeQRLink');
        if (qrImg) {
            const verificationUrl = `${window.location.origin}/html/verify_badge.html?uid=${currentSession.id}`;
            qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}`;
            if (qrLink) qrLink.href = verificationUrl;
        }

        const downloadBtn = document.getElementById('downloadBadgeBtn');
        if (downloadBtn) downloadBtn.addEventListener('click', generateBadgePDF);
    }

    // --- SETTINGS LOGIC ---
    function initSettings() {
        const currentSession = JSON.parse(localStorage.getItem('finee_session'));
        const form = document.getElementById('settingsForm');
        if (!form) return;

        // Pre-fill fields
        document.getElementById('editFirstName').value = currentSession.firstname;
        document.getElementById('editLastName').value = currentSession.lastname;
        document.getElementById('editEmail').value = currentSession.email;
        document.getElementById('editFaculty').value = currentSession.faculty || 'FST';
        document.getElementById('editDepartment').value = currentSession.department || 'Informatique';
        document.getElementById('editSexe').value = currentSession.sexe || 'Homme';
        document.getElementById('editNiveau').value = currentSession.niveau || 'Licence 1';

        // Update profile preview
        const profilePreview = document.getElementById('profilePreview');
        if (currentSession.profile_image) {
            profilePreview.innerHTML = `<img src="${currentSession.profile_image}" class="w-full h-full object-cover rounded-[40px]">`;
        } else {
            profilePreview.textContent = `${currentSession.firstname[0]}${currentSession.lastname[0]}`;
        }

        // Handle profile upload
        const uploadInput = document.getElementById('profileUpload');
        if (uploadInput) {
            uploadInput.onchange = function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const base64Image = event.target.result;
                        profilePreview.innerHTML = `<img src="${base64Image}" class="w-full h-full object-cover rounded-[40px]">`;
                        
                        // Temporarily store the base64 string to be saved on form submit
                        form.dataset.tempImage = base64Image;
                    };
                    reader.readAsDataURL(file);
                }
            };
        }

        // Handle form submit
        form.onsubmit = function(e) {
            e.preventDefault();
            const updatedUser = {
                ...currentSession,
                firstname: document.getElementById('editFirstName').value,
                lastname: document.getElementById('editLastName').value,
                email: document.getElementById('editEmail').value,
                faculty: document.getElementById('editFaculty').value,
                department: document.getElementById('editDepartment').value,
                sexe: document.getElementById('editSexe').value,
                niveau: document.getElementById('editNiveau').value,
                profile_image: form.dataset.tempImage || currentSession.profile_image
            };

            const newPass = document.getElementById('editPassword').value;
            if (newPass) updatedUser.password = newPass;

            // Update finee_session
            localStorage.setItem('finee_session', JSON.stringify(updatedUser));

            // Update finee_users array
            const users = JSON.parse(localStorage.getItem('finee_users')) || [];
            const userIndex = users.findIndex(u => u.id === updatedUser.id);
            if (userIndex !== -1) {
                users[userIndex] = updatedUser;
                localStorage.setItem('finee_users', JSON.stringify(users));
            }

            // Refresh UI
            updateUIWithSession();
            alert("Paramètres mis à jour avec succès !");
            switchSection('overview');
        };
    }

    async function generateBadgePDF() {
        const { jsPDF } = window.jspdf;
        const badge = document.getElementById('badge-to-export');
        const btn = document.getElementById('downloadBadgeBtn');
        if (!badge) return;
        btn.disabled = true;
        btn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span> Génération...';
        try {
            const canvas = await html2canvas(badge, { scale: 3, useCORS: true, backgroundColor: null });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [92, 145] });
            pdf.addImage(imgData, 'PNG', 0, 0, 92, 145);
            pdf.save(`Badge_FINEE2026_${session.lastname}.pdf`);
            btn.innerHTML = 'Téléchargé !';
            setTimeout(() => { btn.disabled = false; btn.innerHTML = 'Télécharger le Badge (PDF)'; }, 2000);
        } catch (e) { alert("Erreur PDF."); btn.disabled = false; }
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
                    data: [12, 19, 3, 5, 2, 3, 10],
                    borderColor: '#00677c',
                    backgroundColor: 'rgba(0, 103, 124, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    function seedMockData() {
        if (!localStorage.getItem('finee_users')) {
            localStorage.setItem('finee_users', JSON.stringify([
                { id: 1, firstname: "Mamadou", lastname: "Diallo", email: "admin@finee.gn", password: "123", faculty: "Génie Informatique", department: "MIAGE" },
                { id: 2, firstname: "Fatoumata", lastname: "Barry", email: "user@finee.gn", password: "123", faculty: "Sciences", department: "Maths" }
            ]));
        }
        if (!localStorage.getItem('finee_projects')) {
            localStorage.setItem('finee_projects', JSON.stringify([
                { id: 101, titre: "Solar Labé", user_id: 1, prenom: "Mamadou", nom: "Diallo", faculte: "Génie Informatique", votes: 45, categorie: "Énergie", statut: "Validé", description_courte: "Énergie solaire pour les écoles rurales." },
                { id: 102, titre: "AgroTech Guinée", user_id: 2, prenom: "Fatoumata", nom: "Barry", faculte: "Sciences", votes: 32, categorie: "Agriculture", statut: "Validé", description_courte: "Irrigation intelligente." }
            ]));
        }
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('finee_session');
            window.location.href = 'index.html';
        });
    }

    switchSection('overview');
    initStatsChart();
    // --- MODAL LOGIC ---
    window.openProjectDetails = function(projectId) {
        const projects = JSON.parse(localStorage.getItem('finee_projects')) || [];
        const p = projects.find(proj => proj.id == projectId);
        if (!p) return;

        document.getElementById('modalProjectTitle').textContent = p.titre;
        document.getElementById('modalProjectInitials').textContent = p.titre[0];
        document.getElementById('modalProjectCategory').textContent = p.categorie;
        document.getElementById('modalProjectVotes').textContent = p.votes || 0;
        document.getElementById('modalProjectDesc').textContent = p.problematique + " \n\n " + p.solution;
        document.getElementById('modalProjectTeam').textContent = p.equipe;
        
        const statusEl = document.getElementById('modalProjectStatus');
        statusEl.textContent = p.statut;
        statusEl.className = `px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${p.statut === 'Validé' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`;

        // Render Resources (Links and Files)
        const resourcesContainer = document.getElementById('modalProjectResources');
        resourcesContainer.innerHTML = '';

        // Add link if exists
        if (p.lien) {
            resourcesContainer.innerHTML += `
                <a href="${p.lien}" target="_blank" class="flex items-center gap-3 p-3 bg-primary/5 rounded-2xl hover:bg-primary/10 transition-all group">
                    <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <span class="material-symbols-outlined text-sm">link</span>
                    </div>
                    <div class="flex-grow">
                        <p class="text-[11px] font-black text-primary truncate">Lien du Projet</p>
                        <p class="text-[9px] text-slate-400 font-bold truncate">${p.lien}</p>
                    </div>
                </a>
            `;
        }

        // Add documents if exists
        if (p.documents && p.documents.length > 0) {
            p.documents.forEach(doc => {
                const isZip = doc.name.toLowerCase().endsWith('.zip');
                const isPdf = doc.name.toLowerCase().endsWith('.pdf');
                const icon = isZip ? 'folder_zip' : (isPdf ? 'picture_as_pdf' : 'description');
                
                resourcesContainer.innerHTML += `
                    <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 group">
                        <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                            <span class="material-symbols-outlined text-sm">${icon}</span>
                        </div>
                        <div class="flex-grow">
                            <p class="text-[11px] font-black text-primary truncate">${doc.name}</p>
                            <p class="text-[9px] text-slate-400 font-bold">${doc.size} MB</p>
                        </div>
                    </div>
                `;
            });
        }

        if (resourcesContainer.innerHTML === '') {
            resourcesContainer.innerHTML = `<p class="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic text-center py-4">Aucune ressource déposée</p>`;
        }

        const modal = document.getElementById('projectModal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Store current project ID for editing
        currentProjectId = projectId;
    };

    window.openEditProjectModal = function() {
        if (!currentProjectId) return;
        
        const projects = JSON.parse(localStorage.getItem('finee_projects')) || [];
        const p = projects.find(proj => proj.id == currentProjectId);
        if (!p) return;

        // Pre-fill form
        document.getElementById('editProjectTitle').value = p.titre;
        document.getElementById('editProjectCategory').value = p.categorie;
        document.getElementById('editProjectProblem').value = p.problematique || "";
        document.getElementById('editProjectSolution').value = p.solution || "";
        document.getElementById('editProjectTeam').value = p.equipe;

        // Close detail modal and open edit modal
        closeProjectModal();
        const modal = document.getElementById('editProjectModal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    };

    window.closeEditProjectModal = function() {
        const modal = document.getElementById('editProjectModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    };

    // Handle Edit Form Submission
    const editForm = document.getElementById('editProjectForm');
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let projects = JSON.parse(localStorage.getItem('finee_projects')) || [];
            const index = projects.findIndex(p => p.id == currentProjectId);
            
            if (index !== -1) {
                // Update project data
                projects[index].titre = document.getElementById('editProjectTitle').value;
                projects[index].categorie = document.getElementById('editProjectCategory').value;
                projects[index].problematique = document.getElementById('editProjectProblem').value;
                projects[index].solution = document.getElementById('editProjectSolution').value;
                projects[index].equipe = document.getElementById('editProjectTeam').value;
                
                // Save back to localStorage
                localStorage.setItem('finee_projects', JSON.stringify(projects));
                
                // Refresh Dashboard UI
                loadUserProjects();
                
                // Success feedback
                alert("Projet mis à jour avec succès !");
                closeEditProjectModal();
            }
        });
    }

    // --- DELETE PROJECT LOGIC ---
    window.confirmDeleteProject = function() {
        if (!currentProjectId) return;
        const modal = document.getElementById('deleteConfirmModal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    };

    window.closeDeleteConfirm = function() {
        const modal = document.getElementById('deleteConfirmModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    };

    window.executeDeleteProject = function() {
        if (!currentProjectId) return;
        
        let projects = JSON.parse(localStorage.getItem('finee_projects')) || [];
        const filteredProjects = projects.filter(p => p.id != currentProjectId);
        
        // Save back to localStorage
        localStorage.setItem('finee_projects', JSON.stringify(filteredProjects));
        
        // Refresh UI
        loadUserProjects();
        
        // Close both modals
        closeDeleteConfirm();
        closeProjectModal();
        
        // Success feedback
        alert("Projet supprimé avec succès.");
    };

    window.closeProjectModal = function() {
        const modal = document.getElementById('projectModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    };

    // Close modal on click outside
    document.getElementById('projectModal').addEventListener('click', (e) => {
        if (e.target.id === 'projectModal') closeProjectModal();
    });

    initBadge();
});

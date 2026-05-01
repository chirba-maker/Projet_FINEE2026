/**
 * Programme Logic - FINEE 2026
 * Dynamic Rendering & Bento Layout Support
 */

const MOCK_PROGRAMME = [
    { 
        id: 1, 
        jour: 1, 
        titre: "L'Intelligence Artificielle au service de la Recherche", 
        heure_debut: "09:00", 
        heure_fin: "10:30", 
        type: "Keynote", 
        lieu: "Grand Amphi", 
        intervenant: "Dr. Elena Volkov", 
        bio: "Directrice Innovation, MIT Research. Experte mondiale en IA générative.",
        img: "https://i.pravatar.cc/150?u=elena",
        desc: "Introduction aux nouveaux paradigmes de l'IA générative et leur impact sur le cursus universitaire en 2026."
    },
    { 
        id: 2, 
        jour: 1, 
        titre: "Atelier Blockchain & Transparence", 
        heure_debut: "11:00", 
        heure_fin: "12:30", 
        type: "Workshop", 
        lieu: "Lab 1", 
        intervenant: "Jean-Baptiste Durand", 
        bio: "CTO @ ChainSecure Labs. Pionnier de la blockchain en Afrique de l'Ouest.",
        img: "https://i.pravatar.cc/150?u=jb",
        desc: "Mise en place d'un système de vote électronique sécurisé pour les instances universitaires."
    },
    { 
        id: 3, 
        jour: 2, 
        titre: "Startup Pitch : Le futur de l'EdTech", 
        heure_debut: "14:00", 
        heure_fin: "15:30", 
        type: "Pitch", 
        lieu: "Innovation Hub", 
        intervenant: "Équipe Finalistes", 
        bio: "Les 5 meilleurs projets innovants de l'édition 2026.",
        img: "https://i.pravatar.cc/150?u=pitch",
        desc: "Présentation des 5 projets finalistes du concours d'innovation FINEE 2026. Vote du public en direct."
    },
    { 
        id: 4, 
        jour: 3, 
        titre: "Cérémonie de Clôture & Networking", 
        heure_debut: "17:00", 
        heure_fin: "19:00", 
        type: "Cérémonie", 
        lieu: "Jardins de l'Université", 
        intervenant: "Rectorat de Labé", 
        bio: "Célébration des talents et remise des prix de l'innovation.",
        img: "https://i.pravatar.cc/150?u=closing",
        desc: "Clôture officielle du forum, remise des prix et cocktail de réseautage pour les participants."
    }
];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Session & Header Actions
    initNavigation();
    
    // 2. Tab Switching
    const tabs = document.querySelectorAll('.day-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const day = tab.getAttribute('data-day');
            switchDay(day);
        });
    });

    // 3. Initial Render
    switchDay(1);

    // 4. Scroll Progress
    initScrollProgress();

    // 5. Download Agenda
    const downloadBtn = document.getElementById('downloadAgendaBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadAgendaPDF);
    }
});

function initNavigation() {
    const session = JSON.parse(localStorage.getItem('finee_session'));
    const headerActions = document.getElementById('headerActions');
    const mobileHeaderActions = document.getElementById('mobileHeaderActions');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (session) {
        const update = (container) => {
            if (container) {
                container.innerHTML = `
                    <a href="dashboard.html" class="px-5 py-2 text-sm font-bold text-primary border border-primary rounded-lg flex items-center gap-2">
                        <span class="material-symbols-outlined text-sm">dashboard</span> Mon Espace
                    </a>
                    <button class="logoutBtn px-5 py-2 text-sm font-bold rounded-lg bg-slate-100 text-slate-500">Déconnexion</button>
                `;
            }
        };
        update(headerActions);
        update(mobileHeaderActions);
        
        document.querySelectorAll('.logoutBtn').forEach(btn => {
            btn.addEventListener('click', () => {
                localStorage.removeItem('finee_session');
                window.location.reload();
            });
        });
    }

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    }
}

function switchDay(day) {
    // Update Tabs
    document.querySelectorAll('.day-tab').forEach(t => {
        t.classList.remove('active', 'bg-white', 'shadow-md', 'text-primary');
        t.classList.add('text-slate-400');
        if (t.getAttribute('data-day') == day) {
            t.classList.add('active', 'bg-white', 'shadow-md', 'text-primary');
            t.classList.remove('text-slate-400');
        }
    });

    // Render Sessions
    const container = document.getElementById('sessions-list');
    const sessions = MOCK_PROGRAMME.filter(s => s.jour == day);

    if (sessions.length === 0) {
        container.innerHTML = `
            <div class="p-12 text-center bg-white rounded-3xl border border-slate-100">
                <span class="material-symbols-outlined text-5xl text-slate-200 mb-4">event_busy</span>
                <p class="text-slate-400 font-bold">Aucune session prévue pour ce jour.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = sessions.map(s => renderSessionCard(s)).join('');
}

function renderSessionCard(s) {
    const typeColors = {
        'Keynote': 'bg-primary-container text-white',
        'Workshop': 'bg-primary text-white border-l-4 border-cyan-400',
        'Pitch': 'bg-[#1A365D] text-white',
        'Cérémonie': 'bg-slate-900 text-white'
    };

    const typeIcons = {
        'Keynote': 'mic',
        'Workshop': 'school',
        'Pitch': 'rocket',
        'Cérémonie': 'celebration'
    };

    return `
        <div class="glass-card rounded-[32px] overflow-hidden flex flex-col md:flex-row group transition-all hover:shadow-2xl hover:-translate-y-1 animate-fade-in-up">
            <div class="md:w-48 ${typeColors[s.type] || 'bg-primary text-white'} p-8 flex flex-col justify-center items-center md:items-start">
                <span class="text-3xl font-black">${s.heure_debut}</span>
                <span class="text-xs opacity-60 font-bold">${s.heure_fin}</span>
                <div class="mt-6 flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
                    <span class="material-symbols-outlined text-[14px]">${typeIcons[s.type] || 'schedule'}</span>
                    <span class="text-[9px] font-black uppercase tracking-widest">${s.type}</span>
                </div>
            </div>
            <div class="flex-grow p-8 md:p-10 flex flex-col justify-between bg-white/50">
                <div>
                    <h2 class="text-2xl font-black text-primary mb-4 leading-tight">${s.titre}</h2>
                    <p class="text-slate-500 line-clamp-2 mb-8 font-medium">${s.desc}</p>
                </div>
                <div class="flex items-center justify-between pt-6 border-t border-slate-100/50">
                    <div class="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-all" onclick="openSpeakerModal(${s.id})">
                        <div class="w-12 h-12 rounded-2xl border-2 border-cyan-400/30 overflow-hidden shadow-inner">
                            <img src="${s.img}" class="w-full h-full object-cover">
                        </div>
                        <div>
                            <p class="font-black text-primary text-sm">${s.intervenant}</p>
                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Intervenant</p>
                        </div>
                    </div>
                    <button onclick="openSpeakerModal(${s.id})" class="text-cyan-600 font-black text-[10px] uppercase tracking-widest hover:underline underline-offset-4">Détails →</button>
                </div>
            </div>
        </div>
    `;
}

window.openSpeakerModal = function(id) {
    const session = MOCK_PROGRAMME.find(s => s.id === id);
    if (!session) return;

    document.getElementById('speakerName').textContent = session.intervenant;
    document.getElementById('speakerTitle').textContent = session.type === 'Keynote' ? 'Conférencier Principal' : 'Intervenant Expert';
    document.getElementById('speakerBio').textContent = session.bio;
    document.getElementById('speakerSession').textContent = session.titre;
    document.getElementById('speakerImg').src = session.img;

    const expertise = document.getElementById('speakerExpertise');
    expertise.innerHTML = `<span class="px-3 py-1.5 bg-cyan-50 text-cyan-600 rounded-xl text-[10px] font-black uppercase tracking-widest">${session.type}</span>`;

    const modal = document.getElementById('speakerModal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

window.closeSpeakerModal = function() {
    const modal = document.getElementById('speakerModal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
};

async function downloadAgendaPDF() {
    const btn = document.getElementById('downloadAgendaBtn');
    const originalContent = btn.innerHTML;
    
    // Premium Loading State
    btn.disabled = true;
    btn.innerHTML = `
        <span class="material-symbols-outlined animate-spin">sync</span>
        <span class="font-black text-xs uppercase tracking-widest">Génération du PDF...</span>
    `;

    try {
        const { jsPDF } = window.jspdf;
        const agendaContainer = document.getElementById('sessions-list');
        
        // --- 1. Prepare for Capture (High Contrast) ---
        // We add a temporary class to ensure text is dark enough for the PDF
        agendaContainer.classList.add('pdf-capture-mode');
        
        // Use html2canvas to capture the agenda with high resolution
        const canvas = await html2canvas(agendaContainer, {
            scale: 3, // Increased scale for ultra-sharp text
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff', // Clean white background
            windowWidth: 1200 // Force a desktop-like width for consistent layout
        });

        // Remove temporary high-contrast class
        agendaContainer.classList.remove('pdf-capture-mode');

        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        // --- 2. Branded Header ---
        pdf.setFillColor(0, 32, 69); // Primary color (#002045)
        pdf.rect(0, 0, pdfWidth, 45, 'F');
        
        // Decorative shapes for a premium look
        pdf.setFillColor(0, 181, 216); // Secondary color (#00B5D8)
        pdf.rect(0, 42, pdfWidth, 3, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(26);
        pdf.text('FINEE 2026', 15, 22);
        
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(14);
        pdf.text('AGENDA OFFICIEL DU FORUM', 15, 30);
        
        pdf.setFontSize(9);
        pdf.setTextColor(173, 199, 247); // Lighter blue
        pdf.text('Université de Labé • République de Guinée • www.finee-labe.gn', 15, 38);

        // --- 3. Content ---
        // Add the captured agenda image
        pdf.addImage(imgData, 'PNG', 0, 50, pdfWidth, pdfHeight);
        
        // --- 4. Branded Footer ---
        const pageCount = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFillColor(248, 250, 252);
            pdf.rect(0, pdf.internal.pageSize.getHeight() - 15, pdfWidth, 15, 'F');
            pdf.setTextColor(100, 116, 139);
            pdf.setFontSize(8);
            pdf.text(`Document officiel FINEE 2026 - Page ${i}`, 15, pdf.internal.pageSize.getHeight() - 7);
            pdf.text('Généré le ' + new Date().toLocaleDateString('fr-FR'), pdfWidth - 45, pdf.internal.pageSize.getHeight() - 7);
        }

        // Save PDF
        pdf.save('Agenda_FINEE_2026_Officiel.pdf');

        // Success feedback
        btn.innerHTML = `
            <span class="material-symbols-outlined text-green-400">check_circle</span>
            <span class="font-black text-xs uppercase tracking-widest">Document Téléchargé</span>
        `;
    } catch (error) {
        console.error("PDF Generation error:", error);
        btn.innerHTML = `
            <span class="material-symbols-outlined text-red-400">error</span>
            <span class="font-black text-xs uppercase tracking-widest">Erreur</span>
        `;
    } finally {
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = originalContent;
        }, 3000);
    }
}

function initScrollProgress() {
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        const bar = document.getElementById('scrollProgress');
        if (bar) bar.style.width = scrolled + '%';
    });
}

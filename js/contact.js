/**
 * Contact Logic - FINEE 2026
 * Offline Mode: Simulating form submission
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Session & Header Management
    const session = JSON.parse(localStorage.getItem('finee_session'));
    const headerActions = document.getElementById('headerActions');
    const mobileHeaderActions = document.getElementById('mobileHeaderActions');

    const updateHeaders = (container) => {
        if (!container) return;
        container.innerHTML = `
            <a href="dashboard.html" class="px-5 py-2 text-sm font-semibold text-primary border border-primary rounded-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-sm">dashboard</span> Mon Espace
            </a>
            <button class="logoutBtn px-5 py-2 text-sm font-semibold rounded-lg bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 active:scale-95 transition-all">Déconnexion</button>
        `;
    };

    if (session && session.email) {
        updateHeaders(headerActions);
        updateHeaders(mobileHeaderActions);
        
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('logoutBtn')) {
                localStorage.removeItem('finee_session');
                window.location.href = '../index.html';
            }
        });
    }

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // 2. Contact Form Logic
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            
            btn.textContent = "Envoi en cours...";
            btn.disabled = true;

            // Simulate server delay for professional feel
            setTimeout(() => {
                alert("Votre message a été envoyé avec succès ! Nous vous répondrons bientôt.");
                contactForm.reset();
                btn.textContent = originalText;
                btn.disabled = false;
            }, 1000);
        });
    }

    // Scroll Progress Logic
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        const progressBar = document.getElementById('scrollProgress');
        if (progressBar) progressBar.style.width = scrolled + '%';
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // 1. Session & Header Management
    const session = JSON.parse(localStorage.getItem('finee_session'));
    const headerActions = document.getElementById('headerActions');
    const mobileHeaderActions = document.getElementById('mobileHeaderActions');
    const heroCtas = document.querySelector('.relative.z-10.max-w-4xl .flex'); // Hero buttons

    const updateUIForLoggedInUser = () => {
        const dashboardBtnHtml = `
            <a href="dashboard.html" class="px-5 py-2 text-sm font-semibold text-primary border border-primary rounded-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-sm">dashboard</span> Mon Espace
            </a>
            <button class="logoutBtn px-5 py-2 text-sm font-semibold rounded-lg bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 active:scale-95 transition-all">Déconnexion</button>
        `;

        if (headerActions) headerActions.innerHTML = dashboardBtnHtml;
        if (mobileHeaderActions) mobileHeaderActions.innerHTML = dashboardBtnHtml;

        // Update Hero section CTAs if they exist
        if (heroCtas) {
            heroCtas.innerHTML = `
                <a href="dashboard.html" class="bg-on-tertiary-container hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-lg shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2">
                    Accéder à mon Espace
                    <span class="material-symbols-outlined">dashboard</span>
                </a>
                <a href="programme.html" class="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold px-10 py-4 rounded-lg border border-white/30 active:scale-95 transition-transform flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined">calendar_today</span>
                    Voir le Programme
                </a>
            `;
        }
    };

    if (session && session.email) {
        updateUIForLoggedInUser();
        
        // Use event delegation for logout buttons (dynamic content)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('logoutBtn')) {
                e.preventDefault();
                localStorage.removeItem('finee_session');
                window.location.href = 'index.html';
            }
        });
    } else {
        // Clear potential "null" string or incomplete session
        if (localStorage.getItem('finee_session')) {
            localStorage.removeItem('finee_session');
        }
    }

    // Mobile Menu Toggle with icon + overlay
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    if (mobileMenuBtn && mobileMenu) {
        const menuIcon = mobileMenuBtn.querySelector('.material-symbols-outlined');
        function toggleMobileMenu(open) {
            const isOpen = open !== undefined ? open : mobileMenu.classList.contains('hidden');
            mobileMenu.classList.toggle('hidden', !isOpen);
            if (menuOverlay) menuOverlay.classList.toggle('active', isOpen);
            if (menuIcon) menuIcon.textContent = isOpen ? 'close' : 'menu';
        }
        mobileMenuBtn.addEventListener('click', () => toggleMobileMenu());
        if (menuOverlay) menuOverlay.addEventListener('click', () => toggleMobileMenu(false));
    }

    // 2. Hero Image Slider (Enhanced)
    const slides = document.querySelectorAll('.hero-slider .slide');
    const dotsContainer = document.getElementById('sliderDots');
    let currentSlide = 0;
    let sliderInterval;

    if (slides.length > 0 && dotsContainer) {
        // Create dots
        slides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = `dot ${i === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });

        const dots = document.querySelectorAll('.dot');

        function goToSlide(n) {
            slides[currentSlide].classList.remove('active');
            dots[currentSlide].classList.remove('active');
            currentSlide = n;
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');
            resetInterval();
        }

        function nextSlide() {
            let next = (currentSlide + 1) % slides.length;
            goToSlide(next);
        }

        function resetInterval() {
            clearInterval(sliderInterval);
            sliderInterval = setInterval(nextSlide, 5000);
        }

        resetInterval();
    }

    // Scroll Progress Logic
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        const progressBar = document.getElementById('scrollProgress');
        if (progressBar) progressBar.style.width = scrolled + '%';
    });

    // 3. Scroll Animations (Intersection Observer)
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.bento-card, .section-title, .cta-container');
    animatedElements.forEach(el => {
        el.classList.add('fade-in-up');
        observer.observe(el);
    });

});

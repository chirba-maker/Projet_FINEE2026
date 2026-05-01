document.addEventListener('DOMContentLoaded', () => {
    const newsletterBtn = document.querySelector('.newsletter-form button');
    if (newsletterBtn) {
        newsletterBtn.addEventListener('click', () => {
            const emailInput = document.querySelector('.newsletter-form input');
            const email = emailInput.value.trim();
            
            // Email validation regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (email && emailRegex.test(email)) {
                // --- MOCK DATABASE LOGIC ---
                let subscribers = JSON.parse(localStorage.getItem('finee_newsletter_subs')) || [];
                
                if (!subscribers.includes(email)) {
                    subscribers.push({
                        email: email,
                        date: new Date().toISOString()
                    });
                    localStorage.setItem('finee_newsletter_subs', JSON.stringify(subscribers));
                    console.log("Nouvel abonné Newsletter :", email);
                }

                const originalText = newsletterBtn.textContent;
                newsletterBtn.textContent = "Merci ! ✨";
                newsletterBtn.style.background = "#f0c040";
                newsletterBtn.disabled = true;
                
                emailInput.value = "";

                setTimeout(() => {
                    newsletterBtn.textContent = originalText;
                    newsletterBtn.style.background = "";
                    newsletterBtn.disabled = false;
                }, 3000);
            } else {
                alert("Veuillez entrer une adresse e-mail valide.");
            }
        });
    }
});

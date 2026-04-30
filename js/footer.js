document.addEventListener('DOMContentLoaded', () => {
    const newsletterBtn = document.querySelector('.newsletter-form button');
    if (newsletterBtn) {
        newsletterBtn.addEventListener('click', () => {
            const inputs = document.querySelectorAll('.newsletter-form input');
            let valid = true;
            inputs.forEach(input => {
                if (!input.value.trim()) valid = false;
            });

            if (valid) {
                const originalText = newsletterBtn.textContent;
                newsletterBtn.textContent = "Merci ! ✨";
                newsletterBtn.style.background = "#f0c040";
                newsletterBtn.disabled = true;
                
                inputs.forEach(input => input.value = "");

                setTimeout(() => {
                    newsletterBtn.textContent = originalText;
                    newsletterBtn.style.background = "";
                    newsletterBtn.disabled = false;
                }, 3000);
            } else {
                alert("Veuillez remplir tous les champs pour vous abonner.");
            }
        });
    }
});

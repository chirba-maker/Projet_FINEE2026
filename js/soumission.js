/**
 * Soumission Logic - FINEE 2026
 * Professional Multi-step Form Management
 */

let currentStep = 1;
const totalSteps = 3;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Session Security
    const session = JSON.parse(localStorage.getItem('finee_session'));
    if (!session) {
        window.location.href = 'connexion.html';
        return;
    }

    // 2. Initialize UI
    showStep(currentStep);

    // 3. Form Submission
    const form = document.getElementById('submissionForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateStep(currentStep)) {
                saveProject();
            }
        });
    }
});

function showStep(n) {
    const steps = document.querySelectorAll(".step-content");
    const dots = document.querySelectorAll(".step-dot");
    const currentStepText = document.getElementById("currentStepText");
    const tipItems = document.querySelectorAll("#sidebarTips .tip-item");
    
    if (steps.length === 0) return;

    // Update form content visibility
    steps.forEach(step => step.classList.add("hidden"));
    steps[n-1].classList.remove("hidden");
    
    // Update header dots
    dots.forEach((dot, index) => {
        dot.classList.remove("active", "bg-primary", "ring-4", "ring-primary/10");
        dot.classList.add("bg-slate-200");
        if (index < n) {
            dot.classList.add("bg-primary");
            if (index === n - 1) dot.classList.add("ring-4", "ring-primary/10");
        }
    });

    // Update text
    if (currentStepText) currentStepText.textContent = n;

    // Update sidebar tips highlighting
    if (tipItems.length > 0) {
        tipItems.forEach((item, index) => {
            item.classList.remove("active", "opacity-100", "grayscale-0");
            item.classList.add("opacity-40", "grayscale");
            if (index === n - 1) {
                item.classList.add("active", "opacity-100", "grayscale-0");
            }
        });
    }

    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.nextStep = function(n) {
    if (!validateStep(n)) return;
    
    currentStep++;
    if (currentStep <= totalSteps) {
        showStep(currentStep);
    }
}

window.prevStep = function(n) {
    currentStep--;
    if (currentStep < 1) currentStep = 1;
    showStep(currentStep);
}

function validateStep(n) {
    const currentStepEl = document.getElementById(`step-${n}`);
    const inputs = currentStepEl.querySelectorAll("input[required], textarea[required], select[required]");
    let valid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            valid = false;
            input.classList.add("!border-red-500", "ring-4", "ring-red-500/10");
            
            // Add shake animation
            input.parentElement.classList.add("animate-shake");
            setTimeout(() => input.parentElement.classList.remove("animate-shake"), 500);
        } else {
            input.classList.remove("!border-red-500", "ring-4", "ring-red-500/10");
        }
    });

    return valid;
}

function saveProject() {
    const session = JSON.parse(localStorage.getItem('finee_session')) || {};
    
    const projectData = {
        id: Date.now(),
        titre: document.getElementById("projectTitle").value,
        categorie: document.getElementById("projectCategory").value,
        description_courte: document.getElementById("projectShortDesc").value,
        problematique: document.getElementById("projectProblem").value,
        solution: document.getElementById("projectSolution").value,
        equipe: document.getElementById("projectTeam").value,
        user_id: session.id,
        prenom: session.firstname,
        nom: session.lastname,
        faculte: session.faculty,
        votes: 0,
        statut: "En attente",
        created_at: new Date().toISOString()
    };
    
    // Save to localStorage
    let projects = JSON.parse(localStorage.getItem('finee_projects')) || [];
    projects.push(projectData);
    localStorage.setItem('finee_projects', JSON.stringify(projects));

    // Show success modal
    const modal = document.getElementById("successModal");
    if (modal) {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
    }
}

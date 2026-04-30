/**
 * Soumission Logic - FINEE 2026
 * Professional Multi-step Form Management
 */

let currentStep = 1;
const totalSteps = 4;
let selectedFiles = [];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Session Security
    const session = JSON.parse(localStorage.getItem('finee_session'));
    if (!session) {
        window.location.href = 'connexion.html';
        return;
    }

    // 2. Initialize UI
    showStep(currentStep);

    // 3. File Upload Initialization
    initFileUpload();

    // 4. Form Submission
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

function initFileUpload() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');

    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-primary', 'bg-primary/10');
    });

    ['dragleave', 'drop'].forEach(event => {
        dropZone.addEventListener(event, () => {
            dropZone.classList.remove('border-primary', 'bg-primary/10');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    });

    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
    });
}

function handleFiles(files) {
    const fileList = document.getElementById('fileList');
    
    files.forEach(file => {
        // Prevent duplicates
        if (selectedFiles.some(f => f.name === file.name)) return;

        const fileObj = {
            id: Date.now() + Math.random(),
            file: file,
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2),
            type: file.type,
            progress: 0
        };

        selectedFiles.push(fileObj);
        renderFileItem(fileObj);
        simulateUpload(fileObj);
    });
}

function renderFileItem(fileObj) {
    const fileList = document.getElementById('fileList');
    const isImage = fileObj.type.startsWith('image/');
    
    const div = document.createElement('div');
    div.id = `file-${fileObj.id}`;
    div.className = "flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm animate-pop relative overflow-hidden group";
    
    div.innerHTML = `
        <div class="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden border border-slate-100">
            ${isImage ? `<img src="" class="w-full h-full object-cover hidden" id="preview-${fileObj.id}">` : ''}
            <span class="material-symbols-outlined text-slate-400 ${isImage ? 'block' : ''}" id="icon-${fileObj.id}">
                ${fileObj.type.includes('pdf') ? 'picture_as_pdf' : (fileObj.type.includes('zip') ? 'folder_zip' : 'description')}
            </span>
        </div>
        <div class="flex-grow min-w-0">
            <p class="text-sm font-black text-primary truncate pr-8">${fileObj.name}</p>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">${fileObj.size} MB</p>
            <div class="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div id="progress-${fileObj.id}" class="h-full bg-secondary transition-all duration-300" style="width: 0%"></div>
            </div>
        </div>
        <button type="button" onclick="removeFile(${fileObj.id})" class="absolute top-4 right-4 w-6 h-6 rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center">
            <span class="material-symbols-outlined text-sm">close</span>
        </button>
    `;

    fileList.appendChild(div);

    // Image Preview
    if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.getElementById(`preview-${fileObj.id}`);
            const icon = document.getElementById(`icon-${fileObj.id}`);
            if (img && icon) {
                img.src = e.target.result;
                img.classList.remove('hidden');
                icon.classList.add('hidden');
            }
        };
        reader.readAsDataURL(fileObj.file);
    }
}

function simulateUpload(fileObj) {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            const item = document.getElementById(`file-${fileObj.id}`);
            if (item) item.classList.add('border-green-100', 'bg-green-50/20');
        }
        const bar = document.getElementById(`progress-${fileObj.id}`);
        if (bar) bar.style.width = progress + '%';
        fileObj.progress = progress;
    }, 300);
}

window.removeFile = function(id) {
    selectedFiles = selectedFiles.filter(f => f.id != id);
    const item = document.getElementById(`file-${id}`);
    if (item) {
        item.classList.add('scale-90', 'opacity-0');
        setTimeout(() => item.remove(), 300);
    }
}

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
        documents: selectedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })),
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

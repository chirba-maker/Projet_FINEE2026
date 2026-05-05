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

    // 4. Character Counter
    initCharCounter();

    // 5. Form Submission
    const form = document.getElementById('submissionForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateStep(currentStep)) {
                saveProject();
            }
        });
    }

    // 6. Real-time Validation
    initRealTimeValidation();
});

function initCharCounter() {
    const desc = document.getElementById('projectShortDesc');
    const count = document.getElementById('charCount');
    if (desc && count) {
        desc.addEventListener('input', () => {
            const length = desc.value.length;
            count.textContent = `${length} / 150`;
            if (length > 150) {
                count.classList.add('text-red-500');
                count.classList.remove('text-slate-300');
            } else {
                count.classList.remove('text-red-500');
                count.classList.add('text-slate-300');
            }
        });
    }
}

function initRealTimeValidation() {
    const inputs = document.querySelectorAll('input[required], textarea[required], select[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value.trim()) {
                input.classList.remove('!border-red-400', 'bg-red-50/10');
                input.classList.add('border-green-400/20', 'bg-green-50/5');
            }
        });
        input.addEventListener('input', () => {
            input.classList.remove('!border-red-400', 'bg-red-50/10');
        });
    });
}

function initFileUpload() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('click', () => fileInput.click());

    ['dragenter', 'dragover'].forEach(event => {
        dropZone.addEventListener(event, (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-active');
        });
    });

    ['dragleave', 'drop'].forEach(event => {
        dropZone.addEventListener(event, () => {
            dropZone.classList.remove('drag-active');
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
    files.forEach(file => {
        // Validation: Size (Max 15MB)
        if (file.size > 15 * 1024 * 1024) {
            alert(`Le fichier ${file.name} est trop lourd (> 15Mo)`);
            return;
        }

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
    div.className = "flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm animate-pop relative overflow-hidden group hover:border-secondary/20 transition-all";
    
    div.innerHTML = `
        <div class="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden border border-slate-50">
            ${isImage ? `<img src="" class="w-full h-full object-cover hidden" id="preview-${fileObj.id}">` : ''}
            <span class="material-symbols-outlined text-slate-300 ${isImage ? 'block' : ''}" id="icon-${fileObj.id}">
                ${fileObj.type.includes('pdf') ? 'picture_as_pdf' : (fileObj.type.includes('zip') ? 'folder_zip' : 'description')}
            </span>
        </div>
        <div class="flex-grow min-w-0">
            <div class="flex justify-between items-start mb-1">
                <p class="text-xs font-black text-primary truncate pr-6">${fileObj.name}</p>
                <button type="button" onclick="removeFile(${fileObj.id})" class="text-slate-300 hover:text-red-500 transition-colors">
                    <span class="material-symbols-outlined text-sm">cancel</span>
                </button>
            </div>
            <div class="flex items-center gap-2">
                <div class="flex-grow h-1 bg-slate-50 rounded-full overflow-hidden">
                    <div id="progress-${fileObj.id}" class="h-full bg-secondary transition-all duration-500" style="width: 0%"></div>
                </div>
                <span class="text-[8px] font-black text-slate-300 uppercase">${fileObj.size} MB</span>
            </div>
        </div>
    `;

    fileList.appendChild(div);

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
        progress += Math.random() * 40;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            const item = document.getElementById(`file-${fileObj.id}`);
            if (item) {
                item.classList.add('bg-green-50/10', 'border-green-100');
                const bar = document.getElementById(`progress-${fileObj.id}`);
                if (bar) bar.classList.replace('bg-secondary', 'bg-green-400');
            }
        }
        const bar = document.getElementById(`progress-${fileObj.id}`);
        if (bar) bar.style.width = progress + '%';
        fileObj.progress = progress;
    }, 400);
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
    const tipItems = document.querySelectorAll("#sidebarTips .tip-item");
    
    steps.forEach(s => s.classList.add('hidden'));
    steps[n-1].classList.remove('hidden');

    // Sidebar Tips Highlighting
    tipItems.forEach((item, index) => {
        item.classList.toggle('active', index === n - 1);
    });

    // Step indicators (Dots if present)
    const dots = document.querySelectorAll('.step-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index < n);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.nextStep = function(n) {
    if (!validateStep(n)) {
        // Feedback visuel sur erreur
        const activeStep = document.getElementById(`step-${n}`);
        activeStep.classList.add('error-shake');
        setTimeout(() => activeStep.classList.remove('error-shake'), 500);
        return;
    }
    
    currentStep++;
    if (currentStep <= totalSteps) showStep(currentStep);
}

window.prevStep = function(n) {
    currentStep--;
    if (currentStep < 1) currentStep = 1;
    showStep(currentStep);
}

function validateStep(n) {
    const stepEl = document.getElementById(`step-${n}`);
    const required = stepEl.querySelectorAll('[required]');
    let isValid = true;

    required.forEach(field => {
        if (field.type === 'checkbox') {
            if (!field.checked) {
                isValid = false;
                field.parentElement.classList.add('text-red-500');
            } else {
                field.parentElement.classList.remove('text-red-500');
            }
        } else if (!field.value.trim()) {
            isValid = false;
            field.classList.add('!border-red-400', 'bg-red-50/5');
        } else if (field.id === 'projectShortDesc' && field.value.length > 150) {
            isValid = false;
            field.classList.add('!border-red-400');
        }
    });

    return isValid;
}

function saveProject() {
    const session = JSON.parse(localStorage.getItem('finee_session')) || {};
    
    // Preparation des données
    const project = {
        id: Date.now(),
        user_id: session.id,
        prenom: session.firstname,
        nom: session.lastname,
        faculte: session.faculty || 'Non spécifié',
        titre: document.getElementById('projectTitle').value,
        categorie: document.getElementById('projectCategory').value,
        description_courte: document.getElementById('projectShortDesc').value,
        problematique: document.getElementById('projectProblem').value,
        solution: document.getElementById('projectSolution').value,
        equipe: document.getElementById('projectTeam').value,
        lien: document.getElementById('projectLink').value,
        votes: 0,
        statut: "En attente",
        created_at: new Date().toISOString(),
        documents: selectedFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
    };

    // Simulation de sauvegarde (localStorage)
    let projects = JSON.parse(localStorage.getItem('finee_projects')) || [];
    projects.push(project);
    localStorage.setItem('finee_projects', JSON.stringify(projects));

    // UI Feedback
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}


/**
 * Badge Verification Logic - FINEE 2026
 * Publicly verifies a user's badge based on the URL parameter.
 */

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('uid');

    const loadingState = document.getElementById('loadingState');
    const verificationCard = document.getElementById('verificationCard');
    const errorState = document.getElementById('errorState');

    if (!userId) {
        showError();
        return;
    }

    // Simulate database lookup from localStorage (demo mode)
    // Note: In a real app, this would be an API call to a central server.
    const users = JSON.parse(localStorage.getItem('finee_users')) || [];
    const user = users.find(u => u.id == userId);

    setTimeout(() => {
        if (user) {
            showBadge(user);
        } else {
            showError();
        }
    }, 1200); // Premium feel delay
});

function showBadge(user) {
    const loadingState = document.getElementById('loadingState');
    const verificationCard = document.getElementById('verificationCard');
    
    // Fill data
    document.getElementById('verifyName').textContent = `${user.firstname} ${user.lastname}`;
    document.getElementById('verifyDept').textContent = user.department;
    document.getElementById('verifyFac').textContent = user.faculty;
    document.getElementById('verifyId').textContent = `#F26-${user.id.toString().slice(-4)}`;
    
    const initials = `${user.firstname[0]}${user.lastname[0]}`;
    const photoContainer = document.getElementById('verifyPhoto');
    const initialsContainer = document.getElementById('verifyInitials');

    if (user.profile_image) {
        photoContainer.innerHTML = `<img src="${user.profile_image}" class="w-full h-full object-cover">`;
    } else {
        initialsContainer.textContent = initials;
    }

    // Switch views
    loadingState.classList.add('hidden');
    verificationCard.classList.remove('hidden');
    verificationCard.classList.add('animate-pop');
}

function showError() {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    
    loadingState.classList.add('hidden');
    errorState.classList.remove('hidden');
    errorState.classList.add('animate-pop');
}

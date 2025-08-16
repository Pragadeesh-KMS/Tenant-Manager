// DOM elements
const backBtn = document.getElementById('back-btn');
const manageRentBtn = document.getElementById('manage-rent');
const profileBtn = document.getElementById('profile');
const settingsBtn = document.getElementById('settings');
const logoutBtn = document.getElementById('logout');
const userNameEl = document.getElementById('user-display-name');
const userAvatarEl = document.getElementById('user-avatar-text');

let userProfile = null;

auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load user profile
    try {
        const profileDoc = await db.collection('profiles').doc(user.uid).get();
        if (profileDoc.exists) {
            userProfile = profileDoc.data();
            displayUserInfo(userProfile);
        }
    } catch (error) {
        console.error("Error loading profile: ", error);
    }
});

function displayUserInfo(profile) {
    if (profile.name) {
        userNameEl.textContent = profile.name;
        
        // Get initials for avatar
        const names = profile.name.split(' ');
        let initials = '';
        if (names.length > 0) {
            initials += names[0][0].toUpperCase();
        }
        if (names.length > 1) {
            initials += names[names.length - 1][0].toUpperCase();
        }
        userAvatarEl.textContent = initials || 'U';
    }
}

// Event listeners
backBtn.addEventListener('click', () => {
    window.history.back();
});

profileBtn.addEventListener('click', () => {
    window.location.href = 'profile.html';
});

settingsBtn.addEventListener('click', () => {
    alert('Settings feature coming soon!');
});

logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error("Logout failed: ", error);
        alert('Logout failed. Please try again.');
    });
});
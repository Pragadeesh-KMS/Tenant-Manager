auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Set email from auth
    document.getElementById('user-email').value = user.email;

    // Pre-fill name from Firebase Auth if available
    if (user.displayName) {
    document.getElementById('user-name').value = user.displayName;
    }

    // Load profile if exists
    const profileRef = db.collection('profiles').doc(user.uid);
    const profileDoc = await profileRef.get();
    
    if (profileDoc.exists) {
        const profile = profileDoc.data();
        document.getElementById('user-name').value = profile.name || '';
        document.getElementById('user-phone').value = profile.phone || '';
        document.getElementById('user-age').value = profile.age || '';
    }
});

document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (!user) return;
    
    document.querySelectorAll('.error-message').forEach(el => {
        el.style.display = 'none';
    });
    
    let valid = true;
    const name = document.getElementById('user-name').value.trim();
    const phone = document.getElementById('user-phone').value;
    const age = document.getElementById('user-age').value;
    
    if (!name) {
        document.getElementById('name-error').style.display = 'block';
        valid = false;
    }
    
    if (phone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(phone)) {
        document.getElementById('phone-error').style.display = 'block';
        valid = false;
    }
    
    if (age && (age < 18 || age > 120)) {
        document.getElementById('age-error').style.display = 'block';
        valid = false;
    }
    
    if (!valid) return;
    
    try {
        await db.collection('profiles').doc(user.uid).set({
            name: name,
            phone: phone || '',
            age: age || ''
        });
        
        alert('Profile saved successfully!');
        window.location.href = 'dashboard.html';
    } catch (error) {
        alert('Error saving profile: ' + error.message);
    }
});

document.getElementById('back-btn').addEventListener('click', () => {
    window.location.href = 'dashboard.html';
});
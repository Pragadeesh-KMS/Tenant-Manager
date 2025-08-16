document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    
    emailError.style.display = 'none';
    passwordError.style.display = 'none';
    
    let valid = true;
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailError.style.display = 'block';
        valid = false;
    }
    
    if (password.length < 6) {
        passwordError.style.display = 'block';
        valid = false;
    }
    
    if (!valid) return;
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Check if profile exists
        const profileRef = db.collection('profiles').doc(user.uid);
        const profileDoc = await profileRef.get();
        
        if (profileDoc.exists) {
            window.location.href = 'dashboard.html';
        } else {
            window.location.href = 'profile.html';
        }
    } catch (error) {
        alert(`Login failed: ${error.message}`); // Remove signup attempt
    }
});
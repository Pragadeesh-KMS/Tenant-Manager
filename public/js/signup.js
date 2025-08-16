// DOM elements
const signupForm = document.getElementById('signupForm');
const signupAlert = document.getElementById('signup-alert');
const passwordToggle = document.querySelector('.toggle-password');
const passwordInput = document.getElementById('signup-password');
const strengthMeter = document.getElementById('password-strength-meter');
const signupButton = document.getElementById('signup-button');
const signupSpinner = document.getElementById('signup-spinner');

// Password strength variables
const requirements = {
  length: document.getElementById('length-requirement'),
  number: document.getElementById('number-requirement'),
  uppercase: document.getElementById('uppercase-requirement'),
  special: document.getElementById('special-requirement')
};

// Password visibility toggle
passwordToggle.addEventListener('click', function () {
  const input = document.getElementById(this.dataset.target);
  if (input.type === 'password') {
    input.type = 'text';
    this.textContent = '🔒';
  } else {
    input.type = 'password';
    this.textContent = '👁️';
  }
});

// Password strength checker
passwordInput.addEventListener('input', function() {
  const password = this.value;
  let strength = 0;
  
  // Reset requirements
  Object.values(requirements).forEach(req => req.classList.remove('valid'));
  
  // Check length
  if (password.length >= 8) {
    requirements.length.classList.add('valid');
    strength += 25;
  }
  
  // Check for numbers
  if (/\d/.test(password)) {
    requirements.number.classList.add('valid');
    strength += 25;
  }
  
  // Check for uppercase
  if (/[A-Z]/.test(password)) {
    requirements.uppercase.classList.add('valid');
    strength += 25;
  }
  
  // Check for special characters
  if (/[^A-Za-z0-9]/.test(password)) {
    requirements.special.classList.add('valid');
    strength += 25;
  }
  
  // Update strength meter
  strengthMeter.style.width = `${strength}%`;
  strengthMeter.style.backgroundColor = strength < 50 ? '#ef476f' : 
                                       strength < 75 ? '#ffd166' : '#06d6a0';
});

// Grab the other inputs
const nameInput  = document.getElementById('signup-name');
const emailInput = document.getElementById('signup-email');

// This function checks all fields & toggles the button
function updateButtonState() {
    const nameFilled   = nameInput.value.trim().length > 0;
    const emailValid   = validateEmail(emailInput.value.trim());
    const pwdStrength  = parseInt(strengthMeter.style.width, 10) || 0;
    const pwdStrongest = pwdStrength === 100;

    signupButton.disabled = !(nameFilled && emailValid && pwdStrongest);
}

// Wire it up on every change
[nameInput, emailInput, passwordInput].forEach(el =>
el.addEventListener('input', updateButtonState)
);


// Form submission handler
signupForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  
  // Get form values
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  
  // Show loading state
  signupButton.disabled = true;
  signupSpinner.style.display = 'block';
  
  try {
    // Create user with Firebase Auth
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Save additional user data to Firestore
    await db.collection('profiles').doc(user.uid).set({
      name: name,
      email: email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Show success message
    showSuccess('Account created successfully! Redirecting to your profile...');
    
    // Redirect to profile page
    setTimeout(() => {
      window.location.href = 'profile.html';
    }, 1500);
    
  } catch (error) {
    console.error('Signup error:', error);
    showError(`Signup failed: ${error.message}`);
  } finally {
    signupButton.disabled = false;
    signupSpinner.style.display = 'none';
  }
});

// Helper functions
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function showError(message) {
  signupAlert.textContent = message;
  signupAlert.className = 'alert alert-danger';
  signupAlert.style.display = 'block';
  
  // Scroll to alert
  signupAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showSuccess(message) {
  signupAlert.textContent = message;
  signupAlert.className = 'alert alert-success';
  signupAlert.style.display = 'block';
}
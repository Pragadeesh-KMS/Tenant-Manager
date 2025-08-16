const backBtn = document.getElementById('back-btn');
const cancelBtn = document.getElementById('cancel-btn');
const tenantForm = document.getElementById('tenant-form');
const utilitiesContainer = document.getElementById('utilities-container');
const addUtilityBtn = document.getElementById('add-utility-btn');
const newUtilityInput = document.getElementById('new-utility');
const saveBtn = document.getElementById('save-btn');
const formTitle = document.getElementById('form-title');

let currentUser = null;
let currentTenant = null;

// Add this function above the form submission handler:
function calculateInitialPendingAmount(startDateString, monthlyRent, monthlyBills) {
    if (!startDateString) return 0;
    
    const today = new Date();
    const startDate = new Date(startDateString);
    if (startDate > today) return 0;
    
    // Calculate months between start date and today
    const months = (today.getFullYear() - startDate.getFullYear()) * 12 + 
                    (today.getMonth() - startDate.getMonth());
    
    const totalMonthly = (monthlyRent || 0) + (monthlyBills || 0);
    return Math.max(0, months) * totalMonthly;
}

// Check if we're editing an existing tenant
const urlParams = new URLSearchParams(window.location.search);
const tenantId = urlParams.get('editId');

auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = user;
    
    if (tenantId) {
        // Edit mode - load tenant data
        formTitle.textContent = 'Edit Tenant';
        saveBtn.textContent = 'Update Tenant';
        
        try {
            const doc = await db.collection('tenants')
                .doc(tenantId)
                .get();
            
            if (doc.exists) {
                currentTenant = { id: doc.id, ...doc.data() };
                populateForm(currentTenant);
            }
        } catch (error) {
            console.error("Error loading tenant: ", error);
            alert('Failed to load tenant data');
        }
    }
});

// Populate form with existing data
function populateForm(tenant) {
    document.getElementById('tenant-name').value = tenant.name || '';
    document.getElementById('tenant-age').value = tenant.age || '';
    document.getElementById('tenant-nationality').value = tenant.nationality || '';
    document.getElementById('tenant-phone').value = tenant.phone || '';
    document.getElementById('tenant-email').value = tenant.email || '';
    document.getElementById('tenant-profession').value = tenant.profession || '';
    document.getElementById('apartment-name').value = tenant.apartmentName || '';
    document.getElementById('unit-number').value = tenant.unitNumber || '';
    document.getElementById('place').value = tenant.place || '';
    document.getElementById('advance-amount').value = tenant.advanceAmount || '';
    document.getElementById('monthly-rent').value = tenant.monthlyRent || '';
    document.getElementById('monthly-bills').value = tenant.monthlyBills || '';
    document.getElementById('rent-day').value = tenant.rentDay || '';
    document.getElementById('rent-due-day').value = tenant.rentDueDay || '';
    document.getElementById('start-period').value = tenant.startPeriod || '';
    document.getElementById('end-period').value = tenant.endPeriod || '';
    document.getElementById('emergency-name').value = tenant.emergencyName || '';
    document.getElementById('emergency-relation').value = tenant.emergencyRelation || '';
    document.getElementById('emergency-phone').value = tenant.emergencyPhone || '';
    
    // Populate utilities
    if (tenant.utilities && tenant.utilities.length > 0) {
        tenant.utilities.forEach(utility => {
            addUtility(utility);
        });
    }
}

// Add utility to UI
function addUtility(utility) {
    const utilityTag = document.createElement('div');
    utilityTag.className = 'utility-tag';
    utilityTag.innerHTML = `
        ${utility}
        <i class="fas fa-times remove-utility"></i>
    `;
    
    utilitiesContainer.appendChild(utilityTag);
    
    utilityTag.querySelector('.remove-utility').addEventListener('click', () => {
        utilityTag.remove();
    });
}

// Event listeners
backBtn.addEventListener('click', () => {
    window.location.href = tenantId ? 'view-tenant.html?tenantId=' + tenantId : 'dashboard.html';
});

cancelBtn.addEventListener('click', () => {
    window.location.href = tenantId ? 'view-tenant.html?tenantId=' + tenantId : 'dashboard.html';
});

addUtilityBtn.addEventListener('click', () => {
    const utility = newUtilityInput.value.trim();
    if (!utility) return;
    
    addUtility(utility);
    newUtilityInput.value = '';
});

// Form validation
tenantForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset errors
    document.querySelectorAll('.error-message').forEach(el => {
        el.style.display = 'none';
    });
    
    let valid = true;
    
    // Validate required fields
    const requiredFields = [
        'tenant-name', 'tenant-phone', 'apartment-name', 
        'unit-number', 'monthly-rent', 'rent-day', 'rent-due-day', 'start-period'
    ];
    
    requiredFields.forEach(field => {
        const element = document.getElementById(field);
        if (!element.value.trim()) {
            document.getElementById(`${field}-error`).style.display = 'block';
            valid = false;
        }
    });
    
    // Validate rent day
    const rentDay = parseInt(document.getElementById('rent-day').value);
    if (rentDay < 1 || rentDay > 31) {
        document.getElementById('rent-day-error').style.display = 'block';
        valid = false;
    }
    
    // Validate due day
    const dueDay = parseInt(document.getElementById('rent-due-day').value);
    if (dueDay < 1 || dueDay > 31) {
        document.getElementById('due-day-error').style.display = 'block';
        valid = false;
    }
    
    // Validate rent amount
    const rentAmount = parseFloat(document.getElementById('monthly-rent').value);
    if (rentAmount < 1) {
        document.getElementById('rent-error').style.display = 'block';
        valid = false;
    }
    
    // Validate age
    const age = document.getElementById('tenant-age').value;
    if (age && (age < 18 || age > 120)) {
        document.getElementById('age-error').style.display = 'block';
        valid = false;
    }
    
    // Validate email
    const email = document.getElementById('tenant-email').value;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('email-error').style.display = 'block';
        valid = false;
    }

    // Validate end date
    const startPeriod = document.getElementById('start-period').value;
    const endPeriod = document.getElementById('end-period').value;
    
    if (endPeriod && endPeriod < startPeriod) {
        document.getElementById('end-period-error').style.display = 'block';
        valid = false;
    }
    
    if (!valid) return;
    
    // Get all utilities
    const utilities = [];
    document.querySelectorAll('.utility-tag').forEach(tag => {
        utilities.push(tag.textContent.replace('×', '').trim());
    });

    const monthlyRent = parseFloat(document.getElementById('monthly-rent').value);
    const monthlyBills = parseFloat(document.getElementById('monthly-bills').value) || 0;
    
    // Create tenant object
    const tenantData = {
        
        ownerId: currentUser.uid,
        name: document.getElementById('tenant-name').value,
        age: document.getElementById('tenant-age').value || null,
        nationality: document.getElementById('tenant-nationality').value || '',
        phone: document.getElementById('tenant-phone').value,
        email: document.getElementById('tenant-email').value || '',
        profession: document.getElementById('tenant-profession').value || '',
        apartmentName: document.getElementById('apartment-name').value,
        unitNumber: document.getElementById('unit-number').value,
        place: document.getElementById('place').value || '',
        advanceAmount: parseFloat(document.getElementById('advance-amount').value) || 0,
        monthlyRent: parseFloat(document.getElementById('monthly-rent').value),
        monthlyBills: parseFloat(document.getElementById('monthly-bills').value) || 0,
        rentDay: parseInt(document.getElementById('rent-day').value),
        rentDueDay: parseInt(document.getElementById('rent-due-day').value),
        utilities: utilities,
        startPeriod: document.getElementById('start-period').value,
        endPeriod: document.getElementById('end-period').value || '',
        emergencyName: document.getElementById('emergency-name').value || '',
        emergencyRelation: document.getElementById('emergency-relation').value || '',
        emergencyPhone: document.getElementById('emergency-phone').value || '',
        monthlyRent: monthlyRent,
        monthlyBills: monthlyBills,
        pendingAmount: 0,
        paymentData: {},
        rentChanges: [],
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        if (tenantId) {
            // Update existing tenant
            await db.collection('tenants').doc(tenantId).update(tenantData);
            alert('Tenant updated successfully!');
            window.location.href = `view-tenant.html?tenantId=${tenantId}`;
        } else {
            // Add new tenant
            const docRef = await db.collection('tenants').add(tenantData);
            alert('Tenant added successfully!');
            window.location.href = `view-tenant.html?tenantId=${docRef.id}`;
        }
    } catch (error) {
        console.error("Full error:", error);
        alert(`Failed to save: ${error.message}`);
    }
});
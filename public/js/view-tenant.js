// DOM elements
const backBtn = document.getElementById('back-btn');
const editBtn = document.getElementById('edit-btn');
const deleteBtn = document.getElementById('delete-btn');
const tenantNameEl = document.getElementById('detail-tenant-name');
const locationEl = document.getElementById('detail-location');
const personalDetailsEl = document.getElementById('personal-details');
const emergencyDetailsEl = document.getElementById('emergency-details');
const rentalDetailsEl = document.getElementById('rental-details');
const rentCardsContainer = document.getElementById('rent-cards-container');
const tabs = document.querySelectorAll('.tenant-tab');
const otherChargesInput = document.getElementById('other-charges');

let currentUser = null;
let currentTenant = null;
let tenantId = null;

// once the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const selectAll = document.getElementById('select-all-payments');
    if (!selectAll) return;

    selectAll.addEventListener('change', function () {
        document.querySelectorAll('.payment-status-check').forEach(cb => {
            if (cb.checked !== this.checked) {
                cb.checked = this.checked;
                const year = parseInt(cb.dataset.year, 10);
                const month = parseInt(cb.dataset.month, 10);
                const category = cb.dataset.category;
                updatePaymentStatus(year, month, 'combined', this.checked);
            }
        });
    });
});



// Get tenant ID from URL
const urlParams = new URLSearchParams(window.location.search);
tenantId = urlParams.get('tenantId');

auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = user;
    if (!tenantId) {
        alert('No tenant specified');
        window.location.href = 'dashboard.html';
        return;
    }
    
    await loadTenant();
    populateYearDropdown();
});

async function loadTenant() {
    try {
        const doc = await db.collection('tenants')
            .doc(tenantId)
            .get();
        
        if (!doc.exists) {
            alert('Tenant not found');
            window.location.href = 'dashboard.html';
            return;
        }
        
        currentTenant = { id: doc.id, ...doc.data() };
        populateTenantData();
    } catch (error) {
        console.error("Error loading tenant: ", error);
        alert('Error loading tenant data');
    }
}

        function populateTenantData() {
    if (!currentTenant) return;

    tenantNameEl.textContent = currentTenant.name || 'N/A';
    locationEl.textContent = `${currentTenant.apartmentName || 'N/A'} #${currentTenant.unitNumber || 'N/A'}`;

    // Personal details
    personalDetailsEl.innerHTML = `
        <div class="detail-item">
            <div class="detail-label">Age</div>
            <div class="detail-value">${currentTenant.age || 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Nationality</div>
            <div class="detail-value">${currentTenant.nationality || 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Phone</div>
            <div class="detail-value">${currentTenant.phone || 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Email</div>
            <div class="detail-value">${currentTenant.email || 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Profession</div>
            <div class="detail-value">${currentTenant.profession || 'N/A'}</div>
        </div>
    `;

    // Emergency contact
    emergencyDetailsEl.innerHTML = `
        <div class="detail-item">
            <div class="detail-label">Name</div>
            <div class="detail-value">${currentTenant.emergencyName || 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Relationship</div>
            <div class="detail-value">${currentTenant.emergencyRelation || 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Phone</div>
            <div class="detail-value">${currentTenant.emergencyPhone || 'N/A'}</div>
        </div>
    `;

    // Calculate next payment date
    const nextPayment = getNextPaymentDate(currentTenant);

    const startDateStr = currentTenant.startPeriod
    ? new Date(currentTenant.startPeriod).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'N/A';

    const endDateStr = currentTenant.endPeriod
    ? new Date(currentTenant.endPeriod).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'N/A';

    
    // Rental details
    rentalDetailsEl.innerHTML = `
        <div class="detail-item">
            <div class="detail-label">Apartment</div>
            <div class="detail-value">${currentTenant.apartmentName || 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Unit Number</div>
            <div class="detail-value">${currentTenant.unitNumber || 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Place</div>
            <div class="detail-value">${currentTenant.place || 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Lease Start</div>
            <div class="detail-value">${startDateStr}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Lease End</div>
            <div class="detail-value">${endDateStr}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Advance Paid</div>
            <div class="detail-value">$${currentTenant.advanceAmount || '0'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Monthly Rent</div>
            <div class="detail-value">$${currentTenant.monthlyRent || '0'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Monthly Bills</div>
            <div class="detail-value">$${currentTenant.monthlyBills || '0'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Rent Day</div>
            <div class="detail-value">${currentTenant.rentDay || 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Rent Due Day</div>
            <div class="detail-value">${currentTenant.rentDueDay || 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Pending Amount</div>
            <div class="detail-value pending-amount">$${currentTenant.pendingAmount || '0'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Next Payment</div>
            <div class="detail-value ${nextPayment.class}">${nextPayment.text}</div>
        </div>
        
    `;

    // Rent cards
    renderRentCards();
    
}

// In view-tenant.html and dashboard.html
function getNextPaymentDate(tenant) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (tenant.endPeriod) {
        const endDate = new Date(tenant.endPeriod);
        endDate.setHours(0, 0, 0, 0);
        
        if (endDate < today) {
            return {
                text: 'ACCOUNT CLOSED',
                class: 'account-closed'
            };
        }
        
        // Check if end date is in the current month
        const endMonth = endDate.getMonth();
        const endYear = endDate.getFullYear();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        if (endYear === currentYear && endMonth === currentMonth) {
            return {
                text: 'SOON TO BE CLOSED',
                class: 'account-closed'
            };
        }
    }
    
    let nextPaymentDate = new Date(today.getFullYear(), today.getMonth(), tenant.rentDay);
    
    if (today > nextPaymentDate) {
        nextPaymentDate = new Date(today.getFullYear(), today.getMonth() + 1, tenant.rentDay);
    }
    
    return {
        text: nextPaymentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        class: ''
    };
}


// Add this helper function
function calculateMonthlyRentForMonth(tenant, year, month) {
    const monthlyRent = tenant.monthlyRent || 0;
    const monthlyBills = tenant.monthlyBills || 0;
    const totalMonthly = monthlyRent + monthlyBills;
    
    const today = new Date();
    const startDate = new Date(tenant.startPeriod);
    const endDate = tenant.endPeriod ? new Date(tenant.endPeriod) : today;
    
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const daysInMonth = monthEnd.getDate();
    
    // Start month calculation
    if (year === startDate.getFullYear() && month === startDate.getMonth()) {
        const daysStayed = daysInMonth - startDate.getDate() + 1;
        return (totalMonthly / daysInMonth) * daysStayed;
    }
    
    // End month calculation
    if (endDate && year === endDate.getFullYear() && month === endDate.getMonth()) {
        const daysStayed = endDate.getDate();
        return (totalMonthly / daysInMonth) * daysStayed;
    }
    
    // Full month calculation
    return totalMonthly;
}

// Update renderRentCards function
// Update renderRentCards function
async function renderRentCards() {
    rentCardsContainer.innerHTML = '';
    
    if (!currentTenant.startPeriod) {
        rentCardsContainer.innerHTML = '<div class="no-data">No rent data available</div>';
        return;
    }
    
    const startDate = new Date(currentTenant.startPeriod);
    const today = new Date();
    let endDate = currentTenant.endPeriod ? new Date(currentTenant.endPeriod) : today;
    
    // Use the earlier date between endPeriod and today
    const calcEndDate = endDate < today ? endDate : today;
    
    // Calculate months between start and end (inclusive)
    let months = (calcEndDate.getFullYear() - startDate.getFullYear()) * 12 +
                 (calcEndDate.getMonth() - startDate.getMonth()) + 1;
    
    const rentCards = [];
    let pendingTotal = 0;
    
    for (let i = 0; i < months; i++) {
        const currentDate = new Date(startDate);
        currentDate.setMonth(startDate.getMonth() + i);
        

        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const endMonth = calcEndDate.getMonth();
        const endYear = calcEndDate.getFullYear();

        if (currentYear > endYear || (currentYear === endYear && currentMonth > endMonth)) {
            break;
        }
    
        
        const monthName = currentDate.toLocaleString('default', { month: 'long' });
        const year = currentDate.getFullYear();
        const monthIndex = currentDate.getMonth();
        
        // Get payment data for this month
        const paymentData = currentTenant.paymentData?.[year]?.[monthIndex] || {
            rent: false,
            maintenance: false,
            otherCharges: 0
        };
        
        const otherCharges = paymentData.otherCharges || 0;
        const rentAmount = calculateMonthlyRentForMonth(currentTenant, year, monthIndex);
        const totalAmount = rentAmount + otherCharges;
        
        // Add to pending if unpaid
        if (!paymentData.rent || !paymentData.maintenance) {
            pendingTotal += totalAmount;
        }
        
        const rentCard = document.createElement('div');
        rentCard.className = 'rent-card';
        // inside renderRentCards(), replace rentCard.innerHTML with:

        rentCard.innerHTML = `
            <div class="rent-card-header">${monthName} ${year}</div>
            <!-- FIRST LINE: your original summary + checkbox + total amount -->
            <div class="rent-card-row" style="display: flex; justify-content: space-between; align-items: center;">
                <div class="rent-item-label">Rent + Maintenance + Other</div>
                <div class="payment-status" style="display: flex; align-items: center;">
                <input
                    type="checkbox"
                    class="payment-status-check"
                    data-year="${year}"
                    data-month="${monthIndex}"
                    data-category="combined"
                    ${paymentData.rent ? 'checked' : ''}
                />
                <span class="rent-item-value" style="margin-left: 8px;">$${totalAmount.toFixed(2)}</span>
                </div>
            </div>

            <!-- SECOND LINE: Other charges input + toggle button -->
            <div class="rent-card-row" style="margin-top: 8px; display: flex; align-items: center;">
                <label for="other-${year}-${monthIndex}" style="margin-right: 8px;">Other charges</label>
                <input
                type="number"
                min="0"
                value="${otherCharges || 0}"
                id="other-${year}-${monthIndex}"
                class="other-charges-input"
                style="width: 80px; padding: 4px; border: 1px solid var(--gray-300); border-radius: 4px;"
                />
                <button
                type="button"
                id="toggle-${year}-${monthIndex}"
                class="other-toggle-btn${otherCharges ? ' included' : ''}"
                title="Include Other Charges"
                style="width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--gray-300); margin-left: 8px;"
                >+</button>
            </div>
        `;

        
        rentCardsContainer.prepend(rentCard);
        // grab the new elements
        const inputEl  = rentCard.querySelector(`#other-${year}-${monthIndex}`);
        const toggleBtn = rentCard.querySelector(`#toggle-${year}-${monthIndex}`);

        // ensure initial state reflects saved data
        if (currentTenant.paymentData?.[year]?.[monthIndex]?.otherCharges > 0) {
        toggleBtn.classList.add('included');
        }

        toggleBtn.addEventListener('click', async () => {
        const val = parseFloat(inputEl.value) || 0;
        const isNowIncluded = !toggleBtn.classList.toggle('included');

        // toggleBtn.classList.toggle('included') has already flipped the class,
        // so check its presence for our “included” state:
        const included = toggleBtn.classList.contains('included');

        // update in-memory and Firestore
        const newCharge = included ? val : 0;
        if (!currentTenant.paymentData[year]) currentTenant.paymentData[year] = {};
        if (!currentTenant.paymentData[year][monthIndex]) {
            currentTenant.paymentData[year][monthIndex] = { rent: false, maintenance: false, otherCharges: 0 };
        }
        currentTenant.paymentData[year][monthIndex].otherCharges = newCharge;

        await db.collection('tenants')
            .doc(currentTenant.id)
            .update({
            [`paymentData.${year}.${monthIndex}.otherCharges`]: newCharge
            });

        // re-render sums (so “Rent + Maintenance + Other” updates)
        await renderRentCards();
        });

        rentCards.unshift(rentCard);
    }

    // Add event listeners to checkboxes
    document.querySelectorAll('.payment-status-check').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const year = parseInt(this.dataset.year);
            const month = parseInt(this.dataset.month);
            const category = this.dataset.category;
            const checked = this.checked;
            
            updatePaymentStatus(year, month, category, checked);
        });
    });
    
    // Update pending amount in UI and Firestore
    document.querySelector('.pending-amount').textContent = `$${pendingTotal.toFixed(2)}`;
    
    // Update Firestore if pending amount changed
    if (currentTenant.pendingAmount !== pendingTotal) {
        try {
            await db.collection('tenants').doc(currentTenant.id).update({
                pendingAmount: pendingTotal
            });
            currentTenant.pendingAmount = pendingTotal;
        } catch (error) {
            console.error("Error updating pending amount: ", error);
        }
    }
    const allCbs = Array.from(document.querySelectorAll('.payment-status-check'));
    const selectAll = document.getElementById('select-all-payments');
    if (selectAll) {
        const allChecked = allCbs.length > 0 && allCbs.every(cb => cb.checked);
        selectAll.checked = allChecked;
    }

}

// Replace the existing updatePaymentStatus function with this:
async function updatePaymentStatus(year, month, category, status) {
    if (!currentTenant) return;
    
    // Initialize payment data if needed
    if (!currentTenant.paymentData) currentTenant.paymentData = {};
    if (!currentTenant.paymentData[year]) currentTenant.paymentData[year] = {};
    if (!currentTenant.paymentData[year][month]) {
        currentTenant.paymentData[year][month] = {
            rent: false,
            maintenance: false,
            otherCharges: 0
        };
    }
    
    // Update the status
    if (category === 'combined') {
        // Mark both rent and maintenance as paid together
        currentTenant.paymentData[year][month].rent = status;
        currentTenant.paymentData[year][month].maintenance = status;
    } else {
        currentTenant.paymentData[year][month][category] = status;
    }

    // Immediately update Firestore
    try {
        await db.collection('tenants').doc(currentTenant.id).update({
            [`paymentData.${year}.${month}`]: currentTenant.paymentData[year][month]
        });
    } catch (error) {
        console.error("Error updating payment status: ", error);
    }
    calculatePendingAmount();

    
    // Re-render rent cards to recalculate pending amount
    await renderRentCards();
}

function calculatePendingFromUI() {
    let pendingTotal = 0;
    
    // Find all unchecked payment checkboxes
    const unpaidCheckboxes = document.querySelectorAll('.payment-status-check:not(:checked)');
    
    // Sum the amounts from all unchecked items
    unpaidCheckboxes.forEach(checkbox => {
        const amountElement = checkbox.previousElementSibling;
        if (amountElement && amountElement.classList.contains('rent-item-value')) {
            const amountText = amountElement.textContent;
            if (amountText.startsWith('$')) {
                const amountValue = parseFloat(amountText.substring(1));
                if (!isNaN(amountValue)) {
                    pendingTotal += amountValue;
                }
            }
        }
    });
    
    return pendingTotal;
}

function calculatePendingAmount() {
    if (!currentTenant) return;
    
    let pendingTotal = 0;
    
    // Find all unchecked payment checkboxes
    const unpaidCheckboxes = document.querySelectorAll('.payment-status-check:not(:checked)');
    
    // Sum the amounts from all unchecked items
    unpaidCheckboxes.forEach(checkbox => {
        const amountElement = checkbox.previousElementSibling;
        if (amountElement && amountElement.classList.contains('rent-item-value')) {
            const amountText = amountElement.textContent;
            if (amountText.startsWith('$')) {
                const amountValue = parseFloat(amountText.substring(1));
                if (!isNaN(amountValue)) {
                    pendingTotal += amountValue;
                }
            }
        }
    });
    
    currentTenant.pendingAmount = pendingTotal;
    
    // Update the UI
    document.querySelector('.pending-amount').textContent = `$${pendingTotal.toFixed(2)}`;
}

// Tab switching
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show corresponding content
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.style.display = 'none';
        });
        
        const tabId = tab.getAttribute('data-tab');
        document.getElementById(`${tabId}-tab`).style.display = 'block';
    });
});

async function deleteTenant() {
    if (!confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) return;
    
    try {
        await db.collection('tenants').doc(currentTenant.id).delete();
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error("Error deleting tenant: ", error);
        alert('Failed to delete tenant');
    }
}

let isRentTabInitialized = false;

// Update tab switching to persist rent card states
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.style.display = 'none';
        });
        
        const tabId = tab.getAttribute('data-tab');
        const tabElement = document.getElementById(`${tabId}-tab`);
        tabElement.style.display = 'block';
        
        // Initialize rent tab only once
        if (tabId === 'rent' && !isRentTabInitialized) {
            renderRentCards();
            isRentTabInitialized = true;
        }
    });
});



// Helper function to determine tenant status
function getTenantStatus(tenant) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (tenant.endPeriod) {
        const endDate = new Date(tenant.endPeriod);
        endDate.setHours(0, 0, 0, 0);
        
        if (endDate < today) {
            return 'closed';
        }
        
        // Check if end date is in the current month
        const endMonth = endDate.getMonth();
        const endYear = endDate.getFullYear();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        if (endYear === currentYear && endMonth === currentMonth) {
            return 'ending';
        }
    }
    
    if (tenant.startPeriod) {
        const startDate = new Date(tenant.startPeriod);
        startDate.setHours(0, 0, 0, 0);
        
        if (startDate > today) {
            return 'future';
        }
    }
    
    return 'active';
}

// Add real-time listener to maintain updated state
function setupTenantListener() {
    db.collection('tenants').doc(tenantId)
        .onSnapshot((doc) => {
            if (doc.exists) {
                currentTenant = { id: doc.id, ...doc.data() };
                if (isRentTabInitialized) {
                    renderRentCards();
                }
            }
        });
}

// Call this in auth.onAuthStateChanged after loadTenant()
setupTenantListener();

// Event listeners
backBtn.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
});

editBtn.addEventListener('click', () => {
    window.location.href = `add-tenant.html?editId=${currentTenant.id}`;
});

deleteBtn.addEventListener('click', deleteTenant);
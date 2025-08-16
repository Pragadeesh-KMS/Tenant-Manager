auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Load tenants
    loadTenants();
});

async function loadTenants() {
    const user = auth.currentUser;
    if (!user) return;

    const tenantGrid = document.getElementById('tenant-grid');
    tenantGrid.innerHTML = '<div class="no-tenants"><i class="fas fa-users"></i><p>Loading tenants...</p></div>';

    try {
        // Add error logging
        console.log("Loading tenants for user:", user.uid);
        
        const snapshot = await db.collection('tenants')
            .where('ownerId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .get();

        console.log("Query snapshot:", snapshot);

        if (snapshot.empty) {
            tenantGrid.innerHTML = `
                <div class="no-tenants">
                    <i class="fas fa-users"></i>
                    <p>No tenants found. Add your first tenant to get started.</p>
                </div>
            `;
            return;
        }

        const tenants = [];
        snapshot.forEach(doc => {
            console.log("Found tenant:", doc.id, doc.data());
            tenants.push({ id: doc.id, ...doc.data() });
        });

        renderTenants(tenants);
    } catch (error) {
        console.error("Error loading tenants: ", error);
        // Show detailed error message
        tenantGrid.innerHTML = `
            <div class="no-tenants">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error: ${error.message}</p>
                <p>Please try again or check console for details</p>
            </div>
        `;
    }
}

function renderTenants(tenantsToRender) {
    const tenantGrid = document.getElementById('tenant-grid');
    tenantGrid.innerHTML = '';

    tenantsToRender.forEach(tenant => {
        const nextPayment = getNextPaymentDate(tenant);
        const isPaid = tenant.pendingAmount <= 0;
        const status = getTenantStatus(tenant);
        
        const tenantCard = document.createElement('div');
        tenantCard.className = 'tenant-card';
        
        tenantCard.innerHTML = `
            ${tenant.pendingAmount > 0 ? 
                `<div class="status-badge status-pending">PENDING</div>` : 
                `<div class="status-badge status-paid">PAID</div>`
            }
            <div class="tenant-header">
                <div class="tenant-name">${tenant.name}</div>
                <div class="tenant-location">${tenant.apartmentName} #${tenant.unitNumber}</div>
            </div>
            <div class="tenant-details">
                <div>
                    <div class="tenant-label">Phone</div>
                    <div class="tenant-value">${tenant.phone}</div>
                </div>
                <div>
                    <div class="tenant-label">Monthly Rent</div>
                    <div class="tenant-value">$${tenant.monthlyRent}</div>
                </div>
            </div>
            <div class="tenant-footer">
                <div>
                    <div class="tenant-label">Next Payment</div>
                    <div class="tenant-value ${nextPayment.class}">
                        ${nextPayment.text} 
                    </div>
                </div>
                <div>
                    <div class="tenant-label">Pending</div>
                    <div class="tenant-value ${isPaid ? 'paid-amount' : 'pending-amount'}">$${(tenant.pendingAmount || 0).toFixed(2)}</div>
                </div>
            </div>
        `;
        
        tenantCard.addEventListener('click', () => {
            window.location.href = `view-tenant.html?tenantId=${tenant.id}`;
        });
        
        tenantGrid.appendChild(tenantCard);
    });
}

// Add this helper to dashboard.html as well
function getTenantStatus(tenant) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (tenant.endPeriod) {
        const endDate = new Date(tenant.endPeriod);
        endDate.setHours(0, 0, 0, 0);
        
        if (endDate < today) {
            return 'closed';
        }
        
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

document.getElementById('add-tenant-btn').addEventListener('click', () => {
    window.location.href = 'add-tenant.html';
});

document.getElementById('search-input').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const tenantCards = document.querySelectorAll('.tenant-card');
    
    tenantCards.forEach(card => {
        const name = card.querySelector('.tenant-name').textContent.toLowerCase();
        const location = card.querySelector('.tenant-location').textContent.toLowerCase();
        
        if (name.includes(searchTerm) || location.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});

document.getElementById('menu-btn').addEventListener('click', () => {
    window.location.href = 'menu.html';
});
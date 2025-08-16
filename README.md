# Tenant Management System

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Firebase Setup](#firebase-setup)
- [Installation](#installation)
- [Pages & Functionality](#pages--functionality)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)

## Project Overview
Rent Collector is a comprehensive tenant management system that helps property owners track rent payments, manage tenant information, and monitor property details. Built with Firebase as the backend, this web application offers a responsive interface that works across all devices.

## Features
- **User Authentication**: Secure signup/login with Firebase Auth
- **Tenant Management**: Add, view, edit, and delete tenants
- **Rent Tracking**: Monthly rent payment status tracking
- **Dashboard**: Overview of all tenants and pending payments
- **Profile Management**: Update user profile information
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Real-time Updates**: Instant payment status updates
- **Data Export**: Export tenant data (coming soon)

## Firebase Setup
1. Create a Firebase project at [firebase.google.com](https://firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Create a `firebase-config.js` file in your project root with:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
```

## Installation
1. Clone the repository:
```bash
git clone https://github.com/your-username/Tenant-Manager.git
cd Tenant-Manager
```

2. Create `firebase-config.js` with your credentials

3. Start a local server 

## Pages & Functionality

### 1. Authentication
- **login.html**: User login with email/password
- **signup.html**: New user registration with password strength validation

### 2. Dashboard (dashboard.html)
- Overview of all tenants
- Search functionality
- Tenant cards showing payment status
- Add new tenant button

### 3. Add/Edit Tenant (add-tenant.html)
- Three-section form:
  1. Personal details
  2. Rental information
  3. Emergency contact
- Utility management
- Date validation

### 4. Tenant Details (view-tenant.html)
- Dual-tab interface:
  1. Rental Data: Personal, rental, and emergency info
  2. Rent: Monthly payment tracking with checkboxes
- Edit and delete functionality
- Rent calculation based on lease dates

### 5. User Profile (profile.html)
- Update personal information
- Form validation
- Sync with Firebase Auth

### 6. Menu (menu.html)
- Navigation to profile and settings
- Logout functionality
- User avatar with initials


## How It Works

### Authentication Flow
1. Users sign up with email/password
2. Profile data is stored in Firestore
3. On login, users are redirected to dashboard
4. Auth state is checked on all protected pages

### Rent Calculation
```javascript
function calculateMonthlyRentForMonth(tenant, year, month) {
  // Prorated calculation based on lease dates
  if (year === startDate.getFullYear() && month === startDate.getMonth()) {
    // Calculate partial month for start
  }
  if (endDate && year === endDate.getFullYear() && month === endDate.getMonth()) {
    // Calculate partial month for end
  }
  // Full month calculation
  return monthlyRent + monthlyBills;
}
```

### Payment Tracking
- Monthly rent cards generated dynamically
- Checkboxes update payment status in Firestore
- Pending amount calculated in real-time
- "Mark All as Paid" functionality

### Data Management
```javascript
// Example Firestore operation
await db.collection('tenants').doc(tenantId).update({
  [`paymentData.${year}.${month}`]: {
    rent: true,
    maintenance: true,
    otherCharges: 25
  }
});
```

## Dependencies
- Firebase (v9.6.10)
- Font Awesome (v6.0.0)
- Modern CSS (Flexbox, Grid, Variables)

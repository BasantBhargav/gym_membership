// Auth Functions
function switchToRegister() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registerForm').style.display = 'block';
}

function switchToLogin() {
  document.getElementById('registerForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'block';
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    showAlert('loginAlert', 'Logging in...', 'info');
    const result = await AuthAPI.login({ email, password });

    StorageManager.setToken(result.token);
    StorageManager.setOwnerInfo(result.owner);

    showAppUI();
    loadDashboard();
  } catch (error) {
    showAlert('loginAlert', error.message || 'Login failed', 'danger');
  }
}

async function handleRegister(event) {
  event.preventDefault();

  const data = {
    name: document.getElementById('regName').value,
    email: document.getElementById('regEmail').value,
    password: document.getElementById('regPassword').value,
    phone: document.getElementById('regPhone').value,
    gymName: document.getElementById('regGymName').value,
    gymAddress: document.getElementById('regGymAddress').value,
  };

  try {
    showAlert('registerAlert', 'Registering...', 'info');
    const result = await AuthAPI.register(data);

    StorageManager.setToken(result.token);
    StorageManager.setOwnerInfo(result.owner);

    showAppUI();
    loadDashboard();
  } catch (error) {
    showAlert('registerAlert', error.message || 'Registration failed', 'danger');
  }
}

function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    StorageManager.logout();
    showAuthUI();
  }
}

// UI Functions
function showAppUI() {
  document.getElementById('authContainer').style.display = 'none';
  document.getElementById('appContainer').style.display = 'block';
  
  const ownerInfo = StorageManager.getOwnerInfo();
  if (ownerInfo) {
    document.getElementById('ownerNameHeader').textContent = ownerInfo.email;
    document.getElementById('gymNameHeader').textContent = ownerInfo.gymName;
    document.getElementById('gymAddressHeader').textContent = ownerInfo.id || '';
  }
}

function showAuthUI() {
  document.getElementById('appContainer').style.display = 'none';
  document.getElementById('authContainer').style.display = 'block';
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('registerForm').style.display = 'none';
  
  // Clear forms
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
  document.getElementById('regName').value = '';
  document.getElementById('regEmail').value = '';
  document.getElementById('regPassword').value = '';
  document.getElementById('regPhone').value = '';
  document.getElementById('regGymName').value = '';
  document.getElementById('regGymAddress').value = '';
}

function switchTab(tabName) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });

  // Remove active class from all buttons
  document.querySelectorAll('.nav-tabs button').forEach(btn => {
    btn.classList.remove('active');
  });

  // Show selected section
  document.getElementById(tabName).classList.add('active');

  // Mark button as active
  event.target.classList.add('active');

  // Load data for the tab
  if (tabName === 'dashboard') {
    loadDashboard();
  } else if (tabName === 'members') {
    loadMembers();
  } else if (tabName === 'payments') {
    loadPayments();
  }
}

function showAlert(alertId, message, type) {
  const alert = document.getElementById(alertId);
  alert.textContent = message;
  alert.className = `alert show alert-${type}`;
  
  if (type !== 'info') {
    setTimeout(() => {
      alert.classList.remove('show');
    }, 5000);
  }
}

function openModal(modalId) {
  document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('show');
}

// Check if user is logged in on page load
window.addEventListener('DOMContentLoaded', () => {
  const token = StorageManager.getToken();
  if (token) {
    showAppUI();
    loadDashboard();
  } else {
    showAuthUI();
  }
});

/* ============================================================
   INTERNTRACK - GLOBAL APP.JS UTILITIES
   ============================================================ */

// API Fetch Helper with JSON & Error handling
async function apiFetch(endpoint, options = {}) {
  const defaults = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const config = { ...defaults, ...options };
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(endpoint, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 && !window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
        // Redirect unauthorized users to index.html
        window.location.href = 'index.html?auth=required';
        return;
      }
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// Toast Notification System
function showToast(message, type = 'success', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <span style="cursor: pointer; opacity: 0.7; font-size: 1.1rem;" onclick="this.parentElement.remove()">×</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, duration);
}

// Confirmation Modal Dialog
function showConfirmModal({ title = 'Confirm Action', message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm }) {
  const existingModal = document.querySelector('.modal-overlay');
  if (existingModal) existingModal.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content">
      <h3 class="modal-title">${title}</h3>
      <div class="modal-body">${message}</div>
      <div class="modal-actions">
        <button class="btn btn-outline modal-cancel">${cancelText}</button>
        <button class="btn btn-danger modal-confirm">${confirmText}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector('.modal-cancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('.modal-confirm').addEventListener('click', () => {
    overlay.remove();
    if (onConfirm) onConfirm();
  });
}

// Date Formatter (e.g., 2026-08-15 -> Aug 15, 2026)
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return dateString;
}

// Status Badge Generator
function getStatusBadgeHtml(status) {
  const lower = (status || '').toLowerCase();
  let badgeClass = 'badge-applied';

  if (lower === 'shortlisted') badgeClass = 'badge-shortlisted';
  else if (lower === 'interview') badgeClass = 'badge-interview';
  else if (lower === 'selected') badgeClass = 'badge-selected';
  else if (lower === 'rejected') badgeClass = 'badge-rejected';
  else if (lower === 'withdrawn') badgeClass = 'badge-withdrawn';

  return `<span class="badge ${badgeClass}">${status || 'Applied'}</span>`;
}

// Priority Badge Generator
function getPriorityBadgeHtml(priority) {
  const lower = (priority || '').toLowerCase();
  let badgeClass = 'badge-medium';

  if (lower === 'high') badgeClass = 'badge-high';
  else if (lower === 'low') badgeClass = 'badge-low';

  return `<span class="badge ${badgeClass}">${priority || 'Medium'}</span>`;
}

// Global Auth Check for Protected Pages
async function checkAuthAndPopulateUser() {
  const isLandingPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';

  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      const user = data.user;

      // Populate user info in sidebar if present
      const nameElems = document.querySelectorAll('.user-name');
      const emailElems = document.querySelectorAll('.user-email');
      const avatarElems = document.querySelectorAll('.user-avatar');

      nameElems.forEach(el => el.textContent = user.full_name);
      emailElems.forEach(el => el.textContent = user.email);
      avatarElems.forEach(el => {
        const initials = user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        el.textContent = initials || 'US';
      });

      // If logged in and on index.html, auto-redirect to dashboard.html
      if (isLandingPage) {
        window.location.href = 'dashboard.html';
      }
    } else {
      if (!isLandingPage) {
        window.location.href = 'index.html?auth=required';
      }
    }
  } catch (err) {
    if (!isLandingPage) {
      window.location.href = 'index.html?auth=required';
    }
  }
}

// Logout Handler
async function handleLogout() {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    showToast('Logged out successfully.', 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 500);
  } catch (err) {
    showToast('Failed to log out.', 'error');
  }
}

// Setup Mobile Sidebar Toggle & Logout Buttons on Load
document.addEventListener('DOMContentLoaded', () => {
  // Mobile sidebar toggle
  const toggleBtn = document.getElementById('mobile-toggle-btn');
  const sidebar = document.querySelector('.sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  // Logout buttons
  const logoutBtns = document.querySelectorAll('.logout-btn');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  });

  // Run Auth Check
  checkAuthAndPopulateUser();
});

/* ============================================================
   INTERNTRACK - APPLICATIONS.JS
   ============================================================ */

let allApplications = [];

document.addEventListener('DOMContentLoaded', () => {
  loadApplications();
  setupEventListeners();
});

async function loadApplications() {
  try {
    const searchVal = document.getElementById('search-input')?.value || '';
    const statusVal = document.getElementById('status-filter')?.value || 'All';
    const priorityVal = document.getElementById('priority-filter')?.value || 'All';
    const workmodeVal = document.getElementById('workmode-filter')?.value || 'All';
    const sortVal = document.getElementById('sort-filter')?.value || 'Newest First';

    const queryParams = new URLSearchParams({
      search: searchVal,
      status: statusVal,
      priority: priorityVal,
      work_mode: workmodeVal,
      sort: sortVal
    });

    allApplications = await apiFetch(`/api/applications?${queryParams.toString()}`);
    renderApplications(allApplications);
  } catch (error) {
    console.error('Error loading applications:', error);
    showToast('Failed to load applications from database.', 'error');
  }
}

function setupEventListeners() {
  const searchInput = document.getElementById('search-input');
  const statusFilter = document.getElementById('status-filter');
  const priorityFilter = document.getElementById('priority-filter');
  const workmodeFilter = document.getElementById('workmode-filter');
  const sortFilter = document.getElementById('sort-filter');

  let debounceTimer;
  searchInput?.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadApplications, 300);
  });

  statusFilter?.addEventListener('change', loadApplications);
  priorityFilter?.addEventListener('change', loadApplications);
  workmodeFilter?.addEventListener('change', loadApplications);
  sortFilter?.addEventListener('change', loadApplications);
}

function renderApplications(apps) {
  const tbody = document.getElementById('applications-tbody');
  const mobileContainer = document.getElementById('applications-mobile-cards');
  const countBadge = document.getElementById('app-count-badge');

  if (countBadge) {
    countBadge.textContent = `Showing ${apps.length} Internship Application${apps.length === 1 ? '' : 's'}`;
  }

  if (apps.length === 0) {
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 3rem; color: var(--muted-text);">
            No matching internship applications found.
          </td>
        </tr>
      `;
    }
    if (mobileContainer) {
      mobileContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--muted-text);">
          No matching internship applications found.
        </div>
      `;
    }
    return;
  }

  // Desktop Table Render
  if (tbody) {
    tbody.innerHTML = apps.map(app => `
      <tr>
        <td><strong>${app.company_name}</strong></td>
        <td>${app.position}</td>
        <td>${app.location || 'N/A'} <span class="badge badge-mode" style="margin-left: 0.35rem; font-size: 0.7rem;">${app.work_mode}</span></td>
        <td>${getStatusBadgeHtml(app.status)}</td>
        <td>${getPriorityBadgeHtml(app.priority)}</td>
        <td>${formatDate(app.applied_date)}</td>
        <td>${app.deadline ? formatDate(app.deadline) : 'N/A'}</td>
        <td>
          <div style="display: flex; gap: 0.35rem;">
            <a href="application-details.html?id=${app.id}" class="btn btn-outline btn-sm">View</a>
            <a href="add-application.html?id=${app.id}" class="btn btn-secondary btn-sm">Edit</a>
            <button class="btn btn-danger btn-sm" onclick="handleDeleteApp(${app.id}, '${escapeQuotes(app.company_name)}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // Mobile Cards Render
  if (mobileContainer) {
    mobileContainer.innerHTML = apps.map(app => `
      <div class="card" style="margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
          <div>
            <h3 style="font-size: 1.1rem; color: var(--primary-black);">${app.company_name}</h3>
            <div style="font-size: 0.9rem; color: var(--secondary-text);">${app.position}</div>
          </div>
          <div>${getStatusBadgeHtml(app.status)}</div>
        </div>
        <div style="font-size: 0.82rem; color: var(--muted-text); margin-bottom: 0.85rem;">
          📍 ${app.location || 'Remote'} • ${app.work_mode} | Applied: ${formatDate(app.applied_date)}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--light-border); padding-top: 0.75rem;">
          <div>${getPriorityBadgeHtml(app.priority)}</div>
          <div style="display: flex; gap: 0.35rem;">
            <a href="application-details.html?id=${app.id}" class="btn btn-outline btn-sm">View</a>
            <a href="add-application.html?id=${app.id}" class="btn btn-secondary btn-sm">Edit</a>
            <button class="btn btn-danger btn-sm" onclick="handleDeleteApp(${app.id}, '${escapeQuotes(app.company_name)}')">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  }
}

function escapeQuotes(str) {
  return (str || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function handleDeleteApp(id, companyName) {
  showConfirmModal({
    title: 'Delete Application',
    message: `Are you sure you want to delete your application for <strong>${companyName}</strong>? This action cannot be undone.`,
    confirmText: 'Delete',
    onConfirm: async () => {
      try {
        await apiFetch(`/api/applications/${id}`, { method: 'DELETE' });
        showToast('Application deleted successfully.', 'success');
        loadApplications();
      } catch (err) {
        showToast('Failed to delete application.', 'error');
      }
    }
  });
}

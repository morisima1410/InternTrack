/* ============================================================
   INTERNTRACK - DETAILS.JS
   ============================================================ */

let currentAppId = null;
let currentApp = null;

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  currentAppId = urlParams.get('id');

  if (!currentAppId) {
    showToast('No application ID specified.', 'error');
    setTimeout(() => window.location.href = 'applications.html', 1000);
    return;
  }

  loadApplicationDetails(currentAppId);
  setupDetailsEventListeners();
});

async function loadApplicationDetails(id) {
  try {
    currentApp = await apiFetch(`/api/applications/${id}`);
    renderDetails(currentApp);
    renderTimeline(currentApp.status);
  } catch (error) {
    console.error('Error loading application details:', error);
    showToast('Failed to load application details.', 'error');
  }
}

function renderDetails(app) {
  // Page Title
  document.getElementById('detail-company-name').textContent = app.company_name;
  document.getElementById('detail-position').textContent = app.position;

  // Edit Link
  const editBtn = document.getElementById('edit-app-btn');
  if (editBtn) editBtn.href = `add-application.html?id=${app.id}`;

  // Overview Info
  document.getElementById('info-company').textContent = app.company_name;
  document.getElementById('info-position').textContent = app.position;
  document.getElementById('info-location').textContent = app.location || 'Not Specified';
  document.getElementById('info-workmode').textContent = app.work_mode || 'Remote';

  // Logistics
  document.getElementById('info-status-badge').innerHTML = getStatusBadgeHtml(app.status);
  document.getElementById('info-priority-badge').innerHTML = getPriorityBadgeHtml(app.priority);
  document.getElementById('info-applied-date').textContent = formatDate(app.applied_date);
  document.getElementById('info-deadline').textContent = app.deadline ? formatDate(app.deadline) : 'No Deadline';
  document.getElementById('info-stipend').textContent = app.stipend || 'Not Specified';

  const urlEl = document.getElementById('info-app-url');
  if (urlEl) {
    if (app.application_url) {
      urlEl.innerHTML = `<a href="${app.application_url}" target="_blank" rel="noopener noreferrer" style="color: var(--primary-black); font-weight: 700; text-decoration: underline;">Open Portal ↗</a>`;
    } else {
      urlEl.textContent = 'No URL Provided';
    }
  }

  // Quick status selector match
  const statusSelect = document.getElementById('quick-status-select');
  if (statusSelect) statusSelect.value = app.status;

  // Interview Info
  document.getElementById('info-interview-date').textContent = app.interview_date ? formatDate(app.interview_date) : 'Not Scheduled';
  document.getElementById('info-interview-time').textContent = app.interview_time || '-';

  // Contact Info
  document.getElementById('info-contact-person').textContent = app.contact_person || 'Not Specified';
  document.getElementById('info-contact-email').textContent = app.contact_email || 'Not Specified';

  // Notes
  const notesEl = document.getElementById('info-notes');
  if (notesEl) {
    notesEl.textContent = app.notes || 'No preparation notes recorded yet.';
  }
}

function renderTimeline(currentStatus) {
  const container = document.getElementById('status-timeline-container');
  if (!container) return;

  const statusLower = (currentStatus || '').toLowerCase();

  if (statusLower === 'rejected') {
    container.innerHTML = `
      <div class="timeline">
        <div class="timeline-step completed">
          <div class="timeline-circle">✓</div>
          <div class="timeline-title">Created</div>
        </div>
        <div class="timeline-step completed">
          <div class="timeline-circle">✓</div>
          <div class="timeline-title">Applied</div>
        </div>
        <div class="timeline-step rejected">
          <div class="timeline-circle">✕</div>
          <div class="timeline-title">Rejected</div>
        </div>
      </div>
    `;
    return;
  }

  const steps = [
    { key: 'applied', label: 'Applied' },
    { key: 'shortlisted', label: 'Shortlisted' },
    { key: 'interview', label: 'Interview' },
    { key: 'selected', label: 'Selected' }
  ];

  const orderMap = { 'applied': 1, 'shortlisted': 2, 'interview': 3, 'selected': 4, 'withdrawn': 0 };
  const currentLevel = orderMap[statusLower] || 1;

  container.innerHTML = `
    <div class="timeline">
      <div class="timeline-step completed">
        <div class="timeline-circle">✓</div>
        <div class="timeline-title">Created</div>
      </div>
      ${steps.map((step, idx) => {
        const stepLevel = idx + 1;
        let stepClass = '';
        let circleContent = stepLevel;

        if (stepLevel < currentLevel) {
          stepClass = 'completed';
          circleContent = '✓';
        } else if (stepLevel === currentLevel) {
          stepClass = 'active';
          circleContent = '●';
        }

        return `
          <div class="timeline-step ${stepClass}">
            <div class="timeline-circle">${circleContent}</div>
            <div class="timeline-title">${step.label}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function setupDetailsEventListeners() {
  // Quick status update button
  const updateBtn = document.getElementById('update-status-btn');
  const statusSelect = document.getElementById('quick-status-select');

  if (updateBtn && statusSelect) {
    updateBtn.addEventListener('click', async () => {
      const newStatus = statusSelect.value;
      try {
        await apiFetch(`/api/applications/${currentAppId}/status`, {
          method: 'PATCH',
          body: { status: newStatus }
        });
        showToast('Application status updated successfully.', 'success');
        loadApplicationDetails(currentAppId);
      } catch (err) {
        showToast('Failed to update status.', 'error');
      }
    });
  }

  // Delete button
  const deleteBtn = document.getElementById('delete-app-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (!currentApp) return;
      showConfirmModal({
        title: 'Delete Application',
        message: `Are you sure you want to delete your application for <strong>${currentApp.company_name}</strong>?`,
        confirmText: 'Delete Application',
        onConfirm: async () => {
          try {
            await apiFetch(`/api/applications/${currentAppId}`, { method: 'DELETE' });
            showToast('Application deleted.', 'success');
            setTimeout(() => {
              window.location.href = 'applications.html';
            }, 500);
          } catch (err) {
            showToast('Failed to delete application.', 'error');
          }
        }
      });
    });
  }
}

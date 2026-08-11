/* ============================================================
   INTERNTRACK - DASHBOARD.JS
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  loadDashboardStats();
});

async function loadDashboardStats() {
  try {
    const stats = await apiFetch('/api/dashboard/stats');
    if (!stats) return;
    renderStats(stats);
    renderStatusOverview(stats);
    renderRecentApplications(stats.recentApplications || []);
    renderUpcomingDeadlines(stats.upcomingDeadlines || []);
    renderUpcomingInterviews(stats.upcomingInterviews || []);
  } catch (error) {
    console.error('Failed to load dashboard statistics:', error);
    showToast('Failed to load dashboard data from database.', 'error');
  }
}

function renderStats(stats = {}) {
  const statTotal = document.getElementById('stat-total');
  const statApplied = document.getElementById('stat-applied');
  const statShortlisted = document.getElementById('stat-shortlisted');
  const statInterviews = document.getElementById('stat-interviews');
  const statSelected = document.getElementById('stat-selected');
  const statRejected = document.getElementById('stat-rejected');
  const statSuccessRate = document.getElementById('stat-success-rate');

  if (statTotal) statTotal.textContent = stats?.total || 0;
  if (statApplied) statApplied.textContent = stats?.applied || 0;
  if (statShortlisted) statShortlisted.textContent = stats?.shortlisted || 0;
  if (statInterviews) statInterviews.textContent = stats?.interview || 0;
  if (statSelected) statSelected.textContent = stats?.selected || 0;
  if (statRejected) statRejected.textContent = stats?.rejected || 0;
  if (statSuccessRate) statSuccessRate.textContent = `${stats?.successRate || 0}%`;
}

function renderStatusOverview(stats = {}) {
  const container = document.getElementById('status-overview-container');
  if (!container) return;

  const total = stats?.total || 0;
  const statuses = [
    { label: 'Applied', count: stats?.applied || 0 },
    { label: 'Shortlisted', count: stats?.shortlisted || 0 },
    { label: 'Interview', count: stats?.interview || 0 },
    { label: 'Selected', count: stats?.selected || 0 },
    { label: 'Rejected', count: stats?.rejected || 0 },
    { label: 'Withdrawn', count: stats?.withdrawn || 0 }
  ];

  container.innerHTML = statuses.map(s => {
    const pct = total > 0 ? ((s.count / total) * 100).toFixed(1) : 0;
    return `
      <div class="progress-item">
        <div class="progress-header">
          <span>${s.label} (${s.count})</span>
          <span>${pct}%</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${pct}%;"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderRecentApplications(apps) {
  const tbody = document.getElementById('recent-apps-tbody');
  if (!tbody) return;

  if (apps.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--muted-text); padding: 2rem;">
          No applications logged yet. <a href="add-application.html" style="font-weight: 700; text-decoration: underline;">+ Add your first internship</a>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = apps.map(app => `
    <tr>
      <td><strong>${app.company_name}</strong></td>
      <td>${app.position}</td>
      <td>${getStatusBadgeHtml(app.status)}</td>
      <td>${getPriorityBadgeHtml(app.priority)}</td>
      <td>${formatDate(app.applied_date)}</td>
      <td>
        <a href="application-details.html?id=${app.id}" class="btn btn-outline btn-sm">View Details</a>
      </td>
    </tr>
  `).join('');
}

function renderUpcomingDeadlines(deadlines) {
  const container = document.getElementById('deadlines-container');
  if (!container) return;

  if (deadlines.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 1.5rem; color: var(--muted-text); font-size: 0.9rem;">
        No active upcoming deadlines right now.
      </div>
    `;
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  container.innerHTML = deadlines.map(app => {
    const dDate = new Date(app.deadline);
    dDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((dDate - today) / (1000 * 60 * 60 * 24));

    let tagHtml = `<span class="badge badge-mode">${formatDate(app.deadline)}</span>`;
    if (diffDays < 0) {
      tagHtml = `<span class="badge badge-rejected">Deadline Passed</span>`;
    } else if (diffDays <= 3) {
      tagHtml = `<span class="badge badge-high">Deadline Soon (${diffDays} day${diffDays === 1 ? '' : 's'})</span>`;
    }

    return `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 0; border-bottom: 1px solid var(--light-border);">
        <div>
          <div style="font-weight: 700; color: var(--primary-black);">${app.company_name}</div>
          <div style="font-size: 0.82rem; color: var(--muted-text);">${app.position}</div>
        </div>
        <div>${tagHtml}</div>
      </div>
    `;
  }).join('');
}

function renderUpcomingInterviews(interviews) {
  const container = document.getElementById('dashboard-interviews-container');
  if (!container) return;

  if (interviews.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 1.5rem; color: var(--muted-text); font-size: 0.9rem;">
        No upcoming interviews scheduled.
      </div>
    `;
    return;
  }

  container.innerHTML = interviews.map(app => `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 0; border-bottom: 1px solid var(--light-border);">
      <div>
        <div style="font-weight: 700; color: var(--primary-black);">${app.company_name}</div>
        <div style="font-size: 0.82rem; color: var(--secondary-text);">${app.position}</div>
        <div style="font-size: 0.78rem; color: var(--muted-text);">📅 ${formatDate(app.interview_date)} ${app.interview_time ? `at ${app.interview_time}` : ''}</div>
      </div>
      <a href="application-details.html?id=${app.id}" class="btn btn-outline btn-sm">Details</a>
    </div>
  `).join('');
}

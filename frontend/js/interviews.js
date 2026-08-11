/* ============================================================
   INTERNTRACK - INTERVIEWS.JS
   ============================================================ */

let currentTab = 'all';

document.addEventListener('DOMContentLoaded', () => {
  setupInterviewTabs();
  loadInterviews('all');
});

function setupInterviewTabs() {
  const tabs = document.querySelectorAll('.interview-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.dataset.tab;
      loadInterviews(currentTab);
    });
  });
}

async function loadInterviews(tabType) {
  let endpoint = '/api/interviews';
  if (tabType === 'upcoming') endpoint = '/api/interviews/upcoming';
  if (tabType === 'completed') endpoint = '/api/interviews/completed';

  try {
    const interviews = await apiFetch(endpoint);
    renderInterviews(interviews);
  } catch (error) {
    console.error('Error loading interviews:', error);
    showToast('Failed to load interviews.', 'error');
  }
}

function renderInterviews(interviews) {
  const container = document.getElementById('interviews-list-container');
  if (!container) return;

  if (interviews.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 3rem;">
        <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🎙️</div>
        <h3 style="margin-bottom: 0.5rem;">No ${currentTab !== 'all' ? currentTab : ''} interviews found</h3>
        <p style="color: var(--muted-text); margin-bottom: 1.5rem;">Log interview dates and recruiter details under your applications.</p>
        <a href="add-application.html" class="btn btn-primary">+ Add New Application</a>
      </div>
    `;
    return;
  }

  const todayStr = new Date().toISOString().split('T')[0];

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      ${interviews.map(app => {
        const isUpcoming = app.interview_date && app.interview_date >= todayStr;
        const timeDisplay = app.interview_time ? `at ${app.interview_time}` : '';

        return `
          <div class="card" style="margin-bottom: 0;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
              <div>
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.35rem;">
                  <h3 style="font-size: 1.2rem; color: var(--primary-black);">${app.company_name}</h3>
                  ${getStatusBadgeHtml(app.status)}
                  ${isUpcoming ? '<span class="badge badge-high">Upcoming Round</span>' : '<span class="badge badge-mode">Past Round</span>'}
                </div>
                <div style="font-weight: 600; color: var(--secondary-text); font-size: 0.95rem;">${app.position}</div>
              </div>

              <div style="text-align: right;">
                <div style="font-size: 1rem; font-weight: 800; color: var(--primary-black);">
                  📅 ${app.interview_date ? formatDate(app.interview_date) : 'Date TBD'} ${timeDisplay}
                </div>
                <div style="font-size: 0.82rem; color: var(--muted-text); margin-top: 0.2rem;">
                  Location: ${app.location || 'Remote'} (${app.work_mode})
                </div>
              </div>
            </div>

            ${(app.contact_person || app.contact_email) ? `
              <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--light-border); font-size: 0.88rem; color: var(--secondary-text); display: flex; gap: 1.5rem;">
                ${app.contact_person ? `<div><strong>Recruiter / Contact:</strong> ${app.contact_person}</div>` : ''}
                ${app.contact_email ? `<div><strong>Email:</strong> ${app.contact_email}</div>` : ''}
              </div>
            ` : ''}

            ${app.notes ? `
              <div style="margin-top: 0.85rem; background: var(--primary-cream); padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 0.85rem; color: var(--secondary-text);">
                <strong>Prep Notes:</strong> ${app.notes}
              </div>
            ` : ''}

            <div style="margin-top: 1rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
              <a href="application-details.html?id=${app.id}" class="btn btn-outline btn-sm">Full Application Details →</a>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

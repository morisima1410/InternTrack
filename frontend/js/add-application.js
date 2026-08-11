/* ============================================================
   INTERNTRACK - ADD-APPLICATION.JS
   Handles both Create and Edit modes via URL query param (?id=...)
   ============================================================ */

let editAppId = null;

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  editAppId = urlParams.get('id');

  initializeForm();

  if (editAppId) {
    loadApplicationForEdit(editAppId);
  }
});

function initializeForm() {
  const form = document.getElementById('application-form');
  const pageTitle = document.getElementById('form-page-title');
  const pageSubtitle = document.getElementById('form-page-subtitle');
  const submitBtnText = document.getElementById('submit-btn-text');
  const appliedDateInput = document.getElementById('applied_date');

  // Default applied date to today if creating new
  if (!editAppId && appliedDateInput && !appliedDateInput.value) {
    appliedDateInput.value = new Date().toISOString().split('T')[0];
  }

  if (editAppId) {
    if (pageTitle) pageTitle.textContent = 'Edit Application';
    if (pageSubtitle) pageSubtitle.textContent = 'Update your internship status, interview details, or notes.';
    if (submitBtnText) submitBtnText.textContent = 'Update Application';
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await submitApplication();
    }
  });
}

function validateForm() {
  let isValid = true;

  const companyInput = document.getElementById('company');
  const positionInput = document.getElementById('position');
  const appliedDateInput = document.getElementById('applied_date');
  const statusInput = document.getElementById('status');
  const priorityInput = document.getElementById('priority');
  const deadlineInput = document.getElementById('deadline');
  const interviewDateInput = document.getElementById('interview_date');

  // Reset errors
  document.querySelectorAll('.form-control').forEach(el => el.classList.remove('invalid'));

  // Company validation
  if (!companyInput.value.trim()) {
    companyInput.classList.add('invalid');
    isValid = false;
  }

  // Position validation
  if (!positionInput.value.trim()) {
    positionInput.classList.add('invalid');
    isValid = false;
  }

  // Applied date validation
  if (!appliedDateInput.value) {
    appliedDateInput.classList.add('invalid');
    isValid = false;
  }

  // Date Logic Validation: Deadline / Interview date cannot be before Applied Date
  if (appliedDateInput.value) {
    const appliedD = new Date(appliedDateInput.value);

    if (deadlineInput.value) {
      const deadlineD = new Date(deadlineInput.value);
      if (deadlineD < appliedD) {
        deadlineInput.classList.add('invalid');
        const errSpan = deadlineInput.nextElementSibling;
        if (errSpan && errSpan.classList.contains('form-error')) {
          errSpan.textContent = 'Deadline cannot be before Applied Date.';
        }
        isValid = false;
      }
    }

    if (interviewDateInput.value) {
      const interviewD = new Date(interviewDateInput.value);
      if (interviewD < appliedD) {
        interviewDateInput.classList.add('invalid');
        const errSpan = interviewDateInput.nextElementSibling;
        if (errSpan && errSpan.classList.contains('form-error')) {
          errSpan.textContent = 'Interview date cannot be before Applied Date.';
        }
        isValid = false;
      }
    }
  }

  if (!isValid) {
    showToast('Please fix the highlighted errors before saving.', 'error');
  }

  return isValid;
}

async function loadApplicationForEdit(id) {
  try {
    const app = await apiFetch(`/api/applications/${id}`);

    document.getElementById('company').value = app.company_name || '';
    document.getElementById('position').value = app.position || '';
    document.getElementById('location').value = app.location || '';
    document.getElementById('work_mode').value = app.work_mode || 'Remote';
    document.getElementById('application_url').value = app.application_url || '';
    document.getElementById('applied_date').value = app.applied_date || '';
    document.getElementById('deadline').value = app.deadline || '';
    document.getElementById('interview_date').value = app.interview_date || '';
    document.getElementById('interview_time').value = app.interview_time || '';
    document.getElementById('status').value = app.status || 'Applied';
    document.getElementById('priority').value = app.priority || 'Medium';
    document.getElementById('contact_person').value = app.contact_person || '';
    document.getElementById('contact_email').value = app.contact_email || '';
    document.getElementById('stipend').value = app.stipend || '';
    document.getElementById('notes').value = app.notes || '';
  } catch (error) {
    console.error('Failed to load application details for edit:', error);
    showToast('Failed to load application data.', 'error');
  }
}

async function submitApplication() {
  const submitBtn = document.getElementById('submit-btn');
  const btnText = document.getElementById('submit-btn-text');

  if (submitBtn) submitBtn.disabled = true;
  if (btnText) btnText.textContent = editAppId ? 'Updating...' : 'Saving...';

  const formData = {
    company_name: document.getElementById('company').value.trim(),
    position: document.getElementById('position').value.trim(),
    location: document.getElementById('location').value.trim(),
    work_mode: document.getElementById('work_mode').value,
    application_url: document.getElementById('application_url').value.trim(),
    applied_date: document.getElementById('applied_date').value,
    deadline: document.getElementById('deadline').value,
    interview_date: document.getElementById('interview_date').value,
    interview_time: document.getElementById('interview_time').value,
    status: document.getElementById('status').value,
    priority: document.getElementById('priority').value,
    contact_person: document.getElementById('contact_person').value.trim(),
    contact_email: document.getElementById('contact_email').value.trim(),
    stipend: document.getElementById('stipend').value.trim(),
    notes: document.getElementById('notes').value.trim()
  };

  try {
    if (editAppId) {
      await apiFetch(`/api/applications/${editAppId}`, {
        method: 'PUT',
        body: formData
      });
      showToast('Application updated successfully.', 'success');
    } else {
      await apiFetch('/api/applications', {
        method: 'POST',
        body: formData
      });
      showToast('Application added successfully.', 'success');
    }

    setTimeout(() => {
      window.location.href = 'applications.html';
    }, 600);
  } catch (error) {
    showToast(error.message || 'Failed to save application.', 'error');
    if (submitBtn) submitBtn.disabled = false;
    if (btnText) btnText.textContent = editAppId ? 'Update Application' : 'Save Application';
  }
}

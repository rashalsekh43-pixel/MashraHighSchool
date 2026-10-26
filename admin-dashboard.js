document.addEventListener('DOMContentLoaded', async () => {
  const noticeList = document.getElementById('admin-notices');
  const dashboardMessage = document.getElementById('dashboard-message');
  const editor = document.getElementById('notice-editor');
  const form = document.getElementById('notice-form');
  const feedback = document.getElementById('editor-feedback');
  const attachmentForm = document.getElementById('attachment-form');
  let csrf = '';
  let notices = [];
  let editingId = '';

  const api = async (path, options = {}) => {
    const headers = new Headers(options.headers || {});
    if (options.method && options.method !== 'GET') headers.set('X-CSRF-Token', csrf);
    const response = await fetch(path, { ...options, headers, credentials: 'same-origin' });
    if (response.status === 401) {
      window.location.replace('/admin/login');
      throw new Error('Your session has expired. Please sign in again.');
    }
    const result = response.status === 204 ? null : await response.json();
    if (!response.ok) throw new Error(result?.error || 'The request failed.');
    return result;
  };

  const showMessage = (text, isError = false) => {
    dashboardMessage.textContent = text;
    dashboardMessage.classList.toggle('error-message', isError);
    dashboardMessage.hidden = !text;
  };

  const render = () => {
    document.getElementById('total-count').textContent = String(notices.length);
    document.getElementById('published-count').textContent = String(notices.filter((notice) => notice.status === 'published').length);
    document.getElementById('draft-count').textContent = String(notices.filter((notice) => notice.status === 'draft').length);
    if (!notices.length) {
      const empty = document.createElement('p');
      empty.className = 'notice-empty';
      empty.textContent = 'No notices yet. Create a notice to get started.';
      noticeList.replaceChildren(empty);
      return;
    }
    noticeList.replaceChildren(...notices.slice(0, 20).map((notice) => {
      const article = document.createElement('article');
      article.className = 'admin-notice-row';
      const details = document.createElement('div');
      details.className = 'admin-notice-details';
      const title = document.createElement('h3');
      title.textContent = notice.title;
      const meta = document.createElement('p');
      meta.textContent = `${notice.category} · ${notice.publicationDate} · Updated ${new Date(notice.updatedAt).toLocaleString()}`;
      const state = document.createElement('span');
      state.className = `status-pill ${notice.status}`;
      state.textContent = notice.status;
      details.append(title, meta, state);
      const actions = document.createElement('div');
      actions.className = 'row-actions';
      actions.append(
        makeButton('Edit', () => openEditor(notice)),
        makeButton(notice.status === 'published' ? 'Unpublish' : 'Publish', () => changeStatus(notice))
      );
      if (notice.attachmentName) {
        const attachment = document.createElement('span');
        attachment.className = 'muted-text';
        attachment.textContent = `PDF: ${notice.attachmentName}`;
        actions.append(attachment);
      }
      actions.append(makeButton('Delete', () => deleteNotice(notice), 'danger-text'));
      article.append(details, actions);
      return article;
    }));
  };

  function makeButton(label, action, className = '') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `text-button ${className}`.trim();
    button.textContent = label;
    button.addEventListener('click', action);
    return button;
  }

  async function refresh() {
    notices = await api('/api/admin/notices');
    notices.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    render();
  }

  function openEditor(notice) {
    editingId = notice?.id || '';
    form.reset();
    form.elements.id.value = editingId;
    document.getElementById('editor-heading').textContent = editingId ? 'Edit notice' : 'Create notice';
    if (notice) {
      form.elements.title.value = notice.title;
      form.elements.content.value = notice.content;
      form.elements.publicationDate.value = notice.publicationDate;
      form.elements.category.value = notice.category;
      form.elements.status.value = notice.status;
    } else {
      form.elements.publicationDate.value = new Date().toISOString().slice(0, 10);
      form.elements.status.value = 'draft';
    }
    const panel = document.getElementById('attachment-panel');
    panel.hidden = !editingId;
    updateAttachmentPanel(notice);
    editor.hidden = false;
    editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function updateAttachmentPanel(notice) {
    const hasAttachment = Boolean(notice?.attachmentName);
    document.getElementById('attachment-current').textContent =
      hasAttachment ? `Current file: ${notice.attachmentName}` : 'No PDF is attached.';
    document.getElementById('remove-attachment-button').hidden = !hasAttachment;
  }

  async function changeStatus(notice) {
    const status = notice.status === 'published' ? 'draft' : 'published';
    if (status === 'draft' && !window.confirm(`Unpublish “${notice.title}”? It will no longer be visible publicly.`)) return;
    try {
      await api(`/api/admin/notices/${encodeURIComponent(notice.id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      await refresh();
      showMessage(status === 'published' ? 'Notice published.' : 'Notice unpublished.');
    } catch (error) {
      showMessage(error.message, true);
    }
  }

  async function deleteNotice(notice) {
    if (!window.confirm(`Permanently delete “${notice.title}” and its attachment? This cannot be undone.`)) return;
    try {
      await api(`/api/admin/notices/${encodeURIComponent(notice.id)}`, { method: 'DELETE' });
      await refresh();
      showMessage('Notice deleted.');
      if (editingId === notice.id) editor.hidden = true;
    } catch (error) {
      showMessage(error.message, true);
    }
  }

  try {
    const session = await fetch('/api/admin/session', { credentials: 'same-origin' });
    if (!session.ok) {
      window.location.replace('/admin/login');
      return;
    }
    csrf = (await session.json()).csrf;
    await refresh();
  } catch (error) {
    showMessage(error.message || 'Unable to load the dashboard.', true);
  }

  document.getElementById('create-notice-button').addEventListener('click', () => openEditor(null));
  document.getElementById('cancel-edit-button').addEventListener('click', () => { editor.hidden = true; });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    feedback.textContent = '';
    const values = new FormData(form);
    const body = {
      title: values.get('title'),
      content: values.get('content'),
      publicationDate: values.get('publicationDate'),
      category: values.get('category'),
      status: values.get('status')
    };
    try {
      const notice = await api(editingId ? `/api/admin/notices/${encodeURIComponent(editingId)}` : '/api/admin/notices', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      editingId = notice.id;
      form.elements.id.value = notice.id;
      document.getElementById('editor-heading').textContent = 'Edit notice';
      document.getElementById('attachment-panel').hidden = false;
      await refresh();
      updateAttachmentPanel(notices.find((item) => item.id === notice.id));
      showMessage('Notice saved.');
    } catch (error) {
      feedback.textContent = error.message;
      feedback.classList.add('error-message');
    }
  });

  attachmentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const file = new FormData(attachmentForm).get('attachment');
    if (!(file instanceof File) || !file.size) return;
    if (file.size > 10 * 1024 * 1024 || file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
      showMessage('Choose a PDF file no larger than 10 MB.', true);
      return;
    }
    try {
      await api(`/api/admin/notices/${encodeURIComponent(editingId)}/attachment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/pdf', 'X-File-Name': encodeURIComponent(file.name) },
        body: file
      });
      await refresh();
      updateAttachmentPanel(notices.find((item) => item.id === editingId));
      attachmentForm.reset();
      showMessage('PDF uploaded.');
    } catch (error) {
      showMessage(error.message, true);
    }
  });

  document.getElementById('remove-attachment-button').addEventListener('click', async () => {
    if (!window.confirm('Remove this PDF attachment?')) return;
    try {
      await api(`/api/admin/notices/${encodeURIComponent(editingId)}/attachment`, { method: 'DELETE' });
      await refresh();
      updateAttachmentPanel(notices.find((item) => item.id === editingId));
      showMessage('Attachment removed.');
    } catch (error) {
      showMessage(error.message, true);
    }
  });

  document.getElementById('logout-button').addEventListener('click', async () => {
    try {
      await api('/api/admin/logout', { method: 'POST' });
      window.location.replace('/admin/login');
    } catch (error) {
      showMessage(error.message, true);
    }
  });
});

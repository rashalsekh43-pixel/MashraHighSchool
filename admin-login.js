document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('login-form');
  const message = document.getElementById('login-message');
  try {
    const response = await fetch('/api/admin/session', { credentials: 'same-origin' });
    if (response.ok) window.location.replace('/admin/dashboard');
  } catch (error) {
    console.error(error);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.hidden = true;
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    const values = new FormData(form);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: values.get('username'),
          password: values.get('password')
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to sign in.');
      window.location.replace('/admin/dashboard');
    } catch (error) {
      message.textContent = error.message || 'Unable to sign in. Please try again.';
      message.hidden = false;
    } finally {
      submit.disabled = false;
    }
  });
});

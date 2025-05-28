export class AuthView {
  constructor() {
    this.loginForm = null;
    this.registerForm = null;
  }

  render() {
    return `
      <div class="auth-container">
        <div class="auth-tabs">
          <button class="auth-tab active" data-tab="login">Login</button>
          <button class="auth-tab" data-tab="register">Register</button>
        </div>

        <div class="auth-content">
          <form id="loginForm" class="auth-form">
            <h2>Login</h2>
            <div class="form-group">
              <label for="loginEmail">Email</label>
              <input type="email" id="loginEmail" required>
            </div>
            <div class="form-group">
              <label for="loginPassword">Password</label>
              <input type="password" id="loginPassword" required minlength="8">
            </div>
            <button type="submit" class="btn-primary">Login</button>
          </form>

          <form id="registerForm" class="auth-form hidden">
            <h2>Register</h2>
            <div class="form-group">
              <label for="registerName">Nama</label>
              <input type="text" id="registerName" required>
            </div>
            <div class="form-group">
              <label for="registerEmail">Email</label>
              <input type="email" id="registerEmail" required>
            </div>
            <div class="form-group">
              <label for="registerPassword">Password</label>
              <input type="password" id="registerPassword" required minlength="8">
            </div>
            <button type="submit" class="btn-primary">Register</button>
          </form>
        </div>
      </div>
    `;
  }

  afterRender() {
    this.loginForm = document.getElementById('loginForm');
    this.registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.auth-tab');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const formId = `${tab.dataset.tab}Form`;
        document.querySelectorAll('.auth-form').forEach(form => {
          form.classList.add('hidden');
        });
        document.getElementById(formId).classList.remove('hidden');
      });
    });
  }

  bindLoginHandler(handler) {
    if (this.loginForm) {
      this.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        await handler(email, password);
      });
    }
  }

  bindRegisterHandler(handler) {
    if (this.registerForm) {
      this.registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        await handler(name, email, password);
      });
    }
  }

  showError(message) {
    const activeForm = document.querySelector('.auth-form:not(.hidden)');
    if (!activeForm) return;

    // Remove any existing error messages
    const existingError = activeForm.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    activeForm.insertBefore(errorDiv, activeForm.firstChild);

    setTimeout(() => errorDiv.remove(), 3000);
  }

  showSuccess(message) {
    const activeForm = document.querySelector('.auth-form:not(.hidden)');
    if (!activeForm) return;

    // Remove any existing messages
    const existingMessage = activeForm.querySelector('.success-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    activeForm.insertBefore(successDiv, activeForm.firstChild);

    setTimeout(() => successDiv.remove(), 3000);
  }
}
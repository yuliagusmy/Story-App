import AuthModel from '../models/auth-model.js';
import { Router } from '../routes/router.js';
import { AuthView } from '../views/auth-view.js';
import { NotificationView } from '../views/notification-view.js';

export class AuthPresenter {
  constructor() {
    this.view = new AuthView();
    this.model = new AuthModel();
    this.router = new Router();
    this.notification = new NotificationView();
    this.isSubmitting = false;
  }

  async init() {
    this.view.bindLoginHandler(this.handleLogin.bind(this));
    this.view.bindRegisterHandler(this.handleRegister.bind(this));
  }

  async handleLogin(email, password) {
    if (this.isSubmitting) return;

    try {
      this.isSubmitting = true;
      const submitButton = this.view.loginForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = 'Logging in...';

      await this.model.login(email, password);
      this.notification.showSuccess('Login berhasil! Selamat datang kembali.');

      // Wait for notification to be visible before navigating
      setTimeout(() => {
        window.location.hash = '#/';
      }, 1000);
    } catch (error) {
      this.notification.showError(error.message);
    } finally {
      this.isSubmitting = false;
      const submitButton = this.view.loginForm.querySelector('button[type="submit"]');
      submitButton.disabled = false;
      submitButton.textContent = 'Login';
    }
  }

  async handleRegister(name, email, password) {
    if (this.isSubmitting) return;

    try {
      this.isSubmitting = true;
      const submitButton = this.view.registerForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = 'Registering...';

      const response = await this.model.register(name, email, password);
      if (response) {
        this.notification.showSuccess('Registrasi berhasil! Silakan login.');
        // Switch to login tab
        const loginTab = document.querySelector('[data-tab="login"]');
        if (loginTab) {
          loginTab.click();
        }
      }
    } catch (error) {
      this.notification.showError(error.message);
    } finally {
      this.isSubmitting = false;
      const submitButton = this.view.registerForm.querySelector('button[type="submit"]');
      submitButton.disabled = false;
      submitButton.textContent = 'Register';
    }
  }
}
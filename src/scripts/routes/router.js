import AuthModel from '../models/auth-model.js';
import { AddStoryPresenter } from '../presenters/add-story-presenter.js';
import { AuthPresenter } from '../presenters/auth-presenter.js';
import { SavedStoryPresenter } from '../presenters/saved-story-presenter.js';
import { StoryDetailPresenter } from '../presenters/story-detail-presenter.js';
import { StoryListPresenter } from '../presenters/story-list-presenter.js';
import createNotFoundView from '../views/not-found-view.js';
import { NotificationView } from '../views/notification-view.js';

export class Router {
  constructor() {
    this.routes = {
      '/': StoryListPresenter,
      '/add': AddStoryPresenter,
      '/auth': AuthPresenter,
      '/detail': StoryDetailPresenter,
      '/saved': SavedStoryPresenter,
      '/404': createNotFoundView
    };
    this.contentElement = document.querySelector('#main-content');
    this.authModel = new AuthModel();
    this.notification = new NotificationView();
    this.currentPresenter = null;

    // Add event listener for hash changes
    window.addEventListener('hashchange', () => this.handleRouteChange());
    // Initial route check
    this.handleRouteChange();
  }

  handleRouteChange() {
    const hash = window.location.hash.slice(1) || '/';
    const protectedRoutes = ['/', '/add', '/saved'];
    const isLoggedIn = this.authModel.isLoggedIn();

    // If trying to access protected route without being logged in
    if (protectedRoutes.includes(hash) && !isLoggedIn) {
      window.location.hash = '#/auth';
      return;
    }

    // If logged in and trying to access auth page, redirect to home
    if (isLoggedIn && hash === '/auth') {
      window.location.hash = '#/';
      return;
    }

    this.renderPage();
  }

  async renderPage() {
    const hash = window.location.hash.slice(1) || '/';
    let route = hash;
    let param = null;

    if (route.startsWith('/detail/')) {
      route = '/detail';
      param = hash.split('/')[2];
    }

    const Presenter = this.routes[route];

    if (!Presenter) {
      this.contentElement.innerHTML = await this.routes['/404']();
      return;
    }

    try {
      // Clean up previous presenter if exists
      if (this.currentPresenter && typeof this.currentPresenter.cleanup === 'function') {
        await this.currentPresenter.cleanup();
      }

      // Create new presenter
      this.currentPresenter = param ? new Presenter(param) : new Presenter();

      if (!this.currentPresenter.view || typeof this.currentPresenter.view.render !== 'function') {
        throw new Error('View not properly initialized');
      }

      const content = this.currentPresenter.view.render ?
        this.currentPresenter.view.render() :
        await this.currentPresenter.render();

      if (!content) {
        throw new Error('View render returned no content');
      }

      this.contentElement.innerHTML = content;

      if (typeof this.currentPresenter.view.afterRender === 'function') {
        await this.currentPresenter.view.afterRender();
      } else if (typeof this.currentPresenter.afterRender === 'function') {
        await this.currentPresenter.afterRender();
      }

      if (typeof this.currentPresenter.init === 'function') {
        await this.currentPresenter.init();
      }

      // Update navigation menu based on auth status
      this.updateNavigation();
    } catch (error) {
      console.error('Error rendering page:', error);
      this.notification.showError('Terjadi kesalahan saat memuat halaman');
    }
  }

  navigate(path) {
    window.location.hash = path;
  }

  showLogoutConfirmation() {
    return new Promise((resolve) => {
      const dialog = document.createElement('div');
      dialog.className = 'logout-dialog';
      dialog.innerHTML = `
        <div class="logout-dialog-content">
          <h3>Konfirmasi Logout</h3>
          <p>Apakah Anda yakin ingin keluar?</p>
          <div class="logout-dialog-buttons">
            <button class="btn-cancel">Tidak</button>
            <button class="btn-confirm">Ya</button>
          </div>
        </div>
      `;
      document.body.appendChild(dialog);

      // Add styles for the dialog
      const style = document.createElement('style');
      style.textContent = `
        .logout-dialog {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.2s ease-out;
        }
        .logout-dialog-content {
          background: white;
          padding: 24px;
          border-radius: 16px;
          width: 90%;
          max-width: 320px;
          text-align: center;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
        }
        .logout-dialog h3 {
          margin: 0 0 12px 0;
          color: #1a237e;
          font-size: 1.3em;
        }
        .logout-dialog p {
          margin: 0 0 24px 0;
          color: #4a5568;
        }
        .logout-dialog-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        .logout-dialog button {
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-cancel {
          background: #f3f4f6;
          color: #4a5568;
          border: none;
        }
        .btn-cancel:hover {
          background: #e5e7eb;
        }
        .btn-confirm {
          background: #ff4d4f;
          color: white;
          border: none;
        }
        .btn-confirm:hover {
          background: #ff7875;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `;
      document.head.appendChild(style);

      // Add event listeners
      const btnCancel = dialog.querySelector('.btn-cancel');
      const btnConfirm = dialog.querySelector('.btn-confirm');

      btnCancel.onclick = () => {
        dialog.remove();
        resolve(false);
      };

      btnConfirm.onclick = () => {
        dialog.remove();
        resolve(true);
      };

      // Close on click outside
      dialog.onclick = (e) => {
        if (e.target === dialog) {
          dialog.remove();
          resolve(false);
        }
      };
    });
  }

  updateNavigation() {
    const navList = document.querySelector('#nav-list');
    if (!navList) return;

    const isLoggedIn = this.authModel.isLoggedIn();

    // Update navigation items based on auth status
    if (isLoggedIn) {
      navList.innerHTML = `
        <li><a href="#/" class="nav-link">Beranda</a></li>
        <li><a href="#/saved" class="nav-link">Story Disimpan</a></li>
        <li><a href="#/add" class="nav-link btn-action btn-navbar-add">Tambah Cerita</a></li>
        <li><a href="#" id="logout-button" class="nav-link">Logout</a></li>
      `;

      // Add logout handler
      const logoutButton = document.querySelector('#logout-button');
      if (logoutButton) {
        logoutButton.addEventListener('click', async (e) => {
          e.preventDefault();
          const confirmed = await this.showLogoutConfirmation();
          if (confirmed) {
            this.authModel.logout();
            this.notification.showSuccess('Berhasil logout');
            setTimeout(() => {
              this.navigate('/auth');
            }, 1000);
          }
        });
      }
    } else {
      navList.innerHTML = `
        <li><a href="#/auth" class="nav-link">Login</a></li>
      `;
    }
  }
}
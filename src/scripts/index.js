// CSS imports
import '../styles/styles.css';

// Import routes and router
import App from './pages/app.js';
import { Router } from './routes/router.js';

const router = new Router();

window.addEventListener('hashchange', () => {
  router.renderPage();
});

window.addEventListener('load', () => {
  router.renderPage();
});

document.addEventListener('DOMContentLoaded', async () => {
  await router.renderPage();

  // Initialize skip link
  const skipLink = document.querySelector('.skip-link');
  if (skipLink) {
    skipLink.addEventListener('click', (event) => {
      event.preventDefault();
      document.querySelector('#main-content').focus();
    });
  }

  // Initialize App for mobile navigation
  const navigationDrawer = document.getElementById('navigation-drawer');
  const drawerButton = document.getElementById('drawer-button');
  const content = document.getElementById('main-content');
  if (navigationDrawer && drawerButton && content) {
    new App({ navigationDrawer, drawerButton, content });
  }
});

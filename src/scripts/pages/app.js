import { routes } from '../routes/routes.js';
import { getActiveRoute } from '../routes/url-parser.js';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent event from bubbling up
      this.#navigationDrawer.classList.toggle('open');
      const navList = this.#navigationDrawer.querySelector('.nav-list');
      if (navList) {
        navList.classList.toggle('open');
      }
    });

    // Close drawer when clicking outside
    document.addEventListener('click', (event) => {
      const isClickInside = this.#navigationDrawer.contains(event.target);
      const isClickOnButton = this.#drawerButton.contains(event.target);

      if (!isClickInside && !isClickOnButton) {
        this.#navigationDrawer.classList.remove('open');
        const navList = this.#navigationDrawer.querySelector('.nav-list');
        if (navList) {
          navList.classList.remove('open');
        }
      }
    });

    // Close drawer when clicking a link
    this.#navigationDrawer.addEventListener('click', (event) => {
      if (event.target.tagName === 'A') {
        this.#navigationDrawer.classList.remove('open');
        const navList = this.#navigationDrawer.querySelector('.nav-list');
        if (navList) {
          navList.classList.remove('open');
        }
      }
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    this.#content.innerHTML = await page.render();
    await page.afterRender();
  }
}

export default App;

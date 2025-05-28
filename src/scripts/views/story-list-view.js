export class StoryListView {
  constructor() {
    this.stories = [];
  }

  set stories(value) {
    this._stories = value;
    this.updateStories();
  }

  get stories() {
    return this._stories;
  }

  render({ showPagination = false } = {}) {
    return `
      <div class="story-list-container">
        <h1 class="story-list-title">Cerita Terbaru</h1>
        <div id="story-list" class="story-list">
          ${this.renderStories()}
        </div>
        <div id="pagination"></div>
        <div id="loading" class="loading" style="display: none;">
          <div class="loading-spinner"></div>
          <p>Memuat cerita...</p>
        </div>
        <div id="error" class="error-message" style="display: none;"></div>
      </div>
    `;
  }

  renderStories() {
    if (!this._stories || this._stories.length === 0) {
      return '<p class="no-stories">Belum ada cerita. Jadilah yang pertama untuk berbagi!</p>';
    }

    return this._stories.map((story) => {
      const date = new Date(story.createdAt);
      return `
        <article class="story-card">
          <div class="story-image">
            <img
              src="${story.photoUrl || story.photo}"
              alt="Foto cerita ${story.name || 'Story'}"
              loading="lazy"
              onerror="this.src='https://via.placeholder.com/400x300?text=Gambar+tidak+tersedia'"
            >
          </div>
          <div class="story-content">
            <h2 class="story-title">${story.name || 'Untitled Story'}</h2>
            <p class="story-description">${story.description || ''}</p>
            <div class="story-footer">
              <div class="story-divider"></div>
              <div class="story-meta-vertical">
                <div class="story-meta-row">
                  <span class="story-date">
                    <i class="fas fa-calendar"></i>
                    ${date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <span class="story-time">
                    <i class="fas fa-clock"></i>
                    ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                ${story.lat && story.lon ? `
                  <div class="story-meta-row">
                    <span class="story-location">
                      <i class="fas fa-map-marker-alt"></i>
                      <a href="https://www.google.com/maps?q=${story.lat},${story.lon}"
                         target="_blank"
                         rel="noopener noreferrer">
                        Lihat Lokasi
                      </a>
                    </span>
                    <span class="story-coordinates">
                      <i class="fas fa-compass"></i>
                      ${story.lat.toFixed(6)}, ${story.lon.toFixed(6)}
                    </span>
                  </div>
                ` : ''}
              </div>
              <a class="story-more-btn" href="#/detail/${story.id}">Selengkapnya</a>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  updateStories() {
    const storyListElement = document.getElementById('story-list');
    if (storyListElement) {
      storyListElement.innerHTML = this.renderStories();
    }
  }

  showLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'flex';
    }
  }

  hideLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }

  showError(message) {
    const errorElement = document.getElementById('error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  afterRender() {
    // Tidak perlu event listener modal lagi
  }

  renderPagination({ currentPage, totalStories, pageSize, onNext, onPrev }) {
    const totalPages = Math.ceil(totalStories / pageSize);
    const paginationEl = document.getElementById('pagination');
    if (!paginationEl) return;
    let html = '<div class="pagination-btn-group">';
    if (currentPage > 1) {
      html += `<button id="prev-page-btn" class="story-more-btn pagination-btn">Sebelumnya</button>`;
    }
    if (currentPage < totalPages) {
      html += `<button id="next-page-btn" class="story-more-btn pagination-btn">Berikutnya</button>`;
    }
    html += '</div>';
    html += `<span class="pagination-info">Halaman ${currentPage} dari ${totalPages}</span>`;
    paginationEl.innerHTML = html;
    if (currentPage > 1) {
      document.getElementById('prev-page-btn').onclick = onPrev;
    }
    if (currentPage < totalPages) {
      document.getElementById('next-page-btn').onclick = onNext;
    }
  }
}
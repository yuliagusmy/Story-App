import { isStorySaved, saveStory, unsaveStory } from '../utils/saved-story.js';

export class StoryDetailView {
  constructor() {
    this.container = document.querySelector('#main-content');
  }

  render() {
    return '<div class="story-detail-container"><p>Memuat detail cerita...</p></div>';
  }

  renderDetail(story) {
    const hasLocation = story.lat && story.lon;
    const mapId = 'map-' + story.id;
    const createdAt = new Date(story.createdAt);

    this.container.innerHTML = `
      <div class="story-detail-container">
        <div class="story-detail-header">
          <h1 class="story-detail-title">${story.name || 'Untitled Story'}</h1>
          <div class="story-detail-meta-row">
            <div class="meta-item">
              <i class="fas fa-user"></i>
              <span>Oleh: ${story.name}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-calendar"></i>
              <span>${createdAt.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })} ${createdAt.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            ${hasLocation ? `
              <div class="meta-item">
                <i class="fas fa-map-marker-alt"></i>
                <a href="https://www.google.com/maps?q=${story.lat},${story.lon}"
                   target="_blank"
                   rel="noopener noreferrer">
                  Lihat di Google Maps
                </a>
              </div>
              <div class="meta-item coordinates">
                <i class="fas fa-compass"></i>
                <span>${story.lat.toFixed(6)}, ${story.lon.toFixed(6)}</span>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="story-detail-image">
          <img
            src="${story.photoUrl || story.photo}"
            alt="Foto cerita ${story.name}"
            loading="lazy"
            onerror="this.src='https://via.placeholder.com/800x600?text=Gambar+tidak+tersedia'"
          >
        </div>
        ${hasLocation ? `
          <div class="story-detail-map-preview">
            <div id="detail-map-preview" class="map-static-preview" style="width:100%;height:200px;border-radius:12px;box-shadow:0 2px 8px rgba(44,62,80,0.10);margin-bottom:1.2rem;"></div>
          </div>
        ` : ''}
        <div class="story-detail-content">
          <p class="story-detail-description">${story.description}</p>

          ${hasLocation ? `
            <div class="story-detail-map">
              <h2 class="map-title">Lokasi</h2>
              <div id="${mapId}" class="map"></div>
            </div>
          ` : ''}
        </div>

        <div class="story-detail-actions">
          <button id="save-story" class="story-more-btn ${isStorySaved(story.id) ? 'saved' : ''}">
            <i class="fas ${isStorySaved(story.id) ? 'fa-bookmark' : 'fa-bookmark-o'}"></i>
            ${isStorySaved(story.id) ? 'Tersimpan' : 'Simpan Cerita'}
          </button>
          <a href="#/" class="story-more-btn">
            <i class="fas fa-arrow-left"></i>
            Kembali
          </a>
        </div>
      </div>
    `;

    // Save/Unsave button logic
    const saveBtn = document.getElementById('save-story');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        if (isStorySaved(story.id)) {
          unsaveStory(story.id);
        } else {
          saveStory(story.id);
        }
        this.renderDetail(story); // re-render to update button
      });
    }
    if (hasLocation) {
      setTimeout(() => {
        if (window.L && document.getElementById('detail-map-preview')) {
          const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          });
          const carto = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>'
          });
          const baseMaps = {
            "OpenStreetMap": osm,
            "CartoDB Light": carto
          };
          const map = L.map('detail-map-preview', { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false }).setView([story.lat, story.lon], 14);
          osm.addTo(map);
          L.control.layers(baseMaps).addTo(map);
          const marker = L.marker([story.lat, story.lon]).addTo(map);
          marker.bindPopup(`<b>${story.name}</b><br>${story.description || ''}`).openPopup();
        }
      }, 100);
    }
  }

  renderError(message) {
    this.container.innerHTML = `<div class="error-message">${message}</div>`;
  }
}
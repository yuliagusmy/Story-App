import { StoryModel } from '../models/story-model.js';
import { AddStoryView } from '../views/add-story-view.js';

export class AddStoryPresenter {
  constructor() {
    this.view = new AddStoryView();
    this.model = new StoryModel();
    this.isSubmitting = false;
    this.map = null;
    this.marker = null;
  }

  async init() {
    try {
      // Wait for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 100));

      // Panggil afterRender agar elemen sudah ada di DOM
      await this.view.afterRender();

      // Initialize event listeners first
      this.initEventListeners();

      // Wait for map container to be available with retry
      let mapElement = null;
      let retryCount = 0;
      const maxRetries = 10;
      const retryDelay = 200;

      while (!mapElement && retryCount < maxRetries) {
        mapElement = document.querySelector('#map');
        if (!mapElement) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          retryCount++;
        }
      }

      if (!mapElement) {
        console.error('Map container not found after multiple attempts');
        this.view.showError('Gagal memuat peta. Silakan refresh halaman.');
        return;
      }

      // Initialize map after DOM is ready
      await this.initMap();
    } catch (error) {
      console.error('Error initializing add story page:', error);
      this.view.showError('Gagal memuat halaman. Silakan refresh halaman.');
    }
  }

  async initMap() {
    try {
      const mapElement = document.querySelector('#map');
      if (!mapElement) {
        throw new Error('Map container not found');
      }

      // Clean up existing map if it exists
      if (this.map) {
        try {
          this.map.remove();
        } catch (error) {
          console.warn('Error removing existing map:', error);
        }
        this.map = null;
      }

      // Fix: force remove Leaflet map instance if exists
      if (window.L && window.L.DomUtil.get('map') !== null) {
        try {
          const mapContainer = window.L.DomUtil.get('map');
          if (mapContainer && mapContainer._leaflet_id) {
            mapContainer._leaflet_id = null;
          }
        } catch (error) {
          console.warn('Error cleaning up map container:', error);
        }
      }

      // Initialize map with Leaflet
      this.map = L.map('map', {
        zoomControl: true,
        scrollWheelZoom: true,
        dragging: true,
        touchZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        attributionControl: true
      }).setView([-6.2088, 106.8456], 13); // Default to Jakarta

      // Define tile layers
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
      osm.addTo(this.map);
      L.control.layers(baseMaps).addTo(this.map);

      // Add click event to map
      this.map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        this.view.setLocation(lat, lng);
        // Add marker
        if (this.marker) {
          this.map.removeLayer(this.marker);
        }
        this.marker = L.marker([lat, lng]).addTo(this.map);
        this.marker.bindPopup('Lokasi yang dipilih').openPopup();
        // Update manual input
        const latInput = document.getElementById('lat-manual');
        const lonInput = document.getElementById('lon-manual');
        if (latInput && lonInput) {
          latInput.value = lat;
          lonInput.value = lng;
        }
      });

      // Try to get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            this.map.setView([latitude, longitude], 13);
            this.view.setLocation(latitude, longitude);
            if (this.marker) {
              this.map.removeLayer(this.marker);
            }
            this.marker = L.marker([latitude, longitude]).addTo(this.map);
            this.marker.bindPopup('Lokasi Anda').openPopup();
            // Update manual input
            const latInput = document.getElementById('lat-manual');
            const lonInput = document.getElementById('lon-manual');
            if (latInput && lonInput) {
              latInput.value = latitude;
              lonInput.value = longitude;
            }
          },
          (error) => {
            console.error('Error getting location:', error);
          }
        );
      }

      // Manual input event
      const latInput = document.getElementById('lat-manual');
      const lonInput = document.getElementById('lon-manual');
      if (latInput && lonInput) {
        latInput.addEventListener('input', () => {
          this.handleManualLatLonInput();
        });
        lonInput.addEventListener('input', () => {
          this.handleManualLatLonInput();
        });
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      this.view.showError('Gagal memuat peta. Silakan refresh halaman.');
    }
  }

  handleManualLatLonInput() {
    const latInput = document.getElementById('lat-manual');
    const lonInput = document.getElementById('lon-manual');
    const lat = parseFloat(latInput.value);
    const lon = parseFloat(lonInput.value);
    if (!isNaN(lat) && !isNaN(lon)) {
      // Update hidden fields
      this.view.setLocation(lat, lon);
      // Update marker on map
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }
      this.marker = L.marker([lat, lon]).addTo(this.map);
      this.marker.bindPopup('Lokasi manual').openPopup();
      this.map.setView([lat, lon], this.map.getZoom());
    }
  }

  cleanup() {
    try {
      // Stop camera first
      this.view.stopCamera();

      // Clean up map
      if (this.map) {
        try {
          // Remove marker first
          if (this.marker) {
            this.marker.remove();
            this.marker = null;
          }

          // Remove all layers
          this.map.eachLayer((layer) => {
            this.map.removeLayer(layer);
          });

          // Remove the map
          this.map.remove();
          this.map = null;
        } catch (error) {
          console.warn('Error cleaning up map:', error);
        }
      }

      // Remove event listeners
      if (this.view.formElement) {
        this.view.formElement.removeEventListener('submit', this.handleSubmit);
      }

      // Reset state
      this.isSubmitting = false;
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  initEventListeners() {
    const form = this.view.formElement;
    const cameraCaptureBtn = this.view.cameraCaptureBtn;
    const switchCameraButton = this.view.switchCameraBtn;

    // Store the submit handler for cleanup
    this.handleSubmit = async (e) => {
      e.preventDefault();

      if (this.isSubmitting) {
        return;
      }

      try {
        this.isSubmitting = true;
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Mengirim...';

        const formData = new FormData(form);

        // Validate required fields
        if (!formData.get('description')) {
          throw new Error('Deskripsi harus diisi');
        }

        if (!formData.get('photo').size) {
          throw new Error('Foto harus diambil atau diunggah');
        }

        // Create a new FormData object with only the required fields
        const apiFormData = new FormData();
        apiFormData.append('description', formData.get('description'));
        apiFormData.append('photo', formData.get('photo'));

        // Only append lat/lon if they exist
        const lat = formData.get('lat');
        const lon = formData.get('lon');
        if (lat && lon) {
          apiFormData.append('lat', parseFloat(lat));
          apiFormData.append('lon', parseFloat(lon));
        }

        const response = await this.model.addStory(apiFormData);

        if (response) {
          this.view.showSuccess('Cerita berhasil ditambahkan!');
          this.view.resetForm();

          // Clean up before navigation
          this.cleanup();

          // Wait a bit before redirecting
          setTimeout(() => {
            window.location.hash = '#/';
          }, 2000);
        }
      } catch (error) {
        this.view.showError(error.message || 'Gagal menambahkan cerita');
      } finally {
        this.isSubmitting = false;
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = 'Kirim Cerita';
      }
    };

    // Add cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });

    // Add cleanup on hash change
    window.addEventListener('hashchange', () => {
      this.cleanup();
    });

    if (cameraCaptureBtn) {
      cameraCaptureBtn.addEventListener('click', async () => {
        const photoBlob = await this.view.capturePhoto();
        if (!photoBlob) {
          this.view.showError('Gagal mengambil foto. Silakan coba lagi.');
        }
      });
    }

    if (switchCameraButton) {
      switchCameraButton.addEventListener('click', async () => {
        await this.view.switchCamera();
      });
    }

    if (form) {
      form.addEventListener('submit', this.handleSubmit);
    }
  }
}
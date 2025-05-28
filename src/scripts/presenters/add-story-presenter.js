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
      // Initialize camera first
    await this.view.initCamera();

      // Wait for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 100));

      // Initialize map after DOM is ready
    this.initMap();

      // Initialize event listeners
    this.initEventListeners();
    } catch (error) {
      console.error('Error initializing add story page:', error);
      this.view.showError('Gagal memuat halaman. Silakan coba lagi.');
    }
  }

  initMap() {
    try {
      const mapElement = document.querySelector('#map');
      if (!mapElement) {
        throw new Error('Map container not found');
      }

      // Clean up existing map if it exists
      if (this.map) {
        this.map.remove();
        this.map = null;
      }
      // Fix: force remove Leaflet map instance if exists
      if (window.L && window.L.DomUtil.get('map') !== null) {
        window.L.DomUtil.get('map')._leaflet_id = null;
      }
      // Initialize map with Leaflet
      this.map = L.map('map').setView([-6.2088, 106.8456], 13); // Default to Jakarta

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

  initEventListeners() {
    const form = this.view.formElement;
    const cameraButton = this.view.cameraButton;
    const switchCameraButton = document.querySelector('#switch-camera');

    // Add cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });

    // Add cleanup on hash change
    window.addEventListener('hashchange', () => {
      this.cleanup();
    });

    cameraButton.addEventListener('click', async () => {
      const photoBlob = await this.view.capturePhoto();
      if (!photoBlob) {
        this.view.showError('Gagal mengambil foto. Silakan coba lagi.');
      }
    });

    switchCameraButton.addEventListener('click', async () => {
      await this.view.switchCamera();
    });

    form.addEventListener('submit', async (e) => {
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

        // Log form data for debugging
        console.log('Submitting form data:', {
          description: apiFormData.get('description'),
          photo: apiFormData.get('photo')?.name,
          lat: apiFormData.get('lat'),
          lon: apiFormData.get('lon')
        });

        const response = await this.model.addStory(apiFormData);

        if (response) {
          this.view.showSuccess('Cerita berhasil ditambahkan!');
          this.view.resetForm();

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
    });
  }

  cleanup() {
    this.view.stopCamera();
  }
}
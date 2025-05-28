export class AddStoryView {
  constructor() {
    this.mediaStream = null;
    this.photoBlob = null;
  }

  render() {
    return `
      <div class="add-story-container" role="main">
        <h2 class="add-story-title">Tambah Cerita Baru</h2>
        <form id="story-form" role="form" aria-label="Form tambah cerita" novalidate>
          <div class="form-row form-group">
            <label for="description">Deskripsi</label>
            <textarea
              id="description"
              name="description"
              required
              aria-required="true"
              aria-describedby="description-error"
              minlength="10"
              maxlength="500"
              placeholder="Ceritakan pengalaman Anda..."
            ></textarea>
            <div id="description-error" class="error-message" role="alert" aria-live="polite"></div>
          </div>

          <div class="form-row form-group">
            <label for="photo">Foto</label>
            <div class="camera-upload-row">
              <div class="camera-container" role="region" aria-label="Kamera">
                <video
                  id="camera-preview"
                  autoplay
                  playsinline
                  aria-label="Preview kamera"
                  aria-describedby="camera-error"
                ></video>
                <div class="camera-error-message" id="camera-error"></div>
                <div class="camera-controls">
                  <button type="button" id="camera-button" class="btn-camera">Ambil Foto</button>
                  <button type="button" id="switch-camera" class="btn-camera">Ganti Kamera</button>
                </div>
                <div id="camera-instructions" class="visually-hidden">
                  Klik tombol untuk mengambil foto. Pastikan wajah Anda terlihat jelas dalam frame kamera.
                </div>
              </div>
              <div class="upload-controls">
                <div class="photo-preview" id="photo-preview" role="img" aria-label="Preview foto"></div>
                <button type="button" id="upload-photo-btn" class="btn-upload">Pilih Gambar dari File</button>
                <div id="drop-area" class="drop-area" tabindex="0" aria-label="Drop foto di sini atau klik untuk memilih file">
                  <span style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;">
                    <svg width="32" height="32" fill="none" viewBox="0 0 24 24" style="margin-bottom:6px;"><path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="#4a90e2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 16.5V17a2 2 0 01-2 2H6a2 2 0 01-2-2v-.5" stroke="#4a90e2" stroke-width="2" stroke-linecap="round"/></svg>
                    <span>Drop foto di sini atau klik untuk memilih file</span>
                  </span>
                </div>
                <div style="font-size:0.93em;color:#888;margin-top:0.3rem;">Format: JPG, PNG. Maks 2MB.</div>
                <input type="file" id="photo" name="photo" accept="image/*" required aria-required="true" aria-describedby="photo-error" style="display: none;">
                <div id="photo-error" class="error-message" role="alert" aria-live="polite"></div>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="form-row form-group">
            <label for="map">Lokasi</label>
            <div id="map" class="map-container" role="region" aria-label="Peta lokasi" aria-describedby="map-instructions"></div>
            <div id="map-instructions" class="visually-hidden">
              Klik pada peta untuk memilih lokasi cerita Anda. Lokasi akan ditandai dengan pin.
            </div>
            <div class="manual-location-inputs-row">
              <div class="manual-location-input">
                <label for="lat-manual">Latitude</label>
                <input type="number" step="any" id="lat-manual" name="lat-manual" placeholder="Contoh: -6.2088">
              </div>
              <div class="manual-location-input">
                <label for="lon-manual">Longitude</label>
                <input type="number" step="any" id="lon-manual" name="lon-manual" placeholder="Contoh: 106.8456">
              </div>
            </div>
            <input type="hidden" id="lat" name="lat">
            <input type="hidden" id="lon" name="lon">
          </div>

          <div class="form-actions">
            <button type="submit" class="story-more-btn" aria-label="Kirim cerita" aria-busy="false">Kirim Cerita &rarr;</button>
          </div>
        </form>
      </div>
    `;
  }

  afterRender() {
    this.formElement = document.querySelector('#story-form');
    this.cameraButton = document.querySelector('#camera-button');
    this.cameraPreview = document.querySelector('#camera-preview');
    this.mapElement = document.querySelector('#map');
    this.latInput = document.querySelector('#lat');
    this.lonInput = document.querySelector('#lon');
    this.photoInput = document.querySelector('#photo');
    this.uploadPhotoBtn = document.querySelector('#upload-photo-btn');
    this.dropArea = document.querySelector('#drop-area');

    this.uploadPhotoBtn.addEventListener('click', () => {
      this.photoInput.click();
    });

    this.photoInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.handleFile(e.target.files[0]);
      }
    });

    this.dropArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropArea.classList.add('dragover');
    });
    this.dropArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      this.dropArea.classList.remove('dragover');
    });
    this.dropArea.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropArea.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        this.handleFile(e.dataTransfer.files[0]);
      }
    });
    this.dropArea.addEventListener('click', () => {
      this.photoInput.click();
    });
  }

  async initCamera() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');

      if (videoDevices.length === 0) {
        throw new Error('Tidak ada kamera yang tersedia');
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      this.cameraPreview.srcObject = this.mediaStream;
      await this.cameraPreview.play();
    } catch (error) {
      console.error('Error accessing camera:', error);
      this.showError('Tidak dapat mengakses kamera. Pastikan Anda memberikan izin akses kamera.');
    }
  }

  async switchCamera() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');

      if (videoDevices.length <= 1) {
        throw new Error('Tidak ada kamera lain yang tersedia');
      }

      // Stop current stream
      this.stopCamera();

      // Get current facing mode
      const currentFacingMode = this.mediaStream?.getVideoTracks()[0]?.getSettings().facingMode;
      const newFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';

      // Start new stream with different facing mode
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: newFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      this.cameraPreview.srcObject = this.mediaStream;
      await this.cameraPreview.play();
    } catch (error) {
      console.error('Error switching camera:', error);
      this.showError('Tidak dapat mengganti kamera');
    }
  }

  stopCamera() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      this.mediaStream = null;
    }

    // Clear video source
    if (this.cameraPreview) {
      this.cameraPreview.srcObject = null;
      this.cameraPreview.load();
    }

    // Clear photo preview
    const previewContainer = document.querySelector('#photo-preview');
    if (previewContainer) {
      previewContainer.innerHTML = '';
    }

    // Clear photo blob
    if (this.photoBlob) {
      URL.revokeObjectURL(URL.createObjectURL(this.photoBlob));
      this.photoBlob = null;
    }
  }

  async capturePhoto() {
    try {
      if (!this.mediaStream) {
        throw new Error('Kamera belum diinisialisasi');
      }

      const canvas = document.createElement('canvas');
      canvas.width = this.cameraPreview.videoWidth;
      canvas.height = this.cameraPreview.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(this.cameraPreview, 0, 0);

      // Convert to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));

      // Create file from blob
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });

      // Set file to input
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      this.photoInput.files = dataTransfer.files;

      // Show preview
      const previewContainer = document.querySelector('#photo-preview');
      previewContainer.innerHTML = '';
      const img = document.createElement('img');
      img.src = URL.createObjectURL(blob);
      previewContainer.appendChild(img);

      return blob;
    } catch (error) {
      console.error('Error capturing photo:', error);
      this.showError('Gagal mengambil foto. Silakan coba lagi.');
      return null;
    }
  }

  setLocation(lat, lng) {
    this.latInput.value = lat;
    this.lonInput.value = lng;
  }

  async showError(message) {
    if (!window.globalNotificationView) {
      const module = await import('./notification-view.js');
      window.globalNotificationView = new module.NotificationView();
      document.body.insertAdjacentHTML('beforeend', window.globalNotificationView.render());
      window.globalNotificationView.afterRender();
    }
    window.globalNotificationView.showError(message);
  }

  async showSuccess(message) {
    if (!window.globalNotificationView) {
      const module = await import('./notification-view.js');
      window.globalNotificationView = new module.NotificationView();
      document.body.insertAdjacentHTML('beforeend', window.globalNotificationView.render());
      window.globalNotificationView.afterRender();
    }
    window.globalNotificationView.showSuccess(message);
  }

  resetForm() {
    this.formElement.reset();
    this.photoBlob = null;
    const previewContainer = document.querySelector('#photo-preview');
    if (previewContainer) {
      previewContainer.innerHTML = '';
    }
    this.latInput.value = '';
    this.lonInput.value = '';
  }

  cleanup() {
    this.stopCamera();
  }

  async handleFile(file) {
    if (!file.type.startsWith('image/')) {
      this.showError('File harus berupa gambar');
      return;
    }
    // Preview
    const previewContainer = document.querySelector('#photo-preview');
    previewContainer.innerHTML = '';
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.alt = 'Preview foto';
    img.style.maxWidth = '100%';
    img.style.maxHeight = '300px';
    previewContainer.appendChild(img);
    // Set file ke input
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    this.photoInput.files = dataTransfer.files;
    // Simpan blob jika perlu
    this.photoBlob = file;
  }
}
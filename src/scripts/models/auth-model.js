class AuthModel {
  constructor() {
    this.BASE_URL = 'https://story-api.dicoding.dev/v1';
    this.token = localStorage.getItem('token') || null;
  }

  async register(name, email, password) {
    try {
      // Validate input
      if (!name || !email || !password) {
        throw new Error('Semua field harus diisi');
      }

      if (password.length < 8) {
        throw new Error('Password minimal 8 karakter');
      }

      if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        throw new Error('Format email tidak valid');
      }

      const response = await fetch(`${this.BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const responseJson = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Email sudah terdaftar');
        }
        throw new Error(responseJson.message || 'Terjadi kesalahan saat registrasi');
      }

      return responseJson;
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Tidak dapat terhubung ke server. Silakan coba lagi nanti.');
      }
      throw error;
    }
  }

  async login(email, password) {
    try {
      // Validate input
      if (!email || !password) {
        throw new Error('Email dan password harus diisi');
      }

      const response = await fetch(`${this.BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const responseJson = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Email atau password salah');
        }
        throw new Error(responseJson.message || 'Terjadi kesalahan saat login');
      }

      this.token = responseJson.loginResult.token;
      localStorage.setItem('token', this.token);
      return responseJson.loginResult;
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Tidak dapat terhubung ke server. Silakan coba lagi nanti.');
      }
      throw error;
    }
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
  }

  isLoggedIn() {
    return localStorage.getItem('token') !== null;
  }

  getToken() {
    return localStorage.getItem('token');
  }
}

export default AuthModel;
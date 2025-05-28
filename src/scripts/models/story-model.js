import AuthModel from './auth-model.js';

export class StoryModel {
  constructor() {
    this.BASE_URL = 'https://story-api.dicoding.dev/v1';
    this.authModel = new AuthModel();
  }

  async getStories(size = 1000, page = 1) {
    try {
      const token = this.authModel.getToken();
      if (!token) {
        throw new Error('Anda harus login terlebih dahulu');
      }

      console.log('Fetching stories with token:', token);

      const response = await fetch(`${this.BASE_URL}/stories?size=${size}&page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const responseJson = await response.json();
      console.log('Stories API response:', responseJson);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
        }
        throw new Error(responseJson.message || 'Gagal memuat cerita');
      }

      if (!responseJson.listStory) {
        console.error('Invalid API response format:', responseJson);
        throw new Error('Format response tidak valid');
      }

      return responseJson.listStory;
    } catch (error) {
      console.error('Error fetching stories:', error);
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Tidak dapat terhubung ke server. Silakan coba lagi nanti.');
      }
      throw error;
    }
  }

  async addStory(formData) {
    try {
      const token = this.authModel.getToken();
      if (!token) {
        throw new Error('Anda harus login terlebih dahulu');
      }

      // Log form data for debugging
      console.log('Form data being sent:', {
        description: formData.get('description'),
        photo: formData.get('photo')?.name,
        lat: formData.get('lat'),
        lon: formData.get('lon')
      });

      const response = await fetch(`${this.BASE_URL}/stories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const responseJson = await response.json();
      console.log('Add story API response:', responseJson);

      if (!response.ok) {
        if (response.status === 400) {
          console.error('API Error Response:', responseJson);
          throw new Error(responseJson.message || 'Data yang dikirim tidak valid. Pastikan semua field terisi dengan benar.');
        }
        if (response.status === 401) {
          throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
        }
        throw new Error(responseJson.message || 'Gagal menambahkan cerita');
      }

      return responseJson;
    } catch (error) {
      console.error('Error adding story:', error);
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Tidak dapat terhubung ke server. Silakan coba lagi nanti.');
      }
      throw error;
    }
  }

  async getStoryById(id) {
    const token = this.authModel.getToken();
    if (!token) throw new Error('Anda harus login terlebih dahulu');
    const response = await fetch(`${this.BASE_URL}/stories/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const responseJson = await response.json();
    if (!response.ok) throw new Error(responseJson.message || 'Gagal memuat detail cerita');
    return responseJson.story;
  }
}

export default StoryModel;
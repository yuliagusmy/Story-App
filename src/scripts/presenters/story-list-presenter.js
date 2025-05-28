import { StoryModel } from '../models/story-model.js';
import { NotificationView } from '../views/notification-view.js';
import { StoryListView } from '../views/story-list-view.js';

export class StoryListPresenter {
  constructor() {
    this.view = new StoryListView();
    this.model = new StoryModel();
    this.notification = new NotificationView();
    this.currentPage = 1;
    this.pageSize = 15;
    this.totalStories = 0;
    this.stories = [];
  }

  async init() {
    await this.loadStories(this.currentPage);
  }

  async loadStories(page) {
    try {
      this.view.showLoading();
      const allStories = await this.model.getStories(1000); // Ambil semua, pagination di frontend
      this.totalStories = allStories.length;
      // Urutkan terbaru di atas
      allStories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      this.stories = allStories;
      const startIdx = (page - 1) * this.pageSize;
      const endIdx = startIdx + this.pageSize;
      const storiesToShow = allStories.slice(startIdx, endIdx);
      this.view.stories = storiesToShow;
      this.view.hideLoading();
      this.view.renderPagination({
        currentPage: this.currentPage,
        totalStories: this.totalStories,
        pageSize: this.pageSize,
        onNext: () => this.nextPage(),
        onPrev: () => this.prevPage(),
      });
    } catch (error) {
      this.view.hideLoading();
      this.view.showError(error.message || 'Gagal memuat cerita. Silakan coba lagi nanti.');
      this.notification.showError(error.message || 'Gagal memuat cerita');
    }
  }

  async nextPage() {
    if ((this.currentPage * this.pageSize) < this.totalStories) {
      this.currentPage++;
      await this.loadStories(this.currentPage);
    }
  }

  async prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      await this.loadStories(this.currentPage);
    }
  }

  async addStory(formData) {
    try {
      this.view.showLoading();
      const response = await this.model.addStory(formData);
      if (response) {
        this.notification.showSuccess('Cerita berhasil ditambahkan!');
        // Reload stories after adding new one
        this.currentPage = 1;
        await this.init();
        return true;
      }
    } catch (error) {
      this.view.showError(error.message || 'Gagal menambahkan cerita. Silakan coba lagi.');
      this.notification.showError(error.message || 'Gagal menambahkan cerita');
      return false;
    } finally {
      this.view.hideLoading();
    }
  }
}
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
      const result = await this.model.getStories(this.pageSize, page);
      this.stories = result.stories;
      this.totalStories = result.pageInfo.totalItems;

      this.view.stories = this.stories;
      this.view.hideLoading();

      this.view.renderPagination({
        currentPage: page,
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
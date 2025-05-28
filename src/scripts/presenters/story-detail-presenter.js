import { StoryModel } from '../models/story-model.js';
import { StoryDetailView } from '../views/story-detail-view.js';

export class StoryDetailPresenter {
  constructor(storyId) {
    this.storyId = storyId;
    this.model = new StoryModel();
    this.view = new StoryDetailView();
  }

  async init() {
    try {
      console.log('DetailPresenter: storyId =', this.storyId);
      const story = await this.model.getStoryById(this.storyId);
      console.log('DetailPresenter: story =', story);
      if (!story) throw new Error('Cerita tidak ditemukan');
      this.view.renderDetail(story);
    } catch (error) {
      this.view.renderError(error.message || 'Gagal memuat detail cerita');
    }
  }
}
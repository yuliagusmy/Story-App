import { AddStoryPresenter } from '../presenters/add-story-presenter.js';
import { StoryListPresenter } from '../presenters/story-list-presenter.js';
import { AddStoryView } from '../views/add-story-view.js';
import { StoryListView } from '../views/story-list-view.js';

export const routes = {
  '#/': {
    view: StoryListView,
    presenter: StoryListPresenter
  },
  '#/add': {
    view: AddStoryView,
    presenter: AddStoryPresenter
  }
};

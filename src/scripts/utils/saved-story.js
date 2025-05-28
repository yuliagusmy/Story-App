// Helper untuk fitur save story di localStorage
const SAVED_STORY_KEY = 'saved_story_ids';

export function getSavedStories() {
  const data = localStorage.getItem(SAVED_STORY_KEY);
  return data ? JSON.parse(data) : [];
}

export function isStorySaved(storyId) {
  const saved = getSavedStories();
  return saved.includes(storyId);
}

export function saveStory(storyId) {
  const saved = getSavedStories();
  if (!saved.includes(storyId)) {
    saved.push(storyId);
    localStorage.setItem(SAVED_STORY_KEY, JSON.stringify(saved));
  }
}

export function unsaveStory(storyId) {
  let saved = getSavedStories();
  saved = saved.filter(id => id !== storyId);
  localStorage.setItem(SAVED_STORY_KEY, JSON.stringify(saved));
}
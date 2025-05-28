import { addStory, getStories, saveStories } from './story-db';

const BASE_URL = 'https://story-api.dicoding.dev/v1';

const getStoriesFromAPI = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/stories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const responseJson = await response.json();

    if (responseJson.error) {
      throw new Error(responseJson.message);
    }

    // Save stories to IndexedDB
    await saveStories(responseJson.listStory);
    return responseJson.listStory;
  } catch (error) {
    // If API fails, try to get stories from IndexedDB
    const stories = await getStories();
    if (stories.length > 0) {
      return stories;
    }
    throw error;
  }
};

const getStoryByIdFromAPI = async (id, token) => {
  try {
    const response = await fetch(`${BASE_URL}/stories/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const responseJson = await response.json();

    if (responseJson.error) {
      throw new Error(responseJson.message);
    }

    // Save single story to IndexedDB
    await addStory(responseJson.story);
    return responseJson.story;
  } catch (error) {
    // If API fails, try to get story from IndexedDB
    const story = await getStoryById(id);
    if (story) {
      return story;
    }
    throw error;
  }
};

const addStoryToAPI = async (formData, token) => {
  try {
    const response = await fetch(`${BASE_URL}/stories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const responseJson = await response.json();

    if (responseJson.error) {
      throw new Error(responseJson.message);
    }

    return responseJson;
  } catch (error) {
    throw error;
  }
};

const addGuestStoryToAPI = async (formData) => {
  try {
    const response = await fetch(`${BASE_URL}/stories/guest`, {
      method: 'POST',
      body: formData,
    });
    const responseJson = await response.json();

    if (responseJson.error) {
      throw new Error(responseJson.message);
    }

    return responseJson;
  } catch (error) {
    throw error;
  }
};

export {
    addGuestStoryToAPI, addStoryToAPI, getStoriesFromAPI,
    getStoryByIdFromAPI
};

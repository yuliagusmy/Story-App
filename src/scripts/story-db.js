import { openDB } from 'idb';

const dbName = 'storyDB';
const dbVersion = 1;
const storeName = 'stories';

const initDB = async () => {
  return openDB(dbName, dbVersion, {
    upgrade(database) {
      database.createObjectStore(storeName, { keyPath: 'id' });
    },
  });
};

const saveStories = async (stories) => {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);

  // Clear existing stories
  await store.clear();

  // Add new stories
  for (const story of stories) {
    await store.put(story);
  }

  await tx.done;
};

const getStories = async () => {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  return store.getAll();
};

const getStoryById = async (id) => {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  return store.get(id);
};

const addStory = async (story) => {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  await store.put(story);
  await tx.done;
};

const deleteStory = async (id) => {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  await store.delete(id);
  await tx.done;
};

export {
    addStory,
    deleteStory, getStories,
    getStoryById, initDB,
    saveStories
};

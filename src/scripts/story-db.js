import { openDB } from 'idb';

const dbName = 'storyDB';
const dbVersion = 2;
const storeName = 'stories';

const initDB = async () => {
  return openDB(dbName, dbVersion, {
    upgrade(database, oldVersion, newVersion) {
      // Handle version upgrades
      if (!database.objectStoreNames.contains(storeName)) {
        const store = database.createObjectStore(storeName, { keyPath: 'id' });
        // Add useful indexes
        store.createIndex('createdAt', 'createdAt');
        store.createIndex('name', 'name');
        store.createIndex('userId', 'userId');
      }

      // Handle version-specific upgrades
      if (oldVersion < 2) {
        const store = database.objectStoreNames.contains(storeName)
          ? database.transaction(storeName, 'readwrite').objectStore(storeName)
          : database.createObjectStore(storeName, { keyPath: 'id' });

        // Add new indexes in version 2
        if (!store.indexNames.contains('createdAt')) {
          store.createIndex('createdAt', 'createdAt');
        }
        if (!store.indexNames.contains('name')) {
          store.createIndex('name', 'name');
        }
        if (!store.indexNames.contains('userId')) {
          store.createIndex('userId', 'userId');
        }
      }
    },
  });
};

const saveStories = async (stories) => {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);

  // Clear existing stories
  await store.clear();

  // Add new stories with timestamp
  for (const story of stories) {
    await store.put({
      ...story,
      createdAt: story.createdAt || new Date().toISOString()
    });
  }

  await tx.done;
};

const getStories = async () => {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  return store.getAll();
};

const getStoriesByDate = async (startDate, endDate) => {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  const index = store.index('createdAt');

  return index.getAll(IDBKeyRange.bound(startDate, endDate));
};

const getStoriesByUser = async (userId) => {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  const index = store.index('userId');

  return index.getAll(userId);
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

  // Ensure createdAt exists
  const storyToAdd = {
    ...story,
    createdAt: story.createdAt || new Date().toISOString()
  };

  await store.put(storyToAdd);
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
    getStoriesByDate,
    getStoriesByUser,
    getStoryById, initDB,
    saveStories
};


import { get, set, del, clear } from 'idb-keyval';

const MIN_FREE_BYTES = 10 * 1024 * 1024; // warn if <10 MB free

/**
 * Checks remaining IndexedDB quota. Returns { quota, usage, lowSpace }
 * so callers can warn the user before saving large images fails silently.
 */
export const checkStorageQuota = async () => {
  if (!navigator.storage || !navigator.storage.estimate) {
    return { quota: 0, usage: 0, lowSpace: false };
  }
  try {
    const { quota = 0, usage = 0 } = await navigator.storage.estimate();
    return { quota, usage, lowSpace: quota - usage < MIN_FREE_BYTES };
  } catch {
    return { quota: 0, usage: 0, lowSpace: false };
  }
};

/**
 * Saves a base64 image or blob to IndexedDB
 * @param {string} itemId The unique ID of the wardrobe item
 * @param {string} imageBase64 The base64 string of the processed image
 */
export const saveItemImage = async (itemId, imageBase64) => {
  try {
    await set(`img_${itemId}`, imageBase64);
    return true;
  } catch (e) {
    console.error("Failed to save image to IndexedDB", e);
    return false;
  }
};

/**
 * Retrieves a base64 image from IndexedDB
 * @param {string} itemId The unique ID of the wardrobe item
 */
export const getItemImage = async (itemId) => {
  try {
    return await get(`img_${itemId}`);
  } catch (e) {
    console.error("Failed to retrieve image from IndexedDB", e);
    return null;
  }
};

/**
 * Deletes an image from IndexedDB
 * @param {string} itemId The unique ID of the wardrobe item
 */
export const deleteItemImage = async (itemId) => {
  try {
    await del(`img_${itemId}`);
  } catch (e) {
    console.error("Failed to delete image from IndexedDB", e);
  }
};

/**
 * Wipes the entire IndexedDB store (wardrobe photos + crash logs).
 * Used by "Delete All My Data" alongside localStorage.clear().
 */
export const clearAllLocalData = async () => {
  try {
    await clear();
  } catch (e) {
    console.error("Failed to clear IndexedDB", e);
  }
};

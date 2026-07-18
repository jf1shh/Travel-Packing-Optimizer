import { get, set, del } from 'idb-keyval';

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

import { readFile, rename, writeFile } from 'fs/promises';
import { wishlistItemSchema } from '../../shared/';
import { appPath, wishlistPath } from '../pathing';
import isExists from '../utils/isExists';
import path from 'path';
import { logging } from '../logging';

const wishlistBackupPath = () => path.join(appPath(), `${new Date().toISOString()}-wishlist.json`);

const createDefaultWishlist = async () => {
  writeFile(wishlistPath(), '[]');
};

const setupWishlist = async () => {
  if (!(await isExists(wishlistPath()))) {
    logging.info('wishlist.json not found. Creating new wishlist.json.');
    createDefaultWishlist();

    return;
  }

  const rawWishlist = await readFile(wishlistPath(), 'utf8');

  try {
    const wishlist = JSON.parse(rawWishlist);

    wishlistItemSchema.array().parse(wishlist);
    logging.info('Found wishlist.json. Data is valid.');
  } catch (err) {
    logging.error(`Wishlist corrupted. Backing up Wishlist to ${wishlistBackupPath()}`);
    await rename(wishlistPath(), wishlistBackupPath());
    createDefaultWishlist();
  }
};

export default setupWishlist;

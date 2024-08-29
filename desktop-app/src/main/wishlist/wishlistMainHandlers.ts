import { ipcMain } from 'electron';
import { readFile, writeFile } from 'fs/promises';
import { WishlistItem, wishlistItemSchema } from '../../shared';
import { wishlistPath } from '../pathing';

export const SET_WISHLIST = 'set-wishlist';
export const GET_WISHLIST = 'get-wishlist';

const wishlistMainHandlers = () => {
  ipcMain.handle(SET_WISHLIST, (_event, content: WishlistItem[]) => {
    const wishlistEntries = wishlistItemSchema.array().parse(content);

    writeFile(wishlistPath(), JSON.stringify(wishlistEntries));
  });

  ipcMain.handle(GET_WISHLIST, async (_event) => {
    const rawWishlist = await readFile(wishlistPath(), 'utf8');

    const wishlistEntries = JSON.parse(rawWishlist);

    return wishlistEntries;
  });
};

export default wishlistMainHandlers;

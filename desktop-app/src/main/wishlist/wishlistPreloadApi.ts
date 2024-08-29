import { ipcRenderer } from 'electron';

import { GET_WISHLIST, SET_WISHLIST } from './wishlistMainHandlers';
import { WishlistItem } from '../../shared/wishlist-models';

const wishlistPreloadApi = {
  setWishlist: (content: WishlistItem[]) => ipcRenderer.invoke(SET_WISHLIST, content),
  getWishlist: (): Promise<WishlistItem[] | Error> => ipcRenderer.invoke(GET_WISHLIST)
};

export default wishlistPreloadApi;

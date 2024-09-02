import { createStore } from 'solid-js/store';

type Store = {
  cardHeight: number;
};

const [uiStore, setUiStore] = createStore<Store>({
  cardHeight: 240
});

/**
 * Methods
 */
const ZOOM_LEVEL_MAP = { sm: 215, md: 240, lg: 265, xl: 290 } as const;

type ZoomLevel = keyof typeof ZOOM_LEVEL_MAP;

const HEIGHT_ZOOM_MAP = Object.entries(ZOOM_LEVEL_MAP).reduce((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {}) as InvertedZoomLevelMap;

type InvertedZoomLevelMap = {
  [K in keyof typeof ZOOM_LEVEL_MAP as (typeof ZOOM_LEVEL_MAP)[K]]: K;
};

const setCardZoomLevel = (zoom: ZoomLevel) => {
  setUiStore('cardHeight', ZOOM_LEVEL_MAP[zoom]);
};

// Output: { 215: 'sm', 240: 'md', 265: 'lg', 290: 'xl' }

export { uiStore, setUiStore, setCardZoomLevel, ZOOM_LEVEL_MAP, HEIGHT_ZOOM_MAP };

export type { ZoomLevel };

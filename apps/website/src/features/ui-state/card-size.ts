import { createSignal } from "solid-js";

/** Card height in px per size; the desktop's `ZOOM_HEIGHT_MAP`. */
export const ZOOM_HEIGHT_MAP = { sm: 215, md: 240, lg: 280, xl: 320 } as const;

export type CardSize = keyof typeof ZOOM_HEIGHT_MAP;

export const CARD_SIZES = Object.keys(ZOOM_HEIGHT_MAP) as CardSize[];

const STORAGE_KEY = "diddl-manager:card-size";

const isCardSize = (value: unknown): value is CardSize =>
  typeof value === "string" && value in ZOOM_HEIGHT_MAP;

const readStoredCardSize = (): CardSize => {
  if (typeof window === "undefined") return "md";

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isCardSize(stored) ? stored : "md";
  } catch {
    return "md";
  }
};

/**
 * Card size is UI state, so it lives in `localStorage` only (spec §3). The signal is
 * module-level so the Library grid and the Settings control share one value.
 */
const [cardSize, setCardSizeSignal] = createSignal<CardSize>(readStoredCardSize());

export { cardSize };

export const setCardSize = (size: CardSize) => {
  setCardSizeSignal(size);
  try {
    window.localStorage.setItem(STORAGE_KEY, size);
  } catch {
    // Private mode or a full quota: the in-memory value still applies for this session.
  }
};

export const useCardHeight = () => () => ZOOM_HEIGHT_MAP[cardSize()];

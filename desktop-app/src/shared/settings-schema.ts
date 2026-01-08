import { z } from "zod";

const ZOOM_HEIGHT_MAP = { sm: 215, md: 240, lg: 280, xl: 320 } as const;

type ZoomLevel = keyof typeof ZOOM_HEIGHT_MAP;

type Invert<TObj extends Record<PropertyKey, PropertyKey>> = {
  [K in keyof TObj as TObj[K]]: K;
};

const HEIGHT_ZOOM_MAP = Object.entries(ZOOM_HEIGHT_MAP).reduce((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {}) as Invert<typeof ZOOM_HEIGHT_MAP>;

export type { ZoomLevel };

export const settingsSchema = z.object({
  // --- Accessibility ---
  accessibility: z.object({
    reducedMotion: z.boolean().default(false),
    highContrast: z.boolean().default(false),
    dyslexicFont: z.boolean().default(false),
    screenReaderOptimized: z.boolean().default(false),
  }),

  // --- System & Performance ---
  system: z.object({
    launchAtLogin: z.boolean().default(false),
    minimizeToTray: z.boolean().default(true),
    hardwareAcceleration: z.boolean().default(true),
    checkUpdateAutomatically: z.boolean().default(true),
  }),

  // --- Notifications ---
  notifications: z.object({
    enabled: z.boolean().default(true),
    soundEnabled: z.boolean().default(true),
    priorityOnly: z.boolean().default(false),
  }),

  usageAnalytics: z.boolean().default(false),
});

export type Settings = z.infer<typeof settingsSchema>;

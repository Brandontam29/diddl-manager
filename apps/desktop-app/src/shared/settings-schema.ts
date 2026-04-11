import { z } from "zod";

export const settingsSchema = z.object({
  // --- Accessibility ---
  accessibility: z
    .object({
      reducedMotion: z.boolean().default(false),
      highContrast: z.boolean().default(false),
      dyslexicFont: z.boolean().default(false),
      screenReaderOptimized: z.boolean().default(false),
    })
    .default({
      reducedMotion: false,
      highContrast: false,
      dyslexicFont: false,
      screenReaderOptimized: false,
    }),

  // --- System & Performance ---
  system: z
    .object({
      launchAtLogin: z.boolean().default(false),
      minimizeToTray: z.boolean().default(true),
      hardwareAcceleration: z.boolean().default(true),
      checkUpdateAutomatically: z.boolean().default(true),
    })
    .default({
      launchAtLogin: false,
      minimizeToTray: true,
      hardwareAcceleration: true,
      checkUpdateAutomatically: true,
    }),

  // --- Notifications ---
  notifications: z
    .object({
      enabled: z.boolean().default(true),
      soundEnabled: z.boolean().default(true),
      priorityOnly: z.boolean().default(false),
    })
    .default({
      enabled: true,
      soundEnabled: true,
      priorityOnly: false,
    }),

  usageAnalytics: z.boolean().default(false),
});

export type Settings = z.infer<typeof settingsSchema>;

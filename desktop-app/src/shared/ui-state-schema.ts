import { z } from "zod";

import { Invert } from "./types";

export const ZOOM_HEIGHT_MAP = { sm: 215, md: 240, lg: 280, xl: 320 } as const;

export type ZoomHeighMap = typeof ZOOM_HEIGHT_MAP;

export const HEIGHT_ZOOM_MAP = Object.entries(ZOOM_HEIGHT_MAP).reduce((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {}) as Invert<typeof ZOOM_HEIGHT_MAP>;

export const uiStateSchema = z.object({
  version: z.number().default(1),
  theme: z.enum(["light", "dark", "system"]).default("system"),
  cardSize: z.enum(Object.keys(ZOOM_HEIGHT_MAP)).default("md"),
  uiDensity: z.enum(["compact", "normal", "comfortable"]).default("normal"),

  sidebarCollapsed: z.boolean().default(false),
  windowBounds: z.object({
    width: z.number().default(1200),
    height: z.number().default(800),
    x: z.number().optional(),
    y: z.number().optional(),
  }),
  rememberPosition: z.boolean().default(true),
});

export type UiState = z.infer<typeof uiStateSchema>;

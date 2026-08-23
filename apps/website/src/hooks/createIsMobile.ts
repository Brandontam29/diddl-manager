import { createMediaQuery } from "@solid-primitives/media";

/** True under 768px — the tablet floor where the sidebar becomes a Sheet (spec §6). */
export const createIsMobile = () => createMediaQuery("(max-width: 767px)");

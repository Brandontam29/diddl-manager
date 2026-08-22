# Port components/ui and the Library page

Type: task
Status: open
Blocked by: 22, 24

## Question

Implement spec.md §6 for the shared chrome and Library: copy `components/ui`, hooks, libs, fonts (to `public/fonts`), styles from the desktop renderer into `apps/website/src` (`@renderer/*` → `@/*`, tRPC removed); `/app` layout loader (`getCatalog` staleTime ∞, `getSectionsWithLists`, `getProfile`), `errorComponent` card + Retry, selection store cleared on location change, sidebar (Kobalte `Sheet` under 768px); the Library route at `/app` with the 150-at-a-time limiter, `Image` on `VITE_IMAGE_BASE_URL`, typed `validateSearch` for `type`/`from`/`to`, the Taskbar (minus Download images) and the AddToList popover with confetti.

Done when: Library browses the full catalog with filters via URL params and can add selected diddls to a list; typecheck/lint/build green.

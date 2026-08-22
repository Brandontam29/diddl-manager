# Catalog images, clean script, and load script

Type: task
Status: open
Blocked by: 21

## Question

Implement spec.md §7: unzip `resources/diddl-images.zip` once into `apps/website/public/diddls/` (committed); `scripts/clean-catalog.ts` producing `apps/website/data/catalog.json` with the mechanical rules and the preserved array order (`id = index + 1`); `scripts/load-catalog.ts` upserting `diddls` over `DATABASE_URL_UNPOOLED`. Unit-test the clean rules.

Done when: `catalog.json` has 3,913 entries, every imagePath exists, no missing dimensions; `dev` and `test` branches hold 3,913 `diddls` rows; the commit lands via PR/Git integration only (never `vercel deploy`).

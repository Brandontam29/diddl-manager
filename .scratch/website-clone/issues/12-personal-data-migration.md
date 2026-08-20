# Personal data migration plan

Type: grilling
Status: open
Blocked by: 08

## Question

The desktop app is in real use; its SQLite database holds actual sections, lists,
and list items. Decide how that data gets into the migrated user's Neon account:

- Extraction: where the SQLite file lives on the user's machine (see
  `apps/desktop-app/src/main/pathing/`), and whether export happens via a desktop
  feature, a manual copy, or a script in `apps/data-migrations`.
- Mapping: desktop diddl ids → catalog ids (stable per "Catalog seeding pipeline",
  issue 10), sections/lists/items → the new user's rows; what happens to soft-deleted
  rows.
- Trigger: one-off script run by the developer after the user signs up, or an in-app
  import? (One-off script is almost certainly right — decide and record it.)

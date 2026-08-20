# Diddl Manager

Apps for managing a personal collection of Diddl collectibles: an Electron desktop
app and a cloud web app, both built on a shared vocabulary.

## Language

**Diddl**:
A specific card/paper collectible (sheet, sticker, bag, …) identified in the Catalog.
One Diddl has exactly one Diddl Type.
_Avoid_: card, sheet (as generic terms)

**Diddl Type**:
The physical format of a Diddl — one of the 28 kinds (A4, sticker, gift-paper, …).
_Avoid_: category, format

**Catalog**:
The global, read-only set of all known Diddls. Shared by every user; changed only by
seeding, never by users.
_Avoid_: library (that's the page), database

**Library**:
The page where a user browses the whole Catalog.
_Avoid_: catalog (that's the data), all-diddls page

**List**:
A user-owned, named, colored subset of Diddls. Lives in exactly one List Section.
_Avoid_: collection

**List Section**:
A user-owned, ordered group of Lists in the sidebar hierarchy.
_Avoid_: folder, group

**Default Section**:
The "Unsectioned" List Section every user has; Lists live there until moved. Exactly
one per user, never deletable.
_Avoid_: unsectioned lists (as a concept name)

**List Item**:
One Diddl's membership in a List, carrying quantity, damaged, and incomplete status.
_Avoid_: entry, row

**User**:
An authenticated account (web only). Owns List Sections, Lists, List Items, and one
Profile.
_Avoid_: account, member

**Profile**:
The collector-facing display data of a User (name, birthdate, description, hobbies,
picture). Not the auth identity.
_Avoid_: user info, account details

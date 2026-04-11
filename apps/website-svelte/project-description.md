## Goal

I want a website for the purpose of managing lists of collection items based on a master database Catalog.
These items are all related to the fictional character Diddl.

## MVP Requirements

### Home Page

- This will display the Catalog of Diddls
- There will be a side bar with all the types of CatalogItem

### List Page

- The user can manage their list of Diddls.
- They create, delete and update (name and color indicator) the lists.

### List ID Page

- They can modify the count.
- They can tag the diddl as complete or incomplete.
- They can tag the condition of the item.
- Duplicate a list item to tag it differently.

### Login page

- You can use the app without a login page although your changes will not be saved.

### Master Admin page

- Manage the master database catalog

## Constraints

- The database catalog has around 10000 product each with an image.
- Right now, we only have 1 image and 1 image size per product. Get ready to support more.

## Technologies:

- sveltekit
- tailwind
- convex
- effect v4
- clerk auth

## Data models

- @website-svelte/models/
- This is the simplest for of the data models of app. This is not final.

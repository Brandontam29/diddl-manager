import {
  listNameSchema,
  listItemSchema,
  ListItem,
  listSchema,
  List,
  ListDb,
  SelectListDb,
  InsertListDb,
  UpdateListDb,
  ListItemDb,
  SelectListItemDb,
  InsertListItemDb,
  UpdateListItemDb,
  addListItemSchema,
  AddListItem,
} from "./list-models";

import {
  diddlTypeSchema,
  DiddlType,
  diddlSchema,
  Diddl,
  DiddlDb,
  SelectDiddlDb,
  InsertDiddlDb,
  UpdateDiddlDb,
} from "./diddl-models";

export {
  diddlTypeSchema,
  type DiddlType,
  diddlSchema,
  type Diddl,
  type DiddlDb,
  type SelectDiddlDb,
  type InsertDiddlDb,
  type UpdateDiddlDb,
};

export {
  listNameSchema,
  listItemSchema,
  type ListItem,
  listSchema,
  type List,
  type ListDb,
  type SelectListDb,
  type InsertListDb,
  type UpdateListDb,
  type ListItemDb,
  type SelectListItemDb,
  type InsertListItemDb,
  type UpdateListItemDb,
  addListItemSchema,
  type AddListItem,
};

// export type IpcResponse<T> = { success: true; data: T } | { success: false; error: string };

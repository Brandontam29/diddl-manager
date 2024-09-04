import { writeFile } from "fs/promises";
import { listTrackerPath } from "../pathing";
import { listNameSchema, type TrackerListItem, trackerListItemSchema } from "../../shared";
import { nanoid } from "nanoid";
import { getAppFile } from "../file-system";

export const createList = async (listPayload: Pick<TrackerListItem, "name" | "filePath">) => {
  const trackerList = getAppFile("list-tracker");
  const trackerListItem = trackerListItemSchema.parse({ id: nanoid(), ...listPayload });
  trackerList.push(trackerListItem);

  await writeFile(listTrackerPath(), JSON.stringify(trackerList));

  return trackerListItem;
};
export const getList = async (listId: string) => {
  const trackerList = getAppFile("list-tracker");
  return trackerList.find((item) => item.id === listId);
};

export const getLists = async () => {
  const trackerList = getAppFile("list-tracker");
  return trackerList.filter((item) => item.deletedAt !== null);
};

export const deleteList = async (id: string) => {
  const trackerList = getAppFile("list-tracker");
  const index = trackerList.findIndex((item) => item.id === id);

  if (index === -1) return;

  trackerList[index] = {
    ...trackerList[index],

    deletedAt: new Date().toISOString(),
  };

  writeFile(listTrackerPath(), JSON.stringify(trackerList));

  return trackerList[index];
};

export const updateListName = async (id: string, name: string) => {
  const parsedname = listNameSchema.parse(name);
  const trackerList = getAppFile("list-tracker");
  const index = trackerList.findIndex((item) => item.id === id);

  if (index === -1) return;
  trackerList[index] = {
    ...trackerList[index],

    name: parsedname,
  };

  await writeFile(listTrackerPath(), JSON.stringify(trackerList));

  return trackerList[index];
};

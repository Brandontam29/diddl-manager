import { libraryMapPath } from '../pathing';
import { readFileSync } from 'fs';

const validateDiddlIds = (ids: string[]) => {
  const rawLibraryMap = readFileSync(libraryMapPath(), 'utf8');

  const libraryMap = JSON.parse(rawLibraryMap);

  const status: boolean[] = [];
  const validDiddlIds: string[] = [];
  const invalidDiddlIds: string[] = [];

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const isValid = libraryMap[id] !== undefined;
    status.push(isValid);

    isValid ? validDiddlIds.push(id) : invalidDiddlIds.push(id);
  }

  return {
    allStatus: status.includes(false),
    status,
    validDiddlIds,
    invalidDiddlIds
  };
};

export default validateDiddlIds;

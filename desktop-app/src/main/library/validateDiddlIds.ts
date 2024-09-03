import { libraryMapPath } from '../pathing';
import { readFileSync } from 'fs';

const validateDiddlIds = (ids: string[]) => {
  const rawLibraryMap = readFileSync(libraryMapPath(), 'utf8');

  const libraryMap = JSON.parse(rawLibraryMap);

  const status: boolean[] = [];
  const validDiddlIds: string[] = [];
  const validDiddlIndexes: number[] = [];
  const invalidDiddlIds: string[] = [];
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const isValid = libraryMap[id] !== undefined;
    status.push(isValid);

    validDiddlIndexes.push(libraryMap[id]);

    if (isValid) {
      validDiddlIds.push(id);
      validDiddlIndexes.push(libraryMap[id]);
    } else {
      invalidDiddlIds.push(id);
    }
  }

  return {
    allStatus: invalidDiddlIds.length === 0,
    status,
    validDiddlIds,
    validDiddlIndexes,
    invalidDiddlIds
  };
};

export default validateDiddlIds;

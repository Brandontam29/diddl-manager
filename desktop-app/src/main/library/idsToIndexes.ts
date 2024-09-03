import { libraryMapPath } from '../pathing';
import { readFileSync } from 'fs';

const idsToIndexes = (ids: string[]) => {
  const rawLibraryMap = readFileSync(libraryMapPath(), 'utf8');

  const libraryMap = JSON.parse(rawLibraryMap) as Record<string, number>;

  return ids.map<number | undefined>((id) => libraryMap[id]);
};

export default idsToIndexes;

import { ipcRenderer } from 'electron';

import { GET_ACQUIRED_LIST, SET_ACQUIRED_LIST } from './acquiredMainHandlers';
import { AcquiredItem } from '../../shared';

const acquiredPreloadApi = {
  setAcquiredList: (content: AcquiredItem[]) => ipcRenderer.invoke(SET_ACQUIRED_LIST, content),
  getAcquiredList: (): Promise<AcquiredItem[]> => ipcRenderer.invoke(GET_ACQUIRED_LIST)
};

export default acquiredPreloadApi;

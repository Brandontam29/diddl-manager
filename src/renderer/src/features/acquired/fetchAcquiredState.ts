import { setAcquiredStore } from './createAcquiredStore';

const fetchAcquiredState = async () => {
  console.log('fetchAcquiredState');
  const acquiredJson = await window.api.getAcquiredList();

  if (acquiredJson instanceof Error) return console.error('wtf');

  setAcquiredStore('acquiredState', acquiredJson);
};

export default fetchAcquiredState;

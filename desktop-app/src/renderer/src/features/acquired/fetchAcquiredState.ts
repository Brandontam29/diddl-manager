import { setAcquiredStore } from './createAcquiredStore';

const fetchAcquiredState = async () => {
  try {
    const acquiredJson = await window.api.getAcquiredList();
    setAcquiredStore('acquiredItems', acquiredJson);
  } catch (err) {
    console.error(err);
  }
};

export default fetchAcquiredState;

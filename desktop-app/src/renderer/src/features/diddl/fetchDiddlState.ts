import { setDiddlStore } from "./createDiddlStore";

const fetchDiddlState = () => {
  fetchDiddls();
};

const fetchDiddls = async () => {
  try {
    const diddlsJson = await window.api.getDiddls();

    if (diddlsJson instanceof Error) return;
    setDiddlStore("diddlState", diddlsJson);
  } catch (e) {
    return console.error("cannot get diddls", e);
  }
};

export default fetchDiddlState;

import { trpc } from "@renderer/libs/trpc";

import { setDiddlStore } from "./createDiddlStore";

const fetchDiddls = async () => {
  try {
    const diddls = await trpc.diddl.getAll.query();

    setDiddlStore("diddlState", diddls);
  } catch (e) {
    return console.error("cannot get diddls", e);
  }
};

export default fetchDiddls;

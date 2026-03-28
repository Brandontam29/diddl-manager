import { createEffect, createSignal, on, onCleanup } from "solid-js";

import { Button } from "@renderer/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@renderer/components/ui/dialog";

import { installUpdate, updateStatus } from "./update-state";

const REMIND_LATER_MS = 60 * 60 * 1000; // 1 hour

const UpdateDialog = () => {
  const [open, setOpen] = createSignal(false);
  let remindTimer: ReturnType<typeof setTimeout> | undefined;

  createEffect(
    on(updateStatus, (status) => {
      if (status.type === "update-downloaded") {
        setOpen(true);
      }
    }),
  );

  function handleRemindLater() {
    setOpen(false);
    clearTimeout(remindTimer);
    remindTimer = setTimeout(() => {
      if (updateStatus().type === "update-downloaded") {
        setOpen(true);
      }
    }, REMIND_LATER_MS);
  }

  onCleanup(() => {
    clearTimeout(remindTimer);
  });

  return (
    <Dialog open={open()} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Available</DialogTitle>
          <DialogDescription>
            Version {updateStatus().version} has been downloaded and is ready to install. The
            application will restart to apply the update.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleRemindLater}>
            Remind Me Later
          </Button>
          <Button onClick={() => installUpdate()}>Restart Now</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateDialog;

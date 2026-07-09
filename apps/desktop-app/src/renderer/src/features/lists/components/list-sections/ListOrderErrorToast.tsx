import { toaster } from "@kobalte/core/toast";

import { Toast, ToastContent, ToastProgress, ToastTitle } from "@renderer/components/ui/toast";

export const showListOrderErrorToast = () => {
  toaster.show((props) => (
    <Toast toastId={props.toastId} variant="destructive">
      <ToastContent>
        <ToastTitle>Could not save list order</ToastTitle>
      </ToastContent>
      <ToastProgress />
    </Toast>
  ));
};

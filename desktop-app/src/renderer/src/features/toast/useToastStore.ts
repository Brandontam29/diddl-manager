import { nanoid } from 'nanoid';
import { create } from 'zustand';

export type ToastType = 'error' | 'warning' | 'success' | 'information' | 'update';

const toastDurationMap = {
  short: 2750,
  medium: 5500,
  long: 9000,
  'extra-long': 15000
} as const;

export type ToastDuration = keyof typeof toastDurationMap;

const DEFAULT_DURATION = 'medium';

export type Toast = {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration: number;
  onClick: () => void;
  onClose: () => void;

  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
};

export type ToastProps = {
  type: ToastType;
  title: string;
  message: string;
  duration?: ToastDuration;
  onClick?: () => void;
  onClose?: () => void;

  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
};

type ToastStore = {
  toasts: Toast[];
  addToast: (toastProps: ToastProps) => void;
  removeToast: (id: string) => void;
};

const MAX_TAOST = 3;

const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  addToast: (toastProps) => {
    const { toasts } = get();

    if (toasts.length >= MAX_TAOST) {
      toasts.splice(1);
    }

    const newToast = generateToast(toastProps);

    set({
      toasts: [...toasts, newToast]
    });
  },

  removeToast: (id: string) =>
    set((state) => ({
      toasts: state.toasts.filter((item) => item.id !== id)
    }))
}));

const generateToast = (toastProps: ToastProps): Toast => {
  const { removeToast } = useToastStore.getState();

  const id = nanoid();
  const DEFAULT_PROPS = {
    onClick: () => removeToast(id),
    onClose: () => removeToast(id),
    duration: toastDurationMap[DEFAULT_DURATION]
  };

  return {
    id,
    ...DEFAULT_PROPS,
    ...toastProps,
    duration: toastDurationMap[toastProps.duration || DEFAULT_DURATION]
  };
};

export default useToastStore;

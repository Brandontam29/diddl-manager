import Toaster from './Toaster';
import useToastStore, { ToastProps } from './useToastStore';

const toast = (props: ToastProps) => {
    const { addToast } = useToastStore.getState();

    addToast(props);
};

const dismissToast = (id: string) => {
    const { removeToast } = useToastStore.getState();

    removeToast(id);
};

export { Toaster, useToastStore, toast, dismissToast };

import Toast from './Toast';
import useToastStore from './useToastStore';

const Toaster = () => {
  const toasts = useToastStore((state) => state.toasts);
  return (
    <div className="fixed left-1/2 top-10 flex -translate-x-1/2 transform flex-col-reverse gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default Toaster;

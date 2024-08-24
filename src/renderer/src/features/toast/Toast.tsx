import { cva, cx } from 'class-variance-authority';
import { useEffect } from 'react';

import cxtw from '@renderer/utils/cxtw';

import Button from '@/components/atoms/Button';
import Heading from '@/components/atoms/Heading';
import Icon from '@/components/atoms/Icon';

import { Toast } from './useToastStore';

const toastHeading = cva('leading-none', {
  variants: {
    variant: {
      success: ['text-green-800'],
      error: ['text-red-800'],
      warning: ['text-yellow-800'],
      information: ['text-sky-800'],
      update: ['text-orange-800']
    }
  },

  defaultVariants: {
    variant: 'information'
  }
});

const toastDescription = cva('leading-tight', {
  variants: {
    variant: {
      success: ['text-green-700'],
      error: ['text-red-700'],
      warning: ['text-yellow-700'],
      information: ['text-sky-700'],
      update: ['text-orange-700']
    }
  },

  defaultVariants: {
    variant: 'information'
  }
});

const toastContainer = cva('min-w-sm w-full max-w-xl rounded p-4 shadow space-y-2', {
  variants: {
    variant: {
      success: ['bg-green-50'],
      error: ['bg-red-50'],
      warning: ['bg-yellow-50'],
      information: ['bg-sky-50'],
      update: ['bg-orange-50']
    }
  },

  defaultVariants: {
    variant: 'information'
  }
});

type Props = {
  toast: Toast;
};

const ToastBox = ({ toast }: Props) => {
  const { title, duration, onClick, onClose, type, message, onPrimaryClick, onSecondaryClick } =
    toast;

  useEffect(() => {
    setTimeout(() => {
      onClose();
    }, duration);
  }, []);

  return (
    <div className={cxtw(toastContainer({ variant: type }))} onClick={onClick}>
      <div className="flex justify-between">
        <Heading as="h1" size="size-lg" className={cxtw(toastHeading({ variant: type }))}>
          {title}
        </Heading>
        <button type="button" onClick={onClose}>
          <Icon name="XMarkIcon" size="size-4.5" />
        </button>
      </div>
      <p className={toastDescription({ variant: type })}>{message}</p>

      <div className="flex w-full justify-end gap-4">
        {!!onSecondaryClick && (
          <Button variant="secondary" size="medium" onClick={onSecondaryClick}>
            Dismiss
          </Button>
        )}

        {!!onPrimaryClick && (
          <Button variant="primary" size="medium" onClick={onPrimaryClick}>
            Okay
          </Button>
        )}
      </div>
    </div>
  );
};

export default ToastBox;

import toast, { ToastOptions } from 'react-hot-toast';

type NotifyOptions = ToastOptions;

const baseOptions: ToastOptions = {
  duration: 4000,
};

export const notify = {
  success: (message: string, options?: NotifyOptions) =>
    toast.success(message, {
      ...baseOptions,
      ariaProps: { role: 'status', 'aria-live': 'polite' },
      ...options,
    }),

  error: (message: string, options?: NotifyOptions) =>
    toast.error(message, {
      ...baseOptions,
      ariaProps: { role: 'alert', 'aria-live': 'assertive' },
      ...options,
    }),

  info: (message: string, options?: NotifyOptions) =>
    toast(message, {
      ...baseOptions,
      ariaProps: { role: 'status', 'aria-live': 'polite' },
      ...options,
    }),
};


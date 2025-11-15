/**
 * Toast Notification Utility
 * Wrapper around react-hot-toast for consistent notification styling
 */
import toast from 'react-hot-toast';
import { SUCCESS_MESSAGES } from './constants';

// Toast configuration
const toastConfig = {
  duration: 3000,
  style: {
    borderRadius: '10px',
    background: '#333',
    color: '#fff',
    padding: '16px',
    fontSize: '14px',
  },
  success: {
    duration: 3000,
    iconTheme: {
      primary: '#10b981',
      secondary: '#fff',
    },
  },
  error: {
    duration: 4000,
    iconTheme: {
      primary: '#ef4444',
      secondary: '#fff',
    },
  },
  loading: {
    iconTheme: {
      primary: '#3b82f6',
      secondary: '#fff',
    },
  },
};

/**
 * Success toast notification
 */
export const toastSuccess = (message) => {
  return toast.success(message, toastConfig.success);
};

/**
 * Error toast notification
 */
export const toastError = (message) => {
  return toast.error(message, toastConfig.error);
};

/**
 * Loading toast notification
 */
export const toastLoading = (message) => {
  return toast.loading(message, toastConfig.loading);
};

/**
 * Promise-based toast (shows loading, then success/error)
 */
export const toastPromise = (promise, messages) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading || 'Chargement...',
      success: messages.success || SUCCESS_MESSAGES.SAVED,
      error: (err) => messages.error || err?.message || 'Une erreur est survenue',
    },
    toastConfig
  );
};

/**
 * Dismiss a specific toast
 */
export const toastDismiss = (toastId) => {
  toast.dismiss(toastId);
};

/**
 * Dismiss all toasts
 */
export const toastDismissAll = () => {
  toast.dismiss();
};

/**
 * Custom toast with icon
 */
export const toastCustom = (message, icon) => {
  return toast(message, {
    icon,
    ...toastConfig,
  });
};

/**
 * Copy to clipboard with toast feedback
 */
export const copyToClipboard = async (text, successMessage = SUCCESS_MESSAGES.CAPTION_COPIED) => {
  try {
    await navigator.clipboard.writeText(text);
    toastSuccess(successMessage);
    return true;
  } catch (error) {
    toastError('Impossible de copier dans le presse-papier');
    return false;
  }
};

export default {
  success: toastSuccess,
  error: toastError,
  loading: toastLoading,
  promise: toastPromise,
  dismiss: toastDismiss,
  dismissAll: toastDismissAll,
  custom: toastCustom,
  copyToClipboard,
};

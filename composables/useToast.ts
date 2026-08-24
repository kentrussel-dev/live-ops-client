import { ref } from 'vue';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

const toasts = ref<ToastItem[]>([]);

export function useToast() {
  function show(toast: Omit<ToastItem, 'id'>) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newToast: ToastItem = {
      ...toast,
      id,
      duration: toast.duration || 4000,
    };

    toasts.value.push(newToast);

    setTimeout(() => {
      remove(id);
    }, newToast.duration);
  }

  function success(title: string, message?: string) {
    show({ type: 'success', title, message });
  }

  function error(title: string, message?: string) {
    show({ type: 'error', title, message, duration: 6000 });
  }

  function warning(title: string, message?: string) {
    show({ type: 'warning', title, message });
  }

  function info(title: string, message?: string) {
    show({ type: 'info', title, message });
  }

  function remove(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  return {
    toasts,
    show,
    success,
    error,
    warning,
    info,
    remove,
  };
}

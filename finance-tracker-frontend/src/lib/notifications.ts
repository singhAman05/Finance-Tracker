import { toast } from "sonner";

type NotificationType =
  | "success"
  | "error"
  | "warning"
  | "info";

interface NotifyOptions {
  title?: string;
  description?: string;
}

export const notify = {
  success(message: string, opts?: NotifyOptions) {
    toast.success(opts?.title ?? "Success", {
      description: message,
    });
  },

  error(message: string, opts?: NotifyOptions) {
    toast.error(opts?.title ?? "Error", {
      description: message,
    });
  },

  warning(message: string, opts?: NotifyOptions) {
    toast.warning(opts?.title ?? "Warning", {
      description: message,
    });
  },

  info(message: string, opts?: NotifyOptions) {
    toast(opts?.title ?? "Info", {
      description: message,
    });
  },
};

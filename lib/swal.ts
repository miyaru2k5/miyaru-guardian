/**
 * Miyaru Swal — SweetAlert2-style notifications for the whole app.
 *
 * Usage:
 *   import { swal } from "@/lib/swal";
 *   await swal.success("Đã lưu");
 *   await swal.error("Lỗi", "Chi tiết...");
 *   const ok = await swal.confirm({ title: "Xóa?", text: "Không hoàn tác" });
 *   await swal.fire({ icon: "info", title: "...", toast: true, timer: 2500 });
 */

export type SwalIcon =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "question"
  | "none";

export type SwalPosition =
  | "center"
  | "top"
  | "top-end"
  | "top-start"
  | "bottom"
  | "bottom-end";

export interface SwalOptions {
  title?: string;
  text?: string;
  html?: string;
  icon?: SwalIcon;
  /** Show cancel button (confirm dialogs) */
  showCancelButton?: boolean;
  showConfirmButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  /** Confirm button style */
  confirmVariant?: "default" | "destructive" | "success" | "outline";
  /** Auto-close after ms (toast or modal) */
  timer?: number;
  /** Non-blocking corner notification */
  toast?: boolean;
  position?: SwalPosition;
  /** Allow click outside to dismiss */
  allowOutsideClick?: boolean;
  /** Custom class on panel */
  customClass?: string;
}

export interface SwalResult {
  isConfirmed: boolean;
  isDenied: boolean;
  isDismissed: boolean;
  value?: unknown;
}

type InternalState = {
  open: boolean;
  options: SwalOptions;
  resolve: ((result: SwalResult) => void) | null;
};

type Listener = (state: InternalState) => void;

const DEFAULT_OPTIONS: SwalOptions = {
  icon: "none",
  showConfirmButton: true,
  showCancelButton: false,
  confirmButtonText: "OK",
  cancelButtonText: "Hủy",
  confirmVariant: "default",
  toast: false,
  position: "center",
  allowOutsideClick: true,
};

let state: InternalState = {
  open: false,
  options: { ...DEFAULT_OPTIONS },
  resolve: null,
};

const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l(state));
}

export function subscribeSwal(listener: Listener): () => void {
  listeners.add(listener);
  listener(state);
  return () => listeners.delete(listener);
}

export function getSwalState(): InternalState {
  return state;
}

function closeWith(result: SwalResult) {
  const resolve = state.resolve;
  state = {
    open: false,
    options: { ...DEFAULT_OPTIONS },
    resolve: null,
  };
  emit();
  resolve?.(result);
}

/** Imperative API used by SwalHost */
export const swalController = {
  confirm() {
    closeWith({ isConfirmed: true, isDenied: false, isDismissed: false });
  },
  cancel() {
    closeWith({ isConfirmed: false, isDenied: false, isDismissed: true });
  },
  dismiss() {
    closeWith({ isConfirmed: false, isDenied: false, isDismissed: true });
  },
};

function fire(options: SwalOptions = {}): Promise<SwalResult> {
  // Chain: close previous if open
  if (state.open && state.resolve) {
    state.resolve({ isConfirmed: false, isDenied: false, isDismissed: true });
  }

  return new Promise<SwalResult>((resolve) => {
    state = {
      open: true,
      options: {
        ...DEFAULT_OPTIONS,
        ...options,
        // toast defaults
        ...(options.toast
          ? {
              showConfirmButton: options.showConfirmButton ?? false,
              position: options.position ?? "top-end",
              timer: options.timer ?? 2800,
              allowOutsideClick: true,
            }
          : {}),
      },
      resolve,
    };
    emit();
  });
}

export const swal = {
  fire,

  success(title: string, text?: string, opts?: Partial<SwalOptions>) {
    return fire({
      icon: "success",
      title,
      text,
      toast: false,
      position: "center",
      showConfirmButton: true,
      confirmButtonText: "Đóng",
      ...opts,
    });
  },

  error(title: string, text?: string, opts?: Partial<SwalOptions>) {
    return fire({
      icon: "error",
      title,
      text,
      toast: false,
      position: "center",
      showConfirmButton: true,
      confirmButtonText: "Đóng",
      confirmVariant: "destructive",
      ...opts,
    });
  },

  warning(title: string, text?: string, opts?: Partial<SwalOptions>) {
    return fire({
      icon: "warning",
      title,
      text,
      toast: false,
      position: "center",
      showConfirmButton: true,
      confirmButtonText: "Đóng",
      ...opts,
    });
  },

  info(title: string, text?: string, opts?: Partial<SwalOptions>) {
    return fire({
      icon: "info",
      title,
      text,
      toast: false,
      position: "center",
      showConfirmButton: true,
      confirmButtonText: "Đóng",
      ...opts,
    });
  },

  /** Confirm dialog — returns true if user confirmed */
  async confirm(opts: {
    title?: string;
    text?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    confirmVariant?: SwalOptions["confirmVariant"];
    icon?: SwalIcon;
  }): Promise<boolean> {
    const result = await fire({
      icon: opts.icon ?? "question",
      title: opts.title ?? "Xác nhận",
      text: opts.text,
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: opts.confirmButtonText ?? "Đồng ý",
      cancelButtonText: opts.cancelButtonText ?? "Hủy",
      confirmVariant: opts.confirmVariant ?? "default",
      allowOutsideClick: false,
    });
    return result.isConfirmed;
  },

  /** Delete confirm helper */
  async confirmDelete(opts?: {
    title?: string;
    text?: string;
  }): Promise<boolean> {
    return swal.confirm({
      icon: "warning",
      title: opts?.title ?? "Xác nhận xóa",
      text:
        opts?.text ??
        "Bạn có chắc chắn muốn xóa? Hành động này không thể hoàn tác.",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmVariant: "destructive",
    });
  },

  /**
   * Same centered modal form as success/error/confirm (not corner toast).
   * Kept for API compatibility — always shows modal dialog.
   */
  toast(
    title: string,
    opts?: Partial<SwalOptions> & { description?: string }
  ) {
    const icon = opts?.icon ?? "success";
    const { toast: _ignoredToast, description, ...rest } = opts ?? {};
    return fire({
      title,
      text: description ?? opts?.text,
      icon,
      position: "center",
      showConfirmButton: true,
      showCancelButton: false,
      confirmButtonText: "Đóng",
      confirmVariant: icon === "error" ? "destructive" : "default",
      allowOutsideClick: true,
      ...rest,
      // Always modal form (same shell as delete confirm)
      toast: false,
    });
  },
};

export default swal;

/**
 * Project-wide notifications — always modal (SweetAlert2 form), same style as delete confirm.
 */
import { swal, type SwalIcon } from "@/lib/swal";

type ToastInput = {
  title?: string | number;
  description?: string | number;
  variant?: "default" | "destructive" | string;
  duration?: number;
};

function toText(node: string | number | undefined): string | undefined {
  if (node == null) return undefined;
  return String(node);
}

function iconFromVariant(variant?: string): SwalIcon {
  if (variant === "destructive") return "error";
  return "success";
}

/**
 * All notifications use centered modal form (same shell as confirm-delete).
 */
function toast(props: ToastInput) {
  const title = toText(props.title) || "Thông báo";
  const text = toText(props.description);
  const icon = iconFromVariant(props.variant);

  void swal.fire({
    icon,
    title,
    text,
    toast: false,
    position: "center",
    showConfirmButton: true,
    showCancelButton: false,
    confirmButtonText: "Đóng",
    confirmVariant: icon === "error" ? "destructive" : "default",
    allowOutsideClick: true,
    // optional auto-close for non-errors
    timer: icon === "error" ? undefined : props.duration,
  });

  return {
    id: String(Date.now()),
    dismiss: () => undefined,
    update: () => undefined,
  };
}

function useToast() {
  return {
    toasts: [] as { id: string }[],
    toast,
    dismiss: (_toastId?: string) => undefined,
  };
}

export { useToast, toast };

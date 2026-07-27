"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getSwalState,
  subscribeSwal,
  swalController,
  type SwalIcon,
  type SwalOptions,
  type SwalPosition,
} from "@/lib/swal";

const ICON_MAP: Record<
  Exclude<SwalIcon, "none">,
  { node: React.ReactNode; ring: string; bg: string }
> = {
  success: {
    node: <CheckCircle2 className="h-10 w-10 text-success" strokeWidth={1.75} />,
    ring: "ring-success/30",
    bg: "bg-success/10",
  },
  error: {
    node: <XCircle className="h-10 w-10 text-destructive" strokeWidth={1.75} />,
    ring: "ring-destructive/30",
    bg: "bg-destructive/10",
  },
  warning: {
    node: <AlertTriangle className="h-10 w-10 text-warning" strokeWidth={1.75} />,
    ring: "ring-warning/30",
    bg: "bg-warning/10",
  },
  info: {
    node: <Info className="h-10 w-10 text-info" strokeWidth={1.75} />,
    ring: "ring-info/30",
    bg: "bg-info/10",
  },
  question: {
    node: <HelpCircle className="h-10 w-10 text-primary" strokeWidth={1.75} />,
    ring: "ring-primary/30",
    bg: "bg-primary/10",
  },
};

function positionClass(pos: SwalPosition | undefined, toast: boolean) {
  if (!toast) return "items-center justify-center";
  switch (pos) {
    case "top":
      return "items-start justify-center pt-6";
    case "top-start":
      return "items-start justify-start p-4 sm:p-6";
    case "bottom":
      return "items-end justify-center pb-6";
    case "bottom-end":
      return "items-end justify-end p-4 sm:p-6";
    case "top-end":
    default:
      return "items-start justify-end p-4 sm:p-6";
  }
}

function SwalIconBadge({ icon }: { icon: SwalIcon }) {
  if (!icon || icon === "none") return null;
  const cfg = ICON_MAP[icon];
  return (
    <div
      className={cn(
        "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ring-4",
        cfg.bg,
        cfg.ring
      )}
    >
      {cfg.node}
    </div>
  );
}

export default function SwalHost() {
  const [snapshot, setSnapshot] = useState(getSwalState);

  useEffect(() => subscribeSwal(setSnapshot), []);

  const { open, options } = snapshot;
  const opts: SwalOptions = options;
  const isToast = !!opts.toast;

  // Auto timer
  useEffect(() => {
    if (!open || !opts.timer) return;
    const t = window.setTimeout(() => {
      swalController.dismiss();
    }, opts.timer);
    return () => window.clearTimeout(t);
  }, [open, opts.timer]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (opts.showCancelButton) swalController.cancel();
        else if (opts.allowOutsideClick !== false) swalController.dismiss();
      }
      if (e.key === "Enter" && opts.showConfirmButton !== false && !opts.toast) {
        e.preventDefault();
        swalController.confirm();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, opts.showCancelButton, opts.showConfirmButton, opts.allowOutsideClick, opts.toast]);

  // Body scroll lock for modal
  useEffect(() => {
    if (!open || isToast) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isToast]);

  const onOverlayClick = useCallback(() => {
    if (opts.allowOutsideClick === false) return;
    if (opts.showCancelButton) swalController.cancel();
    else swalController.dismiss();
  }, [opts.allowOutsideClick, opts.showCancelButton]);

  if (!open) return null;

  const showConfirm = opts.showConfirmButton !== false;
  const showCancel = !!opts.showCancelButton;

  return (
    <div
      className={cn(
        "fixed inset-0 z-toast flex",
        positionClass(opts.position, isToast)
      )}
      role="presentation"
    >
      {/* Backdrop (modal only) */}
      {!isToast && (
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-in fade-in-0 duration-normal"
          onClick={onOverlayClick}
          aria-hidden
        />
      )}

      {/* Panel */}
      <div
        role="alertdialog"
        aria-modal={!isToast}
        aria-labelledby="swal-title"
        aria-describedby={opts.text || opts.html ? "swal-desc" : undefined}
        className={cn(
          "relative z-10 w-[min(100%-2rem,28rem)] outline-none",
          "animate-in fade-in-0 zoom-in-95 duration-normal",
          isToast
            ? "rounded-lg border border-border bg-card p-4 shadow-lg"
            : "rounded-2xl border border-border bg-card p-6 shadow-2xl",
          opts.customClass
        )}
      >
        {isToast && (
          <button
            type="button"
            onClick={() => swalController.dismiss()}
            className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground transition-opacity hover:opacity-100 opacity-70"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className={cn(isToast && "flex items-start gap-3 pr-6")}>
          {opts.icon && opts.icon !== "none" && (
            isToast ? (
              <div
                className={cn(
                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  ICON_MAP[opts.icon].bg
                )}
              >
                <span className="scale-75">{ICON_MAP[opts.icon].node}</span>
              </div>
            ) : (
              <SwalIconBadge icon={opts.icon} />
            )
          )}

          <div className={cn(!isToast && "text-center", isToast && "min-w-0 flex-1")}>
            {opts.title ? (
              <h2
                id="swal-title"
                className={cn(
                  "font-semibold tracking-tight text-foreground",
                  isToast ? "text-sm" : "text-lg"
                )}
              >
                {opts.title}
              </h2>
            ) : null}

            {opts.text ? (
              <p
                id="swal-desc"
                className={cn(
                  "text-muted-foreground",
                  isToast ? "mt-0.5 text-xs" : "mt-2 text-sm leading-relaxed"
                )}
              >
                {opts.text}
              </p>
            ) : null}

            {opts.html ? (
              <div
                id="swal-desc"
                className={cn(
                  "text-muted-foreground",
                  isToast ? "mt-0.5 text-xs" : "mt-2 text-sm leading-relaxed"
                )}
                dangerouslySetInnerHTML={{ __html: opts.html }}
              />
            ) : null}
          </div>
        </div>

        {!isToast && (showConfirm || showCancel) && (
          <div
            className={cn(
              "mt-6 flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-center",
              showCancel && "sm:justify-end"
            )}
          >
            {showCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={() => swalController.cancel()}
                className="min-w-24"
              >
                {opts.cancelButtonText ?? "Hủy"}
              </Button>
            )}
            {showConfirm && (
              <Button
                type="button"
                variant={
                  opts.confirmVariant === "destructive"
                    ? "destructive"
                    : opts.confirmVariant === "success"
                      ? "success"
                      : opts.confirmVariant === "outline"
                        ? "outline"
                        : "default"
                }
                onClick={() => swalController.confirm()}
                className="btn-glow min-w-24"
                autoFocus
              >
                {opts.confirmButtonText ?? "OK"}
              </Button>
            )}
          </div>
        )}

        {/* Toast progress bar */}
        {isToast && opts.timer ? (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden rounded-b-xl bg-border/50">
            <div
              className="swal-timer-bar h-full origin-left bg-primary"
              style={{ animationDuration: `${opts.timer}ms` }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

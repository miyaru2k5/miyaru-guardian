"use client";

import { useEffect, useRef } from "react";
import { swal } from "@/lib/swal";

interface Props {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

/**
 * Backward-compatible delete confirm — powered by Miyaru Swal.
 * Parent still uses open / onClose / onConfirm state.
 */
const ConfirmDeleteDialog = ({
  open,
  title = "Xác nhận xóa",
  description = "Bạn có chắc chắn muốn xóa? Hành động này không thể hoàn tác.",
  onClose,
  onConfirm,
  loading = false,
}: Props) => {
  const busy = useRef(false);
  const onConfirmRef = useRef(onConfirm);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onConfirmRef.current = onConfirm;
    onCloseRef.current = onClose;
  }, [onConfirm, onClose]);

  useEffect(() => {
    if (!open) {
      busy.current = false;
      return;
    }
    if (loading || busy.current) return;

    busy.current = true;
    void (async () => {
      const ok = await swal.confirmDelete({ title, text: description });
      busy.current = false;
      if (ok) onConfirmRef.current();
      else onCloseRef.current();
    })();
  }, [open, loading, title, description]);

  return null;
};

export default ConfirmDeleteDialog;

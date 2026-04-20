import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, Trash2 } from "lucide-react";

interface Props {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const ConfirmDeleteDialog = ({
  open,
  title = "Xác nhận xóa",
  description = "Bạn có chắc chắn muốn xóa? Hành động này không thể hoàn tác.",
  onClose,
  onConfirm,
  loading = false,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[95%] sm:max-w-md rounded-2xl p-5 sm:p-6">

        {/* HEADER */}
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-3 text-base sm:text-lg">

            {/* ICON */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
            </div>

            {/* TITLE */}
            <span className="leading-snug">{title}</span>
          </DialogTitle>
        </DialogHeader>

        {/* DESCRIPTION */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t">

          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Hủy
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {loading ? "Đang xóa..." : "Xóa"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
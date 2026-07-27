# Miyaru Swal (SweetAlert2-style)

Global notification system used across the app.

## Import

```ts
import { swal } from "@/lib/swal";
// or keep using existing toast()
import { toast } from "@/hooks/use-toast";
```

## API

```ts
// Modal
await swal.success("Thành công", "Đã lưu dữ liệu");
await swal.error("Lỗi", "Chi tiết lỗi");
await swal.warning("Cảnh báo");
await swal.info("Thông tin");

// Confirm
const ok = await swal.confirm({
  title: "Xác nhận",
  text: "Tiếp tục?",
  confirmButtonText: "Đồng ý",
});

// Delete
const del = await swal.confirmDelete({ title: "Xóa mục này?" });

// Toast (góc màn hình, tự tắt)
await swal.toast("Đã copy", { icon: "success", timer: 2000 });

// Full options
await swal.fire({
  icon: "question",
  title: "...",
  text: "...",
  showCancelButton: true,
  confirmButtonText: "OK",
  cancelButtonText: "Hủy",
  confirmVariant: "destructive",
  toast: false,
  timer: undefined,
});
```

## Legacy toast bridge

```ts
toast({ title: "OK", description: "..." });
toast({ title: "Lỗi", description: "...", variant: "destructive" });
toast({ title: "Modal", modal: true }); // force modal
```

## Host

`SwalHost` is mounted once in `app/providers.tsx`.

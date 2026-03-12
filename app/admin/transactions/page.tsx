"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, CheckCircle, Clock, Ban, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const txSchema = z.object({
  transaction_code: z.string().min(1, "Bắt buộc").max(50),
  buyer_name: z.string().min(1, "Bắt buộc").max(100),
  seller_name: z.string().min(1, "Bắt buộc").max(100),
  amount: z.coerce.number().min(0),
  fee: z.coerce.number().min(0),
  notes: z.string().max(500).optional(),
});

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Đang chờ", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: Clock },
  confirmed: { label: "Đã xác nhận", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: CheckCircle },
  completed: { label: "Hoàn tất", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: CheckCircle },
  cancelled: { label: "Hủy", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: Ban },
};

const Transactions = () => {
  const [txs, setTxs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ id: string; action: string } | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof txSchema>>({
    resolver: zodResolver(txSchema),
    defaultValues: { amount: 0, fee: 0 },
  });

  const fetchTxs = async () => {
    const { data } = await supabase.from("transactions").select("*").order("created_at", { ascending: false });
    setTxs(data || []);
  };

  useEffect(() => { fetchTxs(); }, []);

  const onSubmit = async (data: z.infer<typeof txSchema>) => {
    const { error } = await supabase.from("transactions").insert([{ transaction_code: data.transaction_code, buyer_name: data.buyer_name, seller_name: data.seller_name, amount: data.amount, fee: data.fee, notes: data.notes || "" }]);
    if (error) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Đã tạo giao dịch" });
    setDialogOpen(false);
    reset({ amount: 0, fee: 0 });
    fetchTxs();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("transactions").update({ status }).eq("id", id);
    toast({ title: `Giao dịch đã ${statusConfig[status].label.toLowerCase()}` });
    setConfirmDialog(null);
    fetchTxs();
  };

  const filtered = txs.filter(t => {
    const matchSearch = t.transaction_code.toLowerCase().includes(search.toLowerCase()) ||
      t.buyer_name.toLowerCase().includes(search.toLowerCase()) ||
      t.seller_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const exportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ["Mã GD", "Người mua", "Người bán", "Số tiền", "Phí", "Trạng thái", "Ngày tạo"];
    const rows = filtered.map(t => [
      t.transaction_code,
      t.buyer_name,
      t.seller_name,
      t.amount,
      t.fee,
      statusConfig[t.status]?.label || t.status,
      new Date(t.created_at).toLocaleDateString("vi-VN"),
    ]);
    const bom = "\uFEFF";
    const csv = bom + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `giao-dich-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Giao dịch trung gian</h1>
          <p className="text-muted-foreground text-sm">Quản lý giao dịch GDTG</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV} disabled={filtered.length === 0} className="gap-2">
            <Download size={16} /> Xuất CSV
          </Button>
          <Button onClick={() => { reset({ transaction_code: "", buyer_name: "", seller_name: "", amount: 0, fee: 0, notes: "" }); setDialogOpen(true); }} className="btn-glow gap-2">
            <Plus size={16} /> Tạo giao dịch
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm..." className="pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "confirmed", "completed", "cancelled"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${filterStatus === s ? "bg-primary/20 text-primary border-primary/40" : "border-border text-muted-foreground hover:text-foreground"}`}>
              {s === "all" ? "Tất cả" : statusConfig[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Mã GD</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Người mua</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Người bán</th>
              <th className="text-right py-3 px-4 text-muted-foreground font-medium">Số tiền</th>
              <th className="text-right py-3 px-4 text-muted-foreground font-medium">Phí</th>
              <th className="text-center py-3 px-4 text-muted-foreground font-medium">Trạng thái</th>
              <th className="text-center py-3 px-4 text-muted-foreground font-medium">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => {
              const sc = statusConfig[t.status];
              return (
                <tr key={t.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-foreground">{t.transaction_code}</td>
                  <td className="py-3 px-4 text-foreground">{t.buyer_name}</td>
                  <td className="py-3 px-4 text-foreground">{t.seller_name}</td>
                  <td className="py-3 px-4 text-right font-semibold text-primary">{Number(t.amount).toLocaleString("vi-VN")}đ</td>
                  <td className="py-3 px-4 text-right text-muted-foreground">{Number(t.fee).toLocaleString("vi-VN")}đ</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${sc.color}`}>
                      <sc.icon size={12} />{sc.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-1">
                      {t.status === "pending" && (
                        <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setConfirmDialog({ id: t.id, action: "confirmed" })}>Xác nhận</Button>
                      )}
                      {t.status === "confirmed" && (
                        <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setConfirmDialog({ id: t.id, action: "completed" })}>Hoàn tất</Button>
                      )}
                      {(t.status === "pending" || t.status === "confirmed") && (
                        <Button size="sm" variant="outline" className="text-xs h-7 text-destructive" onClick={() => setConfirmDialog({ id: t.id, action: "cancelled" })}>Hủy</Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Không có giao dịch nào</p>}
      </div>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Tạo giao dịch mới</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Mã giao dịch</label>
              <Input {...register("transaction_code")} placeholder="Nhập mã giao dịch" />
              {errors.transaction_code && <p className="text-xs text-destructive mt-1">{errors.transaction_code.message}</p>}
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Người mua</label>
              <Input {...register("buyer_name")} placeholder="Nhập tên người mua" />
              {errors.buyer_name && <p className="text-xs text-destructive mt-1">{errors.buyer_name.message}</p>}
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Người bán</label>
              <Input {...register("seller_name")} placeholder="Nhập tên người bán" />
              {errors.seller_name && <p className="text-xs text-destructive mt-1">{errors.seller_name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Số tiền</label>
                <Input {...register("amount")} type="number" placeholder="0" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Phí</label>
                <Input {...register("fee")} type="number" placeholder="0" />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Ghi chú</label>
              <Input {...register("notes")} placeholder="Nhập ghi chú (tùy chọn)" />
            </div>
            <Button type="submit" className="w-full btn-glow">Tạo giao dịch</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Xác nhận</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Bạn có chắc muốn {confirmDialog?.action === "confirmed" ? "xác nhận giữ tiền" : confirmDialog?.action === "completed" ? "hoàn tất" : "hủy"} giao dịch này?</p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmDialog(null)}>Không</Button>
            <Button className="flex-1 btn-glow" onClick={() => confirmDialog && updateStatus(confirmDialog.id, confirmDialog.action)}>Xác nhận</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;

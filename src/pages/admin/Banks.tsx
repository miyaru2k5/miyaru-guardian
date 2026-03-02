import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Eye, EyeOff, Copy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

const bankSchema = z.object({
  bank_name: z.string().min(1, "Bắt buộc").max(100),
  account_number: z.string().min(1, "Bắt buộc").max(50),
  account_holder: z.string().min(1, "Bắt buộc").max(100),
  logo_url: z.string().max(500).optional(),
  qr_image_url: z.string().max(500).optional(),
});

const Banks = () => {
  const [banks, setBanks] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editBank, setEditBank] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof bankSchema>>({
    resolver: zodResolver(bankSchema),
  });

  const fetchBanks = async () => {
    const { data } = await supabase.from("bank_accounts").select("*").order("created_at", { ascending: false });
    setBanks(data || []);
  };

  useEffect(() => { fetchBanks(); }, []);

  const onSubmit = async (data: z.infer<typeof bankSchema>) => {
    const payload = {
      bank_name: data.bank_name,
      account_number: data.account_number,
      account_holder: data.account_holder,
      logo_url: data.logo_url || null,
      qr_image_url: data.qr_image_url || null,
    };

    if (editBank) {
      const { error } = await supabase.from("bank_accounts").update(payload).eq("id", editBank.id);
      if (error) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Đã cập nhật" });
    } else {
      const { error } = await supabase.from("bank_accounts").insert([payload]);
      if (error) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Đã thêm ngân hàng" });
    }
    setDialogOpen(false); setEditBank(null); reset(); fetchBanks();
  };

  const toggleVisibility = async (bank: any) => {
    await supabase.from("bank_accounts").update({ is_visible: !bank.is_visible }).eq("id", bank.id);
    fetchBanks();
  };

  const deleteBank = async () => {
    if (!deleteId) return;
    await supabase.from("bank_accounts").delete().eq("id", deleteId);
    toast({ title: "Đã xóa" });
    setDeleteId(null);
    fetchBanks();
  };

  const copyAccount = (num: string) => {
    navigator.clipboard.writeText(num);
    toast({ title: "Đã copy số tài khoản" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ngân hàng</h1>
          <p className="text-muted-foreground text-sm">Quản lý tài khoản ngân hàng</p>
        </div>
        <Button
          onClick={() => {
            setEditBank(null);
            reset({ bank_name: "", account_number: "", account_holder: "", logo_url: "", qr_image_url: "" });
            setDialogOpen(true);
          }}
          className="btn-glow gap-2"
        >
          <Plus size={16} /> Thêm
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banks.map(b => (
          <div key={b.id} className={`glow-border rounded-2xl p-5 card-hover ${!b.is_visible ? "opacity-50" : ""}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {b.logo_url && (
                  <img
                    src={b.logo_url}
                    alt={b.bank_name}
                    className="w-8 h-8 rounded-md object-contain bg-card border border-border"
                  />
                )}
                <h3 className="text-lg font-bold text-foreground">{b.bank_name}</h3>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${b.is_visible ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                {b.is_visible ? "Hiện" : "Ẩn"}
              </span>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Số TK</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-foreground">{b.account_number}</span>
                  <button onClick={() => copyAccount(b.account_number)} className="text-muted-foreground hover:text-primary"><Copy size={14} /></button>
                </div>
              </div>
              <div className="flex justify-between"><span className="text-muted-foreground">Chủ TK</span><span className="font-medium text-foreground">{b.account_holder}</span></div>
            </div>
            {b.qr_image_url && (
              <div className="mt-2 flex justify-end">
                <img
                  src={b.qr_image_url}
                  alt={`QR ${b.bank_name}`}
                  className="w-16 h-16 rounded-xl border border-border object-cover bg-card"
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => toggleVisibility(b)} className="flex-1 gap-1">
                {b.is_visible ? <><EyeOff size={14} /> Ẩn</> : <><Eye size={14} /> Hiện</>}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditBank(b);
                  reset({
                    bank_name: b.bank_name,
                    account_number: b.account_number,
                    account_holder: b.account_holder,
                    logo_url: b.logo_url || "",
                    qr_image_url: b.qr_image_url || "",
                  });
                  setDialogOpen(true);
                }}
              >
                <Edit size={14} />
              </Button>
              <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(b.id)}><Trash2 size={14} /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editBank ? "Sửa ngân hàng" : "Thêm ngân hàng"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Tên ngân hàng</label>
              <Input {...register("bank_name")} placeholder="VD: Vietcombank, MB Bank..." />
              {errors.bank_name && <p className="text-xs text-destructive mt-1">{errors.bank_name.message}</p>}
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Số tài khoản</label>
              <Input {...register("account_number")} placeholder="Nhập số tài khoản" />
              {errors.account_number && <p className="text-xs text-destructive mt-1">{errors.account_number.message}</p>}
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Chủ tài khoản</label>
              <Input {...register("account_holder")} placeholder="Nhập tên chủ tài khoản" />
              {errors.account_holder && <p className="text-xs text-destructive mt-1">{errors.account_holder.message}</p>}
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Logo ngân hàng (URL)</label>
              <Input {...register("logo_url")} placeholder="https://..." />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Ảnh QR chuyển khoản (URL)</label>
              <Input {...register("qr_image_url")} placeholder="https://..." />
            </div>
            <Button type="submit" className="w-full btn-glow">{editBank ? "Cập nhật" : "Thêm mới"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteId}
        title="Xác nhận xóa ngân hàng"
        description="Bạn có chắc chắn muốn xóa ngân hàng này?"
        onClose={() => setDeleteId(null)}
        onConfirm={deleteBank}
      />
    </div>
  );
};

export default Banks;

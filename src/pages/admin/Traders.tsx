import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Power } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const traderSchema = z.object({
  name: z.string().min(1, "Bắt buộc").max(100),
  code: z.string().min(1, "Bắt buộc").max(20),
  service: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  insurance_fund: z.coerce.number().min(0),
  success_rate: z.coerce.number().min(0).max(100),
});

type TraderForm = z.infer<typeof traderSchema>;

const Traders = () => {
  const [traders, setTraders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [editTrader, setEditTrader] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TraderForm>({
    resolver: zodResolver(traderSchema),
    defaultValues: { insurance_fund: 0, success_rate: 100 },
  });

  const fetchTraders = async () => {
    const { data } = await supabase.from("traders").select("*").order("created_at", { ascending: false });
    setTraders(data || []);
  };

  useEffect(() => { fetchTraders(); }, []);

  const onSubmit = async (data: TraderForm) => {
    if (editTrader) {
      const { error } = await supabase.from("traders").update(data).eq("id", editTrader.id);
      if (error) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Đã cập nhật GDV" });
    } else {
      const { error } = await supabase.from("traders").insert([{ name: data.name, code: data.code, service: data.service || "", description: data.description || "", insurance_fund: data.insurance_fund, success_rate: data.success_rate }]);
      if (error) { toast({ title: "Lỗi", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Đã thêm GDV mới" });
    }
    setDialogOpen(false);
    setEditTrader(null);
    reset({ insurance_fund: 0, success_rate: 100 });
    fetchTraders();
  };

  const toggleStatus = async (trader: any) => {
    const newStatus = trader.status === "LIVE" ? "OFFLINE" : "LIVE";
    await supabase.from("traders").update({ status: newStatus }).eq("id", trader.id);
    fetchTraders();
  };

  const deleteTrader = async (id: string) => {
    if (!confirm("Xác nhận xóa GDV này?")) return;
    await supabase.from("traders").delete().eq("id", id);
    toast({ title: "Đã xóa GDV" });
    fetchTraders();
  };

  const openEdit = (t: any) => {
    setEditTrader(t);
    reset({ name: t.name, code: t.code, service: t.service || "", description: t.description || "", insurance_fund: t.insurance_fund, success_rate: Number(t.success_rate) });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditTrader(null);
    reset({ name: "", code: "", service: "", description: "", insurance_fund: 0, success_rate: 100 });
    setDialogOpen(true);
  };

  const filtered = traders.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Giao dịch viên</h1>
          <p className="text-muted-foreground text-sm">Quản lý danh sách GDV</p>
        </div>
        <Button onClick={openNew} className="btn-glow gap-2"><Plus size={16} /> Thêm GDV</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm..." className="pl-10" />
        </div>
        <div className="flex gap-2">
          {["all", "LIVE", "OFFLINE"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${filterStatus === s ? "bg-primary/20 text-primary border-primary/40" : "border-border text-muted-foreground hover:text-foreground"}`}>
              {s === "all" ? "Tất cả" : s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(t => (
          <div key={t.id} className="glow-border rounded-2xl p-5 card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20">
                  <span className="text-lg font-bold text-primary">{t.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t.name}</h3>
                  <p className="text-xs text-muted-foreground">{t.service || t.code}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${t.status === "LIVE" ? "status-live" : "status-offline"}`}>
                {t.status}
              </span>
            </div>
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Mã GDV</span><span className="font-medium text-foreground">{t.code}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Quỹ BH</span><span className="font-semibold text-primary">{Number(t.insurance_fund).toLocaleString("vi-VN")}đ</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">% Thành công</span><span className="text-foreground">{Number(t.success_rate)}%</span></div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => toggleStatus(t)} className="flex-1 gap-1"><Power size={14} />{t.status === "LIVE" ? "Tắt" : "Bật"}</Button>
              <Button size="sm" variant="outline" onClick={() => openEdit(t)}><Edit size={14} /></Button>
              <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => deleteTrader(t.id)}><Trash2 size={14} /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editTrader ? "Sửa GDV" : "Thêm GDV mới"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div><Input {...register("name")} placeholder="Tên GDV" />{errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}</div>
            <div><Input {...register("code")} placeholder="Mã GDV (VD: GDV#001)" />{errors.code && <p className="text-xs text-destructive mt-1">{errors.code.message}</p>}</div>
            <div><Input {...register("service")} placeholder="Dịch vụ" /></div>
            <div><Input {...register("insurance_fund")} type="number" placeholder="Quỹ bảo hiểm" /></div>
            <div><Input {...register("success_rate")} type="number" placeholder="% Thành công" /></div>
            <div><Input {...register("description")} placeholder="Mô tả" /></div>
            <Button type="submit" className="w-full btn-glow">{editTrader ? "Cập nhật" : "Thêm mới"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Traders;

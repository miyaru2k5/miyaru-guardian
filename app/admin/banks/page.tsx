"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Landmark,
  Search,
  CreditCard,
  TrendingUp,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import Image from "next/image";

type BankAccount = {
  id: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  is_visible: boolean;
  created_at: string;
};

type VietQRBank = {
  shortName: string;
  name: string;
  logo: string;
};

const Banks = () => {
  const router = useRouter();

  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [vietqrBanks, setVietqrBanks] = useState<VietQRBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "visible" | "hidden">("all");

  /* ── Fetch ── */
  const fetchBanks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bank_accounts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Lỗi tải dữ liệu", description: error.message, variant: "destructive" });
    } else {
      setBanks(data || []);
    }
    setLoading(false);
  };

  const fetchVietQRBanks = async () => {
    setLoadingBanks(true);
    try {
      const res = await fetch("https://api.vietqr.io/v2/banks");
      const json = await res.json();
      if (json.code === "00") {
        setVietqrBanks(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBanks(false);
    }
  };

  useEffect(() => {
    fetchBanks();
    fetchVietQRBanks();
  }, []);

  const getBankInfo = (shortName: string) =>
    vietqrBanks.find(
      (b) => b.shortName.toLowerCase() === shortName.toLowerCase()
    ) || null;

  /* ── Derived stats ── */
  const totalBanks = banks.length;
  const visibleBanks = banks.filter((b) => b.is_visible).length;
  const hiddenBanks = banks.filter((b) => !b.is_visible).length;

  /* ── Filtered Data ── */
  const filteredBanks = useMemo(() => {
    return banks.filter((b) => {
      const matchesSearch =
        b.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.account_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.account_holder.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "visible" && b.is_visible) ||
        (statusFilter === "hidden" && !b.is_visible);

      return matchesSearch && matchesStatus;
    });
  }, [banks, searchTerm, statusFilter]);

  /* ── Actions ── */
  const toggleVisibility = async (bank: BankAccount) => {
    const { error } = await supabase
      .from("bank_accounts")
      .update({ is_visible: !bank.is_visible })
      .eq("id", bank.id);

    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: bank.is_visible ? "Đã ẩn tài khoản" : "Đã hiển thị tài khoản",
      });
      fetchBanks();
    }
  };

  const deleteBank = async () => {
    if (!deleteId) return;
    const { error } = await supabase
      .from("bank_accounts")
      .delete()
      .eq("id", deleteId);

    if (error) {
      toast({ title: "Lỗi xóa", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Đã xóa tài khoản ngân hàng" });
      setDeleteId(null);
      fetchBanks();
    }
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `Đã sao chép ${label}` });
  };

  /* ── Loading Skeleton ── */
  const SkeletonCard = () => (
    <div className="bg-card border border-border rounded-2xl p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-lg bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-24" />
          <div className="h-3 bg-muted rounded w-36" />
        </div>
        <div className="h-6 bg-muted rounded-full w-20" />
      </div>
      <div className="bg-muted/50 rounded-xl p-4 space-y-3 mb-5">
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-3/4" />
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-9 bg-muted rounded-lg" />
        <div className="w-9 h-9 bg-muted rounded-lg" />
        <div className="w-9 h-9 bg-muted rounded-lg" />
      </div>
    </div>
  );

  /* ─── Render ───────────────── */
  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Quản lý Ngân hàng
          </h1>
        </div>

        <Button
          onClick={() => router.push("/admin/banks/add")}
          className="gap-2 shrink-0"
        >
          <Plus size={16} />
          Thêm
        </Button>
      </div>


      {/* ── SEARCH + FILTER — luôn 1 hàng ── */}
      <div className="flex flex-row gap-2 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            size={16}
          />
          <Input
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 text-sm"
          />
        </div>

        {/* Status select — compact on mobile */}
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "all" | "visible" | "hidden")
          }
          className="
                        h-10 shrink-0 
                        px-3 sm:px-4 
                        border border-input bg-background rounded-lg text-sm 
                        focus:outline-none focus:ring-1 focus:ring-ring
                        w-[120px] sm:w-[170px]
                        cursor-pointer
                    "
        >
          <option value="all">Tất cả</option>
          <option value="visible">Hiển thị</option>
          <option value="hidden">Đã ẩn</option>
        </select>
      </div>

      {/* ── CARD GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : filteredBanks.map((b) => {
            const bankInfo = getBankInfo(b.bank_name);

            return (
              <div
                key={b.id}
                className={`
                                      group bg-card border border-border rounded-2xl p-5
                                      hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5
                                      transition-all duration-200 flex flex-col
                                      ${!b.is_visible ? "opacity-60" : ""}
                                  `}
              >
                {/* Bank Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {bankInfo?.logo ? (
                      <div className="shrink-0 w-11 h-11 rounded-xl border bg-white p-1 shadow-sm overflow-hidden">
                        <Image
                          src={bankInfo.logo}
                          alt={bankInfo.shortName}
                          width={40}
                          height={40}
                          className="w-full h-full object-contain"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="shrink-0 w-11 h-11 rounded-xl bg-muted flex items-center justify-center">
                        <Landmark size={22} className="text-muted-foreground" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="font-semibold text-base leading-tight truncate">
                        {b.bank_name}
                      </h3>
                      {bankInfo && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {bankInfo.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`
                                              shrink-0 ml-2 text-xs font-medium px-2.5 py-1 rounded-full
                                              ${b.is_visible
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                      }
                                          `}
                  >
                    {b.is_visible ? "Hiển thị" : "Ẩn"}
                  </span>
                </div>

                {/* Account Info */}
                <div className="bg-muted/40 rounded-xl p-4 space-y-3 mb-4 flex-1">
                  {/* Số tài khoản */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground shrink-0">
                      Số tài khoản
                    </span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-mono text-sm font-medium truncate">
                        {b.account_number}
                      </span>
                      <button
                        onClick={() => copyText(b.account_number, "số tài khoản")}
                        className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Sao chép số tài khoản"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border/60" />

                  {/* Chủ tài khoản */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground shrink-0">
                      Chủ tài khoản
                    </span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-sm font-semibold uppercase tracking-wide truncate">
                        {b.account_holder}
                      </span>
                      <button
                        onClick={() => copyText(b.account_holder, "chủ tài khoản")}
                        className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Sao chép tên chủ tài khoản"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleVisibility(b)}
                    className="flex-1 gap-1.5 text-xs h-9"
                  >
                    {b.is_visible ? (
                      <>
                        <EyeOff size={14} />
                        <span>Ẩn</span>
                      </>
                    ) : (
                      <>
                        <Eye size={14} />
                        <span>Hiện</span>
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push(`/admin/banks/edit/${b.id}`)
                    }
                    className="h-9 w-9 p-0"
                    title="Chỉnh sửa"
                  >
                    <Edit size={14} />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteId(b.id)}
                    className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10 hover:border-destructive/40"
                    title="Xóa tài khoản"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            );
          })}
      </div>

      {/* ── EMPTY STATE ── */}
      {!loading && filteredBanks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Landmark size={36} className="text-muted-foreground/40" />
          </div>
          <p className="font-medium text-foreground">
            {searchTerm || statusFilter !== "all"
              ? "Không tìm thấy kết quả"
              : "Chưa có tài khoản ngân hàng"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {searchTerm || statusFilter !== "all"
              ? "Thử thay đổi từ khóa hoặc bộ lọc"
              : "Bắt đầu bằng cách thêm tài khoản đầu tiên"}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Button
              className="mt-5 gap-2"
              onClick={() => router.push("/admin/banks/add")}
            >
              <Plus size={15} />
              Thêm tài khoản
            </Button>
          )}
        </div>
      )}

      {/* ── CONFIRM DELETE ── */}
      <ConfirmDeleteDialog
        open={!!deleteId}
        title="Xác nhận xóa tài khoản"
        description="Tài khoản ngân hàng này sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác."
        onClose={() => setDeleteId(null)}
        onConfirm={deleteBank}
      />
    </div>
  );
};

export default Banks;
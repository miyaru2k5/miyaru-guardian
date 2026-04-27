"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Plus, Search, Pencil, Trash2, Eye, EyeOff,
    Loader2, Package, ImageIcon, ToggleLeft, ToggleRight,
    Hash, DollarSign, RefreshCw, SlidersHorizontal, MessageCircle,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
    id: string;
    created_at: string;
    balance: number;
    service_name: string;
    is_visible: boolean;
    service_id: string;
    describe: string;
    image_url: string;
    phone: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBalance(n: number) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

// ─── ProductCard ─────────────────────────────────────────────────────────────

function ProductCard({
    product,
    onEdit,
    onDelete,
    onToggleVisible,
    deleting,
    toggling,
}: {
    product: Product;
    onEdit: () => void;
    onDelete: () => void;
    onToggleVisible: () => void;
    deleting: boolean;
    toggling: boolean;
}) {
    const zaloHref = product.phone
        ? `https://zalo.me/${product.phone.replace(/\D/g, "")}`
        : undefined;

    return (
        <div className={cn(
            "group relative bg-card border border-border rounded-2xl overflow-hidden transition-all duration-200 hover:border-primary/30 hover:shadow-md",
            !product.is_visible && "opacity-60"
        )}>
            {/* Image */}
            <div className="relative h-36 bg-muted/30 overflow-hidden">
                {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={product.image_url}
                        alt={product.service_name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={32} className="text-muted-foreground/20" />
                    </div>
                )}

                {/* Visibility badge */}
                <div className={cn(
                    "absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                    product.is_visible
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-muted/70 text-muted-foreground border border-border"
                )}>
                    {product.is_visible ? <Eye size={9} /> : <EyeOff size={9} />}
                    {product.is_visible ? "Hoạt động" : "Bảo trì"}
                </div>
            </div>

            {/* Content */}
            <div className="p-3 space-y-2">
                {/* ID + Name — inline, truncate with ellipsis if too long */}
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="inline-flex items-center gap-1 shrink-0 text-[11px] font-bold text-primary bg-primary/8 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                        <Hash size={10} className="opacity-70" />
                        {product.service_id || "—"}
                    </span>
                    <span className="text-muted-foreground/40 shrink-0 text-xs">–</span>
                    <p className="text-sm font-semibold truncate min-w-0 leading-snug">
                        {product.service_name || "—"}
                    </p>
                </div>

                {/* Price */}
                <div className="flex items-center gap-1">
                    <DollarSign size={12} className="text-primary/70 shrink-0" />
                    <span className="text-sm font-semibold text-primary">{formatBalance(product.balance ?? 0)}</span>
                </div>

                {/* Zalo phone */}
                {product.phone && zaloHref && (
                    <a
                        href={zaloHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                            "inline-flex items-center gap-1.5 text-[11px] font-semibold",
                            "px-2 py-0.5 rounded-full border w-fit",
                            "bg-[#0068ff]/8 text-[#0068ff] border-[#0068ff]/20",
                            "hover:bg-[#0068ff]/15 hover:border-[#0068ff]/40 transition-colors",
                            "dark:text-[#4d9aff] dark:border-[#4d9aff]/30 dark:bg-[#4d9aff]/10"
                        )}
                    >
                        <span className="relative inline-flex items-center justify-center w-3 h-3 shrink-0">
                            <MessageCircle size={12} className="absolute" />
                            <span className="relative text-[6px] font-black leading-none mt-0.5">Z</span>
                        </span>
                        {product.phone}
                    </a>
                )}
            </div>

            {/* Actions */}
            <div className="flex border-t border-border">
                <button
                    type="button"
                    onClick={onToggleVisible}
                    disabled={toggling}
                    title={product.is_visible ? "Bảo trì dịch vụ" : "Hoạt động dịch vụ"}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors disabled:opacity-50"
                >
                    {toggling
                        ? <Loader2 size={12} className="animate-spin" />
                        : product.is_visible
                            ? <ToggleRight size={14} className="text-emerald-500" />
                            : <ToggleLeft size={14} />
                    }
                    {product.is_visible ? "Bảo trì" : "Hoạt động"}
                </button>

                <div className="w-px bg-border" />

                <button
                    type="button"
                    onClick={onEdit}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                >
                    <Pencil size={12} /> Sửa
                </button>

                <div className="w-px bg-border" />

                <button
                    type="button"
                    onClick={onDelete}
                    disabled={deleting}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors disabled:opacity-50"
                >
                    {deleting
                        ? <Loader2 size={12} className="animate-spin" />
                        : <Trash2 size={12} />
                    }
                    Xoá
                </button>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [filterVisible, setFilterVisible] = useState<"all" | "visible" | "hidden">("all");
    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            toast({ title: "Lỗi tải dịch vụ", description: error.message, variant: "destructive" });
        } else {
            setProducts((data as Product[]) || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchProducts() }, [fetchProducts]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeletingId(deleteTarget.id);
        try {
            if (deleteTarget.image_url) {
                await fetch("/api/upload/delete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: deleteTarget.image_url }),
                }).catch(() => {});
            }
            const { error } = await supabase.from("products").delete().eq("id", deleteTarget.id);
            if (error) throw error;
            setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
            toast({ title: "Đã xoá dịch vụ" });
        } catch (err: any) {
            toast({ title: "Lỗi xoá dịch vụ", description: err.message, variant: "destructive" });
        } finally {
            setDeletingId(null);
            setDeleteTarget(null);
        }
    };

    const handleToggleVisible = async (product: Product) => {
        setTogglingId(product.id);
        try {
            const { error } = await supabase
                .from("products")
                .update({ is_visible: !product.is_visible })
                .eq("id", product.id);
            if (error) throw error;
            setProducts((prev) =>
                prev.map((p) => p.id === product.id ? { ...p, is_visible: !p.is_visible } : p)
            );
        } catch (err: any) {
            toast({ title: "Lỗi cập nhật hiển thị", description: err.message, variant: "destructive" });
        } finally {
            setTogglingId(null);
        }
    };

    // Filter + search (tên, mã, phone — không tìm theo mô tả)
    const filtered = products.filter((p) => {
        const q = search.toLowerCase();
        const matchSearch = !search ||
            p.service_name?.toLowerCase().includes(q) ||
            p.service_id?.toLowerCase().includes(q) ||
            p.phone?.toLowerCase().includes(q);
        const matchVisible =
            filterVisible === "all" ||
            (filterVisible === "visible" && p.is_visible) ||
            (filterVisible === "hidden" && !p.is_visible);
        return matchSearch && matchVisible;
    });

    const visibleCount = products.filter((p) => p.is_visible).length;
    const hiddenCount = products.length - visibleCount;

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-sm px-3 py-2.5">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Package size={16} className="text-muted-foreground shrink-0" />
                        <span className="text-sm font-semibold truncate">dịch vụ</span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                            {products.length}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={fetchProducts}
                        disabled={loading}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    </button>

                    <Button
                        onClick={() => router.push("/admin/products/add")}
                        size="sm"
                        className="gap-1.5 shrink-0"
                    >
                        <Plus size={14} /> Thêm mới
                    </Button>
                </div>
            </div>

            <div className="p-3 space-y-3">
                {/* Search + Filter bar */}
                <div className="flex gap-2 items-center">
                    {/* Search */}
                    <div className="relative flex-1 min-w-0">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm theo tên, mã dịch vụ, Zalo..."
                            className="pl-8 h-9 text-sm"
                        />
                    </div>

                    {/* Filter — combobox, mobile chỉ Hoạt động icon */}
                    <Select
                        value={filterVisible}
                        onValueChange={(v) => setFilterVisible(v as typeof filterVisible)}
                    >
                        <SelectTrigger
                            className="
                                h-9 w-9 sm:w-[170px]
                                shrink-0
                                flex items-center justify-center sm:justify-start
                                gap-2 text-sm
                                px-0 sm:px-3
                                [&>svg:last-child]:hidden
                            "
                            aria-label="Lọc trạng thái"
                        >
                            <SlidersHorizontal size={15} className="shrink-0" />
                            <div className="hidden sm:block truncate">
                                <SelectValue placeholder="Lọc trạng thái" />
                            </div>
                        </SelectTrigger>
                        <SelectContent align="end" sideOffset={6}>
                            <SelectItem value="all" className="text-sm">
                                Tất cả ({products.length})
                            </SelectItem>
                            <SelectItem value="visible" className="text-sm">
                                Đang Hoạt động ({visibleCount})
                            </SelectItem>
                            <SelectItem value="hidden" className="text-sm">
                                Đang Bảo trì ({hiddenCount})
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 size={32} className="animate-spin text-muted-foreground" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <Package size={48} className="text-muted-foreground/20 mb-3" />
                        <p className="text-muted-foreground text-sm">
                            {search ? "Không tìm thấy dịch vụ phù hợp" : "Chưa có dịch vụ nào"}
                        </p>
                        {!search && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-3 gap-1.5"
                                onClick={() => router.push("/admin/products/add")}
                            >
                                <Plus size={13} /> Thêm dịch vụ đầu tiên
                            </Button>
                        )}
                    </div>
                ) : (
                    /* 1 cột mobile | 2 cột tablet | 3 cột PC */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filtered.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onEdit={() => router.push(`/admin/products/edit/${product.id}`)}
                                onDelete={() => setDeleteTarget(product)}
                                onToggleVisible={() => handleToggleVisible(product)}
                                deleting={deletingId === product.id}
                                toggling={togglingId === product.id}
                            />
                        ))}
                    </div>
                )}
            </div>

            <ConfirmDeleteDialog
                open={!!deleteTarget}
                title="Xoá dịch vụ"
                description={`Bạn có chắc chắn muốn xoá "${deleteTarget?.service_name}"? Hành động này không thể hoàn tác.`}
                loading={!!deletingId}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
            />
        </div>
    );
}
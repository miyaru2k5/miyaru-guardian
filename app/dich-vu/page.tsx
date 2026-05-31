"use client";

import { useEffect, useState, useMemo } from "react";
import Head from "next/head";
import MainLayout from "../../layouts/MainLayout";
import { supabase } from "@/lib/supabase";
import {
    ChevronDown, ChevronUp, Package, Hash,
    DollarSign, CheckCircle2, WrenchIcon, ImageIcon,
    Search, X, SlidersHorizontal, Sparkles, MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// ─── Types ─────────────────────────────

interface Product {
    id: string;
    service_name: string;
    service_id: string;
    balance: number;
    is_visible: boolean;
    describe: string;
    image_url: string;
    phone: string;
}

type FilterStatus = "all" | "active" | "maintenance";

// ─── SEO Meta ──────────────────────────

const SEO = {
    title: "Danh Sách Dịch Vụ | Nền Tảng Dịch Vụ #1 Việt Nam",
    description:
        "Khám phá hàng trăm dịch vụ chất lượng cao với giá cạnh tranh nhất. Cung cấp đầy đủ các giải pháp cho cá nhân và doanh nghiệp tại Việt Nam.",
    keywords:
        "dịch vụ, mua dịch vụ online, dịch vụ giá rẻ, nền tảng dịch vụ Việt Nam",
    ogImage: "/seo-preview.png",
    canonical: "https://admin.miyaru.online/dich-vu",
};

// ─── Helpers ───────────────────────────

function formatBalance(n: number) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(n);
}

// ─── Product Card ──────────────────────

function ProductCard({ product }: { product: Product }) {
    const [expanded, setExpanded] = useState(false);

    // Build Zalo deep link: works on both mobile (app) and desktop (web)
    const zaloHref = product.phone
        ? `https://zalo.me/${product.phone.replace(/\D/g, "")}`
        : undefined;

    return (
        <article
            className={cn(
                "group relative bg-card border border-border rounded-2xl",
                "hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5",
                "hover:border-primary/30 transition-all duration-300",
                "overflow-hidden h-full"
            )}
        >
            {/* Accent line top */}
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="flex gap-4 p-4 sm:p-5">

                {/* Image */}
                <div className="relative w-[68px] h-[68px] sm:w-[76px] sm:h-[76px] shrink-0">
                    <div className="w-full h-full rounded-xl overflow-hidden bg-muted/60 ring-1 ring-border flex items-center justify-center">
                        {product.image_url ? (
                            <img
                                src={product.image_url}
                                alt={product.service_name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                                width={76}
                                height={76}
                            />
                        ) : (
                            <ImageIcon size={22} className="text-muted-foreground/30" />
                        )}
                    </div>
                    {/* Status dot */}
                    <span
                        className={cn(
                            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-card",
                            product.is_visible ? "bg-emerald-500" : "bg-amber-400"
                        )}
                        aria-hidden="true"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col gap-2">

                    {/* ID + Name */}
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary shrink-0 bg-primary/8 px-1.5 py-0.5 rounded-md">
                            <Hash size={11} className="opacity-70" />
                            {product.service_id}
                        </span>
                        <span className="text-muted-foreground/40 shrink-0 text-xs">–</span>
                        <h2 className="text-sm sm:text-[15px] font-semibold truncate text-foreground leading-snug">
                            {product.service_name}
                        </h2>
                    </div>

                    {/* ── Price + Badge + Phone — wrap to next line if overflow ── */}
                    <div className="flex items-center gap-2 flex-wrap">

                        {/* Price */}
                        <div className="inline-flex items-center gap-1 shrink-0">
                            <DollarSign size={13} className="text-primary/80" />
                            <span className="text-sm sm:text-[15px] font-bold text-primary tracking-tight">
                                {formatBalance(product.balance)}
                            </span>
                        </div>

                        {/* Divider dot */}
                        <span className="w-1 h-1 rounded-full bg-border shrink-0" />

                        {/* Status Badge */}
                        <div
                            className={cn(
                                "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0",
                                product.is_visible
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/25 dark:text-emerald-400"
                                    : "bg-amber-500/10 text-amber-600 border-amber-500/25 dark:text-amber-400"
                            )}
                        >
                            {product.is_visible ? (
                                <><CheckCircle2 size={10} /> Hoạt động</>
                            ) : (
                                <><WrenchIcon size={10} /> Bảo trì</>
                            )}
                        </div>

                        {/* Zalo link — clickable */}
                        {product.phone && zaloHref && (
                            <a
                                href={zaloHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    "inline-flex items-center gap-1.5 shrink-0",
                                    "text-[11px] font-semibold",
                                    "px-2 py-0.5 rounded-full border",
                                    "bg-[#0068ff]/8 text-[#0068ff] border-[#0068ff]/20",
                                    "hover:bg-[#0068ff]/15 hover:border-[#0068ff]/40",
                                    "transition-colors duration-150",
                                    "dark:text-[#4d9aff] dark:border-[#4d9aff]/30 dark:bg-[#4d9aff]/10"
                                )}
                                aria-label={`Nhắn Zalo ${product.phone}`}
                                title={`Nhắn tin: ${product.phone}`}
                            >
                                {/* Icon */}
                                <span className="relative inline-flex items-center justify-center w-3.5 h-3.5 shrink-0">
                                    <MessageCircle size={13} className="absolute" />
                                    <span className="relative text-[7px] font-black leading-none mt-0.5">Z</span>
                                </span>

                                {/* Text */}
                                <span>Nhắn tin:</span>
                                <span className="font-mono">{product.phone}</span>
                            </a>
                        )}
                    </div>

                    {/* Expand toggle */}
                    {product.describe && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="self-start text-[11px] font-medium text-primary/60 hover:text-primary flex items-center gap-0.5 transition-colors"
                            aria-expanded={expanded}
                        >
                            {expanded ? (
                                <><ChevronUp size={11} /> Ẩn bớt</>
                            ) : (
                                <><ChevronDown size={11} /> Xem chi tiết</>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Expanded description */}
            {expanded && product.describe && (
                <div className="px-5 pb-5 border-t border-border/60 pt-3">
                    <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed break-words whitespace-pre-wrap w-full overflow-hidden">
                        {product.describe}
                    </p>
                </div>
            )}
        </article>
    );
}

// ─── Skeleton ─────────────────────────

function SkeletonCard() {
    return (
        <div className="bg-card border border-border rounded-2xl p-5 flex gap-4 animate-pulse">
            <div className="w-[68px] h-[68px] bg-muted rounded-xl shrink-0" />
            <div className="flex-1 space-y-2.5 py-1">
                <div className="h-2.5 bg-muted rounded-full w-1/4" />
                <div className="h-3.5 bg-muted rounded-full w-4/5" />
                <div className="h-3 bg-muted rounded-full w-2/5" />
            </div>
        </div>
    );
}

// ─── Stats Bar ────────────────────────

function StatsBar({ products, filtered }: { products: Product[]; filtered: Product[] }) {
    const activeCount = products.filter(p => p.is_visible).length;
    const maintenanceCount = products.length - activeCount;

    return (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="font-semibold text-sm text-foreground">{filtered.length} dịch vụ</span>
            <span className="w-px h-3 bg-border" />
            <span className="flex items-center gap-1.5 text-[13px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{activeCount} hoạt động</span>
            </span>
            <span className="flex items-center gap-1.5 text-[13px]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>{maintenanceCount} bảo trì</span>
            </span>
        </div>
    );
}

// ─── Page ─────────────────────────────

export default function DichVuPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

    useEffect(() => {
        supabase.from("products").select("*").then(({ data }) => {
            setProducts(data || []);
            setLoading(false);
        });
    }, []);

    const filtered = useMemo(() => {
        return products.filter((p) => {
            const matchSearch =
                p.service_name.toLowerCase().includes(search.toLowerCase()) ||
                p.service_id.toLowerCase().includes(search.toLowerCase());

            const matchStatus =
                filterStatus === "all" ||
                (filterStatus === "active" && p.is_visible) ||
                (filterStatus === "maintenance" && !p.is_visible);

            return matchSearch && matchStatus;
        });
    }, [products, search, filterStatus]);

    return (
        <>
            <Head>
                <title>{SEO.title}</title>
                <meta name="description" content={SEO.description} />
                <meta name="keywords" content={SEO.keywords} />
                <link rel="canonical" href={SEO.canonical} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={SEO.title} />
                <meta property="og:description" content={SEO.description} />
                <meta property="og:url" content={SEO.canonical} />
                <meta property="og:image" content={SEO.ogImage} />
                <meta property="og:locale" content="vi_VN" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={SEO.title} />
                <meta name="twitter:description" content={SEO.description} />
                <meta name="twitter:image" content={SEO.ogImage} />
                <meta name="robots" content="index, follow, max-image-preview:large" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta httpEquiv="Content-Language" content="vi" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "ItemList",
                            name: "Danh sách dịch vụ",
                            description: SEO.description,
                            url: SEO.canonical,
                            numberOfItems: products.length,
                        }),
                    }}
                />
            </Head>

            <MainLayout>

                {/* ── HEADER ── */}
                <header className="mt-11 border-b border-border/60 bg-gradient-to-b from-muted/40 to-transparent">
                    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-xl bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center shrink-0">
                                <Sparkles size={18} className="text-primary" />
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                                    Danh sách dịch vụ
                                </h1>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    Tìm kiếm và lựa chọn dịch vụ phù hợp với bạn
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── MAIN ── */}
                <main
                    className="max-w-screen-xl mx-auto px-3 sm:px-5 md:px-7 pt-6 sm:pt-8 md:pt-10 pb-10 sm:pb-14 space-y-6"
                    aria-label="Danh sách dịch vụ"
                >

                    {/* SEARCH + FILTER ROW */}
                    <div className="flex items-center gap-2.5">

                        {/* Search */}
                        <div className="relative flex-1 min-w-0">
                            <Search
                                size={15}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none"
                            />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Tìm theo tên hoặc mã dịch vụ..."
                                className="pl-9 pr-9 h-10 text-sm bg-background/60 focus:bg-background transition-colors"
                                aria-label="Tìm kiếm dịch vụ"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                                    aria-label="Xóa tìm kiếm"
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                        {/* Filter */}
                        <Select
                            value={filterStatus}
                            onValueChange={(v) => setFilterStatus(v as FilterStatus)}
                        >
                            <SelectTrigger
                                className="
                                    h-10 w-10 sm:w-[190px]
                                    shrink-0
                                    flex items-center justify-center sm:justify-start
                                    gap-2 text-sm
                                    px-0 sm:px-3
                                    [&>svg:last-child]:hidden
                                "
                                aria-label="Lọc trạng thái"
                            >
                                <SlidersHorizontal size={16} className="shrink-0" />
                                <div className="hidden sm:block truncate">
                                    <SelectValue placeholder="Lọc trạng thái" />
                                </div>
                            </SelectTrigger>

                            <SelectContent align="end" sideOffset={6}>
                                <SelectItem value="all" className="text-sm">Tất cả dịch vụ</SelectItem>
                                <SelectItem value="active" className="text-sm">Đang hoạt động</SelectItem>
                                <SelectItem value="maintenance" className="text-sm">Đang bảo trì</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Stats bar */}
                    {!loading && (
                        <StatsBar products={products} filtered={filtered} />
                    )}

                    {/* CONTENT GRID */}
                    {loading ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                            {[...Array(6)].map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                                <Package size={22} className="text-muted-foreground/40" />
                            </div>
                            <p className="text-base font-semibold text-foreground mb-1">
                                Không tìm thấy dịch vụ
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Thử thay đổi từ khóa hoặc bộ lọc
                            </p>
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="mt-4 text-sm text-primary hover:underline"
                                >
                                    Xóa tìm kiếm
                                </button>
                            )}
                        </div>
                    ) : (
                        <section
                            className="grid grid-cols-1 lg:grid-cols-2 gap-3.5"
                            aria-label={`${filtered.length} dịch vụ`}
                        >
                            {filtered.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </section>
                    )}

                    <div className="h-6 sm:h-10" aria-hidden="true" />
                </main>

            </MainLayout>
        </>
    );
}
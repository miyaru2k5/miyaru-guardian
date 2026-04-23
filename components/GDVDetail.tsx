"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft, Globe, MessageCircle, Facebook, ShieldCheck, TrendingUp,
    Copy, CheckCheck, Hash, FileText, MessageSquare, CreditCard,
    Tag, Lock, ExternalLink,
} from "lucide-react";
import MainLayout from "@/layouts/MainLayout";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface BankEntry {
    bank_name: string;
    account_number: string;
    account_holder: string;
}

interface Trader {
    id: string;
    name: string;
    slug: string;
    role: "admin" | "gdv" | "kdv" | null;
    service: string | null;
    code: string;
    insurance_fund: number;
    success_rate: number;
    status: string;
    avatar_url: string | null;
    banner_url: string | null;
    description: string | null;
    facebook: string | null;
    zalo: string | null;
    website: string | null;
    banks: BankEntry[] | null;
    created_at: string;
}

interface Category { id: string; name: string }
interface DescItem { text: string; link?: string }
interface DescSection { title: string; items: DescItem[] }

function parseDesc(raw: string): DescSection[] | null {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as DescSection[];
    } catch { }
    return null;
}

const ROLE_TICK: Record<string, string> = {
    gdv: "/tickxanh.png",
    admin: "/ticktim.png",
    kdv: "/tickvang.png",
};

const ROLE_LABEL: Record<string, string> = {
    gdv: "Giao dịch viên",
    admin: "Quản lý & Điều hành",
    kdv: "Kiểm duyệt viên",
};

// ─── Bank Logo ──────────────────────────────────────────────────────────────────

function BankLogo({ bankName, size = 40 }: { bankName: string; size?: number }) {
    const [err, setErr] = useState(false);
    if (err) {
        return (
            <div style={{ width: size, height: size }}
                className="rounded-xl bg-muted flex items-center justify-center shrink-0">
                <CreditCard size={size * 0.4} className="text-muted-foreground" />
            </div>
        );
    }
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={`https://api.vietqr.io/img/${bankName.toLowerCase()}.png`}
            alt={bankName}
            onError={() => setErr(true)}
            className="rounded-xl object-contain bg-white border border-border/40 shrink-0 p-1"
            style={{ width: size, height: size }}
        />
    );
}

// ─── GDVDetail ──────────────────────────────────────────────────────────────────

const GDVDetail = () => {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;

    const [trader, setTrader] = useState<Trader | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!slug) return;
        const fetchTrader = async () => {
            setLoading(true);
            const { data: rawTrader, error } = await (supabase
                .from("traders").select("*").eq("slug", slug).maybeSingle() as any
            ) as { data: Trader | null; error: Error | null };

            if (error || !rawTrader || rawTrader.status !== "LIVE") {
                setNotFound(true);
                setLoading(false);
                return;
            }

            setTrader(rawTrader);
            document.title = `Quỹ bảo hiểm: ${Number(rawTrader.insurance_fund).toLocaleString("vi-VN")}đ - ${rawTrader.name}`;

            const { data: tcData } = await supabase
                .from("trader_categories").select("category_id").eq("trader_id", rawTrader.id);

            const catIds = (tcData || []).map((tc: any) => tc.category_id);
            if (catIds.length > 0) {
                const { data: catData } = await supabase.from("categories").select("*").in("id", catIds);
                setCategories((catData as Category[]) || []);
            }
            setLoading(false);
        };
        fetchTrader();
        return () => { document.title = "Admin Việt Nam"; };
    }, [slug]);

    const copyPageLink = () => {
        const base = process.env.NEXT_PUBLIC_WEBSITE_URL ?? window.location.origin;
        navigator.clipboard.writeText(`${base}/${slug}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString("vi-VN");

    if (loading) return (
        <MainLayout>
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <p className="text-sm text-muted-foreground">Đang tải thông tin...</p>
                </div>
            </div>
        </MainLayout>
    );

    if (notFound || !trader) return (
        <MainLayout>
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock size={28} className="text-primary" />
                </div>
                <h2 className="text-xl font-bold">Không tìm thấy GDV</h2>
                <p className="text-muted-foreground text-sm max-w-xs">
                    Giao dịch viên không tồn tại, đã bị ẩn hoặc đường dẫn không đúng.
                </p>
                <Button variant="outline" onClick={() => router.back()} className="gap-2">
                    <ArrowLeft size={16} /> Quay lại
                </Button>
            </div>
        </MainLayout>
    );

    const role = trader.role ?? "gdv";
    const tickSrc = ROLE_TICK[role] ?? ROLE_TICK["gdv"];
    const roleLabel = ROLE_LABEL[role] ?? "Giao dịch viên";
    const banks: BankEntry[] = Array.isArray(trader.banks) ? trader.banks : [];
    const descSections = trader.description ? parseDesc(trader.description) : null;

    return (
        <MainLayout>
            <div className="min-h-screen pb-10 pt-20 md:pt-24">
                <div className="container mx-auto max-w-5xl px-4 space-y-5">

                    {/* ── HERO CARD ── */}
                    <div className="glow-border rounded-3xl overflow-hidden">

                        {/* ── BANNER ── */}
                        <div className="relative w-full h-36 md:h-52 overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-background">
                            {trader.banner_url ? (
                                <img
                                    src={trader.banner_url}
                                    alt="Banner"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent">
                                    <div
                                        className="absolute inset-0 opacity-[0.06]"
                                        style={{
                                            backgroundImage: `radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)`,
                                            backgroundSize: "28px 28px",
                                        }}
                                    />
                                </div>
                            )}

                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card/80 to-transparent" />
                        </div>

                        {/* ── PROFILE ROW ── */}
                        <div className="px-5 md:px-7 pb-5">
                            <div className="flex items-end gap-4">

                                {/* ── AVATAR ── */}
                                <div className="shrink-0 relative z-10 -translate-y-1/4 md:-translate-y-1/3">
                                    {trader.avatar_url ? (
                                        <img
                                            src={trader.avatar_url}
                                            alt={trader.name}
                                            className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-4 border-card shadow-xl"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center border-4 border-card shadow-xl">
                                            <span className="text-3xl font-bold text-primary">
                                                {trader.name.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* ── INFO ── */}
                                <div className="flex-1 min-w-0 pb-2 md:pb-3">

                                    {/* Name + Tick (đẩy lên) */}
                                    <div className="flex items-center gap-2 flex-wrap -mt-2 md:-mt-3">
                                        <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight truncate">
                                            {trader.name}
                                        </h1>

                                        <img
                                            src={tickSrc}
                                            alt={roleLabel}
                                            title={roleLabel}
                                            className="w-5 h-5 object-contain shrink-0"
                                        />
                                    </div>

                                    {/* Biệt danh (to hơn + có ngoặc) */}
                                    {trader.service && (
                                        <p className="text-base md:text-lg text-muted-foreground mt-0.5 truncate">
                                            ({trader.service})
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── MAIN GRID ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                        {/* ── LEFT ── */}
                        <div className="lg:col-span-2 space-y-5">

                            {/* Liên hệ */}
                            {(trader.facebook || trader.zalo || trader.website) && (
                                <div className="glow-border rounded-3xl p-5 md:p-6">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Liên hệ</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {trader.facebook && (
                                            <a href={`https://m.me/${trader.facebook.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/60 border border-border hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-colors">
                                                <MessageSquare size={16} className="text-indigo-500 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-muted-foreground">Messenger</p>
                                                    <p className="text-foreground font-medium text-sm">Chat Messenger</p>
                                                </div>
                                            </a>
                                        )}
                                        {trader.facebook && (
                                            <a href={trader.facebook.startsWith("http") ? trader.facebook : `https://www.facebook.com/${trader.facebook}`}
                                                target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/60 border border-border hover:border-blue-500/40 hover:bg-blue-500/5 transition-colors">
                                                <Facebook size={16} className="text-blue-500 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-muted-foreground">Facebook</p>
                                                    <p className="text-foreground font-medium truncate text-sm">
                                                        {trader.facebook.replace(/^https?:\/\/(www\.)?facebook\.com\//, "")}
                                                    </p>
                                                </div>
                                            </a>
                                        )}
                                        {trader.zalo && (
                                            <a href={`https://zalo.me/${trader.zalo.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/60 border border-border hover:border-sky-400/40 hover:bg-sky-400/5 transition-colors">
                                                <MessageCircle size={16} className="text-sky-400 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-muted-foreground">Zalo</p>
                                                    <p className="text-foreground font-medium text-sm">{trader.zalo}</p>
                                                </div>
                                            </a>
                                        )}
                                        {trader.website && (
                                            <a href={trader.website.startsWith("http") ? trader.website : `https://${trader.website}`}
                                                target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/60 border border-border hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-colors">
                                                <Globe size={16} className="text-emerald-500 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-muted-foreground">Website</p>
                                                    <p className="text-foreground font-medium truncate text-sm">
                                                        {trader.website.replace(/^https?:\/\//, "")}
                                                    </p>
                                                </div>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Ngân hàng — 2 cột như liên hệ */}
                            {banks.length > 0 && (
                                <div className="glow-border rounded-3xl p-5 md:p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <CreditCard size={14} className="text-primary" />
                                        </div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Tài khoản ngân hàng
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {banks.map((bank, i) => (
                                            <div key={i}
                                                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/60 border border-border hover:border-primary/30 transition-colors">
                                                {/* Left: square logo */}
                                                <BankLogo bankName={bank.bank_name} size={40} />
                                                {/* Center: 3 lines */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-foreground truncate">{bank.bank_name}</p>
                                                    <p className="text-xs text-muted-foreground font-mono">STK: {bank.account_number}</p>
                                                    <p className="text-xs text-muted-foreground truncate">CTK: {bank.account_holder}</p>
                                                </div>
                                                {/* Right: mini QR */}
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={`https://img.vietqr.io/image/${encodeURIComponent(bank.bank_name)}-${bank.account_number.replace(/\s/g, "")}-compact2.png?amount=0&addInfo=&accountName=${encodeURIComponent(bank.account_holder)}`}
                                                    alt="QR"
                                                    className="w-12 h-12 rounded-xl object-contain bg-white border border-border/30 shrink-0"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Mô tả — modern, large text, pro layout */}
                            {descSections && descSections.length > 0 && (
                                <div className="glow-border rounded-3xl p-5 md:p-8">
                                    <div className="flex items-center gap-3 mb-7">
                                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <FileText size={16} className="text-primary" />
                                        </div>
                                        <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">Mô tả</h2>
                                    </div>

                                    <div className="space-y-7">
                                        {descSections.map((sec, si) => (
                                            <div key={si}>
                                                {sec.title && (
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <span className="w-1 h-5 rounded-full bg-primary shrink-0" />
                                                        <p className="text-base md:text-lg font-semibold text-foreground">{sec.title}</p>
                                                    </div>
                                                )}
                                                <ul className="space-y-2.5 pl-2">
                                                    {sec.items.map((item, ii) => (
                                                        <li key={ii} className="flex items-start gap-3">
                                                            <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                                                            {item.link ? (
                                                                <a href={item.link} target="_blank" rel="noopener noreferrer"
                                                                    className="text-base md:text-[15px] text-primary hover:underline leading-relaxed flex items-center gap-1.5">
                                                                    {item.text}
                                                                    <ExternalLink size={12} className="shrink-0 opacity-60" />
                                                                </a>
                                                            ) : (
                                                                <span className="text-base md:text-[15px] text-muted-foreground leading-relaxed">
                                                                    {item.text}
                                                                </span>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                                {si < descSections.length - 1 && (
                                                    <div className="mt-6 border-t border-border/30" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Fallback: plain text */}
                            {!descSections && trader.description && (
                                <div className="glow-border rounded-3xl p-5 md:p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <FileText size={16} className="text-primary" />
                                        </div>
                                        <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">Giới thiệu</h2>
                                    </div>
                                    <div className="space-y-3">
                                        {trader.description.split("\n").filter(Boolean).map((para, idx) => (
                                            <p key={idx} className="text-base md:text-[15px] text-muted-foreground leading-relaxed">{para}</p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── RIGHT SIDEBAR ── */}
                        <div className="space-y-4">

                            {/* Thống kê */}
                            <div className="glow-border rounded-3xl p-5 md:p-6 space-y-3">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thống kê</p>

                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-card/60 border border-border">
                                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                                        <Hash size={16} className="text-muted-foreground" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground">Mã GDV</p>
                                        <p className="text-sm font-bold font-mono text-foreground">{trader.code}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-card/60 border border-border">
                                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={tickSrc} alt={roleLabel} className="w-5 h-5 object-contain" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground">Vai trò</p>
                                        <p className="text-sm font-semibold text-foreground truncate">{roleLabel}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-card/60 border border-border">
                                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <ShieldCheck size={18} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Tham gia bảo hiểm</p>
                                        <p className="text-sm font-bold text-foreground">{formatDate(trader.created_at)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/5 border border-primary/20">
                                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <ShieldCheck size={18} className="text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground">Quỹ bảo hiểm</p>
                                        <p className="text-base font-bold text-primary leading-tight">
                                            {Number(trader.insurance_fund).toLocaleString("vi-VN")}đ
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-card/60 border border-border">
                                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <TrendingUp size={18} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Tỷ lệ thành công</p>
                                        <p className="text-base font-bold text-foreground">{Number(trader.success_rate)}%</p>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                                        <span>Độ tin cậy</span>
                                        <span>{Number(trader.success_rate)}%</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-primary transition-all"
                                            style={{ width: `${Math.min(Number(trader.success_rate), 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Danh mục */}
                            {categories.length > 0 && (
                                <div className="glow-border rounded-3xl p-5 md:p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <Tag size={13} className="text-primary" />
                                        </div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Danh mục</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map(c => (
                                            <span key={c.id}
                                                className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                                {c.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Copy link */}
                            <Button variant="outline" size="sm" onClick={copyPageLink}
                                className="w-full gap-2 rounded-2xl h-11">
                                {copied
                                    ? <><CheckCheck size={15} className="text-primary" /> Đã copy link!</>
                                    : <><Copy size={15} /> Copy link trang này</>
                                }
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default GDVDetail;
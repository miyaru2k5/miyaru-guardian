"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft, Globe, MessageCircle, Facebook, ShieldCheck, TrendingUp,
    Copy, CheckCheck, Hash, FileText, MessageSquare, CreditCard,
    Tag, Lock, ExternalLink, AlertCircle, RefreshCw,
} from "lucide-react";
import MainLayout from "@/layouts/MainLayout";

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface Category {
    id: string;
    name: string;
}

interface DescItem {
    text: string;
    link?: string;
}

interface DescSection {
    title: string;
    items: DescItem[];
}

interface BankData {
    shortName: string;
    logo: string;
    name: string;
    bin: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

const VIETQR_API = "https://api.vietqr.io/v2/banks";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDesc(raw: string): DescSection[] | null {
    if (!raw?.trim()) return null;
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as DescSection[];
    } catch {
        // not JSON — treat as plain text
    }
    return null;
}

function formatCurrency(amount: number): string {
    return Number(amount).toLocaleString("vi-VN");
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function normalizeFacebookUrl(fb: string): string {
    if (!fb) return "";
    return fb.startsWith("http") ? fb : `https://www.facebook.com/${fb}`;
}

function displayFacebookHandle(fb: string): string {
    return fb.replace(/^https?:\/\/(www\.)?facebook\.com\//, "");
}

function messengerUrl(fb: string): string {
    const handle = displayFacebookHandle(fb).replace(/\D/g, "");
    return handle
        ? `https://m.me/${handle}`
        : `https://www.messenger.com`;
}

function zaloUrl(zalo: string): string {
    return `https://zalo.me/${zalo.replace(/\D/g, "")}`;
}

function normalizeWebsite(site: string): string {
    return site.startsWith("http") ? site : `https://${site}`;
}

function displayWebsite(site: string): string {
    return site.replace(/^https?:\/\//, "");
}

function vietQRUrl(bankName: string, accountNumber: string, accountHolder: string): string {
    const acc = accountNumber.replace(/\s/g, "");
    return `https://img.vietqr.io/image/${encodeURIComponent(bankName)}-${acc}-compact2.png?amount=0&addInfo=&accountName=${encodeURIComponent(accountHolder)}`;
}

function clamp(val: number, min: number, max: number): number {
    return Math.min(Math.max(val, min), max);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface BankLogoProps {
    bankName: string;
    bankMap: Record<string, BankData>;
    size?: number;
}

function BankLogo({ bankName, bankMap, size = 40 }: BankLogoProps) {
    const bank = bankMap[bankName];
    if (!bank?.logo) {
        return (
            <div
                style={{ width: size, height: size }}
                className="rounded-xl bg-[#1e2535] border border-white/10 flex items-center justify-center shrink-0"
            >
                <CreditCard size={size * 0.4} className="text-white/30" />
            </div>
        );
    }
    return (
        <img
            src={bank.logo}
            alt={bankName}
            className="rounded-xl object-contain bg-white shrink-0 p-1 border border-white/10"
            style={{ width: size, height: size }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
    );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function SkeletonPulse({ className = "" }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-muted/50 rounded-xl ${className}`} />
    );
}

function GDVDetailSkeleton() {
    return (
        <MainLayout>
            <div className="min-h-screen pb-10 pt-20 md:pt-24">
                <div className="container mx-auto max-w-5xl px-4 space-y-5">
                    {/* Hero */}
                    <div className="rounded-2xl overflow-hidden border border-border/60 bg-card shadow-sm">
                        <SkeletonPulse className="h-40 w-full rounded-none" />
                        <div className="px-5 pb-5">
                            <div className="flex items-end gap-4 -mt-12">
                                <SkeletonPulse className="w-[104px] h-[104px] rounded-2xl shrink-0" />
                                <div className="flex-1 pb-2 space-y-2">
                                    <SkeletonPulse className="h-7 w-48" />
                                    <SkeletonPulse className="h-4 w-32" />
                                </div>
                            </div>
                        </div>
                        <div className="px-5 pb-5">
                            <SkeletonPulse className="h-16 w-full rounded-2xl" />
                        </div>
                    </div>
                    {/* Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <div className="lg:col-span-2 space-y-5">
                            <SkeletonPulse className="h-40 rounded-3xl" />
                            <SkeletonPulse className="h-32 rounded-3xl" />
                        </div>
                        <div className="space-y-4">
                            <SkeletonPulse className="h-64 rounded-3xl" />
                            <SkeletonPulse className="h-24 rounded-3xl" />
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type PageState = "loading" | "not_found" | "error" | "ready";

const GDVDetail = () => {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;

    const [trader, setTrader] = useState<Trader | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [pageState, setPageState] = useState<PageState>("loading");
    const [copied, setCopied] = useState(false);
    const [bankMap, setBankMap] = useState<Record<string, BankData>>({});
    const [qrError, setQrError] = useState<Record<number, boolean>>({});
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(key);

        setTimeout(() => setCopiedField(null), 1500);
    };
    // ── Fetch bank list ──
    useEffect(() => {
        let cancelled = false;
        fetch(VIETQR_API)
            .then((res) => res.json())
            .then((res) => {
                if (cancelled) return;
                const map: Record<string, BankData> = {};
                (res.data as BankData[]).forEach((b) => {
                    map[b.shortName] = b;
                });
                setBankMap(map);
            })
            .catch(() => {
                // Bank logos are non-critical; silently fail
            });
        return () => { cancelled = true; };
    }, []);

    // ── Fetch trader data ──
    const fetchTrader = useCallback(async () => {
        if (!slug) return;
        setPageState("loading");

        try {
            const { data: rawTrader, error } = await (
                supabase
                    .from("traders")
                    .select("*")
                    .eq("slug", slug)
                    .maybeSingle() as any
            ) as { data: Trader | null; error: Error | null };

            if (error) throw error;

            if (!rawTrader || rawTrader.status !== "LIVE") {
                setPageState("not_found");
                return;
            }

            setTrader(rawTrader);
            document.title = `Quỹ bảo hiểm: ${formatCurrency(rawTrader.insurance_fund)}đ - ${rawTrader.name}`;

            // Fetch categories
            const { data: tcData, error: tcError } = await supabase
                .from("trader_categories")
                .select("category_id")
                .eq("trader_id", rawTrader.id);

            if (tcError) throw tcError;

            const catIds = (tcData || []).map((tc: { category_id: string }) => tc.category_id);
            if (catIds.length > 0) {
                const { data: catData, error: catError } = await supabase
                    .from("categories")
                    .select("*")
                    .in("id", catIds);

                if (catError) throw catError;
                setCategories((catData as Category[]) || []);
            } else {
                setCategories([]);
            }

            setPageState("ready");
        } catch (err) {
            console.error("Failed to fetch trader:", err);
            setPageState("error");
        }
    }, [slug]);

    useEffect(() => {
        fetchTrader();
        return () => { document.title = "Admin Việt Nam"; };
    }, [fetchTrader]);

    // ── Copy link ──
    const copyPageLink = useCallback(() => {
        const base = process.env.NEXT_PUBLIC_WEBSITE_URL ?? window.location.origin;
        navigator.clipboard
            .writeText(`${base}/${slug}`)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            })
            .catch(() => {
                // Fallback for older browsers
                const ta = document.createElement("textarea");
                ta.value = `${base}/${slug}`;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand("copy");
                document.body.removeChild(ta);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
    }, [slug]);

    // ── Handle QR image error ──
    const handleQrError = useCallback((index: number) => {
        setQrError((prev) => ({ ...prev, [index]: true }));
    }, []);

    // ── States ──
    if (pageState === "loading") return <GDVDetailSkeleton />;

    if (pageState === "not_found" || (pageState === "ready" && !trader)) {
        return (
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
    }

    if (pageState === "error") {
        return (
            <MainLayout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
                    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertCircle size={28} className="text-destructive" />
                    </div>
                    <h2 className="text-xl font-bold">Đã xảy ra lỗi</h2>
                    <p className="text-muted-foreground text-sm max-w-xs">
                        Không thể tải thông tin giao dịch viên. Vui lòng thử lại.
                    </p>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => router.back()} className="gap-2">
                            <ArrowLeft size={16} /> Quay lại
                        </Button>
                        <Button onClick={fetchTrader} className="gap-2">
                            <RefreshCw size={16} /> Thử lại
                        </Button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    // ── Ready ──
    const role = trader!.role ?? "gdv";
    const tickSrc = ROLE_TICK[role] ?? ROLE_TICK["gdv"];
    const roleLabel = ROLE_LABEL[role] ?? "Giao dịch viên";
    const banks: BankEntry[] = Array.isArray(trader!.banks) ? trader!.banks : [];
    const descSections = trader!.description ? parseDesc(trader!.description) : null;
    const successRate = clamp(Number(trader!.success_rate), 0, 100);

    const hasContact = !!(trader!.facebook || trader!.zalo || trader!.website);

    return (
        <MainLayout>
            <div className="min-h-screen pb-10 pt-20 md:pt-24">
                <div className="container mx-auto max-w-5xl px-4 space-y-5">

                    {/* ── HERO CARD ── */}
                    <div className="rounded-2xl overflow-hidden border border-border/60 bg-card shadow-sm">

                        {/* ── BANNER ── */}
                        <div className="relative h-36 md:h-40 overflow-hidden bg-slate-900">
                            {trader!.banner_url ? (
                                <img
                                    src={trader!.banner_url}
                                    alt="Banner"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const el = e.target as HTMLImageElement;
                                        el.style.display = "none";
                                    }}
                                />
                            ) : (
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950" />
                                    <div
                                        className="absolute inset-0 opacity-15"
                                        style={{
                                            backgroundImage: `radial-gradient(circle, rgb(148 163 184) 1px, transparent 1px)`,
                                            backgroundSize: "22px 22px",
                                        }}
                                    />
                                    <div className="absolute -top-8 -right-4 w-48 h-48 bg-primary/25 rounded-full blur-2xl" />
                                    <div className="absolute -bottom-8 left-8 w-40 h-40 bg-emerald-500/15 rounded-full blur-2xl" />
                                </>
                            )}
                            <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-card to-transparent" />
                        </div>

                        {/* ── PROFILE ROW ── */}
                        <div className="px-5 pb-5">
                            <div className="flex items-end gap-4 -mt-12">

                                {/* Avatar */}
                                <div className="shrink-0 z-10">
                                    {trader!.avatar_url ? (
                                        <img
                                            src={trader!.avatar_url}
                                            alt={trader!.name}
                                            className="w-[104px] h-[104px] md:w-[112px] md:h-[112px] rounded-2xl object-cover border-[3px] border-card shadow-xl"
                                            onError={(e) => {
                                                const el = e.target as HTMLImageElement;
                                                el.style.display = "none";
                                                el.nextElementSibling?.classList.remove("hidden");
                                            }}
                                        />
                                    ) : null}
                                    {/* Fallback initial avatar */}
                                    <div
                                        className={`w-[104px] h-[104px] md:w-[112px] md:h-[112px] rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center border-[3px] border-card shadow-xl shadow-primary/20 ${trader!.avatar_url ? "hidden" : ""}`}
                                    >
                                        <span className="text-4xl font-bold text-white">
                                            {trader!.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {/* Name + service */}
                                <div className="flex-1 min-w-0 pb-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight truncate">
                                            {trader!.name}
                                        </h1>
                                        <img
                                            src={tickSrc}
                                            alt={roleLabel}
                                            title={roleLabel}
                                            className="w-[18px] h-[18px] shrink-0 object-contain"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                        />
                                    </div>
                                    {trader!.service && (
                                        <p className="text-sm text-muted-foreground mt-0.5 truncate">
                                            ({trader!.service})
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── QUỸ BẢO HIỂM ── */}
                        <div className="px-5 pb-5">
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/5 border border-primary/20">
                                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-5 h-5 text-primary" />
                                </div>
                                <span className="text-sm text-muted-foreground">Quỹ bảo hiểm</span>
                                <span className="ml-auto text-lg md:text-xl font-bold text-primary tracking-wide">
                                    {formatCurrency(trader!.insurance_fund)}đ
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── MAIN GRID ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                        {/* ── LEFT COLUMN ── */}
                        <div className="lg:col-span-2 space-y-5">

                            {/* Contact */}
                            {hasContact && (
                                <div className="glow-border rounded-3xl p-5 md:p-6">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                                        Liên hệ
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

                                        {trader!.facebook && (
                                            <a
                                                href={messengerUrl(trader!.facebook)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/60 border border-border hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-colors"
                                            >
                                                <MessageSquare size={16} className="text-indigo-500 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-muted-foreground">Messenger</p>
                                                    <p className="text-foreground font-medium text-sm">Chat Messenger</p>
                                                </div>
                                            </a>
                                        )}

                                        {trader!.facebook && (
                                            <a
                                                href={normalizeFacebookUrl(trader!.facebook)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/60 border border-border hover:border-blue-500/40 hover:bg-blue-500/5 transition-colors"
                                            >
                                                <Facebook size={16} className="text-blue-500 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-muted-foreground">Facebook</p>
                                                    <p className="text-foreground font-medium truncate text-sm">
                                                        {displayFacebookHandle(trader!.facebook)}
                                                    </p>
                                                </div>
                                            </a>
                                        )}

                                        {trader!.zalo && (
                                            <a
                                                href={zaloUrl(trader!.zalo)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/60 border border-border hover:border-sky-400/40 hover:bg-sky-400/5 transition-colors"
                                            >
                                                <MessageCircle size={16} className="text-sky-400 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-muted-foreground">Zalo</p>
                                                    <p className="text-foreground font-medium text-sm">{trader!.zalo}</p>
                                                </div>
                                            </a>
                                        )}

                                        {trader!.website && (
                                            <a
                                                href={normalizeWebsite(trader!.website)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/60 border border-border hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-colors"
                                            >
                                                <Globe size={16} className="text-emerald-500 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-muted-foreground">Website</p>
                                                    <p className="text-foreground font-medium truncate text-sm">
                                                        {displayWebsite(trader!.website)}
                                                    </p>
                                                </div>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                            {/* Bank accounts */}
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

                                    {/* 👉 2 columns */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {banks.map((bank, i) => (
                                            <div
                                                key={`${bank.bank_name}-${i}`}
                                                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/60 border border-border hover:border-primary/30 transition-colors"
                                            >
                                                <BankLogo bankName={bank.bank_name} bankMap={bankMap} size={40} />

                                                <div className="flex-1 min-w-0 space-y-1.5">

                                                    {/* Bank + STK */}
                                                    <div className="flex items-start gap-2">
                                                        <p className="flex-1 min-w-0 text-sm font-semibold text-foreground leading-snug break-words">
                                                            {bank.bank_name}
                                                            <span className="text-muted-foreground font-mono">
                                                                {" : "}{bank.account_number}
                                                            </span>
                                                        </p>

                                                        <button
                                                            onClick={() => handleCopy(bank.account_number, `stk-${i}`)}
                                                            className="shrink-0 mt-0.5 text-muted-foreground hover:text-primary transition-colors"
                                                        >
                                                            {copiedField === `stk-${i}` ? (
                                                                <CheckCheck size={14} className="text-green-500" />
                                                            ) : (
                                                                <Copy size={14} />
                                                            )}
                                                        </button>
                                                    </div>

                                                    {/* CTK */}
                                                    <div className="flex items-start gap-2">
                                                        <p className="flex-1 min-w-0 text-xs text-muted-foreground leading-snug break-words">
                                                            CTK: {bank.account_holder}
                                                        </p>

                                                        <button
                                                            onClick={() => handleCopy(bank.account_holder, `holder-${i}`)}
                                                            className="shrink-0 mt-0.5 text-muted-foreground hover:text-primary transition-colors"
                                                        >
                                                            {copiedField === `holder-${i}` ? (
                                                                <CheckCheck size={14} className="text-green-500" />
                                                            ) : (
                                                                <Copy size={14} />
                                                            )}
                                                        </button>
                                                    </div>

                                                </div>

                                                {/* QR */}
                                                {!qrError[i] && (
                                                    <img
                                                        src={vietQRUrl(
                                                            bank.bank_name,
                                                            bank.account_number,
                                                            bank.account_holder
                                                        )}
                                                        alt={`QR ${bank.bank_name}`}
                                                        className="w-12 h-12 rounded-xl object-contain bg-white border border-border/30 shrink-0"
                                                        onError={() => handleQrError(i)}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Description */}
                            {descSections && descSections.length > 0 && (
                                <div className="glow-border rounded-3xl p-5 md:p-6 space-y-5">

                                    <div className="space-y-4">
                                        {descSections.map((sec, si) => (
                                            <div key={si} className="space-y-3">

                                                {/* Title + Icon */}
                                                {sec.title && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                            <FileText size={14} className="text-primary" />
                                                        </div>
                                                        <p className="text-sm md:text-base font-semibold text-foreground">
                                                            {sec.title}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Items */}
                                                <div className="space-y-2">
                                                    {sec.items.map((item, ii) => (
                                                        <div
                                                            key={ii}
                                                            className="flex items-center gap-3 p-3 rounded-2xl bg-card/60 border border-border"
                                                        >
                                                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                                <span className="w-2 h-2 rounded-full bg-primary" />
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                {item.link ? (
                                                                    <a
                                                                        href={item.link}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-sm md:text-base text-primary hover:underline leading-snug flex items-center gap-2"
                                                                    >
                                                                        {item.text}
                                                                        <ExternalLink size={13} className="opacity-60 shrink-0" />
                                                                    </a>
                                                                ) : (
                                                                    <p className="text-sm md:text-base text-muted-foreground leading-snug">
                                                                        {item.text}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Plain-text description fallback */}
                            {trader!.description && !descSections && (
                                <div className="glow-border rounded-3xl p-5 md:p-6 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <FileText size={15} className="text-primary" />
                                        </div>
                                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                            Mô tả
                                        </p>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                        {trader!.description}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* ── RIGHT SIDEBAR ── */}
                        <div className="space-y-4">

                            {/* Stats */}
                            <div className="glow-border rounded-3xl p-5 md:p-6 space-y-4">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Thống kê
                                </p>

                                {/* Role + Code */}
                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-card/60 border border-border">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <Hash size={18} className="text-primary" />
                                    </div>
                                    <div className="min-w-0 leading-tight">
                                        <p className="text-sm font-semibold text-foreground truncate">{roleLabel}</p>
                                        <p className="text-xs text-muted-foreground font-mono">{trader!.code}</p>
                                    </div>
                                </div>

                                {/* Insurance join date */}
                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-card/60 border border-border">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <ShieldCheck size={18} className="text-primary" />
                                    </div>
                                    <div className="leading-tight">
                                        <p className="text-xs text-muted-foreground">Tham gia bảo hiểm</p>
                                        <p className="text-sm font-semibold text-foreground">
                                            {formatDate(trader!.created_at)}
                                        </p>
                                    </div>
                                </div>

                                {/* Success rate */}
                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-card/60 border border-border">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <TrendingUp size={18} className="text-primary" />
                                    </div>
                                    <div className="leading-tight">
                                        <p className="text-xs text-muted-foreground">Tỷ lệ thành công</p>
                                        <p className="text-sm font-semibold text-foreground">{successRate}%</p>
                                    </div>
                                </div>

                                {/* Trust progress bar */}
                                <div>
                                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                                        <span>Độ tin cậy</span>
                                        <span>{successRate}%</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                                            style={{ width: `${successRate}%` }}
                                            role="progressbar"
                                            aria-valuenow={successRate}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Categories */}
                            {categories.length > 0 && (
                                <div className="glow-border rounded-3xl p-5 md:p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <Tag size={13} className="text-primary" />
                                        </div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Danh mục
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((c) => (
                                            <span
                                                key={c.id}
                                                className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                                            >
                                                {c.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Copy link */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={copyPageLink}
                                className="w-full gap-2 rounded-2xl h-11"
                                aria-label={copied ? "Đã sao chép link" : "Sao chép link trang này"}
                            >
                                {copied ? (
                                    <>
                                        <CheckCheck size={15} className="text-primary" />
                                        Đã copy link!
                                    </>
                                ) : (
                                    <>
                                        <Copy size={15} />
                                        Copy link trang này
                                    </>
                                )}
                            </Button>

                            {/* Back button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.back()}
                                className="w-full gap-2 rounded-2xl h-11 text-muted-foreground"
                            >
                                <ArrowLeft size={15} />
                                Quay lại
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default GDVDetail;
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Globe,
    MessageCircle,
    Facebook,
    ShieldCheck,
    TrendingUp,
    Copy,
    CheckCheck,
    Hash,
    FileText,
    MessageSquare,
} from "lucide-react";
import MainLayout from "@/layouts/MainLayout";

interface Trader {
    id: string;
    name: string;
    slug: string;
    service: string | null;
    code: string;
    insurance_fund: number;
    success_rate: number;
    status: string;
    avatar_url: string | null;
    description: string | null;
    facebook: string | null;
    zalo: string | null;
    website: string | null;
}

interface Category {
    id: string;
    name: string;
}

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

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: rawTrader, error: traderError } = await (supabase
                .from("traders")
                .select("*")
                .eq("slug", slug)
                .maybeSingle() as any) as { data: Trader | null; error: Error | null };

            if (traderError || !rawTrader) {
                setNotFound(true);
                setLoading(false);
                return;
            }

            setTrader(rawTrader);

            // Set browser tab title
            document.title = `Quỹ bảo hiểm: ${Number(rawTrader.insurance_fund).toLocaleString("vi-VN")}đ - ${rawTrader.name}`;

            const { data: tcData } = await supabase
                .from("trader_categories")
                .select("category_id")
                .eq("trader_id", rawTrader.id);

            const catIds = (tcData || []).map((tc: any) => tc.category_id);
            if (catIds.length > 0) {
                const { data: catData } = await supabase
                    .from("categories")
                    .select("*")
                    .in("id", catIds);
                setCategories((catData as Category[]) || []);
            }

            setLoading(false);
        };

        fetchTrader();

        // Reset title on unmount
        return () => {
            document.title = "Miyaru Guardian";
        };
    }, [slug]);

    const copyPageLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        <p className="text-sm text-muted-foreground">Đang tải thông tin...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    // ── Not found ────────────────────────────────────────────────────────────
    if (notFound || !trader) {
        return (
            <MainLayout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShieldCheck size={28} className="text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Không tìm thấy GDV</h2>
                    <p className="text-muted-foreground text-sm max-w-xs">
                        Giao dịch viên bạn đang tìm có thể đã bị xóa hoặc đường dẫn không đúng.
                    </p>
                    <Button variant="outline" onClick={() => router.back()} className="gap-2">
                        <ArrowLeft size={16} />
                        Quay lại
                    </Button>
                </div>
            </MainLayout>
        );
    }

    // ── Detail ───────────────────────────────────────────────────────────────
    const isLive = trader.status === "LIVE";

    return (
        <MainLayout>
            <div className="min-h-screen py-6 md:py-10 px-4">
                <div className="container mx-auto max-w-5xl">

                    {/* Back */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                    >
                        <ArrowLeft size={16} />
                        Quay lại danh sách
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* ── LEFT / MAIN ── */}
                        <div className="lg:col-span-2 space-y-5">

                            {/* Hero card */}
                            <div className="glow-border rounded-3xl p-5 md:p-7">
                                <div className="flex items-start gap-4 mb-5">
                                    {trader.avatar_url ? (
                                        <img
                                            src={trader.avatar_url}
                                            alt={trader.name}
                                            className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border border-primary/20 shrink-0"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                                            <span className="text-2xl md:text-3xl font-bold text-primary">
                                                {trader.name.charAt(0)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
                                                {trader.name}
                                            </h1>
                                            <img
                                                src="/tick.gif"
                                                alt="verified"
                                                className="w-5 h-5 object-contain shrink-0"
                                            />
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                                                    isLive ? "status-live" : "status-offline"
                                                }`}
                                            >
                                                {trader.status}
                                            </span>
                                        </div>

                                        {trader.service && (
                                            <p className="text-sm text-muted-foreground mb-2">{trader.service}</p>
                                        )}

                                        {categories.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {categories.map(c => (
                                                    <span
                                                        key={c.id}
                                                        className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20"
                                                    >
                                                        {c.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm py-3 border-t border-border">
                                    <Hash size={13} className="text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground">Mã GDV:</span>
                                    <span className="font-mono font-semibold text-foreground">{trader.code}</span>
                                </div>
                            </div>

                            {/* Mô tả */}
                            {trader.description && (
                                <div className="glow-border rounded-3xl p-5 md:p-7">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <FileText size={14} className="text-primary" />
                                        </div>
                                        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                                            Giới thiệu
                                        </h2>
                                    </div>
                                    <div className="space-y-3">
                                        {trader.description.split("\n").filter(Boolean).map((para, idx) => (
                                            <p key={idx} className="text-sm md:text-base text-muted-foreground leading-relaxed">
                                                {para}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Liên hệ */}
                            {(trader.facebook || trader.zalo || trader.website) && (
                                <div className="glow-border rounded-3xl p-5 md:p-7">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                                        Liên hệ
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
                                        {trader.facebook && (
                                            <a
                                                href={`https://m.me/${trader.facebook.replace(/\D/g, "")}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/60 border border-border hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-colors text-sm"
                                            >
                                                <MessageSquare size={16} className="text-indigo-500 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-muted-foreground">Messenger</p>
                                                    <p className="text-foreground font-medium text-sm">Chat Messenger</p>
                                                </div>
                                            </a>
                                        )}
                                        {trader.facebook && (
                                            <a
                                                href={
                                                    trader.facebook.startsWith("http")
                                                        ? trader.facebook
                                                        : `https://www.facebook.com/${trader.facebook}`
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/60 border border-border hover:border-blue-500/40 hover:bg-blue-500/5 transition-colors text-sm"
                                            >
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
                                            <a
                                                href={`https://zalo.me/${trader.zalo.replace(/\D/g, "")}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/60 border border-border hover:border-sky-400/40 hover:bg-sky-400/5 transition-colors text-sm"
                                            >
                                                <MessageCircle size={16} className="text-sky-400 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-muted-foreground">Zalo</p>
                                                    <p className="text-foreground font-medium text-sm">{trader.zalo}</p>
                                                </div>
                                            </a>
                                        )}
                                        {trader.website && (
                                            <a
                                                href={
                                                    trader.website.startsWith("http")
                                                        ? trader.website
                                                        : `https://${trader.website}`
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/60 border border-border hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-colors text-sm"
                                            >
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
                        </div>

                        {/* ── RIGHT / SIDEBAR ── */}
                        <div className="space-y-5">
                            <div className="glow-border rounded-3xl p-5 md:p-6 space-y-4">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Thống kê
                                </p>

                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20">
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

                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-card/60 border border-border">
                                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <TrendingUp size={18} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Tỷ lệ thành công</p>
                                        <p className="text-base font-bold text-foreground leading-tight">
                                            {Number(trader.success_rate)}%
                                        </p>
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

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={copyPageLink}
                                className="w-full gap-2 rounded-2xl h-11"
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
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default GDVDetail;
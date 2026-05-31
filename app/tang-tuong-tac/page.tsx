"use client";

import { useEffect, useState, useRef } from "react";
import MainLayout from "../../layouts/MainLayout";
import { TuongTacService, formatPrice, formatNumber } from "@/lib/tang-tuong-tac";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    RefreshCw,
    ChevronDown,
    ChevronUp,
    Info,
    Check,
    ChevronsUpDown,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// ── Helpers label — lấy trực tiếp từ data, không cần hardcode ────────────────
// social: "facebook" → "Facebook", "tiktok" → "TikTok"
function socialLabel(social: string): string {
    return social.charAt(0).toUpperCase() + social.slice(1);
}

// service slug: "tang-like-facebook" → "Tang Like Facebook"
function serviceLabel(slug: string): string {
    return slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

// ── Combobox ──────────────────────────────────────────────────────────────────
interface ComboOption { value: string; label: string }

function Combobox({
    options,
    value,
    onChange,
    placeholder = "Chọn…",
    disabled = false,
}: {
    options: ComboOption[];
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    disabled?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node))
                setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const filtered = options.filter((o) =>
        o.label.toLowerCase().includes(query.toLowerCase())
    );
    const selected = options.find((o) => o.value === value);

    return (
        <div ref={ref} className="relative w-full">
            <button
                type="button"
                disabled={disabled}
                onClick={() => { setOpen((v) => !v); setQuery(""); }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 h-10 rounded-md border bg-background text-sm transition-colors
                    ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-muted cursor-pointer"}
                    ${open ? "ring-2 ring-ring border-ring" : "border-input"}`}
            >
                <span className={selected ? "text-foreground truncate" : "text-muted-foreground"}>
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronsUpDown size={14} className="text-muted-foreground shrink-0" />
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
                    <div className="p-2 border-b">
                        <Input
                            autoFocus
                            placeholder="Tìm…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="h-8 text-sm"
                        />
                    </div>
                    <ul className="max-h-60 overflow-y-auto py-1">
                        {filtered.length === 0 && (
                            <li className="px-3 py-2 text-sm text-muted-foreground">
                                Không tìm thấy
                            </li>
                        )}
                        {filtered.map((o) => (
                            <li
                                key={o.value}
                                onClick={() => { onChange(o.value); setOpen(false); }}
                                className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-muted transition-colors
                                    ${o.value === value ? "text-primary font-medium bg-primary/5" : ""}`}
                            >
                                <Check
                                    size={13}
                                    className={o.value === value
                                        ? "opacity-100 text-primary shrink-0"
                                        : "opacity-0 shrink-0"}
                                />
                                {o.label}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    return status === "on" ? (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-0 shrink-0">
            Hoạt động
        </Badge>
    ) : (
        <Badge variant="destructive" className="shrink-0">Tạm dừng</Badge>
    );
}

// ── ServiceRow ────────────────────────────────────────────────────────────────
function ServiceRow({ item }: { item: TuongTacService }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/40 transition-colors">
                <span className="text-xs text-muted-foreground w-10 shrink-0">
                    #{item.id}
                </span>
                <span className="flex-1 text-sm font-medium leading-snug">
                    {item.name}
                </span>
                <span className="text-sm font-semibold text-primary whitespace-nowrap">
                    {formatPrice(item.prices)}đ /1
                </span>
                <div className="hidden sm:block">
                    <StatusBadge status={item.status} />
                </div>
                <button
                    onClick={() => setOpen((v) => !v)}
                    className="text-muted-foreground hover:text-foreground transition-colors ml-1"
                >
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>

            {open && (
                <div className="px-4 py-3 bg-muted/30 border-t text-sm space-y-3">
                    <div className="flex flex-wrap gap-4 text-muted-foreground">
                        <span>Min: <strong className="text-foreground">{formatNumber(item.min_order)}</strong></span>
                        <span>Max: <strong className="text-foreground">{formatNumber(item.max_order)}</strong></span>
                        <span>Hoàn phí: <strong className="text-foreground">{item.refund_fees}%</strong></span>
                        <span>Server: <strong className="text-foreground font-mono">{item.server_order}</strong></span>
                        <div className="sm:hidden"><StatusBadge status={item.status} /></div>
                    </div>
                    {item.detail && (
                        <div className="bg-card border rounded-lg p-3 text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                            <div className="flex items-center gap-1 mb-1 text-foreground font-medium">
                                <Info size={13} /> Mô tả
                            </div>
                            {item.detail}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TangTuongTacPage() {
    const [data, setData] = useState<TuongTacService[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedSocial, setSelectedSocial] = useState<string>("");
    const [selectedService, setSelectedService] = useState<string>("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/tang-tuong-tac");
            const json = await res.json();
            if (json.status === "success") {
                setData(json.data);
            } else {
                throw new Error(json.message || "Lỗi API");
            }
        } catch (err: any) {
            toast({
                title: "Lỗi",
                description: err.message || "Không tải được dịch vụ",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Options Combobox Social — tự động lấy từ data, không hardcode
    const socialOptions: ComboOption[] = [
        { value: "", label: "Tất cả nền tảng" },
        ...Array.from(new Set(data.map((d) => d.social))).map((s) => ({
            value: s,
            label: socialLabel(s),
        })),
    ];

    // Options Combobox Service — lọc theo social đang chọn
    const servicesForSocial = data.filter(
        (d) => !selectedSocial || d.social === selectedSocial
    );
    const serviceOptions: ComboOption[] = [
        { value: "", label: "Tất cả dịch vụ" },
        ...Array.from(new Set(servicesForSocial.map((d) => d.service))).map((s) => ({
            value: s,
            label: serviceLabel(s),
        })),
    ];

    // Đổi social → reset service nếu không còn hợp lệ
    const handleSocialChange = (v: string) => {
        setSelectedSocial(v);
        const still = data.some(
            (d) => (!v || d.social === v) && d.service === selectedService
        );
        if (!still) setSelectedService("");
    };

    // Lọc dữ liệu hiển thị
    const filtered = data.filter((item) => {
        const matchSocial = !selectedSocial || item.social === selectedSocial;
        const matchService = !selectedService || item.service === selectedService;
        return matchSocial && matchService;
    });

    return (
        <MainLayout>
            <div className="min-h-screen bg-background text-foreground py-12 px-4 mt-10">
                <div className="max-w-3xl mx-auto space-y-6">

                    {/* Header */}
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold">
                            Danh Sách Dịch Vụ Tăng Tương Tác
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Tổng hợp tất cả dịch vụ tăng tương tác Facebook, TikTok, Instagram…
                        </p>
                    </div>

                    {/* Controls */}
                    <Card>
                        <CardContent className="pt-5 space-y-4">
                            <div className="flex flex-col lg:flex-row gap-3 lg:items-end">

                                <div className="w-full lg:flex-1 space-y-1">
                                    <label className="text-xs text-muted-foreground font-medium">
                                        Nền tảng
                                    </label>
                                    <Combobox
                                        options={socialOptions}
                                        value={selectedSocial}
                                        onChange={handleSocialChange}
                                        placeholder="Chọn nền tảng…"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="w-full lg:flex-1 space-y-1">
                                    <label className="text-xs text-muted-foreground font-medium">
                                        Loại dịch vụ
                                    </label>
                                    <Combobox
                                        options={serviceOptions}
                                        value={selectedService}
                                        onChange={setSelectedService}
                                        placeholder="Chọn loại dịch vụ…"
                                        disabled={loading}
                                    />
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={fetchData}
                                    disabled={loading}
                                    className="w-full lg:w-10 h-10 shrink-0"
                                >
                                    <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                                    <span className="lg:hidden ml-2">Làm mới</span>
                                </Button>
                            </div>

                            <div className="text-xs text-muted-foreground text-center sm:text-left">
                                {loading
                                    ? "Đang tải…"
                                    : `Hiển thị ${filtered.length} / ${data.length} dịch vụ`}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danh sách */}
                    {loading ? (
                        <div className="flex justify-center py-20 text-muted-foreground">
                            <RefreshCw className="animate-spin mr-2" size={18} />
                            Đang tải danh sách dịch vụ…
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground">
                            Không tìm thấy dịch vụ nào
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filtered.map((item) => (
                                <ServiceRow key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
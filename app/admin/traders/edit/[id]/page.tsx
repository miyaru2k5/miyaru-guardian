"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    useForm, useFieldArray, useWatch,
    UseFormRegister, UseFormSetValue, Control,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ArrowLeft, Plus, Trash2, Building2, ChevronDown, QrCode,
    CreditCard, User, Loader2, Camera, ImageIcon, Link2,
    Globe, Phone, Facebook, FileText, Tag, Hash, Shield,
    TrendingUp, Pencil, Check, X, ExternalLink,
} from "lucide-react";
import { getFbUid } from "@/lib/getFbUid";
import Image from "next/image";
import { cn } from "@/lib/utils";

// ─── Constants ──────────────────────────────────────────────────────────────────

const R2_DOMAIN = process.env.NEXT_PUBLIC_R2_DOMAIN!;

const ROLE_OPTIONS = [
    { value: "gdv", label: "Giao dịch viên" },
    { value: "admin", label: "Quản lý & Điều hành" },
    { value: "kdv", label: "Kiểm duyệt viên" },
] as const;

type RoleValue = "admin" | "gdv" | "kdv";

// ─── Types ──────────────────────────────────────────────────────────────────────

type VietQRBank = { bin: string; short_name: string; name: string; logo: string };
interface Category { id: string; name: string }

// ─── Description JSON types ────────────────────────────────────────────────────

interface DescItem { text: string; link?: string }
interface DescSection { title: string; items: DescItem[] }

// ─── Schema ─────────────────────────────────────────────────────────────────────

const bankEntrySchema = z.object({
    bank_name: z.string().min(1, "Chọn ngân hàng"),
    account_number: z.string().min(1, "Bắt buộc"),
    account_holder: z.string().min(1, "Bắt buộc"),
});

const traderSchema = z.object({
    name: z.string().min(1, "Bắt buộc").max(100),
    slug: z.string().min(1, "Slug bắt buộc").max(120)
        .regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
    code: z.string().min(1, "Bắt buộc").max(20),
    role: z.enum(["admin", "gdv", "kdv"]).default("gdv"),
    avatar_url: z.string().max(500).optional(),
    banner_url: z.string().max(500).optional(),
    service: z.string().max(100).optional(),
    description: z.string().max(5000).optional(),
    insurance_fund: z.coerce.number().min(0),
    success_rate: z.coerce.number().min(0).max(100),
    facebook: z.string().max(255).optional(),
    zalo: z.string().max(50).optional(),
    website: z.string().max(255).optional(),
    banks: z.array(bankEntrySchema).default([]),
});

type TraderForm = z.infer<typeof traderSchema>;

// ─── R2 helpers ─────────────────────────────────────────────────────────────────

async function uploadToR2(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.url as string;
}

async function deleteFromR2(url: string) {
    try {
        await fetch("/api/upload/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
        });
    } catch (err) { console.error("Delete R2 error:", err) }
}

// ─── ImagePicker ────────────────────────────────────────────────────────────────

interface ImagePickerProps {
    currentUrl?: string;
    pendingFile: File | null;
    localPreview: string;
    onFileSelect: (file: File, localPreview: string) => void;
    shape: "avatar" | "banner";
    className?: string;
}

function ImagePicker({ currentUrl, pendingFile, localPreview, onFileSelect, shape, className }: ImagePickerProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const displayUrl = localPreview || currentUrl || "";
    const isAvatar = shape === "avatar";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        onFileSelect(file, URL.createObjectURL(file));
        e.target.value = "";
    };

    return (
        <div className={cn("relative group", className)}>
            <div
                onClick={() => inputRef.current?.click()}
                className={cn(
                    "overflow-hidden flex items-center justify-center bg-muted/30 border-2 transition-colors cursor-pointer",
                    isAvatar ? "w-[110px] h-[110px] rounded-xl" : "w-full h-[110px] rounded-xl",
                    displayUrl ? "border-border" : "border-dashed border-border/50"
                )}
            >
                {displayUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={displayUrl} alt={isAvatar ? "Avatar" : "Banner"} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center gap-1.5 text-muted-foreground/30 pointer-events-none select-none">
                        <ImageIcon size={isAvatar ? 22 : 28} />
                        <span className="text-[11px]">{isAvatar ? "Avatar" : "Banner"}</span>
                    </div>
                )}
            </div>

            {pendingFile && (
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-amber-400/90 text-[10px] font-semibold text-black rounded-md leading-tight z-10">
                    Chưa lưu
                </span>
            )}

            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="absolute bottom-1.5 right-1.5 bg-primary text-primary-foreground p-1.5 rounded-full shadow hover:scale-110 active:scale-95 transition-transform z-10"
            >
                <Camera size={11} />
            </button>

            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
        </div>
    );
}

// ─── DescriptionEditor (JSON-based rich editor) ─────────────────────────────────

interface DescriptionEditorProps {
    value: string;
    onChange: (val: string) => void;
}

const DEFAULT_DESC: DescSection[] = [{ title: "Giới thiệu", items: [{ text: "" }] }];

function parseDesc(raw: string): DescSection[] {
    if (!raw) return DEFAULT_DESC;
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
    } catch { }
    return DEFAULT_DESC;
}

function DescriptionEditor({ value, onChange }: DescriptionEditorProps) {
    const [sections, setSections] = useState<DescSection[]>(() => parseDesc(value));

    const commit = useCallback((next: DescSection[]) => {
        setSections(next);
        onChange(JSON.stringify(next));
    }, [onChange]);

    const addSection = () => commit([...sections, { title: "Tiêu đề mới", items: [{ text: "" }] }]);

    const removeSection = (si: number) => commit(sections.filter((_, i) => i !== si));

    const updateTitle = (si: number, title: string) => {
        const next = sections.map((s, i) => i === si ? { ...s, title } : s);
        commit(next);
    };

    const addItem = (si: number) => {
        const next = sections.map((s, i) => i === si ? { ...s, items: [...s.items, { text: "" }] } : s);
        commit(next);
    };

    const removeItem = (si: number, ii: number) => {
        const next = sections.map((s, i) => i === si ? { ...s, items: s.items.filter((_, j) => j !== ii) } : s);
        commit(next);
    };

    const updateItem = (si: number, ii: number, patch: Partial<DescItem>) => {
        const next = sections.map((s, i) => i === si
            ? { ...s, items: s.items.map((item, j) => j === ii ? { ...item, ...patch } : item) }
            : s
        );
        commit(next);
    };

    return (
        <div className="space-y-3">
            {sections.map((sec, si) => (
                <div key={si} className="border border-border rounded-xl overflow-hidden bg-card/40">
                    {/* Section header */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border">
                        <FileText size={12} className="text-muted-foreground shrink-0" />
                        <input
                            value={sec.title}
                            onChange={(e) => updateTitle(si, e.target.value)}
                            className="flex-1 min-w-0 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/50"
                            placeholder="Tên tiêu đề..."
                        />
                        {/* FIX: min-w buttons so they never get hidden on mobile */}
                        <button
                            type="button"
                            onClick={() => addItem(si)}
                            className="min-w-[28px] min-h-[28px] flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Thêm mô tả"
                        >
                            <Plus size={13} />
                        </button>
                        <button
                            type="button"
                            onClick={() => removeSection(si)}
                            className="min-w-[28px] min-h-[28px] flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            title="Xoá tiêu đề"
                        >
                            <X size={13} />
                        </button>
                    </div>

                    {/* Items */}
                    <div className="divide-y divide-border/50">
                        {sec.items.map((item, ii) => (
                            <div key={ii} className="flex items-center gap-2 px-3 py-2">
                                <span className="text-muted-foreground/40 text-xs select-none shrink-0">·</span>
                                <input
                                    value={item.text}
                                    onChange={(e) => updateItem(si, ii, { text: e.target.value })}
                                    className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40"
                                    placeholder="Nội dung mô tả..."
                                />
                                <input
                                    value={item.link || ""}
                                    onChange={(e) => updateItem(si, ii, { link: e.target.value || undefined })}
                                    className="w-24 shrink-0 bg-transparent text-xs text-muted-foreground outline-none border-l border-border pl-2 placeholder:text-muted-foreground/30"
                                    placeholder="Link"
                                />
                                {item.link && (
                                    <ExternalLink size={11} className="text-blue-500 shrink-0" />
                                )}
                                <button
                                    type="button"
                                    onClick={() => removeItem(si, ii)}
                                    className="min-w-[20px] min-h-[20px] flex items-center justify-center rounded hover:bg-destructive/10 text-muted-foreground/40 hover:text-destructive transition-colors shrink-0"
                                >
                                    <X size={11} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={addSection}
                className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-border/50 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
            >
                <Plus size={12} /> Thêm tiêu đề
            </button>
        </div>
    );
}

// ─── RoleCombobox ────────────────────────────────────────────────────────────────

function RoleCombobox({ value, onChange }: { value: RoleValue; onChange: (v: RoleValue) => void }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const current = ROLE_OPTIONS.find((r) => r.value === value) ?? ROLE_OPTIONS[0];

    useEffect(() => {
        const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center gap-2 h-10 px-3 rounded-xl border border-input bg-background text-sm hover:border-ring/50 focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            >
                <User size={14} className="text-muted-foreground shrink-0" />
                <span className="flex-1 text-left">{current.label}</span>
                <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{current.value}</span>
                <ChevronDown size={14} className={cn("text-muted-foreground shrink-0 transition-transform duration-200", open && "rotate-180")} />
            </button>

            {open && (
                <div className="absolute z-50 mt-1.5 w-full bg-popover border rounded-xl shadow-lg overflow-hidden">
                    {ROLE_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => { onChange(opt.value); setOpen(false) }}
                            className={cn(
                                "w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm hover:bg-muted text-left transition-colors",
                                value === opt.value && "bg-muted/70 font-medium"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                {value === opt.value && <Check size={12} className="text-primary" />}
                                {value !== opt.value && <div className="w-3" />}
                                <span>{opt.label}</span>
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{opt.value}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── BankRow ─────────────────────────────────────────────────────────────────────

function BankRow({
    index, vietqrBanks, control, register, setValue, onRemove, errors,
}: {
    index: number; vietqrBanks: VietQRBank[]; control: Control<TraderForm>;
    register: UseFormRegister<TraderForm>; setValue: UseFormSetValue<TraderForm>;
    onRemove: () => void;
    errors?: Partial<Record<"bank_name" | "account_number" | "account_holder", { message?: string }>>;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const bankName = (useWatch({ control, name: `banks.${index}.bank_name` }) ?? "") as string;
    const accountNumber = (useWatch({ control, name: `banks.${index}.account_number` }) ?? "") as string;
    const accountHolder = (useWatch({ control, name: `banks.${index}.account_holder` }) ?? "") as string;

    const selectedBank = vietqrBanks.find((b) => b.short_name === bankName) ?? null;
    const filtered = vietqrBanks.filter((b) =>
        b.short_name.toLowerCase().includes(search.toLowerCase()) ||
        b.name.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const h = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false) };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const cleanAccNum = accountNumber.replace(/\s/g, "");
    const qrLink = bankName && cleanAccNum && accountHolder
        ? `https://img.vietqr.io/image/${encodeURIComponent(bankName)}-${cleanAccNum}-compact2.png?amount=0&addInfo=&accountName=${encodeURIComponent(accountHolder)}`
        : null;

    return (
        <div className="border border-border rounded-2xl p-3 bg-card/60 space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Tài khoản #{index + 1}
                </span>
                <Button type="button" variant="ghost" size="icon" onClick={onRemove}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive">
                    <Trash2 size={13} />
                </Button>
            </div>

            <input type="hidden" {...register(`banks.${index}.bank_name`)} />

            {/* Bank selector */}
            <div className="relative" ref={dropdownRef}>
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="w-full flex items-center gap-2.5 h-10 px-3 rounded-xl border border-input bg-background text-sm hover:border-ring/50 focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                >
                    {selectedBank?.logo
                        ? <Image src={selectedBank.logo} alt={selectedBank.short_name} width={18} height={18} className="rounded object-contain shrink-0" unoptimized />
                        : <Building2 size={15} className="text-muted-foreground shrink-0" />
                    }
                    <span className={cn("flex-1 text-left truncate", !selectedBank && "text-muted-foreground")}>
                        {selectedBank ? `${selectedBank.short_name} — ${selectedBank.name}` : "Chọn ngân hàng"}
                    </span>
                    <ChevronDown size={14} className={cn("text-muted-foreground shrink-0 transition-transform duration-200", open && "rotate-180")} />
                </button>

                {open && (
                    <div className="absolute z-50 mt-1.5 w-full bg-popover border rounded-xl shadow-lg overflow-hidden">
                        <div className="p-2 border-b">
                            <Input autoFocus placeholder="Tìm ngân hàng..." value={search}
                                onChange={(e) => setSearch(e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                            {filtered.length === 0
                                ? <p className="text-sm text-center text-muted-foreground py-3">Không tìm thấy</p>
                                : filtered.map((b) => (
                                    <button key={b.bin} type="button"
                                        onClick={() => { setValue(`banks.${index}.bank_name`, b.short_name, { shouldDirty: true, shouldValidate: true }); setSearch(""); setOpen(false) }}
                                        className={cn("w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted text-left transition-colors", bankName === b.short_name && "bg-muted/70 font-medium")}
                                    >
                                        {b.logo && <Image src={b.logo} alt={b.short_name} width={18} height={18} className="rounded object-contain shrink-0" unoptimized />}
                                        <span className="font-medium shrink-0">{b.short_name}</span>
                                        <span className="text-muted-foreground truncate">{b.name}</span>
                                    </button>
                                ))
                            }
                        </div>
                    </div>
                )}
                {errors?.bank_name && <p className="text-xs text-destructive mt-1">{errors.bank_name.message}</p>}
            </div>

            {/* Inputs + QR */}
            <div className="flex gap-3 items-start">
                <div className="flex-1 space-y-2.5">
                    <div className="relative">
                        <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <Input
                            {...register(`banks.${index}.account_number`)}
                            onChange={(e) => {
                                const formatted = e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
                                e.target.value = formatted;
                                setValue(`banks.${index}.account_number`, formatted, { shouldDirty: true });
                            }}
                            placeholder="Số tài khoản"
                            className="pl-8 font-mono tracking-wider text-sm"
                            maxLength={19}
                        />
                        {errors?.account_number && <p className="text-xs text-destructive mt-1">{errors.account_number.message}</p>}
                    </div>
                    <div className="relative">
                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <Input
                            {...register(`banks.${index}.account_holder`)}
                            onChange={(e) => {
                                const upper = e.target.value.toUpperCase();
                                e.target.value = upper;
                                setValue(`banks.${index}.account_holder`, upper, { shouldDirty: true });
                            }}
                            placeholder="Chủ tài khoản"
                            className="pl-8 uppercase tracking-wide text-sm"
                        />
                        {errors?.account_holder && <p className="text-xs text-destructive mt-1">{errors.account_holder.message}</p>}
                    </div>
                </div>

                <div className={cn(
                    "w-[80px] h-[80px] shrink-0 rounded-xl border overflow-hidden flex items-center justify-center transition-all duration-300",
                    qrLink ? "border-border/50 bg-white" : "border-dashed border-border/30 bg-muted/20"
                )}>
                    {qrLink
                        ? <Image src={qrLink} alt="VietQR" width={80} height={80} className="w-full h-full object-contain" unoptimized />
                        : <QrCode size={22} className="text-muted-foreground/25" />
                    }
                </div>
            </div>
        </div>
    );
}

// ─── Field wrapper helpers ────────────────────────────────────────────────────────

// FIX: Removed icon prop — labels no longer show icons
function Field({ label, error, children }: {
    label: string; error?: string; children: React.ReactNode;
}) {
    return (
        <div className="space-y-1">
            <label className="text-xs text-muted-foreground">{label}</label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

function SectionTitle({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 pb-2 border-b border-border mb-1">
            {icon && <span className="text-muted-foreground">{icon}</span>}
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">{children}</span>
        </div>
    );
}

// ─── Page ──────────────────────────────────────────────────────────────────────────

const EditTraderPage = () => {
    const router = useRouter();
    const params = useParams();
    const traderId = params?.id as string;

    const [loadingTrader, setLoadingTrader] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCats, setSelectedCats] = useState<string[]>([]);
    const [gettingUid, setGettingUid] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [vietqrBanks, setVietqrBanks] = useState<VietQRBank[]>([]);
    const [loadingBanks, setLoadingBanks] = useState(true);

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarLocalPreview, setAvatarLocalPreview] = useState("");
    const [oldAvatarUrl, setOldAvatarUrl] = useState("");

    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerLocalPreview, setBannerLocalPreview] = useState("");
    const [oldBannerUrl, setOldBannerUrl] = useState("");

    const {
        register, handleSubmit, setValue, watch, control, reset,
        formState: { errors },
    } = useForm<TraderForm>({
        resolver: zodResolver(traderSchema),
        defaultValues: { insurance_fund: 0, success_rate: 100, slug: "", banks: [], role: "gdv" },
    });

    const { fields, append, remove } = useFieldArray({ control, name: "banks" });
    const watchedRole = watch("role");
    const watchedAvatarUrl = watch("avatar_url");
    const watchedBannerUrl = watch("banner_url");
    const watchedDescription = watch("description") ?? "";
    // FIX: Watch facebook field directly from form state instead of relying on ref
    const watchedFacebook = watch("facebook") ?? "";

    // ── Fetch ──────────────────────────────────────────────────────────────────────

    useEffect(() => {
        supabase.from("categories").select("*").order("name")
            .then(({ data }) => setCategories((data as Category[]) || []));
    }, []);

    useEffect(() => {
        fetch("https://api.vietqr.io/v2/banks")
            .then((r) => r.json())
            .then((data) => {
                if (data.code === "00")
                    setVietqrBanks(data.data.sort((a: VietQRBank, b: VietQRBank) => a.short_name.localeCompare(b.short_name)));
            })
            .catch(() => toast({ title: "Không tải được danh sách ngân hàng", variant: "destructive" }))
            .finally(() => setLoadingBanks(false));
    }, []);

    useEffect(() => {
        if (!traderId) return;
        (async () => {
            setLoadingTrader(true);
            const { data: trader, error } = await supabase
                .from("traders").select("*, trader_categories(category_id)")
                .eq("id", traderId).single();

            if (error || !trader) {
                toast({ title: "Không tìm thấy GDV", variant: "destructive" });
                router.push("/admin/traders");
                return;
            }

            reset({
                name: trader.name ?? "", slug: trader.slug ?? "", code: trader.code ?? "",
                role: (trader.role as RoleValue) ?? "gdv",
                avatar_url: trader.avatar_url ?? "", banner_url: trader.banner_url ?? "",
                service: trader.service ?? "", description: trader.description ?? "",
                insurance_fund: trader.insurance_fund ?? 0, success_rate: trader.success_rate ?? 100,
                // FIX: Load facebook value properly from DB
                facebook: trader.facebook ?? "",
                zalo: trader.zalo ?? "", website: trader.website ?? "",
                banks: Array.isArray(trader.banks) ? trader.banks : [],
            });

            setOldAvatarUrl(trader.avatar_url ?? "");
            setOldBannerUrl(trader.banner_url ?? "");
            setSelectedCats((trader.trader_categories ?? []).map((tc: { category_id: string }) => tc.category_id));
            setLoadingTrader(false);
        })();
    }, [traderId, reset, router]);

    // Cleanup blob URLs
    useEffect(() => {
        return () => {
            if (avatarLocalPreview) URL.revokeObjectURL(avatarLocalPreview);
            if (bannerLocalPreview) URL.revokeObjectURL(bannerLocalPreview);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Handlers ───────────────────────────────────────────────────────────────────

    const handleAvatarSelect = (file: File, preview: string) => {
        if (avatarLocalPreview) URL.revokeObjectURL(avatarLocalPreview);
        setAvatarFile(file); setAvatarLocalPreview(preview);
    };

    const handleBannerSelect = (file: File, preview: string) => {
        if (bannerLocalPreview) URL.revokeObjectURL(bannerLocalPreview);
        setBannerFile(file); setBannerLocalPreview(preview);
    };

    const handleGetFacebookUID = async () => {
        // FIX: Use watchedFacebook from form state — always reflects DB-loaded or user-typed value
        const url = watchedFacebook;
        if (!url) return;
        try {
            setGettingUid(true);
            const uid = await getFbUid(url);
            setValue("facebook", uid, { shouldDirty: true });
            toast({ title: "Đã lấy UID Facebook", description: uid });
        } catch (err: any) {
            toast({ title: "Không lấy được UID", description: err.message, variant: "destructive" });
        } finally { setGettingUid(false) }
    };

    const onSubmit = async (data: TraderForm) => {
        setSubmitting(true);
        try {
            let finalAvatarUrl = data.avatar_url ?? "";
            let finalBannerUrl = data.banner_url ?? "";

            if (avatarFile) {
                const newUrl = await uploadToR2(avatarFile);
                if (oldAvatarUrl && oldAvatarUrl.includes(R2_DOMAIN)) await deleteFromR2(oldAvatarUrl);
                finalAvatarUrl = newUrl;
                setOldAvatarUrl(newUrl); setAvatarFile(null); setAvatarLocalPreview("");
            }

            if (bannerFile) {
                const newUrl = await uploadToR2(bannerFile);
                if (oldBannerUrl && oldBannerUrl.includes(R2_DOMAIN)) await deleteFromR2(oldBannerUrl);
                finalBannerUrl = newUrl;
                setOldBannerUrl(newUrl); setBannerFile(null); setBannerLocalPreview("");
            }

            const cleanedBanks = data.banks.map((b) => ({ ...b, account_number: b.account_number.replace(/\s/g, "") }));

            const { error } = await supabase.from("traders").update({
                name: data.name, slug: data.slug, code: data.code, role: data.role,
                avatar_url: finalAvatarUrl || null, banner_url: finalBannerUrl || null,
                service: data.service || "", description: data.description || "",
                insurance_fund: data.insurance_fund, success_rate: data.success_rate,
                facebook: data.facebook || null, zalo: data.zalo || null, website: data.website || null,
                banks: cleanedBanks,
            }).eq("id", traderId);

            if (error) throw error;

            await supabase.from("trader_categories").delete().eq("trader_id", traderId);
            if (selectedCats.length > 0)
                await supabase.from("trader_categories").insert(selectedCats.map((catId) => ({ trader_id: traderId, category_id: catId })));

            toast({ title: "Đã cập nhật GDV" });
            router.push("/admin/traders");
        } catch (err: any) {
            toast({ title: "Lỗi cập nhật", description: err.message, variant: "destructive" });
            setSubmitting(false);
        }
    };

    const toggleCat = (catId: string) =>
        setSelectedCats((prev) => prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]);

    // ── Loading ─────────────────────────────────────────────────────────────────────

    if (loadingTrader) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="animate-spin text-muted-foreground" size={32} />
            </div>
        );
    }

    // ── Render ──────────────────────────────────────────────────────────────────────

    return (
        // FIX: Removed sticky header "Danh sách GDV · Chỉnh sửa GDV"
        <div className="flex flex-col min-h-screen">
            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1">
                {/* FIX: Reduced padding p-4 → p-2 sm:p-3 */}
                <div className="p-2 sm:p-3 grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">

                    {/* ── Col 1: Thông tin cơ bản ── */}
                    {/* FIX: Reduced card padding p-5 → p-3 */}
                    <div className="bg-card border border-border rounded-2xl p-3 space-y-3">
                        <SectionTitle icon={<User size={13} />}>Thông tin cơ bản</SectionTitle>

                        {/* FIX: No icon prop on Field labels */}
                        <Field label="Tên GDV" error={errors.name?.message}>
                            <div className="relative">
                                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                <Input {...register("name")} placeholder="Nhập tên giao dịch viên" className="pl-8" />
                            </div>
                        </Field>

                        <Field label="Slug URL" error={errors.slug?.message}>
                            <div className="relative">
                                <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                <Input {...register("slug")} placeholder="vd: nguyen-van-a" className="pl-8 font-mono text-sm" />
                            </div>
                        </Field>

                        <Field label="Biệt danh">
                            <div className="relative">
                                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                <Input {...register("service")} placeholder="Nhập biệt danh" className="pl-8" />
                            </div>
                        </Field>

                        <Field label="Mã GDV" error={errors.code?.message}>
                            <div className="relative">
                                <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                <Input {...register("code")} placeholder="VD: GDV#001" className="pl-8 font-mono text-sm" />
                            </div>
                        </Field>

                        <Field label="Vai trò" error={errors.role?.message}>
                            <RoleCombobox
                                value={(watchedRole as RoleValue) ?? "gdv"}
                                onChange={(v) => setValue("role", v, { shouldDirty: true })}
                            />
                        </Field>

                        {categories.length > 0 && (
                            <Field label="Danh mục">
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((c) => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => toggleCat(c.id)}
                                            className={cn(
                                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                                                selectedCats.includes(c.id)
                                                    ? "bg-primary/15 text-primary border-primary/40"
                                                    : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                                            )}
                                        >
                                            {selectedCats.includes(c.id) && <Check size={10} />}
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                            </Field>
                        )}

                        {/* FIX: Quỹ bảo hiểm và % Thành công xếp thành 2 hàng riêng */}
                        <Field label="Quỹ bảo hiểm">
                            <div className="relative">
                                <Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                <Input {...register("insurance_fund")} type="number" placeholder="0" className="pl-8" />
                            </div>
                        </Field>
                        <Field label="% Thành công">
                            <div className="relative">
                                <TrendingUp size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                <Input {...register("success_rate")} type="number" placeholder="100" className="pl-8" />
                            </div>
                        </Field>
                    </div>

                    {/* ── Col 2: Ảnh + Liên kết ── */}
                    <div className="space-y-3">
                        {/* Ảnh đại diện & Banner */}
                        <div className="bg-card border border-border rounded-2xl p-3 space-y-3">
                            <SectionTitle icon={<ImageIcon size={13} />}>Ảnh đại diện & Banner</SectionTitle>

                            <div className="flex gap-3 items-stretch h-[110px]">
                                <ImagePicker
                                    shape="avatar"
                                    currentUrl={watchedAvatarUrl}
                                    pendingFile={avatarFile}
                                    localPreview={avatarLocalPreview}
                                    onFileSelect={handleAvatarSelect}
                                />
                                <ImagePicker
                                    shape="banner"
                                    currentUrl={watchedBannerUrl}
                                    pendingFile={bannerFile}
                                    localPreview={bannerLocalPreview}
                                    onFileSelect={handleBannerSelect}
                                    className="flex-1"
                                />
                            </div>
                        </div>

                        {/* Liên kết */}
                        <div className="bg-card border border-border rounded-2xl p-3 space-y-3">
                            <SectionTitle icon={<Link2 size={13} />}>Liên kết</SectionTitle>

                            <Field label="Facebook URL / UID">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Facebook size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1877F2] pointer-events-none" />
                                        {/* FIX: Use register only — value flows via react-hook-form, no separate ref needed */}
                                        <Input
                                            {...register("facebook")}
                                            placeholder="https://facebook.com/username"
                                            className="pl-8"
                                        />
                                    </div>
                                    <Button
                                        type="button" variant="outline" size="sm"
                                        disabled={gettingUid}
                                        onClick={handleGetFacebookUID}
                                        className="shrink-0 gap-1.5 text-xs"
                                    >
                                        {gettingUid ? <Loader2 size={12} className="animate-spin" /> : <Hash size={12} />}
                                        {gettingUid ? "..." : "Lấy UID"}
                                    </Button>
                                </div>
                            </Field>

                            <Field label="Zalo (SĐT)">
                                <div className="relative">
                                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                    <Input {...register("zalo")} placeholder="Nhập số điện thoại Zalo" className="pl-8" />
                                </div>
                            </Field>

                            <Field label="Website">
                                <div className="relative">
                                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                    <Input {...register("website")} placeholder="https://example.com" className="pl-8" />
                                </div>
                            </Field>
                        </div>
                    </div>

                    {/* ── Col 3: Mô tả + Ngân hàng ── */}
                    <div className="space-y-3">
                        {/* Mô tả (JSON editor) */}
                        <div className="bg-card border border-border rounded-2xl p-3 space-y-3">
                            <SectionTitle icon={<FileText size={13} />}>Mô tả</SectionTitle>
                            <DescriptionEditor
                                value={watchedDescription}
                                onChange={(val) => setValue("description", val, { shouldDirty: true })}
                            />
                        </div>

                        {/* Tài khoản ngân hàng */}
                        <div className="bg-card border border-border rounded-2xl p-3 space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <CreditCard size={13} className="text-muted-foreground" />
                                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">Tài khoản ngân hàng</span>
                                </div>
                                <Button
                                    type="button" variant="outline" size="sm"
                                    disabled={loadingBanks}
                                    onClick={() => append({ bank_name: "", account_number: "", account_holder: "" })}
                                    className="h-7 gap-1 text-xs"
                                >
                                    <Plus size={12} /> Thêm
                                </Button>
                            </div>

                            {fields.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 border border-dashed border-border/40 rounded-2xl bg-muted/10">
                                    <QrCode size={26} className="text-muted-foreground/25 mb-2" />
                                    <p className="text-sm text-muted-foreground/50">Chưa có tài khoản ngân hàng</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {fields.map((field, index) => (
                                        <BankRow
                                            key={field.id}
                                            index={index}
                                            vietqrBanks={vietqrBanks}
                                            control={control}
                                            register={register}
                                            setValue={setValue}
                                            onRemove={() => remove(index)}
                                            errors={errors.banks?.[index] as any}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* FIX: Sticky bottom bar — buttons pinned to right, never move */}
                <div className="sticky bottom-0 z-20 border-t border-border bg-background/90 backdrop-blur-sm px-3 py-2.5">
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            type="button" variant="outline"
                            className="gap-2"
                            onClick={() => router.push("/admin/traders")}
                        >
                            <X size={14} /> Huỷ
                        </Button>
                        <Button
                            type="submit"
                            className="btn-glow gap-2 min-w-[140px]"
                            disabled={submitting}
                        >
                            {submitting
                                ? <><Loader2 size={14} className="animate-spin" /> Đang lưu...</>
                                : <><Check size={14} /> Cập nhật GDV</>
                            }
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditTraderPage;
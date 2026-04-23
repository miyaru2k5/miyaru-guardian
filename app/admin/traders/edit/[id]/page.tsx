"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    useForm,
    useFieldArray,
    useWatch,
    UseFormRegister,
    UseFormSetValue,
    Control,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ArrowLeft, Plus, Trash2,
    Building2, ChevronDown, QrCode,
    CreditCard, User, Loader2, Camera,
    ImageIcon,
} from "lucide-react";
import { getFbUid } from "@/lib/getFbUid";
import Image from "next/image";

// ─── Constants ─────────────────────────────────────────────────────────────────

const R2_DOMAIN = process.env.NEXT_PUBLIC_R2_DOMAIN!;

const ROLE_OPTIONS = [
    { value: "gdv", label: "Giao dịch viên" },
    { value: "admin", label: "Quản lý & Điều hành" },
    { value: "kdv", label: "Kiểm duyệt viên" },
] as const;

type RoleValue = "admin" | "gdv" | "kdv";

// ─── Types ─────────────────────────────────────────────────────────────────────

type VietQRBank = {
    bin: string;
    short_name: string;
    name: string;
    logo: string;
};

interface Category {
    id: string;
    name: string;
}

// ─── Schema ────────────────────────────────────────────────────────────────────

const bankEntrySchema = z.object({
    bank_name: z.string().min(1, "Chọn ngân hàng"),
    account_number: z.string().min(1, "Bắt buộc"),
    account_holder: z.string().min(1, "Bắt buộc"),
});

const traderSchema = z.object({
    name: z.string().min(1, "Bắt buộc").max(100),
    slug: z
        .string()
        .min(1, "Slug bắt buộc")
        .max(120)
        .regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
    code: z.string().min(1, "Bắt buộc").max(20),
    role: z.enum(["admin", "gdv", "kdv"]).default("gdv"),
    avatar_url: z.string().max(500).optional(),
    banner_url: z.string().max(500).optional(),
    service: z.string().max(100).optional(),
    description: z.string().max(500).optional(),
    insurance_fund: z.coerce.number().min(0),
    success_rate: z.coerce.number().min(0).max(100),
    facebook: z.string().max(255).optional(),
    zalo: z.string().max(50).optional(),
    website: z.string().max(255).optional(),
    banks: z.array(bankEntrySchema).default([]),
});

type TraderForm = z.infer<typeof traderSchema>;

// ─── Helpers: R2 upload / delete ───────────────────────────────────────────────

async function uploadToR2(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
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
    } catch (err) {
        console.error("Delete R2 error:", err);
    }
}

// ─── ImagePicker ───────────────────────────────────────────────────────────────
// Preview local ngay khi chọn file (blob URL), KHÔNG upload lên S3 ngay.
// Parent giữ file + preview, chỉ upload thật khi submit form.

interface ImagePickerProps {
    /** URL đang lưu trong DB (qua RHF watch) */
    currentUrl?: string;
    /** File đang chờ upload (chưa lên S3) */
    pendingFile: File | null;
    /** Blob URL để preview */
    localPreview: string;
    /** Callback khi user chọn file mới */
    onFileSelect: (file: File, localPreview: string) => void;
    /** avatar = hình tròn 80px | banner = hình chữ nhật full-width h-28 */
    shape: "avatar" | "banner";
    className?: string;
}

function ImagePicker({
    currentUrl,
    pendingFile,
    localPreview,
    onFileSelect,
    shape,
    className = "",
}: ImagePickerProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    // Ưu tiên: blob preview > URL từ DB > rỗng
    const displayUrl = localPreview || currentUrl || "";
    const isAvatar = shape === "avatar";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const preview = URL.createObjectURL(file);
        onFileSelect(file, preview);
        e.target.value = ""; // reset để chọn lại cùng file vẫn trigger
    };

    return (
        <div className={`relative group ${className}`}>
            {/* Vùng ảnh */}
            <div
                className={[
                    "overflow-hidden flex items-center justify-center bg-muted/30 border-2 transition-colors",
                    isAvatar
                        ? "w-20 h-20 rounded-full"
                        : "w-full h-28 rounded-xl",
                    displayUrl
                        ? "border-border"
                        : "border-dashed border-border/50",
                ].join(" ")}
            >
                {displayUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={displayUrl}
                        alt={isAvatar ? "Avatar" : "Banner"}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground/30 select-none pointer-events-none">
                        <ImageIcon size={isAvatar ? 20 : 28} />
                        {!isAvatar && (
                            <span className="text-[11px]">Chưa có banner</span>
                        )}
                    </div>
                )}
            </div>

            {/* Badge "Chưa lưu vào S3" */}
            {pendingFile && (
                <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-yellow-400/90 text-[10px] font-bold text-black rounded-md leading-tight whitespace-nowrap z-10 shadow-sm">
                    Chưa lưu vào S3
                </span>
            )}

            {/* Nút camera góc dưới phải */}
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full shadow-md hover:scale-110 active:scale-95 transition-transform duration-150 z-10"
            >
                <Camera size={12} />
            </button>

            {/* Hidden file input */}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleChange}
            />
        </div>
    );
}

// ─── RoleCombobox ──────────────────────────────────────────────────────────────

function RoleCombobox({
    value,
    onChange,
}: {
    value: RoleValue;
    onChange: (v: RoleValue) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const current = ROLE_OPTIONS.find((r) => r.value === value) ?? ROLE_OPTIONS[0];

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node))
                setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center gap-2 h-10 px-3 rounded-xl border border-input bg-background text-sm
                    hover:border-ring/50 focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            >
                <span className="flex-1 text-left">{current.label}</span>
                <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                    {current.value}
                </span>
                <ChevronDown
                    size={14}
                    className={`text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <div className="absolute z-50 mt-1.5 w-full bg-popover border rounded-xl shadow-lg overflow-hidden">
                    {ROLE_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => { onChange(opt.value); setOpen(false); }}
                            className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm hover:bg-muted text-left transition-colors
                                ${value === opt.value ? "bg-muted/70 font-medium" : ""}`}
                        >
                            <span>{opt.label}</span>
                            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {opt.value}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── BankRow ───────────────────────────────────────────────────────────────────

function BankRow({
    index,
    vietqrBanks,
    control,
    register,
    setValue,
    onRemove,
    errors,
}: {
    index: number;
    vietqrBanks: VietQRBank[];
    control: Control<TraderForm>;
    register: UseFormRegister<TraderForm>;
    setValue: UseFormSetValue<TraderForm>;
    onRemove: () => void;
    errors?: Partial<
        Record<"bank_name" | "account_number" | "account_holder", { message?: string }>
    >;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const bankName = (useWatch({ control, name: `banks.${index}.bank_name` }) ?? "") as string;
    const accountNumber = (useWatch({ control, name: `banks.${index}.account_number` }) ?? "") as string;
    const accountHolder = (useWatch({ control, name: `banks.${index}.account_holder` }) ?? "") as string;

    const selectedBank = vietqrBanks.find((b) => b.short_name === bankName) ?? null;
    const filtered = vietqrBanks.filter(
        (b) =>
            b.short_name.toLowerCase().includes(search.toLowerCase()) ||
            b.name.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
                setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const cleanAccNum = accountNumber.replace(/\s/g, "");
    const qrLink =
        bankName && cleanAccNum && accountHolder
            ? `https://img.vietqr.io/image/${encodeURIComponent(bankName)}-${cleanAccNum}-compact2.png?amount=0&addInfo=&accountName=${encodeURIComponent(accountHolder)}`
            : null;

    const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
        e.target.value = formatted;
        setValue(`banks.${index}.account_number`, formatted, { shouldDirty: true });
    };

    const handleAccountHolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const upper = e.target.value.toUpperCase();
        e.target.value = upper;
        setValue(`banks.${index}.account_holder`, upper, { shouldDirty: true });
    };

    return (
        <div className="border border-border rounded-2xl p-4 bg-card/60 space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Tài khoản #{index + 1}
                </span>
                <Button
                    type="button" variant="ghost" size="icon"
                    onClick={onRemove}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                >
                    <Trash2 size={13} />
                </Button>
            </div>

            <input type="hidden" {...register(`banks.${index}.bank_name`)} />

            {/* Bank selector */}
            <div className="relative" ref={dropdownRef}>
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="w-full flex items-center gap-2.5 h-10 px-3 rounded-xl border border-input bg-background text-sm
                        hover:border-ring/50 focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                >
                    {selectedBank?.logo ? (
                        <Image src={selectedBank.logo} alt={selectedBank.short_name}
                            width={18} height={18} className="rounded object-contain shrink-0" unoptimized />
                    ) : (
                        <Building2 size={15} className="text-muted-foreground shrink-0" />
                    )}
                    <span className={`flex-1 text-left truncate ${!selectedBank ? "text-muted-foreground" : ""}`}>
                        {selectedBank
                            ? `${selectedBank.short_name} — ${selectedBank.name}`
                            : "Chọn ngân hàng"}
                    </span>
                    <ChevronDown
                        size={14}
                        className={`text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    />
                </button>

                {open && (
                    <div className="absolute z-50 mt-1.5 w-full bg-popover border rounded-xl shadow-lg overflow-hidden">
                        <div className="p-2 border-b">
                            <Input
                                autoFocus
                                placeholder="Tìm ngân hàng..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                            {filtered.length === 0 ? (
                                <p className="text-sm text-center text-muted-foreground py-3">
                                    Không tìm thấy
                                </p>
                            ) : (
                                filtered.map((b) => (
                                    <button
                                        key={b.bin}
                                        type="button"
                                        onClick={() => {
                                            setValue(`banks.${index}.bank_name`, b.short_name, {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            });
                                            setSearch("");
                                            setOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted text-left transition-colors
                                            ${bankName === b.short_name ? "bg-muted/70 font-medium" : ""}`}
                                    >
                                        {b.logo && (
                                            <Image src={b.logo} alt={b.short_name}
                                                width={18} height={18} className="rounded object-contain shrink-0" unoptimized />
                                        )}
                                        <span className="font-medium shrink-0">{b.short_name}</span>
                                        <span className="text-muted-foreground truncate">{b.name}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
                {errors?.bank_name && (
                    <p className="text-xs text-destructive mt-1">{errors.bank_name.message}</p>
                )}
            </div>

            {/* Inputs + QR */}
            <div className="flex gap-3 items-start">
                <div className="flex-1 space-y-2.5">
                    <div className="relative">
                        <CreditCard size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <Input
                            {...register(`banks.${index}.account_number`)}
                            onChange={handleAccountNumberChange}
                            placeholder="Số tài khoản"
                            className="pl-8 font-mono tracking-wider text-sm"
                            maxLength={19}
                        />
                        {errors?.account_number && (
                            <p className="text-xs text-destructive mt-1">{errors.account_number.message}</p>
                        )}
                    </div>

                    <div className="relative">
                        <User size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <Input
                            {...register(`banks.${index}.account_holder`)}
                            onChange={handleAccountHolderChange}
                            placeholder="Chủ tài khoản"
                            className="pl-8 uppercase tracking-wide text-sm"
                        />
                        {errors?.account_holder && (
                            <p className="text-xs text-destructive mt-1">{errors.account_holder.message}</p>
                        )}
                    </div>
                </div>

                {/* QR preview */}
                <div
                    className={`w-[84px] h-[84px] shrink-0 rounded-xl border overflow-hidden flex items-center justify-center transition-all duration-300
                        ${qrLink ? "border-border/50 bg-white" : "border-dashed border-border/30 bg-muted/20"}`}
                >
                    {qrLink ? (
                        <Image src={qrLink} alt="VietQR" width={84} height={84}
                            className="w-full h-full object-contain" unoptimized />
                    ) : (
                        <QrCode size={22} className="text-muted-foreground/25" />
                    )}
                </div>
            </div>

            {/* Bank badge */}
            {selectedBank && (
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border border-border/30 rounded-xl">
                    {selectedBank.logo && (
                        <Image src={selectedBank.logo} alt={selectedBank.short_name}
                            width={22} height={22} className="rounded-md object-contain shrink-0" unoptimized />
                    )}
                    <div>
                        <p className="text-xs font-semibold leading-tight">{selectedBank.short_name}</p>
                        <p className="text-[11px] text-muted-foreground leading-tight">{selectedBank.name}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

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

    // ── Pending images (chưa upload S3) ──────────────────────────────────────────
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarLocalPreview, setAvatarLocalPreview] = useState("");
    const [oldAvatarUrl, setOldAvatarUrl] = useState("");

    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerLocalPreview, setBannerLocalPreview] = useState("");
    const [oldBannerUrl, setOldBannerUrl] = useState("");

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        control,
        reset,
        formState: { errors },
    } = useForm<TraderForm>({
        resolver: zodResolver(traderSchema),
        defaultValues: {
            insurance_fund: 0,
            success_rate: 100,
            slug: "",
            banks: [],
            role: "gdv",
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: "banks" });

    const watchedRole = watch("role");
    const watchedAvatarUrl = watch("avatar_url");
    const watchedBannerUrl = watch("banner_url");

    // ── Fetch categories ──────────────────────────────────────────────────────────

    useEffect(() => {
        supabase
            .from("categories")
            .select("*")
            .order("name")
            .then(({ data }) => setCategories((data as Category[]) || []));
    }, []);

    // ── Fetch VietQR banks ────────────────────────────────────────────────────────

    useEffect(() => {
        fetch("https://api.vietqr.io/v2/banks")
            .then((r) => r.json())
            .then((data) => {
                if (data.code === "00") {
                    setVietqrBanks(
                        data.data.sort((a: VietQRBank, b: VietQRBank) =>
                            a.short_name.localeCompare(b.short_name)
                        )
                    );
                }
            })
            .catch(() =>
                toast({ title: "Không tải được danh sách ngân hàng", variant: "destructive" })
            )
            .finally(() => setLoadingBanks(false));
    }, []);

    // ── Fetch trader + populate form ──────────────────────────────────────────────

    useEffect(() => {
        if (!traderId) return;

        const fetchTrader = async () => {
            setLoadingTrader(true);

            const { data: trader, error } = await supabase
                .from("traders")
                .select("*, trader_categories(category_id)")
                .eq("id", traderId)
                .single();

            if (error || !trader) {
                toast({ title: "Không tìm thấy GDV", variant: "destructive" });
                router.push("/traders");
                return;
            }

            reset({
                name: trader.name ?? "",
                slug: trader.slug ?? "",
                code: trader.code ?? "",
                role: (trader.role as RoleValue) ?? "gdv",
                avatar_url: trader.avatar_url ?? "",
                banner_url: trader.banner_url ?? "",
                service: trader.service ?? "",
                description: trader.description ?? "",
                insurance_fund: trader.insurance_fund ?? 0,
                success_rate: trader.success_rate ?? 100,
                facebook: trader.facebook ?? "",
                zalo: trader.zalo ?? "",
                website: trader.website ?? "",
                banks: Array.isArray(trader.banks) ? trader.banks : [],
            });

            setOldAvatarUrl(trader.avatar_url ?? "");
            setOldBannerUrl(trader.banner_url ?? "");

            setSelectedCats(
                (trader.trader_categories ?? []).map(
                    (tc: { category_id: string }) => tc.category_id
                )
            );

            setLoadingTrader(false);
        };

        fetchTrader();
    }, [traderId, reset, router]);

    // ── Cleanup blob URLs khi unmount ─────────────────────────────────────────────

    useEffect(() => {
        return () => {
            if (avatarLocalPreview) URL.revokeObjectURL(avatarLocalPreview);
            if (bannerLocalPreview) URL.revokeObjectURL(bannerLocalPreview);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Handlers: image picker callbacks ─────────────────────────────────────────

    const handleAvatarSelect = (file: File, preview: string) => {
        if (avatarLocalPreview) URL.revokeObjectURL(avatarLocalPreview);
        setAvatarFile(file);
        setAvatarLocalPreview(preview);
    };

    const handleBannerSelect = (file: File, preview: string) => {
        if (bannerLocalPreview) URL.revokeObjectURL(bannerLocalPreview);
        setBannerFile(file);
        setBannerLocalPreview(preview);
    };

    // ── Facebook UID ──────────────────────────────────────────────────────────────

    const handleGetFacebookUID = async (url: string) => {
        if (!url) return;
        try {
            setGettingUid(true);
            const uid = await getFbUid(url);
            setValue("facebook", uid);
            toast({ title: "Đã lấy UID Facebook", description: uid });
        } catch (err: any) {
            toast({ title: "Không lấy được UID", description: err.message, variant: "destructive" });
        } finally {
            setGettingUid(false);
        }
    };

    // ── Submit: upload ảnh pending → xóa ảnh cũ → update DB ──────────────────────

    const onSubmit = async (data: TraderForm) => {
        setSubmitting(true);

        try {
            let finalAvatarUrl = data.avatar_url ?? "";
            let finalBannerUrl = data.banner_url ?? "";

            // 1. Upload avatar mới nếu có pending file
            if (avatarFile) {
                const newUrl = await uploadToR2(avatarFile);
                if (oldAvatarUrl && oldAvatarUrl.includes(R2_DOMAIN)) {
                    await deleteFromR2(oldAvatarUrl);
                }
                finalAvatarUrl = newUrl;
                setOldAvatarUrl(newUrl);
                setAvatarFile(null);
                setAvatarLocalPreview("");
            }

            // 2. Upload banner mới nếu có pending file
            if (bannerFile) {
                const newUrl = await uploadToR2(bannerFile);
                if (oldBannerUrl && oldBannerUrl.includes(R2_DOMAIN)) {
                    await deleteFromR2(oldBannerUrl);
                }
                finalBannerUrl = newUrl;
                setOldBannerUrl(newUrl);
                setBannerFile(null);
                setBannerLocalPreview("");
            }

            // 3. Loại bỏ khoảng trắng trong số tài khoản
            const cleanedBanks = data.banks.map((b) => ({
                ...b,
                account_number: b.account_number.replace(/\s/g, ""),
            }));

            // 4. Update Supabase
            const { error } = await supabase
                .from("traders")
                .update({
                    name: data.name,
                    slug: data.slug,
                    code: data.code,
                    role: data.role,
                    avatar_url: finalAvatarUrl || null,
                    banner_url: finalBannerUrl || null,
                    service: data.service || "",
                    description: data.description || "",
                    insurance_fund: data.insurance_fund,
                    success_rate: data.success_rate,
                    facebook: data.facebook || null,
                    zalo: data.zalo || null,
                    website: data.website || null,
                    banks: cleanedBanks,
                })
                .eq("id", traderId);

            if (error) throw error;

            // 5. Sync categories: xóa cũ → insert mới
            await supabase.from("trader_categories").delete().eq("trader_id", traderId);
            if (selectedCats.length > 0) {
                await supabase.from("trader_categories").insert(
                    selectedCats.map((catId) => ({ trader_id: traderId, category_id: catId }))
                );
            }

            toast({ title: "Đã cập nhật GDV" });
            router.push("/traders");
        } catch (err: any) {
            toast({ title: "Lỗi cập nhật", description: err.message, variant: "destructive" });
            setSubmitting(false);
        }
    };

    const toggleCat = (catId: string) =>
        setSelectedCats((prev) =>
            prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
        );

    // ── Loading ───────────────────────────────────────────────────────────────────

    if (loadingTrader) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="animate-spin text-muted-foreground" size={32} />
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────────

    return (
        <div className="max-w-xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => router.push("/traders")}>
                    <ArrowLeft size={18} />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Chỉnh sửa giao dịch viên</h1>
                    <p className="text-sm text-muted-foreground">Cập nhật thông tin GDV</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {/* ══ Avatar & Banner ═══════════════════════════════════════════ */}
                <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                        Ảnh đại diện &amp; Banner
                    </label>

                    {/* Layout: avatar trái (cố định 80px) | banner phải (flex-1) */}
                    <div className="flex gap-4 items-end">
                        <ImagePicker
                            shape="avatar"
                            currentUrl={watchedAvatarUrl}
                            pendingFile={avatarFile}
                            localPreview={avatarLocalPreview}
                            onFileSelect={handleAvatarSelect}
                            className="shrink-0"
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

                    {/* URL inputs — nhập tay nếu muốn */}
                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Avatar URL</label>
                            <Input
                                {...register("avatar_url")}
                                placeholder="https://..."
                                className="text-xs"
                                onChange={(e) => {
                                    setValue("avatar_url", e.target.value);
                                    // Nhập URL tay → huỷ pending file
                                    if (avatarFile) {
                                        URL.revokeObjectURL(avatarLocalPreview);
                                        setAvatarFile(null);
                                        setAvatarLocalPreview("");
                                    }
                                }}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Banner URL</label>
                            <Input
                                {...register("banner_url")}
                                placeholder="https://..."
                                className="text-xs"
                                onChange={(e) => {
                                    setValue("banner_url", e.target.value);
                                    if (bannerFile) {
                                        URL.revokeObjectURL(bannerLocalPreview);
                                        setBannerFile(null);
                                        setBannerLocalPreview("");
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <p className="text-[11px] text-muted-foreground mt-1.5">
                        Ảnh chọn qua 📷 sẽ được upload lên S3 khi bấm{" "}
                        <strong>Cập nhật</strong>. Ảnh cũ sẽ bị xóa tự động.
                    </p>
                </div>

                {/* Tên */}
                <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Tên GDV</label>
                    <Input {...register("name")} placeholder="Nhập tên giao dịch viên" />
                    {errors.name && (
                        <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
                    )}
                </div>

                {/* Slug */}
                <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Slug URL</label>
                    <Input {...register("slug")} placeholder="vd: nguyen-van-a" />
                    {errors.slug && (
                        <p className="text-xs text-destructive mt-1">{errors.slug.message}</p>
                    )}
                </div>

                {/* Biệt danh */}
                <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Biệt danh</label>
                    <Input {...register("service")} placeholder="Nhập biệt danh" />
                </div>

                {/* Mã GDV */}
                <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Mã GDV</label>
                    <Input {...register("code")} placeholder="VD: GDV#001" />
                    {errors.code && (
                        <p className="text-xs text-destructive mt-1">{errors.code.message}</p>
                    )}
                </div>

                {/* ══ Role ═════════════════════════════════════════════════════ */}
                <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Vai trò</label>
                    <RoleCombobox
                        value={(watchedRole as RoleValue) ?? "gdv"}
                        onChange={(v) => setValue("role", v, { shouldDirty: true })}
                    />
                    {errors.role && (
                        <p className="text-xs text-destructive mt-1">{errors.role.message}</p>
                    )}
                </div>

                {/* Danh mục */}
                {categories.length > 0 && (
                    <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Danh mục</label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => toggleCat(c.id)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                        selectedCats.includes(c.id)
                                            ? "bg-primary/20 text-primary border-primary/40"
                                            : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                                    }`}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quỹ BH & Tỉ lệ thành công */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Quỹ bảo hiểm</label>
                        <Input {...register("insurance_fund")} type="number" placeholder="0" />
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground mb-1 block">% Thành công</label>
                        <Input {...register("success_rate")} type="number" placeholder="100" />
                    </div>
                </div>

                {/* Mô tả */}
                <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Mô tả</label>
                    <Input {...register("description")} placeholder="Nhập mô tả" />
                </div>

                {/* ══ Tài khoản ngân hàng ════════════════════════════════════ */}
                <div className="border-t border-border pt-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">Tài khoản ngân hàng</p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={loadingBanks}
                            onClick={() =>
                                append({ bank_name: "", account_number: "", account_holder: "" })
                            }
                            className="h-8 gap-1.5 text-xs"
                        >
                            <Plus size={13} />
                            Thêm tài khoản
                        </Button>
                    </div>

                    {fields.length === 0 && (
                        <div className="flex items-center justify-center py-8 border border-dashed border-border/40 rounded-2xl bg-muted/10">
                            <div className="text-center space-y-1">
                                <QrCode size={28} className="mx-auto text-muted-foreground/30" />
                                <p className="text-sm text-muted-foreground/50">
                                    Chưa có tài khoản ngân hàng
                                </p>
                            </div>
                        </div>
                    )}

                    {fields.map((field, index) => (
                        <BankRow
                            key={field.id}
                            index={index}
                            vietqrBanks={vietqrBanks}
                            control={control}
                            register={register}
                            setValue={setValue}
                            onRemove={() => remove(index)}
                            errors={
                                errors.banks?.[index] as Partial<
                                    Record<
                                        "bank_name" | "account_number" | "account_holder",
                                        { message?: string }
                                    >
                                >
                            }
                        />
                    ))}
                </div>

                {/* ══ Liên kết ══════════════════════════════════════════════ */}
                <div className="border-t border-border pt-5 space-y-4">
                    <p className="text-sm font-medium text-muted-foreground">Liên kết</p>

                    <div>
                        <label className="text-sm text-muted-foreground mb-1 block">
                            Facebook URL / UID
                        </label>
                        <div className="flex gap-2">
                            <Input {...register("facebook")} placeholder="https://facebook.com/username" />
                            <Button
                                type="button"
                                variant="outline"
                                disabled={gettingUid}
                                onClick={(e) => {
                                    const input =
                                        e.currentTarget.previousElementSibling as HTMLInputElement;
                                    if (input?.value) handleGetFacebookUID(input.value);
                                }}
                            >
                                {gettingUid ? "..." : "Lấy UID"}
                            </Button>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Zalo (SĐT)</label>
                        <Input {...register("zalo")} placeholder="Nhập số điện thoại Zalo" />
                    </div>

                    <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Website</label>
                        <Input {...register("website")} placeholder="Nhập địa chỉ website" />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push("/traders")}
                    >
                        Huỷ
                    </Button>
                    <Button type="submit" className="flex-1 btn-glow" disabled={submitting}>
                        {submitting && <Loader2 size={14} className="animate-spin mr-2" />}
                        {submitting ? "Đang lưu..." : "Cập nhật"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditTraderPage;
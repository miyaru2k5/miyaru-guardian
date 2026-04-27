"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ArrowLeft, Package, Hash, DollarSign, FileText,
    ImageIcon, Camera, Eye, EyeOff, Check, X, Loader2, Link2, Pencil,
    MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const R2_DOMAIN = process.env.NEXT_PUBLIC_R2_DOMAIN!;

// ─── Schema ───────────────────────────────────────────────────────────────────

const productSchema = z.object({
    service_name: z.string().min(1, "Bắt buộc").max(200),
    service_id: z.string().min(1, "Bắt buộc").max(100),
    balance: z.coerce.number().min(0, "Phải >= 0"),
    is_visible: z.boolean().default(true),
    describe: z.string().max(2000).optional(),
    image_url: z.string().max(500).optional(),
    phone: z.string().max(20).optional(),
});

type ProductForm = z.infer<typeof productSchema>;

// ─── R2 helpers ───────────────────────────────────────────────────────────────

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

// ─── Field / SectionTitle ─────────────────────────────────────────────────────

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

function SectionTitle({ icon, children }: {
    icon?: React.ReactNode; children: React.ReactNode;
}) {
    return (
        <div className="flex items-center gap-2 pb-2 border-b border-border mb-1">
            {icon && <span className="text-muted-foreground">{icon}</span>}
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                {children}
            </span>
        </div>
    );
}

// ─── ImagePicker ──────────────────────────────────────────────────────────────

function ImagePicker({ currentUrl, pendingFile, localPreview, onFileSelect }: {
    currentUrl?: string;
    pendingFile: File | null;
    localPreview: string;
    onFileSelect: (file: File, preview: string) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const displayUrl = localPreview || currentUrl || "";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        onFileSelect(file, URL.createObjectURL(file));
        e.target.value = "";
    };

    return (
        <div className="relative w-full">
            <div
                onClick={() => inputRef.current?.click()}
                className={cn(
                    "relative w-full h-[200px] rounded-2xl overflow-hidden border-2 flex items-center justify-center bg-muted/20 cursor-pointer transition-colors hover:border-primary/40",
                    displayUrl ? "border-border" : "border-dashed border-border/50"
                )}
            >
                {displayUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={displayUrl} alt="Product" className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground/30 pointer-events-none select-none">
                        <ImageIcon size={40} />
                        <span className="text-xs">Nhấn để chọn ảnh</span>
                    </div>
                )}
            </div>

            {pendingFile && (
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-400/90 text-[10px] font-semibold text-black rounded-md z-10">
                    Chưa lưu
                </span>
            )}

            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="absolute bottom-2.5 right-2.5 bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform z-10"
            >
                <Camera size={14} />
            </button>

            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params?.id as string;

    const [loadingProduct, setLoadingProduct] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageLocalPreview, setImageLocalPreview] = useState("");
    const [oldImageUrl, setOldImageUrl] = useState("");

    const {
        register, handleSubmit, watch, setValue, reset,
        formState: { errors },
    } = useForm<ProductForm>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            service_name: "",
            service_id: "",
            balance: 0,
            is_visible: true,
            describe: "",
            image_url: "",
            phone: "",
        },
    });

    const watchedVisible = watch("is_visible");
    const watchedImageUrl = watch("image_url");
    const watchedPhone = watch("phone");

    // ── Fetch product ─────────────────────────────────────────────────────────

    useEffect(() => {
        if (!productId) return;
        (async () => {
            setLoadingProduct(true);
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq("id", productId)
                .single();

            if (error || !data) {
                toast({ title: "Không tìm thấy dịch vụ", variant: "destructive" });
                router.push("/admin/products");
                return;
            }

            reset({
                service_name: data.service_name ?? "",
                service_id: data.service_id ?? "",
                balance: data.balance ?? 0,
                is_visible: data.is_visible ?? true,
                describe: data.describe ?? "",
                image_url: data.image_url ?? "",
                phone: data.phone ?? "",
            });

            setOldImageUrl(data.image_url ?? "");
            setLoadingProduct(false);
        })();
    }, [productId, reset, router]);

    // Cleanup blob URL on unmount
    useEffect(() => {
        return () => { if (imageLocalPreview) URL.revokeObjectURL(imageLocalPreview) };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleImageSelect = (file: File, preview: string) => {
        if (imageLocalPreview) URL.revokeObjectURL(imageLocalPreview);
        setImageFile(file);
        setImageLocalPreview(preview);
    };

    const onSubmit = async (data: ProductForm) => {
        setSubmitting(true);
        try {
            let finalImageUrl = data.image_url ?? "";

            if (imageFile) {
                const newUrl = await uploadToR2(imageFile);
                if (oldImageUrl && oldImageUrl.includes(R2_DOMAIN)) {
                    await deleteFromR2(oldImageUrl);
                }
                finalImageUrl = newUrl;
                setOldImageUrl(newUrl);
                setImageFile(null);
                setImageLocalPreview("");
            }

            const { error } = await supabase
                .from("products")
                .update({
                    service_name: data.service_name,
                    service_id: data.service_id,
                    balance: data.balance,
                    is_visible: data.is_visible,
                    describe: data.describe || "",
                    image_url: finalImageUrl || null,
                    phone: data.phone || null,
                })
                .eq("id", productId);

            if (error) throw error;

            toast({ title: "Đã cập nhật dịch vụ" });
            router.push("/admin/products");
        } catch (err: any) {
            toast({ title: "Lỗi cập nhật dịch vụ", description: err.message, variant: "destructive" });
            setSubmitting(false);
        }
    };

    // ── Loading ───────────────────────────────────────────────────────────────

    if (loadingProduct) {
        return (
            <div className="flex flex-col min-h-screen">
                <div className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-sm px-3 py-2.5">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => router.push("/admin/products")}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <Pencil size={14} className="text-muted-foreground" />
                        <span className="text-sm font-semibold">Chỉnh sửa dịch vụ</span>
                    </div>
                </div>
                <div className="flex items-center justify-center py-32">
                    <Loader2 size={32} className="animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col min-h-screen">

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1">
                <div className="p-2 sm:p-3 grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">

                    {/* ── Col 1: Ảnh + Hiển thị ── */}
                    <div className="space-y-3">
                        <div className="bg-card border border-border rounded-2xl p-3 space-y-3">
                            <SectionTitle icon={<ImageIcon size={13} />}>Ảnh dịch vụ</SectionTitle>

                            <ImagePicker
                                currentUrl={watchedImageUrl}
                                pendingFile={imageFile}
                                localPreview={imageLocalPreview}
                                onFileSelect={handleImageSelect}
                            />

                            <Field label="Hoặc nhập URL ảnh trực tiếp" error={errors.image_url?.message}>
                                <div className="relative">
                                    <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                    <Input
                                        {...register("image_url")}
                                        placeholder="https://..."
                                        className="pl-8 text-sm font-mono"
                                    />
                                </div>
                            </Field>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-3 space-y-2">
                            <SectionTitle icon={<Eye size={13} />}>Trạng thái hiển thị</SectionTitle>

                            <button
                                type="button"
                                onClick={() => setValue("is_visible", !watchedVisible, { shouldDirty: true })}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
                                    watchedVisible
                                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                                        : "border-border bg-muted/20 text-muted-foreground"
                                )}
                            >
                                {watchedVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium">
                                        {watchedVisible ? "Đang hiển thị" : "Đang bảo trì"}
                                    </p>
                                    <p className="text-xs opacity-60">
                                        {watchedVisible
                                            ? "dịch vụ sẽ hoạt động với người dùng"
                                            : "dịch vụ bị bảo trì, không hoạt động với người dùng"
                                        }
                                    </p>
                                </div>
                                <div className={cn(
                                    "w-9 h-5 rounded-full transition-colors relative shrink-0",
                                    watchedVisible ? "bg-emerald-500" : "bg-muted"
                                )}>
                                    <div className={cn(
                                        "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                                        watchedVisible ? "translate-x-4" : "translate-x-0.5"
                                    )} />
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* ── Col 2: Thông tin ── */}
                    <div className="bg-card border border-border rounded-2xl p-3 space-y-3">
                        <SectionTitle icon={<Package size={13} />}>Thông tin dịch vụ</SectionTitle>

                        <Field label="Tên dịch vụ" error={errors.service_name?.message}>
                            <div className="relative">
                                <Package size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                <Input {...register("service_name")} placeholder="Nhập tên dịch vụ / dịch vụ" className="pl-8" />
                            </div>
                        </Field>

                        <Field label="Mã dịch vụ (service_id)" error={errors.service_id?.message}>
                            <div className="relative">
                                <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                <Input {...register("service_id")} placeholder="VD: SVC001" className="pl-8 font-mono text-sm" />
                            </div>
                        </Field>

                        <Field label="Số dư / Giá (VNĐ)" error={errors.balance?.message}>
                            <div className="relative">
                                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                <Input {...register("balance")} type="number" min={0} placeholder="0" className="pl-8" />
                            </div>
                        </Field>

                        {/* ── Zalo Phone ── */}
                        <Field label="Số Zalo (tuỳ chọn)" error={errors.phone?.message}>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex items-center justify-center w-3.5 h-3.5 text-[#0068ff]">
                                    <MessageCircle size={14} className="absolute" />
                                    <span className="relative text-[7px] font-black leading-none mt-0.5">Z</span>
                                </span>
                                <Input
                                    {...register("phone")}
                                    type="tel"
                                    placeholder="VD: 0901234567"
                                    className="pl-8 font-mono text-sm"
                                />
                                {/* Live Zalo preview link */}
                                {watchedPhone && (
                                    <a
                                        href={`https://zalo.me/${watchedPhone.replace(/\D/g, "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#0068ff] hover:underline font-medium"
                                        title="Mở Zalo"
                                    >
                                        Mở Zalo ↗
                                    </a>
                                )}
                            </div>
                            <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                                Khách hàng có thể nhắn Zalo trực tiếp từ trang dịch vụ.
                            </p>
                        </Field>

                        <Field label="Mô tả" error={errors.describe?.message}>
                            <div className="relative">
                                <FileText size={14} className="absolute left-3 top-3 text-muted-foreground pointer-events-none" />
                                <textarea
                                    {...register("describe")}
                                    placeholder="Nhập mô tả dịch vụ..."
                                    rows={7}
                                    className={cn(
                                        "w-full pl-8 pr-3 py-2 rounded-xl border border-input bg-background text-sm",
                                        "resize-none outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50",
                                        "transition-colors hover:border-ring/50"
                                    )}
                                />
                            </div>
                        </Field>
                    </div>
                </div>

                {/* Sticky bottom bar */}
                <div className="sticky bottom-0 z-20 border-t border-border bg-background/90 backdrop-blur-sm px-3 py-2.5">
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            type="button" variant="outline" className="gap-2"
                            onClick={() => router.push("/admin/products")}
                            disabled={submitting}
                        >
                            <X size={14} /> Huỷ
                        </Button>
                        <Button type="submit" className="btn-glow gap-2 min-w-[160px]" disabled={submitting}>
                            {submitting
                                ? <><Loader2 size={14} className="animate-spin" /> Đang lưu...</>
                                : <><Check size={14} /> Cập nhật dịch vụ</>
                            }
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
    ArrowLeft, Loader2, QrCode, Copy, Check,
    ChevronDown, Building2, CreditCard, User, Eye, EyeOff,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const schema = z.object({
    bank_name: z.string().min(1, "Vui lòng chọn ngân hàng"),
    account_number: z.string().min(1, "Bắt buộc"),
    account_holder: z.string().min(1, "Bắt buộc"),
    is_visible: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

type VietQRBank = {
    bin: string;
    short_name: string;
    name: string;
    logo: string;
};

function CopyButton({ value, label }: { value: string; label: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        if (!value) return;
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            type="button"
            onClick={copy}
            disabled={!value}
            title={`Sao chép ${label}`}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150
        text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10
        disabled:opacity-30 disabled:cursor-not-allowed"
        >
            {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
        </button>
    );
}

function InfoRow({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground/60 font-medium">
                {label}
            </p>
            <div className="flex items-center gap-2 bg-muted/50 border border-border/40 px-3 py-2.5 rounded-xl min-h-[42px]">
                <p className={`flex-1 text-sm break-all ${mono ? "font-mono" : ""} ${!value ? "text-muted-foreground/40" : ""}`}>
                    {value || "—"}
                </p>
                <CopyButton value={value} label={label} />
            </div>
        </div>
    );
}

export default function AddBank() {
    const router = useRouter();
    const [banks, setBanks] = useState<VietQRBank[]>([]);
    const [loadingBanks, setLoadingBanks] = useState(true);
    const [selectedBank, setSelectedBank] = useState<VietQRBank | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [bankSearch, setBankSearch] = useState("");
    const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { isSubmitting, errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { is_visible: true },
    });

    const bankName = watch("bank_name");
    const accountNumber = watch("account_number")?.replace(/\s/g, "");
    const accountHolder = watch("account_holder");
    const isVisible = watch("is_visible") ?? true;
    const addInfo = userId ? `NapYue ${userId}` : "";
    const isFormComplete = !!(bankName && accountNumber && accountHolder);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setBankDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast({ title: "Chưa đăng nhập", variant: "destructive" });
                router.push("/login");
                return;
            }
            setUserId(user.id);
        };
        getUser().finally(() => setLoadingUser(false));
    }, [router]);

    useEffect(() => {
        fetch("https://api.vietqr.io/v2/banks")
            .then((r) => r.json())
            .then((data) => {
                if (data.code === "00") {
                    setBanks(data.data.sort((a: VietQRBank, b: VietQRBank) =>
                        a.short_name.localeCompare(b.short_name)
                    ));
                }
            })
            .catch(() => toast({ title: "Không tải được danh sách ngân hàng", variant: "destructive" }))
            .finally(() => setLoadingBanks(false));
    }, []);

    const filteredBanks = banks.filter((b) =>
        b.short_name.toLowerCase().includes(bankSearch.toLowerCase()) ||
        b.name.toLowerCase().includes(bankSearch.toLowerCase())
    );

    const selectBank = (bank: VietQRBank) => {
        setSelectedBank(bank);
        setValue("bank_name", bank.short_name);
        setBankSearch("");
        setBankDropdownOpen(false);
    };

    const onSubmit = async (data: FormData) => {
        const { error } = await supabase.from("bank_accounts").insert([{
            bank_name: data.bank_name,
            account_number: data.account_number,
            account_holder: data.account_holder,
            is_visible: data.is_visible,
        }]);

        if (error) {
            toast({ title: "Lỗi", description: error.message, variant: "destructive" });
            return;
        }
        toast({ title: "Đã thêm tài khoản ngân hàng" });
        router.push("/admin/banks");
    };

    const formatAccNum = (v: string) =>
        v.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();

    const qrLink =
        bankName && accountNumber && accountHolder && addInfo
            ? `https://img.vietqr.io/image/${encodeURIComponent(bankName)}-${accountNumber}-compact2.png?amount=0&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(accountHolder)}`
            : null;

    if (loadingUser) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="animate-spin text-muted-foreground" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 md:px-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-10">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="rounded-xl h-9 w-9 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft size={16} />
                </Button>
                <div>
                    <h1 className="text-xl font-semibold leading-tight">Thêm tài khoản ngân hàng</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Nhận thanh toán qua chuyển khoản</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ══════════════════════════════
            CỘT 1 — FORM NHẬP
        ══════════════════════════════ */}
                <div>
                    <div className="bg-card border rounded-2xl p-6 sticky top-6">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground/60 font-medium mb-5">
                            Thông tin tài khoản
                        </p>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            {/* Ngân hàng */}
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Ngân hàng</label>
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        type="button"
                                        disabled={loadingBanks}
                                        onClick={() => setBankDropdownOpen((v) => !v)}
                                        className="w-full flex items-center gap-3 h-11 px-3.5 rounded-xl border border-input bg-background text-sm
                      hover:border-ring/50 focus:outline-none focus:ring-1 focus:ring-ring
                      disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {selectedBank?.logo ? (
                                            <Image
                                                src={selectedBank.logo}
                                                alt={selectedBank.short_name}
                                                width={20}
                                                height={20}
                                                className="rounded object-contain"
                                                unoptimized
                                            />
                                        ) : (
                                            <Building2 size={16} className="text-muted-foreground" />
                                        )}
                                        <span className={`flex-1 text-left truncate ${!selectedBank ? "text-muted-foreground" : ""}`}>
                                            {loadingBanks
                                                ? "Đang tải..."
                                                : selectedBank
                                                    ? `${selectedBank.short_name} — ${selectedBank.name}`
                                                    : "Chọn ngân hàng"}
                                        </span>
                                        <ChevronDown
                                            size={15}
                                            className={`text-muted-foreground shrink-0 transition-transform duration-200 ${bankDropdownOpen ? "rotate-180" : ""}`}
                                        />
                                    </button>

                                    {bankDropdownOpen && (
                                        <div className="absolute z-50 mt-1.5 w-full bg-popover border rounded-xl shadow-lg overflow-hidden">
                                            <div className="p-2 border-b">
                                                <Input
                                                    autoFocus
                                                    placeholder="Tìm ngân hàng..."
                                                    value={bankSearch}
                                                    onChange={(e) => setBankSearch(e.target.value)}
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                            <div className="max-h-56 overflow-y-auto">
                                                {filteredBanks.length === 0 ? (
                                                    <p className="text-sm text-muted-foreground text-center py-4">Không tìm thấy</p>
                                                ) : (
                                                    filteredBanks.map((b) => (
                                                        <button
                                                            key={b.bin}
                                                            type="button"
                                                            onClick={() => selectBank(b)}
                                                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted text-left transition-colors
                                ${bankName === b.short_name ? "bg-muted/70 font-medium" : ""}`}
                                                        >
                                                            {b.logo && (
                                                                <Image
                                                                    src={b.logo}
                                                                    alt={b.short_name}
                                                                    width={20}
                                                                    height={20}
                                                                    className="rounded object-contain shrink-0"
                                                                    unoptimized
                                                                />
                                                            )}
                                                            <span className="font-medium shrink-0">{b.short_name}</span>
                                                            <span className="text-muted-foreground truncate">{b.name}</span>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {errors.bank_name && (
                                    <p className="text-xs text-destructive mt-1">{errors.bank_name.message}</p>
                                )}
                            </div>

                            {/* Số tài khoản */}
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Số tài khoản</label>
                                <div className="relative">
                                    <CreditCard
                                        size={15}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                                    />
                                    <Input
                                        {...register("account_number")}
                                        placeholder="Nhập số tài khoản"
                                        className="pl-9 font-mono tracking-wider"
                                        onChange={(e) => {
                                            const formatted = formatAccNum(e.target.value);
                                            e.target.value = formatted;
                                            setValue("account_number", formatted);
                                        }}
                                        maxLength={19}
                                    />
                                </div>
                                {errors.account_number && (
                                    <p className="text-xs text-destructive mt-1">{errors.account_number.message}</p>
                                )}
                            </div>

                            {/* Chủ tài khoản */}
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Chủ tài khoản</label>
                                <div className="relative">
                                    <User
                                        size={15}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                                    />
                                    <Input
                                        {...register("account_holder")}
                                        placeholder="Nhập chủ tài khoản"
                                        className="pl-9 uppercase tracking-wide"
                                        onChange={(e) => {
                                            e.target.value = e.target.value.toUpperCase();
                                            setValue("account_holder", e.target.value);
                                        }}
                                    />
                                </div>
                                {errors.account_holder && (
                                    <p className="text-xs text-destructive mt-1">{errors.account_holder.message}</p>
                                )}
                            </div>

                            {/* is_visible toggle */}
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Hiển thị tài khoản</label>
                                <button
                                    type="button"
                                    onClick={() => setValue("is_visible", !isVisible)}
                                    className={`w-full flex items-center justify-between h-11 px-3.5 rounded-xl border text-sm transition-colors
                    ${isVisible
                                            ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
                                            : "border-input bg-background text-muted-foreground"
                                        }`}
                                >
                                    <span className="flex items-center gap-2.5">
                                        {isVisible
                                            ? <Eye size={15} />
                                            : <EyeOff size={15} />
                                        }
                                        {isVisible ? "Đang hiển thị với khách hàng" : "Đang ẩn khỏi khách hàng"}
                                    </span>
                                    {/* Toggle pill */}
                                    <div className={`relative w-9 h-5 rounded-full transition-colors ${isVisible ? "bg-emerald-500" : "bg-muted-foreground/30"}`}>
                                        <span
                                            className={`absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
    ${isVisible ? "translate-x-0" : "-translate-x-4"}`}
                                        />
                                    </div>
                                </button>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11"
                                disabled={isSubmitting}
                            >
                                {isSubmitting && <Loader2 size={15} className="animate-spin mr-2" />}
                                {isSubmitting ? "Đang lưu..." : "Lưu tài khoản"}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* ══════════════════════════════
            CỘT 2 — XEM TRƯỚC
        ══════════════════════════════ */}
                <div>
                    <div className="bg-card border rounded-2xl p-6 h-full">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground/60 font-medium mb-5">
                            Thông tin xem trước
                        </p>

                        {/* Bank badge */}
                        {selectedBank ? (
                            <div className="flex items-center gap-2.5 mb-5 p-3 bg-muted/40 border border-border/40 rounded-xl">
                                {selectedBank.logo && (
                                    <Image
                                        src={selectedBank.logo}
                                        alt={selectedBank.short_name}
                                        width={28}
                                        height={28}
                                        className="rounded-md object-contain"
                                        unoptimized
                                    />
                                )}
                                <div>
                                    <p className="font-semibold text-sm leading-tight">{selectedBank.short_name}</p>
                                    <p className="text-xs text-muted-foreground">{selectedBank.name}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2.5 mb-5 p-3 bg-muted/20 border border-dashed border-border/40 rounded-xl">
                                <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center">
                                    <Building2 size={14} className="text-muted-foreground/40" />
                                </div>
                                <p className="text-sm text-muted-foreground/50">Chưa chọn ngân hàng</p>
                            </div>
                        )}

                        <div className="space-y-3">
                            <InfoRow label="Số tài khoản" value={accountNumber || ""} mono />
                            <InfoRow label="Chủ tài khoản" value={accountHolder || ""} />
                            <InfoRow label="Nội dung chuyển khoản" value={addInfo} mono />
                        </div>

                        {/* Visibility badge */}
                        <div className={`mt-5 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors
              ${isVisible
                                ? "bg-emerald-500/8 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-muted/40 text-muted-foreground border border-border/40"
                            }`}
                        >
                            {isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
                            {isVisible ? "Hiển thị với khách hàng" : "Đang ẩn khỏi khách hàng"}
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════
            CỘT 3 — QR CODE
        ══════════════════════════════ */}
                <div>
                    <div className="bg-card border rounded-2xl p-6 h-full flex flex-col">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground/60 font-medium mb-5 flex items-center gap-2">
                            <QrCode size={13} /> Mã QR VietQR
                        </p>

                        <div className={`flex-1 rounded-xl border transition-all duration-300 overflow-hidden
              ${isFormComplete ? "border-border/50 bg-white" : "border-dashed border-border/30 bg-muted/20"}`}
                        >
                            {qrLink ? (
                                <div className="flex items-center justify-center p-6 h-full">
                                    <Image
                                        src={qrLink}
                                        alt="VietQR"
                                        width={280}
                                        height={280}
                                        className="rounded-xl w-full max-w-[280px]"
                                        unoptimized
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full py-16 gap-3">
                                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                                        <QrCode size={28} className="text-muted-foreground/40" />
                                    </div>
                                    <p className="text-sm text-muted-foreground text-center max-w-[180px]">
                                        Điền đầy đủ thông tin để tạo mã QR
                                    </p>
                                </div>
                            )}
                        </div>

                        {isFormComplete && (
                            <p className="text-xs text-muted-foreground text-center mt-3">
                                Khách hàng quét mã này để chuyển khoản
                            </p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
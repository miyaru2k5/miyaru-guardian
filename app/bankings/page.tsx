"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import MainLayout from "@/layouts/MainLayout";
import Image from "next/image";
import {
    Landmark,
    Copy,
    CheckCircle2,
    QrCode,
    ArrowLeft,
    Download,
    AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";

type BankAccount = {
    id: string;
    bank_name: string;        // short_name ví dụ: VCB, BIDV, TCB...
    account_number: string;
    account_holder: string;
    is_visible: boolean;
};

type VietQRBank = {
    shortName: string;
    name: string;
    logo: string;
};

export default function BankingsPage() {
    const router = useRouter();

    const [banks, setBanks] = useState<BankAccount[]>([]);
    const [vietqrBanks, setVietqrBanks] = useState<VietQRBank[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    // Lấy userId
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        getUser();
    }, []);

    // Lấy danh sách tài khoản ngân hàng (chỉ visible)
    const fetchVisibleBanks = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("bank_accounts")
            .select("*")
            .eq("is_visible", true)
            .order("created_at", { ascending: false });

        if (error) {
            toast({ title: "Lỗi tải dữ liệu", description: error.message, variant: "destructive" });
        } else {
            setBanks(data || []);
            if (data && data.length > 0 && !selectedBank) {
                setSelectedBank(data[0]); // tự động chọn ngân hàng đầu tiên
            }
        }
        setLoading(false);
    };

    // Lấy danh sách ngân hàng VietQR để lấy logo
    const fetchVietQRBanks = async () => {
        try {
            const res = await fetch("https://api.vietqr.io/v2/banks");
            const json = await res.json();
            if (json.code === "00") {
                setVietqrBanks(json.data);
            }
        } catch (err) {
            console.error("Lỗi tải danh sách ngân hàng VietQR", err);
        }
    };

    useEffect(() => {
        fetchVisibleBanks();
        fetchVietQRBanks();
    }, []);

    const getBankInfo = (shortName: string) =>
        vietqrBanks.find((b) => b.shortName.toLowerCase() === shortName.toLowerCase()) || null;

    const selectedBankInfo = selectedBank ? getBankInfo(selectedBank.bank_name) : null;

    const contentTransfer = userId ? `NapYue ${userId}` : "NapYue ";

    // Tạo link QR VietQR
    const qrLink = useMemo(() => {
        if (!selectedBank) return null;
        return `https://img.vietqr.io/image/${encodeURIComponent(
            selectedBank.bank_name
        )}-${encodeURIComponent(selectedBank.account_number)}-compact2.png?amount=0&addInfo=${encodeURIComponent(
            contentTransfer
        )}&accountName=${encodeURIComponent(selectedBank.account_holder)}`;
    }, [selectedBank, contentTransfer]);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        toast({ title: `Đã sao chép ${label}` });
        setTimeout(() => setCopied(null), 2000);
    };

    const handleDownloadQR = () => {
        if (!qrLink) return;

        const link = document.createElement("a");
        link.href = `/api/download-qr?url=${encodeURIComponent(qrLink)}`;
        link.download = "vietqr.png";
        link.click();
    };

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto py-8 px-4 md:px-6">
                {/* Header */}
                <div className="flex items-center gap-3 mt-10 sm:mt-12 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        Nạp tiền ngay
                    </h1>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* ==================== CỘT 1: DANH SÁCH NGÂN HÀNG ==================== */}
                    <div className="lg:col-span-4">
                        <Card className="p-6 h-full">
                            <div className="flex items-center gap-2 mb-5">
                                <Landmark size={20} className="text-primary" />
                                <h2 className="font-semibold text-lg">Ngân hàng hỗ trợ</h2>
                            </div>

                            {loading ? (
                                <div className="space-y-3">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
                                    ))}
                                </div>
                            ) : banks.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    Hiện chưa có tài khoản ngân hàng nào được kích hoạt.
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[620px] overflow-y-auto pr-2">
                                    {banks.map((bank) => {
                                        const info = getBankInfo(bank.bank_name);
                                        const isSelected = selectedBank?.id === bank.id;

                                        return (
                                            <div
                                                key={bank.id}
                                                onClick={() => setSelectedBank(bank)}
                                                className={`p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-md flex gap-4 items-center
                        ${isSelected
                                                        ? "border-primary bg-primary/5 shadow-sm"
                                                        : "border-border hover:border-primary/30"
                                                    }`}
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-white border p-1.5 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                                    {info?.logo ? (
                                                        <Image
                                                            src={info.logo}
                                                            alt={info.shortName}
                                                            width={48}
                                                            height={48}
                                                            className="object-contain"
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <Landmark size={28} className="text-muted-foreground" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold">{bank.bank_name}</p>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {info?.name || "Ngân hàng"}
                                                    </p>
                                                </div>

                                                {isSelected && <CheckCircle2 className="text-primary" size={20} />}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* ==================== CỘT 2: THÔNG TIN CHUYỂN KHOẢN ==================== */}
                    <div className="lg:col-span-4">
                        <Card className="p-6 h-full">
                            <div className="flex items-center gap-2 mb-6">
                                <h2 className="font-semibold text-lg">Thông tin chuyển khoản</h2>
                            </div>

                            {!selectedBank ? (
                                <div className="flex flex-col items-center justify-center h-80 text-center text-muted-foreground">
                                    <Landmark size={48} className="mb-4 opacity-40" />
                                    <p>Vui lòng chọn ngân hàng bên trái</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Ngân hàng</p>
                                        <div className="flex items-center gap-3 bg-muted/50 p-4 rounded-2xl">
                                            {selectedBankInfo?.logo && (
                                                <Image
                                                    src={selectedBankInfo.logo}
                                                    alt={selectedBank.bank_name}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-lg"
                                                    unoptimized
                                                />
                                            )}
                                            <div>
                                                <p className="font-semibold">{selectedBank.bank_name}</p>
                                                <p className="text-sm text-muted-foreground">{selectedBankInfo?.name}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Số tài khoản */}
                                    <div>
                                        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Số tài khoản</p>
                                        <div className="flex items-center justify-between bg-muted/50 border border-border px-4 py-4 rounded-2xl">
                                            <p className="font-mono text-lg tracking-wider">{selectedBank.account_number}</p>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => copyToClipboard(selectedBank.account_number, "số tài khoản")}
                                            >
                                                {copied === "số tài khoản" ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Chủ tài khoản */}
                                    <div>
                                        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Chủ tài khoản</p>
                                        <div className="flex items-center justify-between bg-muted/50 border border-border px-4 py-4 rounded-2xl">
                                            <p className="font-semibold uppercase tracking-wide">{selectedBank.account_holder}</p>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => copyToClipboard(selectedBank.account_holder, "tên chủ tài khoản")}
                                            >
                                                {copied === "tên chủ tài khoản" ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Nội dung chuyển khoản */}
                                    <div>
                                        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Nội dung chuyển khoản (bắt buộc)</p>
                                        <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 px-4 py-4 rounded-2xl">
                                            <p className="font-mono text-lg font-medium text-emerald-700 dark:text-emerald-400">
                                                {contentTransfer}
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => copyToClipboard(contentTransfer, "nội dung chuyển khoản")}
                                            >
                                                {copied === "nội dung chuyển khoản" ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
                                            </Button>
                                        </div>
<div className="flex items-center gap-2 mt-2 text-destructive font-semibold text-base">
  <AlertTriangle className="w-5 h-5" />
  <span>Nạp tiền tối thiểu 2.000 đ</span>
</div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* ==================== CỘT 3: MÃ QR ==================== */}
                    <div className="lg:col-span-4">
                        <Card className="p-6 h-full flex flex-col">

                            <div className="flex items-center gap-2 mb-6">
                                <QrCode size={20} className="text-primary" />
                                <h2 className="font-semibold text-lg">Quét mã QR để chuyển khoản</h2>
                            </div>

                            <div className="flex-1 flex items-center justify-center bg-white border rounded-3xl p-8 min-h-[380px]">
                                {qrLink ? (
                                    <div className="text-center">

                                        <Image
                                            src={qrLink}
                                            alt="VietQR Code"
                                            width={300}
                                            height={300}
                                            className="mx-auto rounded-2xl shadow-sm"
                                            unoptimized
                                        />

                                        {/* BUTTON TẢI QR */}
                                        <div className="mt-5 flex justify-center">
                                            <Button onClick={handleDownloadQR} className="gap-2">
                                                <Download className="w-4 h-4" />
                                                Tải QR Ngay
                                            </Button>
                                        </div>

                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground">
                                        <QrCode size={80} className="mx-auto mb-4 opacity-30" />
                                        <p>Chọn ngân hàng để tạo mã QR</p>
                                    </div>
                                )}
                            </div>

                            {selectedBank && (
                                <p className="text-center text-xs text-muted-foreground mt-4">
                                    Số tiền sẽ được cộng sau khi nhận chuyển khoản
                                </p>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
"use client";

import { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Copy, Plus, Trash2, Clock, KeyRound } from "lucide-react";

// ==================== TOTP ====================
function base32ToBytes(base32: string): Uint8Array {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    const cleaned = base32.replace(/=+$/g, "").replace(/\s+/g, "").toUpperCase();
    let bits = "";

    for (let ch of cleaned) {
        const idx = alphabet.indexOf(ch);
        if (idx === -1) continue;
        bits += idx.toString(2).padStart(5, "0");
    }

    const bytes = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        bytes.push(parseInt(bits.substring(i, i + 8), 2));
    }

    return new Uint8Array(bytes);
}

async function generateTOTP(secretBase32: string): Promise<string> {
    try {
        const keyBytes = base32ToBytes(secretBase32);
        const counter = Math.floor(Date.now() / 1000 / 30);

        const buf = new ArrayBuffer(8);
        const view = new DataView(buf);
        view.setUint32(4, counter);

        const cryptoKey = await crypto.subtle.importKey(
            "raw",
            keyBytes,
            { name: "HMAC", hash: "SHA-1" },
            false,
            ["sign"]
        );

        const sig = await crypto.subtle.sign("HMAC", cryptoKey, buf);
        const hmac = new Uint8Array(sig);
        const offset = hmac[hmac.length - 1] & 0xf;

        const code =
            ((hmac[offset] & 0x7f) << 24) |
            ((hmac[offset + 1] & 0xff) << 16) |
            ((hmac[offset + 2] & 0xff) << 8) |
            (hmac[offset + 3] & 0xff);

        return (code % 1000000).toString().padStart(6, "0");
    } catch {
        return "000000";
    }
}

interface Account {
    id: string;
    issuer: string;
    secret: string;
}

export default function Get2FAPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [currentCode, setCurrentCode] = useState("000000");
    const [countdown, setCountdown] = useState(30);

    const [issuer, setIssuer] = useState("");
    const [secrets, setSecrets] = useState<string[]>([""]);

    // Load
    useEffect(() => {
        const saved = localStorage.getItem("twofa_accounts_v5");
        if (saved) {
            const data = JSON.parse(saved);
            setAccounts(data);
            if (data.length) setSelectedId(data[0].id);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("twofa_accounts_v5", JSON.stringify(accounts));
    }, [accounts]);

    // OTP update
    useEffect(() => {
        if (!selectedId) return;

        const interval = setInterval(async () => {
            const acc = accounts.find((a) => a.id === selectedId);
            if (acc) {
                setCurrentCode(await generateTOTP(acc.secret));
                setCountdown(30 - (Math.floor(Date.now() / 1000) % 30));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [selectedId, accounts]);

    const selectedAccount = accounts.find((a) => a.id === selectedId);

    // Add row
    const addRow = () => setSecrets([...secrets, ""]);

    const removeRow = (index: number) =>
        setSecrets(secrets.filter((_, i) => i !== index));

    const updateSecret = (value: string, index: number) => {
        const newList = [...secrets];
        newList[index] = value;
        setSecrets(newList);
    };

    const addAccounts = () => {
        if (!issuer) {
            toast({ title: "Nhập tên dịch vụ", variant: "destructive" });
            return;
        }

        const valid = secrets.filter((s) => s.trim());

        if (!valid.length) {
            toast({ title: "Chưa nhập Secret Key", variant: "destructive" });
            return;
        }

        const newAccs = valid.map((s) => ({
            id: crypto.randomUUID(),
            issuer,
            secret: s.toUpperCase().replace(/\s/g, ""),
        }));

        setAccounts([...accounts, ...newAccs]);
        setSelectedId(newAccs[0].id);

        setIssuer("");
        setSecrets([""]);

        toast({ title: `Đã thêm ${newAccs.length} key` });
    };

    const deleteAccount = (id: string) => {
        setAccounts(accounts.filter((a) => a.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    const copy = async (text: string) => {
        await navigator.clipboard.writeText(text);
        toast({ title: "Đã copy" });
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-background text-foreground py-6 px-4 mt-16">
                <div className="max-w-3xl mx-auto">

                    {/* SEO */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">
                            Tool lấy mã 2FA (TOTP) miễn phí
                        </h1>
                        <p className="text-muted-foreground text-sm mt-2">
                            Tạo mã OTP từ Secret Key giống Google Authenticator, hỗ trợ nhiều tài khoản.
                        </p>
                    </div>

                    {/* FORM */}
                    <Card className="mb-6">
                        <CardHeader className="flex-row justify-between items-center">
                            <CardTitle>Nhập Secret Key</CardTitle>
                            <Button
                                variant="outline"
                                onClick={addRow}
                                className="flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Thêm
                            </Button>

                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tên dịch vụ</label>
                                <Input
                                    value={issuer}
                                    onChange={(e) => setIssuer(e.target.value)}
                                    placeholder="Google, Facebook..."
                                />
                            </div>

                            {secrets.map((sec, index) => (
                                <div key={index} className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Secret Key #{index + 1}
                                    </label>

                                    <div className="flex gap-2">
                                        <Input
                                            value={sec}
                                            onChange={(e) => updateSecret(e.target.value, index)}
                                            className="font-mono"
                                            placeholder="Nhập secret key"
                                        />

                                        {secrets.length > 1 && (
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                onClick={() => removeRow(index)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <Button onClick={addAccounts} className="w-full h-12">
                                <KeyRound size={18} className="mr-2" />
                                Lấy OTP
                            </Button>
                        </CardContent>
                    </Card>

                    {/* LIST */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Danh sách ({accounts.length})</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-2">
                            {!accounts.length && (
                                <p className="text-sm text-muted-foreground">
                                    Chưa có tài khoản nào
                                </p>
                            )}

                            {accounts.map((acc) => (
                                <div
                                    key={acc.id}
                                    className={`p-3 border rounded-xl flex justify-between items-center ${selectedId === acc.id
                                        ? "border-primary bg-primary/10"
                                        : "hover:bg-muted"
                                        }`}
                                >
                                    <div
                                        onClick={() => setSelectedId(acc.id)}
                                        className="flex-1 min-w-0 cursor-pointer"
                                    >
                                        <div className="font-medium truncate">
                                            {acc.issuer}
                                        </div>

                                        <div className="text-xs text-muted-foreground truncate">
                                            {acc.secret.slice(0, 6)}...{acc.secret.slice(-4)}
                                        </div>
                                    </div>


                                    <div className="flex gap-2">
                                        <Button size="icon" onClick={() => copy(acc.secret)}>
                                            <Copy size={14} />
                                        </Button>

                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            onClick={() => deleteAccount(acc.id)}
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* OTP */}
                    {selectedAccount && (
                        <Card>
                            <CardHeader className="flex-row justify-between items-center">
                                <CardTitle>{selectedAccount.issuer}</CardTitle>

                                <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
                                    <Clock size={16} />
                                    {countdown}s
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all"
                                        style={{ width: `${(countdown / 30) * 100}%` }}
                                    />
                                </div>

                                <div className="bg-muted p-8 rounded-2xl text-center">
                                    <div className="text-5xl font-mono tracking-widest">
                                        {currentCode}
                                    </div>
                                </div>

                                <Button
                                    onClick={() => copy(currentCode)}
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Copy size={16} className="mr-2" />
                                    Copy OTP
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* SEO dưới */}
                    <div className="mt-12">
                        <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">

                            <div>
                                <h2 className="text-base font-semibold text-foreground mb-2">
                                    🔐 2FA là gì?
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    2FA là lớp bảo mật thứ hai giúp bảo vệ tài khoản bằng mã OTP thay đổi mỗi 30 giây.
                                </p>
                            </div>

                            <div className="h-px bg-border" />

                            <div>
                                <h2 className="text-base font-semibold text-foreground mb-2">
                                    🛡️ Có an toàn không?
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Dữ liệu xử lý trực tiếp trên trình duyệt, không lưu server.
                                </p>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </MainLayout>
    );
}

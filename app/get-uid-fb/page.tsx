"use client";

import { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { getFbUid } from "@/lib/getFbUid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Copy, RefreshCw, Plus, Trash2, UserSearch } from "lucide-react";

export default function GetFacebookUIDPage() {
    const [urls, setUrls] = useState<string[]>([""]);
    const [results, setResults] = useState<
        { url: string; uid: string; error?: string }[]
    >([]);
    const [loading, setLoading] = useState(false);

    const addInput = () => setUrls([...urls, ""]);

    const updateUrl = (index: number, value: string) => {
        const newUrls = [...urls];
        newUrls[index] = value;
        setUrls(newUrls);
    };

    const removeInput = (index: number) => {
        if (urls.length === 1) return;
        setUrls(urls.filter((_, i) => i !== index));
    };

    const handleGetUID = async () => {
        const validUrls = urls.filter((url) => url.trim());

        if (!validUrls.length) {
            toast({
                title: "Lỗi",
                description: "Nhập ít nhất 1 link Facebook",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        setResults([]);

        const newResults = [];

        for (const url of validUrls) {
            try {
                const uid = await getFbUid(url.trim());
                newResults.push({ url, uid });
            } catch (err: any) {
                newResults.push({
                    url,
                    uid: "",
                    error: err.message || "Không lấy được UID",
                });
            }
        }

        setResults(newResults);
        setLoading(false);

        toast({
            title: "Hoàn thành",
            description: `Thành công ${newResults.filter((r) => !r.error).length
                }/${validUrls.length}`,
        });
    };

    const copyUID = (uid: string) => {
        navigator.clipboard.writeText(uid);
        toast({ title: "Đã copy UID" });
    };

    const resetAll = () => {
        setUrls([""]);
        setResults([]);
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-background text-foreground py-12 px-4 mt-10">
                <div className="max-w-2xl mx-auto space-y-6">

                    {/* SEO HEADER */}
                    <div className="text-center space-y-3">
                        <h1 className="text-3xl font-bold">
                            Lấy UID Facebook Online Miễn Phí
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Công cụ chuyển link Facebook sang UID nhanh chóng, hỗ trợ nhiều link cùng lúc.
                        </p>
                    </div>

                    {/* TOOL */}
                    <Card className="shadow-lg">
                        <CardHeader className="text-center pb-6">
                            <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                                <UserSearch className="w-7 h-7 text-primary" />
                            </div>
                            <CardTitle className="text-xl">Nhập Link Facebook</CardTitle>
                            <CardDescription>
                                Hỗ trợ profile, page, group
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">

                            {/* INPUT LIST */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm text-muted-foreground">
                                        Danh sách link
                                    </label>

                                    <Button
                                        variant="outline"
                                        onClick={addInput}
                                        className="flex items-center gap-2"
                                    >
                                        <Plus size={16} />
                                        Thêm
                                    </Button>

                                </div>

                                {urls.map((url, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            placeholder="Nhập Link Facebook"
                                            value={url}
                                            onChange={(e) =>
                                                updateUrl(index, e.target.value)
                                            }
                                        />

                                        {urls.length > 1 && (
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                onClick={() => removeInput(index)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* ACTION */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleGetUID}
                                    disabled={loading}
                                    className="flex-1"
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCw className="mr-2 animate-spin" size={16} />
                                            Đang xử lý
                                        </>
                                    ) : (
                                        "Lấy UID"
                                    )}
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={resetAll}
                                    disabled={loading}
                                >
                                    Reset
                                </Button>
                            </div>

                            {/* RESULTS */}
                            {results.length > 0 && (
                                <div className="space-y-4 pt-6">
                                    <h2 className="font-semibold text-lg flex items-center gap-2">
                                        <UserSearch size={18} />
                                        Kết quả
                                    </h2>

                                    {results.map((r, i) => (
                                        <div
                                            key={i}
                                            className={`p-4 rounded-xl border ${r.error
                                                    ? "bg-destructive/10 border-destructive/20"
                                                    : "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900"
                                                }`}
                                        >
                                            <p className="text-xs text-muted-foreground break-all mb-2">
                                                {r.url}
                                            </p>

                                            {r.error ? (
                                                <p className="text-destructive">{r.error}</p>
                                            ) : (
                                                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                                    <span className="font-mono text-xl sm:text-2xl text-green-700 dark:text-green-400 break-all">
                                                        {r.uid}
                                                    </span>

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => copyUID(r.uid)}
                                                    >
                                                        <Copy size={14} className="mr-1" />
                                                        Copy
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* SEO CONTENT */}
                    <div className="bg-card border rounded-xl p-6 space-y-4">
                        <h2 className="font-semibold text-lg">
                            Facebook UID là gì?
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            UID là mã định danh duy nhất của mỗi tài khoản Facebook.
                            Dùng để kiểm tra thông tin, chạy quảng cáo hoặc phân tích dữ liệu.
                        </p>

                        <h2 className="font-semibold text-lg">
                            Công cụ này có an toàn không?
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Công cụ chỉ xử lý link công khai, không yêu cầu đăng nhập
                            nên hoàn toàn an toàn.
                        </p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

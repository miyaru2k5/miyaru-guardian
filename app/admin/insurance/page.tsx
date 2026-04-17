"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  ShieldCheck,
  AlertTriangle,
  ImageIcon,
  Trash2,
} from "lucide-react";

const Insurance = () => {
  const [fund, setFund] = useState<any>(null);

  // ===== QUỸ =====
  const [totalFund, setTotalFund] = useState(0);
  const [insured, setInsured] = useState(0);
  const [safePercent, setSafePercent] = useState(80);

  // ===== BANNER =====
  const [banner1, setBanner1] = useState("");
  const [banner2, setBanner2] = useState("");
  const [linkBanner1, setLinkBanner1] = useState("");
  const [linkBanner2, setLinkBanner2] = useState("");

  const [fileBanner1, setFileBanner1] = useState<File | null>(null);
  const [fileBanner2, setFileBanner2] = useState<File | null>(null);

  const [previewBanner1, setPreviewBanner1] = useState("");
  const [previewBanner2, setPreviewBanner2] = useState("");

  // ================= FETCH =================
  const fetchFund = async () => {
    const { data } = await supabase
      .from("insurance_fund")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (data) {
      setFund(data);
      setTotalFund(data.total_fund || 0);
      setInsured(data.currently_insured || 0);
      setSafePercent(Number(data.safe_trade_percentage ?? 80));

      setBanner1(data.banner1 || "");
      setBanner2(data.banner2 || "");
      setLinkBanner1(data.link_banner1 || "");
      setLinkBanner2(data.link_banner2 || "");
    }
  };

  useEffect(() => {
    fetchFund();
  }, []);

  // ================= UPLOAD =================
  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    return data.url;
  };

  // ================= DELETE FILE =================
  const deleteFile = async (url: string) => {
    try {
      await fetch("/api/upload/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  // ================= HANDLE FILE =================
  const handleBanner1 = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileBanner1(file);
    setPreviewBanner1(URL.createObjectURL(file));
  };

  const handleBanner2 = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileBanner2(file);
    setPreviewBanner2(URL.createObjectURL(file));
  };

  // ================= REMOVE BANNER =================
  const removeBanner1 = async () => {
    if (banner1.includes("r2")) {
      await deleteFile(banner1);
    }
    setBanner1("");
    setPreviewBanner1("");
    setFileBanner1(null);
  };

  const removeBanner2 = async () => {
    if (banner2.includes("r2")) {
      await deleteFile(banner2);
    }
    setBanner2("");
    setPreviewBanner2("");
    setFileBanner2(null);
  };

  // ================= SAVE FUND =================
  const saveFund = async () => {
    const payload = {
      total_fund: totalFund,
      currently_insured: insured,
      safe_trade_percentage: safePercent,
    };

    if (fund) {
      await supabase
        .from("insurance_fund")
        .update(payload)
        .eq("id", fund.id);
    } else {
      await supabase.from("insurance_fund").insert(payload);
    }

    toast({ title: "Đã cập nhật quỹ bảo hiểm" });
    fetchFund();
  };

  // ================= SAVE BANNER =================
  const saveBanner = async () => {
    try {
      let finalBanner1 = banner1;
      let finalBanner2 = banner2;

      if (fileBanner1) {
        finalBanner1 = await uploadFile(fileBanner1);
      }

      if (fileBanner2) {
        finalBanner2 = await uploadFile(fileBanner2);
      }

      const payload = {
        banner1: finalBanner1,
        banner2: finalBanner2,
        link_banner1: linkBanner1,
        link_banner2: linkBanner2,
      };

      if (fund) {
        await supabase
          .from("insurance_fund")
          .update(payload)
          .eq("id", fund.id);
      }

      toast({ title: "Đã lưu banner" });
      fetchFund();
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // ================= CALC =================
  const percentage =
    totalFund > 0 ? (insured / totalFund) * 100 : 0;

  const isWarning = percentage > safePercent;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Quỹ bảo hiểm</h1>
        <p className="text-muted-foreground text-sm">
          Quản lý quỹ bảo hiểm và banner hệ thống
        </p>
      </div>

      {/* ===== QUỸ ===== */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="glow-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <div>
              <h2 className="font-bold">Tổng quan quỹ</h2>
              <p className="text-sm text-muted-foreground">
                Giao dịch ≤ {safePercent}% là an toàn
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 border rounded-xl">
              <p className="text-sm text-muted-foreground">Tổng quỹ</p>
              <p className="text-xl font-bold text-primary">
                {totalFund.toLocaleString("vi-VN")}đ
              </p>
            </div>

            <div className="p-4 border rounded-xl">
              <p className="text-sm text-muted-foreground">Đang bảo chứng</p>
              <p className="text-xl font-bold">
                {insured.toLocaleString("vi-VN")}đ
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Tỷ lệ sử dụng</span>
              <span className={isWarning ? "text-red-500" : ""}>
                {percentage.toFixed(1)}%
              </span>
            </div>

            <Progress value={percentage} className="h-3" />
          </div>

          {isWarning && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-500">
                Vượt ngưỡng an toàn!
              </span>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="glow-border rounded-2xl p-6 space-y-4">
          <h3 className="font-bold">Chỉnh sửa quỹ</h3>

          <Input
            type="number"
            value={totalFund}
            onChange={(e) => setTotalFund(Number(e.target.value))}
            placeholder="Tổng quỹ"
          />

          <Input
            type="number"
            value={insured}
            onChange={(e) => setInsured(Number(e.target.value))}
            placeholder="Đang bảo chứng"
          />

          <Input
            type="number"
            value={safePercent}
            onChange={(e) => setSafePercent(Number(e.target.value))}
            placeholder="% an toàn"
          />

          <Button onClick={saveFund} className="w-full">
            Lưu quỹ bảo hiểm
          </Button>
        </div>
      </div>

      {/* ===== BANNER ===== */}
      <div className="glow-border rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-6">Quản lý Banner</h3>

        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map((i) => {
            const banner = i === 1 ? banner1 : banner2;
            const preview = i === 1 ? previewBanner1 : previewBanner2;
            const link = i === 1 ? linkBanner1 : linkBanner2;

            return (
              <div key={i} className="space-y-3 border rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  <p className="font-medium">Banner {i}</p>
                </div>

                {(preview || banner) && (
                  <img
                    src={preview || banner}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}

                <Input
                  type="file"
                  accept="image/*"
                  onChange={i === 1 ? handleBanner1 : handleBanner2}
                />

                <Input
                  placeholder="Hoặc nhập link ảnh ngoài"
                  value={banner}
                  onChange={(e) =>
                    i === 1
                      ? setBanner1(e.target.value)
                      : setBanner2(e.target.value)
                  }
                />

                <Input
                  placeholder="Link chuyển hướng"
                  value={link}
                  onChange={(e) =>
                    i === 1
                      ? setLinkBanner1(e.target.value)
                      : setLinkBanner2(e.target.value)
                  }
                />

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={i === 1 ? removeBanner1 : removeBanner2}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa Ảnh banner
                </Button>
              </div>
            );
          })}
        </div>

        <Button onClick={saveBanner} className="w-full mt-6">
          Lưu Banner
        </Button>
      </div>
    </div>
  );
};

export default Insurance;

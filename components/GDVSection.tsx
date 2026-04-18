"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Search as SearchIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import GDVCard from "./GDVCard";
import SearchBar from "./SearchBar";
import FilterDropdown, { type FilterOption } from "./FilterDropdown";
import { getFbUid } from "@/lib/getFbUid";

interface Trader {
  id: string;
  name: string;
  slug: string;
  service: string | null;
  code: string;
  insurance_fund: number;
  status: string;
  success_rate: number;
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

const GDVSection = () => {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [traderCats, setTraderCats] = useState<Record<string, string[]>>({});

  const [searchText, setSearchText] = useState("");
  const [facebookUid, setFacebookUid] = useState<string | null>(null);
  const [zaloPhone, setZaloPhone] = useState<string | null>(null);
  const [websiteSearch, setWebsiteSearch] = useState<string | null>(null);
  const [slugSearch, setSlugSearch] = useState<string | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || "";
  const websiteDomain = process.env.NEXT_PUBLIC_WEBSITE_DOMAIN || "";

  // Fetch dữ liệu ban đầu
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setError(null);
        setLoading(true);

        const [tRes, cRes, tcRes] = await Promise.all([
          supabase
            .from("traders")
            .select("*")
            .eq("status", "LIVE")
            .order("created_at", { ascending: true }),
          supabase.from("categories").select("*").order("name"),
          supabase.from("trader_categories").select("*"),
        ]);

        setTraders((tRes.data as any[]) || []);
        setCategories((cRes.data as any[]) || []);

        const map: Record<string, string[]> = {};
        ((tcRes.data as any[]) || []).forEach((tc: any) => {
          if (!map[tc.trader_id]) map[tc.trader_id] = [];
          map[tc.trader_id].push(tc.category_id);
        });
        setTraderCats(map);
      } catch (e: any) {
        console.error("GDVSection fetch failed", e);
        setError(e?.message || "Lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Xử lý tìm kiếm thông minh
  const handleSearchChange = useCallback(async (value: string) => {
    const trimmed = value.trim();
    setSearchText(trimmed);

    // Reset các chế độ tìm kiếm đặc biệt
    setFacebookUid(null);
    setZaloPhone(null);
    setWebsiteSearch(null);
    setSlugSearch(null);

    if (!trimmed) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true); // Bắt đầu loading

    try {
      // 1. Facebook
      if (trimmed.includes("facebook.com") || trimmed.includes("fb.com")) {
        const uid = await getFbUid(trimmed);
        if (uid) {
          setFacebookUid(uid);
          toast({ title: "Tìm theo Facebook UID", description: uid });
        }
        return;
      }

      // 2. Link profile website → slug
      if (
        trimmed.includes(websiteDomain) ||
        trimmed.includes(websiteUrl.replace("https://", "")) ||
        trimmed.startsWith("/")
      ) {
        let slug = trimmed
          .replace(websiteUrl, "")
          .replace(`https://${websiteDomain}`, "")
          .replace(`http://${websiteDomain}`, "")
          .replace(/^https?:\/\//, "")
          .replace(websiteDomain, "")
          .replace(/^\//, "")
          .split("?")[0]
          .split("#")[0];

        if (slug) {
          setSlugSearch(slug);
          toast({ title: "Tìm theo slug", description: slug });
          return;
        }
      }

      // 3. Zalo / SĐT
      if (
        trimmed.includes("zalo.me") ||
        /^(\+?84|0)[35789]\d{8,9}$/.test(trimmed.replace(/\s+/g, ""))
      ) {
        let phone = trimmed;
        if (trimmed.includes("zalo.me")) {
          const match = trimmed.match(/zalo\.me\/(\+?84|0)?(\d+)/);
          if (match) phone = match[2];
        }
        phone = phone.replace(/\D/g, "");
        if (phone.startsWith("84")) phone = "0" + phone.slice(2);
        if (phone.length >= 9) {
          setZaloPhone(phone);
          toast({ title: "Tìm theo Zalo/SĐT", description: phone });
          return;
        }
      }

      // 4. Website / domain
      if (
        trimmed.includes("http") ||
        (trimmed.includes(".") &&
          !trimmed.includes("facebook.com") &&
          !trimmed.includes("zalo.me"))
      ) {
        try {
          let domain = trimmed;
          if (trimmed.includes("http")) {
            const urlObj = new URL(trimmed.startsWith("http") ? trimmed : "https://" + trimmed);
            domain = urlObj.hostname.replace("www.", "");
          } else {
            domain = trimmed.replace("www.", "");
          }
          setWebsiteSearch(domain.toLowerCase());
          toast({ title: "Tìm theo website", description: domain });
          return;
        } catch { }
      }
    } catch (err: any) {
      toast({
        title: "Có lỗi khi xử lý tìm kiếm",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false); // Kết thúc loading
    }
  }, [websiteUrl, websiteDomain]);

  const handleFilterChange = useCallback((value: string) => setFilterCat(value), []);
  const [filterCat, setFilterCat] = useState("all");

  const getCatNames = (traderId: string) => {
    const catIds = traderCats[traderId] || [];
    return categories.filter((c) => catIds.includes(c.id)).map((c) => c.name);
  };

  const filterOptions: FilterOption[] = useMemo(
    () => [
      { value: "all", label: "Tất cả danh mục" },
      ...categories.map((c) => ({ value: c.id, label: c.name })),
    ],
    [categories]
  );

  // Logic lọc kết quả
  const filtered = useMemo(() => {
    return traders.filter((t) => {
      if (facebookUid) return t.facebook === facebookUid;
      if (slugSearch) return t.slug.toLowerCase() === slugSearch.toLowerCase();

      if (zaloPhone && t.zalo) {
        const normalizedZalo = t.zalo.replace(/\D/g, "");
        const normalizedSearch = zaloPhone.replace(/\D/g, "");
        if (normalizedZalo.includes(normalizedSearch) || normalizedSearch.includes(normalizedZalo.slice(-8))) {
          return true;
        }
      }

      if (websiteSearch && t.website) {
        try {
          const traderDomain = new URL(
            t.website.startsWith("http") ? t.website : "https://" + t.website
          ).hostname
            .replace("www.", "")
            .toLowerCase();
          if (traderDomain.includes(websiteSearch) || websiteSearch.includes(traderDomain)) return true;
        } catch {
          if (t.website.toLowerCase().includes(websiteSearch)) return true;
        }
      }

      const matchSearch =
        searchText === "" ||
        t.name.toLowerCase().includes(searchText.toLowerCase()) ||
        t.code.toLowerCase().includes(searchText.toLowerCase());

      const matchCat = filterCat === "all" || (traderCats[t.id] || []).includes(filterCat);

      return matchSearch && matchCat;
    });
  }, [traders, searchText, facebookUid, zaloPhone, websiteSearch, slugSearch, filterCat, traderCats]);

  if (loading) {
    return (
      <section id="gdv" className="py-20 px-4">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">Đang tải giao dịch viên...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="gdv" className="py-20 px-4">
        <div className="container mx-auto text-center text-destructive">
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="gdv" className="py-20 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Danh sách <span className="text-gradient">Giao dịch viên</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Các giao dịch viên đã được xác thực
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="flex-1 w-full">
              <SearchBar
                onSearchChange={handleSearchChange}
                placeholder="Tìm theo tên, mã GDV, link FB, Zalo, website hoặc link profile..."
              />
            </div>

            {filterOptions.length > 1 && (
              <div className="w-full md:w-auto shrink-0">
                <FilterDropdown
                  options={filterOptions}
                  value={filterCat}
                  onChange={handleFilterChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* Khu vực hiển thị kết quả + Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
          {/* Hiển thị loading.gif khi đang tìm kiếm */}
          {isSearching ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <Image
                src="/loading.gif"
                alt="Đang tìm kiếm..."
                width={100}
                height={100}
                className="mb-4"
                priority
              />
              <p className="text-muted-foreground text-lg">Đang tìm kiếm giao dịch viên...</p>
            </div>
          ) : filtered.length > 0 ? (
            /* Hiển thị danh sách GDV */
            filtered.map((t, i) => (
              <Link
                key={t.id}
                href={`/${t.slug}`}
                className="block animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <GDVCard
                  name={t.name}
                  service={t.service || t.code}
                  code={t.code}
                  insurance={`${Number(t.insurance_fund).toLocaleString("vi-VN")}₫`}
                  isLive={true}
                  successRate={Number(t.success_rate)}
                  avatarUrl={t.avatar_url}
                  description={t.description || undefined}
                  facebook={t.facebook}
                  zalo={t.zalo}
                  website={t.website}
                  categories={getCatNames(t.id)}
                />
              </Link>
            ))
          ) : searchText ? (
            /* Không tìm thấy kết quả */
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <SearchIcon size={22} className="text-primary" />
              </div>
              <p className="mb-1 text-base font-medium text-foreground">
                Không tìm thấy giao dịch viên phù hợp
              </p>
              <p className="max-w-md text-sm text-muted-foreground">
                Thử từ khóa khác hoặc kiểm tra lại link bạn dán
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default GDVSection;
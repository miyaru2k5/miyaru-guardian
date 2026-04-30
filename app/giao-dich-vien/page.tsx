"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Search as SearchIcon, ChevronDown, Check, X, Clipboard, SlidersHorizontal } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getFbUid } from "@/lib/getFbUid";
import MainLayout from "@/layouts/MainLayout";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Trader {
  id: string;
  name: string;
  slug: string;
  role: "admin" | "gdv" | "kdv" | null;
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

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_TICK: Record<string, string> = {
  gdv: "/tickxanh.png",
  admin: "/ticktim.png",
  kdv: "/tickvang.png",
};

const ROLE_LABEL: Record<string, string> = {
  admin: "Quản Lý & Điều Hành",
  gdv: "Giao Dịch Viên",
  kdv: "Kiểm Duyệt Viên",
};

const ROLE_ORDER: Array<"admin" | "gdv" | "kdv"> = ["admin", "gdv", "kdv"];

const ROLE_ACCENT: Record<string, string> = {
  admin: "#c02ba7",
  gdv: "#1a7abf",
  kdv: "#c8990a",
};

const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || "";
const websiteDomain = process.env.NEXT_PUBLIC_WEBSITE_DOMAIN || "";

// ─── SearchBar ────────────────────────────────────────────────────────────────

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  isSearching: boolean;
}

function SearchBar({ value, onChange, isSearching }: SearchBarProps) {
  const hasValue = value.length > 0;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) onChange(text);
    } catch {
      toast({ title: "Không thể dán", description: "Trình duyệt chặn quyền clipboard", variant: "destructive" });
    }
  };

  return (
    <div className="relative w-full">
      {/* left icon */}
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
        {isSearching ? (
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : (
          <SearchIcon size={17} className="text-muted-foreground" />
        )}
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tìm kiếm..."
        className="w-full pl-11 pr-10 py-3 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
      />

      {/* right icon: X khi có chữ, clipboard khi trống */}
      <div className="absolute inset-y-0 right-3 flex items-center">
        {hasValue ? (
          <button
            onClick={() => onChange("")}
            className="flex items-center gap-1.5 px-2 h-6 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Xóa tìm kiếm"
          >
            <X size={14} />
            <span className="text-xs">Xóa</span>
          </button>
        ) : (
          <button
            onClick={handlePaste}
            className="flex items-center gap-1.5 px-2 h-6 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            aria-label="Dán từ clipboard"
          >
            <Clipboard size={14} />
            <span className="text-xs">Dán</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── FilterDropdown ───────────────────────────────────────────────────────────

interface FilterDropdownProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
  compact?: boolean; // hiện icon thay vì text
}

function FilterDropdown({ options, value, onChange, compact = false }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const isFiltered = value !== "all";

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-2 py-3 rounded-2xl border transition-all
          ${isFiltered ? "border-primary/50 text-primary bg-primary/5" : "border-border bg-card text-foreground hover:border-primary/50"}
          ${compact ? "px-3 justify-center w-[46px]" : "px-4 justify-between min-w-[180px]"}`}
      >
        {compact ? (
          <SlidersHorizontal size={16} className={isFiltered ? "text-primary" : "text-muted-foreground"} />
        ) : (
          <>
            <span className="text-sm truncate">{selected?.label ?? "Tất cả danh mục"}</span>
            <ChevronDown
              size={15}
              className={`text-muted-foreground transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
            />
          </>
        )}
      </button>

      {/* indicator dot khi compact + đang filter */}
      {compact && isFiltered && (
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary" />
      )}

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 min-w-[200px] rounded-2xl border border-border bg-card shadow-xl overflow-hidden py-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left hover:bg-primary/5 transition-colors"
              >
                <Check
                  size={13}
                  className={`shrink-0 ${opt.value === value ? "text-primary opacity-100" : "opacity-0"}`}
                />
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── TraderAvatar ─────────────────────────────────────────────────────────────

interface TraderAvatarProps {
  trader: Trader;
  index: number;
}

function TraderAvatar({ trader, index }: TraderAvatarProps) {
  const role = trader.role ?? "gdv";
  const tickSrc = ROLE_TICK[role] ?? ROLE_TICK["gdv"];

  return (
    <Link
      href={`/${trader.slug}`}
      className="flex flex-col items-center gap-2 group w-[90px] md:w-[110px]"
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      {/* Avatar */}
      <div className="relative">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-border group-hover:border-primary/50 transition-all duration-200 shadow-sm group-hover:shadow-md group-hover:scale-105 bg-muted">
          {trader.avatar_url ? (
            <img
              src={trader.avatar_url}
              alt={trader.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = "none";
                el.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}

          <div
            className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/60 ${trader.avatar_url ? "hidden" : ""}`}
          >
            <span className="text-2xl font-bold text-white">
              {trader.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Tick */}
        <img
          src={tickSrc}
          alt={role}
          className="absolute -bottom-1 -right-1 w-5 h-5 object-contain drop-shadow"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      </div>

      {/* Text */}
      <div className="text-center w-full">
        <p className="text-[11px] text-muted-foreground font-mono leading-none mb-0.5 truncate">
          {trader.code}
        </p>

        <p className="text-xs md:text-sm font-medium text-foreground leading-tight group-hover:text-primary transition-colors text-center truncate w-full">
          {trader.name}
        </p>
      </div>
    </Link>
  );
}

// ─── RoleSection ──────────────────────────────────────────────────────────────

interface RoleSectionProps {
  role: "admin" | "gdv" | "kdv";
  traders: Trader[];
  startIndex: number;
}

function RoleSection({ role, traders, startIndex }: RoleSectionProps) {
  if (traders.length === 0) return null;

  const accent = ROLE_ACCENT[role];
  const label = ROLE_LABEL[role];

  return (
    <div
      className="rounded-2xl border bg-card overflow-hidden"
      style={{ borderColor: `${accent}33` }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center justify-center gap-2"
        style={{
          borderBottom: `1px solid ${accent}22`,
          background: `${accent}08`,
        }}
      >
        <span className="star-spin" aria-hidden>⭐</span>

        <h2
          className="text-sm md:text-base font-bold tracking-wide flex items-center gap-1"
          style={{ color: accent }}
        >
          {label}
          <span className="star-spin" aria-hidden>⭐</span>
        </h2>
      </div>

      {/* Avatar */}
      <div className="p-5">
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {traders.map((t, i) => (
            <TraderAvatar
              key={t.id}
              trader={t}
              index={startIndex + i}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const GDVPage = () => {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [traderCats, setTraderCats] = useState<Record<string, string[]>>({});

  const [rawSearch, setRawSearch] = useState("");
  const [searchText, setSearchText] = useState("");
  const [facebookUid, setFacebookUid] = useState<string | null>(null);
  const [zaloPhone, setZaloPhone] = useState<string | null>(null);
  const [websiteSearch, setWebsiteSearch] = useState<string | null>(null);
  const [slugSearch, setSlugSearch] = useState<string | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState("all");

  // compact filter: true khi màn hình nhỏ (dùng ResizeObserver trên container)
  const [compactFilter, setCompactFilter] = useState(false);

  // ── Fetch ──
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setError(null);
        setLoading(true);
        const [tRes, cRes, tcRes] = await Promise.all([
          supabase.from("traders").select("*").eq("status", "LIVE").order("created_at", { ascending: true }),
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
        setError(e?.message || "Lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── Smart search ──
  const handleSearchChange = useCallback(async (value: string) => {
    const trimmed = value.trim();
    setRawSearch(value);
    setSearchText(trimmed);
    setFacebookUid(null);
    setZaloPhone(null);
    setWebsiteSearch(null);
    setSlugSearch(null);

    if (!trimmed) { setIsSearching(false); return; }

    setIsSearching(true);
    try {
      if (trimmed.includes("facebook.com") || trimmed.includes("fb.com")) {
        const uid = await getFbUid(trimmed);
        if (uid) { setFacebookUid(uid); toast({ title: "Tìm theo Facebook UID", description: uid }); }
        return;
      }
      if (
        trimmed.includes(websiteDomain) ||
        trimmed.includes(websiteUrl.replace("https://", "")) ||
        trimmed.startsWith("/")
      ) {
        let slug = trimmed
          .replace(websiteUrl, "").replace(`https://${websiteDomain}`, "")
          .replace(`http://${websiteDomain}`, "").replace(/^https?:\/\//, "")
          .replace(websiteDomain, "").replace(/^\//, "").split("?")[0].split("#")[0];
        if (slug) { setSlugSearch(slug); toast({ title: "Tìm theo slug", description: slug }); return; }
      }
      if (trimmed.includes("zalo.me") || /^(\+?84|0)[35789]\d{8,9}$/.test(trimmed.replace(/\s+/g, ""))) {
        let phone = trimmed;
        if (trimmed.includes("zalo.me")) {
          const match = trimmed.match(/zalo\.me\/(\+?84|0)?(\d+)/);
          if (match) phone = match[2];
        }
        phone = phone.replace(/\D/g, "");
        if (phone.startsWith("84")) phone = "0" + phone.slice(2);
        if (phone.length >= 9) { setZaloPhone(phone); toast({ title: "Tìm theo Zalo/SĐT", description: phone }); return; }
      }
      if (trimmed.includes("http") || (trimmed.includes(".") && !trimmed.includes("facebook.com") && !trimmed.includes("zalo.me"))) {
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
      toast({ title: "Lỗi tìm kiếm", description: err.message, variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  }, []);

  const filterOptions = useMemo(
    () => [{ value: "all", label: "Tất cả danh mục" }, ...categories.map((c) => ({ value: c.id, label: c.name }))],
    [categories]
  );

  // ── Filter logic ──
  const filtered = useMemo(() => {
    return traders.filter((t) => {
      if (facebookUid) return t.facebook === facebookUid;
      if (slugSearch) return t.slug.toLowerCase() === slugSearch.toLowerCase();
      if (zaloPhone && t.zalo) {
        const a = t.zalo.replace(/\D/g, ""), b = zaloPhone.replace(/\D/g, "");
        if (a.includes(b) || b.includes(a.slice(-8))) return true;
      }
      if (websiteSearch && t.website) {
        try {
          const d = new URL(t.website.startsWith("http") ? t.website : "https://" + t.website).hostname.replace("www.", "").toLowerCase();
          if (d.includes(websiteSearch) || websiteSearch.includes(d)) return true;
        } catch { if (t.website.toLowerCase().includes(websiteSearch)) return true; }
      }

      const matchSearch =
        searchText === "" ||
        t.name.toLowerCase().includes(searchText.toLowerCase()) ||
        t.code.toLowerCase().includes(searchText.toLowerCase());

      const matchCat = filterCat === "all" || (traderCats[t.id] || []).includes(filterCat);

      return matchSearch && matchCat;
    });
  }, [traders, searchText, facebookUid, zaloPhone, websiteSearch, slugSearch, filterCat, traderCats]);

  // ── Group by role ──
  const grouped = useMemo(() => {
    const map: Record<string, Trader[]> = { admin: [], gdv: [], kdv: [] };
    filtered.forEach((t) => {
      const r = t.role ?? "gdv";
      if (map[r]) map[r].push(t);
      else map["gdv"].push(t);
    });
    return map;
  }, [filtered]);

  const hasResults = filtered.length > 0;
  const adminCount = grouped["admin"].length;
  const gdvCount = grouped["gdv"].length;

  // ── Loading ──
  if (loading) {
    return (
      <MainLayout>
        <section className="py-20 px-0 min-h-screen">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <div className="h-9 w-64 rounded-xl bg-muted/50 animate-pulse mx-auto mb-3" />
              <div className="h-4 w-48 rounded-xl bg-muted/30 animate-pulse mx-auto" />
            </div>
            <div className="h-12 rounded-2xl bg-muted/40 animate-pulse mb-6" />
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-40 rounded-2xl bg-muted/30 animate-pulse" />
              ))}
            </div>
          </div>
        </section>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <section className="py-20 px-4 min-h-screen flex items-center justify-center">
          <div className="text-center text-destructive">
            <p className="font-medium">{error}</p>
          </div>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="py-20 md:py-24 min-h-screen">
        <div className="mx-auto max-w-6xl px-4">

          {/* ── Header ── */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Danh sách <span className="text-gradient">Giao dịch viên</span>
            </h1>
          </div>

          {/* ── Search + Filter — luôn 1 hàng ── */}
          <div className="flex items-center gap-2 mb-8">
            {/* input chiếm toàn bộ không gian còn lại */}
            <div className="flex-1 min-w-0">
              <SearchBar value={rawSearch} onChange={handleSearchChange} isSearching={isSearching} />
            </div>

            {/* combobox: full text trên md+, icon-only trên nhỏ hơn */}
            {filterOptions.length > 1 && (
              <>
                {/* md+: combobox đầy đủ */}
                <div className="hidden md:block">
                  <FilterDropdown options={filterOptions} value={filterCat} onChange={setFilterCat} compact={false} />
                </div>
                {/* <md: icon filter */}
                <div className="block md:hidden">
                  <FilterDropdown options={filterOptions} value={filterCat} onChange={setFilterCat} compact={true} />
                </div>
              </>
            )}
          </div>

          {/* ── Content ── */}
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Image src="/loading.gif" alt="Đang tìm..." width={80} height={80} priority />
              <p className="text-muted-foreground">Đang tìm kiếm giao dịch viên...</p>
            </div>
          ) : !hasResults ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <SearchIcon size={20} className="text-primary" />
              </div>
              <p className="font-medium text-foreground">Không tìm thấy giao dịch viên phù hợp</p>
              <p className="text-sm text-muted-foreground max-w-sm">
                Thử từ khóa khác hoặc kiểm tra lại link bạn dán vào
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {ROLE_ORDER.map((role) => (
                <RoleSection
                  key={role}
                  role={role}
                  traders={grouped[role]}
                  startIndex={
                    role === "admin" ? 0 :
                      role === "gdv" ? adminCount :
                        adminCount + gdvCount
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default GDVPage;
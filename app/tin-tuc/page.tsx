"use client";

import MainLayout from "@/layouts/MainLayout";
import {
  Clock,
  ExternalLink,
  Rss,
  TrendingUp,
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Category definitions (full VnExpress menu) ───────────────────────────────

interface Category {
  label: string;
  rss: string;
  color: string;
  dotColor: string;
  children?: { label: string; rss: string }[];
}

const CATEGORIES: Category[] = [
  {
    label: "Thời sự",
    rss: "https://vnexpress.net/rss/thoi-su.rss",
    color: "text-red-500",
    dotColor: "bg-red-500",
    children: [
      { label: "Chính trị", rss: "https://vnexpress.net/rss/thoi-su/chinh-tri.rss" },
      { label: "Kỷ nguyên mới", rss: "https://vnexpress.net/rss/thoi-su/huong-toi-ky-nguyen-moi.rss" },
      { label: "Dân sinh", rss: "https://vnexpress.net/rss/thoi-su/dan-sinh.rss" },
      { label: "Việc làm", rss: "https://vnexpress.net/rss/thoi-su/lao-dong-viec-lam.rss" },
      { label: "Giao thông", rss: "https://vnexpress.net/rss/thoi-su/giao-thong.rss" },
      { label: "Quỹ Hy vọng", rss: "https://vnexpress.net/rss/thoi-su/quy-hy-vong.rss" },
    ],
  },
  {
    label: "Thế giới",
    rss: "https://vnexpress.net/rss/the-gioi.rss",
    color: "text-amber-500",
    dotColor: "bg-amber-500",
    children: [
      { label: "Phân tích", rss: "https://vnexpress.net/rss/the-gioi/phan-tich.rss" },
      { label: "Tư liệu", rss: "https://vnexpress.net/rss/the-gioi/tu-lieu.rss" },
      { label: "Quân sự", rss: "https://vnexpress.net/rss/the-gioi/quan-su.rss" },
      { label: "Cuộc sống đó đây", rss: "https://vnexpress.net/rss/the-gioi/cuoc-song-do-day.rss" },
      { label: "Người Việt 5 châu", rss: "https://vnexpress.net/rss/the-gioi/nguoi-viet-5-chau.rss" },
    ],
  },
  {
    label: "Kinh doanh",
    rss: "https://vnexpress.net/rss/kinh-doanh.rss",
    color: "text-purple-500",
    dotColor: "bg-purple-500",
    children: [
      { label: "Quốc tế", rss: "https://vnexpress.net/rss/kinh-doanh/quoc-te.rss" },
      { label: "Doanh nghiệp", rss: "https://vnexpress.net/rss/kinh-doanh/doanh-nghiep.rss" },
      { label: "Chứng khoán", rss: "https://vnexpress.net/rss/kinh-doanh/chung-khoan.rss" },
      { label: "Ebank", rss: "https://vnexpress.net/rss/kinh-doanh/ebank.rss" },
      { label: "Vĩ mô", rss: "https://vnexpress.net/rss/kinh-doanh/vi-mo.rss" },
      { label: "Hàng hóa", rss: "https://vnexpress.net/rss/kinh-doanh/hang-hoa.rss" },
    ],
  },
  {
    label: "Khoa học - CN",
    rss: "https://vnexpress.net/rss/khoa-hoc-cong-nghe.rss",
    color: "text-blue-500",
    dotColor: "bg-blue-500",
    children: [
      { label: "Chuyển đổi số", rss: "https://vnexpress.net/rss/khoa-hoc-cong-nghe/chuyen-doi-so.rss" },
      { label: "Đổi mới sáng tạo", rss: "https://vnexpress.net/rss/khoa-hoc-cong-nghe/doi-moi-sang-tao.rss" },
      { label: "AI", rss: "https://vnexpress.net/rss/khoa-hoc-cong-nghe/ai.rss" },
      { label: "Vũ trụ", rss: "https://vnexpress.net/rss/khoa-hoc-cong-nghe/vu-tru.rss" },
      { label: "Thế giới tự nhiên", rss: "https://vnexpress.net/rss/khoa-hoc-cong-nghe/the-gioi-tu-nhien.rss" },
      { label: "Thiết bị", rss: "https://vnexpress.net/rss/khoa-hoc-cong-nghe/thiet-bi.rss" },
    ],
  },
  {
    label: "Góc nhìn",
    rss: "https://vnexpress.net/rss/goc-nhin.rss",
    color: "text-cyan-500",
    dotColor: "bg-cyan-500",
    children: [
      { label: "Chính trị & chính sách", rss: "https://vnexpress.net/rss/goc-nhin/chinh-tri-chinh-sach.rss" },
      { label: "Y tế & sức khỏe", rss: "https://vnexpress.net/rss/goc-nhin/y-te-suc-khoe.rss" },
      { label: "Kinh doanh & quản trị", rss: "https://vnexpress.net/rss/goc-nhin/kinh-doanh-quan-tri.rss" },
      { label: "Giáo dục & tri thức", rss: "https://vnexpress.net/rss/goc-nhin/giao-duc-tri-thuc.rss" },
    ],
  },
  {
    label: "Bất động sản",
    rss: "https://vnexpress.net/rss/bat-dong-san.rss",
    color: "text-orange-500",
    dotColor: "bg-orange-500",
    children: [
      { label: "Chính sách BĐS", rss: "https://vnexpress.net/rss/bat-dong-san/chinh-sach.rss" },
      { label: "Thị trường BĐS", rss: "https://vnexpress.net/rss/bat-dong-san/thi-truong.rss" },
      { label: "Dự án", rss: "https://vnexpress.net/rss/bat-dong-san/du-an.rss" },
      { label: "Không gian sống", rss: "https://vnexpress.net/rss/bat-dong-san/khong-gian-song.rss" },
    ],
  },
  {
    label: "Sức khỏe",
    rss: "https://vnexpress.net/rss/suc-khoe.rss",
    color: "text-teal-500",
    dotColor: "bg-teal-500",
    children: [
      { label: "Tin tức SK", rss: "https://vnexpress.net/rss/suc-khoe/tin-tuc.rss" },
      { label: "Các bệnh", rss: "https://vnexpress.net/rss/suc-khoe/cac-benh.rss" },
      { label: "Sống khỏe", rss: "https://vnexpress.net/rss/suc-khoe/song-khoe.rss" },
      { label: "Vaccine", rss: "https://vnexpress.net/rss/suc-khoe/vaccine.rss" },
    ],
  },
  {
    label: "Giải trí",
    rss: "https://vnexpress.net/rss/giai-tri.rss",
    color: "text-pink-500",
    dotColor: "bg-pink-500",
    children: [
      { label: "Giới sao", rss: "https://vnexpress.net/rss/giai-tri/gioi-sao.rss" },
      { label: "Sách", rss: "https://vnexpress.net/rss/giai-tri/sach.rss" },
      { label: "Phim", rss: "https://vnexpress.net/rss/giai-tri/phim.rss" },
      { label: "Nhạc", rss: "https://vnexpress.net/rss/giai-tri/nhac.rss" },
      { label: "Thời trang", rss: "https://vnexpress.net/rss/giai-tri/thoi-trang.rss" },
      { label: "Làm đẹp", rss: "https://vnexpress.net/rss/giai-tri/lam-dep.rss" },
    ],
  },
  {
    label: "Thể thao",
    rss: "https://vnexpress.net/rss/the-thao.rss",
    color: "text-green-500",
    dotColor: "bg-green-500",
    children: [
      { label: "Bóng đá", rss: "https://vnexpress.net/rss/bong-da.rss" },
      { label: "World Cup 2026", rss: "https://vnexpress.net/rss/the-thao/world-cup-2026.rss" },
      { label: "Marathon", rss: "https://vnexpress.net/rss/the-thao/marathon.rss" },
      { label: "Tennis", rss: "https://vnexpress.net/rss/the-thao/tennis.rss" },
      { label: "Các môn khác", rss: "https://vnexpress.net/rss/the-thao/cac-mon-khac.rss" },
    ],
  },
  {
    label: "Pháp luật",
    rss: "https://vnexpress.net/rss/phap-luat.rss",
    color: "text-rose-500",
    dotColor: "bg-rose-500",
    children: [
      { label: "Hồ sơ phá án", rss: "https://vnexpress.net/rss/phap-luat/ho-so-pha-an.rss" },
      { label: "Tư vấn PL", rss: "https://vnexpress.net/rss/phap-luat/tu-van.rss" },
    ],
  },
  {
    label: "Giáo dục",
    rss: "https://vnexpress.net/rss/giao-duc.rss",
    color: "text-indigo-500",
    dotColor: "bg-indigo-500",
    children: [
      { label: "Tuyển sinh", rss: "https://vnexpress.net/rss/giao-duc/tuyen-sinh.rss" },
      { label: "Du học", rss: "https://vnexpress.net/rss/giao-duc/du-hoc.rss" },
      { label: "Học tiếng Anh", rss: "https://vnexpress.net/rss/giao-duc/hoc-tieng-anh.rss" },
    ],
  },
  {
    label: "Đời sống",
    rss: "https://vnexpress.net/rss/doi-song.rss",
    color: "text-lime-500",
    dotColor: "bg-lime-500",
    children: [
      { label: "Nhịp sống", rss: "https://vnexpress.net/rss/doi-song/nhip-song.rss" },
      { label: "Tổ ấm", rss: "https://vnexpress.net/rss/doi-song/to-am.rss" },
      { label: "Bài học sống", rss: "https://vnexpress.net/rss/doi-song/bai-hoc-song.rss" },
      { label: "Cooking", rss: "https://vnexpress.net/rss/doi-song/cooking.rss" },
      { label: "Tiêu dùng", rss: "https://vnexpress.net/rss/doi-song/tieu-dung.rss" },
    ],
  },
  {
    label: "Xe cộ",
    rss: "https://vnexpress.net/rss/oto-xe-may.rss",
    color: "text-yellow-500",
    dotColor: "bg-yellow-500",
    children: [
      { label: "Thị trường xe", rss: "https://vnexpress.net/rss/oto-xe-may/thi-truong.rss" },
      { label: "Xe điện", rss: "https://vnexpress.net/rss/oto-xe-may/xe-dien.rss" },
      { label: "V-Car", rss: "https://vnexpress.net/rss/oto-xe-may/v-car.rss" },
      { label: "Cầm lái", rss: "https://vnexpress.net/rss/oto-xe-may/cam-lai.rss" },
    ],
  },
  {
    label: "Du lịch",
    rss: "https://vnexpress.net/rss/du-lich.rss",
    color: "text-sky-500",
    dotColor: "bg-sky-500",
    children: [
      { label: "Điểm đến", rss: "https://vnexpress.net/rss/du-lich/diem-den.rss" },
      { label: "Ẩm thực", rss: "https://vnexpress.net/rss/du-lich/am-thuc.rss" },
      { label: "Dấu chân", rss: "https://vnexpress.net/rss/du-lich/dau-chan.rss" },
      { label: "Cẩm nang", rss: "https://vnexpress.net/rss/du-lich/cam-nang.rss" },
    ],
  },
  {
    label: "Tâm sự",
    rss: "https://vnexpress.net/rss/tam-su.rss",
    color: "text-fuchsia-500",
    dotColor: "bg-fuchsia-500",
    children: [
      { label: "Hẹn hò", rss: "https://vnexpress.net/rss/tam-su/hen-ho.rss" },
    ],
  },
  {
    label: "Thư giãn",
    rss: "https://vnexpress.net/rss/thu-gian.rss",
    color: "text-emerald-500",
    dotColor: "bg-emerald-500",
    children: [
      { label: "Cười", rss: "https://vnexpress.net/rss/thu-gian/cuoi.rss" },
      { label: "Đố vui", rss: "https://vnexpress.net/rss/thu-gian/do-vui.rss" },
      { label: "Chuyện lạ", rss: "https://vnexpress.net/rss/thu-gian/chuyen-la.rss" },
      { label: "Thú cưng", rss: "https://vnexpress.net/rss/thu-gian/thu-cung.rss" },
    ],
  },
];

const DEFAULT_RSS = "https://vnexpress.net/rss/tin-moi-nhat.rss";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  imageUrl: string;
  categoryLabel: string;
}

interface SelectedCat {
  label: string;
  rss: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCategoryMeta(label: string): { color: string; dotColor: string } {
  for (const cat of CATEGORIES) {
    if (cat.label === label) return { color: cat.color, dotColor: cat.dotColor };
    if (cat.children?.some((c) => c.label === label))
      return { color: cat.color, dotColor: cat.dotColor };
  }
  return { color: "text-muted-foreground", dotColor: "bg-muted-foreground" };
}

// ─── XML Parser ───────────────────────────────────────────────────────────────

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function extractTag(xml: string, tag: string): string {
  const re = new RegExp(
    `<${tag}[^>]*>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))<\\/${tag}>`,
    "i"
  );
  const m = re.exec(xml);
  if (!m) return "";
  return decodeEntities((m[1] ?? m[2] ?? "").trim());
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}=["']([^"']+)["']`, "i");
  const m = re.exec(xml);
  return m ? decodeEntities(m[1]) : "";
}

function parseRSSXml(xml: string, categoryLabel: string): RSSItem[] {
  const itemRe = /<item>([\s\S]*?)<\/item>/gi;
  const items: RSSItem[] = [];
  let match: RegExpExecArray | null;

  while ((match = itemRe.exec(xml)) !== null) {
    const block       = match[1];
    const title       = extractTag(block, "title");
    const link        = extractTag(block, "link") || extractTag(block, "guid");
    const pubDate     = extractTag(block, "pubDate");
    const rawDesc     = extractTag(block, "description");
    const description = rawDesc.replace(/<[^>]*>/g, "").trim();

    let imageUrl = extractAttr(block, "enclosure", "url");
    if (!imageUrl) {
      const imgM = /src=["']([^"']+)["']/i.exec(rawDesc);
      imageUrl = imgM ? decodeEntities(imgM[1]) : "";
    }

    if (!title || !link) continue;
    items.push({ title, link, pubDate, description, imageUrl, categoryLabel });
  }

  return items;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const mins = (Date.now() - new Date(dateStr).getTime()) / 60_000;
  if (mins < 60)   return `${Math.round(mins)} phút trước`;
  if (mins < 1440) return `${Math.round(mins / 60)} giờ trước`;
  return `${Math.round(mins / 1440)} ngày trước`;
}

// ─── Safe Image ───────────────────────────────────────────────────────────────

function SafeImg({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [error, setError] = useState(false);
  if (!src || error) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" decoding="async"
      onError={() => setError(true)} className={className} />
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryBadge({ label }: { label: string }) {
  const { color } = getCategoryMeta(label);
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-widest ${color}`}>
      {label}
    </span>
  );
}

function FeaturedCard({ item }: { item: RSSItem }) {
  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer"
      className="group mb-6 flex overflow-hidden rounded-3xl bg-card ring-1 ring-border transition-all hover:ring-border/60 hover:shadow-lg">
      {item.imageUrl && (
        <div className="relative hidden w-[55%] shrink-0 overflow-hidden sm:block">
          <SafeImg src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex flex-col justify-between p-6 sm:p-8">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <CategoryBadge label={item.categoryLabel} />
            <span className="rounded-full bg-pink-500/15 px-2 py-0.5 text-[10px] font-medium text-pink-500 ring-1 ring-pink-500/20">
              Nổi bật
            </span>
          </div>
          <h2 className="mb-3 text-xl font-bold leading-snug text-foreground group-hover:text-foreground/80 sm:text-2xl">
            {item.title}
          </h2>
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {item.description.substring(0, 220)}…
          </p>
        </div>
        <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground/60">
          <Clock className="h-3 w-3" />
          <span>{timeAgo(item.pubDate)}</span>
          <ExternalLink className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-50" />
        </div>
      </div>
    </a>
  );
}

function NewsCard({ item }: { item: RSSItem }) {
  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-border transition-all hover:ring-border/60 hover:shadow-md">
      {item.imageUrl && (
        <div className="relative h-44 w-full shrink-0 overflow-hidden">
          <SafeImg src={item.imageUrl} alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <CategoryBadge label={item.categoryLabel} />
        <p className="mb-auto mt-2 line-clamp-3 text-sm font-medium leading-snug text-foreground/85 group-hover:text-foreground">
          {item.title}
        </p>
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
          <Clock className="h-3 w-3" />
          <span>{timeAgo(item.pubDate)}</span>
        </div>
      </div>
    </a>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground/40">
      <TrendingUp className="h-10 w-10 opacity-25" />
      <p className="text-sm">Không tìm thấy bài viết trong danh mục này.</p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-card py-24 ring-1 ring-border">
      <Rss className="h-10 w-10 text-muted-foreground/30" />
      <div className="text-center">
        <p className="font-medium text-muted-foreground">Không thể tải tin tức</p>
        <p className="mt-1 text-sm text-muted-foreground/60">Không kết nối được RSS feed. Vui lòng thử lại sau.</p>
      </div>
    </div>
  );
}

// ─── Category Dropdown (2-level: parent + submenu) ────────────────────────────

function CategoryDropdown({ selected, onSelect }: {
  selected: SelectedCat | null;
  onSelect: (cat: SelectedCat | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [hoveredParent, setHoveredParent] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setHoveredParent(null);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeParent = selected
    ? CATEGORIES.find(
        (c) => c.label === selected.label || c.children?.some((ch) => ch.label === selected.label)
      )
    : null;

  const hoveredCat = hoveredParent ? CATEGORIES.find((c) => c.label === hoveredParent) : null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen((v) => !v); setHoveredParent(null); }}
        className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm ring-1 transition-all sm:px-4 ${
          selected
            ? "bg-accent text-foreground ring-border"
            : "bg-card text-muted-foreground ring-border hover:text-foreground"
        }`}
      >
        <SlidersHorizontal className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">{selected ? selected.label : "Danh mục"}</span>
        <ChevronDown className={`hidden h-3.5 w-3.5 transition-transform sm:block ${open ? "rotate-180" : ""}`} />
        {selected && (
          <span className={`h-2 w-2 rounded-full sm:hidden ${getCategoryMeta(selected.label).dotColor}`} />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 flex overflow-hidden rounded-2xl bg-popover shadow-2xl ring-1 ring-border">
          {/* Parent list */}
          <div className="w-48 max-h-[70vh] overflow-y-auto">
            <button
              onClick={() => { onSelect(null); setOpen(false); }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent ${
                !selected ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-foreground shrink-0" />
              <span>Tất cả</span>
              {!selected && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-foreground" />}
            </button>

            {CATEGORIES.map((cat) => {
              const isActive = activeParent?.label === cat.label;
              const isHovered = hoveredParent === cat.label;
              return (
                <button key={cat.label}
                  onMouseEnter={() => setHoveredParent(cat.label)}
                  onClick={() => { onSelect({ label: cat.label, rss: cat.rss }); setOpen(false); setHoveredParent(null); }}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent ${
                    isActive ? "text-foreground font-medium" : "text-muted-foreground"
                  } ${isHovered ? "bg-accent/50" : ""}`}
                >
                  <span className={`h-2 w-2 rounded-full shrink-0 ${cat.dotColor}`} />
                  <span className="flex-1 text-left">{cat.label}</span>
                  {cat.children && cat.children.length > 0 && (
                    <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Submenu */}
          {hoveredCat && hoveredCat.children && hoveredCat.children.length > 0 && (
            <div className="w-48 border-l border-border max-h-[70vh] overflow-y-auto">
              <button
                onClick={() => { onSelect({ label: hoveredCat.label, rss: hoveredCat.rss }); setOpen(false); setHoveredParent(null); }}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent font-medium ${
                  selected?.label === hoveredCat.label ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <span className={`h-2 w-2 rounded-full shrink-0 ${hoveredCat.dotColor}`} />
                Tất cả {hoveredCat.label}
              </button>
              <div className="h-px bg-border mx-3 mb-1" />
              {hoveredCat.children.map((child) => (
                <button key={child.label}
                  onClick={() => { onSelect({ label: child.label, rss: child.rss }); setOpen(false); setHoveredParent(null); }}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent ${
                    selected?.label === child.label ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${hoveredCat.dotColor} opacity-60`} />
                  <span className="text-left">{child.label}</span>
                  {selected?.label === child.label && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-foreground" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-border">
      <div className="h-44 w-full animate-pulse bg-muted" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-3 w-16 animate-pulse rounded-full bg-muted" />
        <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-muted" />
        <div className="mt-2 h-3 w-20 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TinTucPage() {
  const [items, setItems]       = useState<RSSItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [selected, setSelected] = useState<SelectedCat | null>(null);
  const [query, setQuery]       = useState("");

  const currentRss   = selected?.rss ?? DEFAULT_RSS;
  const currentLabel = selected?.label ?? "Tin mới nhất";

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(false);
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(currentRss)}`;
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error("fetch failed");
        const xml = await res.text();
        setItems(parseRSSXml(xml, currentLabel));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentRss, currentLabel]);

  const filtered = items.filter((item) =>
    query.trim() === "" ||
    item.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  const isFeaturedMode = !selected && query === "";
  const featured = isFeaturedMode ? (filtered[0] ?? null) : null;
  const grid     = featured ? filtered.slice(1) : filtered;

  const clearSearch = useCallback(() => setQuery(""), []);

  // Active parent category label (for chip bar highlight)
  const activeParentLabel = selected
    ? (CATEGORIES.find(
        (c) => c.label === selected.label || c.children?.some((ch) => ch.label === selected.label)
      )?.label ?? selected.label)
    : null;

  // Active parent object (for subcategory chips)
  const activeParentCat = activeParentLabel
    ? CATEGORIES.find((c) => c.label === activeParentLabel)
    : null;

  return (
    <MainLayout>
      <main className="mx-auto mt-6 max-w-6xl px-4 pb-28 pt-20 sm:pt-24 lg:pt-28">

        {/* ── Header ── */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20">
              <Rss className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tin tức mới nhất</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Nguồn: VnExpress{!loading && ` · ${items.length} bài viết`}
              </p>
            </div>
          </div>
          <span className="hidden rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground ring-1 ring-border sm:block">
            Cập nhật theo danh mục
          </span>
        </div>

        {/* ── Search + Filter ── */}
        <div className="mb-6 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm tin tức..."
              className="w-full rounded-xl bg-card py-2.5 pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground/50 ring-1 ring-border outline-none transition-all focus:ring-2 focus:ring-ring"
            />
            {query && (
              <button onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <CategoryDropdown selected={selected} onSelect={setSelected} />
        </div>

        {/* ── Active filter pill ── */}
        {selected && (
          <div className="mb-5 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Đang lọc:</span>
            <button
              onClick={() => setSelected(null)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ring-1 ring-border bg-muted transition-all hover:opacity-80 ${
                getCategoryMeta(selected.label).color
              }`}
            >
              {selected.label}
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* ── Parent category chip bar ── */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelected(null)}
            className={`flex shrink-0 items-center rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              !selected
                ? "bg-accent text-foreground ring-1 ring-border"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Tất cả
          </button>
          {CATEGORIES.map((cat) => {
            const isActive = activeParentLabel === cat.label;
            return (
              <button key={cat.label}
                onClick={() => setSelected({ label: cat.label, rss: cat.rss })}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-accent text-foreground ring-1 ring-border"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${cat.dotColor}`} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ── Subcategory chips (hiện khi đã chọn parent) ── */}
        {activeParentCat && activeParentCat.children && activeParentCat.children.length > 0 && (
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelected({ label: activeParentCat.label, rss: activeParentCat.rss })}
              className={`flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-medium ring-1 transition-all ${
                selected?.label === activeParentCat.label
                  ? `${activeParentCat.color} bg-muted ring-border`
                  : "text-muted-foreground ring-transparent hover:ring-border hover:bg-muted"
              }`}
            >
              Tất cả
            </button>
            {activeParentCat.children.map((child) => (
              <button key={child.label}
                onClick={() => setSelected({ label: child.label, rss: child.rss })}
                className={`flex shrink-0 items-center rounded-full px-3 py-1 text-xs ring-1 transition-all ${
                  selected?.label === child.label
                    ? `${activeParentCat.color} bg-muted ring-border font-medium`
                    : "text-muted-foreground ring-transparent hover:ring-border hover:bg-muted"
                }`}
              >
                {child.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && <ErrorState />}

        {/* ── Results ── */}
        {!loading && !error && (
          <>
            {query.trim() !== "" && (
              <p className="mb-4 text-xs text-muted-foreground">
                {filtered.length} kết quả cho &quot;{query}&quot;
              </p>
            )}
            {featured && <FeaturedCard item={featured} />}
            {grid.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {grid.map((item) => <NewsCard key={item.link} item={item} />)}
              </div>
            ) : (
              !featured && <EmptyState />
            )}
          </>
        )}

      </main>
    </MainLayout>
  );
}
"use client";

import {
  ChevronDown,
  FileText,
  Shield,
  Info,
  Lock,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import type { TermsPage } from "@/types/terms";

/* ─────────────────────────────────────────── */
/* Utils */
/* ─────────────────────────────────────────── */

const getExcerpt = (html: string, maxLength = 120): string => {
  const text = html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

const getIcon = (title: string) => {
  const t = title.toLowerCase();

  if (t.includes("bảo mật")) return <Lock size={18} />;
  if (t.includes("quyền") || t.includes("trách nhiệm")) return <Shield size={18} />;
  if (t.includes("giới thiệu")) return <Info size={18} />;

  return <FileText size={18} />;
};

/* ─────────────────────────────────────────── */
/* Accordion Item */
/* ─────────────────────────────────────────── */

const AccordionItem: React.FC<{
  item: TermsPage;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ item, index, isOpen, onToggle }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const safeHtml = sanitizeHtml(item.content || "");

  useEffect(() => {
    if (!contentRef.current) return;
    setHeight(isOpen ? contentRef.current.scrollHeight : 0);
  }, [isOpen]);

  return (
    <div
      className={`rounded-2xl border backdrop-blur-md transition-all duration-300
      ${
        isOpen
          ? "border-primary/40 bg-card/90 shadow-lg shadow-primary/10"
          : "border-border bg-card/50 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
      }`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 sm:p-5 text-left group"
      >
        <div className="flex items-center gap-3">

          {/* Icon */}
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0
            transition-all duration-300
            ${
              isOpen
                ? "bg-primary text-primary-foreground shadow-md scale-105"
                : "bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-105"
            }`}
          >
            {getIcon(item.title)}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <h3
                className={`font-semibold text-sm sm:text-base transition-colors ${
                  isOpen
                    ? "text-primary"
                    : "text-foreground group-hover:text-primary"
                }`}
              >
                {item.title}
              </h3>

              <ChevronDown
                size={18}
                className={`transition-all duration-300 ${
                  isOpen
                    ? "rotate-180 text-primary scale-110"
                    : "text-muted-foreground group-hover:text-primary"
                }`}
              />
            </div>

            {!isOpen && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                {getExcerpt(item.content || "") || "Xem chi tiết..."}
              </p>
            )}
          </div>
        </div>
      </button>

      {/* Content */}
      <div
        style={{ height, transition: "height 0.3s ease" }}
        className="overflow-hidden"
      >
        <div ref={contentRef}>
          <div
            className="px-4 sm:px-5 pb-5 text-sm text-muted-foreground leading-relaxed
            prose prose-sm max-w-none
            [&_h1]:text-base [&_h1]:font-bold [&_h1]:text-foreground
            [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-foreground
            [&_p]:mb-2
            [&_ul]:list-disc [&_ul]:pl-5
            [&_ol]:list-decimal [&_ol]:pl-5
            [&_strong]:text-foreground
            [&_a]:text-primary [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────── */
/* Main Section */
/* ─────────────────────────────────────────── */

const SystemTermsSection: React.FC = () => {
  const [items, setItems] = useState<TermsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("terms_pages")
        .select("id,title,slug,content,display_order,is_published")
        .eq("is_published", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true });

      setItems((data as TermsPage[]) || []);
      setLoading(false);
    };

    load();
  }, []);

  if (!loading && !items.length) return null;

  const toggleOpen = (id: string) =>
    setOpenId(prev => (prev === id ? null : id));

  return (
    <section className="py-16 md:py-20 px-3 sm:px-4">
      <div className="container mx-auto max-w-4xl">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12 gap-5">
<div className="flex items-center gap-2 px-4 py-2 rounded-full 
bg-primary/10 text-primary text-sm font-semibold 
shadow-sm border border-primary/20">

  <Shield size={18} className="shrink-0" />

  <span className="tracking-wide">
    Chính sách hệ thống
  </span>
</div>


          <img
            src="/dieu-khoan.gif"
            alt="Điều khoản"
            className="w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 object-contain"
          />

          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
              Điều khoản <span className="text-gradient">Hệ thống</span>
            </h2>

            <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
              Các quy định & chính sách khi sử dụng dịch vụ
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 bg-card/40 border border-border animate-pulse h-[100px]"
              />
            ))}
          </div>
        )}

        {/* List */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item, index) => (
              <AccordionItem
                key={item.id}
                item={item}
                index={index}
                isOpen={openId === item.id}
                onToggle={() => toggleOpen(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SystemTermsSection;

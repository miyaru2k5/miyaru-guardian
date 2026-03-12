"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FileText, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";

const normalizeContactUrl = (url: string): string => {
  if (!url?.trim()) return "#";
  const value = url.trim();
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value}`;
};

interface FacebookContact {
  id: string;
  title: string;
  branch_name: string;
  platform: string;
  platform_logo_url: string | null;
  platform_avatar_url: string | null;
  contact_url: string;
  support_text: string | null;
  display_order: number;
}

const ContactFacebookPage = () => {
  const [items, setItems] = useState<FacebookContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("facebook_contacts")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true });
      setItems((data as FacebookContact[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  const sorted = useMemo(
    () => items.slice().sort((a, b) => a.display_order - b.display_order),
    [items],
  );

  return (
    <main className="min-h-screen bg-[#0b0f19] text-gray-100 px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Liên hệ Facebook Admin</h1>
          <p className="text-gray-400">
            Liên hệ trực tiếp với Admin qua nền tảng để được hỗ trợ nhanh chóng.
          </p>
        </header>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 rounded-2xl bg-[#111827] border border-white/5 animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && sorted.length === 0 && (
          <p className="text-sm text-gray-400">
            Hiện chưa có kênh liên hệ nào.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sorted.map((item) => (
            <a
              key={item.id}
              href={normalizeContactUrl(item.contact_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-2xl border border-white/10 bg-[#111827]/80 hover:bg-[#111827] hover:border-primary/30 transition-all p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#0b0f19] border border-white/10 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {item.platform_avatar_url ? (
                    <img
                      src={item.platform_avatar_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-gray-400">
                      {(item.title || item.branch_name || "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-base text-gray-100 truncate">{item.title}</p>
                  <p className="text-sm text-gray-400 truncate flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    Chi nhánh: {item.branch_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#0b0f19] border border-white/5 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {item.platform_logo_url ? (
                    <img
                      src={item.platform_logo_url}
                      alt={item.platform}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-gray-500">{item.platform?.charAt(0) || "?"}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-300 truncate">{item.platform}</p>
                  <p className="text-xs text-gray-500 truncate group-hover:text-primary transition-colors">
                    {normalizeContactUrl(item.contact_url)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-primary mb-1">Mô tả</p>
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {item.support_text || "—"}
                  </p>
                </div>
              </div>

              <div className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground group-hover:text-primary font-medium transition-colors">
                Liên hệ ngay
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
};

export default ContactFacebookPage;

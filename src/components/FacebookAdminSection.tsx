import { ExternalLink, FileText, MapPin } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const normalizeContactUrl = (url: string): string => {
  if (!url?.trim()) return "#";
  const u = url.trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `https://${u}`;
};

type FacebookContact = {
  id: string;
  title: string;
  branch_name: string;
  platform: string;
  platform_logo_url: string | null;
  platform_avatar_url: string | null;
  contact_url: string;
  support_text: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
};

const FacebookAdminSection = () => {
  const [contacts, setContacts] = useState<FacebookContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("facebook_contacts")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (cancelled) return;

      if (error) {
        setError(error.message);
        setContacts([]);
      } else {
        setContacts((data as FacebookContact[]) || []);
      }

      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const sorted = useMemo(
    () => contacts.slice().sort((a, b) => a.display_order - b.display_order),
    [contacts],
  );

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Liên hệ <span className="text-gradient">Facebook Admin</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Liên hệ trực tiếp với Admin qua Facebook để được hỗ trợ nhanh chóng
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {loading &&
            Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 bg-card/40 border border-border animate-pulse h-[180px]"
              />
            ))}

          {!loading && error && (
            <div className="sm:col-span-2 text-sm text-destructive bg-destructive/10 border border-destructive/40 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {!loading && !error && sorted.length === 0 && (
            <div className="sm:col-span-2 text-center text-muted-foreground">
              Hiện chưa có kênh liên hệ nào.
            </div>
          )}

          {!loading &&
            !error &&
            sorted.map((contact, index) => (
            <a
              key={contact.id}
              href={normalizeContactUrl(contact.contact_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-2xl p-6 bg-card/60 border border-border hover:border-primary/30 hover:bg-card/80 transition-all text-left animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute top-4 right-4 opacity-60 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </div>

              {/* Hàng 1: Avatar | Tiêu đề + Chi nhánh */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-muted/50 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {contact.platform_avatar_url ? (
                    <img
                      src={contact.platform_avatar_url}
                      alt={contact.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-muted-foreground">
                      {(contact.title || contact.branch_name || "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground truncate">{contact.title}</p>
                  <p className="text-sm text-muted-foreground truncate flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    Chi nhánh: {contact.branch_name}
                  </p>
                </div>
              </div>

              {/* Hàng 2: Logo nền tảng | Tên nền tảng + Liên kết liên hệ */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-muted/50 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {contact.platform_logo_url ? (
                    <img
                      src={contact.platform_logo_url}
                      alt={contact.platform}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{contact.platform}</p>
                  <p className="text-xs text-primary truncate group-hover:underline">
                    {normalizeContactUrl(contact.contact_url)}
                  </p>
                </div>
              </div>

              {/* Hàng 3: Icon + Mô tả (màu primary theo theme) */}
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-primary mb-1">Mô tả</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {contact.support_text || "—"}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FacebookAdminSection;

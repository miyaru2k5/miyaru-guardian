"use client";

import { ExternalLink, FileText, MapPin, MessageCircle } from "lucide-react";
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

/* ─────────────── skeleton ─────────────── */
const SkeletonCard = () => (
  <div className="rounded-2xl p-5 bg-card/40 border border-border animate-pulse h-[230px]" />
);

/* ─────────────── card ─────────────── */
const ContactCard = ({
  contact,
  index,
}: {
  contact: FacebookContact;
  index: number;
}) => {
  const href = normalizeContactUrl(contact.contact_url);
  const initial = (contact.title || contact.branch_name || "?")
    .charAt(0)
    .toUpperCase();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fba-card group"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* ── top: avatar + identity + ext icon ── */}
      <div className="flex items-center gap-3 mb-4">
        {/* avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-13 h-13 rounded-full bg-muted/60 border border-border overflow-hidden flex items-center justify-center" style={{width:'52px',height:'52px'}}>
            {contact.platform_avatar_url ? (
              <img
                src={contact.platform_avatar_url}
                alt={contact.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-base font-bold text-primary">
                {initial}
              </span>
            )}
          </div>
          {/* online dot */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
        </div>

        {/* identity */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-foreground truncate leading-tight">
            {contact.title}
          </p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground truncate mt-0.5">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.2} />
            {contact.branch_name}
          </p>
        </div>

        {/* ext icon */}
        <ExternalLink
          className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 flex-shrink-0"
          strokeWidth={2}
        />
      </div>

      {/* ── divider ── */}
      <div className="fba-divider" />

      {/* ── platform row ── */}
      <div className="flex items-center gap-2.5 mt-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          {contact.platform_logo_url ? (
            <img
              src={contact.platform_logo_url}
              alt={contact.platform}
              className="w-[18px] h-[18px] object-contain"
            />
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 text-primary"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground/70 truncate">
            {contact.platform}
          </p>
          <p className="text-sm text-primary truncate group-hover:underline">
            {href.replace(/^https?:\/\//, "")}
          </p>
        </div>
      </div>

      {/* ── support text ── */}
      <div className="flex items-start gap-2 mt-3 p-2.5 rounded-xl bg-muted/30 border border-border/60">
        <FileText
          className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5"
          strokeWidth={2}
        />
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {contact.support_text || "—"}
        </p>
      </div>

      {/* ── cta ── */}
      <div className="flex items-center justify-center gap-1.5 mt-3 py-2.5 rounded-xl border border-primary/25 bg-primary/[0.08] text-primary text-sm font-semibold tracking-wide transition-colors group-hover:bg-primary/15 group-hover:border-primary/40">
        <MessageCircle className="w-4 h-4" strokeWidth={2} />
        Nhắn tin ngay
      </div>
    </a>
  );
};

/* ─────────────── section ─────────────── */
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
    () =>
      contacts
        .filter((c) => c.is_active)
        .slice()
        .sort((a, b) => a.display_order - b.display_order),
    [contacts],
  );

  return (
    <>
      <style>{`
        @keyframes fbaFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .fba-card {
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 20px;
          border-radius: 16px;
          background: hsl(var(--card) / 0.6);
          border: 1px solid hsl(var(--border));
          text-decoration: none;
          color: inherit;
          overflow: hidden;
          transition: border-color .25s, background .25s, transform .25s, box-shadow .25s;
          animation: fbaFadeUp .45s ease both;
        }

        .fba-card:hover {
          border-color: hsl(var(--primary) / 0.35);
          background: hsl(var(--card) / 0.85);
          transform: translateY(-4px);
          box-shadow: 0 16px 40px -8px hsl(var(--primary) / 0.12);
        }

        /* shimmer top-border on hover */
        .fba-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, hsl(var(--primary) / 0.55), transparent);
          opacity: 0;
          transition: opacity .3s;
        }
        .fba-card:hover::before { opacity: 1; }

        .fba-divider {
          height: 1px;
          background: hsl(var(--border));
        }
      `}</style>

      <section className="py-20 px-4">
        <div className="container mx-auto">
          {/* heading */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-primary bg-primary/10 border border-primary/20 rounded-full px-3.5 py-1 mb-4">
              <MessageCircle className="w-3 h-3" strokeWidth={2.5} />
              Hỗ trợ trực tuyến
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Liên hệ <span className="text-gradient">Facebook Admin</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
              Liên hệ trực tiếp với Admin qua Facebook để được hỗ trợ nhanh chóng
            </p>
          </div>

          {/* 3-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {loading &&
              Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}

            {!loading && error && (
              <div className="col-span-full text-sm text-destructive bg-destructive/10 border border-destructive/40 rounded-xl px-4 py-3 text-center">
                {error}
              </div>
            )}

            {!loading && !error && sorted.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-8">
                Hiện chưa có kênh liên hệ nào.
              </div>
            )}

            {!loading &&
              !error &&
              sorted.map((contact, index) => (
                <ContactCard key={contact.id} contact={contact} index={index} />
              ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default FacebookAdminSection;
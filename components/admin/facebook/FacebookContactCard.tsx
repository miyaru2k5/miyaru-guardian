import React from "react";
import { Button } from "@/components/ui/button";
import {
  Edit, Trash2, Eye, EyeOff, ExternalLink,
  Facebook, Send, Phone, Globe,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────── */
export interface FacebookContact {
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
}

interface Props {
  contact: FacebookContact;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

/* ─── Platform helpers ───────────────────────────────────── */
const PLATFORM_META: Record<string, { label: string; Icon: React.ElementType; color: string }> = {
  facebook: { label: "Facebook", Icon: Facebook, color: "text-blue-400" },
  zalo:     { label: "Zalo",     Icon: Phone,    color: "text-sky-400"  },
  telegram: { label: "Telegram", Icon: Send,     color: "text-cyan-400" },
  other:    { label: "Khác",     Icon: Globe,    color: "text-muted-foreground" },
};

const getPlatform = (key: string) =>
  PLATFORM_META[key.toLowerCase()] ?? PLATFORM_META.other;

/* ─── Component ──────────────────────────────────────────── */
const FacebookContactCard: React.FC<Props> = ({
  contact, onEdit, onDelete, onToggleActive,
}) => {
  const { label: platformLabel, Icon: PlatformIcon, color: platformColor } =
    getPlatform(contact.platform);

  return (
    <div
      className={`
        rounded-2xl p-4 flex flex-col gap-3 min-w-0 overflow-hidden
        bg-card border border-border transition-all duration-200
        ${!contact.is_active ? "opacity-55 grayscale" : ""}
      `}
    >
      {/* ── Top row: avatar + info + logo ── */}
      <div className="flex items-start justify-between gap-3 min-w-0">

        {/* Avatar */}
        <div className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
          {contact.platform_avatar_url ? (
            <img
              src={contact.platform_avatar_url}
              alt={contact.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-base font-bold text-primary">
              {contact.title.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Title + branch */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate leading-tight">
            {contact.title}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {contact.branch_name}
          </p>
          {contact.support_text && (
            <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 break-words leading-relaxed">
              {contact.support_text}
            </p>
          )}
        </div>

        {/* Platform logo / fallback icon */}
        <div className="shrink-0 w-9 h-9 rounded-lg bg-muted/50 border border-border flex items-center justify-center overflow-hidden">
          {contact.platform_logo_url ? (
            <img
              src={contact.platform_logo_url}
              alt={contact.platform}
              className="w-full h-full object-contain p-1"
            />
          ) : (
            <PlatformIcon size={16} className={platformColor} />
          )}
        </div>
      </div>

      {/* ── Meta row: platform badge + status ── */}
      <div className="flex items-center justify-between gap-2">

        {/* Platform badge */}
        <span className={`
          inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
          border border-border bg-muted/40
          ${platformColor}
        `}>
          <PlatformIcon size={11} />
          {platformLabel}
        </span>

        {/* Status toggle */}
        <button
          type="button"
          onClick={onToggleActive}
          className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
            border transition-colors duration-150
            ${contact.is_active
              ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
              : "border-border text-muted-foreground bg-muted/40 hover:bg-muted/70"
            }
          `}
        >
          {contact.is_active
            ? <><Eye size={11} /> Đang hiện</>
            : <><EyeOff size={11} /> Đã tắt</>
          }
        </button>
      </div>

      {/* ── Actions ── */}
      <div className="flex gap-2 pt-1 border-t border-border/50">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="flex-1 gap-1.5 text-xs h-8"
          onClick={onEdit}
        >
          <Edit size={13} /> Sửa
        </Button>



        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onDelete}
          className="text-destructive hover:bg-destructive/10 hover:border-destructive/50 h-8 px-3"
        >
          <Trash2 size={13} />
        </Button>
      </div>
    </div>
  );
};

export default FacebookContactCard;
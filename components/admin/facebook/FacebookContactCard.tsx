import React from "react";
import { Button } from "@/components/ui/button";

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

const FacebookContactCard: React.FC<Props> = ({
  contact,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  return (
    <div className="glow-border rounded-2xl p-5 card-hover bg-card flex flex-col gap-3 min-w-0 overflow-hidden">
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
            {contact.platform_avatar_url ? (
              <img
                src={contact.platform_avatar_url}
                alt={contact.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg font-semibold text-primary">
                {contact.title.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm md:text-base truncate">{contact.title}</p>
            <p className="text-xs text-muted-foreground truncate">{contact.branch_name}</p>
            {contact.support_text && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2 break-words">
                {contact.support_text}
              </p>
            )}
          </div>
        </div>
        {contact.platform_logo_url && (
          <img
            src={contact.platform_logo_url}
            alt={contact.platform}
            className="w-8 h-8 shrink-0 rounded-md object-contain bg-background/60 border border-border"
          />
        )}
      </div>

      <div className="flex items-center justify-between text-xs mt-1">
        <span className="px-2 py-0.5 rounded-full bg-background border border-border uppercase tracking-wide">
          {contact.platform}
        </span>
        <button
          type="button"
          onClick={onToggleActive}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
            contact.is_active
              ? "border-emerald-400 text-emerald-300 bg-emerald-500/10"
              : "border-muted text-muted-foreground bg-background/60"
          }`}
        >
          {contact.is_active ? "Đang hiển thị" : "Đã tắt"}
        </button>
      </div>

      <div className="flex gap-2 mt-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={onEdit}
        >
          Sửa
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="text-destructive hover:bg-destructive/10"
          onClick={onDelete}
        >
          Xóa
        </Button>
      </div>
    </div>
  );
};

export default FacebookContactCard;


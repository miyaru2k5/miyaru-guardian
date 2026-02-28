import React from "react";

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
    <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-card text-foreground p-4 shadow-sm flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center overflow-hidden">
          {contact.platform_avatar_url ? (
            <img
              src={contact.platform_avatar_url}
              alt={contact.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-lg font-semibold">
              {contact.title.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div>
              <p className="font-semibold text-sm md:text-base">{contact.title}</p>
              <p className="text-xs text-muted-foreground">{contact.branch_name}</p>
            </div>
            {contact.platform_logo_url && (
              <img
                src={contact.platform_logo_url}
                alt={contact.platform}
                className="w-8 h-8 rounded-md object-contain bg-background/60 border border-border"
              />
            )}
          </div>
          {contact.support_text && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {contact.support_text}
            </p>
          )}
        </div>
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
        <button
          type="button"
          onClick={onEdit}
          className="flex-1 px-3 py-1.5 rounded-xl border border-border text-xs hover:bg-background/80 transition"
        >
          Sửa
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="px-3 py-1.5 rounded-xl border border-destructive/50 text-xs text-destructive hover:bg-destructive/10 transition"
        >
          Xóa
        </button>
      </div>
    </div>
  );
};

export default FacebookContactCard;


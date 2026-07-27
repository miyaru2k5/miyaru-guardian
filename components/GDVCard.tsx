import { useState } from "react";
import { ChevronRight, ChevronDown, Globe, MessageCircle, User, FileText, Share2 } from "lucide-react";
import { VerifiedBadge } from "@/components/icons/VerifiedBadge";
import { motion, AnimatePresence } from "framer-motion";

interface GDVCardProps {
  name: string;
  service: string;
  code: string;
  insurance: string;
  isLive: boolean;
  successRate?: number;
  avatarUrl?: string | null;
  description?: string;
  facebook?: string | null;
  zalo?: string | null;
  website?: string | null;
  categories?: string[];
}

const GDVCard = ({
  name,
  service,
  code,
  insurance,
  isLive,
  successRate,
  avatarUrl,
  description,
  facebook,
  zalo,
  website,
  categories,
}: GDVCardProps) => {
  const [expanded, setExpanded] = useState(false);

  // Ngăn click bubble lên <Link> bọc ngoài
  const stopProp = (e: React.MouseEvent) => e.stopPropagation();
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setExpanded(v => !v);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/30">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">{name.charAt(0)}</span>
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-foreground text-lg leading-tight">{name}</h3>
              <VerifiedBadge role="gdv" size={16} />
            </div>
            <p className="text-sm text-muted-foreground">{service}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${isLive
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-muted text-muted-foreground border border-border"
              }`}
          >
            {isLive ? "LIVE" : "OFFLINE"}
          </span>
        </div>
      </div>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {categories.map(cat => (
            <span
              key={cat}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20"
            >
              {cat}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Mã GDV</span>
          <span className="font-medium text-foreground">{code}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Quỹ bảo hiểm</span>
          <span className="font-semibold text-primary">{insurance}</span>
        </div>
      </div>

      {/* Expandable detail — stopPropagation trên mọi link bên trong */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
            onClick={stopProp}
          >
            <div className="pt-4 pb-2 space-y-4 border-t border-border">
              {(facebook || zalo || website) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <User size={16} className="text-muted-foreground" />
                    <span>Liên hệ</span>
                  </div>
                  <div className="space-y-2 pl-6">
                    {facebook && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            facebook.startsWith("http")
                              ? facebook
                              : `https://www.facebook.com/${facebook}`,
                            "_blank"
                          );
                        }}
                        className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity w-full text-left"
                      >
                        <Share2 size={16} className="shrink-0 text-muted-foreground" aria-hidden />
                        <span className="text-muted-foreground">Facebook</span>
                        <span className="text-primary font-medium truncate">{facebook}</span>
                      </button>
                    )}

                    {zalo && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://zalo.me/${zalo.replace(/\D/g, "")}`, "_blank");
                        }}
                        className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity w-full text-left"
                      >
                        <MessageCircle size={16} className="text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Zalo / Phone</span>
                        <span className="text-primary font-medium">{zalo}</span>
                      </button>
                    )}

                    {website && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            website.startsWith("http") ? website : `https://${website}`,
                            "_blank"
                          );
                        }}
                        className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity w-full text-left"
                      >
                        <Globe size={16} className="text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Website</span>
                        <span className="text-primary font-medium truncate">{website}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}


            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button — stopPropagation để không navigate */}
      <button
        onClick={toggleExpand}
        className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-4"
      >
        {expanded ? "Ẩn chi tiết" : "Chi tiết"}
        {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>
    </div>
  );
};

export default GDVCard;
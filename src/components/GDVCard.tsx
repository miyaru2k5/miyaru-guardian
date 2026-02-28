import { useState } from "react";
import { ChevronRight, ChevronDown, Globe, MessageCircle, User, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GDVCardProps {
  name: string;
  service: string;
  code: string;
  insurance: string;
  isLive: boolean;
  avatarUrl?: string | null;
  description?: string;
  facebook?: string | null;
  zalo?: string | null;
  website?: string | null;
}

const GDVCard = ({ name, service, code, insurance, isLive, avatarUrl, description, facebook, zalo, website }: GDVCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/30">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-12 h-12 rounded-full object-cover border-2 border-primary/30" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">{name.charAt(0)}</span>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-foreground text-lg">{name}</h3>
            <p className="text-sm text-muted-foreground">{service}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${isLive ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-muted text-muted-foreground border border-border"}`}>
          {isLive ? "LIVE" : "OFFLINE"}
        </span>
      </div>

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

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
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
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        <span className="text-muted-foreground">Facebook</span>
                        <span className="text-primary font-medium truncate">{facebook}</span>
                      </div>
                    )}
                    {zalo && (
                      <div className="flex items-center gap-2 text-sm">
                        <MessageCircle size={16} className="text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Zalo / Phone</span>
                        <span className="text-primary font-medium">{zalo}</span>
                      </div>
                    )}
                    {website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe size={16} className="text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Website</span>
                        <span className="text-primary font-medium truncate">{website}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <FileText size={16} className="text-muted-foreground" />
                  <span>Mô tả</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">{description || "Chưa có mô tả"}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-4"
      >
        {expanded ? "Ấn chi tiết" : "Chi tiết"}
        {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>
    </div>
  );
};

export default GDVCard;

import { useState } from "react";
import { ChevronRight, ChevronDown, Globe, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GDVCardProps {
  name: string;
  service: string;
  code: string;
  insurance: string;
  isLive: boolean;
  description?: string;
  facebook?: string | null;
  zalo?: string | null;
  website?: string | null;
}

const GDVCard = ({ name, service, code, insurance, isLive, description, facebook, zalo, website }: GDVCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glow-border rounded-2xl p-5 card-hover group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20">
            <span className="text-lg font-bold text-primary">{name.charAt(0)}</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{service}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${isLive ? 'status-live' : 'status-offline'}`}>
          {isLive ? 'LIVE' : 'OFFLINE'}
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
            <div className="pt-3 pb-2 border-t border-border space-y-3">
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {facebook && (
                  <a href={facebook} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Facebook
                  </a>
                )}
                {zalo && (
                  <a href={`https://zalo.me/${zalo}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-blue-400/10 text-blue-300 hover:bg-blue-400/20 transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" /> Zalo
                  </a>
                )}
                {website && (
                  <a href={website} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    <Globe className="w-3.5 h-3.5" /> Website
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full py-3 px-4 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-medium text-sm transition-all flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-primary-foreground"
      >
        {expanded ? "Thu gọn" : "Chi tiết"}
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
      </button>
    </div>
  );
};

export default GDVCard;

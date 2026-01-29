import { ChevronRight } from "lucide-react";

interface GDVCardProps {
  name: string;
  service: string;
  code: string;
  insurance: string;
  isLive: boolean;
}

const GDVCard = ({ name, service, code, insurance, isLive }: GDVCardProps) => {
  return (
    <div className="glow-border rounded-2xl p-5 card-hover group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20">
            <span className="text-lg font-bold text-primary">{name.charAt(0)}</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{service}</p>
          </div>
        </div>
        
        {/* Status Badge */}
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

      <button className="w-full py-3 px-4 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-medium text-sm transition-all flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-primary-foreground">
        Chi tiết
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default GDVCard;

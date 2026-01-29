import { Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 px-4 border-t border-border bg-card/30">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center btn-glow">
              <span className="text-primary-foreground font-bold text-xl">M</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">Miyaru</span>
              <p className="text-sm text-muted-foreground">Giao dịch an toàn, tin cậy</p>
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <a 
              href="tel:0123456789" 
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span>0123 456 789</span>
            </a>
            <a 
              href="mailto:support@miyaru.vn" 
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>support@miyaru.vn</span>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Miyaru GDTG. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

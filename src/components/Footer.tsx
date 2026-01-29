const Footer = () => {
  return (
    <footer className="py-12 px-4 border-t border-border bg-card/50 pb-24 md:pb-12">
      <div className="container mx-auto">
        {/* Mobile: 2 columns (Brand + Liên hệ), Desktop: 4 columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center btn-glow">
                <span className="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold text-foreground">Miyaru</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Chi phí thấp – Nhanh chóng – Chất lượng.
              <br />
              Đồng hành cùng sự phát triển của bạn.
            </p>
          </div>

          {/* Dịch vụ - Hidden on mobile */}
          <div className="space-y-4 hidden lg:block">
            <h4 className="text-foreground font-semibold italic">Dịch vụ</h4>
            <nav className="flex flex-col gap-2">
              <a 
                href="#gdtg" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Giao dịch trung gian
              </a>
              <a 
                href="#gdv" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Giao dịch viên
              </a>
            </nav>
          </div>

          {/* Liên hệ */}
          <div className="space-y-4">
            <h4 className="text-foreground font-semibold italic">Liên hệ</h4>
            <div className="flex flex-col gap-2">
              <a 
                href="tel:0357175172" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Phone: 0357.175.172
              </a>
              <a 
                href="mailto:contact@miyaru.vn" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Email: contact@miyaru.vn
              </a>
            </div>
          </div>

          {/* Thông tin - Hidden on mobile */}
          <div className="space-y-4 hidden lg:block">
            <h4 className="text-foreground font-semibold italic">Thông tin</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>© {new Date().getFullYear()} Miyaru Team.</p>
              <p>All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

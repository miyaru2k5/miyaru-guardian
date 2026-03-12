"use client";

import { useThemeCustomizer } from "@/contexts/ThemeCustomizerContext";

const Footer = () => {
  const { systemSettings } = useThemeCustomizer();
  const footer = systemSettings.footer_data;
  const siteName = systemSettings.site_name;
  const logoUrl = systemSettings.logo_url;

  return (
    <footer className="py-12 px-4 border-t border-border bg-card/50 pb-24 md:pb-12">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-4 col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              {logoUrl ? (
                <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
                  <img
                    src={logoUrl}
                    alt={siteName}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                  <span className="font-bold text-lg text-foreground">
                    {siteName?.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-xl font-bold text-foreground">
                {siteName}
              </span>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {footer.description}
            </p>
          </div>

          {/* Dịch vụ - chỉ PC */}
          <div className="space-y-4 hidden lg:block">
            <h4 className="text-foreground font-semibold italic">
              Dịch vụ
            </h4>
            <nav className="flex flex-col gap-2">
              {footer.services.map((s, i) => (
                <span
                  key={i}
                  className="text-sm text-muted-foreground"
                >
                  {s}
                </span>
              ))}
            </nav>
          </div>

          {/* Liên hệ */}
          <div className="space-y-4 col-span-2 md:col-span-1">
            <h4 className="text-foreground font-semibold italic">
              Liên hệ
            </h4>
            <div className="flex flex-col gap-2">
              <a
                href={`tel:${footer.contact.phone.replace(/\./g, "")}`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Phone: {footer.contact.phone}
              </a>
              <a
                href={`mailto:${footer.contact.email}`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Email: {footer.contact.email}
              </a>
            </div>
          </div>

          {/* Thông tin - chỉ PC */}
          <div className="space-y-4 hidden lg:block">
            <h4 className="text-foreground font-semibold italic">
              Thông tin
            </h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{footer.copyright}</p>
              <p>All rights reserved.</p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
import { useState } from "react";
import { Menu, X, Users, Shield } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import ProfileDropdown from "./ProfileDropdown";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"gdv" | "gdtg">("gdv");

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center btn-glow">
                <span className="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold text-foreground">Miyaru</span>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center gap-4">
              <a 
                href="#gdv" 
                className="px-4 py-2 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors font-medium"
              >
                Giao dịch viên
              </a>
              <a 
                href="#gdtg" 
                className="px-4 py-2 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors font-medium"
              >
                Giao dịch trung gian
              </a>
              <ThemeToggle />
              <ProfileDropdown />
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <ProfileDropdown />
              <button 
                className="p-2 text-muted-foreground hover:text-foreground"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-border animate-fade-in">
              <nav className="flex flex-col gap-4">
                <a 
                  href="#gdv" 
                  className="text-muted-foreground hover:text-primary transition-colors font-medium py-2 px-4 rounded-full border border-border w-fit"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Giao dịch viên
                </a>
                <a 
                  href="#gdtg" 
                  className="text-muted-foreground hover:text-primary transition-colors font-medium py-2 px-4 rounded-full border border-border w-fit"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Giao dịch trung gian
                </a>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Bottom Navigation Bar - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border">
        <div className="flex">
          <button
            onClick={() => {
              setActiveTab("gdv");
              scrollToSection("gdv");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-4 transition-all ${
              activeTab === "gdv"
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground"
            }`}
          >
            <Users size={20} />
            <span className="font-medium">GDV</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("gdtg");
              scrollToSection("gdtg");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-4 transition-all ${
              activeTab === "gdtg"
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground"
            }`}
          >
            <Shield size={20} />
            <span className="font-medium">GDTG</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Header;

import { ExternalLink } from "lucide-react";

const admins = [
  { 
    name: "Chi nhánh 1", 
    support: "Hỗ trợ 24/7",
    link: "#"
  },
  { 
    name: "Chi nhánh 2", 
    support: "Hỗ trợ 24/7",
    link: "#"
  },
];

const FacebookAdminSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Liên hệ <span className="text-gradient">Facebook Admin</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Liên hệ trực tiếp với Admin qua Facebook để được hỗ trợ nhanh chóng
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {admins.map((admin, index) => (
            <a 
              key={admin.name}
              href={admin.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group glow-border rounded-2xl p-8 card-hover animate-fade-in-up relative text-center"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* External Link Icon */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-5 h-5 text-muted-foreground" />
              </div>

              {/* Facebook Icon */}
              <div className="w-16 h-16 rounded-xl bg-[#1877F2]/20 flex items-center justify-center mx-auto mb-4">
                <svg 
                  className="w-8 h-8 text-[#1877F2]" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>

              {/* Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#1877F2] text-white text-xs font-medium mb-4">
                Facebook Admin
              </div>

              {/* Info */}
              <h3 className="text-xl font-bold text-foreground mb-2">{admin.name}</h3>
              <p className="text-muted-foreground text-sm">{admin.support}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FacebookAdminSection;

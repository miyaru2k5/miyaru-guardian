import GDVCard from "./GDVCard";

const gdvList = [
  { name: "Minh Tuấn", service: "Free Fire", code: "GDV#001", insurance: "50,000,000đ", isLive: true },
  { name: "Hoàng Long", service: "Liên Quân Mobile", code: "GDV#002", insurance: "30,000,000đ", isLive: true },
  { name: "Thu Hà", service: "Mua bán acc", code: "GDV#003", insurance: "45,000,000đ", isLive: false },
  { name: "Đức Anh", service: "PUBG Mobile", code: "GDV#004", insurance: "25,000,000đ", isLive: true },
  { name: "Thanh Tùng", service: "Genshin Impact", code: "GDV#005", insurance: "40,000,000đ", isLive: false },
  { name: "Mai Linh", service: "Free Fire", code: "GDV#006", insurance: "35,000,000đ", isLive: true },
];

const GDVSection = () => {
  return (
    <section id="gdv" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Danh sách <span className="text-gradient">Giao dịch viên</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Các giao dịch viên đã được xác thực và có quỹ bảo hiểm
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gdvList.map((gdv, index) => (
            <div 
              key={gdv.code}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <GDVCard {...gdv} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GDVSection;

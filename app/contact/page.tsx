import MainLayout from "../../layouts/MainLayout";
import { MessageCircle } from "lucide-react";

export const metadata = {
  title: "Liên hệ",
  description: "Thông tin liên hệ hệ thống.",
};

const ContactPage = () => {
  return (
    <MainLayout>
      <section className="pt-24 md:pt-32 pb-16 md:pb-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
            <MessageCircle className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Liên hệ</h1>
          <p className="text-muted-foreground">
            Danh sách liên hệ Facebook Admin đã được gỡ. Vui lòng dùng các kênh
            hỗ trợ được công bố trên trang chủ hoặc trang giao dịch viên.
          </p>
        </div>
      </section>
    </MainLayout>
  );
};

export default ContactPage;

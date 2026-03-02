import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Lỗi: Người dùng truy cập đường dẫn không tồn tại:", location.pathname);
  }, [location.pathname]);

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">
            Xin lỗi! Không tìm thấy trang bạn yêu cầu.
          </p>
          <Button asChild>
            <Link to="/" className="w-full">
              Về trang chủ
            </Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;

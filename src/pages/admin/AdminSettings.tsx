import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";

const AdminSettings = () => {
  const { theme } = useTheme();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cấu hình</h1>
        <p className="text-muted-foreground text-sm">Cài đặt hệ thống</p>
      </div>

      <div className="glow-border rounded-2xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Giao diện</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-foreground font-medium">Chế độ hiển thị</p>
            <p className="text-sm text-muted-foreground">Hiện tại: {theme === "dark" ? "Tối" : "Sáng"}</p>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

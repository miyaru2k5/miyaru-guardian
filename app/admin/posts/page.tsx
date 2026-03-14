import PostsList from "@/components/admin/posts/PostsList";

const PAGE_TITLE = "Quản lý Tin tức";
const PAGE_DESC =
  "Tạo, chỉnh sửa và cập nhật nội dung cho trang tin tức của hệ thống.";

export default function AdminPostsPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">{PAGE_TITLE}</h1>
        <p className="text-sm text-muted-foreground">{PAGE_DESC}</p>
      </header>

      <PostsList />
    </section>
  );
}
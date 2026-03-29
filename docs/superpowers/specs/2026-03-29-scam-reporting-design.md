# Scam Reporting & Banner System Design

## 1. Mục Tiêu (Purpose)
Xây dựng tính năng "Kiểm tra & Tố cáo Scam" phục vụ người dùng tố cáo lừa đảo. Tích hợp hệ thống tìm kiếm (Search Index) siêu nhanh, tối ưu hóa lưu trữ hình ảnh qua luồng nén WebP Client-side, và quan trọng nhất là tạo không gian gắn Banner Quảng cáo cho các Shop/Web sinh lời.

## 2. Kiến Trúc Dữ Liệu (Database Schema)
Hệ thống sử dụng **Supabase (PostgreSQL)** để lưu trữ với các bảng chính:
- **`ScamReports`**: `id`, `scammer_name`, `total_scam_amount`, `description`, `type` (đăng hộ / bị scam), `original_post_url`, `reporter_contact_name`, `reporter_contact_zalo`, `status` (pending/approved/rejected), `created_at`, `slug`.
- **`ScamMedia`**: `id`, `report_id`, `url` (đường dẫn R2/S3).
- **`ScamSocials`**: `id`, `report_id`, `platform_name`, `platform_url`, `username`, `user_url`.
- **`ScamBanks`**: `id`, `report_id`, `bank_name`, `account_name`, `account_number`.
- **`ScamWebsites`**: `id`, `report_id`, `website_name`, `url`, `domain`.
- **`Banners`**: `id`, `title`, `image_url`, `link`, `position` (header, sidebar, inline), `is_active`, `start_date`, `end_date`.

## 3. Kiến Trúc Tìm Kiếm (Search Index)
- **Giải pháp**: PostgreSQL Full Text Search kết hợp `pg_trgm` (Trigram Index).
- **Cách thức**: Tạo một Database Function / Materialized View hoặc Trigger gộp các trường `account_number` (STK), `domain` (Tên miền), `username` (MXH), và `scammer_name` thành một trường `search_vector`.
- **Hiệu năng**: Cho phép Next.js query Partial Match (gõ một phần số tài khoản) hoặc Full Text Search với tốc độ phản hồi tính bằng mili-giây, không tốn kém chi phí dịch vụ bên ngoài như Algolia/Meilisearch.

## 4. Kiến Trúc Upload Ảnh (WebP & R2/S3)
- **Nén tại Client (Browser)**: Sử dụng thư viện `browser-image-compression`, ảnh của người dùng tải lên sẽ được chuyển sang `.webp` và nén tối ưu ngay trên trình duyệt.
- **Upload Trực Tiếp**: Trình duyệt gọi Next.js Route (`/api/upload/presigned`) lấy Pre-signed URL tạm thời, sau đó tải file thẳng lên Cloudflare R2 / AWS S3. 
- **Lợi ích**: Zero CPU/RAM overhead cho Next.js server, băng thông đẩy thẳng qua S3, ảnh siêu nhẹ tiết kiệm storage.

## 5. Quy Trình Duyệt và SEO/Caching
- **Quản trị (Admin)**: Các báo cáo gửi lên có trạng thái `pending`. Quản trị viên sử dụng UI để kiểm duyệt (`approved`).
- **Caching & Hiển Thị**:
  - Trang chủ tìm kiếm (`/check-uy-tin`): Dùng Next.js Server Components với `Suspense` hỗ trợ stream dữ liệu Top Scam, sử dụng Data Cache (`revalidate: 60s`).
  - Trang chi tiết (`/scamer/[slug]`): Dùng Incremental Static Regeneration (ISR). Các trang chi tiết sẽ được build dạng tĩnh HTML, giúp Google Index ngay lập tức với tốc độ tải trang cực nhanh.
- **Phân Phối Quảng Cáo**: Banners được chèn cố định ở Layout chung và xen kẽ các báo cáo Scam để tối đa lượt click.

/**
 * Map Supabase Auth errors to Vietnamese messages.
 * Passwords live in auth.users (Supabase Auth), not profiles.
 */
export function getAuthErrorMessage(
  error: { message?: string; code?: string } | null
): string {
  if (!error) return "Đã xảy ra lỗi";
  const msg = (error.message || "").toLowerCase();
  const code = error.code || "";

  if (msg.includes("invalid login credentials") || code === "invalid_credentials")
    return "Email hoặc mật khẩu không đúng";
  if (msg.includes("email not confirmed") || code === "email_not_confirmed")
    return "Vui lòng xác thực email trước khi đăng nhập";
  if (msg.includes("user not found")) return "Tài khoản không tồn tại";
  if (msg.includes("weak password") || code === "weak_password")
    return "Mật khẩu quá yếu. Thử mật khẩu dài hơn, có chữ hoa, số và ký tự đặc biệt";
  if (msg.includes("password") && msg.includes("leaked"))
    return "Mật khẩu này đã bị rò rỉ. Vui lòng chọn mật khẩu khác";
  if (
    msg.includes("user already registered") ||
    msg.includes("already been registered")
  )
    return "Email này đã được đăng ký. Vui lòng đăng nhập";
  if (msg.includes("signup_disabled"))
    return "Chức năng đăng ký tạm thời bị vô hiệu hóa";
  if (msg.includes("forbidden") || msg.includes("disabled"))
    return "Tài khoản đã bị vô hiệu hóa";
  if (msg.includes("too many requests") || code === "over_request_rate_limit")
    return "Quá nhiều yêu cầu. Vui lòng thử lại sau vài phút";
  if (msg.includes("network") || msg.includes("fetch"))
    return "Lỗi kết nối mạng. Kiểm tra internet và thử lại";

  return error.message || "Đã xảy ra lỗi";
}

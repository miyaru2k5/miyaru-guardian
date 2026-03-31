import { describe, it, expect } from "vitest";
import { getAuthErrorMessage } from "../authErrors";

describe("getAuthErrorMessage", () => {
  it("returns default message for null error", () => {
    expect(getAuthErrorMessage(null)).toBe("Đã xảy ra lỗi");
  });

  it("handles invalid credentials", () => {
    expect(getAuthErrorMessage({ message: "Invalid login credentials" })).toBe(
      "Email hoặc mật khẩu không đúng"
    );
    expect(getAuthErrorMessage({ code: "invalid_credentials" })).toBe(
      "Email hoặc mật khẩu không đúng"
    );
  });

  it("handles email not confirmed", () => {
    expect(getAuthErrorMessage({ message: "Email not confirmed" })).toBe(
      "Vui lòng xác thực email trước khi đăng nhập"
    );
  });

  it("handles weak password", () => {
    expect(getAuthErrorMessage({ message: "weak password" })).toBe(
      "Mật khẩu quá yếu. Thử mật khẩu dài hơn, có chữ hoa, số và ký tự đặc biệt"
    );
  });

  it("handles leaked password", () => {
    expect(getAuthErrorMessage({ message: "Password has been leaked" })).toBe(
      "Mật khẩu này đã bị rò rỉ. Vui lòng chọn mật khẩu khác"
    );
  });

  it("handles already registered", () => {
    expect(getAuthErrorMessage({ message: "User already registered" })).toBe(
      "Email này đã được đăng ký. Vui lòng đăng nhập"
    );
  });

  it("handles rate limiting", () => {
    expect(getAuthErrorMessage({ message: "Too many requests" })).toBe(
      "Quá nhiều yêu cầu. Vui lòng thử lại sau vài phút"
    );
  });

  it("handles network errors", () => {
    expect(getAuthErrorMessage({ message: "Network request failed" })).toBe(
      "Lỗi kết nối mạng. Kiểm tra internet và thử lại"
    );
  });

  it("returns original message for unknown errors", () => {
    expect(getAuthErrorMessage({ message: "Unknown error" })).toBe("Unknown error");
  });
});

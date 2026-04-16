import { ReactNode } from "react";
import "./globals.css";

import Providers from "./providers";
import InitialLoader from "@/components/InitialLoader";

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL!;
const WEBSITE_TITLE = process.env.NEXT_PUBLIC_WEBSITE_TITLE!;

export const metadata = {
  metadataBase: new URL(WEBSITE_URL),

  title: {
    default: WEBSITE_TITLE,
    template: `%s | ${WEBSITE_TITLE}`,
  },

  description:
    "Giao dịch viên uy tín, minh bạch. Xác thực rõ ràng, an toàn tuyệt đối.",

  icons: {
    icon: "/seo-preview.png",
  },

  openGraph: {
    title: WEBSITE_TITLE,
    description:
      "Giao dịch minh bạch – xác thực rõ ràng.",
    url: WEBSITE_URL,
    siteName: WEBSITE_TITLE,
    images: [
      {
        url: "/seo-preview.png",
        width: 1200,
        height: 630,
        alt: WEBSITE_TITLE,
      },
    ],
    locale: "vi_VN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: WEBSITE_TITLE,
    description:
      "Hệ thống kiểm tra và quản lý admin giao dịch trung gian.",
    images: ["/seo-preview.png"],
  },
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-background text-foreground">
        <InitialLoader />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;

import { ReactNode } from "react";
import "./globals.css";

import Providers from "./providers";
import InitialLoader from "@/components/InitialLoader";

export const metadata = {
  title: "Miyaru Guardian",
  description: "Secure trading platform managed through Supabase",
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

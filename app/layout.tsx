import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CODELFA PARTNERS | Private Business Portal",
  description: "بوابة CODELFA الخاصة لإدارة ومتابعة الشراكة التجارية.",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "CODELFA" },
  applicationName: "CODELFA PARTNERS",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}

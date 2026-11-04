import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./theme.css";

export const metadata: Metadata = {
  title: "CODELFA PARTNERS",
  description: "Private business partnership portal",
  applicationName: "CODELFA PARTNERS",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "CODELFA", statusBarStyle: "black-translucent" },
  icons: {
    icon: [{ url: "/codelfa-icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07172c"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}

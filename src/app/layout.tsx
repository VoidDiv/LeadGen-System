/* ============================================================
   FILE: app/layout.tsx   (REPLACE whole file)
   NEW: app icons, iPhone home-screen settings, the safe-area setting
   (viewportFit "cover") and <RegisterSW /> for the installable app.
   The manifest is linked automatically from app/manifest.ts.
   ============================================================ */

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import AppShell from "@/components/layout/AppShell";
import RegisterSW from "@/components/pwa/RegisterSW";

const sans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GFI Lead Dashboard",
    template: "%s | GFI Lead Dashboard",
  },
  description: "Lead and content tracker for GFI Armed Forces Division social media",
  applicationName: "GFI Leads",
  // Private admin tool: keep it out of search results.
  robots: { index: false, follow: false },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  // iPhone / iPad: opens full screen from the Home Screen icon, named "GFI Leads"
  appleWebApp: {
    capable: true,
    title: "GFI Leads",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Matches the navy sidebar and mobile header, so phone browser bars blend in.
  themeColor: "#15223b",
  colorScheme: "light",
  // Lets the header and bottom menu stay clear of the notch and the home bar (see MobileNav)
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <body className="min-h-screen font-sans">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
        <RegisterSW />
      </body>
    </html>
  );
} 
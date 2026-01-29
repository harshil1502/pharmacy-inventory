import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { PWARegister } from "@/components/pwa-register";

export const metadata: Metadata = {
  title: "PharmSync - Pharmacy Inventory Management",
  description: "Multi-store pharmacy inventory management with real-time updates and medication transfer requests",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PharmSync",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    shortcut: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased font-sans">
        <PWARegister />
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}

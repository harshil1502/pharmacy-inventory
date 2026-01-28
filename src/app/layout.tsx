import type { Metadata } from "next";
import "./globals.css";
import "./globals.scss";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "PharmSync - Pharmacy Inventory Management",
  description: "Multi-store pharmacy inventory management with real-time updates and medication transfer requests",
  themeColor: "#E12F29",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#E12F29" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased font-sans">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}

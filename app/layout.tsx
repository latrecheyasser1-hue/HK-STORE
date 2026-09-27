import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HK STORE Chlef | Montres, Parfums & Coffrets Cadeaux de Luxe",
  description: "Boutique en ligne officielle HK STORE Chlef. Horlogerie de prestige, coffrets cadeaux VIP, parfumerie et accessoires. Livraison rapide 58 Wilayas avec paiement à la livraison après inspection.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "HK STORE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="bg-[#f9f9ff] text-[#141b2b] min-h-screen flex flex-col font-sans selection:bg-[#000000] selection:text-[#ffffff]">
        {children}
      </body>
    </html>
  );
}

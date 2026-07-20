import type { Metadata } from "next";
import { Sansita, Plus_Jakarta_Sans } from "next/font/google";
import SessionProvider from "@/components/providers/SessionProvider";
import JsonLd from "@/components/JsonLd";
import "./globals.css";

const sansita = Sansita({
  variable: "--font-sansita",
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "PARSTAMA – PMR SMKN 1 Singosari",
    template: "%s | PARSTAMA SMKN 1 Singosari",
  },
  description: "Palang Merah Remaja PARSTAMA - SMKN 1 Singosari. Pendaftaran online, blog kesehatan, kalender kegiatan, dan AI Assistant.",
  metadataBase: new URL("https://parstama.my.id"),
  openGraph: {
    title: "PARSTAMA – PMR SMKN 1 Singosari",
    description: "Palang Merah Remaja PARSTAMA - SMKN 1 Singosari. Pendaftaran online, blog kesehatan, kalender kegiatan, dan AI Assistant.",
    siteName: "PARSTAMA SMKN 1 Singosari",
    locale: "id_ID",
    type: "website",
    url: "https://parstama.my.id",
    images: [{ url: "/parstama_logo.png", width: 512, height: 512, alt: "PARSTAMA Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PARSTAMA – PMR SMKN 1 Singosari",
    description: "Palang Merah Remaja PARSTAMA - SMKN 1 Singosari. Pendaftaran online, blog kesehatan, kalender kegiatan, dan AI Assistant.",
    images: ["/parstama_logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    other: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${sansita.variable} ${plusJakartaSans.variable}`}
    >
      <body className="font-body antialiased">
        <JsonLd />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

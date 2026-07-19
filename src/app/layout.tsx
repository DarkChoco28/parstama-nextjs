import type { Metadata } from "next";
import { Sansita, Plus_Jakarta_Sans } from "next/font/google";
import SessionProvider from "@/components/providers/SessionProvider";
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
    siteName: "PARSTAMA SMKN 1 Singosari",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/parstama_logo.png",
  },
  manifest: "/manifest.json",
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
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

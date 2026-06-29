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
  metadataBase: new URL("https://parstama.my.id"),
  title: "PARSTAMA – PMR SMKN 1 Singosari",
  description: "Sistem Pendaftaran Palang Merah Remaja PARSTAMA - SMKN 1 Singosari",
  openGraph: {
    title: "PARSTAMA – PMR SMKN 1 Singosari",
    description: "Sistem Pendaftaran Palang Merah Remaja PARSTAMA - SMKN 1 Singosari",
    siteName: "PARSTAMA",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PARSTAMA - PMR SMKN 1 Singosari",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PARSTAMA – PMR SMKN 1 Singosari",
    description: "Sistem Pendaftaran Palang Merah Remaja PARSTAMA - SMKN 1 Singosari",
    images: ["/og-image.png"],
  },
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

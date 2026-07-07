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
  title: "PARSTAMA – PMR SMKN 1 Singosari",
  description: "Sistem Pendaftaran Palang Merah Remaja PARSTAMA - SMKN 1 Singosari",
  icons: {
    icon: "/parstama_logo.png",
    apple: "/parstama_logo.png",
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

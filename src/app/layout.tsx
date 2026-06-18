import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "H2Age – Vodíková energetická síť",
  description:
    "Inteligentní síť vodíkových elektráren pro ukládání přebytků energie a stabilizaci české energetické sítě. Zhodnoťte přebytky energie z vaší domácnosti nebo firmy.",
  keywords: ["vodík", "elektrárna", "přebytky energie", "OZE", "energetika", "ČR"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-white text-gray-900`}>
        {children}
      </body>
    </html>
  );
}

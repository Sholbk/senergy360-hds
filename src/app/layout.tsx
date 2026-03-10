import type { Metadata } from "next";
import { Poppins, Anton, Inter } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "SENERGY360 — Healthy Home Design & Construction",
  description: "Full-service healthy home design, architecture, and construction firm. Integrating building science, engineering, and advanced wall systems to create homes that support human health.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${anton.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

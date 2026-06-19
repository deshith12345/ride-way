import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components/shared/Providers";
import AppChrome from "@/components/shared/AppChrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RideWay - Book Bus Tickets Online in Sri Lanka",
  description: "Book bus tickets online across Sri Lanka with RideWay. Search routes, select seats, and pay securely. Real-time tracking, e-tickets, and hassle-free travel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Providers>
          <AppChrome>
            {children}
          </AppChrome>
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import AppNavbar from "@/components/app-navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Comentarios App",
    template: "%s | Comentarios App",
  },
  description:
    "Plataforma web creada con Next.js y Supabase para comentarios, interacción y futuros proyectos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <AppNavbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
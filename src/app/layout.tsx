
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.scss";
import { Header } from "./components/Header";
import { createContext } from "react";
import { UserProvider } from "./components/contexts/user-provider";
import { Inter } from 'next/font/google'
import { inter, oswald, poppins } from "./fonts";
import { MetaPixel } from "./components/MetaPixel";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});


const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Motiva Bolsas",
  description: "Programa de Bolsas de Descontos para Universidades",
  openGraph: {
    title: "Motiva Bolsas",
    description: "Confira nossas ofertas incríveis!",
    url: "https://motivabolsas.com.br",
    siteName: "Motiva Bolsas",
    locale: "pt_BR",
    type: "website",
  },
  metadataBase: new URL("https://motivabolsas.com.br"),
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <MetaPixel />
      </head>
      <UserProvider>
        <body className={`${inter.variable} antialiased`}>
          <Header />
          <main>
            {children}
          </main>
        </body>
      </UserProvider>
    </html>
  );
}

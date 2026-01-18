import type { Metadata } from "next";
import {Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import "@/styles/style.scss";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { SITE_TITLE, SITE_DESCRIPTION } from "@/lib/constants";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400","500","600", "700","900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.className}`}>
         <Header />
        {children}
        <Footer/>
      </body>
    </html>
  );
}

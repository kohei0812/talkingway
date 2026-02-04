import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import "@/styles/style.scss";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { SITE_TITLE, SITE_DESCRIPTION, SITE_URL } from "@/lib/constants";
import Script from 'next/script';

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_TITLE}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ["FF14", "FFXIV", "ファイナルファンタジー14", "有料対話店", "RP", "ロールプレイ", "カフェ", "トーキングウェイ"],
  authors: [{ name: "トーキングウェイ" }],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: SITE_URL,
    siteName: SITE_TITLE,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/ogp.jpg",
        width: 1200,
        height: 630,
        alt: SITE_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/ogp.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.className}`}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-92K5W7CY9H"
          strategy="afterInteractive"
        />
        <Script id="ga" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-92K5W7CY9H');
          `}
        </Script>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

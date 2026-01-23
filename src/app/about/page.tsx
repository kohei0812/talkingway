// src/app/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SITE_TITLE, SITE_URL } from "@/lib/constants";

export const dynamic = "force-static"; // これで静的化（SSRに寄せない）
export const revalidate = false; // 再生成しない（完全固定）

export const metadata: Metadata = {
  title: "このサイトについて",
  description: `${SITE_TITLE}の説明ページです。有料対話店とは何か、サイトの使い方、掲載情報についてご紹介します。`,
  openGraph: {
    title: `このサイトについて | ${SITE_TITLE}`,
    description: `${SITE_TITLE}の説明ページです。有料対話店とは何か、サイトの使い方、掲載情報についてご紹介します。`,
    url: `${SITE_URL}/about`,
  },
};

export default function AboutPage() {
  return (
    <main id="about">
      <Image
        className="main-bg"
        src="/main-bg.png"
        alt="背景"
        width={1175}
        height={453}
      />
      {/* page-header */}
      <section id="page-header">
        <div className="hero-container">
          <h1 className="hero-ttl">このサイトについて</h1>
        </div>
      </section>

      <section className="about">
        <div className="about-container">
          <p>
            ファイナルファンタジーXIVの有料対話店を一覧表示・検索できるようにまとめたサイトです。
          </p>
          <h2>{SITE_TITLE}って何？</h2>
          <p>「有料対話店ってどんなどころ？」「{SITE_TITLE}は何？」<br />
            そんな疑問にお応えするSS漫画を<br className="sp_only" />ご覧ください。
          </p>
          <Image
            src="/manga01.jpg"
            alt="漫画"
            width={860}
            height={1200}
          />
          <Image
            src="/manga02.JPG"
            alt="漫画"
            width={860}
            height={1200}
          />
          <Image
            src="/manga03.JPG"
            alt="漫画"
            width={860}
            height={1200}
          />
          <p className="end">サイトデザイン&漫画制作：
            <Link href="https://x.com/taka_benkyou" target="_blank">
              @taka_benkyou
            </Link>
          </p>
          <h2>掲載情報について</h2>
          <ul>
            <li>
              掲載情報は
              <Link href="https://docs.google.com/spreadsheets/d/1KT7hkj4io88d0Vp0ia2jpeye5Y6g-OhyzJzZtr4S7pc/edit" target="_blank">
                【FF14】有料対話店一覧
              </Link>
              の転載（自動連携）にて表示しています。
            </li>
            <li>営業時間を含む掲載内容は実際と異なる場合があります。最新の情報は各公式情報をご確認ください。</li>
            <li>
              情報提供・不備・ご意見は
              <Link href="https://x.com/Talkingway_XIV?s=20" target="_blank">
                @Talkingway_XIV
              </Link>へDMか<br />スプレッドシートにある投稿フォームに入力お願いします。
            </li>
          </ul>
          <h2>参考リンク</h2>
          <p>カフェ・Barを含むお店一覧は<Link href="https://www.14-store-log.com/" target="_blank">14すとあログ</Link>をご参照ください。</p>
          <h2>スペシャルサンクス</h2>
          <p>ヘッダーSSのハウジングは<Link href="https://x.com/HitoShizuku39" target="_blank">
            @HitoShizuku39
          </Link>さんに制作いただきました！🙇
          </p>
          <p>ロゴ・ローディングアニメーションは
            <Link href="https://tokidokiame.com/galleryhouse/" target="_blank">
              フリー素材サイトギャラリーハウス
            </Link>様より利用させていただいています。
          </p>
          <h2>お問い合わせ</h2>
          <p>
            サイトの不具合・お問い合わせ・Web制作のご依頼は
            <Link href="https://x.com/Tea_B_FF14" target="_blank">
              @Tea_B_FF14
            </Link>
            までお願いします。<br />
            無償・有志での運営のため、受け付けたご意見への返信・反映をご約束できないことをご容赦ください。
          </p>
        </div>
      </section>
      <Link className="totop" href="/">トップへ戻る</Link>
    </main>
  );
}

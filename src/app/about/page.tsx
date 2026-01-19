// src/app/about/page.tsx
import Link from "next/link";
import Image from "next/image";
import { SITE_TITLE } from "@/lib/constants";
export const dynamic = "force-static"; // これで静的化（SSRに寄せない）
export const revalidate = false; // 再生成しない（完全固定）

export default function AboutPage() {
  return (
    <main id="about">
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
          <h2>掲載情報について</h2>
          <ul>
            <li>
              掲載情報は
              <Link href="https://docs.google.com/spreadsheets/d/1KT7hkj4io88d0Vp0ia2jpeye5Y6g-OhyzJzZtr4S7pc/edit" target="_blank">
                【FF14】有料対話店一覧
              </Link>
              の転載（自動連携）にて表示しています。
            </li>
            <li>営業中判定を含む掲載内容は実際と異なる場合があります。最新の情報は各公式情報をご確認ください。</li>
            <li>
              情報提供・不備・ご意見は
              <Link href="https://x.com/Talkingway_XIV?s=20" target="_blank">
                @Talkingway_XIV
              </Link>へDMかスプレッドシートにある投稿フォームに入力お願いします。
            </li>
          </ul>
          <h2>お問い合わせ</h2>
          <p>
            サイトの不具合・お問い合わせ・Web制作のご依頼は
            <Link href="https://x.com/Tea_B_FF14" target="_blank">
              @Tea_B_FF14
            </Link>
            までお願いします。<br />
            無償・有志での運営のため、受け付けたご意見への返信・反映をご約束できないことをご容赦ください。
          </p>
          <h2>参考リンク</h2>
          <p>カフェ・Barを含むお店一覧は<Link href="https://www.14-store-log.com/" target="_blank">14すとあログ</Link>をご参照ください</p>
          <h2>スペシャルサンクス</h2>
          <p>ヘッダーSSのハウジング制作→<Link href="https://x.com/HitoShizuku39" target="_blank">
            ひとしずく💧@FFXIV垢
          </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

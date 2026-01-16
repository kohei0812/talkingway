// src/app/about/page.tsx
import Link from "next/link";
import Image from "next/image";
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

      <section className="content">
        <p>
          このサイトは、お店情報を一覧・検索できるようにまとめたものです。
        </p>

        <h2>掲載情報について</h2>
        <p>
          掲載内容は更新タイミングにより実際と異なる場合があります。最新情報は各公式情報をご確認ください。
        </p>

        <h2>お問い合わせ</h2>
        <p>
          何かあれば X / お問い合わせ先など（ここは後で差し替え）へお願いします。
        </p>
      </section>
    </main>
  );
}

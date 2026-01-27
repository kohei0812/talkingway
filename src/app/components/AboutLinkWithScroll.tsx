"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AboutLinkWithScroll() {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const winH = window.innerHeight;
      const scroll = window.scrollY;
      // 1画面分スクロールしたら active 付与
      if (scroll > winH) {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    };

    // 初回実行
    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Link href="/about" className={`about-link ${isActive ? "active" : ""}`}>
      <Image
        className="about-link__babble"
        src="/babble.PNG"
        alt="このサイトについて"
        width={576}
        height={162}
      />
      <Image
        className="about-link__icon"
        src="/talkingway.PNG"
        alt="トーキングウェイのアイコン"
        width={617}
        height={618}
      />
    </Link>
  );
}

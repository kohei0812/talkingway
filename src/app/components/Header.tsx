"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Header() {
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

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const handleScrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    return (
        <>
        <div
            id="totop"
            className={`totop eng ${isActive ? "active" : ""}`}
            onClick={handleScrollToTop}
        >
            TOP
        </div>
        <header id="header" className="header">
            <Link href="/" className="header-logo">
                <h1 className="header-ttl">
                    <Image
                        src="/logo.svg"
                        alt="サイトタイトル"
                        width={56}
                        height={56}
                    />
                    サイトタイトル
                </h1>
            </Link>
        </header>
        </>
    );

}
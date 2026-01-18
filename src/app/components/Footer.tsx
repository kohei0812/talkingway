import Link from "next/link";
import Image from "next/image";
import { SITE_TITLE } from "@/lib/constants";

export default function Footer() {
    const year = new Date().getFullYear();
    return (
        <footer id="footer">
            <p className="footer-copy">&copy;{year} {SITE_TITLE} All rights reserved.<br />
            ファイナルファンタジーXIVに関するすべての著作権は株式会社スクウェア・エニックスに帰属します。
            </p>
        </footer>
    );

}
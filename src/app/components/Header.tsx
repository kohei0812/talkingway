import Link from "next/link";
import Image from "next/image";

export default function Header() {
    return (
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
    );

}
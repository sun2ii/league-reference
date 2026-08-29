import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LOL Ref",
  description: "Quick reference for League of Legends champions, items, and runes",
  icons: {
    icon: "/league-icon.ico",
  },
};

function Nav() {
  return (
    <nav className="border-b border-zinc-800 px-4 py-3 bg-zinc-900">
      <div className="max-w-7xl mx-auto flex items-center gap-6">
        <Link
          href="/"
          className="text-yellow-400 font-bold text-lg hover:text-yellow-300 transition-colors cursor-pointer"
        >
          LOL REF
        </Link>
        <div className="flex gap-4">
          <Link
            href="/champions"
            className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
          >
            Champions
          </Link>
          <Link
            href="/items"
            className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
          >
            Items
          </Link>
          <Link
            href="/runes"
            className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
          >
            Runes
          </Link>
          <Link
            href="/map"
            className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
          >
            Map
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-900 text-zinc-100">
        <Nav />
        {children}
      </body>
    </html>
  );
}

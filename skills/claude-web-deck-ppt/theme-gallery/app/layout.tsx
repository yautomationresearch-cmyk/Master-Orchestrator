import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeCustomizeProvider } from "./components/ThemeCustomize";
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
  title: "Theme Gallery · Content System",
  description:
    "Preview deck themes live, customize fonts and colors, then copy a build instruction.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${geistSans.className} antialiased`}>
        <ThemeCustomizeProvider>{children}</ThemeCustomizeProvider>
      </body>
    </html>
  );
}

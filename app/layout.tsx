import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "选题种子库",
  description: "把零散文献与灵感孵化成研究方向"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

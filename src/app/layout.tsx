import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cartly",
  description: "Minimal shopping list PWA",
  icons: {
    icon: "/favicon.ico",
  },
  // Add this:
  other: {
    "google-font": `<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&display=swap" rel="stylesheet" />`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}

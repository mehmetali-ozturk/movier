import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Movier - Bir Sonraki Favori Filmini Keşfet",
  description: "Filmleri kaydırarak keşfet ve favorilerini bul",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="tr">
        <body className="antialiased" suppressHydrationWarning>
        {children}
        </body>
        </html>
    );
}
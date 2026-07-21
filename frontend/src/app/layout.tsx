import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3, Archivo_Narrow } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const archivoNarrow = Archivo_Narrow({
  variable: "--font-archivo-narrow",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PrajaNeeti",
  description: "Track government activities, spending, and join the discussion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${sourceSans.variable} ${archivoNarrow.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground`}
      >
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}

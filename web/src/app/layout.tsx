import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const lora = Lora({ variable: "--font-lora", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Erzählfeuer",
  description: "Pen & Paper online – wo die Geschichte im Mittelpunkt steht.",
};

export const viewport: Viewport = {
  themeColor: "#1b1412",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body className={`${inter.variable} ${lora.variable} flex flex-col antialiased`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

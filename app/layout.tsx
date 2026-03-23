import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Tiqui — Tu entrada al momento",
    template: "%s | Tiqui",
  },
  description:
    "Descubre y compra entradas para los mejores eventos cerca de ti. Fiestas, conciertos, talleres y mas.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    siteName: "Tiqui",
    locale: "es_CL",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=general-sans@600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "var(--color-surface)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "var(--color-texto)",
            },
          }}
        />
      </body>
    </html>
  );
}

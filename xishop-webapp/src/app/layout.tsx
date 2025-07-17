import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "xishop - Your Modern Game Store Platform",
  description: "Create and manage your game server's item shop with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <main className="min-h-screen bg-background text-foreground">
            {children}
          </main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
} 
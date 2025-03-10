import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils"
const inter = Inter({ subsets: ["latin"] });
import { Toaster } from "sonner";
import { Providers } from '../provider/providers';

export const metadata: Metadata = {
  title: "Mixify",
  description: "Created by Lukas Čiesna",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("bg-background", inter.className )}><Providers>{children}</Providers>
      <Toaster richColors />
      </body>
    </html>
  );
}

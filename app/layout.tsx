import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils"
const inter = Inter({ subsets: ["latin"] });
import { Toaster } from "sonner";

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
      <body className={cn("bg-background", inter.className )}>{children}
      <Toaster richColors />
      </body>
    </html>
  );
}

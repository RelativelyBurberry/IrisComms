import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { BackendSync } from "@/components/BackendSync";
import { GazeController } from "@/components/GazeController";
import { Toaster } from "@/components/ui/sonner";

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-space"
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

export const viewport: Viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "IrisComm - AI Eye Controlled Communication",
  description: "Revolutionary AI-powered assistive communication platform that converts eye movements into text and speech",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "IrisComm",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} ${inter.variable} font-sans antialiased`}>
        {children}
        <BackendSync />
        <GazeController />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

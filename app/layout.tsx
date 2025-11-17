import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthKitProvider } from "@workos-inc/authkit-nextjs/components";
import { Sidebar } from "@/components/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Workout Coach - Your Personal Fitness Assistant",
  description: "Chat with your AI fitness coach and achieve your workout goals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthKitProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 lg:ml-(--sidebar-width,256px) transition-all duration-300">
              {children}
            </main>
          </div>
        </AuthKitProvider>
      </body>
    </html>
  );
}

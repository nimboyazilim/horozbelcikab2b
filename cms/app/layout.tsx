import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthWrapper } from "./components/auth-wrapper";
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { ProgressProvider } from "./components/progress-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Horoz Europe - CMS",
  description: "Horoz Europe - CMS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
        attribute="class"
        defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ProgressProvider>
            <SidebarProvider>
              <AuthWrapper>{children}</AuthWrapper>
            </SidebarProvider>
            <Toaster />
          </ProgressProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

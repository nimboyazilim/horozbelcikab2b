import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../globals.css";
import Script from "next/script";


import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import { AuthWrapper } from "@/components/others/auth-wrapper";
import { CartProvider } from "@/context/cartContext";
//import { Toaster } from "@/components/ui/toaster"
import { Toaster } from "react-hot-toast";
import ConsentScript from "@/components/googleTag/contentScript";
import CookieConsentBanner from "@/components/googleTag/contentBanner";
import PopupModal from "@/components/popup/PopupModal";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400","500","600","700"]
});

export const metadata: Metadata = {
  title: "Horoz Europe",
  description: "Horoz Europe",
};

export default async function RootLayout({
  children,params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>
}>) {
  
  const locale = (await params).locale
   // Ensure that the incoming `locale` is valid
   if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <head>
        <ConsentScript />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5XTKSXFCFH"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5XTKSXFCFH');
          `}
        </Script>
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "swrd9fhyo2");
          `}
        </Script>
      </head>
      <body className={`${poppins.variable} font-poppins antialiased`}>
        <NextIntlClientProvider messages={messages}>
        <CartProvider>
          <AuthWrapper>
              <PopupModal />
              {children}
            </AuthWrapper>
          </CartProvider>
          <Toaster position="top-center" />
          <CookieConsentBanner /> 
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

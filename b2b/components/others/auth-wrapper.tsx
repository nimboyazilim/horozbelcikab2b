'use client'

import { useContext } from 'react'
import { usePathname } from 'next/navigation'
import Header from '@/components/header/header';
import Footer from "@/components/footer/footer";
export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login' || pathname === '/ru/login' || pathname === '/en/login'
  const isCartPage = pathname.startsWith('/en/cart/') || 
                    pathname.startsWith('/sepet/') ||
                    pathname.startsWith('/ru/cart/') ||
                    pathname.startsWith('/yeni-bayi') ||
                    pathname.startsWith('/en/new-dealer') ||
                    pathname.startsWith('/ru/new-dealer')
  const isMaintenancePage = pathname.includes('/maintenance') || 
                           pathname.includes('/bakim') ||
                           pathname.includes('/mentenanta') ||
                           pathname.includes('/obsluzhivanie')

  //console.log(isCartPage)
  return (
    <>
      {!isLoginPage && !isCartPage && !isMaintenancePage && <Header />}
        {children}
      {!isLoginPage && !isCartPage && !isMaintenancePage && <Footer />}
    </>
  );
} 
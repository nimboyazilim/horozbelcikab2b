'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AppSidebar } from './app-sidebar'
import Header from './header'
import api from '@/services/api'
import { API_ENDPOINTS } from '@/config/api'

function decodeJWTId(token: string): string | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
    const payload = JSON.parse(atob(padded))
    return payload?.id ?? null
  } catch {
    return null
  }
}

function extractAllLinks(menus: any[]): string[] {
  const links: string[] = []
  for (const menu of menus) {
    if (menu.menu_link !== undefined && menu.menu_link !== null) {
      links.push(String(menu.menu_link))
    }
    if (menu.alt_menuler?.length) {
      links.push(...extractAllLinks(menu.alt_menuler))
    }
  }
  return links
}

function isPathPermitted(pathname: string, permittedLinks: string[]): boolean {
  const normalized = pathname.replace(/^\//, '')
  const firstSegment = normalized.split('/')[0]

  // Kök yol her zaman açık — sayfa içeriği dashboard yetkisine göre kendisi karar verir
  if (firstSegment === '') return true

  // Profil sayfası tüm kullanıcılar için açık
  if (firstSegment === 'profil') return true

  return permittedLinks.some(link => {
    const linkSegment = link.replace(/^\//, '').split('/')[0]
    return linkSegment === firstSegment
  })
}

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  const [status, setStatus] = useState<'loading' | 'permitted' | 'denied'>('loading')

  useEffect(() => {
    if (isLoginPage) {
      setStatus('permitted')
      return
    }

    const accessToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('accessToken='))
      ?.split('=')[1]

    if (!accessToken) {
      setStatus('denied')
      return
    }

    const userId = decodeJWTId(accessToken)
    if (!userId) {
      setStatus('denied')
      return
    }

    api.get(API_ENDPOINTS.menulerListe2 + userId)
      .then(response => {
        const menus = response.data || []
        const links = extractAllLinks(menus)
        setStatus(isPathPermitted(pathname, links) ? 'permitted' : 'denied')
      })
      .catch(() => setStatus('denied'))
  }, [pathname, isLoginPage])

  if (isLoginPage) {
    return <main className="flex-1">{children}</main>
  }

  if (status === 'loading') {
    return (
      <>
        <AppSidebar />
        <div className="flex flex-col w-full">
          <Header />
          <main className="flex-1 p-6">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          </main>
        </div>
      </>
    )
  }

  if (status === 'denied') {
    return (
      <>
        <AppSidebar />
        <div className="flex flex-col w-full">
          <Header />
          <main className="flex-1 p-6">
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
              <h1 className="text-8xl font-bold text-muted-foreground/30">404</h1>
              <p className="text-lg text-muted-foreground">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
            </div>
          </main>
        </div>
      </>
    )
  }

  return (
    <>
      <AppSidebar />
      <div className="flex flex-col w-full">
        <Header />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </>
  )
}

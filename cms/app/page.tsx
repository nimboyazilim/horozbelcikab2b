'use client'

import { useEffect, useState } from 'react'
import Cart1 from "./components/dashboard/cart1"
import Cart2 from "./components/dashboard/cart2"
import Cart3 from "./components/dashboard/cart3"
import Grafik1 from "./components/dashboard/grafik1"
import Cart4 from "./components/dashboard/cart4"
import Cart5 from "./components/dashboard/cart5"
import Cart6 from "./components/dashboard/cart6"
import api from '@/services/api'
import { API_ENDPOINTS } from '@/config/api'

function decodeJWTId(token: string): string | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
    const payload = JSON.parse(decodeURIComponent(escape(atob(padded))))
    return payload?.id ? String(payload.id) : null
  } catch {
    return null
  }
}

function hasDashboardPermission(menus: any[]): boolean {
  for (const menu of menus) {
    const name = String(menu.menu_adi ?? '').toLowerCase().trim()
    if (name === 'dashboard') return true
    if (menu.alt_menuler?.length && hasDashboardPermission(menu.alt_menuler)) return true
  }
  return false
}

export default function Home() {
  const [hasDashboard, setHasDashboard] = useState<boolean | null>(null)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const accessToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('accessToken='))
      ?.split('=')[1]

    if (!accessToken) {
      setHasDashboard(false)
      return
    }

    try {
      const parts = accessToken.split('.')
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
      const payload = JSON.parse(decodeURIComponent(escape(atob(padded))))
      if (payload?.adsoyad) setUserName(payload.adsoyad)
    } catch {}

    const userId = decodeJWTId(accessToken)
    if (!userId) {
      setHasDashboard(false)
      return
    }

    api.get(API_ENDPOINTS.menulerListe2 + userId)
      .then(response => {
        setHasDashboard(hasDashboardPermission(response.data || []))
      })
      .catch(() => setHasDashboard(false))
  }, [])

  if (hasDashboard === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!hasDashboard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
        <h1 className="text-3xl font-bold">
          Hoş Geldiniz{userName ? `, ${userName}` : ''}!
        </h1>
        <p className="text-muted-foreground max-w-sm">
          Panele başarıyla giriş yaptınız. Soldaki menüden yetkili olduğunuz bölümlere erişebilirsiniz.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-5">Dashboard</h1>
      <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Cart1 />
        <Cart2 />
        <Cart3 />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-5">
        <Grafik1 />
        <Cart4 />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-5">
        <Cart5 />
        <Cart6 />
      </div>
    </div>
  )
}

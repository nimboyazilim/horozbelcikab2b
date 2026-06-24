export interface LogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  category: string;
  status: 'basarili' | 'basarisiz';
  errorMessage?: string;
}

function decodeJWTPayload(token: string): { id?: string; adsoyad?: string; eposta?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    const utf8 = decodeURIComponent(escape(atob(padded)));
    return JSON.parse(utf8);
  } catch {
    return null;
  }
}

export function getCurrentUser(): { id: string; name: string; email: string } {
  if (typeof window === 'undefined') return { id: '', name: '', email: '' };
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('accessToken='))
    ?.split('=')[1];
  if (!cookieValue) return { id: '', name: '', email: '' };
  const payload = decodeJWTPayload(cookieValue);
  return {
    id: String(payload?.id || ''),
    name: payload?.adsoyad || '',
    email: payload?.eposta || '',
  };
}

function extractName(data: Record<string, unknown>): string {
  const v = (key: string) => { const val = data[key]; return val && String(val).trim() ? String(val).trim() : ''; };
  return (
    v('title_tr') ||
    v('kategori_adi') ||
    v('urun_adi') ||
    v('baslik_tr') ||
    v('baslik') ||
    v('title') ||
    v('name') ||
    v('firma_adi') ||
    (v('ad') && v('soyad') ? `${v('ad')} ${v('soyad')}` : '') ||
    v('ad') ||
    v('adi') ||
    v('isim') ||
    ''
  );
}

export function generateActionMessage(
  method: string,
  url: string,
  requestData?: unknown
): { action: string; category: string } | null {
  const m = method.toUpperCase();
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(m)) return null;

  let path = url;
  try { path = new URL(url).pathname; } catch { /* already a path */ }
  path = path.replace(/\/+/g, '/');

  const data = requestData && typeof requestData === 'object' ? requestData as Record<string, unknown> : {};
  const name = extractName(data);
  const s = name ? `: "${name}"` : '';

  if (path.includes('/login')) return null;
  if (path.includes('/activity-logs')) return null;

  // Kategoriler
  if (path.includes('/kategoriler/create')) return { action: `Yeni kategori oluşturuldu${s}`, category: 'Kategori' };
  if (/\/kategoriler\/\d+/.test(path) && m === 'PUT') return { action: `Kategori güncellendi${s}`, category: 'Kategori' };
  if (/\/kategoriler\/\d+/.test(path) && m === 'DELETE') return { action: `Kategori silindi`, category: 'Kategori' };

  // Ürünler - varyant (önce spesifik path'lar)
  if (path.includes('/urunler/varyant/createUrunVaryant')) return { action: `Ürün varyantı eklendi${s}`, category: 'Ürün' };
  if (path.includes('/urunler/varyant/resim/sec')) return { action: `Varyant resmi seçildi`, category: 'Ürün' };
  if (path.includes('/urunler/varyant/update')) return { action: `Ürün varyantı güncellendi${s}`, category: 'Ürün' };
  if (/\/urunler\/varyant\/\d+/.test(path) && m === 'DELETE') return { action: `Ürün varyantı silindi`, category: 'Ürün' };

  // Ürünler - resim
  if (path.includes('/urunler/resim/create')) return { action: `Ürün resmi eklendi`, category: 'Ürün' };
  if (path.includes('/urunler/resim/kapak')) return { action: `Ürün kapak resmi belirlendi`, category: 'Ürün' };
  if (/\/urunler\/resim\/\d+/.test(path) && m === 'DELETE') return { action: `Ürün resmi silindi`, category: 'Ürün' };

  // Ürünler - özellik & fiyat
  if (path.includes('/urunler/ozellik/create')) return { action: `Ürün özelliği eklendi`, category: 'Ürün' };
  if (path.includes('/urunler/ozelFiyat/create')) return { action: `Ürüne özel fiyat eklendi`, category: 'Ürün' };
  if (path.includes('/urunler/miktar/guncelle')) return { action: `Ürün stok miktarı güncellendi`, category: 'Ürün' };
  if (path.includes('/urunler/durum/guncelle')) return { action: `Ürün durumu güncellendi`, category: 'Ürün' };

  // Ürünler - dosya
  if (path.includes('/urunler/urunDosya/create')) return { action: `Ürüne dosya eklendi`, category: 'Ürün' };
  if (/\/urunler\/urunDosya\/\d+/.test(path) && m === 'DELETE') return { action: `Üründen dosya silindi`, category: 'Ürün' };

  // Ürünler - ana
  if (path.includes('/urunler/create')) return { action: `Yeni ürün oluşturuldu${s}`, category: 'Ürün' };
  if (/\/urunler\/\d+/.test(path) && m === 'PUT') return { action: `Ürün bilgileri güncellendi${s}`, category: 'Ürün' };

  // Sliderlar
  if (path.includes('/slider/web/create')) return { action: `Yeni Web slider oluşturuldu${s}`, category: 'Slider' };
  if (/\/slider\/web\/\d+/.test(path) && m === 'PUT') return { action: `Web slider güncellendi${s}`, category: 'Slider' };
  if (/\/slider\/web\/\d+/.test(path) && m === 'DELETE') return { action: `Web slider silindi`, category: 'Slider' };
  if (path.includes('/slider/b2b/create')) return { action: `Yeni B2B slider oluşturuldu${s}`, category: 'Slider' };
  if (/\/slider\/b2b\/\d+/.test(path) && m === 'PUT') return { action: `B2B slider güncellendi${s}`, category: 'Slider' };
  if (/\/slider\/b2b\/\d+/.test(path) && m === 'DELETE') return { action: `B2B slider silindi`, category: 'Slider' };

  // Kataloglar
  if (path.includes('/sayfalar/katalog/create')) return { action: `Yeni katalog oluşturuldu${s}`, category: 'Katalog' };
  if (/\/sayfalar\/katalog\/\d+/.test(path) && m === 'PUT') return { action: `Katalog güncellendi${s}`, category: 'Katalog' };
  if (/\/sayfalar\/katalog\/\d+/.test(path) && m === 'DELETE') return { action: `Katalog silindi`, category: 'Katalog' };

  // Haberler
  if (path.includes('/sayfalar/haberler/create')) return { action: `Yeni haber oluşturuldu${s}`, category: 'Haber' };
  if (/\/sayfalar\/haberler\/\d+/.test(path) && m === 'PUT') return { action: `Haber güncellendi${s}`, category: 'Haber' };
  if (/\/sayfalar\/haberler\/\d+/.test(path) && m === 'DELETE') return { action: `Haber silindi`, category: 'Haber' };

  // Müşteriler
  if (path.includes('/musteriler/cmsMusterilerCreate')) return { action: `Yeni müşteri oluşturuldu${s}`, category: 'Müşteri' };
  if (path.includes('/musteriler/cmsMusterilerUpdate')) return { action: `Müşteri bilgileri güncellendi${s}`, category: 'Müşteri' };
  if (/\/musteriler\/\d+/.test(path) && m === 'DELETE') return { action: `Müşteri silindi`, category: 'Müşteri' };

  // Siparişler
  if (path.includes('/siparisler/createCms')) return { action: `CMS üzerinden yeni sipariş oluşturuldu`, category: 'Sipariş' };
  if (path.includes('/siparisler/create')) return { action: `Yeni sipariş oluşturuldu`, category: 'Sipariş' };
  if (path.includes('/siparisler/durumCmsUpdate')) return { action: `Sipariş durumu güncellendi`, category: 'Sipariş' };
  if (path.includes('/siparisler/erpAktar')) return { action: `Sipariş ERP'ye aktarıldı`, category: 'Sipariş' };
  if (path.includes('/siparisler/toplu-urun-ekle-cms')) return { action: `Siparişe toplu ürün eklendi`, category: 'Sipariş' };
  if (/\/siparisler\/\d+/.test(path) && m === 'PUT') return { action: `Sipariş güncellendi`, category: 'Sipariş' };

  // Kullanıcılar
  if (path.includes('/users/yetki') && (m === 'PUT' || m === 'POST')) return { action: `Kullanıcı yetkileri güncellendi${s}`, category: 'Kullanıcı' };
  if (path.endsWith('/users') && m === 'POST') return { action: `Yeni kullanıcı oluşturuldu${s}`, category: 'Kullanıcı' };
  if (/\/users\/\d+/.test(path) && m === 'PUT') return { action: `Kullanıcı bilgileri güncellendi${s}`, category: 'Kullanıcı' };
  if (/\/users\/\d+/.test(path) && m === 'DELETE') return { action: `Kullanıcı silindi`, category: 'Kullanıcı' };

  // Banner
  if (path.includes('/banner/create')) return { action: `Yeni banner oluşturuldu${s}`, category: 'Banner' };
  if (/\/banner\/\d+/.test(path) && m === 'PUT') return { action: `Banner güncellendi${s}`, category: 'Banner' };
  if (/\/banner\/\d+/.test(path) && m === 'DELETE') return { action: `Banner silindi`, category: 'Banner' };

  // Medya - Fotoğraf
  if (path.endsWith('/media/photo') && m === 'POST') return { action: `Fotoğraf yüklendi${s}`, category: 'Medya' };
  if (path.includes('/media/photo') && m === 'PUT') return { action: `Fotoğraf güncellendi${s}`, category: 'Medya' };
  if (path.includes('/media/photo') && m === 'DELETE') return { action: `Fotoğraf silindi`, category: 'Medya' };

  // Medya - Video
  if (path.endsWith('/media/video') && m === 'POST') return { action: `Video yüklendi${s}`, category: 'Medya' };
  if (path.includes('/media/video') && m === 'PUT') return { action: `Video güncellendi${s}`, category: 'Medya' };
  if (path.includes('/media/video') && m === 'DELETE') return { action: `Video silindi`, category: 'Medya' };

  // Referanslar
  if (path.endsWith('/reference') && m === 'POST') return { action: `Yeni referans oluşturuldu${s}`, category: 'Referans' };
  if (path.includes('/reference') && m === 'PUT') return { action: `Referans güncellendi${s}`, category: 'Referans' };
  if (path.includes('/reference') && m === 'DELETE') return { action: `Referans silindi`, category: 'Referans' };

  // Sertifikalar
  if (path.endsWith('/certificate') && m === 'POST') return { action: `Yeni sertifika oluşturuldu${s}`, category: 'Sertifika' };
  if (path.includes('/certificate') && m === 'PUT') return { action: `Sertifika güncellendi${s}`, category: 'Sertifika' };
  if (path.includes('/certificate') && m === 'DELETE') return { action: `Sertifika silindi`, category: 'Sertifika' };

  // Popup
  if (path.includes('/popup/create')) return { action: `Yeni popup oluşturuldu${s}`, category: 'Popup' };
  if (/\/popup\/\d+/.test(path) && m === 'PUT') return { action: `Popup güncellendi${s}`, category: 'Popup' };
  if (/\/popup\/\d+/.test(path) && m === 'DELETE') return { action: `Popup silindi`, category: 'Popup' };

  // Kurumsal Zaman Çizelgesi
  if (path.includes('/corporate-timeline') && m === 'POST') return { action: `Zaman çizelgesine kayıt eklendi${s}`, category: 'Kurumsal' };
  if (path.includes('/corporate-timeline') && m === 'PUT') return { action: `Zaman çizelgesi kaydı güncellendi${s}`, category: 'Kurumsal' };
  if (path.includes('/corporate-timeline') && m === 'DELETE') return { action: `Zaman çizelgesinden kayıt silindi`, category: 'Kurumsal' };

  // Mikro Entegrasyon
  if (path.includes('/mikro/stok/miktar/ekle')) return { action: `Mikro stok miktarı senkronizasyonu yapıldı`, category: 'Mikro Entegrasyon' };
  if (path.includes('/mikro/stok/ekle')) return { action: `Mikro ürün-stok senkronizasyonu yapıldı`, category: 'Mikro Entegrasyon' };
  if (path.includes('/mikro/urun/ozel/fiyatlari/ekle')) return { action: `Mikro özel fiyat senkronizasyonu yapıldı`, category: 'Mikro Entegrasyon' };
  if (path.includes('/mikro/urun/fiyatlari/ekle')) return { action: `Mikro ürün fiyat senkronizasyonu yapıldı`, category: 'Mikro Entegrasyon' };
  if (path.includes('/mikro/urun/vergi/ekle')) return { action: `Mikro ürün vergi senkronizasyonu yapıldı`, category: 'Mikro Entegrasyon' };
  if (path.includes('/mikro/stok/varyant/grup/ekle')) return { action: `Mikro varyant eşleştirmesi yapıldı`, category: 'Mikro Entegrasyon' };
  if (path.includes('/mikro/kategori/urun/bagla')) return { action: `Mikro kategori-ürün eşleştirmesi yapıldı`, category: 'Mikro Entegrasyon' };
  if (path.includes('/mikro/kategori/ekle')) return { action: `Mikro kategori senkronizasyonu yapıldı`, category: 'Mikro Entegrasyon' };

  return null;
}

export function addLog(
  action: string,
  category: string,
  status: 'basarili' | 'basarisiz' = 'basarili',
  errorMessage?: string
): void {
  if (typeof window === 'undefined') return;

  const user = getCurrentUser();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return;

  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('accessToken='))
    ?.split('=')[1];

  fetch(`${apiUrl}/activity-logs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      action,
      category,
      status,
      error_message: errorMessage || null,
    }),
  }).catch(() => {});
}

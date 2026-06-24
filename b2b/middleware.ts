import createMiddleware from 'next-intl/middleware';
import {NextRequest, NextResponse} from 'next/server';
import {routing} from './i18n/routing';

// Özel middleware fonksiyonu oluşturuyoruz
const handleI18nRouting = createMiddleware({
  ...routing,
  localePrefix: 'as-needed',
  defaultLocale: 'tr',
  localeDetection: true
});

export default async function middleware(request: NextRequest) {
  // Bakım modu kontrolü - daha güvenilir yöntem
  const maintenanceMode = process.env.MAINTENANCE_MODE || 'false';
  const isMaintenanceMode = maintenanceMode === 'true';
  
  // Geçici test için hardcode (çalışırsa environment variable sorunu var)
  // const isMaintenanceMode = true;
  const isMaintenancePage = request.nextUrl.pathname.includes('/maintenance') || 
                           request.nextUrl.pathname.includes('/bakim') ||
                           request.nextUrl.pathname.includes('/mentenanta') ||
                           request.nextUrl.pathname.includes('/obsluzhivanie') ||
                           request.nextUrl.pathname.includes('/onderhoud');
  
  // Debug log'ları kaldırıldı
  
  // Bakım modu aktifse ve bakım sayfasında değilsek, bakım sayfasına yönlendir
  if (isMaintenanceMode && !isMaintenancePage) {
    const locale = request.nextUrl.pathname.split('/')[1];
    const validLocales = ['tr', 'en', 'ro', 'ru', 'fr', 'nl'];
    const currentLocale = validLocales.includes(locale) ? locale : 'tr';
    return NextResponse.redirect(new URL(`/${currentLocale}/maintenance`, request.url));
  }

  // Bakım modu kapalıysa ve bakım sayfasındaysak, ana sayfaya yönlendir
  if (!isMaintenanceMode && isMaintenancePage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Auth check
  const token = request.cookies.get('accessToken')?.value;
  const isLoginPage = request.nextUrl.pathname.endsWith('/login') || request.nextUrl.pathname.endsWith('/ru/login') || request.nextUrl.pathname.endsWith('/en/login');
  const isNewDealerPage = request.nextUrl.pathname.endsWith('/yeni-bayi') || request.nextUrl.pathname.endsWith('/ru/new-dealer') || request.nextUrl.pathname.endsWith('/en/new-dealer') || request.nextUrl.pathname.endsWith('/new-dealer');
  // Login veya new-dealer sayfasında değilsek ve token yoksa, login'e yönlendir
  if (!token && !isLoginPage && !isNewDealerPage && !isMaintenancePage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Token varsa ve login sayfasındaysak, ana sayfaya yönlendir
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // i18n handling
  if (!request.cookies.has('NEXT_LOCALE')) {
    // NEXT_LOCALE cookie'sini 'ro' olarak ayarla
    request.cookies.set('NEXT_LOCALE', 'tr');
  }
  
  return handleI18nRouting(request);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    '/en/:path*',
    '/ro/:path*',
    '/ru/:path*',
    '/fr/:path*',
    '/nl/:path*'
  ]
};
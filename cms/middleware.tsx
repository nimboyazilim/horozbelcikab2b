import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('accessToken')?.value;
    const isLoginPage = request.nextUrl.pathname === '/login';

    // Eğer token yoksa ve login sayfasında değilsek, login'e yönlendir
    if (!token && !isLoginPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Eğer token varsa ve login sayfasındaysak, ana sayfaya yönlendir
    if (token && isLoginPage) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)'
};
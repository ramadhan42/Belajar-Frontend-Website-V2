import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Ambil token dari cookies
  const adminToken = request.cookies.get('admin_token')?.value

  // Cek apakah user sedang mencoba mengakses halaman dashboard
  const isAccessingDashboard = request.nextUrl.pathname.startsWith('/dashboard')
  // Cek apakah user sedang berada di halaman login
  const isLoginPage = request.nextUrl.pathname === '/login'

  // Jika mencoba akses dashboard TAPI belum punya token -> Lempar ke login
  if (isAccessingDashboard && !adminToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Jika sudah punya token TAPI mencoba akses halaman login -> Lempar ke dashboard
  if (isLoginPage && adminToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// Tentukan rute mana saja yang akan dicek oleh middleware ini
export const config = {
  matcher: ['/dashboard/:path*', '/login']
}
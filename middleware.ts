// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value; // Opsional: jika pakai cookie
  // Karena kita pakai localStorage, middleware Next.js sulit membaca langsung.
  // Cara termudah: redirect dari sisi client di layout/page.
  
  return NextResponse.next();
}
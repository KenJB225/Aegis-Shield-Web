import { NextResponse } from 'next/server'

const AUTH_COOKIE_NAME = 'aegis_admin_token'

export function middleware(request) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/users/:path*', '/activity-logs/:path*', '/settings/:path*'],
}

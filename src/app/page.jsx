import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Home',
}

export default function HomePage() {
  const cookieStore = cookies()
  const token = cookieStore.get('aegis_admin_token')?.value

  if (token) {
    // If an auth token cookie exists, send user to dashboard
    redirect('/dashboard')
  }

  // Otherwise, send to login
  redirect('/login')
}
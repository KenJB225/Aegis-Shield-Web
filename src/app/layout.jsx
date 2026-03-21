import './globals.css'

export const metadata = {
  title: 'Aegis-Dry Admin Panel',
  description: 'Unified Next.js web and backend project for Aegis-Dry.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

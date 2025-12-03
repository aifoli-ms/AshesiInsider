import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Ashesi Insider - Student Reviews & Discovery',
  description: 'Discover and review courses, restaurants, lecturers, and hostels at Ashesi University',
  generator: 'Three and a half men',
  icons: {
    icon: [
      {
        url: '/insider.jpeg',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/insider.jpeg',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/insider.jpeg',
        type: 'image/jpeg',
      },
    ],
    apple: '/insider.jpeg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}

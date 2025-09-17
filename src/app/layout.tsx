import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TOC Simulator - Interactive Theory of Computation Learning Platform',
  description: 'Master Theory of Computation through interactive 3D visualization, step-by-step simulation, and modern learning tools. Design DFA, NFA, Turing Machines, and more.',
  keywords: 'theory of computation, automata, DFA, NFA, turing machine, computer science, education, visualization',
  authors: [{ name: 'TOC Simulator Team' }],
  openGraph: {
    title: 'TOC Simulator - Interactive Theory of Computation Learning Platform',
    description: 'Master Theory of Computation through interactive 3D visualization and simulation.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TOC Simulator - Interactive Theory of Computation Learning Platform',
    description: 'Master Theory of Computation through interactive 3D visualization and simulation.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import { ThemeProvider } from './theme-provider'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'SRS English',
  description: 'Spaced repetition for English learning',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(!t)t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full bg-bg text-t1 antialiased font-sans transition-colors duration-200">
        <ThemeProvider>
          <div className="sm:pb-0 pb-16">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  )
}

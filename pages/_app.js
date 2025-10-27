import React from 'react'
import localFont from 'next/font/local'
import MuiProvider from '../components/MuiProvider'
import PageShell from '../components/PageShell'

import '../app/tailwind.css'

const geistSans = localFont({
  src: '../app/fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})

const geistMono = localFont({
  src: '../app/fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export default function MyApp({ Component, pageProps }) {
  return (
    <MuiProvider>
      <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <PageShell>
          <Component {...pageProps} />
        </PageShell>
      </div>
    </MuiProvider>
  )
}

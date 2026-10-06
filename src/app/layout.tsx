import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { ToastProvider } from '@/components/ToastContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAF8' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
};

export const metadata: Metadata = {
  title: 'THREADLY — Smart Clothing Product Discovery & Real-Time Inventory',
  description:
    'Discover curated luxury fashion garments with verified fixed stock availability, intelligent multi-criteria filtering, and live inventory management.',
  keywords: 'clothing, fashion, apparel, luxury fashion, inventory management, ecommerce, smart search, live stock',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'THREADLY',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body>
        <ToastProvider>
          <Header />
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {children}
          </main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}

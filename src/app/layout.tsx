import type { Metadata, Viewport } from 'next';
import { Archivo, Big_Shoulders, Big_Shoulders_Stencil, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import './mobile.css';
import './preview.css';
import './packliste.css';
import { MotionProvider } from '@/components/MotionProvider';
import { CartProvider } from '@/components/cart/CartProvider';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Checkout } from '@/components/cart/Checkout';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Notice } from '@/components/Notice';
import { LoadoutBar } from '@/components/LoadoutBar';

// Schriften werden beim Build heruntergeladen und selbst gehostet → keine Google-Anfragen im Browser
const display = Big_Shoulders({ subsets: ['latin'], variable: '--font-display', axes: ['opsz'], display: 'swap' });
const stencil = Big_Shoulders_Stencil({ subsets: ['latin'], variable: '--font-stencil', axes: ['opsz'], display: 'swap' });
const body = Archivo({ subsets: ['latin'], variable: '--font-body', axes: ['wdth'], display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

const SITE = process.env.SITE_URL ?? 'https://pfalz-loadout.de';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: 'PFALZ LOADOUT – Taktische Ausrüstung aus der Pfalz',
  description:
    'Range Bag, Daypack, IFAK-Pouch und Gewehrgurt: taktische Ausrüstung für Schießstand, Gelände und Outdoor. Offene Materialangaben, Versand aus Worms.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    siteName: 'PFALZ LOADOUT',
    title: 'PFALZ LOADOUT – Gebaut für den Moment, in dem es zählt.',
    description: 'Taktische Ausrüstung für Schießstand, Gelände und Outdoor. Vier Teile, offene Materialangaben, Versand aus Worms.',
    images: [{ url: '/media/einsatz-pfalz-1280.webp', width: 1280, height: 853, alt: 'Weinberge vor dem Pfälzerwald im Abendlicht' }],
  },
  icons: { icon: '/media/logo-badge-160.webp', apple: '/media/logo-badge-320.webp' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#f4f3ef',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${display.variable} ${stencil.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <a className="skip" href="#main">
          Zum Inhalt springen
        </a>
        <MotionProvider>
          <CartProvider>
            <Header />
            <main id="main">{children}</main>
            <Footer />
            <CartDrawer />
            <Checkout />
            <LoadoutBar />
            <Notice />
          </CartProvider>
        </MotionProvider>
      </body>
    </html>
  );
}

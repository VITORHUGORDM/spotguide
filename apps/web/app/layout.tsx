import type { Metadata } from 'next';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/ibm-plex-mono/400.css';
import './globals.css';
import './tema.css';
import { AuthProvider } from '../lib/auth-context';
import { SiteNav } from '../components/site-nav';
import { SiteFooter } from '../components/site-footer';
import { Grain } from '../components/grain';

export const metadata: Metadata = {
  title: {
    default: 'SpotGuide • Guia turístico e comercial',
    template: '%s | SpotGuide',
  },
  description:
    'Restaurantes, bares, hotéis, pontos turísticos e comércios locais perto de você, com rota no Google Maps e avaliações de quem foi.',
  keywords: ['guia turístico', 'restaurantes', 'hotéis', 'pontos turísticos', 'viagem', 'gastronomia', 'spotguide'],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://spotguide.com.br',
    siteName: 'SpotGuide',
    title: 'SpotGuide • Guia turístico e comercial',
    description: 'Restaurantes, bares, hotéis e pontos turísticos perto de você, com rota e nota de quem foi.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen flex flex-col antialiased bg-[#0b0a17] text-[#faf6ee] selection:bg-[#f2a65a] selection:text-[#0b0a17]">
        <AuthProvider>
          <Grain />
          <SiteNav />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Guia Turístico & Comercial - Descubra o Melhor da Sua Cidade',
    template: '%s | Guia Turístico',
  },
  description:
    'Encontre os melhores restaurantes, bares, hotéis, atrações turísticas e comércios locais com avaliações reais e rotas integradas.',
  keywords: ['guia turístico', 'restaurantes', 'hotéis', 'pontos turísticos', 'viagem', 'gastronomia'],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://guiaturistico.com.br',
    siteName: 'Guia Turístico',
    title: 'Guia Turístico & Comercial',
    description: 'Encontre os melhores restaurantes, bares, hotéis e atrações turísticas.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col antialiased">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🗺️</span>
              <span className="font-bold text-xl text-slate-900 tracking-tight">GuiaTurístico</span>
            </div>
            <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
              <a href="/locais" className="hover:text-blue-600 transition">Explorar Locais</a>
              <a href="/comerciante" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Para Comerciantes
              </a>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="bg-slate-900 text-slate-400 py-12 text-sm border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p>© {new Date().getFullYear()} Guia Turístico & Comercial. Todos os direitos reservados.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

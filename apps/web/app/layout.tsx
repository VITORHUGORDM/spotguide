import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import { Navbar } from '../components/navbar';

export const metadata: Metadata = {
  title: {
    default: 'SpotGuide • O Guia Turístico & Comercial Inteligente',
    template: '%s | SpotGuide',
  },
  description:
    'Encontre os melhores restaurantes, bares, hotéis, atrações turísticas e comércios locais com rotas no Google Maps e avaliações autênticas.',
  keywords: ['guia turístico', 'restaurantes', 'hotéis', 'pontos turísticos', 'viagem', 'gastronomia', 'spotguide'],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://spotguide.com.br',
    siteName: 'SpotGuide',
    title: 'SpotGuide • Guia Turístico & Comercial',
    description: 'Encontre os melhores restaurantes, bares, hotéis e atrações turísticas.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen flex flex-col antialiased bg-[#030305] text-slate-100 selection:bg-purple-600 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="relative bg-[#020204] border-t border-white/[0.08] text-slate-400 py-12 text-sm overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-purple-600/10 blur-3xl rounded-full pointer-events-none" />
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-sm shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                  🗺️
                </div>
                <div>
                  <span className="font-extrabold text-white tracking-tight text-base">SpotGuide</span>
                  <span className="text-[11px] text-slate-500 block">A Nova Era do Turismo & Comércio Local</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">© {new Date().getFullYear()} SpotGuide Brasil. Todos os direitos reservados.</p>
              <div className="flex items-center gap-5 text-xs font-medium">
                <a href="/locais" className="hover:text-purple-400 transition">Explorar Locais</a>
                <a href="/comerciante" className="hover:text-purple-400 transition">Painel do Comerciante</a>
                <a href="/login" className="hover:text-purple-400 transition">Entrar</a>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}

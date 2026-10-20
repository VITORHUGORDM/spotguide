/** @type {import('next').NextConfig} */
const umAno = 'public, max-age=31536000, immutable';

const nextConfig = {
  poweredByHeader: false,
  compress: true,
  // build de produção em outra pasta não derruba o `next dev` que está rodando: NEXT_DIST_DIR=.next-prod
  distDir: process.env.NEXT_DIST_DIR || '.next',
  experimental: {
    // importa só os ícones/funções usados, não o pacote inteiro
    optimizePackageImports: ['lucide-react', 'gsap'],
  },
  async headers() {
    return [
      // as nuvens em /public não mudam de nome quando mudam de conteúdo, então só 1 dia; as de /_next são hasheadas
      { source: '/img/:arquivo*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }] },
      { source: '/_next/static/:caminho*', headers: [{ key: 'Cache-Control', value: umAno }] },
    ];
  },
};

export default nextConfig;

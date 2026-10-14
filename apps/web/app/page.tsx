import { Search, MapPin, Star, Utensils, Beer, Coffee, Hotel } from 'lucide-react';

const CATEGORIES = [
  { name: 'Restaurantes', slug: 'restaurantes', icon: Utensils, count: '120+' },
  { name: 'Bares & Pubs', slug: 'bares', icon: Beer, count: '85+' },
  { name: 'Cafés', slug: 'cafes', icon: Coffee, count: '45+' },
  { name: 'Hotéis', slug: 'hospedagem', icon: Hotel, count: '30+' },
];

const POPULAR_CITIES = [
  { name: 'Gramado', state: 'RS', image: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1' },
  { name: 'Campos do Jordão', state: 'SP', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b' },
  { name: 'Florianópolis', state: 'SC', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957' },
  { name: 'Rio de Janeiro', state: 'RJ', image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325' },
];

export default function HomePage() {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section com Barra de Busca */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full uppercase tracking-wider">
            Seu Guia de Bolso
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Descubra os melhores lugares para <span className="text-blue-600">comer, relaxar e visitar</span>.
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Avaliações verificadas, rotas com um clique e estabelecimentos locais de ponta a ponta.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center px-4 py-2 gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="O que você está procurando? (ex: café colonial, pizza)"
                className="w-full text-sm outline-none text-slate-800 placeholder-slate-400"
              />
            </div>
            <div className="h-px sm:h-auto sm:w-px bg-slate-200 my-1 sm:my-0" />
            <div className="flex items-center px-4 py-2 gap-3">
              <MapPin className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cidade (ex: Gramado)"
                className="w-32 text-sm outline-none text-slate-800 placeholder-slate-400"
              />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-6 py-3 rounded-xl transition">
              Buscar
            </button>
          </div>
        </div>
      </section>

      {/* Feed de Categorias */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Categorias em Destaque</h2>
            <p className="text-sm text-slate-500">Escolha o que você gostaria de explorar hoje</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <a
                key={cat.slug}
                href={`/locais?categoria=${cat.slug}`}
                className="group p-6 bg-white border border-slate-200 hover:border-blue-400 rounded-2xl shadow-sm hover:shadow-md transition text-center flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{cat.name}</h3>
                  <span className="text-xs text-slate-400">{cat.count} lugares</span>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Cidades Populares */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Destinos Populares</h2>
          <p className="text-sm text-slate-500">Cidades mais buscadas por viajantes</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {POPULAR_CITIES.map((city) => (
            <a
              key={city.name}
              href={`/locais?cidade=${city.name}`}
              className="group relative h-64 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition"
            >
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                <h3 className="text-xl font-bold">{city.name}</h3>
                <span className="text-xs text-slate-200">{city.state} - Brasil</span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

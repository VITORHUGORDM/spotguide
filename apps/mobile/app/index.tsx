import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { MapPin, Search, Star, Navigation, Sparkles } from 'lucide-react-native';

const API_BASE_URL = 'http://127.0.0.1:3333/api/v1';

export default function MobileHomeScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permissão de localização foi negada.');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const url = new URL(`${API_BASE_URL}/places`);
      if (search.trim()) url.searchParams.set('search', search.trim());
      if (selectedCity) url.searchParams.set('city', selectedCity);
      if (selectedCategory) url.searchParams.set('categorySlug', selectedCategory);
      if (location) {
        url.searchParams.set('lat', String(location.coords.latitude));
        url.searchParams.set('lng', String(location.coords.longitude));
      }

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setPlaces(data);
      }
    } catch (e) {
      console.log('API não acessível no momento, exibindo dados locais');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [selectedCategory, selectedCity, location]);

  const categories = [
    { label: 'Todas Categorias', slug: null },
    { label: 'Restaurantes', slug: 'restaurantes' },
    { label: 'Bares', slug: 'bares' },
    { label: 'Cafés', slug: 'cafes' },
    { label: 'Hotéis', slug: 'hospedagem' },
  ];

  const popularCities = [
    { label: 'Brasil Todo', city: null },
    { label: 'Gramado - RS', city: 'Gramado' },
    { label: 'Porto Alegre - RS', city: 'Porto Alegre' },
    { label: 'Campos do Jordão - SP', city: 'Campos do Jordão' },
    { label: 'Florianópolis - SC', city: 'Florianópolis' },
    { label: 'Rio de Janeiro - RJ', city: 'Rio de Janeiro' },
  ];

  return (
    <ScrollView className="flex-1 bg-slate-50 p-4">
      {/* Top Banner App Name */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-xl bg-blue-600 items-center justify-center">
            <Text className="text-sm">🗺️</Text>
          </View>
          <Text className="text-xl font-extrabold text-slate-900 tracking-tight">SpotGuide</Text>
        </View>
        <View className="flex-row items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-full">
          <Sparkles color="#2563eb" size={12} />
          <Text className="text-[10px] font-bold text-blue-700">Ao Vivo</Text>
        </View>
      </View>

      {/* Search Header */}
      <View className="bg-white rounded-2xl p-3 shadow-sm border border-slate-200 flex-row items-center gap-2 mb-3">
        <Search color="#2563eb" size={18} />
        <TextInput
          placeholder="Buscar por nome, prato ou lugar..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchPlaces}
          className="flex-1 text-slate-800 text-xs font-medium"
        />
      </View>

      {/* GPS Status Banner */}
      <View className="bg-blue-50/80 border border-blue-100 p-2.5 rounded-xl flex-row items-center gap-2 mb-4">
        <MapPin color="#2563eb" size={16} />
        <Text className="text-[11px] text-blue-900 flex-1">
          {location
            ? `GPS Ativo: ordenando por proximidade geográfica`
            : errorMsg || 'Obtendo localização para exibir distâncias em km...'}
        </Text>
      </View>

      {/* City Filter Pills */}
      <Text className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
        Filtrar por Cidade
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mb-4">
        {popularCities.map((c) => (
          <TouchableOpacity
            key={c.label}
            onPress={() => setSelectedCity(c.city)}
            className={`px-3.5 py-1.5 rounded-xl border mr-2 ${
              selectedCity === c.city
                ? 'bg-indigo-600 border-indigo-600 shadow-sm'
                : 'bg-white border-slate-200'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                selectedCity === c.city ? 'text-white' : 'text-slate-700'
              }`}
            >
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Categories Preview */}
      <Text className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
        Categorias
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mb-5">
        {categories.map((c) => (
          <TouchableOpacity
            key={c.label}
            onPress={() => setSelectedCategory(c.slug)}
            className={`px-3.5 py-1.5 rounded-full border mr-2 ${
              selectedCategory === c.slug
                ? 'bg-blue-600 border-blue-600 shadow-sm'
                : 'bg-white border-slate-200'
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                selectedCategory === c.slug ? 'text-white' : 'text-slate-700'
              }`}
            >
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Feed Title */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="font-extrabold text-base text-slate-900">
          {selectedCity ? `Locais em ${selectedCity}` : 'Lugares em Destaque'}
        </Text>
        {loading && <ActivityIndicator size="small" color="#2563eb" />}
      </View>

      {/* Places List */}
      {places.length > 0 ? (
        places.map((place) => (
          <View
            key={place.id}
            className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm mb-4"
          >
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1 mr-2">
                <Text className="font-extrabold text-base text-slate-900">{place.name}</Text>
                <Text className="text-xs text-slate-500">
                  {place.city} - {place.state}
                  {place.distanceKm !== undefined ? ` • ${place.distanceKm} km de você` : ''}
                </Text>
              </View>
              <View className="flex-row items-center bg-amber-50 px-2 py-1 rounded-lg">
                <Star color="#f59e0b" fill="#f59e0b" size={14} />
                <Text className="text-xs font-bold text-amber-700 ml-1">
                  {place.averageRating && Number(place.averageRating) > 0
                    ? Number(place.averageRating).toFixed(1)
                    : 'Novo'}
                </Text>
              </View>
            </View>
            <Text className="text-xs text-slate-600 mb-3" numberOfLines={2}>
              {place.description}
            </Text>
            <TouchableOpacity
              onPress={() => router.push(`/places/${place.slug}` as any)}
              className="bg-blue-600 py-2.5 rounded-xl items-center flex-row justify-center gap-1.5 shadow-sm"
            >
              <Navigation color="#ffffff" size={14} />
              <Text className="text-white font-bold text-xs">Ver Detalhes e Traçar Rota</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <View className="bg-white rounded-3xl p-6 border border-slate-200 items-center justify-center mb-6">
          <Text className="text-xs text-slate-500 mb-2">
            Nenhum estabelecimento encontrado com os filtros atuais.
          </Text>
          <TouchableOpacity
            onPress={() => {
              setSelectedCity(null);
              setSelectedCategory(null);
              setSearch('');
            }}
            className="px-4 py-2 bg-blue-50 rounded-xl"
          >
            <Text className="text-xs font-bold text-blue-600">Limpar Filtros</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

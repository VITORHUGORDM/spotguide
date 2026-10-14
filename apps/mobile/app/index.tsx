import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import * as Location from 'expo-location';
import { MapPin, Search, Star } from 'lucide-react-native';

export default function MobileHomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <View className="flex-1 bg-slate-50 p-4">
      {/* Search Header */}
      <View className="bg-white rounded-2xl p-3 shadow-sm border border-slate-200 flex-row items-center gap-2 mb-4">
        <Search color="#94a3b8" size={20} />
        <TextInput
          placeholder="Buscar restaurantes, bares, hotéis..."
          placeholderTextColor="#94a3b8"
          className="flex-1 text-slate-800 text-sm"
        />
      </View>

      {/* GPS Status Banner */}
      <View className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex-row items-center gap-2 mb-6">
        <MapPin color="#2563eb" size={18} />
        <Text className="text-xs text-blue-900 flex-1">
          {location
            ? `GPS ativo: [${location.coords.latitude.toFixed(2)}, ${location.coords.longitude.toFixed(2)}]`
            : errorMsg || 'Obtendo sua localização para ordenar por proximidade...'}
        </Text>
      </View>

      {/* Categories Preview */}
      <Text className="font-bold text-lg text-slate-900 mb-3">Categorias</Text>
      <View className="flex-row gap-2 mb-6">
        {['Restaurantes', 'Bares', 'Cafés', 'Hotéis'].map((category) => (
          <TouchableOpacity
            key={category}
            className="bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm"
          >
            <Text className="text-xs font-medium text-slate-700">{category}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Feed Title */}
      <Text className="font-bold text-lg text-slate-900 mb-3">Lugares em Destaque</Text>

      {/* Sample Card */}
      <View className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-4">
        <View className="flex-row justify-between items-start mb-2">
          <View>
            <Text className="font-bold text-base text-slate-900">Bistrô da Serra</Text>
            <Text className="text-xs text-slate-500">Gramado - RS • 1.2 km de você</Text>
          </View>
          <View className="flex-row items-center bg-amber-50 px-2 py-1 rounded-lg">
            <Star color="#f59e0b" fill="#f59e0b" size={14} />
            <Text className="text-xs font-bold text-amber-700 ml-1">4.8</Text>
          </View>
        </View>
        <Text className="text-xs text-slate-600 mb-3" numberOfLines={2}>
          Gastronomia aconchegante com pratos típicos da serra e carta de vinhos selecionados.
        </Text>
        <TouchableOpacity className="bg-blue-600 py-2.5 rounded-xl items-center">
          <Text className="text-white font-semibold text-xs">Ver Detalhes e Rotas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

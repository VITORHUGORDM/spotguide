import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { MapPin, Star, Phone, Navigation, Clock, ArrowLeft } from 'lucide-react-native';

const API_BASE_URL = 'http://localhost:3333/api/v1';

export default function MobilePlaceDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();

  const [place, setPlace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`${API_BASE_URL}/places/slug/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Local não encontrado');
        return res.json();
      })
      .then((data) => setPlace(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-xs text-slate-500 mt-2">Carregando detalhes do local...</Text>
      </View>
    );
  }

  if (error || !place) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-slate-50">
        <Text className="text-sm font-bold text-slate-800 mb-2">Ops! Local não encontrado</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-blue-600 px-4 py-2 rounded-xl"
        >
          <Text className="text-white text-xs font-semibold">Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const openMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
    Linking.openURL(url);
  };

  const callPhone = () => {
    if (place.phone) {
      Linking.openURL(`tel:${place.phone}`);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: place.name, headerBackTitle: 'Voltar' }} />
      <ScrollView className="flex-1 bg-slate-50 p-4">
        {/* Header Card */}
        <View className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="bg-blue-50 px-2.5 py-1 rounded-full">
              <Text className="text-xs font-semibold text-blue-700">{place.category?.name}</Text>
            </View>
            <View className="flex-row items-center bg-amber-50 px-2 py-1 rounded-lg">
              <Star color="#f59e0b" fill="#f59e0b" size={14} />
              <Text className="text-xs font-bold text-amber-700 ml-1">
                {place.averageRating ? Number(place.averageRating).toFixed(1) : 'Novo'}
              </Text>
              <Text className="text-[10px] text-slate-400 ml-1">({place.totalReviews})</Text>
            </View>
          </View>

          <Text className="text-2xl font-bold text-slate-900 mb-1">{place.name}</Text>

          <View className="flex-row items-center gap-1 mb-4">
            <MapPin color="#94a3b8" size={14} />
            <Text className="text-xs text-slate-500">
              {place.neighborhood}, {place.city} - {place.state}
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={openMaps}
              className="flex-1 bg-blue-600 py-3 rounded-xl flex-row items-center justify-center gap-1.5 shadow-sm"
            >
              <Navigation color="#ffffff" size={16} />
              <Text className="text-white font-bold text-xs">Traçar Rota no GPS</Text>
            </TouchableOpacity>

            {place.phone && (
              <TouchableOpacity
                onPress={callPhone}
                className="bg-slate-100 px-4 py-3 rounded-xl flex-row items-center justify-center gap-1.5"
              >
                <Phone color="#334155" size={16} />
                <Text className="text-slate-700 font-semibold text-xs">Ligar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Description Card */}
        <View className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm mb-4">
          <Text className="font-bold text-sm text-slate-900 mb-2">Sobre o Estabelecimento</Text>
          <Text className="text-xs text-slate-600 leading-relaxed">{place.description}</Text>
        </View>

        {/* Address Card */}
        <View className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm mb-6">
          <Text className="font-bold text-sm text-slate-900 mb-2">Endereço Completo</Text>
          <Text className="text-xs text-slate-800 font-semibold">
            {place.street}, {place.number}
          </Text>
          <Text className="text-xs text-slate-500">
            {place.neighborhood} • {place.city} - {place.state}
          </Text>
          <Text className="text-[11px] text-slate-400 mt-1">CEP: {place.postalCode}</Text>
        </View>
      </ScrollView>
    </>
  );
}

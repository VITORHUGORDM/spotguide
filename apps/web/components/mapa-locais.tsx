'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import type { PlaceListItem } from '@guia/contracts';
import 'leaflet/dist/leaflet.css';
import './mapa-locais.css';

const PIN_SVG =
  '<svg viewBox="0 0 24 32" width="30" height="40"><path fill="#f2a65a" stroke="#0b0a17" stroke-width="1.5" d="M12 1C5.9 1 1 5.9 1 12c0 8 11 19 11 19s11-11 11-19C23 5.9 18.1 1 12 1Z"/><circle cx="12" cy="12" r="4.4" fill="#0b0a17"/></svg>';

const iconePin = L.divIcon({
  html: PIN_SVG,
  className: 'mapa-pin',
  iconSize: [30, 40],
  iconAnchor: [15, 40],
  popupAnchor: [0, -36],
});

/** Enquadra o mapa nos pins (ou no ponto do usuário quando não há resultados). */
function Enquadra({ pontos, centro }: { pontos: [number, number][]; centro?: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (pontos.length > 1) {
      map.fitBounds(L.latLngBounds(pontos), { padding: [48, 48], maxZoom: 14 });
    } else if (pontos.length === 1) {
      map.setView(pontos[0], 14);
    } else if (centro) {
      map.setView(centro, 12);
    }
  }, [map, pontos, centro]);
  return null;
}

export default function MapaLocais({
  places,
  centro,
}: {
  places: PlaceListItem[];
  centro?: { lat: number; lng: number };
}) {
  const comCoord = useMemo(
    () => places.filter((p) => typeof p.latitude === 'number' && typeof p.longitude === 'number'),
    [places]
  );
  const pontos = useMemo(() => comCoord.map((p) => [p.latitude as number, p.longitude as number] as [number, number]), [comCoord]);
  const centroTupla: [number, number] | undefined = centro ? [centro.lat, centro.lng] : undefined;

  return (
    <div className="mapa-locais" role="region" aria-label="Mapa dos locais">
      <MapContainer center={centroTupla ?? [-15.8, -47.9]} zoom={centroTupla ? 12 : 4} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <Enquadra pontos={pontos} centro={centroTupla} />

        {centroTupla && (
          <CircleMarker center={centroTupla} radius={9} pathOptions={{ color: '#faf6ee', weight: 3, fillColor: '#4a9bb5', fillOpacity: 1 }}>
            <Popup>Você está aqui</Popup>
          </CircleMarker>
        )}

        {comCoord.map((p) => (
          <Marker key={p.id} position={[p.latitude as number, p.longitude as number]} icon={iconePin}>
            <Popup>
              <div className="mapa-popup">
                <span className="mapa-popup__cat">{p.category.name}</span>
                <strong>{p.name}</strong>
                <span className="mapa-popup__linha">
                  {p.city} · {p.averageRating > 0 ? `★ ${Number(p.averageRating).toFixed(1)}` : 'Novo'}
                  {p.distanceKm !== undefined && ` · ${p.distanceKm} km`}
                </span>
                <Link href={`/locais/${p.slug}`}>Ver detalhes e rota →</Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

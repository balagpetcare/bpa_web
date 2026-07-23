'use client';

import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import type { PublicClinic } from '@/types/bpa.types';
import 'leaflet/dist/leaflet.css';

// Leaflet's default marker icon path resolution assumes a bundler that
// copies its image assets verbatim, which breaks under Next.js — this is
// the standard fix (rebuild the icon URLs from the installed package).
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = L.divIcon({
  className: '',
  html: '<div style="width:16px;height:16px;border-radius:50%;background:#2f7a3d;border:3px solid white;box-shadow:0 0 0 2px rgba(0,0,0,0.15)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

interface Props {
  clinics: PublicClinic[];
  userLocation: { latitude: number; longitude: number } | null;
}

const DHAKA_CENTER: [number, number] = [23.7808, 90.4192];

// Environment-driven so switching tile providers (e.g. to a paid Mapbox/
// MapTiler plan later) never requires a code change — only new env values.
// No API key is required for the default OpenStreetMap tile server.
const TILE_URL = process.env.NEXT_PUBLIC_MAP_TILE_URL ?? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ??
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/**
 * Plain-marker map (no clustering library) — the clinic directory's own
 * documented scale is "tens to low hundreds of branches" (see
 * clinics-public.repository.ts), which renders fine as individual OSM
 * markers. Clustering is worth adding once the directory is large enough
 * for marker overlap to actually hurt readability; this component is the
 * single place that change would land.
 *
 * Clinics without known coordinates are never dropped from the page — the
 * caller renders them in the list view; this component simply cannot place
 * a marker for something with no location, which the "N clinics found"
 * count above already accounts for honestly (not silently short of what
 * the map can show).
 */
export default function ClinicMap({ clinics, userLocation }: Props) {
  const located = useMemo(() => clinics.filter((c) => c.location !== null), [clinics]);
  const missingCount = clinics.length - located.length;

  const center: [number, number] = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : located.length > 0
      ? [located[0].location!.latitude, located[0].location!.longitude]
      : DHAKA_CENTER;

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
      <MapContainer center={center} zoom={12} scrollWheelZoom style={{ height: 520, width: '100%' }}>
        <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
        {userLocation && (
          <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
            <Popup>Your location</Popup>
          </Marker>
        )}
        {located.map((clinic) => (
          <Marker key={clinic.id} position={[clinic.location!.latitude, clinic.location!.longitude]} icon={defaultIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold mb-1">{clinic.branchName?.trim() || clinic.organizationName}</p>
                {clinic.area && <p className="text-gray-500 mb-1">{clinic.area}</p>}
                <Link href={`/clinics/${clinic.slug}`} className="text-(--bpa-green) font-semibold">
                  View details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {missingCount > 0 && (
        <p className="text-xs text-gray-500 px-3 py-2 bg-gray-50 border-t border-gray-100">
          {missingCount} of {clinics.length} clinics on this page {missingCount === 1 ? 'has' : 'have'} no map location yet —
          switch to List view to see {missingCount === 1 ? 'it' : 'them'}.
        </p>
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import { ApartmentInfo, FilterState, TradeRecord } from '@/types';
import { parseAmount, getPastMonths, formatPriceShort } from '@/lib/utils';
import { ensureKakaoMaps, kakaoGeocode, kakaoReverseGeocode } from '@/lib/kakaoLoader';

interface Props {
  filter: FilterState;
  onApartmentSelect: (apt: ApartmentInfo) => void;
  centerTo?: { lat: number; lng: number } | null;
  selectedApartment: ApartmentInfo | null;
}

interface AptGroup {
  name: string;
  umdNm: string;
  jibun: string;
  lawdCd: string;
  buildYear: string;
  latestAmount: number;
  latestArea: string;
  latestDate: string;
}

const geocodeCache = new Map<string, { lat: number; lng: number } | null>();

async function geocodeApt(name: string, umdNm: string): Promise<{ lat: number; lng: number } | null> {
  const key = `${name}|${umdNm}`;
  if (geocodeCache.has(key)) return geocodeCache.get(key)!;
  const result = await kakaoGeocode(`${umdNm} ${name}`);
  geocodeCache.set(key, result);
  return result;
}

function groupByApartment(trades: TradeRecord[]): AptGroup[] {
  const map = new Map<string, AptGroup>();
  trades.forEach((t) => {
    const k = `${t.aptNm}|${t.umdNm}`;
    if (!map.has(k)) {
      map.set(k, {
        name: t.aptNm, umdNm: t.umdNm, jibun: t.jibun, lawdCd: t.lawdCd,
        buildYear: t.buildYear, latestAmount: 0, latestArea: t.excluUseAr,
        latestDate: `${t.dealYear}.${t.dealMonth.padStart(2, '0')}`,
      });
    }
    const g = map.get(k)!;
    const amount = parseAmount(t.dealAmount);
    if (amount > g.latestAmount) {
      g.latestAmount = amount;
      g.latestArea = t.excluUseAr;
      g.latestDate = `${t.dealYear}.${t.dealMonth.padStart(2, '0')}`;
    }
  });
  return Array.from(map.values()).filter((g) => g.latestAmount > 0);
}

export default function MapContainer({ filter, onApartmentSelect, centerTo }: Props) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const isFetchingRef = useRef(false);
  const currentLawdCdRef = useRef('');
  const filterRef = useRef(filter);
  filterRef.current = filter;
  const onSelectRef = useRef(onApartmentSelect);
  onSelectRef.current = onApartmentSelect;

  function clearOverlays() {
    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];
  }

  const loadMarkersRef = useRef(async (lawdCd: string) => {
    if (!mapRef.current || isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const f = filterRef.current;
      const months = getPastMonths(Math.min(f.periodMonths, 3));
      const allTrades: TradeRecord[] = [];

      await Promise.all(months.map(async (m) => {
        const res = await fetch(`/api/trade?lawdCd=${lawdCd}&dealYmd=${m}&numOfRows=500`);
        const data = await res.json();
        allTrades.push(...(data.items || []));
      }));

      const filtered = allTrades.filter((t) => {
        const amount = parseAmount(t.dealAmount);
        const area = parseFloat(t.excluUseAr);
        if (f.priceMin !== null && amount < f.priceMin) return false;
        if (f.priceMax !== null && amount > f.priceMax) return false;
        if (f.areaMin !== null && area < f.areaMin) return false;
        if (f.areaMax !== null && area > f.areaMax) return false;
        return true;
      });

      const groups = groupByApartment(filtered);
      clearOverlays();

      await Promise.all(groups.slice(0, 40).map(async (group) => {
        const pos = await geocodeApt(group.name, group.umdNm);
        if (!pos || !mapRef.current) return;

        const el = document.createElement('div');
        el.className = 'apt-marker';
        el.innerHTML = `<span class="apt-marker-price">${formatPriceShort(String(group.latestAmount))}</span>`;
        el.onclick = () => onSelectRef.current({
          name: group.name,
          address: `${group.umdNm} ${group.jibun}`,
          lat: pos.lat, lng: pos.lng,
          lawdCd: group.lawdCd, umdNm: group.umdNm, jibun: group.jibun,
          buildYear: group.buildYear,
          latestDealAmount: String(group.latestAmount),
          latestDealArea: group.latestArea,
          latestDealDate: group.latestDate,
        });

        const overlay = new window.kakao.maps.CustomOverlay({
          position: new window.kakao.maps.LatLng(pos.lat, pos.lng),
          content: el, xAnchor: 0.5, yAnchor: 1.3, zIndex: 3,
        });
        overlay.setMap(mapRef.current);
        overlaysRef.current.push(overlay);
      }));
    } finally {
      isFetchingRef.current = false;
    }
  });

  const onMapIdleRef = useRef(async () => {
    if (!mapRef.current) return;
    const center = mapRef.current.getCenter();
    const lawdCd = await kakaoReverseGeocode(center.getLat(), center.getLng());
    if (lawdCd && lawdCd !== currentLawdCdRef.current) {
      currentLawdCdRef.current = lawdCd;
      await loadMarkersRef.current(lawdCd);
    }
  });

  // Initialize map once
  useEffect(() => {
    if (mapRef.current) return;
    ensureKakaoMaps().then(() => {
      if (!mapDivRef.current || mapRef.current) return;
      const map = new window.kakao.maps.Map(mapDivRef.current, {
        center: new window.kakao.maps.LatLng(37.5175, 127.0473),
        level: 5,
      });
      mapRef.current = map;
      window.kakao.maps.event.addListener(map, 'idle', onMapIdleRef.current);
      onMapIdleRef.current();
    }).catch(console.error);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reload markers on filter change
  useEffect(() => {
    if (!mapRef.current) return;
    clearOverlays();
    currentLawdCdRef.current = '';
    onMapIdleRef.current();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pan on search
  useEffect(() => {
    if (!centerTo || !mapRef.current) return;
    mapRef.current.setCenter(new window.kakao.maps.LatLng(centerTo.lat, centerTo.lng));
    mapRef.current.setLevel(4);
  }, [centerTo]);

  return (
    <>
      <div ref={mapDivRef} style={{ width: '100%', height: '100%' }} />
      <style>{`
        .apt-marker {
          background: white;
          border: 1.5px solid #2f75e0;
          border-radius: 20px;
          padding: 4px 10px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          white-space: nowrap;
          transition: all 0.15s;
        }
        .apt-marker:hover { background: #2f75e0; transform: scale(1.05); }
        .apt-marker:hover .apt-marker-price { color: white; }
        .apt-marker-price { font-size: 12px; font-weight: 600; color: #2f75e0; }
      `}</style>
    </>
  );
}

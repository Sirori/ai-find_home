'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ApartmentInfo } from '@/types';
import { ensureKakaoMaps, kakaoPlacesSearch, kakaoReverseGeocode } from '@/lib/kakaoLoader';

interface SearchResult {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
}

interface Props {
  onSelect: (apt: ApartmentInfo) => void;
  onMapMove: (lat: number, lng: number) => void;
}

export default function SearchBar({ onSelect, onMapMove }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const kakaoReadyRef = useRef(false);

  useEffect(() => {
    ensureKakaoMaps().then(() => { kakaoReadyRef.current = true; }).catch(console.error);
  }, []);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    if (!kakaoReadyRef.current) return;
    setLoading(true);
    try {
      const docs = await kakaoPlacesSearch(q, { category_group_code: 'RE2', size: 10 });
      setResults(docs as unknown as SearchResult[]);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(val), 350);
  };

  const handleSelect = async (r: SearchResult) => {
    setQuery(r.place_name);
    setOpen(false);
    const lat = parseFloat(r.y);
    const lng = parseFloat(r.x);
    onMapMove(lat, lng);
    const lawdCd = await kakaoReverseGeocode(lat, lng);
    onSelect({
      name: r.place_name,
      address: r.road_address_name || r.address_name,
      lat, lng,
      lawdCd: lawdCd || '',
      umdNm: '',
      jibun: '',
    });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="flex items-center bg-white rounded-2xl shadow-md border border-gray-200 px-4 py-2.5 gap-2">
        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text" value={query} onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="아파트 이름 또는 주소 검색"
          className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent"
        />
        {loading && <div className="w-4 h-4 border-2 border-[#2f75e0] border-t-transparent rounded-full animate-spin shrink-0" />}
        {query && !loading && (
          <button onClick={() => { setQuery(''); setResults([]); setOpen(false); }} className="text-gray-400 hover:text-gray-600 shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden z-50">
          {results.map((r) => (
            <button key={r.id} onClick={() => handleSelect(r)}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-[#2f75e0]/10 flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-[#2f75e0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{r.place_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{r.road_address_name || r.address_name}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && results.length === 0 && query && !loading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-200 px-4 py-4 text-sm text-gray-400 text-center z-50">
          검색 결과가 없습니다
        </div>
      )}
    </div>
  );
}

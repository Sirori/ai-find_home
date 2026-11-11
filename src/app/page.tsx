"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import SearchBar from "@/components/SearchBar";
import FilterBar from "@/components/FilterBar";
import ApartmentPanel from "@/components/ApartmentPanel";
import { ApartmentInfo, FilterState } from "@/types";

const MapContainer = dynamic(() => import("@/components/MapContainer"), {
  ssr: false,
});

const DEFAULT_FILTER: FilterState = {
  dealType: "buy",
  priceMin: null,
  priceMax: null,
  areaMin: null,
  areaMax: null,
  periodMonths: 6,
};

export default function Home() {
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [selectedApartment, setSelectedApartment] =
    useState<ApartmentInfo | null>(null);
  const [centerTo, setCenterTo] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const handleApartmentSelect = useCallback((apt: ApartmentInfo) => {
    setSelectedApartment(apt);
  }, []);

  const handleMapMove = useCallback((lat: number, lng: number) => {
    setCenterTo({ lat, lng });
  }, []);

  const handleClose = useCallback(() => {
    setSelectedApartment(null);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Map */}
      <div className="absolute inset-0">
        <MapContainer
          filter={filter}
          onApartmentSelect={handleApartmentSelect}
          centerTo={centerTo}
          selectedApartment={selectedApartment}
        />
      </div>

      {/* Top Controls */}
      <div className="absolute top-4 left-0 right-0 flex justify-center px-4 z-30 pointer-events-none">
        <div className="flex flex-col items-center gap-2 pointer-events-auto w-full max-w-lg">
          {/* Logo + Search */}
          <div className="flex items-center gap-2 w-full">
            <SearchBar
              onSelect={handleApartmentSelect}
              onMapMove={handleMapMove}
            />
          </div>

          {/* Filter Bar */}
          <FilterBar filter={filter} onChange={setFilter} />
        </div>
      </div>

      {/* Selected Apartment Info Badge (when panel is not fully open) */}
      {selectedApartment && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none hidden">
          <div className="bg-white rounded-2xl shadow-lg px-4 py-2 text-sm font-medium text-gray-800">
            {selectedApartment.name}
          </div>
        </div>
      )}

      {/* Side Panel — only mounted when an apartment is selected; key resets state on change */}
      {selectedApartment && (
        <ApartmentPanel
          key={`${selectedApartment.lawdCd}-${selectedApartment.name}`}
          apartment={selectedApartment}
          filter={filter}
          onClose={handleClose}
        />
      )}

      {/* Map Attribution */}
      <div className="absolute bottom-2 right-2 z-20 text-[10px] text-gray-400">
        국토교통부 실거래가 공개시스템
      </div>
    </div>
  );
}

'use client';

import { FilterState } from '@/types';

interface Props {
  filter: FilterState;
  onChange: (filter: FilterState) => void;
}

const PRICE_OPTIONS = [
  { label: '전체', min: null, max: null },
  { label: '5억 이하', min: null, max: 50000 },
  { label: '5~10억', min: 50000, max: 100000 },
  { label: '10~20억', min: 100000, max: 200000 },
  { label: '20억 이상', min: 200000, max: null },
];

const AREA_OPTIONS = [
  { label: '전체', min: null, max: null },
  { label: '~59㎡', min: null, max: 59 },
  { label: '60~84㎡', min: 60, max: 84 },
  { label: '85~114㎡', min: 85, max: 114 },
  { label: '115㎡~', min: 115, max: null },
];

const PERIOD_OPTIONS = [
  { label: '3개월', value: 3 },
  { label: '6개월', value: 6 },
  { label: '1년', value: 12 },
  { label: '2년', value: 24 },
];

export default function FilterBar({ filter, onChange }: Props) {
  const update = (partial: Partial<FilterState>) =>
    onChange({ ...filter, ...partial });

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* 매매/전월세 */}
      <div className="flex bg-white rounded-full shadow-sm border border-gray-200 p-0.5">
        {(['buy', 'rent'] as const).map((type) => (
          <button
            key={type}
            onClick={() => update({ dealType: type })}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter.dealType === type
                ? 'bg-[#2f75e0] text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {type === 'buy' ? '매매' : '전월세'}
          </button>
        ))}
      </div>

      {/* 가격 필터 */}
      <div className="relative group">
        <button className="flex items-center gap-1 bg-white rounded-full shadow-sm border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:border-[#2f75e0] transition-colors">
          {filter.priceMin === null && filter.priceMax === null
            ? '가격'
            : PRICE_OPTIONS.find(
                (o) => o.min === filter.priceMin && o.max === filter.priceMax
              )?.label || '가격'}
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50 hidden group-hover:block min-w-[120px]">
          {PRICE_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => update({ priceMin: opt.min, priceMax: opt.max })}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors ${
                filter.priceMin === opt.min && filter.priceMax === opt.max
                  ? 'text-[#2f75e0] font-medium'
                  : 'text-gray-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 면적 필터 */}
      <div className="relative group">
        <button className="flex items-center gap-1 bg-white rounded-full shadow-sm border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:border-[#2f75e0] transition-colors">
          {filter.areaMin === null && filter.areaMax === null
            ? '면적'
            : AREA_OPTIONS.find(
                (o) => o.min === filter.areaMin && o.max === filter.areaMax
              )?.label || '면적'}
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50 hidden group-hover:block min-w-[120px]">
          {AREA_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => update({ areaMin: opt.min, areaMax: opt.max })}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors ${
                filter.areaMin === opt.min && filter.areaMax === opt.max
                  ? 'text-[#2f75e0] font-medium'
                  : 'text-gray-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 기간 필터 */}
      <div className="relative group">
        <button className="flex items-center gap-1 bg-white rounded-full shadow-sm border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:border-[#2f75e0] transition-colors">
          {PERIOD_OPTIONS.find((o) => o.value === filter.periodMonths)?.label || '기간'}
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50 hidden group-hover:block min-w-[100px]">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update({ periodMonths: opt.value })}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors ${
                filter.periodMonths === opt.value
                  ? 'text-[#2f75e0] font-medium'
                  : 'text-gray-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

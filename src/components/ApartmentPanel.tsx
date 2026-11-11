'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApartmentInfo, TradeRecord, RentRecord, ChartDataPoint, FilterState } from '@/types';
import { TradeList, RentList } from './TradeList';
import PriceChart from './PriceChart';
import { parseAmount, getPastMonths } from '@/lib/utils';

type Tab = 'buy' | 'jeonse' | 'monthly';

interface DataState {
  loading: boolean;
  hasLoaded: boolean;
  trades: TradeRecord[];
  rents: RentRecord[];
}

interface Props {
  apartment: ApartmentInfo;
  filter: FilterState;
  onClose: () => void;
}

function buildChartData(trades: TradeRecord[]): ChartDataPoint[] {
  const byMonth: Record<string, number[]> = {};
  trades.forEach((t) => {
    const key = `${t.dealYear}.${t.dealMonth.padStart(2, '0')}`;
    const amount = parseAmount(t.dealAmount);
    if (!amount) return;
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(amount);
  });
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, amounts]) => ({
      label,
      avg: Math.round(amounts.reduce((s, v) => s + v, 0) / amounts.length),
      min: Math.min(...amounts),
      max: Math.max(...amounts),
      count: amounts.length,
    }));
}

function buildRentChartData(rents: RentRecord[], isJeonse: boolean): ChartDataPoint[] {
  const byMonth: Record<string, number[]> = {};
  rents.forEach((r) => {
    const monthly = parseAmount(r.monthlyRent);
    if (isJeonse !== (!monthly || monthly === 0)) return;
    const key = `${r.dealYear}.${r.dealMonth.padStart(2, '0')}`;
    const amount = parseAmount(r.deposit);
    if (!amount) return;
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(amount);
  });
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, amounts]) => ({
      label,
      avg: Math.round(amounts.reduce((s, v) => s + v, 0) / amounts.length),
      min: Math.min(...amounts),
      max: Math.max(...amounts),
      count: amounts.length,
    }));
}

export default function ApartmentPanel({ apartment, filter, onClose }: Props) {
  const [tab, setTab] = useState<Tab>(filter.dealType === 'buy' ? 'buy' : 'jeonse');

  const [{ loading, hasLoaded, trades, rents }, setData] = useState<DataState>({
    loading: true,
    hasLoaded: false,
    trades: [],
    rents: [],
  });

  // Generation counter: only the latest fetch's results are applied
  const fetchGenRef = useRef(0);

  const fetchData = useCallback(async () => {
    const gen = ++fetchGenRef.current;

    setData({ loading: true, hasLoaded: false, trades: [], rents: [] });

    const months = getPastMonths(filter.periodMonths);
    const { lawdCd, name } = apartment;
    const keyword = name.split(' ')[0];

    try {
      const [tradeResults, rentResults] = await Promise.all([
        Promise.all(
          months.map((m) =>
            fetch(`/api/trade?lawdCd=${lawdCd}&dealYmd=${m}&numOfRows=200`)
              .then((r) => r.json())
              .then((d) => (d.items || []) as TradeRecord[])
          )
        ),
        Promise.all(
          months.map((m) =>
            fetch(`/api/rent?lawdCd=${lawdCd}&dealYmd=${m}&numOfRows=200`)
              .then((r) => r.json())
              .then((d) => (d.items || []) as RentRecord[])
          )
        ),
      ]);

      const sortedTrades = tradeResults
        .flat()
        .filter((t) => t.aptNm?.includes(keyword))
        .filter((t) => {
          const area = parseFloat(t.excluUseAr);
          if (filter.areaMin !== null && area < filter.areaMin) return false;
          if (filter.areaMax !== null && area > filter.areaMax) return false;
          return true;
        })
        .sort(
          (a, b) =>
            parseInt(`${b.dealYear}${b.dealMonth.padStart(2, '0')}${b.dealDay.padStart(2, '0')}`) -
            parseInt(`${a.dealYear}${a.dealMonth.padStart(2, '0')}${a.dealDay.padStart(2, '0')}`)
        );

      const sortedRents = rentResults
        .flat()
        .filter((r) => r.aptNm?.includes(keyword))
        .filter((r) => {
          const area = parseFloat(r.excluUseAr);
          if (filter.areaMin !== null && area < filter.areaMin) return false;
          if (filter.areaMax !== null && area > filter.areaMax) return false;
          return true;
        })
        .sort(
          (a, b) =>
            parseInt(`${b.dealYear}${b.dealMonth.padStart(2, '0')}`) -
            parseInt(`${a.dealYear}${a.dealMonth.padStart(2, '0')}`)
        );

      if (fetchGenRef.current !== gen) return;
      setData({ loading: false, hasLoaded: true, trades: sortedTrades, rents: sortedRents });
    } catch {
      if (fetchGenRef.current !== gen) return;
      setData({ loading: false, hasLoaded: true, trades: [], rents: [] });
    }
  }, [apartment, filter.periodMonths, filter.areaMin, filter.areaMax]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const jeonseRents = rents.filter((r) => !parseAmount(r.monthlyRent));
  const monthlyRents = rents.filter((r) => !!parseAmount(r.monthlyRent));

  const chartData =
    tab === 'buy'
      ? buildChartData(trades)
      : buildRentChartData(rents, tab === 'jeonse');

  const listData = tab === 'buy' ? trades : tab === 'jeonse' ? jeonseRents : monthlyRents;

  return (
    <div className="absolute top-0 right-0 h-full w-[360px] bg-white shadow-2xl flex flex-col z-40 animate-slide-in">
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b border-gray-100">
        <div>
          <h2 className="text-base font-bold text-gray-900">{apartment.name}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{apartment.address}</p>
          {apartment.buildYear && (
            <p className="text-xs text-gray-400">{apartment.buildYear}년 준공</p>
          )}
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors shrink-0">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {(['buy', 'jeonse', 'monthly'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors border-b-2 ${
              tab === t ? 'border-[#2f75e0] text-[#2f75e0]' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {t === 'buy' ? '매매' : t === 'jeonse' ? '전세' : '월세'}
            {hasLoaded && !loading && (
              <span className="ml-1 text-[10px]">
                ({t === 'buy' ? trades.length : t === 'jeonse' ? jeonseRents.length : monthlyRents.length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4 pb-2">
          <p className="text-xs font-medium text-gray-500 mb-2">
            {tab === 'buy' ? '매매가' : tab === 'jeonse' ? '전세 보증금' : '월세 보증금'} 추이
          </p>
          {(loading || !hasLoaded) ? (
            <div className="h-[180px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-[#2f75e0] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-gray-400">데이터 불러오는 중...</span>
              </div>
            </div>
          ) : (
            <PriceChart data={chartData} />
          )}
        </div>

        <div className="h-px bg-gray-100 mx-4" />

        <div className="px-4 py-3">
          <p className="text-xs font-medium text-gray-500 mb-2">실거래 내역</p>
          {(loading || !hasLoaded) ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center py-1">
                  <div className="space-y-1.5">
                    <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : tab === 'buy' ? (
            <TradeList trades={listData as TradeRecord[]} />
          ) : (
            <RentList rents={listData as RentRecord[]} />
          )}
        </div>
      </div>
    </div>
  );
}

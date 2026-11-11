'use client';

import { TradeRecord, RentRecord } from '@/types';
import { formatPrice, formatDealDate } from '@/lib/utils';

interface TradeListProps {
  trades: TradeRecord[];
  loading?: boolean;
}

interface RentListProps {
  rents: RentRecord[];
  loading?: boolean;
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center py-8 text-sm text-gray-400">
      거래 내역이 없습니다
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-2 px-1">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-10 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}

export function TradeList({ trades, loading }: TradeListProps) {
  if (loading) return <LoadingState />;
  if (!trades.length) return <EmptyState />;

  return (
    <div className="divide-y divide-gray-100">
      {trades.map((t, i) => (
        <div key={i} className="flex items-center justify-between py-2.5 px-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400">
              {formatDealDate(t.dealYear, t.dealMonth, t.dealDay)}
            </span>
            <span className="text-xs text-gray-500">
              {parseFloat(t.excluUseAr).toFixed(1)}㎡ · {t.floor}층
              {t.dealingGbn && (
                <span className="ml-1 text-gray-400">({t.dealingGbn})</span>
              )}
            </span>
          </div>
          <span className="text-sm font-semibold text-gray-800">
            {formatPrice(t.dealAmount)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function RentList({ rents, loading }: RentListProps) {
  if (loading) return <LoadingState />;
  if (!rents.length) return <EmptyState />;

  return (
    <div className="divide-y divide-gray-100">
      {rents.map((r, i) => {
        const isJeonse = !r.monthlyRent || r.monthlyRent === '0';
        return (
          <div key={i} className="flex items-center justify-between py-2.5 px-1">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    isJeonse
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-orange-50 text-orange-600'
                  }`}
                >
                  {isJeonse ? '전세' : '월세'}
                </span>
                <span className="text-xs text-gray-400">
                  {r.dealYear}.{r.dealMonth.padStart(2, '0')}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {parseFloat(r.excluUseAr).toFixed(1)}㎡ · {r.floor}층
              </span>
            </div>
            <div className="text-right">
              {isJeonse ? (
                <span className="text-sm font-semibold text-gray-800">
                  {formatPrice(r.deposit)}
                </span>
              ) : (
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-gray-800">
                    {formatPrice(r.deposit)}
                  </span>
                  <span className="text-xs text-orange-500">
                    월 {formatPrice(r.monthlyRent)}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

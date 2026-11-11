export interface TradeRecord {
  aptNm: string;
  buildYear: string;
  dealAmount: string;
  dealYear: string;
  dealMonth: string;
  dealDay: string;
  excluUseAr: string;
  floor: string;
  lawdCd: string;
  umdNm: string;
  jibun: string;
  dealingGbn?: string;
  rgstDate?: string;
  slerGbn?: string;
  buyerGbn?: string;
}

export interface RentRecord {
  aptNm: string;
  buildYear: string;
  monthlyRent: string;
  deposit: string;
  dealYear: string;
  dealMonth: string;
  excluUseAr: string;
  floor: string;
  lawdCd: string;
  umdNm: string;
  jibun: string;
  contractType?: string;
  preDeposit?: string;
  preMonthlyRent?: string;
}

export interface ApartmentInfo {
  name: string;
  address: string;
  lat: number;
  lng: number;
  lawdCd: string;
  umdNm: string;
  jibun: string;
  buildYear?: string;
  latestDealAmount?: string;
  latestDealArea?: string;
  latestDealDate?: string;
}

export type DealType = 'buy' | 'rent';
export type RentType = 'all' | 'jeonse' | 'monthly';

export interface FilterState {
  dealType: DealType;
  priceMin: number | null;
  priceMax: number | null;
  areaMin: number | null;
  areaMax: number | null;
  periodMonths: number;
}

export interface ChartDataPoint {
  label: string;
  avg: number;
  min: number;
  max: number;
  count: number;
}

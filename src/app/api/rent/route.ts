import { NextRequest, NextResponse } from 'next/server';
import { RentRecord } from '@/types';

const BASE_URL = 'https://apis.data.go.kr/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent';

// API already returns English camelCase field names — just normalize types to strings
function mapItem(item: Record<string, unknown>): RentRecord {
  const s = (v: unknown) => (v == null || String(v).trim() === '' ? '' : String(v).trim());
  return {
    aptNm: s(item.aptNm),
    buildYear: s(item.buildYear),
    monthlyRent: s(item.monthlyRent) || '0',
    deposit: s(item.deposit),
    dealYear: s(item.dealYear),
    dealMonth: s(item.dealMonth),
    excluUseAr: s(item.excluUseAr),
    floor: s(item.floor),
    lawdCd: s(item.sggCd),
    umdNm: s(item.umdNm),
    jibun: s(item.jibun),
    contractType: s(item.contractType),
    preDeposit: s(item.preDeposit),
    preMonthlyRent: s(item.preMonthlyRent),
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lawdCd = searchParams.get('lawdCd');
  const dealYmd = searchParams.get('dealYmd');
  const pageNo = searchParams.get('pageNo') || '1';
  const numOfRows = searchParams.get('numOfRows') || '100';

  if (!lawdCd || !dealYmd) {
    return NextResponse.json({ error: 'lawdCd and dealYmd are required' }, { status: 400 });
  }

  const serviceKey = process.env.SERVICE_KEY!;
  const params = new URLSearchParams({
    LAWD_CD: lawdCd,
    DEAL_YMD: dealYmd,
    pageNo,
    numOfRows,
    _type: 'json',
  });

  const url = `${BASE_URL}?serviceKey=${encodeURIComponent(serviceKey)}&${params.toString()}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();

    const body = data?.response?.body;
    if (!body) {
      return NextResponse.json({ items: [], totalCount: 0 });
    }

    const rawItems = body?.items?.item;
    if (!rawItems) {
      return NextResponse.json({ items: [], totalCount: body.totalCount || 0 });
    }

    const itemsArray = Array.isArray(rawItems) ? rawItems : [rawItems];
    const items: RentRecord[] = itemsArray.map(mapItem);

    return NextResponse.json({ items, totalCount: body.totalCount || items.length });
  } catch (err) {
    console.error('Rent API error:', err);
    return NextResponse.json({ error: 'Failed to fetch rent data' }, { status: 500 });
  }
}

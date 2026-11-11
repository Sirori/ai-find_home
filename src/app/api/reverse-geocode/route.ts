import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
  }

  const restKey = process.env.KAKAO_REST_KEY!;

  try {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${lng}&y=${lat}`,
      {
        headers: { Authorization: `KakaoAK ${restKey}` },
        next: { revalidate: 86400 },
      }
    );
    const data = await res.json();

    // Find the B (법정동) type result
    const documents: Array<{
      region_type: string;
      code: string;
      address_name: string;
      region_1depth_name: string;
      region_2depth_name: string;
      region_3depth_name: string;
    }> = data.documents || [];

    const bjdong = documents.find((d) => d.region_type === 'B');
    const hjdong = documents.find((d) => d.region_type === 'H');

    if (!bjdong) {
      return NextResponse.json({ error: 'Region not found' }, { status: 404 });
    }

    // LAWD_CD is first 5 digits of the 10-digit code
    const lawdCd = bjdong.code.slice(0, 5);

    return NextResponse.json({
      lawdCd,
      fullCode: bjdong.code,
      addressName: bjdong.address_name,
      region1: bjdong.region_1depth_name,
      region2: bjdong.region_2depth_name,
      region3: bjdong.region_3depth_name,
      hjdongCode: hjdong?.code || '',
    });
  } catch (err) {
    console.error('Reverse geocode error:', err);
    return NextResponse.json({ error: 'Failed to reverse geocode' }, { status: 500 });
  }
}

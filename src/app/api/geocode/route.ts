import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'query is required' }, { status: 400 });
  }

  const restKey = process.env.KAKAO_REST_KEY!;

  try {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=1`,
      {
        headers: { Authorization: `KakaoAK ${restKey}` },
        next: { revalidate: 86400 },
      }
    );
    const data = await res.json();

    const doc = data.documents?.[0];
    if (!doc) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      lat: parseFloat(doc.y),
      lng: parseFloat(doc.x),
      placeName: doc.place_name,
      addressName: doc.address_name,
      roadAddressName: doc.road_address_name,
    });
  } catch (err) {
    console.error('Geocode error:', err);
    return NextResponse.json({ error: 'Failed to geocode' }, { status: 500 });
  }
}

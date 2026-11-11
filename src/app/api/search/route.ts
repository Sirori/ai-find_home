import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ documents: [] });
  }

  const restKey = process.env.KAKAO_REST_KEY!;

  try {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query + ' 아파트')}&category_group_code=RE2&size=10`,
      {
        headers: { Authorization: `KakaoAK ${restKey}` },
      }
    );
    const data = await res.json();

    return NextResponse.json({ documents: data.documents || [] });
  } catch (err) {
    console.error('Search error:', err);
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
}

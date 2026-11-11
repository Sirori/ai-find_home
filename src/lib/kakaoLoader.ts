let promise: Promise<void> | null = null;

export function ensureKakaoMaps(): Promise<void> {
  if (promise) return promise;

  promise = new Promise<void>((resolve, reject) => {
    if (window.kakao?.maps?.Map) {
      resolve();
      return;
    }

    if (document.querySelector('#kakao-maps-sdk')) {
      const t = setInterval(() => {
        if (window.kakao?.maps?.Map) { clearInterval(t); resolve(); }
      }, 50);
      return;
    }

    const appKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY!;
    const s = document.createElement('script');
    s.id = 'kakao-maps-sdk';
    s.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`;
    s.onload = () => window.kakao.maps.load(() => resolve());
    s.onerror = () => { promise = null; reject(new Error('Kakao Maps load failed')); };
    document.head.appendChild(s);
  });

  return promise;
}

export function kakaoPlacesSearch(query: string, opts?: kakao.maps.services.PlaceSearchOptions): Promise<kakao.maps.services.PlaceSearchResult[]> {
  return new Promise((resolve) => {
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(query, (result, status) => {
      resolve(status === window.kakao.maps.services.Status.OK ? result : []);
    }, opts);
  });
}

export function kakaoGeocode(query: string): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(query, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
        resolve({ lat: parseFloat(result[0].y), lng: parseFloat(result[0].x) });
      } else {
        resolve(null);
      }
    }, { size: 1 });
  });
}

export function kakaoReverseGeocode(lat: number, lng: number): Promise<string | null> {
  return new Promise((resolve) => {
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.coord2RegionCode(lng, lat, (result, status) => {
      if (status !== window.kakao.maps.services.Status.OK) { resolve(null); return; }
      const bjdong = result.find((r) => r.region_type === 'B');
      resolve(bjdong ? bjdong.code.slice(0, 5) : null);
    });
  });
}

declare namespace kakao {
  namespace maps {
    function load(callback: () => void): void;

    class Map {
      constructor(container: HTMLElement, options: MapOptions);
      getCenter(): LatLng;
      setCenter(latlng: LatLng): void;
      getLevel(): number;
      setLevel(level: number): void;
      getBounds(): LatLngBounds;
      panTo(latlng: LatLng): void;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      getLat(): number;
      getLng(): number;
    }

    class LatLngBounds {
      getSouthWest(): LatLng;
      getNorthEast(): LatLng;
      extend(latlng: LatLng): void;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setMap(map: Map | null): void;
      getPosition(): LatLng;
    }

    class CustomOverlay {
      constructor(options: CustomOverlayOptions);
      setMap(map: Map | null): void;
      getPosition(): LatLng;
    }

    class InfoWindow {
      constructor(options: InfoWindowOptions);
      open(map: Map, marker: Marker): void;
      close(): void;
    }

    namespace event {
      function addListener(
        target: Map | Marker,
        type: string,
        handler: (event?: MouseEvent) => void
      ): void;
      function removeListener(
        target: Map | Marker,
        type: string,
        handler: (event?: MouseEvent) => void
      ): void;
    }

    namespace services {
      class Geocoder {
        addressSearch(
          address: string,
          callback: (result: AddressSearchResult[], status: Status) => void
        ): void;
        coord2Address(
          lng: number,
          lat: number,
          callback: (result: Coord2AddressResult[], status: Status) => void
        ): void;
        coord2RegionCode(
          lng: number,
          lat: number,
          callback: (result: RegionCodeResult[], status: Status) => void
        ): void;
      }

      class Places {
        keywordSearch(
          keyword: string,
          callback: (result: PlaceSearchResult[], status: Status, pagination: Pagination) => void,
          options?: PlaceSearchOptions
        ): void;
      }

      enum Status {
        OK = 'OK',
        ZERO_RESULT = 'ZERO_RESULT',
        ERROR = 'ERROR',
      }

      interface AddressSearchResult {
        address_name: string;
        category_group_code: string;
        category_group_name: string;
        category_name: string;
        distance: string;
        id: string;
        phone: string;
        place_name: string;
        place_url: string;
        road_address_name: string;
        x: string;
        y: string;
        address: {
          address_name: string;
          b_code: string;
          h_code: string;
          main_building_no: string;
          mountain_yn: string;
          region_1depth_name: string;
          region_2depth_name: string;
          region_3depth_name: string;
          sub_building_no: string;
          zip_code: string;
          x: string;
          y: string;
        };
      }

      interface Coord2AddressResult {
        road_address: {
          address_name: string;
          region_1depth_name: string;
          region_2depth_name: string;
          region_3depth_name: string;
        } | null;
        address: {
          address_name: string;
          region_1depth_name: string;
          region_2depth_name: string;
          region_3depth_name: string;
          mountain_yn: string;
          main_address_no: string;
          sub_address_no: string;
        };
      }

      interface RegionCodeResult {
        region_type: string;
        code: string;
        address_name: string;
        region_1depth_name: string;
        region_2depth_name: string;
        region_3depth_name: string;
        region_4depth_name: string;
        x: number;
        y: number;
      }

      interface PlaceSearchResult {
        id: string;
        place_name: string;
        category_name: string;
        category_group_code: string;
        category_group_name: string;
        phone: string;
        address_name: string;
        road_address_name: string;
        x: string;
        y: string;
        place_url: string;
        distance: string;
      }

      interface PlaceSearchOptions {
        category_group_code?: string;
        x?: number;
        y?: number;
        radius?: number;
        bounds?: LatLngBounds;
        rect?: string;
        size?: number;
        page?: number;
        sort?: string;
      }

      interface Pagination {
        totalCount: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
        current: number;
        gotoPage(page: number): void;
        nextPage(): void;
        prevPage(): void;
      }
    }

    interface MapOptions {
      center: LatLng;
      level?: number;
      mapTypeId?: string;
      draggable?: boolean;
      scrollwheel?: boolean;
      disableDoubleClick?: boolean;
    }

    interface MarkerOptions {
      position: LatLng;
      map?: Map;
      title?: string;
      draggable?: boolean;
      image?: MarkerImage;
    }

    interface MarkerImage {
      src: string;
      size: Size;
      options?: object;
    }

    interface Size {
      width: number;
      height: number;
    }

    interface CustomOverlayOptions {
      position: LatLng;
      content: string | HTMLElement;
      map?: Map;
      xAnchor?: number;
      yAnchor?: number;
      zIndex?: number;
    }

    interface InfoWindowOptions {
      content: string | HTMLElement;
      removable?: boolean;
      zIndex?: number;
    }

    interface MouseEvent {
      latLng: LatLng;
    }
  }
}

interface Window {
  kakao: typeof kakao;
}

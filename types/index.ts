export interface Hotel {
  id: number;
  name: string;
  description: string;
  stars: string;
  totalPrice: number;
  dailyPrice: number;
  tax: number;
  thumb: string;
  images?: string[]; // Array de imagens adicionais
  amenities: string[];
  hasBreakFast: boolean;
  hasRefundableRoom: boolean;
  district: string;
  placeId: number;
}

export interface HotelDetail {
  id: number;
  name: string;
  description: string;
  stars: string;
  amenities: Amenity[];
  hasBreakFast: boolean;
  hasRefundableRoom: boolean;
  fullAddress: string;
  images: string[];
}

export interface Amenity {
  key: string;
  label: string;
}

export interface Place {
  id: number;
  name: string;
  state: string;
  country: string;
}

export interface FilterState {
  minPrice: number;
  maxPrice: number;
  stars: string[];
  amenities: string[];
  hasBreakFast: boolean | null;
  hasRefundableRoom: boolean | null;
  placeId: number | null;
  searchQuery: string;
}

export interface SortOption {
  key: string;
  label: string;
  direction: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginationInfo {
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

export interface FilteredResponse {
  hotels: Hotel[];
  stats: {
    total: number;
    priceRange: { min: number; max: number };
    avgPrice: number;
  };
  pagination?: PaginationInfo;
}

export interface StatsResponse {
  total: number;
  priceRange: { min: number; max: number };
  avgPrice: number;
  starsDistribution: Record<string, number>;
  amenitiesCount: Record<string, number>;
}

export interface State {
  name: string;
  shortname: string;
}

export interface City {
  name: string;
  state: State;
  placeId: number;
}

export interface CitiesResponse {
  cities: City[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export interface Column {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'status';
  sortable?: boolean;
}

import type { Hotel, Place, Amenity, FilterState, SortOption } from '~/types'

export const useHotels = () => {
  const hotels = ref<Hotel[]>([])
  const places = ref<Place[]>([])
  const amenities = ref<Amenity[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Filter and sort state
  const filters = ref<FilterState>({
    minPrice: 0,
    maxPrice: 1000000,
    stars: [],
    amenities: [],
    hasBreakFast: null,
    hasRefundableRoom: null,
    placeId: null,
    searchQuery: ''
  })

  const sortBy = ref<SortOption>({
    key: 'totalPrice',
    label: 'Preço',
    direction: 'asc'
  })

  // Computed properties
  const filteredHotels = computed(() => {
    let result = [...hotels.value]

    // Filter by price
    result = result.filter(hotel =>
      hotel.totalPrice >= filters.value.minPrice &&
      hotel.totalPrice <= filters.value.maxPrice
    )

    // Filter by stars
    if (filters.value.stars.length > 0) {
      result = result.filter(hotel =>
        filters.value.stars.includes(hotel.stars)
      )
    }

    // Filter by amenities
    if (filters.value.amenities.length > 0) {
      result = result.filter(hotel =>
        filters.value.amenities.every(amenity =>
          hotel.amenities.includes(amenity)
        )
      )
    }

    // Filter by breakfast
    if (filters.value.hasBreakFast !== null) {
      result = result.filter(hotel =>
        hotel.hasBreakFast === filters.value.hasBreakFast
      )
    }

    // Filter by refundable room
    if (filters.value.hasRefundableRoom !== null) {
      result = result.filter(hotel =>
        hotel.hasRefundableRoom === filters.value.hasRefundableRoom
      )
    }

    // Filter by place
    if (filters.value.placeId) {
      result = result.filter(hotel =>
        hotel.placeId === filters.value.placeId
      )
    }

    // Sort
    result.sort((a, b) => {
      const aValue = a[sortBy.value.key as keyof Hotel]
      const bValue = b[sortBy.value.key as keyof Hotel]

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortBy.value.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortBy.value.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return 0
    })

    return result
  })

  const stats = computed(() => {
    const total = hotels.value.length
    const filtered = filteredHotels.value.length
    const avgPrice = hotels.value.length > 0
      ? hotels.value.reduce((sum, hotel) => sum + hotel.totalPrice, 0) / hotels.value.length
      : 0
    const priceRange = {
      min: Math.min(...hotels.value.map(h => h.totalPrice)),
      max: Math.max(...hotels.value.map(h => h.totalPrice))
    }

    return {
      total,
      filtered,
      avgPrice: Math.round(avgPrice),
      priceRange
    }
  })

  // Actions
  const fetchData = async () => {
    loading.value = true
    error.value = null

    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000))

      const response = await fetch('/data/hotels.json')
      const data = await response.json()

      hotels.value = data.hotels
      places.value = data.places
      amenities.value = data.amenities
    } catch (err) {
      error.value = 'Failed to fetch hotels data'
    } finally {
      loading.value = false
    }
  }

  const updateFilters = (newFilters: Partial<FilterState>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const updateSort = (newSort: SortOption) => {
    sortBy.value = newSort
  }

  const resetFilters = () => {
    filters.value = {
      minPrice: 0,
      maxPrice: 1000000,
      stars: [],
      amenities: [],
      hasBreakFast: null,
      hasRefundableRoom: null,
      placeId: null,
      searchQuery: ''
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100)
  }

  const getAmenityLabel = (key: string) => {
    const amenity = amenities.value.find(a => a.key === key)
    return amenity?.label || key
  }

  const getPlaceName = (placeId: number) => {
    const place = places.value.find(p => p.id === placeId)
    return place?.name || 'Unknown'
  }

  return {
    // State
    hotels,
    places,
    amenities,
    loading,
    error,
    filters,
    sortBy,

    // Computed
    filteredHotels,
    stats,

    // Actions
    fetchData,
    updateFilters,
    updateSort,
    resetFilters,
    formatPrice,
    getAmenityLabel,
    getPlaceName
  }
}

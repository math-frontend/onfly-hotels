import { defineStore } from 'pinia'
import type { Hotel, Place, Amenity, FilterState, SortOption, ApiResponse, City, PaginationInfo } from '~/types'

// Configurações da API
const API_BASE_URL = 'http://localhost:3001/api'

// Tipos para respostas da API
interface FilteredResponse {
  hotels: Hotel[]
  stats: {
    total: number
    priceRange: { min: number; max: number }
    avgPrice: number
  }
}

interface StatsResponse {
  total: number
  priceRange: { min: number; max: number }
  avgPrice: number
  starsDistribution: Record<string, number>
  amenitiesCount: Record<string, number>
}

export const useHotelsStore = defineStore('hotels', () => {
  // ===== STATE =====
  const hotels = ref<Hotel[]>([])
  const places = ref<Place[]>([])
  const amenities = ref<Amenity[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Estado da paginação
  const pagination = ref<PaginationInfo>({
    total: 0,
    offset: 0,
    limit: 6, // Alterado para 6 hotéis por página
    hasMore: false,
    currentPage: 1,
    totalPages: 0
  })

  // Estado para load infinito
  const isLoadingMore = ref(false)
  const hasInitialLoad = ref(false)

  // Estado dos filtros
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

  // Estado da ordenação
  const sortBy = ref<SortOption>({
    key: 'totalPrice',
    label: 'Preço',
    direction: 'asc'
  })

  // Estado das estatísticas
  const stats = ref<StatsResponse>({
    total: 0,
    priceRange: { min: 0, max: 0 },
    avgPrice: 0,
    starsDistribution: {},
    amenitiesCount: {}
  })

  // Estado do drawer de detalhes do hotel
  const selectedHotel = ref<Hotel | null>(null)
  const isDrawerOpen = ref(false)

  // ===== CITY SEARCH STATE =====
  const citySearchQuery = ref('')
  const citySearchResults = ref<City[]>([])
  const citySearchLoading = ref(false)
  const citySearchError = ref<string | null>(null)
  const citySearchCache = ref<Map<string, City[]>>(new Map())
  const citySearchDebounceTimer = ref<NodeJS.Timeout | null>(null)

  // ===== COMPUTED PROPERTIES =====
  const filteredHotels = computed(() => {
    let result = [...hotels.value]

    // Filter by search query
    if (filters.value.searchQuery.trim()) {
      const query = normalizeText(filters.value.searchQuery)
      result = result.filter(hotel =>
        normalizeText(hotel.name).includes(query) ||
        normalizeText(hotel.district).includes(query) ||
        normalizeText(getPlaceName(hotel.placeId)).includes(query)
      )
    }

    // Filter by price range
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
    if (filters.value.placeId !== null) {
      result = result.filter(hotel =>
        hotel.placeId === filters.value.placeId
      )
    }

    // Sort results
    result.sort((a, b) => {
      const { key, direction } = sortBy.value

      if (key === 'totalPrice') {
        return direction === 'asc' ? a.totalPrice - b.totalPrice : b.totalPrice - a.totalPrice
      } else if (key === 'stars') {
        return direction === 'asc' ? parseInt(a.stars) - parseInt(b.stars) : parseInt(b.stars) - parseInt(a.stars)
      } else if (key === 'name') {
        return direction === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      }

      return 0
    })

    return result
  })

  const filteredStats = computed(() => {
    const total = hotels.value.length
    const avgPrice = total > 0
      ? Math.round(hotels.value.reduce((sum, h) => sum + h.totalPrice, 0) / total)
      : 0
    const priceRange = total > 0
      ? {
          min: Math.min(...hotels.value.map(h => h.totalPrice)),
          max: Math.max(...hotels.value.map(h => h.totalPrice))
        }
      : { min: 0, max: 0 }

    return { total, avgPrice, priceRange }
  })

  // Computed para verificar se há filtros ativos
  const hasActiveFilters = computed(() => {
    return (
      filters.value.minPrice > 0 ||
      filters.value.maxPrice < 1000000 ||
      filters.value.stars.length > 0 ||
      filters.value.amenities.length > 0 ||
      filters.value.hasBreakFast !== null ||
      filters.value.hasRefundableRoom !== null ||
      filters.value.placeId !== null ||
      filters.value.searchQuery.trim() !== ''
    )
  })

  // Computed para contar filtros ativos
  const activeFiltersCount = computed(() => {
    let count = 0
    if (filters.value.minPrice > 0 || filters.value.maxPrice < 1000000) count++
    if (filters.value.stars.length > 0) count++
    if (filters.value.amenities.length > 0) count++
    if (filters.value.hasBreakFast !== null) count++
    if (filters.value.hasRefundableRoom !== null) count++
    if (filters.value.placeId !== null) count++
    if (filters.value.searchQuery.trim() !== '') count++
    return count
  })

  // Computed para hotéis agrupados por estrelas
  const hotelsByStars = computed(() => {
    const grouped = hotels.value.reduce((acc, hotel) => {
      const stars = hotel.stars
      if (!acc[stars]) acc[stars] = []
      acc[stars].push(hotel)
      return acc
    }, {} as Record<string, Hotel[]>)

    return grouped
  })

  // Computed para hotéis agrupados por lugar
  const hotelsByPlace = computed(() => {
    const grouped = hotels.value.reduce((acc, hotel) => {
      const placeName = getPlaceName(hotel.placeId)
      if (!acc[placeName]) acc[placeName] = []
      acc[placeName].push(hotel)
      return acc
    }, {} as Record<string, Hotel[]>)

    return grouped
  })

  // Computed para estatísticas de preço
  const priceStats = computed(() => {
    if (hotels.value.length === 0) {
      return { min: 0, max: 0, avg: 0, median: 0 }
    }

    const prices = hotels.value.map(h => h.totalPrice).sort((a, b) => a - b)
    const min = prices[0]
    const max = prices[prices.length - 1]
    const avg = Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length)
    const median = prices[Math.floor(prices.length / 2)]

    return { min, max, avg, median }
  })

  // ===== CITY SEARCH COMPUTED =====
  const formattedCityResults = computed(() => {
    return citySearchResults.value.map(city => ({
      ...city,
      displayName: `${city.name}, ${city.state.shortname}`,
      fullName: `${city.name}, ${city.state.name}`
    }))
  })

  const hasCitySearchResults = computed(() => citySearchResults.value.length > 0)
  const shouldShowCitySearch = computed(() => citySearchQuery.value.length >= 3)

  // ===== UTILITY FUNCTIONS =====
  // Helper function to extract data from API response
  const extractData = <T>(response: T | { success: boolean; data: T }): T => {
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      return (response as { success: boolean; data: T }).data
    }
    return response as T
  }

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100)
  }

  const getAmenityLabel = (key: string): string => {
    const amenityMap: Record<string, string> = {
      'WI_FI': 'Wi-fi grátis',
      'PARKING': 'Estacionamento',
      'POOL': 'Piscina',
      'RESTAURANT': 'Restaurante',
      'FITNESS_CENTER': 'Academia',
      'ROOM_SERVICE': 'Serviço de quarto',
      'STEAM_ROOM': 'Sauna',
      'PET_FRIENDLY': 'Aceita pets',
      'BAR': 'Bar',
      'SPA': 'Spa',
      'ACCESSIBILITY': 'Acessibilidade',
      'AIR_CONDITIONING': 'Ar-condicionado'
    }
    return amenityMap[key] || key
  }

  const getAmenityIcon = (key: string): string => {
    const iconMap: Record<string, string> = {
      'WI_FI': 'wifi',
      'PARKING': 'local_parking',
      'POOL': 'pool',
      'RESTAURANT': 'restaurant',
      'FITNESS_CENTER': 'fitness_center',
      'ROOM_SERVICE': 'room_service',
      'STEAM_ROOM': 'hot_tub',
      'PET_FRIENDLY': 'pets',
      'BAR': 'local_bar',
      'SPA': 'spa',
      'ACCESSIBILITY': 'accessible',
      'AIR_CONDITIONING': 'ac_unit'
    }
    return iconMap[key] || 'check'
  }

  const getAmenityColor = (key: string): string => {
    const colorMap: Record<string, string> = {
      'WI_FI': '#007bff',
      'PARKING': '#28a745',
      'POOL': '#17a2b8',
      'RESTAURANT': '#fd7e14',
      'FITNESS_CENTER': '#e83e8c',
      'ROOM_SERVICE': '#6f42c1',
      'STEAM_ROOM': '#20c997',
      'PET_FRIENDLY': '#ffc107',
      'BAR': '#dc3545',
      'SPA': '#6f42c1',
      'ACCESSIBILITY': '#20c997',
      'AIR_CONDITIONING': '#17a2b8'
    }
    return colorMap[key] || '#6c757d'
  }

  const getPlaceName = (placeId: number): string => {
    const place = places.value.find(p => p.id === placeId)
    return place ? `${place.name}, ${place.state}` : 'Local não encontrado'
  }

  const buildQueryParams = (filters: FilterState, sortBy: SortOption, offset?: number, limit?: number): URLSearchParams => {
    const params = new URLSearchParams()

    // Parâmetros de busca
    if (filters.searchQuery) params.append('q', filters.searchQuery)
    if (filters.minPrice > 0) params.append('minPrice', filters.minPrice.toString())
    if (filters.maxPrice < 1000000) params.append('maxPrice', filters.maxPrice.toString())
    if (filters.stars.length > 0) params.append('stars', filters.stars.join(','))
    if (filters.amenities.length > 0) params.append('amenities', filters.amenities.join(','))
    if (filters.hasBreakFast !== null) params.append('hasBreakFast', filters.hasBreakFast.toString())
    if (filters.hasRefundableRoom !== null) params.append('hasRefundableRoom', filters.hasRefundableRoom.toString())
    if (filters.placeId) params.append('placeId', filters.placeId.toString())

    // Parâmetros de ordenação
    if (sortBy.key) params.append('sortBy', sortBy.key)
    if (sortBy.direction) params.append('sortOrder', sortBy.direction)

    // Parâmetros de paginação
    if (offset !== undefined) params.append('offset', offset.toString())
    if (limit !== undefined) params.append('limit', limit.toString())

    return params
  }

  // ===== API FUNCTIONS =====
  const apiRequest = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    try {
      const url = `${API_BASE_URL}${endpoint}`

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      throw err
    }
  }

  // ===== PAGINATION ACTIONS =====

  const loadMoreHotels = async (): Promise<void> => {
    if (isLoadingMore.value || !pagination.value.hasMore) return

    isLoadingMore.value = true
    pagination.value.offset += pagination.value.limit

    try {
      await fetchFilteredHotels(false)
    } catch (err) {
      // Reverter offset em caso de erro
      pagination.value.offset -= pagination.value.limit
    } finally {
      isLoadingMore.value = false
    }
  }

  const goToPage = async (page: number): Promise<void> => {
    if (page < 1 || page > pagination.value.totalPages) return

    const offset = (page - 1) * pagination.value.limit
    pagination.value.offset = offset
    pagination.value.currentPage = page

    console.log('Navegando para página:', page, 'offset:', offset)
    await fetchFilteredHotels(false) // Não resetar para navegação por página
  }

  const resetPagination = (): void => {
    pagination.value = {
      total: 0,
      offset: 0,
      limit: 6, // Alterado para 6 hotéis por página
      hasMore: false,
      currentPage: 1,
      totalPages: 0
    }
    hotels.value = []
    hasInitialLoad.value = false
  }

  const updateItemsPerPage = async (newLimit: number): Promise<void> => {
    pagination.value.limit = newLimit
    pagination.value.offset = 0
    pagination.value.currentPage = 1
    hotels.value = []
    await fetchFilteredHotels(true) // Sempre resetar ao mudar itens por página
  }

  // ===== ACTIONS =====

  // Busca unificada que pode lidar com diferentes tipos de busca
  const unifiedSearch = async (query: string, type?: 'hotel' | 'place' | 'city'): Promise<void> => {
    try {
      if (type === 'place') {
        // Buscar por lugar específico
        const place = places.value.find(p =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.state.toLowerCase().includes(query.toLowerCase())
        )

        if (place) {
          updateFilters({ placeId: place.id, searchQuery: '' })
        }
      } else if (type === 'city') {
        // Buscar por cidade
        const place = places.value.find(p =>
          p.name.toLowerCase().includes(query.toLowerCase())
        )

        if (place) {
          updateFilters({ placeId: place.id, searchQuery: '' })
        } else {
          // Se não encontrar a cidade, fazer busca geral
          await searchHotels(query)
        }
      } else {
        // Busca geral por hotéis
        await searchHotels(query)
      }
    } catch (err) {
      // Error handling
    }
  }

  const fetchInitialData = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      // Buscar dados em paralelo
      const [placesResponse, amenitiesResponse, statsResponse] = await Promise.all([
        apiRequest<Place[] | { success: boolean; data: Place[] }>('/places'),
        apiRequest<Amenity[] | { success: boolean; data: Amenity[] }>('/amenities'),
        apiRequest<StatsResponse | { success: boolean; data: StatsResponse }>('/hotels/stats')
      ])

      places.value = extractData(placesResponse)
      amenities.value = extractData(amenitiesResponse)
      stats.value = extractData(statsResponse)

      // Carregar hotéis com paginação (não definir loading aqui, pois fetchFilteredHotels já faz isso)
      await fetchFilteredHotels()

    } catch (err) {
      error.value = 'Erro ao carregar dados iniciais'
      loading.value = false
    }
    // Removido o finally para não interferir com o loading do fetchFilteredHotels
  }

    const fetchFilteredHotels = async (resetPagination: boolean = true): Promise<void> => {
    if (resetPagination) {
      pagination.value.offset = 0
      pagination.value.currentPage = 1
      hotels.value = []
    }

    // Sempre definir loading para garantir estado consistente
    loading.value = true
    error.value = null

    try {
      const params = buildQueryParams(
        filters.value,
        sortBy.value,
        pagination.value.offset,
        pagination.value.limit
      )

      console.log('Fazendo requisição para:', `/hotels/filtered?${params}`)
      const response = await apiRequest<FilteredResponse | { success: boolean; data: FilteredResponse }>(`/hotels/filtered?${params}`)

      const data = extractData(response)
      console.log('Resposta da API:', data)

      // Garantir que temos hotéis válidos
      const hotelsData = data.hotels || data || []

      if (resetPagination) {
        hotels.value = hotelsData
      } else {
        // Para navegação por página, substituir os hotéis ao invés de concatenar
        hotels.value = hotelsData
      }

      // Atualizar informações de paginação
      const responseData = data as any
      if (responseData.pagination) {
        pagination.value = {
          ...responseData.pagination,
          currentPage: Math.floor(responseData.pagination.offset / responseData.pagination.limit) + 1,
          totalPages: Math.ceil(responseData.pagination.total / responseData.pagination.limit)
        }
        console.log('Paginação atualizada:', pagination.value)
      } else if (responseData.data?.pagination) {
        // Fallback para estrutura aninhada
        pagination.value = {
          ...responseData.data.pagination,
          currentPage: Math.floor(responseData.data.pagination.offset / responseData.data.pagination.limit) + 1,
          totalPages: Math.ceil(responseData.data.pagination.total / responseData.data.pagination.limit)
        }
        console.log('Paginação atualizada (fallback):', pagination.value)
      }

      hasInitialLoad.value = true
    } catch (err) {
      console.error('Erro ao carregar hotéis:', err)
      error.value = 'Erro ao carregar hotéis'
    } finally {
      loading.value = false
    }
  }

  const fetchHotels = async (): Promise<void> => {
    await fetchFilteredHotels()
  }

  const fetchStats = async (): Promise<void> => {
    try {
      const response = await apiRequest<StatsResponse | { success: boolean; data: StatsResponse }>('/hotels/stats')

      stats.value = extractData(response)
    } catch (err) {
      // Error handling
    }
  }

  // ===== FILTER ACTIONS =====

  // Atualizar filtros gerais
  const updateFilters = (newFilters: Partial<FilterState>): void => {
    filters.value = { ...filters.value, ...newFilters }
    // Resetar paginação quando filtros mudam
    resetPagination()
    debouncedFetchHotels()
  }

  // Filtros específicos por tipo
  const updatePriceFilter = (minPrice: number, maxPrice: number): void => {
    filters.value.minPrice = minPrice
    filters.value.maxPrice = maxPrice
    resetPagination()
    debouncedFetchHotels()
  }

  const updateStarsFilter = (stars: string[]): void => {
    filters.value.stars = stars
    resetPagination()
    debouncedFetchHotels()
  }

  const updateAmenitiesFilter = (amenities: string[]): void => {
    filters.value.amenities = amenities
    resetPagination()
    debouncedFetchHotels()
  }

  const updateBreakfastFilter = (hasBreakFast: boolean | null): void => {
    filters.value.hasBreakFast = hasBreakFast
    resetPagination()
    debouncedFetchHotels()
  }

  const updateRefundableFilter = (hasRefundableRoom: boolean | null): void => {
    filters.value.hasRefundableRoom = hasRefundableRoom
    resetPagination()
    debouncedFetchHotels()
  }

  const updatePlaceFilter = (placeId: number | null): void => {
    filters.value.placeId = placeId
    resetPagination()
    debouncedFetchHotels()
  }

  const updateSearchQuery = (searchQuery: string): void => {
    filters.value.searchQuery = searchQuery
    resetPagination()
    debouncedFetchHotels()
  }

  // Adicionar/remover filtros individuais
  const addStarFilter = (star: string): void => {
    if (!filters.value.stars.includes(star)) {
      filters.value.stars.push(star)
      debouncedFetchHotels()
    }
  }

  const removeStarFilter = (star: string): void => {
    filters.value.stars = filters.value.stars.filter(s => s !== star)
    debouncedFetchHotels()
  }

  const addAmenityFilter = (amenity: string): void => {
    if (!filters.value.amenities.includes(amenity)) {
      filters.value.amenities.push(amenity)
      debouncedFetchHotels()
    }
  }

  const removeAmenityFilter = (amenity: string): void => {
    filters.value.amenities = filters.value.amenities.filter(a => a !== amenity)
    debouncedFetchHotels()
  }

  // Ordenação
  const updateSort = (newSort: SortOption): void => {
    sortBy.value = newSort
    // Resetar paginação quando ordenação muda
    resetPagination()
    fetchFilteredHotels()
  }

  const sortByPrice = (direction: 'asc' | 'desc' = 'asc'): void => {
    sortBy.value = { key: 'totalPrice', label: 'Preço', direction }
    fetchFilteredHotels()
  }

  const sortByStars = (direction: 'asc' | 'desc' = 'desc'): void => {
    sortBy.value = { key: 'stars', label: 'Classificação', direction }
    fetchFilteredHotels()
  }

  const sortByName = (direction: 'asc' | 'desc' = 'asc'): void => {
    sortBy.value = { key: 'name', label: 'Nome', direction }
    fetchFilteredHotels()
  }

  // Resetar filtros
  const resetFilters = (): void => {
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
    resetPagination()
    fetchFilteredHotels()
  }

  const resetPriceFilter = (): void => {
    filters.value.minPrice = 0
    filters.value.maxPrice = 1000000
    debouncedFetchHotels()
  }

  const resetStarsFilter = (): void => {
    filters.value.stars = []
    debouncedFetchHotels()
  }

  const resetAmenitiesFilter = (): void => {
    filters.value.amenities = []
    debouncedFetchHotels()
  }

  const resetSearchQuery = (): void => {
    filters.value.searchQuery = ''
    debouncedFetchHotels()
  }

  // ===== DEBOUNCE FUNCTION =====
  let debounceTimer: NodeJS.Timeout | null = null
  const debouncedFetchHotels = (): void => {
    if (debounceTimer) clearTimeout(debounceTimer)

    // Definir loading imediatamente quando filtros mudam
    loading.value = true
    error.value = null

    debounceTimer = setTimeout(async () => {
      try {
        await fetchFilteredHotels(true) // Sempre resetar paginação em busca
      } catch (error) {
        console.error('Erro no debounced fetch:', error)
      }
    }, 300)
  }

  // ===== CITY SEARCH ACTIONS =====
  const searchCities = async (query: string): Promise<void> => {
    if (query.length < 3) {
      citySearchResults.value = []
      return
    }

    if (citySearchCache.value.has(query)) {
      citySearchResults.value = citySearchCache.value.get(query) || []
      return
    }

    citySearchLoading.value = true
    citySearchError.value = null

    try {
      const response = await apiRequest<City[] | { success: boolean; data: City[] }>(`/cities?name_like=${encodeURIComponent(query)}`)
      const data = extractData(response)
      citySearchResults.value = data
      citySearchCache.value.set(query, data)
    } catch (err) {
      citySearchError.value = 'Erro ao buscar cidades'
    } finally {
      citySearchLoading.value = false
    }
  }

  const selectCity = (city: City): void => {
    updateFilters({ placeId: city.placeId, searchQuery: '' })
    citySearchQuery.value = ''
    citySearchResults.value = []
  }

  const updateCitySearchQuery = (query: string): void => {
    citySearchQuery.value = query

    // Clear previous timer
    if (citySearchDebounceTimer.value) {
      clearTimeout(citySearchDebounceTimer.value)
    }

    // Set new timer for debounced search
    citySearchDebounceTimer.value = setTimeout(() => {
      searchCities(query)
    }, 300)
  }

  const clearCitySearch = (): void => {
    citySearchQuery.value = ''
    citySearchResults.value = []
    citySearchError.value = null
    if (citySearchDebounceTimer.value) {
      clearTimeout(citySearchDebounceTimer.value)
    }
  }

  // ===== SEARCH ACTIONS =====
  const searchHotels = async (query: string): Promise<void> => {
    // Atualizar o filtro de busca
    updateFilters({ searchQuery: query })

    // Fazer a requisição para a API com a busca
    try {
      const params = new URLSearchParams()
      if (query.trim()) {
        params.append('q', query.trim())
      }

      const response = await apiRequest<{ success: boolean; data: Hotel[] }>(`/hotels/search?${params}`)

      // A API retorna { success: true, data: [...] }
      if (response.success && response.data) {
        hotels.value = response.data
      } else {
        hotels.value = []
      }
    } catch (err) {
      // Em caso de erro, fazer busca local
      performLocalSearch(query)
    }
  }

  // Função para normalizar texto (remover acentos e converter para minúsculas)
  const normalizeText = (text: string): string => {
    return text
      .normalize('NFD') // Decompor caracteres acentuados
      .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos (acentos)
      .toLowerCase() // Converter para minúsculas
  }

  // Busca local quando a API falha
  const performLocalSearch = (query: string): void => {
    const searchTerm = normalizeText(query)

    // Buscar por nome do hotel, distrito ou lugar
    const filteredHotels = hotels.value.filter(hotel => {
      const hotelName = normalizeText(hotel.name)
      const district = normalizeText(hotel.district)
      const place = normalizeText(getPlaceName(hotel.placeId))

      return hotelName.includes(searchTerm) ||
             district.includes(searchTerm) ||
             place.includes(searchTerm)
    })

    hotels.value = filteredHotels
  }

  // ===== DRAWER ACTIONS =====
  const openHotelDrawer = async (hotel: Hotel): Promise<void> => {
    try {
      // Buscar detalhes completos do hotel via API
      const hotelDetails = await fetchHotelById(hotel.id)

      selectedHotel.value = hotelDetails
      isDrawerOpen.value = true
    } catch (error) {
      // Fallback: usar o hotel básico se a API falhar
      selectedHotel.value = hotel
      isDrawerOpen.value = true
    }
  }

  const closeHotelDrawer = (): void => {
    selectedHotel.value = null
    isDrawerOpen.value = false
  }

  // ===== HOTEL DETAILS ACTIONS =====
  const fetchHotelById = async (id: number): Promise<Hotel> => {
    try {
      const response = await apiRequest<Hotel | { success: boolean; data: Hotel }>(`/hotels/${id}`)

      const hotel = extractData(response)

      // Garantir que o hotel tenha o campo images
      if (!hotel.images) {
        hotel.images = [hotel.thumb]
      }

      return hotel
    } catch (error) {
      throw error
    }
  }

  const getHotelDetails = async (id: number): Promise<Hotel | null> => {
    try {
      return await fetchHotelById(id)
    } catch (error) {
      return null
    }
  }

  // ===== UTILITY ACTIONS =====
  const getHotelById = (id: number): Hotel | undefined => {
    return hotels.value.find(hotel => hotel.id === id)
  }

  const getHotelsByPlace = (placeId: number): Hotel[] => {
    return hotels.value.filter(hotel => hotel.placeId === placeId)
  }

  const getHotelsByStars = (stars: string): Hotel[] => {
    return hotels.value.filter(hotel => hotel.stars === stars)
  }

  const getHotelsByPriceRange = (min: number, max: number): Hotel[] => {
    return hotels.value.filter(hotel =>
      hotel.totalPrice >= min && hotel.totalPrice <= max
    )
  }

  const getHotelsWithAmenity = (amenity: string): Hotel[] => {
    return hotels.value.filter(hotel => hotel.amenities.includes(amenity))
  }

  // ===== EXPORT =====

  return {
    // State
    hotels,
    places: readonly(places),
    amenities: readonly(amenities),
    loading: readonly(loading),
    error: readonly(error),
    filters,
    sortBy: readonly(sortBy),
    stats: readonly(stats),
    selectedHotel: readonly(selectedHotel),
    isDrawerOpen: readonly(isDrawerOpen),

    // Pagination State
    pagination: readonly(pagination),
    isLoadingMore: readonly(isLoadingMore),
    hasInitialLoad: readonly(hasInitialLoad),

    // Computed
    filteredHotels,
    filteredStats,
    hasActiveFilters,
    activeFiltersCount,
    hotelsByStars,
    hotelsByPlace,
    priceStats,

    // Actions - Filtros
    updateFilters,
    updatePriceFilter,
    updateStarsFilter,
    updateAmenitiesFilter,
    updateBreakfastFilter,
    updateRefundableFilter,
    updatePlaceFilter,
    updateSearchQuery,
    addStarFilter,
    removeStarFilter,
    addAmenityFilter,
    removeAmenityFilter,

    // Actions - Ordenação
    updateSort,
    sortByPrice,
    sortByStars,
    sortByName,

    // Actions - Reset
    resetFilters,
    resetPriceFilter,
    resetStarsFilter,
    resetAmenitiesFilter,
    resetSearchQuery,

    // Actions - API
    fetchInitialData,
    fetchHotels,
    fetchStats,
    searchHotels,
    performLocalSearch,

    // Actions - Drawer
    openHotelDrawer,
    closeHotelDrawer,

    // Actions - Hotel Details
    fetchHotelById,
    getHotelDetails,

    // Actions - Utilitários
    getHotelById,
    getHotelsByPlace,
    getHotelsByStars,
    getHotelsByPriceRange,
    getHotelsWithAmenity,

    // Actions - Paginação
    loadMoreHotels,
    goToPage,
    resetPagination,
    updateItemsPerPage,

    // Utilities
    formatPrice,
    getAmenityLabel,
    getAmenityIcon,
    getAmenityColor,
    getPlaceName,

    // City Search
    citySearchQuery: readonly(citySearchQuery),
    citySearchResults: readonly(citySearchResults),
    citySearchLoading: readonly(citySearchLoading),
    citySearchError: readonly(citySearchError),
    formattedCityResults: readonly(formattedCityResults),
    hasCitySearchResults: readonly(hasCitySearchResults),
    shouldShowCitySearch: readonly(shouldShowCitySearch),
    updateCitySearchQuery,
    clearCitySearch,
    selectCity
  }
})

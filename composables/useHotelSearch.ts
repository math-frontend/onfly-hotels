import { ref, computed } from 'vue'
import type { Hotel, Place, City } from '~/types'

export const useHotelSearch = () => {
  const hotelsStore = useHotelsStore()
  const { searchCities } = useApi()

  // State
  const searchQuery = ref('')
  const isSearching = ref(false)
  const showSuggestions = ref(false)
  const selectedSuggestionIndex = ref(-1)

  // Buscas recentes
  const recentSearches = ref<string[]>([])
  const MAX_RECENT_SEARCHES = 5

  // Sugestões de busca unificadas
  const searchSuggestions = ref<Array<{
    id: string
    name: string
    detail: string
    type: 'hotel' | 'place' | 'city'
    action: 'search' | 'filter'
    data?: any
  }>>([])

  // Cache de cidades para evitar requisições desnecessárias
  const citiesCache = ref<City[]>([])

  // Computed
  const hasRecentSearches = computed(() => recentSearches.value.length > 0)
  const hasSuggestions = computed(() => searchSuggestions.value.length > 0)

  // Methods
  const generateSearchSuggestions = async (query: string) => {
    if (!query.trim()) {
      searchSuggestions.value = []
      return
    }

    const searchTerm = query.toLowerCase()
    const suggestions: Array<{
      id: string
      name: string
      detail: string
      type: 'hotel' | 'place' | 'city'
      action: 'search' | 'filter'
      data?: any
    }> = []

    try {
      // 1. Sugestões de hotéis (busca local)
      hotelsStore.hotels.forEach(hotel => {
        if (hotel.name.toLowerCase().includes(searchTerm) ||
            hotel.district.toLowerCase().includes(searchTerm)) {
          suggestions.push({
            id: `hotel-${hotel.id}`,
            name: hotel.name,
            detail: `${hotel.stars} estrelas • ${hotelsStore.formatPrice(hotel.totalPrice)} • ${hotel.district}`,
            type: 'hotel',
            action: 'search',
            data: hotel
          })
        }
      })

      // 2. Sugestões de lugares (destinos)
      hotelsStore.places.forEach(place => {
        if (place.name.toLowerCase().includes(searchTerm) ||
            place.state.toLowerCase().includes(searchTerm)) {
          const hotelsInPlace = hotelsStore.getHotelsByPlace(place.id)
          suggestions.push({
            id: `place-${place.id}`,
            name: `${place.name}, ${place.state}`,
            detail: `${hotelsInPlace.length} hotéis disponíveis`,
            type: 'place',
            action: 'filter',
            data: place
          })
        }
      })

      // 3. Buscar cidades da API se não estiverem no cache
      if (searchTerm.length >= 3) {
        try {
          const cities = await searchCities(searchTerm)
          cities.forEach(city => {
            // Verificar se já não temos uma sugestão para este lugar
            const existingPlace = suggestions.find(s =>
              s.type === 'place' && s.data?.id === city.placeId
            )

            if (!existingPlace) {
              suggestions.push({
                id: `city-${city.placeId}`,
                name: `${city.name}, ${city.state.shortname}`,
                detail: `Buscar hotéis em ${city.name}`,
                type: 'city',
                action: 'search',
                data: city
              })
            }
          })
        } catch (error) {
          // Error handling
        }
      }

      // 4. Buscar hotéis por nome de cidade/estado
      hotelsStore.hotels.forEach(hotel => {
        const place = hotelsStore.places.find(p => p.id === hotel.placeId)
        if (place && (
          place.name.toLowerCase().includes(searchTerm) ||
          place.state.toLowerCase().includes(searchTerm)
        )) {
          // Verificar se já não temos este hotel na lista
          const existingHotel = suggestions.find(s =>
            s.type === 'hotel' && s.data?.id === hotel.id
          )

          if (!existingHotel) {
            suggestions.push({
              id: `hotel-${hotel.id}`,
              name: `${hotel.name} - ${place.name}`,
              detail: `${hotel.stars} estrelas • ${hotelsStore.formatPrice(hotel.totalPrice)}`,
              type: 'hotel',
              action: 'search',
              data: hotel
            })
          }
        }
      })

      // Limitar a 10 sugestões e ordenar por relevância
      searchSuggestions.value = suggestions
        .slice(0, 10)
        .sort((a, b) => {
          // Priorizar sugestões que começam com o termo de busca
          const aStartsWith = a.name.toLowerCase().startsWith(searchTerm)
          const bStartsWith = b.name.toLowerCase().startsWith(searchTerm)

          if (aStartsWith && !bStartsWith) return -1
          if (!aStartsWith && bStartsWith) return 1

          // Depois priorizar por tipo: hotel > place > city
          const typePriority = { hotel: 3, place: 2, city: 1 }
          return typePriority[b.type] - typePriority[a.type]
        })

    } catch (error) {
      searchSuggestions.value = []
    }
  }

  const addToRecentSearches = (search: string) => {
    const trimmed = search.trim()
    if (!trimmed) return

    // Remover se já existe
    recentSearches.value = recentSearches.value.filter(s => s !== trimmed)

    // Adicionar no início
    recentSearches.value.unshift(trimmed)

    // Limitar quantidade
    if (recentSearches.value.length > MAX_RECENT_SEARCHES) {
      recentSearches.value = recentSearches.value.slice(0, MAX_RECENT_SEARCHES)
    }

    // Salvar no localStorage
    localStorage.setItem('recentHotelSearches', JSON.stringify(recentSearches.value))
  }

  const clearRecentSearches = () => {
    recentSearches.value = []
    localStorage.removeItem('recentHotelSearches')
  }

  const loadRecentSearches = () => {
    const saved = localStorage.getItem('recentHotelSearches')
    if (saved) {
      try {
        recentSearches.value = JSON.parse(saved)
      } catch (error) {
        // Error handling
      }
    }
  }

  const performSearch = async (query: string) => {
    if (!query.trim()) return

    isSearching.value = true
    addToRecentSearches(query)

    try {
      // Verificar se é uma busca por lugar específico
      const placeSuggestion = searchSuggestions.value.find(
        s => s.type === 'place' && s.name.toLowerCase().includes(query.toLowerCase())
      )

      if (placeSuggestion) {
        // Filtrar por lugar específico
        const placeId = parseInt(placeSuggestion.id.replace('place-', ''))
        hotelsStore.updateFilters({ placeId, searchQuery: '' })
      } else {
        // Busca geral por hotéis
        await hotelsStore.searchHotels(query.trim())
      }
    } catch (error) {
      throw error
    } finally {
      isSearching.value = false
      showSuggestions.value = false
    }
  }

  const clearSearch = () => {
    searchQuery.value = ''
    searchSuggestions.value = []
    showSuggestions.value = false
    hotelsStore.resetSearchQuery()
  }

  const selectSuggestion = async (suggestion: string | { id: string; name: string; type: string; action: string; data?: any }) => {
    if (typeof suggestion === 'string') {
      // Busca direta por texto
      searchQuery.value = suggestion
      await performSearch(suggestion)
    } else {
      // Sugestão estruturada
      searchQuery.value = suggestion.name

      if (suggestion.action === 'filter' && suggestion.type === 'place') {
        // Filtrar por lugar específico
        const placeId = parseInt(suggestion.id.replace('place-', ''))
        hotelsStore.updateFilters({ placeId, searchQuery: '' })
        addToRecentSearches(suggestion.name)
      } else if (suggestion.type === 'city') {
        // Buscar hotéis por cidade
        await hotelsStore.searchHotels(suggestion.data.name)
        addToRecentSearches(suggestion.name)
      } else {
        // Busca geral
        await hotelsStore.searchHotels(suggestion.name)
      }
    }
  }

  const handleSearchInput = async (query: string) => {
    searchQuery.value = query
    if (query.trim()) {
      await generateSearchSuggestions(query)
    } else {
      searchSuggestions.value = []
    }
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (!showSuggestions.value) return

    const suggestions = searchQuery.value ? searchSuggestions.value : recentSearches.value

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        selectedSuggestionIndex.value = Math.min(selectedSuggestionIndex.value + 1, suggestions.length - 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        selectedSuggestionIndex.value = Math.max(selectedSuggestionIndex.value - 1, -1)
        break
      case 'Enter':
        event.preventDefault()
        if (selectedSuggestionIndex.value >= 0 && suggestions[selectedSuggestionIndex.value]) {
          const suggestion = suggestions[selectedSuggestionIndex.value]
          if (suggestion) {
            selectSuggestion(typeof suggestion === 'string' ? suggestion : suggestion)
          }
        } else {
          performSearch(searchQuery.value)
        }
        break
      case 'Escape':
        showSuggestions.value = false
        selectedSuggestionIndex.value = -1
        break
    }
  }

  const handleBlur = () => {
    setTimeout(() => {
      showSuggestions.value = false
      selectedSuggestionIndex.value = -1
    }, 150)
  }

  return {
    // State
    searchQuery: readonly(searchQuery),
    isSearching: readonly(isSearching),
    showSuggestions: readonly(showSuggestions),
    selectedSuggestionIndex: readonly(selectedSuggestionIndex),
    recentSearches: readonly(recentSearches),
    searchSuggestions: readonly(searchSuggestions),

    // Computed
    hasRecentSearches,
    hasSuggestions,

    // Actions
    generateSearchSuggestions,
    addToRecentSearches,
    clearRecentSearches,
    loadRecentSearches,
    performSearch,
    clearSearch,
    selectSuggestion,
    handleSearchInput,
    handleKeydown,
    handleBlur,

    // Setters
    setSearchQuery: (query: string) => {
      searchQuery.value = query
    },
    setShowSuggestions: (show: boolean) => {
      showSuggestions.value = show
    }
  }
}

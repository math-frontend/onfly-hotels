import { ref, computed } from 'vue'
import type { Hotel, SortOption } from '~/types'

export const useHotelPage = () => {
  const store = useHotelsStore()

  // Sort handling
  const sortKey = ref('price-asc')

  const sortOptions = [
    { value: 'price-asc', label: 'Menor preço' },
    { value: 'price-desc', label: 'Maior preço' },
    { value: 'stars-desc', label: 'Melhor classificação' },
    { value: 'name-asc', label: 'Nome A-Z' }
  ]

  const handleSortChange = () => {
    const sortMap = {
      'price-asc': { key: 'totalPrice', label: 'Preço', direction: 'asc' as const },
      'price-desc': { key: 'totalPrice', label: 'Preço', direction: 'desc' as const },
      'stars-desc': { key: 'stars', label: 'Classificação', direction: 'desc' as const },
      'name-asc': { key: 'name', label: 'Nome', direction: 'asc' as const }
    }

    store.updateSort(sortMap[sortKey.value as keyof typeof sortMap])
  }

  // Header component handlers
  const handleTabChange = (tab: string) => {
    // Handle tab change logic here
  }

  const handleSearch = (query: string) => {
    store.updateFilters({ searchQuery: query })
  }

  // Computed properties for better organization
  const pageState = computed(() => ({
    loading: store.loading,
    error: store.error,
    hasHotels: store.hotels.length > 0 && !store.loading,
    showSkeleton: store.loading || (!store.hasInitialLoad && store.hotels.length === 0),
    showInitialLoading: false, // Removido pois agora sempre usa skeleton
    showContent: !store.loading && store.hasInitialLoad
  }))

  return {
    // Store
    store,

    // Sort
    sortKey,
    sortOptions,
    handleSortChange,

    // Handlers
    handleTabChange,
    handleSearch,

    // Computed
    pageState
  }
}

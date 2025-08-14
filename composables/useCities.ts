import { ref, computed } from 'vue'
import type { City } from '~/types'

export const useCities = () => {
  const cities = ref<City[]>([])
  const isLoading = ref(false)
  const searchQuery = ref('')
  const error = ref<string | null>(null)
  const debounceTimeout = ref<NodeJS.Timeout | null>(null)

  const { searchCities } = useApi()

  // Função para normalizar texto (remover acentos e converter para minúsculas)
  const normalizeText = (text: string): string => {
    return text
      .normalize('NFD') // Decompor caracteres acentuados
      .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos (acentos)
      .toLowerCase() // Converter para minúsculas
  }

  const filteredCities = computed(() => {
    if (!searchQuery.value.trim()) return cities.value

    const query = normalizeText(searchQuery.value)
    return cities.value.filter(city =>
      normalizeText(city.name).includes(query) ||
      normalizeText(city.state.name).includes(query) ||
      normalizeText(city.state.shortname).includes(query)
    )
  })

    const searchCitiesWithDebounce = async (query: string) => {
    // Clear previous timeout
    if (debounceTimeout.value) {
      clearTimeout(debounceTimeout.value)
    }

    // Set new timeout for debounced search
    debounceTimeout.value = setTimeout(async () => {
      if (query.trim().length < 3) {
        cities.value = []
        return
      }

      try {
        isLoading.value = true
        error.value = null

        const response = await searchCities(query)
        cities.value = response || []
      } catch (err) {
        error.value = 'Erro ao buscar cidades'
        cities.value = []
      } finally {
        isLoading.value = false
      }
    }, 300) // 300ms debounce
  }

  const updateSearchQuery = (query: string) => {
    searchQuery.value = query
    searchCitiesWithDebounce(query)
  }

  const clearSearch = () => {
    searchQuery.value = ''
    cities.value = []
    error.value = null
    if (debounceTimeout.value) {
      clearTimeout(debounceTimeout.value)
    }
  }

  const selectCity = (city: City) => {
    // This can be customized based on your needs
    clearSearch()
  }

  return {
    // State
    cities: readonly(cities),
    filteredCities: readonly(filteredCities),
    isLoading: readonly(isLoading),
    searchQuery: readonly(searchQuery),
    error: readonly(error),

    // Actions
    updateSearchQuery,
    clearSearch,
    selectCity,
  }
}

<template>
  <div class="search-header">
    <div class="tabs">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        :class="['tab', { active: activeTab === tab.name }]"
        @click="selectTab(tab.name)"
      >
        <i :class="tab.icon">{{ getTabIcon(tab.name) }}</i>
        {{ tab.label }}
      </button>
    </div>

    <div class="search-container" v-if="activeTab === 'hotel'">
      <!-- Barra de busca principal -->
      <div class="search-bar">
        <div class="search-input-wrapper">
          <div class="input-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <input
            v-model="searchQuery"
            @input="handleLocalSearchInput"
            @focus="setShowSuggestions(true)"
            @blur="handleLocalBlur"
            @keydown="handleLocalKeydown"
            type="text"
            placeholder="Buscar hotéis, destinos, cidades..."
            class="search-input"
            autocomplete="off"
          />

          <div v-if="isSearching || hotelsStore.citySearchLoading" class="loading-spinner">
            <div class="spinner"></div>
          </div>

          <button
            v-if="searchQuery && !isSearching"
            @click="clearSearch"
            class="clear-button"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <BaseButton
          text="Buscar"
          icon="search"
          :loading="isSearching"
          :disabled="!searchQuery.trim()"
          @click="() => performSearch(searchQuery)"
        />
      </div>

      <!-- Filtros rápidos -->
      <div class="quick-filters" v-if="showQuickFilters">
        <div class="filter-chips">
          <button
            v-for="filter in quickFilters"
            :key="filter.key"
            :class="['filter-chip', { active: activeQuickFilters.includes(filter.key) }]"
            @click="toggleQuickFilter(filter.key)"
          >
            <i class="material-icons">{{ filter.icon }}</i>
            {{ filter.label }}
          </button>

          <!-- Filtros Avançados Dropdown -->
          <FilterDropdown />
        </div>
      </div>

      <!-- Sugestões de busca -->
      <div v-if="showSuggestions" class="suggestions-dropdown">
        <!-- Buscas recentes -->
        <div v-if="recentSearches.length > 0 && !searchQuery" class="suggestions-section">
          <div class="section-header">
            <span>Buscas recentes</span>
            <button @click="clearRecentSearches" class="clear-recent">Limpar</button>
          </div>
          <div class="suggestions-list">
            <div
              v-for="recent in recentSearches"
              :key="recent"
              class="suggestion-item"
              @click="() => selectSuggestion(recent)"
            >
              <i class="material-icons">history</i>
              <span>{{ recent }}</span>
            </div>
          </div>
        </div>

        <!-- Sugestões unificadas -->
        <div v-if="searchQuery" class="suggestions-section">
          <div class="section-header">
            <span>Hotéis, destinos e cidades</span>
          </div>
          <div class="suggestions-list">
            <!-- Loading state -->
            <div v-if="isGeneratingSuggestions || hotelsStore.citySearchLoading" class="loading-suggestions">
              <div class="spinner"></div>
              <span>Buscando sugestões...</span>
            </div>

            <!-- Sugestões locais -->
            <div
              v-if="!isGeneratingSuggestions && !hotelsStore.citySearchLoading && searchSuggestions.length > 0"
              v-for="(suggestion, index) in searchSuggestions"
              :key="suggestion.id"
              :class="['suggestion-item', { selected: selectedSuggestionIndex === index }]"
              @click="() => selectSuggestion(suggestion)"
            >
              <i class="material-icons suggestion-icon" :class="getSuggestionIconClass(suggestion.type)">
                {{ getSuggestionIcon(suggestion.type) }}
              </i>
              <div class="suggestion-content">
                <span class="suggestion-name">{{ suggestion.name }}</span>
                <span class="suggestion-detail">{{ suggestion.detail }}</span>
              </div>
              <div class="suggestion-action">
                <span class="action-badge" :class="suggestion.action">
                  {{ suggestion.action === 'filter' ? 'Filtrar' : 'Buscar' }}
                </span>
              </div>
            </div>

            <!-- Cidades da API -->
            <div
              v-if="!isGeneratingSuggestions && !hotelsStore.citySearchLoading && hotelsStore.formattedCityResults.length > 0"
              v-for="(city, index) in hotelsStore.formattedCityResults"
              :key="`city-${city.placeId}`"
              :class="['suggestion-item', { selected: selectedSuggestionIndex === searchSuggestions.length + index }]"
              @click="() => selectCitySuggestion(city)"
            >
              <i class="material-icons suggestion-icon icon-city">location_city</i>
              <div class="suggestion-content">
                <span class="suggestion-name">{{ city.displayName }}</span>
                <span class="suggestion-detail">Buscar hotéis em {{ city.name }}</span>
              </div>
              <div class="suggestion-action">
                <span class="action-badge search">Buscar</span>
              </div>
            </div>

            <!-- Estado vazio -->
            <div v-if="!isGeneratingSuggestions && !hotelsStore.citySearchLoading && searchSuggestions.length === 0 && hotelsStore.formattedCityResults.length === 0 && searchQuery" class="empty-suggestions">
              <i class="material-icons">search_off</i>
              <span>Nenhum resultado encontrado para "{{ searchQuery }}"</span>
              <BaseButton
                variant="outline"
                size="small"
                text="Buscar mesmo assim"
                @click="() => performSearch(searchQuery)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

// Props
interface Props {
  initialTab?: string
  initialSearch?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialTab: 'hotel',
  initialSearch: ''
})

// Emits
const emit = defineEmits<{
  tabChange: [tab: string]
  search: [query: string]
}>()

// Store
const hotelsStore = useHotelsStore()

// State local para busca unificada
const searchQuery = ref('')
const isSearching = ref(false)
const showSuggestions = ref(false)
const selectedSuggestionIndex = ref(-1)
const recentSearches = ref<string[]>([])
const searchSuggestions = ref<Array<{
  id: string
  name: string
  detail: string
  type: 'hotel' | 'place' | 'city'
  action: 'search' | 'filter'
  data?: any
}>>([])
const isGeneratingSuggestions = ref(false)

// Computed
const hasRecentSearches = computed(() => recentSearches.value.length > 0)
const hasSuggestions = computed(() => searchSuggestions.value.length > 0)

// State
const activeTab = ref(props.initialTab)
const showQuickFilters = ref(true)

// Filtros rápidos
const quickFilters = [
  { key: 'breakfast', label: 'Café da manhã', icon: 'restaurant' },
  { key: 'refundable', label: 'Reembolsável', icon: 'money_off' },
  { key: '5stars', label: '5 estrelas', icon: 'star' },
  { key: 'wifi', label: 'Wi-Fi', icon: 'wifi' },
  { key: 'parking', label: 'Estacionamento', icon: 'local_parking' }
]

const activeQuickFilters = ref<string[]>([])

// Watch para sincronizar activeQuickFilters com os filtros do store
watch(() => hotelsStore.filters, (newFilters) => {
  // Limpar filtros ativos baseado no estado do store
  const newActiveFilters: string[] = []

  if (newFilters.hasBreakFast === true) {
    newActiveFilters.push('breakfast')
  }
  if (newFilters.hasRefundableRoom === true) {
    newActiveFilters.push('refundable')
  }
  if (newFilters.stars.includes('5')) {
    newActiveFilters.push('5stars')
  }
  if (newFilters.amenities.includes('WI_FI')) {
    newActiveFilters.push('wifi')
  }
  if (newFilters.amenities.includes('PARKING')) {
    newActiveFilters.push('parking')
  }

  activeQuickFilters.value = newActiveFilters
}, { deep: true })

const tabs = [
  { name: 'aereo', label: 'Aéreo', icon: 'material-icons' },
  { name: 'hotel', label: 'Hotel', icon: 'material-icons' },
  { name: 'carro', label: 'Carro', icon: 'material-icons' },
  { name: 'onibus', label: 'Ônibus', icon: 'material-icons' },
]

// Computed
const hasActiveFilters = computed(() => activeQuickFilters.value.length > 0)

// Methods
const selectTab = (tabName: string) => {
  activeTab.value = tabName
  emit('tabChange', tabName)
}

// Funções de busca unificada
const generateSearchSuggestions = async (query: string) => {
  if (!query.trim()) {
    searchSuggestions.value = []
    isGeneratingSuggestions.value = false
    return
  }

  isGeneratingSuggestions.value = true

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

    // 3. Buscar cidades da API se tiver 3+ caracteres
    if (searchTerm.length >= 3) {
      hotelsStore.updateCitySearchQuery(searchTerm)

      // Aguardar um pouco para os resultados chegarem
      await new Promise(resolve => setTimeout(resolve, 300))

      hotelsStore.formattedCityResults.forEach(city => {
        suggestions.push({
          id: `city-${city.placeId}`,
          name: city.displayName,
          detail: `Buscar hotéis em ${city.name}`,
          type: 'city',
          action: 'search',
          data: city
        })
      })
    }

    // Limitar a 10 sugestões e ordenar por relevância
    searchSuggestions.value = suggestions
      .slice(0, 10)
      .sort((a, b) => {
        const aStartsWith = a.name.toLowerCase().startsWith(searchTerm)
        const bStartsWith = b.name.toLowerCase().startsWith(searchTerm)

        if (aStartsWith && !bStartsWith) return -1
        if (!aStartsWith && bStartsWith) return 1

        const typePriority = { hotel: 3, place: 2, city: 1 }
        return typePriority[b.type] - typePriority[a.type]
      })

  } catch (error) {
    searchSuggestions.value = []
  } finally {
    isGeneratingSuggestions.value = false
  }
}

const handleLocalSearchInput = () => {
  // Garantir que as sugestões sejam mostradas
  if (searchQuery.value.trim()) {
    setShowSuggestions(true)
  }

  generateSearchSuggestions(searchQuery.value)
}

const addToRecentSearches = (search: string) => {
  const trimmed = search.trim()
  if (!trimmed) return

  recentSearches.value = recentSearches.value.filter(s => s !== trimmed)
  recentSearches.value.unshift(trimmed)

  if (recentSearches.value.length > 5) {
    recentSearches.value = recentSearches.value.slice(0, 5)
  }

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
    const placeSuggestion = searchSuggestions.value.find(
      s => s.type === 'place' && s.name.toLowerCase().includes(query.toLowerCase())
    )

    if (placeSuggestion) {
      const placeId = parseInt(placeSuggestion.id.replace('place-', ''))
      hotelsStore.updateFilters({ placeId, searchQuery: '' })
    } else {
      await hotelsStore.searchHotels(query.trim())
    }
  } catch (error) {
    // Error handling
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
    searchQuery.value = suggestion
    await performSearch(suggestion)
  } else {
    searchQuery.value = suggestion.name

    if (suggestion.action === 'filter' && suggestion.type === 'place') {
      const placeId = parseInt(suggestion.id.replace('place-', ''))
      hotelsStore.updateFilters({ placeId, searchQuery: '' })
      addToRecentSearches(suggestion.name)
    } else if (suggestion.type === 'city') {
      await hotelsStore.searchHotels(suggestion.data.name)
      addToRecentSearches(suggestion.name)
    } else {
      await hotelsStore.searchHotels(suggestion.name)
    }
  }
}

const handleBlur = () => {
  setTimeout(() => {
    showSuggestions.value = false
    selectedSuggestionIndex.value = -1
  }, 200)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!showSuggestions.value) return

  const allSuggestions = searchQuery.value
    ? [...searchSuggestions.value, ...hotelsStore.formattedCityResults]
    : recentSearches.value

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedSuggestionIndex.value = Math.min(selectedSuggestionIndex.value + 1, allSuggestions.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedSuggestionIndex.value = Math.max(selectedSuggestionIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (selectedSuggestionIndex.value >= 0 && allSuggestions[selectedSuggestionIndex.value]) {
        const suggestion = allSuggestions[selectedSuggestionIndex.value]
        if (!suggestion) return

        if (typeof suggestion === 'string') {
          selectSuggestion(suggestion)
        } else if ('placeId' in suggestion) {
          // É uma cidade da API
          selectCitySuggestion(suggestion)
        } else {
          // É uma sugestão local
          selectSuggestion(suggestion)
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

const setShowSuggestions = (show: boolean) => {
  showSuggestions.value = show
}

const selectCitySuggestion = async (city: any) => {
  searchQuery.value = city.displayName
  await hotelsStore.searchHotels(city.name)
  addToRecentSearches(city.displayName)
  showSuggestions.value = false
}

const toggleQuickFilter = (filterKey: string) => {
  const index = activeQuickFilters.value.indexOf(filterKey)
  if (index > -1) {
    activeQuickFilters.value.splice(index, 1)
  } else {
    activeQuickFilters.value.push(filterKey)
  }

  applyQuickFilters()
}

const applyQuickFilters = () => {
  // Obter filtros atuais do store
  const currentFilters = { ...hotelsStore.filters }

  // Resetar filtros que podem ser controlados pelos chips
  currentFilters.hasBreakFast = null
  currentFilters.hasRefundableRoom = null
  currentFilters.stars = currentFilters.stars.filter(star => star !== '5')
  currentFilters.amenities = currentFilters.amenities.filter(amenity => !['WI_FI', 'PARKING'].includes(amenity))

  // Aplicar filtros ativos dos chips
  activeQuickFilters.value.forEach(filter => {
    switch (filter) {
      case 'breakfast':
        currentFilters.hasBreakFast = true
        break
      case 'refundable':
        currentFilters.hasRefundableRoom = true
        break
      case '5stars':
        currentFilters.stars.push('5')
        break
      case 'wifi':
        currentFilters.amenities.push('WI_FI')
        break
      case 'parking':
        currentFilters.amenities.push('PARKING')
        break
    }
  })

  hotelsStore.updateFilters(currentFilters)
}

const handleLocalBlur = () => {
  handleBlur()
}

const handleLocalKeydown = (event: KeyboardEvent) => {
  handleKeydown(event)
}

// Helper function for tab icons
const getTabIcon = (tabName: string) => {
  const iconMap = {
    'aereo': 'flight',
    'hotel': 'hotel',
    'carro': 'directions_car',
    'onibus': 'directions_bus'
  }
  return iconMap[tabName as keyof typeof iconMap] || 'help'
}

// Helper functions for suggestion icons
const getSuggestionIcon = (type: string) => {
  const iconMap = {
    'hotel': 'hotel',
    'place': 'location_on',
    'city': 'location_city'
  }
  return iconMap[type as keyof typeof iconMap] || 'search'
}

const getSuggestionIconClass = (type: string) => {
  const classMap = {
    'hotel': 'icon-hotel',
    'place': 'icon-place',
    'city': 'icon-city'
  }
  return classMap[type as keyof typeof classMap] || ''
}

// Lifecycle
onMounted(() => {
  // Carregar buscas recentes do localStorage
  loadRecentSearches()

  // Se não há dados, tentar carregar
  if (hotelsStore.hotels.length === 0 && !hotelsStore.loading) {
    hotelsStore.fetchInitialData()
  }
})

// Expose methods for parent components
defineExpose({
  setActiveTab: selectTab,
  setSearchQuery: (query: string) => {
    searchQuery.value = query
  }
})
</script>



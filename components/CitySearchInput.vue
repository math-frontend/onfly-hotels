<template>
  <div class="city-search-container">
    <div class="search-input-wrapper">
      <div class="input-container">
        <div class="input-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>

        <input
          v-model="localSearchQuery"
          type="text"
          placeholder="Buscar cidade..."
          class="search-input"
          @focus="showDropdown = true"
          @blur="handleBlur"
          @keydown="handleKeydown"
        />

        <div v-if="isLoading" class="loading-spinner">
          <div class="spinner"></div>
        </div>

        <button
          v-if="searchQuery && !isLoading"
          @click="clearSearch"
          class="clear-button"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Dropdown Results -->
    <div v-if="showDropdown && (filteredCities.length > 0 || isLoading || error)" class="dropdown">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <span>Buscando cidades...</span>
      </div>

      <div v-else-if="error" class="error-state">
        <span>{{ error }}</span>
      </div>

      <div v-else-if="filteredCities.length > 0" class="results-list">
        <div
          v-for="(city, index) in filteredCities"
          :key="city.placeId"
          class="city-item"
          :class="{ 'selected': index === selectedIndex }"
          @click="selectCity(city)"
          @mouseenter="selectedIndex = index"
        >
          <div class="city-info">
            <div class="city-name">{{ city.name }}</div>
            <div class="city-state">{{ city.state.name }} - {{ city.state.shortname }}</div>
          </div>
        </div>
      </div>

      <div v-else-if="searchQuery.length >= 3" class="no-results">
        <span>Nenhuma cidade encontrada</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { City } from '~/types'

const props = defineProps<{
  modelValue?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'select': [city: City]
}>()

const {
  filteredCities,
  isLoading,
  searchQuery,
  error,
  updateSearchQuery,
  clearSearch: clearCitiesSearch,
  selectCity: selectCityFromComposable
} = useCities()

const localSearchQuery = ref(props.modelValue || '')
const showDropdown = ref(false)
const selectedIndex = ref(-1)

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (newValue !== localSearchQuery.value) {
    localSearchQuery.value = newValue || ''
  }
})

// Watch for local changes
watch(localSearchQuery, (newValue) => {
  emit('update:modelValue', newValue)
  updateSearchQuery(newValue)
})

const clearSearch = () => {
  localSearchQuery.value = ''
  clearCitiesSearch()
  emit('update:modelValue', '')
}

const selectCity = (city: City) => {
  localSearchQuery.value = `${city.name}, ${city.state.shortname}`
  emit('update:modelValue', localSearchQuery.value)
  emit('select', city)
  selectCityFromComposable(city)
  showDropdown.value = false
  selectedIndex.value = -1
}

const handleBlur = () => {
  // Delay hiding dropdown to allow for clicks
  setTimeout(() => {
    showDropdown.value = false
    selectedIndex.value = -1
  }, 150)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!showDropdown.value) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, filteredCities.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (selectedIndex.value >= 0 && filteredCities[selectedIndex.value]) {
        selectCity(filteredCities[selectedIndex.value])
      }
      break
    case 'Escape':
      showDropdown.value = false
      selectedIndex.value = -1
      break
  }
}
</script>



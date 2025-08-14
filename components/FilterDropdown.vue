<template>
  <div class="filter-dropdown">
    <button
      @click="toggleDropdown"
      :class="['filter-dropdown__trigger', { active: isOpen }]"
      type="button"
    >
      <i class="material-icons">tune</i>
      <span>Filtros</span>
      <i class="material-icons filter-dropdown__arrow">{{ isOpen ? 'expand_less' : 'expand_more' }}</i>
      <span v-if="activeFiltersCount > 0" class="filter-dropdown__badge">
        {{ activeFiltersCount }}
      </span>
    </button>

    <div v-if="isOpen" class="filter-dropdown__content">
      <div class="filter-dropdown__header">
        <h4>Filtros Avançados</h4>
        <button @click="resetAllFilters" class="filter-dropdown__reset">
          Limpar
        </button>
      </div>

      <div class="filter-dropdown__body">
        <!-- Price Range -->
        <div class="filter-section">
          <h5 class="filter-section__title">Faixa de preço</h5>
          <div class="filter-section__price-range">
            <PriceInput
              v-model="localFilters.minPrice"
              label="Mínimo"
              placeholder="R$ 0,00"
              @update:model-value="updatePriceFilterHandler"
            />
            <PriceInput
              v-model="localFilters.maxPrice"
              label="Máximo"
              placeholder="R$ 10.000,00"
              @update:model-value="updatePriceFilterHandler"
            />
          </div>
        </div>

        <!-- Stars -->
        <div class="filter-section">
          <h5 class="filter-section__title">Classificação</h5>
          <div class="filter-section__stars">
            <label
              v-for="star in ['5', '4', '3', '2', '1']"
              :key="star"
              class="filter-section__star-option"
            >
              <input
                type="checkbox"
                :value="star"
                v-model="localFilters.stars"
                @change="updateStarFilterHandler"
                class="filter-section__checkbox"
              >
              <span class="filter-section__star-label">
                <span v-for="i in parseInt(star)" :key="i" class="filter-section__star">★</span>
                <span v-if="parseInt(star) < 5">
                  <span v-for="i in 5 - parseInt(star)" :key="i" class="filter-section__star filter-section__star--empty">☆</span>
                </span>
              </span>
            </label>
          </div>
        </div>

        <!-- Features -->
        <div class="filter-section">
          <h5 class="filter-section__title">Características</h5>
          <div class="filter-section__features">
            <label class="filter-section__feature-option">
              <input
                type="checkbox"
                :checked="localFilters.hasBreakFast === true"
                @change="updateBreakfastFilterHandler"
                class="filter-section__checkbox"
              >
              <span class="filter-section__feature-label">Café da manhã</span>
            </label>
            <label class="filter-section__feature-option">
              <input
                type="checkbox"
                :checked="localFilters.hasRefundableRoom === true"
                @change="updateRefundableFilterHandler"
                class="filter-section__checkbox"
              >
              <span class="filter-section__feature-label">Quarto reembolsável</span>
            </label>
          </div>
        </div>


      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { FilterState } from '~/types'
import PriceInput from '~/components/PriceInput.vue'

const store = useHotelsStore()
const {
  filters,
  updatePriceFilter,
  updateStarsFilter,
  updateBreakfastFilter,
  updateRefundableFilter,
  resetFilters
} = store

const isOpen = ref(false)
const localFilters = ref<FilterState>({ ...filters })

// Watch for external filter changes
watch(() => filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })

// Computed para contar filtros ativos
const activeFiltersCount = computed(() => {
  let count = 0
  if (localFilters.value.minPrice > 0 || localFilters.value.maxPrice < 1000000) count++
  if (localFilters.value.stars.length > 0) count++
  if (localFilters.value.hasBreakFast !== null) count++
  if (localFilters.value.hasRefundableRoom !== null) count++
  if (localFilters.value.placeId !== null) count++
  if (localFilters.value.searchQuery.trim() !== '') count++
  return count
})

// Methods
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const updatePriceFilterHandler = () => {
  updatePriceFilter(localFilters.value.minPrice, localFilters.value.maxPrice)
}

const updateStarFilterHandler = () => {
  updateStarsFilter(localFilters.value.stars)
}

const updateBreakfastFilterHandler = (event: Event) => {
  const target = event.target as HTMLInputElement
  updateBreakfastFilter(target.checked ? true : null)
}

const updateRefundableFilterHandler = (event: Event) => {
  const target = event.target as HTMLInputElement
  updateRefundableFilter(target.checked ? true : null)
}

const resetAllFilters = () => {
  resetFilters()
}

// Click outside to close
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.filter-dropdown')) {
    closeDropdown()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>



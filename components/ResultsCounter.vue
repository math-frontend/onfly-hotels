<template>
  <div class="results-counter">
    <div class="results-counter__content">
      <div class="results-counter__info">
        <span class="results-counter__count">
          {{ totalResults }} {{ totalResults === 1 ? 'hotel encontrado' : 'hotéis encontrados' }}
        </span>

        <span v-if="hasActiveFilters" class="results-counter__filters">
          com os filtros aplicados
        </span>
      </div>

      <div v-if="hasActiveFilters" class="results-counter__actions">
        <BaseButton
          variant="secondary"
          size="small"
          text="Limpar filtros"
          icon="clear"
          @click="clearFilters"
        />
      </div>
    </div>

    <!-- Filtros ativos -->
    <div v-if="activeFilters.length > 0" class="results-counter__active-filters">
      <div class="active-filters__list">
        <div
          v-for="filter in activeFilters"
          :key="filter.key"
          class="active-filter__item"
        >
          <span class="active-filter__label">{{ filter.label }}:</span>
          <span class="active-filter__value">{{ filter.value }}</span>
          <button
            @click="removeFilter(filter.key)"
            class="active-filter__remove"
            title="Remover filtro"
          >
            <i class="material-icons">close</i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FilterState, Place, Amenity } from '~/types'

interface Props {
  totalResults: number
  filters: FilterState
  places: readonly Place[]
  amenities: readonly Amenity[]
}

const props = defineProps<Props>()

const store = useHotelsStore()
const { resetFilters, updateFilters } = store

// Computed properties
const hasActiveFilters = computed(() => {
  return (
    props.filters.minPrice > 0 ||
    props.filters.maxPrice < 1000000 ||
    props.filters.stars.length > 0 ||
    props.filters.amenities.length > 0 ||
    props.filters.hasBreakFast !== null ||
    props.filters.hasRefundableRoom !== null ||
    props.filters.placeId !== null ||
    props.filters.searchQuery.trim() !== ''
  )
})

const activeFilters = computed(() => {
  const filters: Array<{ key: string; label: string; value: string }> = []

  // Filtro de busca
  if (props.filters.searchQuery.trim()) {
    filters.push({
      key: 'searchQuery',
      label: 'Busca',
      value: props.filters.searchQuery
    })
  }

  // Filtro de preço
  if (props.filters.minPrice > 0 || props.filters.maxPrice < 1000000) {
    const min = props.filters.minPrice > 0 ? store.formatPrice(props.filters.minPrice) : store.formatPrice(0)
    const max = props.filters.maxPrice < 1000000 ? store.formatPrice(props.filters.maxPrice) : store.formatPrice(1000000)
    filters.push({
      key: 'price',
      label: 'Preço',
      value: `${min} - ${max}`
    })
  }

  // Filtro de estrelas
  if (props.filters.stars.length > 0) {
    const starsText = props.filters.stars.map(star => `${star}★`).join(', ')
    filters.push({
      key: 'stars',
      label: 'Estrelas',
      value: starsText
    })
  }

  // Filtro de comodidades
  if (props.filters.amenities.length > 0) {
    const amenitiesText = props.filters.amenities
      .map(key => {
        const amenity = props.amenities.find(a => a.key === key)
        return amenity?.label || key
      })
      .join(', ')
    filters.push({
      key: 'amenities',
      label: 'Comodidades',
      value: amenitiesText
    })
  }

  // Filtro de café da manhã
  if (props.filters.hasBreakFast !== null) {
    filters.push({
      key: 'hasBreakFast',
      label: 'Café da manhã',
      value: props.filters.hasBreakFast ? 'Sim' : 'Não'
    })
  }

  // Filtro de quarto reembolsável
  if (props.filters.hasRefundableRoom !== null) {
    filters.push({
      key: 'hasRefundableRoom',
      label: 'Quarto reembolsável',
      value: props.filters.hasRefundableRoom ? 'Sim' : 'Não'
    })
  }

  // Filtro de lugar
  if (props.filters.placeId !== null) {
    const place = props.places.find(p => p.id === props.filters.placeId)
    if (place) {
      filters.push({
        key: 'placeId',
        label: 'Local',
        value: `${place.name}, ${place.state}`
      })
    }
  }

  return filters
})

// Methods
const clearFilters = () => {
  resetFilters()
}

const removeFilter = (filterKey: string) => {
  switch (filterKey) {
    case 'searchQuery':
      updateFilters({ searchQuery: '' })
      break
    case 'price':
      updateFilters({ minPrice: 0, maxPrice: 1000000 })
      break
    case 'stars':
      updateFilters({ stars: [] })
      break
    case 'amenities':
      updateFilters({ amenities: [] })
      break
    case 'hasBreakFast':
      updateFilters({ hasBreakFast: null })
      break
    case 'hasRefundableRoom':
      updateFilters({ hasRefundableRoom: null })
      break
    case 'placeId':
      updateFilters({ placeId: null })
      break
  }
}
</script>

<style lang="scss" scoped>
.results-counter {
  background: white;
  border-radius: $border-radius-12;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: $spacing-24;
  overflow: hidden;

  &__content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-16 $spacing-20;
    border-bottom: 1px solid #f1f5f9;

    @media (max-width: $breakpoint-sm) {
      flex-direction: column;
      gap: $spacing-12;
      align-items: stretch;
    }
  }

  &__info {
    display: flex;
    align-items: center;
    gap: $spacing-8;
    flex-wrap: wrap;

    @media (max-width: $breakpoint-sm) {
      justify-content: center;
    }
  }

  &__count {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
  }

  &__filters {
    font-size: 14px;
    color: #64748b;
  }

  &__actions {
    display: flex;
    gap: $spacing-8;
  }

  &__clear-btn {
    display: flex;
    align-items: center;
    gap: $spacing-4;
    padding: $spacing-6 $spacing-12;
    border: 1px solid #e2e8f0;
    background: white;
    border-radius: $border-radius-8;
    color: #64748b;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: #ef4444;
      color: #ef4444;
      background: #fef2f2;
    }

    i {
      font-size: 16px;
    }
  }

  &__active-filters {
    padding: $spacing-12 $spacing-20;
    background: #f8fafc;
  }
}

.active-filters {
  &__list {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-8;
  }
}

.active-filter {
  &__item {
    display: flex;
    align-items: center;
    gap: $spacing-4;
    padding: $spacing-4 $spacing-8;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: $border-radius-6;
    font-size: 13px;
  }

  &__label {
    color: #64748b;
    font-weight: 500;
  }

  &__value {
    color: #1e293b;
    font-weight: 600;
  }

  &__remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border: none;
    background: #f1f5f9;
    border-radius: 50%;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #ef4444;
      color: white;
    }

    i {
      font-size: 12px;
    }
  }
}

// Responsive
@media (max-width: $breakpoint-sm) {
  .results-counter {
    margin: 0 $spacing-8 $spacing-16;

    &__content {
      padding: $spacing-12 $spacing-16;
    }

    &__active-filters {
      padding: $spacing-8 $spacing-16;
    }
  }

  .active-filters__list {
    gap: $spacing-6;
  }

  .active-filter__item {
    padding: $spacing-4 $spacing-6;
    font-size: 12px;
  }
}
</style>

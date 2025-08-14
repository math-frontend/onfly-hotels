<template>
  <div class="hotel-filters">
    <div class="hotel-filters__header">
      <h3 class="hotel-filters__title">Filtros</h3>
      <BaseButton
        variant="secondary"
        text="Limpar filtros"
        icon="clear"
        @click="resetFilters"
      />
    </div>

    <div class="hotel-filters__content">
      <!-- Price Range -->
      <div class="hotel-filters__section">
        <h4 class="hotel-filters__section-title">Faixa de preço</h4>
        <div class="hotel-filters__price-range">
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
      <div class="hotel-filters__section">
        <h4 class="hotel-filters__section-title">Classificação</h4>
        <div class="hotel-filters__stars">
          <label
            v-for="star in ['5', '4', '3', '2', '1']"
            :key="star"
            class="hotel-filters__star-option"
          >
            <input
              type="checkbox"
              :value="star"
              v-model="localFilters.stars"
              @change="updateStarFilterHandler"
              class="hotel-filters__checkbox"
            >
            <span class="hotel-filters__star-label">
              <span v-for="i in parseInt(star)" :key="i" class="hotel-filters__star">★</span>
              <span v-if="parseInt(star) < 5">
                <span v-for="i in 5 - parseInt(star)" :key="i" class="hotel-filters__star hotel-filters__star--empty">☆</span>
              </span>
            </span>
          </label>
        </div>
      </div>

      <!-- Features -->
      <div class="hotel-filters__section">
        <h4 class="hotel-filters__section-title">Características</h4>
        <div class="hotel-filters__features">
          <label class="hotel-filters__feature-option">
            <input
              type="checkbox"
              :checked="localFilters.hasBreakFast === true"
              @change="updateBreakfastFilterHandler"
              class="hotel-filters__checkbox"
            >
            <span class="hotel-filters__feature-label">Café da manhã</span>
          </label>
          <label class="hotel-filters__feature-option">
            <input
              type="checkbox"
              :checked="localFilters.hasRefundableRoom === true"
              @change="updateRefundableFilterHandler"
              class="hotel-filters__checkbox"
            >
            <span class="hotel-filters__feature-label">Quarto reembolsável</span>
          </label>
        </div>
      </div>

      <!-- Places -->
      <div class="hotel-filters__section">
        <h4 class="hotel-filters__section-title">Destino</h4>
        <CitySearchInput
          v-model="selectedCityText"
          @select="handleCitySelect"
          placeholder="Buscar cidade..."
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FilterState, City } from '~/types'
import PriceInput from '~/components/PriceInput.vue'

const store = useHotelsStore()
const {
  filters,
  places,
  updatePriceFilter,
  updateStarsFilter,
  updateBreakfastFilter,
  updateRefundableFilter,
  updatePlaceFilter,
  resetFilters
} = store

const localFilters = ref<FilterState>({ ...filters })

// Watch for external filter changes
watch(() => filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })

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

// City search handling
const selectedCityText = ref('')

const handleCitySelect = (city: City) => {
  selectedCityText.value = `${city.name}, ${city.state.shortname}`
  localFilters.value.placeId = city.placeId
  updatePlaceFilter(city.placeId)
}
</script>



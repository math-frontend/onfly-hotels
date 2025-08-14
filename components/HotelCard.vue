<template>
  <div :class="['hotel-card', `hotel-card--${viewMode}`]">
    <!-- Seção da Imagem -->
    <div class="hotel-card__image-section">
      <HotelCarousel
        :images="hotelImages"
        :alt="hotel.name"
        :stars="hotel.stars"
        @image-change="handleImageChange"
      />
    </div>

    <!-- Seção de Detalhes -->
    <div class="hotel-card__details-section">
      <h3 class="hotel-card__name">{{ hotel.name }}</h3>
      <p class="hotel-card__location">{{ hotel.district }}</p>

      <!-- Ícones de Amenidades -->
      <div class="hotel-card__amenities">
        <div
          v-for="amenity in hotel.amenities"
          :key="amenity"
          class="hotel-card__amenity-icon"
          :style="{ '--amenity-color': getAmenityColor(amenity) }"
          @mouseenter="showTooltip(amenity, $event)"
          @mouseleave="hideTooltip"
        >
          <i class="material-icons">{{ getAmenityIcon(amenity) }}</i>
        </div>
      </div>

      <!-- Tooltip personalizado -->
      <div
        v-if="activeTooltip"
        class="hotel-card__tooltip"
        :style="tooltipStyle"
      >
        {{ getAmenityLabel(activeTooltip) }}
      </div>

      <!-- Recursos Especiais -->
      <div class="hotel-card__features">
        <span v-if="hotel.hasRefundableRoom" class="hotel-card__feature">
          <i class="material-icons">attach_money</i>
          Reembolsável
        </span>
        <span v-if="hotel.hasBreakFast" class="hotel-card__feature">
          <i class="material-icons">local_cafe</i>
          Café da manhã
        </span>
      </div>
    </div>

    <!-- Seção de Preços -->
    <div class="hotel-card__pricing-section">
      <div class="hotel-card__price-label">Por dia</div>

      <div class="hotel-card__main-price">{{ formatPrice(Math.floor(hotel.totalPrice / 2)) }}</div>

      <div class="hotel-card__no-booking-price">No booking {{ formatPrice(Math.floor(hotel.totalPrice / 2) + 1500) }}</div>

      <!-- Breakdown de Preços -->
      <div class="hotel-card__price-breakdown">
        <div class="hotel-card__breakdown-row">
          <span class="hotel-card__breakdown-label">Diárias</span>
          <span class="hotel-card__breakdown-value">2x {{ formatPrice(Math.floor(hotel.totalPrice / 2)) }}</span>
        </div>
        <div class="hotel-card__breakdown-row">
          <span class="hotel-card__breakdown-label">Taxas</span>
          <span class="hotel-card__breakdown-value">2x {{ formatPrice(8000) }}</span>
        </div>
        <div class="hotel-card__breakdown-row hotel-card__breakdown-row--total">
          <span class="hotel-card__breakdown-label">Total</span>
          <span class="hotel-card__breakdown-value">{{ formatPrice(hotel.totalPrice) }}</span>
        </div>
      </div>

      <BaseButton
        class="hotel-card__details-button"
        text="Ver detalhes"
        :loading="loading"
        @click="openHotelDetails"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Hotel } from '~/types'
import HotelCarousel from '~/components/HotelCarousel.vue'

interface Props {
  hotel: Hotel
  viewMode?: 'grid' | 'list'
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'grid'
})

const store = useHotelsStore()
const { openHotelDrawer, getAmenityLabel, getAmenityIcon, getAmenityColor, getPlaceName, formatPrice } = store

// State
const imageLoading = ref(true)
const loading = ref(false)
const showSuccess = ref(false)

// Tooltip state
const activeTooltip = ref<string | null>(null)
const tooltipStyle = ref({
  left: '0px',
  top: '0px'
})
const tooltipTimeout = ref<NodeJS.Timeout | null>(null)

// Tooltip functions
const showTooltip = (amenity: string, event: MouseEvent) => {
  // Clear any existing timeout
  if (tooltipTimeout.value) {
    clearTimeout(tooltipTimeout.value)
  }

  // Set a small delay before showing tooltip
  tooltipTimeout.value = setTimeout(() => {
    activeTooltip.value = amenity

    // Position tooltip near the icon
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

    tooltipStyle.value = {
      left: `${rect.left + rect.width / 2 + scrollLeft}px`,
      top: `${rect.top - 40 + scrollTop}px`
    }
  }, 300) // 300ms delay
}

const hideTooltip = () => {
  // Clear timeout if mouse leaves before tooltip shows
  if (tooltipTimeout.value) {
    clearTimeout(tooltipTimeout.value)
    tooltipTimeout.value = null
  }
  activeTooltip.value = null
}

// Get images array for carousel
const hotelImages = computed(() => {
  // Usar as imagens reais do hotel se disponíveis
  if (props.hotel.images && Array.isArray(props.hotel.images) && props.hotel.images.length > 0) {
    return props.hotel.images
  }

  // Fallback: usar apenas a imagem thumb
  if (props.hotel.thumb) {
    return [props.hotel.thumb]
  }

  // Fallback: imagem padrão
  return ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800']
})

// Methods
const openHotelDetails = async () => {
  if (loading.value) return

  loading.value = true

  try {
    // Simulate loading for better UX
    await new Promise(resolve => setTimeout(resolve, 300))
    await openHotelDrawer(props.hotel)

    // Show success feedback
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 2000)

  } catch (error) {
    // Error handling
  } finally {
    loading.value = false
  }
}

const handleImageChange = (index: number) => {
  // Opcional: você pode adicionar lógica aqui se necessário
}
</script>



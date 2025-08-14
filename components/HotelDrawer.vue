<template>
  <!-- Overlay -->
  <div
    v-if="isOpen"
    class="hotel-drawer-overlay"
    @click="closeDrawer"
  ></div>

  <!-- Drawer -->
  <div
    :class="['hotel-drawer', { 'hotel-drawer--open': isOpen }]"
  >
    <template v-if="hotel">
      <div class="hotel-drawer__content">
        <!-- Header -->
        <div class="hotel-drawer__header">
          <h2 class="hotel-drawer__title">{{ hotel.name }}</h2>
          <button
            @click="closeDrawer"
            class="hotel-drawer__close"
            aria-label="Fechar detalhes"
          >
            <i class="material-icons">close</i>
          </button>
        </div>

        <!-- Image Section with Carousel (same as HotelCard) -->
        <div class="hotel-drawer__image-section">
          <HotelCarousel
            :images="images"
            :alt="hotel.name"
            :stars="hotel.stars"
            @image-change="handleImageChange"
          />
        </div>

        <!-- Comodidades Section -->
        <div class="hotel-drawer__section">
          <h3 class="hotel-drawer__section-title">Comodidades</h3>
          <div class="hotel-drawer__amenities-list">
            <div
              v-for="amenity in hotel.amenities"
              :key="amenity"
              class="hotel-drawer__amenity-item"
            >
              <i
                :class="`material-icons ${getAmenityIcon(amenity)}`"
                class="hotel-drawer__amenity-icon"
                :style="{ '--amenity-color': getAmenityColor(amenity) }"
              ></i>
              <span class="hotel-drawer__amenity-label">{{ getAmenityLabel(amenity) }}</span>
            </div>
          </div>
        </div>

        <!-- Localização Section -->
        <div class="hotel-drawer__section">
          <h3 class="hotel-drawer__section-title">Localização</h3>
          <p class="hotel-drawer__address">{{ getFullAddress(hotel) }}</p>
        </div>

        <!-- Sobre o Hotel Section -->
        <div class="hotel-drawer__section">
          <h3 class="hotel-drawer__section-title">Sobre o {{ hotel.name }}</h3>
          <p class="hotel-drawer__description">{{ hotel.description }}</p>
        </div>
      </div>
    </template>

    <template v-else>
      <!-- Loading State -->
      <div class="hotel-drawer__loading">
        <div class="hotel-drawer__spinner"></div>
        <p>Carregando detalhes...</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Hotel } from '~/types'
import HotelCarousel from '~/components/HotelCarousel.vue'

interface Props {
  modelValue: boolean
  hotel: Hotel | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const store = useHotelsStore()
const { getAmenityLabel, getAmenityIcon, getAmenityColor, getPlaceName, closeHotelDrawer } = store

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Get images array
const images = computed(() => {
  if (!props.hotel) {
    return []
  }

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
const closeDrawer = () => {
  closeHotelDrawer()
}

const handleImageChange = (index: number) => {
  // Opcional: você pode adicionar lógica aqui se necessário
}



const getFullAddress = (hotel: Hotel): string => {
  const place = store.places.find(p => p.id === hotel.placeId)
  if (place) {
    return `${hotel.district}, ${place.name}, ${place.state}`
  }
  return hotel.district
}

// Keyboard navigation
const handleKeydown = (e: KeyboardEvent) => {
  if (!isOpen.value) return

  switch (e.key) {
    case 'Escape':
      e.preventDefault()
      closeDrawer()
      break
  }
}

// Add keyboard listeners
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>



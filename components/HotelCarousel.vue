<template>
  <div class="hotel-carousel">
    <div class="hotel-carousel__container">
      <img
        :src="currentImage"
        :alt="alt"
        class="hotel-carousel__image"
      >

      <!-- Badge de Estrelas -->
      <div v-if="stars" class="hotel-carousel__stars-badge">
        <span v-for="star in 5" :key="star" class="hotel-carousel__star">
          <i v-if="star <= parseInt(stars)" class="material-icons">star</i>
          <i v-else class="material-icons">star_border</i>
        </span>
      </div>

      <!-- Navegação de Imagens no rodapé -->
      <div v-if="images.length > 1" class="hotel-carousel__image-nav">
        <button
          class="hotel-carousel__nav-btn hotel-carousel__nav-btn--prev"
          @click="previousImage"
          :disabled="currentImageIndex === 0"
        >
          <i class="material-icons">chevron_left</i>
        </button>
        <button
          class="hotel-carousel__nav-btn hotel-carousel__nav-btn--next"
          @click="nextImage"
          :disabled="currentImageIndex === images.length - 1"
        >
          <i class="material-icons">chevron_right</i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  images: string[]
  alt?: string
  stars?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  alt: 'Imagem do hotel',
  height: '280px'
})

const emit = defineEmits<{
  'image-change': [index: number]
}>()

// Carousel state
const currentImageIndex = ref(0)

// Get current image
const currentImage = computed(() => {
  if (props.images.length === 0) {
    return ''
  }
  return props.images[currentImageIndex.value] || props.images[0] || ''
})

// Carousel methods
const nextImage = () => {
  if (currentImageIndex.value < props.images.length - 1) {
    currentImageIndex.value++
    emit('image-change', currentImageIndex.value)
  }
}

const previousImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
    emit('image-change', currentImageIndex.value)
  }
}

// Keyboard navigation
const handleKeydown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault()
      previousImage()
      break
    case 'ArrowRight':
      e.preventDefault()
      nextImage()
      break
  }
}

// Watch for images changes to reset carousel
watch(() => props.images, () => {
  currentImageIndex.value = 0
}, { immediate: true })

// Add keyboard listeners
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// Expose methods
defineExpose({
  nextImage,
  previousImage,
  currentImageIndex: readonly(currentImageIndex)
})
</script>

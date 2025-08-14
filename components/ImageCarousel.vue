<template>
  <div class="image-carousel" :style="{ height: height, minHeight: '200px', position: 'relative', width: '100%', overflow: 'hidden', background: '#f0f0f0' }">
    <div class="image-carousel__container" style="position: relative; width: 100%; height: 100%;">
      <!-- Imagem Principal -->
      <div
        class="image-carousel__wrapper"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseLeave"
        style="position: relative; width: 100%; height: 100%; overflow: hidden; cursor: grab;"
      >
        <img
          v-if="currentImage"
          :src="currentImage"
          :alt="`${alt} - Imagem ${currentIndex + 1}`"
          class="image-carousel__image"
          :class="{ 'image-carousel__image--zoomed': isZoomed }"
          @load="handleImageLoad"
          @error="handleImageError"
          @click="toggleZoom"
          style="width: 100%; height: 100%; object-fit: cover; display: block; background: #f0f0f0;"
        >
        <div v-else class="image-carousel__placeholder" style="background: #e0e0e0; display: flex; align-items: center; justify-content: center; height: 100%; width: 100%; min-height: 200px;">
          <div style="text-align: center;">
            <i class="material-icons" style="font-size: 48px; color: #666;">image</i>
            <div style="margin-top: 8px; color: #666;">Nenhuma imagem disponível</div>
          </div>
        </div>

        <!-- Loading Overlay -->
        <div v-if="imageLoading" class="image-carousel__loading" style="background: rgba(255, 255, 255, 0.9); position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; z-index: 2;">
          <div class="image-carousel__spinner" style="width: 32px; height: 32px; border: 3px solid #ccc; border-top: 3px solid #007bff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        </div>

        <!-- Zoom Controls -->
        <div v-if="!imageLoading && showZoomControls" class="image-carousel__zoom-controls" style="position: absolute; top: 12px; right: 12px; z-index: 4;">
          <button
            class="image-carousel__zoom-btn"
            @click="toggleZoom"
            :aria-label="isZoomed ? 'Reduzir zoom' : 'Aumentar zoom'"
            style="width: 40px; height: 40px; border-radius: 50%; background: rgba(255, 255, 255, 0.9); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; backdrop-filter: blur(10px); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);"
          >
            <i class="material-icons" style="font-size: 20px; color: #666;">{{ isZoomed ? 'zoom_out' : 'zoom_in' }}</i>
          </button>
        </div>

        <!-- Image Counter -->
        <div v-if="images.length > 1 && showCounter" class="image-carousel__counter" style="background: rgba(0, 0, 0, 0.7); color: white; padding: 4px 8px; border-radius: 4px; position: absolute; bottom: 12px; right: 12px; z-index: 4;">
          <span>{{ currentIndex + 1 }} / {{ images.length }}</span>
        </div>
      </div>

      <!-- Stars Badge -->
      <div v-if="stars" class="image-carousel__stars-badge" style="position: absolute; top: 16px; left: 16px; background: rgba(255, 255, 255, 0.95); border-radius: 8px; padding: 8px 12px; display: flex; align-items: center; gap: 2px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); backdrop-filter: blur(10px); z-index: 4;">
        <span v-for="star in 5" :key="star" class="image-carousel__star" style="color: #FFD700; font-size: 16px;">
          <i v-if="star <= parseInt(stars)" class="material-icons">star</i>
          <i v-else class="material-icons">star_border</i>
        </span>
      </div>

      <!-- Image Navigation -->
      <div v-if="images.length > 1" class="image-carousel__nav" style="position: absolute; top: 50%; transform: translateY(-50%); width: 100%; display: flex; justify-content: space-between; padding: 0 16px; pointer-events: none; z-index: 4;">
        <button
          class="image-carousel__nav-btn image-carousel__nav-btn--prev"
          @click="previousImage"
          :disabled="currentIndex === 0"
          aria-label="Imagem anterior"
          style="width: 44px; height: 44px; border-radius: 50%; background: rgba(255, 255, 255, 0.9); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; pointer-events: auto; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); backdrop-filter: blur(10px);"
        >
          <i class="material-icons">chevron_left</i>
        </button>
        <button
          class="image-carousel__nav-btn image-carousel__nav-btn--next"
          @click="nextImage"
          :disabled="currentIndex === images.length - 1"
          aria-label="Próxima imagem"
          style="width: 44px; height: 44px; border-radius: 50%; background: rgba(255, 255, 255, 0.9); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; pointer-events: auto; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); backdrop-filter: blur(10px);"
        >
          <i class="material-icons">chevron_right</i>
        </button>
      </div>

      <!-- Image Indicators -->
      <div v-if="images.length > 1 && showIndicators" class="image-carousel__indicators" style="position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; z-index: 4;">
        <button
          v-for="(image, index) in images"
          :key="index"
          :class="['image-carousel__indicator', { 'image-carousel__indicator--active': index === currentIndex }]"
          @click="goToImage(index)"
          :aria-label="`Ir para imagem ${index + 1}`"
          style="width: 8px; height: 8px; border-radius: 50%; background: rgba(255, 255, 255, 0.5); border: none; cursor: pointer; transition: all 0.2s ease;"
        ></button>
      </div>

      <!-- Thumbnail Strip -->
      <div v-if="images.length > 1 && showThumbnails" class="image-carousel__thumbnails" style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0, 0, 0, 0.8); padding: 8px; z-index: 4;">
        <div class="image-carousel__thumbnail-container" style="display: flex; gap: 8px; overflow-x: auto;">
          <button
            v-for="(image, index) in images"
            :key="index"
            :class="['image-carousel__thumbnail', { 'image-carousel__thumbnail--active': index === currentIndex }]"
            @click="goToImage(index)"
            :aria-label="`Ver imagem ${index + 1}`"
            style="width: 60px; height: 40px; border-radius: 4px; overflow: hidden; border: 2px solid transparent; cursor: pointer; transition: all 0.2s ease; flex-shrink: 0;"
          >
            <img :src="image" :alt="`Miniatura ${index + 1}`" style="width: 100%; height: 100%; object-fit: cover;">
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  images: string[]
  alt?: string
  stars?: string
  showZoomControls?: boolean
  showCounter?: boolean
  showIndicators?: boolean
  showThumbnails?: boolean
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  alt: 'Imagem',
  showZoomControls: true,
  showCounter: true,
  showIndicators: true,
  showThumbnails: true,
  height: '280px'
})

const emit = defineEmits<{
  'image-change': [index: number]
  'image-load': [index: number]
  'image-error': [index: number]
}>()

// State
const currentIndex = ref(0)
const imageLoading = ref(false)
const isZoomed = ref(false)

// Touch/Mouse state for swipe navigation
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchEndX = ref(0)
const touchEndY = ref(0)
const isDragging = ref(false)
const dragStartX = ref(0)

// Computed
const currentImage = computed(() => {
  if (props.images.length === 0) {
    return ''
  }

  const image = props.images[currentIndex.value] || props.images[0] || ''
  return image
})

// Methods
const nextImage = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
    isZoomed.value = false
    emit('image-change', currentIndex.value)
  }
}

const previousImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    isZoomed.value = false
    emit('image-change', currentIndex.value)
  }
}

const goToImage = (index: number) => {
  currentIndex.value = index
  isZoomed.value = false
  emit('image-change', currentIndex.value)
}

const toggleZoom = () => {
  isZoomed.value = !isZoomed.value
}

const handleImageLoad = () => {
  imageLoading.value = false
  emit('image-load', currentIndex.value)
}

const handleImageError = () => {
  imageLoading.value = false
  emit('image-error', currentIndex.value)

  // Se a imagem atual falhou, tentar a próxima
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
  }
}

// Touch/Mouse navigation methods
const handleTouchStart = (e: TouchEvent) => {
  if (isZoomed.value) return
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
}

const handleTouchMove = (e: TouchEvent) => {
  if (isZoomed.value) return
  e.preventDefault()
  touchEndX.value = e.touches[0].clientX
  touchEndY.value = e.touches[0].clientY
}

const handleTouchEnd = () => {
  if (isZoomed.value) return
  const diffX = touchStartX.value - touchEndX.value
  const diffY = touchStartY.value - touchEndY.value

  // Check if it's a horizontal swipe
  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
    if (diffX > 0) {
      nextImage()
    } else {
      previousImage()
    }
  }
}

const handleMouseDown = (e: MouseEvent) => {
  if (isZoomed.value) return
  isDragging.value = true
  dragStartX.value = e.clientX
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value || isZoomed.value) return
  e.preventDefault()
}

const handleMouseUp = (e: MouseEvent) => {
  if (!isDragging.value || isZoomed.value) return
  const diffX = dragStartX.value - e.clientX

  if (Math.abs(diffX) > 50) {
    if (diffX > 0) {
      nextImage()
    } else {
      previousImage()
    }
  }

  isDragging.value = false
}

const handleMouseLeave = () => {
  isDragging.value = false
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
    case 'z':
    case 'Z':
      e.preventDefault()
      toggleZoom()
      break
  }
}

// Watch for images changes
watch(() => props.images, () => {
  currentIndex.value = 0
  imageLoading.value = true
  isZoomed.value = false
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
  goToImage,
  toggleZoom,
  currentIndex: readonly(currentIndex)
})
</script>

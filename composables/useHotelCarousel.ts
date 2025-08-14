import type { Hotel } from '~/types'

export const useHotelCarousel = () => {
  // State
  const currentImageIndex = ref(0)
  const imageLoading = ref(false)

  // Computed
  const hotelImages = computed(() => {
    return (hotel: Hotel | null) => {
      if (!hotel) {
        return []
      }

      // Usar as imagens reais do hotel se disponíveis
      if (hotel.images && Array.isArray(hotel.images) && hotel.images.length > 0) {
        return hotel.images
      }

      // Fallback: usar apenas a imagem thumb
      if (hotel.thumb) {
        return [hotel.thumb]
      }

      // Fallback: imagem padrão
      return ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800']
    }
  })

  const currentImage = computed(() => {
    return (images: string[]) => {
      if (images.length === 0) return ''
      return images[currentImageIndex.value] || images[0] || ''
    }
  })

  // Methods
  const resetCarousel = () => {
    currentImageIndex.value = 0
    imageLoading.value = true
  }

  const nextImage = (images: string[]) => {
    if (currentImageIndex.value < images.length - 1) {
      currentImageIndex.value++
    }
  }

  const previousImage = () => {
    if (currentImageIndex.value > 0) {
      currentImageIndex.value--
    }
  }

  const goToImage = (index: number) => {
    currentImageIndex.value = index
  }

  const handleImageLoad = () => {
    imageLoading.value = false
  }

  const handleImageError = () => {
    imageLoading.value = false
  }

  const handleImageChange = (index: number) => {
    currentImageIndex.value = index
  }

  return {
    // State
    currentImageIndex: readonly(currentImageIndex),
    imageLoading: readonly(imageLoading),

    // Computed
    hotelImages,
    currentImage,

    // Methods
    resetCarousel,
    nextImage,
    previousImage,
    goToImage,
    handleImageLoad,
    handleImageError,
    handleImageChange
  }
}

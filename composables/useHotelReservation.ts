import type { Hotel } from '~/types'

export const useHotelReservation = () => {
  // State
  const reserving = ref(false)
  const reservationError = ref<string | null>(null)
  const reservationSuccess = ref(false)

  // Methods
  const handleReserve = async (hotel: Hotel) => {
    reserving.value = true
    reservationError.value = null
    reservationSuccess.value = false

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Show success message
      reservationSuccess.value = true

      // Here you would implement actual booking logic
      // const response = await $fetch('/api/bookings', {
      //   method: 'POST',
      //   body: {
      //     hotelId: hotel.id,
      //     checkIn: checkInDate.value,
      //     checkOut: checkOutDate.value,
      //     guests: numberOfGuests.value,
      //     totalPrice: hotel.totalPrice
      //   }
      // })

    } catch (error) {
      reservationError.value = 'Erro ao processar a reserva. Tente novamente.'
    } finally {
      reserving.value = false
    }
  }

  const resetReservation = () => {
    reserving.value = false
    reservationError.value = null
    reservationSuccess.value = false
  }

  return {
    // State
    reserving: readonly(reserving),
    reservationError: readonly(reservationError),
    reservationSuccess: readonly(reservationSuccess),

    // Methods
    handleReserve,
    resetReservation
  }
}

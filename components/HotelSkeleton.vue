<template>
  <div :class="['hotel-skeleton', `hotel-skeleton--${viewMode}`]">
    <!-- Seção da Imagem -->
    <div class="hotel-skeleton__image-section">
      <div class="hotel-skeleton__image-placeholder"></div>
    </div>

    <!-- Seção de Detalhes -->
    <div class="hotel-skeleton__details-section">
      <div class="hotel-skeleton__name"></div>
      <div class="hotel-skeleton__location"></div>

      <!-- Ícones de Amenidades -->
      <div class="hotel-skeleton__amenities">
        <div class="hotel-skeleton__amenity-icon"></div>
        <div class="hotel-skeleton__amenity-icon"></div>
        <div class="hotel-skeleton__amenity-icon"></div>
        <div class="hotel-skeleton__amenity-icon"></div>
      </div>

      <!-- Recursos Especiais -->
      <div class="hotel-skeleton__features">
        <div class="hotel-skeleton__feature"></div>
        <div class="hotel-skeleton__feature"></div>
      </div>
    </div>

    <!-- Seção de Preços -->
    <div class="hotel-skeleton__pricing-section">
      <div class="hotel-skeleton__price-label"></div>
      <div class="hotel-skeleton__main-price"></div>
      <div class="hotel-skeleton__no-booking-price"></div>

      <!-- Breakdown de Preços -->
      <div class="hotel-skeleton__price-breakdown">
        <div class="hotel-skeleton__breakdown-row">
          <div class="hotel-skeleton__breakdown-label"></div>
          <div class="hotel-skeleton__breakdown-value"></div>
        </div>
        <div class="hotel-skeleton__breakdown-row">
          <div class="hotel-skeleton__breakdown-label"></div>
          <div class="hotel-skeleton__breakdown-value"></div>
        </div>
        <div class="hotel-skeleton__breakdown-row hotel-skeleton__breakdown-row--total">
          <div class="hotel-skeleton__breakdown-label"></div>
          <div class="hotel-skeleton__breakdown-value"></div>
        </div>
      </div>

      <div class="hotel-skeleton__details-button"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  viewMode?: 'grid' | 'list'
}

withDefaults(defineProps<Props>(), {
  viewMode: 'list'
})
</script>

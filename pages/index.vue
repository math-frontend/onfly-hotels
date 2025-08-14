<template>
  <div class="hotels-page">
    <div class="container">
      <!-- Hotel Header Component -->
      <HotelHeader
        @tab-change="handleTabChange"
        @search="handleSearch"
      />

      <!-- Error State -->
      <div v-if="pageState.error" class="error">
        <p>{{ pageState.error }}</p>
        <button class="btn btn--primary" @click="store.fetchInitialData">Tentar novamente</button>
      </div>

      <!-- Main Content -->
      <div v-else class="hotels-page__content">
        <!-- Hotels Section -->
        <section class="hotels-section">
          <!-- Controles de ordenamento entre os componentes -->
          <div class="sorting-controls">
            <div class="minimal-controls">
              <div class="controls-group">
                <select
                  v-model="sortKey"
                  @change="handleSortChange"
                  class="sort-select"
                >
                  <option
                    v-for="option in sortOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>

                <div class="view-toggle">
                  <button
                    :class="['toggle-btn', { active: viewMode === 'grid' }]"
                    @click="viewMode = 'grid'"
                    title="Grade"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3H10V10H3V3ZM3 14H10V21H3V14ZM14 3H21V10H14V3ZM14 14H21V21H14V14Z" fill="currentColor"/>
                    </svg>
                  </button>
                  <button
                    :class="['toggle-btn', { active: viewMode === 'list' }]"
                    @click="viewMode = 'list'"
                    title="Lista"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 13H5V11H3V13ZM3 17H5V15H3V17ZM3 9H5V7H3V9ZM7 13H21V11H7V13ZM7 17H21V15H7V17ZM7 7V9H21V7H7Z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Contador de resultados -->
          <!-- <ResultsCounter
            v-if="store.hasInitialLoad"
            :total-results="store.pagination.total"
            :filters="store.filters"
            :places="store.places"
            :amenities="store.amenities"
          /> -->

          <!-- Card principal que envolve apenas a lista de hotéis -->
          <div class="hotels-card">
            <!-- Conteúdo do card com a lista de hotéis -->
            <div class="hotels-card__content">
              <!-- Loading Skeleton -->
              <HotelSkeletonList
                v-if="pageState.showSkeleton"
                :count="store.pagination.limit"
                :view-mode="viewMode"
              />

              <!-- Hotels Grid/List -->
              <div v-else-if="pageState.hasHotels" :class="['hotels-container', `hotels-${viewMode}`]">
                <HotelCard
                  v-for="hotel in store.hotels"
                  :key="hotel.id"
                  :hotel="hotel"
                  :view-mode="viewMode"
                />
              </div>

              <!-- Empty State -->
              <EmptyState
                v-else-if="pageState.showContent && store.hotels.length === 0"
                title="Nenhum hotel encontrado"
                message="Tente ajustar os filtros para encontrar mais opções"
                action-text="Limpar filtros"
                @action="store.resetFilters"
              />

              <!-- Paginação Desktop -->
              <Pagination
                v-if="store.pagination.total > 0 && !isMobile"
                :pagination="store.pagination"
                class="pagination-desktop"
              />

              <!-- Load More Mobile -->
              <LoadMoreButton
                v-if="store.pagination.total > 0 && store.pagination.hasMore && isMobile && store.pagination.total > store.pagination.limit"
                :pagination="store.pagination"
                :is-loading="store.isLoadingMore"
                class="load-more-mobile"
              />



            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Hotel Details Drawer -->
    <HotelDrawer
      v-model="store.isDrawerOpen"
      :hotel="store.selectedHotel as Hotel | null"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Hotel } from '~/types'

// Use the composable for better organization
const {
  store,
  sortKey,
  sortOptions,
  handleSortChange,
  handleTabChange,
  handleSearch,
  pageState
} = useHotelPage()

// View mode state
const viewMode = ref<'grid' | 'list'>('list')

// Mobile detection
const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768 // $breakpoint-md
}

// Fetch data on mount
onMounted(() => {
  // Detectar dispositivo imediatamente
  checkMobile()

  // Adicionar listener para resize
  window.addEventListener('resize', checkMobile)

  // Carregar dados
  store.fetchInitialData()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>



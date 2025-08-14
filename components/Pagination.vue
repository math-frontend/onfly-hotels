<template>
  <div v-if="pagination.totalPages > 1" class="pagination">
    <div class="pagination__header">
      <div class="pagination__info">
        <span class="pagination__text">
          Mostrando {{ startItem }}-{{ endItem }} de {{ pagination.total }} hotéis
        </span>
      </div>

      <!-- Seletor de itens por página -->
      <ItemsPerPageSelector :current-limit="pagination.limit" />
    </div>

    <div class="pagination__controls">
      <!-- Botão Anterior -->
      <button
        :disabled="pagination.currentPage === 1"
        @click="handleGoToPage(pagination.currentPage - 1)"
        class="pagination__btn pagination__btn--prev"
        title="Página anterior"
      >
        <i class="material-icons">chevron_left</i>
      </button>

      <!-- Páginas -->
      <div class="pagination__pages">
        <!-- Primeira página -->
        <button
          v-if="showFirstPage"
          @click="handleGoToPage(1)"
          :class="['pagination__page', { active: pagination.currentPage === 1 }]"
        >
          1
        </button>

        <!-- Separador inicial -->
        <span v-if="showFirstSeparator" class="pagination__separator">...</span>

        <!-- Páginas do meio -->
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="handleGoToPage(page)"
          :class="['pagination__page', { active: pagination.currentPage === page }]"
        >
          {{ page }}
        </button>

        <!-- Separador final -->
        <span v-if="showLastSeparator" class="pagination__separator">...</span>

        <!-- Última página -->
        <button
          v-if="showLastPage"
          @click="handleGoToPage(pagination.totalPages)"
          :class="['pagination__page', { active: pagination.currentPage === pagination.totalPages }]"
        >
          {{ pagination.totalPages }}
        </button>
      </div>

      <!-- Botão Próximo -->
      <button
        :disabled="pagination.currentPage === pagination.totalPages"
        @click="handleGoToPage(pagination.currentPage + 1)"
        class="pagination__btn pagination__btn--next"
        title="Próxima página"
      >
        <i class="material-icons">chevron_right</i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PaginationInfo } from '~/types'

interface Props {
  pagination: PaginationInfo
}

const props = defineProps<Props>()

const store = useHotelsStore()
const { goToPage } = store

// Wrapper function
const handleGoToPage = (page: number) => {
  goToPage(page)
}

// Computed properties para cálculos de paginação
const startItem = computed(() => {
  return props.pagination.offset + 1
})

const endItem = computed(() => {
  return Math.min(props.pagination.offset + props.pagination.limit, props.pagination.total)
})

// Lógica para mostrar páginas com elipses
const maxVisiblePages = 5
const showFirstPage = computed(() => {
  return props.pagination.currentPage > 3
})

const showLastPage = computed(() => {
  return props.pagination.currentPage < props.pagination.totalPages - 2
})

const showFirstSeparator = computed(() => {
  return props.pagination.currentPage > 4
})

const showLastSeparator = computed(() => {
  return props.pagination.currentPage < props.pagination.totalPages - 3
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const totalPages = props.pagination.totalPages
  const currentPage = props.pagination.currentPage

  if (totalPages <= maxVisiblePages) {
    // Mostrar todas as páginas se houver 5 ou menos
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Lógica para mostrar páginas com elipses
    let start = Math.max(1, currentPage - 2)
    let end = Math.min(totalPages, currentPage + 2)

    // Ajustar para mostrar sempre 5 páginas quando possível
    if (currentPage <= 3) {
      end = Math.min(totalPages, 5)
    } else if (currentPage >= totalPages - 2) {
      start = Math.max(1, totalPages - 4)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  }

  return pages
})
</script>

<style lang="scss" scoped>
.pagination {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-16;
  padding: $spacing-24;
  margin-top: $spacing-24;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: $spacing-16;
  }

  &__info {
    text-align: left;
  }

  &__text {
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: $spacing-8;
  }

  &__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: 1px solid #e2e8f0;
    background: white;
    border-radius: $border-radius-8;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      border-color: $primary-100;
      color: $primary-100;
      background: #f0f9ff;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    i {
      font-size: 20px;
    }
  }

  &__pages {
    display: flex;
    align-items: center;
    gap: $spacing-4;
  }

  &__page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    height: 40px;
    padding: 0 $spacing-8;
    border: 1px solid #e2e8f0;
    background: white;
    border-radius: $border-radius-8;
    color: #64748b;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: $primary-100;
      color: $primary-100;
      background: #f0f9ff;
    }

    &.active {
      background: $primary-100;
      border-color: $primary-100;
      color: white;
    }
  }

  &__separator {
    color: #94a3b8;
    font-weight: 500;
    padding: 0 $spacing-4;
  }
}

// Responsive
@media (max-width: $breakpoint-sm) {
  .pagination {
    padding: $spacing-16;

    &__header {
      flex-direction: column;
      gap: $spacing-12;
      align-items: stretch;
    }

    &__info {
      text-align: center;
    }

    &__controls {
      gap: $spacing-4;
    }

    &__btn,
    &__page {
      width: 36px;
      height: 36px;
      min-width: 36px;
    }
  }
}
</style>

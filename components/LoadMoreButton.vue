<template>
  <div v-if="pagination.hasMore" class="load-more">
    <BaseButton
      variant="outline"
      text="Carregar mais hotéis"
      icon="expand_more"
      :loading="isLoading"
      :disabled="isLoading"
      @click="loadMore"
    />

    <div class="load-more__info">
      <span class="load-more__text">
        Mostrando {{ currentCount }} de {{ pagination.total }} hotéis
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PaginationInfo } from '~/types'

interface Props {
  pagination: PaginationInfo
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
})

const store = useHotelsStore()
const { loadMoreHotels } = store

const currentCount = computed(() => {
  return Math.min(props.pagination.offset + props.pagination.limit, props.pagination.total)
})

const loadMore = async () => {
  await loadMoreHotels()
}
</script>

<style lang="scss" scoped>
.load-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-16;
  padding: $spacing-24;
  margin-top: $spacing-24;

  &__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 200px;
    height: 48px;
    padding: 0 $spacing-24;
    border: 2px solid $primary-100;
    background: white;
    border-radius: $border-radius-12;
    color: $primary-100;
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      background: $primary-100;
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 158, 251, 0.3);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }

  &__loading {
    display: flex;
    align-items: center;
    gap: $spacing-8;
  }

  &__content {
    display: flex;
    align-items: center;
    gap: $spacing-8;
  }

  &__spinner {
    width: 20px;
    height: 20px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  &__info {
    text-align: center;
  }

  &__text {
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
  }

  i {
    font-size: 20px;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// Responsive
@media (max-width: $breakpoint-sm) {
  .load-more {
    padding: $spacing-16;

    &__btn {
      min-width: 180px;
      height: 44px;
      font-size: 15px;
    }
  }
}
</style>

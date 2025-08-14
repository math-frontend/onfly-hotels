<template>
  <div class="items-per-page">
    <div class="items-per-page__label">
      <span>Mostrar</span>
    </div>

    <div class="items-per-page__select">
      <select
        :value="currentLimit"
        @change="handleLimitChange"
        class="items-per-page__dropdown"
      >
        <option
          v-for="limit in availableLimits"
          :key="limit"
          :value="limit"
        >
          {{ limit }} hotéis
        </option>
      </select>
    </div>

    <div class="items-per-page__info">
      <span>por página</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import config from '~/data/config.js'

interface Props {
  currentLimit: number
}

const props = defineProps<Props>()

const store = useHotelsStore()
const { updateItemsPerPage } = store

// Limites disponíveis baseados na configuração
const availableLimits = computed(() => config.pagination.availableLimits)

const handleLimitChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement
  const newLimit = parseInt(target.value)

  if (newLimit !== props.currentLimit) {
    await updateItemsPerPage(newLimit)
  }
}
</script>

<style lang="scss" scoped>
.items-per-page {
  display: flex;
  align-items: center;
  gap: $spacing-8;
  padding: $spacing-16;

  &__label,
  &__info {
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
  }

  &__select {
    position: relative;
  }

  &__dropdown {
    appearance: none;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: $border-radius-6;
    padding: $spacing-8 $spacing-12;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
    min-width: 100px;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 8px center;
    background-repeat: no-repeat;
    background-size: 16px;
    padding-right: 32px;

    &:hover {
      border-color: $primary-100;
    }

    &:focus {
      outline: none;
      border-color: $primary-100;
      box-shadow: 0 0 0 3px rgba(0, 158, 251, 0.1);
    }

    option {
      font-size: 14px;
      padding: $spacing-4;
    }
  }
}

// Responsive
@media (max-width: $breakpoint-sm) {
  .items-per-page {
    padding: $spacing-12;
    gap: $spacing-6;

    &__label,
    &__info {
      font-size: 13px;
    }

    &__dropdown {
      min-width: 80px;
      padding: $spacing-6 $spacing-8;
      font-size: 13px;
    }
  }
}
</style>

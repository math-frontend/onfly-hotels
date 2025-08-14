<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
    type="button"
  >
    <div v-if="loading" class="search-button__loading">
      <div class="spinner"></div>
    </div>
    <i v-else class="material-icons">{{ icon }}</i>
    <span v-if="showText">{{ text }}</span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  text?: string
  icon?: string
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  disabled?: boolean
  showText?: boolean
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  text: 'Buscar',
  icon: 'search',
  variant: 'primary',
  size: 'medium',
  loading: false,
  disabled: false,
  showText: true,
  fullWidth: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => [
  'search-button',
  `search-button--${props.variant}`,
  `search-button--${props.size}`,
  {
    'search-button--loading': props.loading,
    'search-button--disabled': props.disabled,
    'search-button--full-width': props.fullWidth
  }
])

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style lang="scss" scoped>
@use 'sass:color';

.search-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  // Variants - mantendo o padrão atual
  &--primary {
    background: #0094ff;
    color: #fff;
    min-width: 120px;

    &:hover:not(:disabled) {
      background: color.adjust(#0094ff, $lightness: -5%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 148, 255, 0.3);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }

  &--secondary {
    background: #f1f5f9;
    color: #64748b;
    border: 1px solid #e2e8f0;

    &:hover:not(:disabled) {
      background: #e2e8f0;
      color: #475569;
    }
  }

  &--outline {
    background: transparent;
    color: #0094ff;
    border: 2px solid #0094ff;

    &:hover:not(:disabled) {
      background: #0094ff;
      color: #fff;
    }
  }

  // Sizes
  &--small {
    padding: 8px 16px;
    font-size: 14px;
    min-width: 80px;

    .material-icons {
      font-size: 16px;
    }
  }

  &--medium {
    padding: 0 24px;
    font-size: 16px;
    min-width: 120px;

    .material-icons {
      font-size: 18px;
    }
  }

  &--large {
    padding: 16px 32px;
    font-size: 18px;
    min-width: 160px;

    .material-icons {
      font-size: 20px;
    }
  }

  // States
  &--loading {
    cursor: wait;
  }

  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  &--full-width {
    width: 100%;
  }

  // Loading spinner
  &__loading {
    display: flex;
    align-items: center;
    justify-content: center;

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid #fff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

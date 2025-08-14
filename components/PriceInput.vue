<template>
  <div class="price-input">
    <label v-if="label" class="price-input__label">{{ label }}</label>
    <input
      type="text"
      :value="formattedValue"
      @input="handleInput"
      :placeholder="placeholder"
      :class="['price-input__field', inputClass]"
      :disabled="disabled"
    >
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: number
  label?: string
  placeholder?: string
  inputClass?: string
  disabled?: boolean
  min?: number
  max?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: 'R$ 0,00',
  inputClass: '',
  disabled: false,
  min: 0,
  max: 1000000
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const { formatPriceInput, handlePriceInput } = usePriceMask()

// Valor formatado para exibição
const formattedValue = computed(() => {
  return formatPriceInput(props.modelValue)
})

// Handler para input
const handleInput = (event: Event) => {
  handlePriceInput(event, (value) => {
    // Validar limites
    const clampedValue = Math.max(props.min, Math.min(props.max, value))
    emit('update:modelValue', clampedValue)
  }, props.min)
}
</script>

<style lang="scss" scoped>
.price-input {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;

  &__label {
    font-size: $font-size-default;
    font-weight: 500;
    color: $info-600;
    font-family: $font-family;
  }

  &__field {
    width: 100%;
    padding: $spacing-8 $spacing-12;
    border: 1px solid $info-200;
    border-radius: $border-radius-8;
    font-family: $font-family;
    font-size: $font-size-default;
    color: $info-600;
    background-color: white;
    transition: border-color 0.2s ease;

    &:focus {
      outline: none;
      border-color: $primary-100;
      box-shadow: 0 0 0 3px rgba(0, 158, 251, 0.1);
    }

    &:disabled {
      background-color: $info-100;
      color: $info-400;
      cursor: not-allowed;
    }

    &::placeholder {
      color: $info-300;
    }
  }
}
</style>

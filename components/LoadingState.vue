<template>
  <div class="loading">
    <div class="loading__spinner">
      <div class="loading__spinner-circle"></div>
    </div>
    <p class="loading__message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string
}

withDefaults(defineProps<Props>(), {
  message: 'Carregando...'
})
</script>



<template>
  <div class="empty-state">
    <div class="empty-state__icon">
      <i class="material-icons">{{ icon }}</i>
    </div>
    <h3 class="empty-state__title">{{ title }}</h3>
    <p class="empty-state__message">{{ message }}</p>
    <BaseButton
      v-if="actionText"
      :text="actionText"
      @click="$emit('action')"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon?: string
  title: string
  message: string
  actionText?: string
}

withDefaults(defineProps<Props>(), {
  icon: 'search_off'
})

defineEmits<{
  action: []
}>()
</script>



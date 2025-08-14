<template>
  <div :class="['hotels-container', `hotels-${viewMode}`]">
    <HotelSkeleton
      v-for="i in count"
      :key="i"
      :view-mode="viewMode"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  count?: number
  viewMode?: 'grid' | 'list'
}

withDefaults(defineProps<Props>(), {
  count: 6,
  viewMode: 'list'
})
</script>

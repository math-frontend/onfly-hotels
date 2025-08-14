<template>
  <div class="data-table">
    <div class="data-table__header">
      <h3 class="data-table__title">{{ title }}</h3>
      <div class="data-table__actions">
        <slot name="actions"></slot>
      </div>
    </div>

    <div class="data-table__content">
      <table class="table">
        <thead class="table__header">
          <tr>
            <th v-for="column in columns" :key="column.key" class="table__cell table__cell--header">
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="table__body">
          <tr v-for="item in data" :key="item.id" class="table__row">
            <td v-for="column in columns" :key="column.key" class="table__cell">
              <slot :name="column.key" :item="item" :value="item[column.key]">
                {{ formatValue(item[column.key], column.type) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="data.length === 0" class="data-table__empty">
        <p>No data available</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Column } from '~/types'

interface Props {
  title: string
  columns: Column[]
  data: any[]
}

const props = defineProps<Props>()

const formatValue = (value: any, type?: string) => {
  if (value === null || value === undefined) return '-'

  switch (type) {
    case 'date':
      return new Date(value).toLocaleDateString()
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : value
    case 'status':
      return value.charAt(0).toUpperCase() + value.slice(1)
    default:
      return value
  }
}
</script>



# SearchButton Component

## Visão Geral

Componente reutilizável para botões de busca que mantém o padrão visual do projeto. Substitui botões customizados por uma solução padronizada e funcional.

## Uso Básico

```vue
<template>
  <SearchButton @click="handleSearch" />
</template>
```

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `text` | `string` | `'Buscar'` | Texto do botão |
| `icon` | `string` | `'search'` | Ícone do Material Icons |
| `variant` | `'primary' \| 'secondary' \| 'outline'` | `'primary'` | Estilo do botão |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Tamanho do botão |
| `loading` | `boolean` | `false` | Estado de carregamento |
| `disabled` | `boolean` | `false` | Estado desabilitado |
| `showText` | `boolean` | `true` | Mostrar texto |
| `fullWidth` | `boolean` | `false` | Largura total |

## Exemplos de Uso

### Busca Principal (HotelHeader)
```vue
<SearchButton
  :loading="isSearching"
  :disabled="!searchQuery.trim()"
  @click="performSearch"
/>
```

### Busca Secundária
```vue
<SearchButton
  variant="outline"
  size="small"
  text="Buscar mesmo assim"
  @click="performSearch"
/>
```

### Botão de Limpar Filtros
```vue
<SearchButton
  variant="secondary"
  text="Limpar filtros"
  icon="clear"
  @click="resetFilters"
/>
```

### Botão de Carregar Mais
```vue
<SearchButton
  variant="outline"
  text="Carregar mais hotéis"
  icon="expand_more"
  :loading="isLoading"
  @click="loadMore"
/>
```

### Botão de Ação (EmptyState)
```vue
<SearchButton
  :text="actionText"
  @click="handleAction"
/>
```

## Integração Atual

O componente foi aplicado nos seguintes locais:

1. **HotelHeader.vue**
   - Botão principal de busca
   - Botão "Buscar mesmo assim"

2. **HotelFilters.vue**
   - Botão "Limpar filtros"

3. **EmptyState.vue**
   - Botão de ação

4. **LoadMoreButton.vue**
   - Botão "Carregar mais hotéis"

## Benefícios

- **Consistência**: Padrão visual único
- **Manutenibilidade**: Mudanças centralizadas
- **Reutilização**: Menos código duplicado
- **Funcionalidade**: Estados de loading e disabled
- **Responsividade**: Adapta-se a diferentes telas

## Manutenção

Para manter o padrão:

1. Use sempre `SearchButton` para botões de busca/ação
2. Não crie novos estilos de botão
3. Aplique o componente em novos locais conforme necessário
4. Mantenha a documentação atualizada

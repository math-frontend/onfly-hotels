# Configuração de Paginação de Hotéis

## Visão Geral

A paginação de hotéis foi configurada para exibir **10 hotéis por página** por padrão, com a possibilidade de o usuário escolher entre diferentes quantidades através de um seletor no rodapé.

## Configurações Implementadas

### 1. Limite Padrão
- **Valor padrão**: 10 hotéis por página
- **Configuração**: `data/config.js`
- **Store**: `stores/hotels.ts`

### 2. Opções Disponíveis
O usuário pode escolher entre as seguintes quantidades:
- 10 hotéis por página
- 20 hotéis por página
- 50 hotéis por página
- 100 hotéis por página

### 3. Componente de Seleção
- **Arquivo**: `components/ItemsPerPageSelector.vue`
- **Localização**: Rodapé da paginação (desktop)
- **Funcionalidade**: Dropdown para seleção de quantidade

## Estrutura dos Arquivos

### Configuração (`data/config.js`)
```javascript
pagination: {
  defaultLimit: 10,
  maxLimit: 100,
  availableLimits: [10, 20, 50, 100]
}
```

### Store (`stores/hotels.ts`)
```typescript
// Estado inicial
const pagination = ref<PaginationInfo>({
  total: 0,
  offset: 0,
  limit: 10, // Alterado de 20 para 10
  hasMore: false,
  currentPage: 1,
  totalPages: 0
})

// Nova função para atualizar limite
const updateItemsPerPage = async (newLimit: number): Promise<void> => {
  pagination.value.limit = newLimit
  pagination.value.offset = 0
  pagination.value.currentPage = 1
  hotels.value = []
  await fetchFilteredHotels(false)
}
```

### Componente de Paginação (`components/Pagination.vue`)
- Adicionado seletor de itens por página no rodapé
- Layout responsivo que se adapta a diferentes tamanhos de tela
- Informações contextuais sobre a paginação atual

## Funcionalidades

### 1. Seleção Dinâmica
- O usuário pode alterar a quantidade de hotéis por página a qualquer momento
- A mudança reseta automaticamente para a primeira página
- Os filtros aplicados são mantidos

### 2. Responsividade
- **Desktop**: Seletor integrado ao componente de paginação
- **Mobile**: Mantém o sistema de "Load More" infinito

### 3. Persistência
- A seleção do usuário é mantida durante a sessão
- Reset automático quando filtros são alterados

## Interface do Usuário

### Desktop
```
Mostrando 1-10 de 150 hotéis    [10 hotéis ▼] por página

[<] 1 2 3 ... 15 [>]
```

### Mobile
```
[Carregar mais hotéis]
Mostrando 10 de 150 hotéis
```

## Benefícios

1. **Melhor Performance**: Menos itens carregados por vez
2. **Flexibilidade**: Usuário escolhe sua preferência
3. **Experiência Consistente**: Mantém padrões de UX
4. **Responsivo**: Adapta-se a diferentes dispositivos

## Considerações Técnicas

- A mudança de limite reseta a paginação para evitar inconsistências
- O debounce de 300ms evita requisições excessivas
- A API suporta qualquer limite até o máximo configurado
- Estados de loading são gerenciados adequadamente

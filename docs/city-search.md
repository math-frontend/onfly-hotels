# Componente de Busca de Cidades

## Visão Geral

O componente `CitySearchInput` é um input de pesquisa moderno e responsivo que permite buscar cidades através da API. Ele inclui funcionalidades como debounce, loading state, navegação por teclado e dropdown de resultados.

## Características

- 🔍 **Busca em tempo real** com debounce de 300ms
- ⚡ **Loading state** com spinner animado
- ⌨️ **Navegação por teclado** (setas, Enter, Escape)
- 🎯 **Auto-complete** com dropdown de resultados
- 📱 **Design responsivo** e moderno
- 🎨 **Estilização customizável**
- 🔧 **Integração fácil** com v-model

## Uso Básico

```vue
<template>
  <CitySearchInput
    v-model="selectedCity"
    @select="handleCitySelect"
    placeholder="Digite o nome da cidade..."
  />
</template>

<script setup>
import { ref } from 'vue'
import type { City } from '~/types'

const selectedCity = ref('')
const selectedCityInfo = ref(null)

const handleCitySelect = (city: City) => {
  selectedCityInfo.value = city
  console.log('Cidade selecionada:', city)
}
</script>
```

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `modelValue` | `string` | `''` | Valor do input (v-model) |
| `placeholder` | `string` | `'Buscar cidade...'` | Placeholder do input |

## Events

| Event | Payload | Descrição |
|-------|---------|-----------|
| `update:modelValue` | `string` | Emitido quando o valor do input muda |
| `select` | `City` | Emitido quando uma cidade é selecionada |

## Tipos

```typescript
interface State {
  name: string
  shortname: string
}

interface City {
  name: string
  state: State
  placeId: number
}
```

## API Endpoint

O componente utiliza o endpoint `/api/cities` para buscar cidades:

```
GET /api/cities?search=query
```

### Resposta da API

```json
{
  "success": true,
  "cities": [
    {
      "name": "São Paulo",
      "state": {
        "name": "São Paulo",
        "shortname": "SP"
      },
      "placeId": 1
    }
  ],
  "count": 1,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Funcionalidades

### Debounce
A busca é executada automaticamente após 300ms de inatividade do usuário, evitando requisições desnecessárias.

### Loading State
Durante a busca, um spinner é exibido no input e uma mensagem de "Buscando cidades..." aparece no dropdown.

### Navegação por Teclado
- **↑/↓**: Navegar pelos resultados
- **Enter**: Selecionar cidade destacada
- **Escape**: Fechar dropdown
- **Tab**: Navegação normal

### Filtros de Busca
A busca funciona por:
- Nome da cidade
- Nome do estado
- Sigla do estado

## Estilização

O componente usa CSS customizado com:
- Bordas arredondadas (12px)
- Sombras suaves
- Transições suaves
- Cores modernas
- Scrollbar customizada

### Variáveis CSS Customizáveis

```css
:root {
  --city-search-border-color: #e2e8f0;
  --city-search-focus-color: #3b82f6;
  --city-search-bg-color: #ffffff;
  --city-search-text-color: #1e293b;
  --city-search-placeholder-color: #94a3b8;
}
```

## Integração com Filtros

Para integrar com o sistema de filtros de hotéis:

```vue
<script setup>
const handleCitySelect = (city: City) => {
  // Atualizar filtros do store
  updateFilters({ placeId: city.placeId })
}
</script>
```

## Exemplo Completo

```vue
<template>
  <div class="search-container">
    <h3>Buscar por cidade:</h3>
    <CitySearchInput
      v-model="selectedCity"
      @select="handleCitySelect"
      placeholder="Digite o nome da cidade..."
    />

    <div v-if="selectedCityInfo" class="selected-info">
      <p>Cidade selecionada: <strong>{{ selectedCityInfo.name }}, {{ selectedCityInfo.state.shortname }}</strong></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { City } from '~/types'

const selectedCity = ref('')
const selectedCityInfo = ref<City | null>(null)

const handleCitySelect = (city: City) => {
  selectedCityInfo.value = city
  console.log('Cidade selecionada:', city)

  // Integrar com filtros de hotel
  // updateFilters({ placeId: city.placeId })
}
</script>

<style scoped>
.search-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 24px;
}

.selected-info {
  margin-top: 16px;
  padding: 12px;
  background-color: #f0f9ff;
  border-radius: 8px;
  text-align: center;
}
</style>
```

## Troubleshooting

### Problema: API não responde
- Verifique se o servidor está rodando em `http://localhost:3001`
- Confirme se o endpoint `/api/cities` está disponível

### Problema: Dropdown não aparece
- Verifique se há dados sendo retornados da API
- Confirme se o componente está recebendo o evento `focus`

### Problema: Estilos não aplicados
- Verifique se o CSS está sendo importado corretamente
- Confirme se não há conflitos com outros estilos

## Performance

- Debounce de 300ms reduz requisições desnecessárias
- Lazy loading dos resultados
- Memoização dos dados filtrados
- Cleanup automático de timeouts

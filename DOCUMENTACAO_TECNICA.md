# 📋 Documentação Técnica - Onfly Hotels

## 📖 Visão Geral

O **Onfly** é um sistema completo de busca e filtros de hotéis desenvolvido como teste técnico. O projeto demonstra uma arquitetura moderna com frontend em Nuxt 3, backend com JSON Server, e gerenciamento de estado com Pinia.

### 🎯 Objetivos do Projeto

- Demonstrar habilidades em desenvolvimento full-stack
- Implementar sistema de busca avançada com múltiplos filtros
- Criar interface responsiva e moderna
- Utilizar boas práticas de desenvolvimento
- Implementar arquitetura escalável e manutenível

---

## 🏗️ Arquitetura do Sistema

### Estrutura Geral

```
Onfly/
├── 📁 components/          # Componentes Vue reutilizáveis
├── 📁 composables/         # Composables Vue (lógica reutilizável)
├── 📁 data/               # Backend e dados
├── 📁 pages/              # Páginas da aplicação
├── 📁 stores/             # Gerenciamento de estado (Pinia)
├── 📁 types/              # Definições TypeScript
├── 📁 assets/             # Recursos estáticos e estilos
└── 📁 docs/               # Documentação adicional
```

### Padrão de Arquitetura

O projeto segue o padrão **MVVM (Model-View-ViewModel)** com separação clara de responsabilidades:

- **Model**: Dados e lógica de negócio (stores, composables)
- **View**: Interface do usuário (components, pages)
- **ViewModel**: Estado e lógica de apresentação (stores, composables)

---

## 🛠️ Stack Tecnológica

### Frontend
- **Nuxt 3** - Framework Vue.js com SSR/SSG
- **Vue 3** - Framework progressivo JavaScript
- **TypeScript** - Tipagem estática
- **Pinia** - Gerenciamento de estado
- **SCSS** - Pré-processador CSS
- **Quasar** - Framework de componentes

### Backend
- **JSON Server** - API REST mock
- **Node.js** - Runtime JavaScript

### Ferramentas de Desenvolvimento
- **Vite** - Build tool
- **ESLint** - Linting de código
- **Concurrently** - Execução paralela de scripts

---

## 📊 Estrutura de Dados

### Tipos Principais

```typescript
// Hotel - Entidade principal
interface Hotel {
  id: number
  name: string
  description: string
  stars: string
  totalPrice: number
  dailyPrice: number
  tax: number
  thumb: string
  images?: string[]
  amenities: string[]
  hasBreakFast: boolean
  hasRefundableRoom: boolean
  district: string
  placeId: number
}

// Filtros de busca
interface FilterState {
  minPrice: number
  maxPrice: number
  stars: string[]
  amenities: string[]
  hasBreakFast: boolean | null
  hasRefundableRoom: boolean | null
  placeId: number | null
  searchQuery: string
}

// Informações de paginação
interface PaginationInfo {
  total: number
  offset: number
  limit: number
  hasMore: boolean
  currentPage: number
  totalPages: number
}
```

### Dados Disponíveis

- **20 hotéis** distribuídos em 5 cidades brasileiras
- **5 lugares/cidades**: São Paulo, Rio de Janeiro, Belo Horizonte, Salvador, Curitiba
- **12 comodidades**: Wi-Fi, Estacionamento, Piscina, Restaurante, Academia, etc.
- **Faixa de preços**: R$ 90 - R$ 500.000
- **Classificações**: 3, 4 e 5 estrelas

---

## 🔌 API REST

### Base URL
```
http://localhost:3001/api
```

### Endpoints Principais

| Método | Endpoint | Descrição | Parâmetros |
|--------|----------|-----------|------------|
| `GET` | `/hotels` | Lista todos os hotéis | - |
| `GET` | `/hotels/:id` | Busca hotel por ID | `id` |
| `GET` | `/hotels/search` | Busca com filtros | `q`, `minPrice`, `maxPrice`, `stars`, `amenities`, etc. |
| `GET` | `/hotels/stats` | Estatísticas gerais | - |
| `GET` | `/hotels/filtered` | Hotéis filtrados com paginação | Todos os filtros + `sortBy`, `sortOrder`, `limit`, `offset` |
| `GET` | `/places` | Lista todos os lugares | - |
| `GET` | `/cities` | Busca cidades | `name_like` |
| `GET` | `/amenities` | Lista todas as comodidades | - |
| `GET` | `/health` | Health check | - |

### Exemplos de Uso

```bash
# Buscar hotéis com filtros
GET /api/hotels/filtered?minPrice=100000&maxPrice=300000&stars=4,5&amenities=WI_FI,POOL

# Buscar hotéis por texto
GET /api/hotels/search?q=São Paulo

# Buscar estatísticas
GET /api/hotels/stats

# Buscar cidades
GET /api/cities?name_like=são paulo
```

### Resposta Padrão

```json
{
  "success": true,
  "data": [...],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🏪 Gerenciamento de Estado (Pinia)

### Store Principal: `hotels.ts`

O store centraliza toda a lógica de negócio e estado da aplicação:

#### Estado Principal
```typescript
// Dados
const hotels = ref<Hotel[]>([])
const places = ref<Place[]>([])
const amenities = ref<Amenity[]>([])

// Estado de carregamento
const loading = ref(false)
const error = ref<string | null>(null)

// Filtros e ordenação
const filters = ref<FilterState>({...})
const sortBy = ref<SortOption>({...})

// Paginação
const pagination = ref<PaginationInfo>({...})
```

#### Ações Principais

```typescript
// Busca e carregamento
const fetchInitialData = async (): Promise<void>
const fetchFilteredHotels = async (resetPagination?: boolean): Promise<void>
const searchHotels = async (query: string): Promise<void>

// Filtros
const updateFilters = (newFilters: Partial<FilterState>): void
const updatePriceFilter = (minPrice: number, maxPrice: number): void
const updateStarsFilter = (stars: string[]): void
const updateAmenitiesFilter = (amenities: string[]): void

// Ordenação
const updateSort = (newSort: SortOption): void
const sortByPrice = (direction: 'asc' | 'desc'): void

// Paginação
const loadMoreHotels = async (): Promise<void>
const goToPage = async (page: number): Promise<void>
```

#### Computed Properties

```typescript
// Hotéis filtrados
const filteredHotels = computed(() => {
  // Lógica de filtragem complexa
})

// Estatísticas filtradas
const filteredStats = computed(() => {
  // Cálculo de estatísticas em tempo real
})

// Verificação de filtros ativos
const hasActiveFilters = computed(() => {
  // Verifica se há filtros aplicados
})
```

---

## 🧩 Componentes Vue

### Estrutura de Componentes

#### Componentes Base
- `BaseButton.vue` - Botão base reutilizável
- `LoadingState.vue` - Estado de carregamento
- `EmptyState.vue` - Estado vazio

#### Componentes Específicos
- `HotelCard.vue` - Card de exibição do hotel
- `HotelHeader.vue` - Cabeçalho com busca e filtros
- `HotelFilters.vue` - Painel de filtros
- `HotelDrawer.vue` - Drawer de detalhes do hotel
- `HotelCarousel.vue` - Carrossel de imagens

#### Componentes de Controle
- `CitySearchInput.vue` - Input de busca de cidades
- `FilterDropdown.vue` - Dropdown de filtros
- `Pagination.vue` - Controles de paginação
- `DataTable.vue` - Tabela de dados

### Padrões de Componentes

#### Props e Emits
```vue
<script setup lang="ts">
interface Props {
  hotel: Hotel
  viewMode?: 'grid' | 'list'
}

interface Emits {
  (e: 'click', hotel: Hotel): void
  (e: 'favorite', hotel: Hotel): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>
```

#### Composables
```typescript
// useHotelPage.ts - Lógica da página principal
export const useHotelPage = () => {
  const store = useHotelsStore()

  // Lógica de ordenação
  const handleSortChange = () => { ... }

  // Handlers de eventos
  const handleSearch = (query: string) => { ... }

  return { store, handleSortChange, handleSearch }
}
```

---

## 🎨 Sistema de Design

### Variáveis SCSS

```scss
// Cores
$primary-color: #009EFB;
$success-color: #00835C;
$info-color: #ADADB3;

// Espaçamentos
$spacing-base: 4px;
$spacing-xs: $spacing-base;
$spacing-sm: $spacing-base * 2;
$spacing-md: $spacing-base * 4;
$spacing-lg: $spacing-base * 6;

// Breakpoints
$breakpoint-sm: 576px;
$breakpoint-md: 768px;
$breakpoint-lg: 992px;
$breakpoint-xl: 1200px;
```

### Classes Utilitárias

```scss
// Layout
.container { max-width: 1200px; margin: 0 auto; }
.grid { display: grid; }
.flex { display: flex; }

// Espaçamentos
.mt-1 { margin-top: $spacing-sm; }
.mb-2 { margin-bottom: $spacing-md; }
.p-3 { padding: $spacing-lg; }

// Responsividade
@media (max-width: $breakpoint-md) {
  .hidden-mobile { display: none; }
}
```

---

## 🔍 Funcionalidades Implementadas

### 1. Sistema de Busca
- **Busca por texto**: Nome do hotel, distrito, cidade
- **Busca por cidade**: Autocomplete com cache
- **Normalização de texto**: Remove acentos e converte para minúsculas
- **Debounce**: Evita requisições excessivas

### 2. Filtros Avançados
- **Preço**: Range slider com valores em centavos
- **Estrelas**: Seleção múltipla (3, 4, 5 estrelas)
- **Comodidades**: Checkboxes com ícones e cores
- **Características**: Café da manhã, quarto reembolsável
- **Localização**: Filtro por cidade

### 3. Ordenação
- **Preço**: Crescente/decrescente
- **Classificação**: Por estrelas
- **Nome**: Ordem alfabética

### 4. Paginação
- **Desktop**: Paginação tradicional
- **Mobile**: Load more infinito
- **Configurável**: 6, 12, 24, 48 itens por página

### 5. Interface Responsiva
- **Grid/Lista**: Toggle entre visualizações
- **Mobile-first**: Design adaptativo
- **Touch-friendly**: Interface otimizada para toque

### 6. Performance
- **Lazy loading**: Carregamento sob demanda
- **Cache**: Cache de busca de cidades
- **Debounce**: Controle de requisições
- **Virtualização**: Renderização eficiente

---

## 🚀 Scripts e Comandos

### Desenvolvimento
```bash
# Instalar dependências
npm install

# Desenvolvimento completo (servidor + frontend)
npm run start
npm run dev:full

# Apenas o servidor JSON
npm run server

# Apenas o frontend
npm run dev
```

### Produção
```bash
# Build para produção
npm run build

# Preview da build
npm run preview

# Gerar site estático
npm run generate
```

### Testes
```bash
# Testar API
npm run test:api
```

---

## 📱 Responsividade

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Adaptações por Dispositivo

#### Mobile
- Layout em lista única
- Load more infinito
- Filtros em drawer
- Touch-friendly

#### Tablet
- Grid 2 colunas
- Paginação híbrida
- Filtros laterais

#### Desktop
- Grid 3 colunas
- Paginação completa
- Filtros sempre visíveis

---

## 🔧 Configuração

### Variáveis de Ambiente
```env
# Porta do servidor JSON
PORT=3001

# URL da API
API_BASE_URL=http://localhost:3001/api

# Configurações do Nuxt
NUXT_PUBLIC_API_BASE=http://localhost:3001/api
```

### Configurações do Servidor
```javascript
// data/config.js
export default {
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost'
  },
  api: {
    basePath: '/api',
    version: '1.0.0'
  },
  pagination: {
    defaultLimit: 6,
    maxLimit: 100
  }
}
```

---

## 🧪 Testes

### Teste da API
```bash
# Executar testes da API
node scripts/test-api.js
```

### Endpoints Testados
- Health check
- Busca de hotéis
- Filtros
- Paginação
- Estatísticas

---

## 📈 Métricas e Performance

### Indicadores de Performance
- **Tempo de carregamento inicial**: < 2s
- **Tempo de resposta da API**: < 500ms
- **Tamanho do bundle**: < 500KB
- **Lighthouse Score**: > 90

### Otimizações Implementadas
- **Code splitting**: Carregamento sob demanda
- **Image optimization**: Lazy loading de imagens
- **Caching**: Cache de requisições
- **Debouncing**: Controle de input

---

## 🔒 Segurança

### Medidas Implementadas
- **CORS**: Configuração adequada
- **Input validation**: Validação de entrada
- **Error handling**: Tratamento de erros
- **Rate limiting**: Controle de requisições

### Boas Práticas
- **HTTPS**: Em produção
- **Sanitização**: Limpeza de dados
- **Logging**: Registro de atividades
- **Monitoring**: Monitoramento de erros

---

## 🚀 Deploy

### Build para Produção
```bash
# Gerar build otimizado
npm run build

# Verificar build
npm run preview
```

### Configuração de Produção
```javascript
// nuxt.config.ts
export default defineNuxtConfig({
  // Configurações de produção
  nitro: {
    preset: 'node-server'
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE
    }
  }
})
```

---

## 📝 Manutenção

### Estrutura de Logs
```javascript
// Logging estruturado
console.log(`[${timestamp}] ${method} ${url}${query}`)
```

### Monitoramento
- **Health checks**: Verificação de status
- **Error tracking**: Rastreamento de erros
- **Performance monitoring**: Monitoramento de performance

---

## 🤝 Contribuição

### Padrões de Código
- **ESLint**: Linting automático
- **Prettier**: Formatação de código
- **TypeScript**: Tipagem estática
- **Conventional Commits**: Padrão de commits

### Workflow
1. Fork do projeto
2. Criação de branch feature
3. Desenvolvimento com testes
4. Pull request com descrição
5. Code review
6. Merge após aprovação

---

## 📚 Recursos Adicionais

### Documentação
- `docs/city-search.md` - Documentação da busca de cidades
- `docs/pagination-config.md` - Configuração de paginação
- `docs/search-button-implementation.md` - Implementação do botão de busca
- `docs/unified-search.md` - Sistema de busca unificada

### Ferramentas
- **Nuxt DevTools**: Ferramentas de desenvolvimento
- **Vue DevTools**: Debugging de componentes
- **Pinia DevTools**: Debugging de estado

---

## 🎯 Próximos Passos

### Melhorias Futuras
- [ ] Testes unitários com Vitest
- [ ] Testes E2E com Playwright
- [ ] PWA (Progressive Web App)
- [ ] Internacionalização (i18n)
- [ ] Tema escuro
- [ ] Favoritos e histórico
- [ ] Comparação de hotéis
- [ ] Sistema de avaliações

### Otimizações
- [ ] Service Worker para cache
- [ ] Lazy loading de componentes
- [ ] Otimização de imagens
- [ ] Bundle splitting avançado

---

## 📞 Suporte

### Contato
- **Issues**: GitHub Issues
- **Documentação**: README.md
- **Exemplos**: `/docs` directory

### Recursos
- **API Documentation**: Endpoints detalhados
- **Component Library**: Documentação de componentes
- **Style Guide**: Guia de estilos
- **Architecture Guide**: Guia de arquitetura

---

*Documentação gerada em: Janeiro 2024*
*Versão do projeto: 1.0.0*

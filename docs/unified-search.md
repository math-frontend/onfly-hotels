# Busca Unificada de Hotéis, Destinos e Cidades

## Visão Geral

A funcionalidade de busca unificada permite aos usuários buscar por:
- **Hotéis**: Busca por nome de hotel
- **Destinos/Lugares**: Busca por cidade ou estado
- **Cidades**: Busca por cidades turísticas

## Componentes Principais

### 1. HotelHeader.vue
O componente principal que contém:
- Input de busca com placeholder "Buscar hotéis, destinos, cidades..."
- Sugestões em tempo real
- Buscas recentes
- Filtros rápidos

### 2. useHotelSearch.ts
Composable que gerencia:
- Estado da busca
- Sugestões dinâmicas
- Buscas recentes (localStorage)
- Integração com API de cidades

### 3. hotels.ts (Store)
Store que implementa:
- Busca unificada (`unifiedSearch`)
- Filtros por lugar
- Busca por hotéis
- Cache de dados

## Funcionalidades

### Sugestões Inteligentes
- **Hotéis**: Mostra nome, estrelas e preço
- **Lugares**: Mostra cidade, estado e número de hotéis
- **Cidades**: Mostra cidade, estado e indicação de destino turístico

### Tipos de Ação
- **Buscar**: Para hotéis e cidades (busca geral)
- **Filtrar**: Para lugares (filtra por localização específica)

### Ícones Visuais
- 🏨 **Hotel**: Azul (#0094ff)
- 📍 **Lugar**: Verde (#10b981)
- 🏙️ **Cidade**: Laranja (#f59e0b)

## Fluxo de Busca

1. **Digitação**: Usuário digita no input
2. **Sugestões**: Sistema gera sugestões em tempo real
3. **Seleção**: Usuário seleciona uma sugestão ou pressiona Enter
4. **Execução**: Sistema executa a busca apropriada
5. **Resultados**: Hotéis são filtrados/exibidos

## API Integration

### Endpoints Utilizados
- `/hotels/search?q={query}` - Busca de hotéis
- `/cities?name_like={query}` - Busca de cidades
- `/places` - Lista de lugares disponíveis

### Debounce
- Busca de sugestões: 300ms
- Busca de cidades: 300ms

## Exemplos de Uso

### Busca por Hotel
```
Input: "Hilton"
Resultado: Filtra hotéis com "Hilton" no nome
```

### Busca por Destino
```
Input: "São Paulo"
Resultado: Filtra hotéis em São Paulo
```

### Busca por Cidade
```
Input: "Rio de Janeiro"
Resultado: Busca hotéis em Rio de Janeiro
```

## Configurações

### Buscas Recentes
- Máximo: 5 buscas
- Persistência: localStorage
- Limpeza: Botão "Limpar"

### Sugestões
- Máximo: 10 sugestões
- Ordenação: Relevância (startsWith > contains)
- Prioridade: Hotel > Lugar > Cidade

## Responsividade

O componente é totalmente responsivo:
- Desktop: Layout horizontal
- Mobile: Layout vertical
- Sugestões: Scroll vertical quando necessário

## Acessibilidade

- Navegação por teclado (setas, Enter, Escape)
- Labels semânticos
- Contraste adequado
- Estados de foco visíveis


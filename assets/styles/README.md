# 🎨 Guia de Estilos - Padrão BEM

## 📁 Estrutura de Arquivos

```
assets/styles/
├── variables.scss          # Variáveis globais (cores, espaçamentos, etc.)
├── main.scss              # Arquivo principal que importa tudo
├── components/            # Estilos dos componentes Vue
│   ├── _index.scss        # Importa todos os componentes
│   ├── _empty-state.scss
│   ├── _loading-state.scss
│   ├── _data-table.scss
│   ├── _filter-dropdown.scss
│   ├── _hotel-card.scss
│   ├── _hotel-filters.scss
│   ├── _city-search-input.scss
│   ├── _hotel-drawer.scss
│   └── _hotel-header.scss
└── pages/                 # Estilos específicos de páginas
    ├── _index.scss        # Importa todas as páginas
    └── _hotels-page.scss
```

## 🎯 Padrão BEM (Block Element Modifier)

### 📋 Regras Básicas

#### **Block (Bloco)**
- Componente principal: `.hotel-card`
- Nome em kebab-case
- Representa um componente independente

#### **Element (Elemento)**
- Partes do bloco: `.hotel-card__image`
- Usa `__` para separar do bloco
- Sempre depende do bloco pai

#### **Modifier (Modificador)**
- Variações do bloco/elemento: `.hotel-card--list`
- Usa `--` para separar
- Altera aparência ou comportamento

### 📝 Exemplos Práticos

```scss
// ✅ CORRETO - Padrão BEM
.hotel-card {
  &__image {
    // Elemento
  }

  &__button {
    // Elemento
    &--primary {
      // Modificador do elemento
    }
  }

  &--list {
    // Modificador do bloco
  }
}

// ❌ INCORRETO - Não segue BEM
.hotel-card {
  .image {
    // Elemento sem __
  }

  &.list {
    // Modificador sem --
  }
}
```

### 🔧 Classes Utilitárias

```scss
// Classes globais para reutilização
.btn {
  &--primary { }
  &--secondary { }
}

.text {
  &--center { text-align: center; }
  &--left { text-align: left; }
}
```

## 🚀 Benefícios da Estrutura

### ✅ **Vantagens:**
1. **Organização**: Cada componente tem seu arquivo
2. **Manutenibilidade**: Fácil encontrar e editar
3. **Reutilização**: Componentes independentes
4. **Performance**: Melhor cache
5. **Escalabilidade**: Cresce sem bagunça
6. **BEM**: CSS mais previsível e organizado

### 📊 **Quantidade de Arquivos:**
- **É comum e recomendado** ter muitos arquivos pequenos
- **Projetos grandes** podem ter 50+ arquivos de estilo
- **Cada componente** = 1 arquivo de estilo
- **Separação clara** entre componentes e páginas

## 🎨 Convenções de Nomenclatura

### 📝 **Componentes:**
```scss
.hotel-card          // Bloco principal
.hotel-card__image   // Elemento
.hotel-card--list    // Modificador
```

### 📄 **Páginas:**
```scss
.hotels-page         // Página principal
.hotels-page__header // Elemento da página
```

### 🎯 **Estados:**
```scss
.hotel-card--loading // Estado de carregamento
.hotel-card--error   // Estado de erro
```

## 🔄 Fluxo de Desenvolvimento

1. **Criar componente** → `components/ComponentName.vue`
2. **Criar estilo** → `assets/styles/components/_component-name.scss`
3. **Importar** → `assets/styles/components/_index.scss`
4. **Usar BEM** → Seguir padrão Block__Element--Modifier

## 📚 Recursos Adicionais

- [BEM Methodology](http://getbem.com/)
- [SCSS Best Practices](https://sass-guidelin.es/)
- [CSS Architecture](https://css-tricks.com/css-architecture/)

export default {
  // Configurações do servidor
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost'
  },

  // Configurações da API
  api: {
    basePath: '/api',
    version: '1.0.0',
    name: 'Onfly Hotels API'
  },

  // Configurações de CORS
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    headers: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
  },

  // Configurações de paginação
  pagination: {
    defaultLimit: 6, // Alterado para 6 hotéis por página
    maxLimit: 100,
    availableLimits: [6, 12, 24, 48] // Opções mais adequadas para 6 hotéis
  },

  // Configurações de filtros
  filters: {
    price: {
      min: 0,
      max: 1000000
    },
    stars: ['1', '2', '3', '4', '5'],
    amenities: [
      'WI_FI', 'PARKING', 'POOL', 'RESTAURANT', 'FITNESS_CENTER',
      'ROOM_SERVICE', 'STEAM_ROOM', 'PET_FRIENDLY', 'BAR', 'SPA'
    ]
  },

  // Configurações de ordenação
  sorting: {
    allowedFields: ['totalPrice', 'dailyPrice', 'stars', 'name', 'district'],
    defaultField: 'totalPrice',
    defaultOrder: 'asc'
  },

  // Configurações de cache
  cache: {
    enabled: false,
    ttl: 300 // 5 minutos
  },

  // Configurações de logging
  logging: {
    enabled: true,
    level: 'info',
    format: 'timestamp method url query'
  }
}

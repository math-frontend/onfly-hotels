import jsonServer from 'json-server'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import config from './config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const server = jsonServer.create()
const router = jsonServer.router(join(__dirname, 'database.json'))
const middlewares = jsonServer.defaults()

// Configurações do servidor
const PORT = config.server.port
const API_BASE = config.api.basePath

// ===== UTILITY FUNCTIONS =====

// Função para normalizar texto (remover acentos e converter para minúsculas)
const normalizeText = (text) => {
  return text
    .normalize('NFD') // Decompor caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos (acentos)
    .toLowerCase() // Converter para minúsculas
}

const applyTextFilter = (hotels, query, places) => {
  if (!query) return hotels
  const searchQuery = normalizeText(query)

  return hotels.filter(hotel => {
    const hotelName = normalizeText(hotel.name)
    const description = normalizeText(hotel.description)
    const district = normalizeText(hotel.district)

    // Buscar por nome, descrição ou distrito do hotel
    if (hotelName.includes(searchQuery) ||
        description.includes(searchQuery) ||
        district.includes(searchQuery)) {
      return true
    }

    // Buscar por lugar/cidade
    const place = places.find(p => p.id === hotel.placeId)
    if (place) {
      const placeName = normalizeText(place.name)
      const placeState = normalizeText(place.state)

      if (placeName.includes(searchQuery) || placeState.includes(searchQuery)) {
        return true
      }
    }

    return false
  })
}

const applyPriceFilter = (hotels, minPrice, maxPrice) => {
  let filtered = hotels

  if (minPrice && !isNaN(minPrice)) {
    filtered = filtered.filter(hotel => hotel.totalPrice >= parseInt(minPrice))
  }

  if (maxPrice && !isNaN(maxPrice)) {
    filtered = filtered.filter(hotel => hotel.totalPrice <= parseInt(maxPrice))
  }

  return filtered
}

const applyStarsFilter = (hotels, stars) => {
  if (!stars) return hotels
  const starArray = stars.split(',').filter(s => s.trim())
  if (starArray.length === 0) return hotels

  return hotels.filter(hotel => starArray.includes(hotel.stars))
}

const applyAmenitiesFilter = (hotels, amenities) => {
  if (!amenities) return hotels
  const amenityArray = amenities.split(',').filter(a => a.trim())
  if (amenityArray.length === 0) return hotels

  return hotels.filter(hotel =>
    amenityArray.every(amenity => hotel.amenities.includes(amenity))
  )
}

const applyBooleanFilter = (hotels, field, value) => {
  if (value === undefined || value === null) return hotels
  const boolValue = value === 'true'
  return hotels.filter(hotel => hotel[field] === boolValue)
}

const applyPlaceFilter = (hotels, placeId) => {
  if (!placeId || isNaN(placeId)) return hotels
  return hotels.filter(hotel => hotel.placeId === parseInt(placeId))
}

const applySorting = (hotels, sortBy, sortOrder) => {
  if (!sortBy) return hotels

  const order = sortOrder === 'desc' ? -1 : 1

  return hotels.sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]

    if (aValue === undefined || bValue === undefined) return 0

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return (aValue - bValue) * order
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * order
    }

    if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      return (aValue === bValue ? 0 : aValue ? 1 : -1) * order
    }

    return 0
  })
}

const calculateStats = (hotels) => {
  if (hotels.length === 0) {
    return {
      total: 0,
      priceRange: { min: 0, max: 0 },
      avgPrice: 0,
      starsDistribution: {},
      amenitiesCount: {}
    }
  }

  const prices = hotels.map(h => h.totalPrice)
  const stats = {
    total: hotels.length,
    priceRange: {
      min: Math.min(...prices),
      max: Math.max(...prices)
    },
    avgPrice: Math.round(prices.reduce((sum, price) => sum + price, 0) / hotels.length),
    starsDistribution: hotels.reduce((acc, hotel) => {
      acc[hotel.stars] = (acc[hotel.stars] || 0) + 1
      return acc
    }, {}),
    amenitiesCount: hotels.reduce((acc, hotel) => {
      hotel.amenities.forEach(amenity => {
        acc[amenity] = (acc[amenity] || 0) + 1
      })
      return acc
    }, {})
  }

  return stats
}

const calculateFilteredStats = (hotels) => {
  if (hotels.length === 0) {
    return {
      total: 0,
      priceRange: { min: 0, max: 0 },
      avgPrice: 0
    }
  }

  const prices = hotels.map(h => h.totalPrice)
  return {
    total: hotels.length,
    priceRange: {
      min: Math.min(...prices),
      max: Math.max(...prices)
    },
    avgPrice: Math.round(prices.reduce((sum, price) => sum + price, 0) / hotels.length)
  }
}

// ===== MIDDLEWARES =====
server.use(middlewares)
server.use(jsonServer.bodyParser)

// CORS middleware
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')

  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

// Logging middleware
server.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  const method = req.method
  const url = req.url
  const query = Object.keys(req.query).length > 0 ? `?${new URLSearchParams(req.query)}` : ''

  console.log(`[${timestamp}] ${method} ${url}${query}`)
  next()
})

// Error handling middleware
server.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).jsonp({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  })
})

// ===== ROUTES =====

// Health check
server.get('/health', (req, res) => {
  res.jsonp({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  })
})

// API info
server.get(`${API_BASE}/info`, (req, res) => {
  res.jsonp({
    name: 'Onfly Hotels API',
    version: '1.0.0',
    description: 'API para busca e filtros de hotéis',
    endpoints: {
      hotels: `${API_BASE}/hotels`,
      search: `${API_BASE}/hotels/search`,
      stats: `${API_BASE}/hotels/stats`,
      filtered: `${API_BASE}/hotels/filtered`,
      places: `${API_BASE}/places`,
      amenities: `${API_BASE}/amenities`
    },
    timestamp: new Date().toISOString()
  })
})

// Busca com filtros
server.get(`${API_BASE}/hotels/search`, (req, res) => {
  try {
    const { q, minPrice, maxPrice, stars, amenities, hasBreakFast, hasRefundableRoom, placeId } = req.query
    let hotels = router.db.get('hotels').value()
    const places = router.db.get('places').value()

    // Aplicar filtros
    hotels = applyTextFilter(hotels, q, places)
    hotels = applyPriceFilter(hotels, minPrice, maxPrice)
    hotels = applyStarsFilter(hotels, stars)
    hotels = applyAmenitiesFilter(hotels, amenities)
    hotels = applyBooleanFilter(hotels, 'hasBreakFast', hasBreakFast)
    hotels = applyBooleanFilter(hotels, 'hasRefundableRoom', hasRefundableRoom)
    hotels = applyPlaceFilter(hotels, placeId)

    res.jsonp({
      success: true,
      data: hotels,
      count: hotels.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).jsonp({
      success: false,
      error: 'Erro na busca',
      message: error.message
    })
  }
})

// Estatísticas gerais
server.get(`${API_BASE}/hotels/stats`, (req, res) => {
  try {
    const hotels = router.db.get('hotels').value()
    const stats = calculateStats(hotels)

    res.jsonp({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Stats error:', error)
    res.status(500).jsonp({
      success: false,
      error: 'Erro ao calcular estatísticas',
      message: error.message
    })
  }
})

// Hotéis filtrados com estatísticas
server.get(`${API_BASE}/hotels/filtered`, (req, res) => {
  try {
    const {
      q, minPrice, maxPrice, stars, amenities,
      hasBreakFast, hasRefundableRoom, placeId,
      sortBy, sortOrder, limit, offset
    } = req.query

    let hotels = router.db.get('hotels').value()
    const places = router.db.get('places').value()

    // Aplicar filtros
    hotels = applyTextFilter(hotels, q, places)
    hotels = applyPriceFilter(hotels, minPrice, maxPrice)
    hotels = applyStarsFilter(hotels, stars)
    hotels = applyAmenitiesFilter(hotels, amenities)
    hotels = applyBooleanFilter(hotels, 'hasBreakFast', hasBreakFast)
    hotels = applyBooleanFilter(hotels, 'hasRefundableRoom', hasRefundableRoom)
    hotels = applyPlaceFilter(hotels, placeId)

    // Aplicar ordenação
    hotels = applySorting(hotels, sortBy, sortOrder)

    // Paginação
    const totalCount = hotels.length
    const offsetValue = parseInt(offset) || 0
    const limitValue = parseInt(limit) || 6 // Alterado para 6 como padrão

    if (limitValue > 0) {
      hotels = hotels.slice(offsetValue, offsetValue + limitValue)
    }

    // Calcular estatísticas dos resultados filtrados
    const filteredStats = calculateFilteredStats(hotels)

    res.jsonp({
      success: true,
      data: {
        hotels,
        stats: filteredStats,
        pagination: {
          total: totalCount,
          offset: offsetValue,
          limit: limitValue,
          hasMore: offsetValue + limitValue < totalCount
        }
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Filtered hotels error:', error)
    res.status(500).jsonp({
      success: false,
      error: 'Erro ao filtrar hotéis',
      message: error.message
    })
  }
})

// Rota para buscar hotéis por ID
server.get(`${API_BASE}/hotels/:id`, (req, res) => {
  try {
    const { id } = req.params
    const hotel = router.db.get('hotels').find({ id: parseInt(id) }).value()

    if (!hotel) {
      return res.status(404).jsonp({
        success: false,
        error: 'Hotel não encontrado',
        message: `Hotel com ID ${id} não foi encontrado`
      })
    }

    res.jsonp({
      success: true,
      data: hotel,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Hotel by ID error:', error)
    res.status(500).jsonp({
      success: false,
      error: 'Erro ao buscar hotel',
      message: error.message
    })
  }
})

// Rota para buscar hotéis por lugar
server.get(`${API_BASE}/places/:id/hotels`, (req, res) => {
  try {
    const { id } = req.params
    const hotels = router.db.get('hotels').filter({ placeId: parseInt(id) }).value()

    res.jsonp({
      success: true,
      data: hotels,
      count: hotels.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Hotels by place error:', error)
    res.status(500).jsonp({
      success: false,
      error: 'Erro ao buscar hotéis por lugar',
      message: error.message
    })
  }
})

// Busca de lugares/cidades
server.get(`${API_BASE}/cities`, (req, res) => {
  try {
    const { name_like } = req.query

    // Retornar array vazio se a query tiver menos de 3 caracteres
    if (!name_like || name_like.trim().length < 3) {
      return res.jsonp({
        success: true,
        data: [],
        count: 0,
        timestamp: new Date().toISOString()
      })
    }

    let places = router.db.get('places').value()

    const searchQuery = normalizeText(name_like)
    places = places.filter(place =>
      normalizeText(place.name).includes(searchQuery) ||
      normalizeText(place.state).includes(searchQuery)
    )

    // Converter places para formato de cities para manter compatibilidade
    const cities = places.map(place => ({
      name: place.name,
      state: {
        name: place.state,
        shortname: place.state
      },
      placeId: place.id
    }))

    res.jsonp({
      success: true,
      data: cities,
      count: cities.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Cities search error:', error)
    res.status(500).jsonp({
      success: false,
      error: 'Erro na busca de cidades',
      message: error.message
    })
  }
})

// Usar o router padrão para outras rotas
server.use(API_BASE, router)

// ===== SERVER STARTUP =====
server.listen(PORT, () => {
  console.log('🚀 JSON Server está rodando!')
  console.log(`📍 URL: http://localhost:${PORT}`)
  console.log(`🔗 API Base: ${API_BASE}`)
  console.log('')
  console.log('📊 Endpoints disponíveis:')
  console.log(`   GET /health - Health check`)
  console.log(`   GET ${API_BASE}/info - Informações da API`)
  console.log(`   GET ${API_BASE}/hotels - Lista todos os hotéis`)
  console.log(`   GET ${API_BASE}/hotels/:id - Busca hotel por ID`)
  console.log(`   GET ${API_BASE}/hotels/search - Busca com filtros`)
  console.log(`   GET ${API_BASE}/hotels/stats - Estatísticas gerais`)
  console.log(`   GET ${API_BASE}/hotels/filtered - Hotéis filtrados com stats`)
  console.log(`   GET ${API_BASE}/places - Lista todos os lugares`)
  console.log(`   GET ${API_BASE}/places/:id/hotels - Hotéis por lugar`)
  console.log(`   GET ${API_BASE}/cities - Lista todas as cidades`)
  console.log(`   GET ${API_BASE}/cities?search=query - Busca cidades`)
  console.log(`   GET ${API_BASE}/amenities - Lista todas as comodidades`)
  console.log('')
  console.log('🎯 Exemplos de uso:')
  console.log(`   ${API_BASE}/hotels/filtered?minPrice=100000&maxPrice=300000&stars=4,5`)
  console.log(`   ${API_BASE}/hotels/search?q=São Paulo&amenities=WI_FI,POOL`)
  console.log(`   ${API_BASE}/hotels/filtered?sortBy=totalPrice&sortOrder=asc&limit=10`)
  console.log('')
})

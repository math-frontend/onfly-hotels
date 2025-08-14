const fetch = require('node-fetch')

const API_BASE = 'http://localhost:3001/api'

// Função para testar endpoints
async function testEndpoint(endpoint, description) {
  try {
    console.log(`🧪 Testando: ${description}`)
    const response = await fetch(`${API_BASE}${endpoint}`)
    const data = await response.json()

    if (response.ok) {
      console.log(`✅ Sucesso: ${description}`)
      console.log(`   Status: ${response.status}`)
      console.log(`   Dados: ${JSON.stringify(data).substring(0, 100)}...`)
    } else {
      console.log(`❌ Erro: ${description}`)
      console.log(`   Status: ${response.status}`)
      console.log(`   Erro: ${data.error || 'Erro desconhecido'}`)
    }
  } catch (error) {
    console.log(`❌ Falha: ${description}`)
    console.log(`   Erro: ${error.message}`)
  }
  console.log('')
}

// Função para testar filtros
async function testFilters() {
  console.log('🔍 Testando filtros...\n')

  const filterTests = [
    {
      endpoint: '/hotels/filtered?minPrice=100000&maxPrice=300000',
      description: 'Filtro por preço (R$ 1.000 - R$ 3.000)'
    },
    {
      endpoint: '/hotels/filtered?stars=4,5',
      description: 'Filtro por estrelas (4-5 estrelas)'
    },
    {
      endpoint: '/hotels/filtered?amenities=WI_FI,POOL',
      description: 'Filtro por comodidades (Wi-Fi e Piscina)'
    },
    {
      endpoint: '/hotels/filtered?hasBreakFast=true',
      description: 'Filtro por café da manhã'
    },
    {
      endpoint: '/hotels/filtered?placeId=1',
      description: 'Filtro por local (São Paulo)'
    },
    {
      endpoint: '/hotels/search?q=São Paulo',
      description: 'Busca por texto (São Paulo)'
    },
    {
      endpoint: '/hotels/filtered?sortBy=totalPrice&sortOrder=desc&limit=5',
      description: 'Ordenação por preço (decrescente) + limite'
    }
  ]

  for (const test of filterTests) {
    await testEndpoint(test.endpoint, test.description)
  }
}

// Função principal de teste
async function runTests() {
  console.log('🚀 Iniciando testes da API Onfly Hotels\n')

  // Testes básicos
  await testEndpoint('/info', 'Informações da API')
  await testEndpoint('/hotels', 'Lista todos os hotéis')
  await testEndpoint('/places', 'Lista todos os lugares')
  await testEndpoint('/amenities', 'Lista todas as comodidades')
  await testEndpoint('/hotels/stats', 'Estatísticas gerais')

  // Testes de filtros
  await testFilters()

  // Testes específicos
  await testEndpoint('/hotels/1', 'Busca hotel por ID (1)')
  await testEndpoint('/places/1/hotels', 'Hotéis de São Paulo')

  console.log('✨ Testes concluídos!')
}

// Executar testes se o arquivo for chamado diretamente
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = { runTests, testEndpoint }

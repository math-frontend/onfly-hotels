export const usePriceMask = () => {
  // Função para formatar preço para exibição (com R$)
  const formatPrice = (value: number): string => {
    if (value === 0) return 'Grátis'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100)
  }

  // Função para formatar preço para input (sem R$)
  const formatPriceInput = (value: number): string => {
    if (value === 0) return ''
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100)
  }

  // Função para extrair valor numérico da string formatada
  const extractPriceValue = (formattedValue: string): number => {
    // Remove tudo exceto números e vírgula
    const cleanValue = formattedValue.replace(/[^\d,]/g, '')
    // Substitui vírgula por ponto para conversão
    const numericValue = cleanValue.replace(',', '.')
    // Converte para centavos
    const parsedValue = parseFloat(numericValue || '0')
    return Math.round(parsedValue * 100)
  }

  // Função para aplicar máscara em tempo real
  const applyPriceMask = (value: string): string => {
    // Remove tudo exceto números
    const numbers = value.replace(/\D/g, '')

    if (numbers.length === 0) return ''

    // Converte para centavos
    const cents = parseInt(numbers)

    // Formata como moeda brasileira
    const formatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(cents / 100)

    return formatted
  }

  // Handler para input com máscara
  const handlePriceInput = (
    event: Event,
    updateValue: (value: number) => void,
    defaultValue: number = 0
  ) => {
    const target = event.target as HTMLInputElement
    const value = target.value

    // Se o campo estiver vazio, usar valor padrão
    if (!value.trim()) {
      updateValue(defaultValue)
      target.value = ''
      return
    }

    // Aplicar máscara em tempo real
    const maskedValue = applyPriceMask(value)
    target.value = maskedValue

    // Extrair valor numérico
    const numericValue = extractPriceValue(maskedValue)
    updateValue(numericValue)
  }

  return {
    formatPrice,
    formatPriceInput,
    extractPriceValue,
    applyPriceMask,
    handlePriceInput
  }
}

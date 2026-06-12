export type CardBrand = "VISA" | "MASTERCARD"

export function getCardBrand(cardNumber: string): CardBrand | null {
  const digits = cardNumber.replace(/\D/g, "")

  if (/^4\d{12}(\d{3})?(\d{3})?$/.test(digits)) {
    return "VISA"
  }

  const firstTwo = Number(digits.slice(0, 2))
  const firstFour = Number(digits.slice(0, 4))

  if ((firstTwo >= 51 && firstTwo <= 55) || (firstFour >= 2221 && firstFour <= 2720)) {
    return "MASTERCARD"
  }

  return null
}

export function isValidLuhn(cardNumber: string) {
  const digits = cardNumber.replace(/\D/g, "")
  let sum = 0
  let shouldDouble = false

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i])

    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    shouldDouble = !shouldDouble
  }

  return digits.length >= 13 && sum % 10 === 0
}

export function isValidExpiry(expiry: string) {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/)
  if (!match) return false

  const month = Number(match[1])
  const year = Number(`20${match[2]}`)
  if (month < 1 || month > 12) return false

  const expiryDate = new Date(year, month, 0, 23, 59, 59)
  return expiryDate >= new Date()
}

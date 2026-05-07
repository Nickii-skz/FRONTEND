const SKU_PATTERN = /^[a-zA-Z0-9]{1,50}$/
const BARCODE_PATTERN = /^\d{8,14}$/

export class SKU {
  readonly value: string

  constructor(value: string) {
    if (!SKU_PATTERN.test(value)) {
      throw new Error(`Invalid SKU: "${value}". Must be alphanumeric, 1–50 chars.`)
    }
    this.value = value
  }

  isBarcode(): boolean {
    return BARCODE_PATTERN.test(this.value)
  }

  equals(other: SKU): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}

export function isBarcode(input: string): boolean {
  return BARCODE_PATTERN.test(input)
}

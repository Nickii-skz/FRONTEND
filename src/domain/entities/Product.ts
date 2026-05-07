import type { Money } from '../value-objects/Money'
import type { Tax } from '../value-objects/Tax'
import type { SKU } from '../value-objects/SKU'

export interface ProductVariant {
  id: string
  name: string
  attribute: string  // e.g. 'size', 'color'
  value: string      // e.g. 'L', 'Red'
  priceModifier?: Money
}

export interface Product {
  id: string
  sku: SKU
  name: string
  description?: string
  price: Money
  category: string
  imageUrl?: string
  stock: number
  variants?: ProductVariant[]
  taxRate?: Tax
}

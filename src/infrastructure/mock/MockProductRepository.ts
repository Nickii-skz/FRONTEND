import type { IProductRepository, ProductFilters } from '@application/ports/outbound/IProductRepository'
import type { Product } from '@domain/entities/Product'
import { Money } from '@domain/value-objects/Money'
import { SKU } from '@domain/value-objects/SKU'
import { Tax } from '@domain/value-objects/Tax'

const TAX_19 = new Tax({ name: 'IVA', rate: 19, inclusive: false })

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    sku: new SKU('MILK001'),
    name: 'Whole Milk 1L',
    price: new Money(250, 'USD'),
    category: 'Dairy',
    stock: 50,
    imageUrl: 'https://placehold.co/80x80?text=Milk',
    taxRate: TAX_19,
  },
  {
    id: '2',
    sku: new SKU('BREAD001'),
    name: 'White Bread 500g',
    price: new Money(180, 'USD'),
    category: 'Bakery',
    stock: 30,
    imageUrl: 'https://placehold.co/80x80?text=Bread',
  },
  {
    id: '3',
    sku: new SKU('APPLE001'),
    name: 'Red Apple (kg)',
    price: new Money(320, 'USD'),
    category: 'Fruits',
    stock: 100,
    imageUrl: 'https://placehold.co/80x80?text=Apple',
  },
  {
    id: '4',
    sku: new SKU('CHOC001'),
    name: 'Dark Chocolate 100g',
    price: new Money(450, 'USD'),
    category: 'Snacks',
    stock: 25,
    imageUrl: 'https://placehold.co/80x80?text=Choc',
    taxRate: TAX_19,
  },
  {
    id: '5',
    sku: new SKU('WATER001'),
    name: 'Mineral Water 500ml',
    price: new Money(120, 'USD'),
    category: 'Beverages',
    stock: 200,
    imageUrl: 'https://placehold.co/80x80?text=Water',
  },
  {
    id: '6',
    sku: new SKU('JUICE001'),
    name: 'Orange Juice 1L',
    price: new Money(380, 'USD'),
    category: 'Beverages',
    stock: 40,
    imageUrl: 'https://placehold.co/80x80?text=Juice',
    taxRate: TAX_19,
  },
  {
    id: '7',
    sku: new SKU('RICE001'),
    name: 'White Rice 1kg',
    price: new Money(290, 'USD'),
    category: 'Grains',
    stock: 80,
    imageUrl: 'https://placehold.co/80x80?text=Rice',
  },
  {
    id: '8',
    sku: new SKU('EGG001'),
    name: 'Eggs x12',
    price: new Money(420, 'USD'),
    category: 'Dairy',
    stock: 60,
    imageUrl: 'https://placehold.co/80x80?text=Eggs',
  },
  {
    id: '9',
    sku: new SKU('12345678'),
    name: 'Barcode Product',
    price: new Money(199, 'USD'),
    category: 'Snacks',
    stock: 15,
    imageUrl: 'https://placehold.co/80x80?text=Scan',
  },
  {
    id: '10',
    sku: new SKU('BUTTER001'),
    name: 'Unsalted Butter 250g',
    price: new Money(310, 'USD'),
    category: 'Dairy',
    stock: 35,
    imageUrl: 'https://placehold.co/80x80?text=Butter',
    taxRate: TAX_19,
  },
]

export class MockProductRepository implements IProductRepository {
  private products = [...MOCK_PRODUCTS]

  async findAll(filters?: ProductFilters): Promise<Product[]> {
    let result = this.products
    if (filters?.category) {
      result = result.filter((p) => p.category === filters.category)
    }
    if (filters?.inStock) {
      result = result.filter((p) => p.stock > 0)
    }
    return result
  }

  async findBySku(sku: { value: string }): Promise<Product | null> {
    return this.products.find((p) => p.sku.value === sku.value) ?? null
  }

  async findByCategory(category: string): Promise<Product[]> {
    return this.products.filter((p) => p.category === category)
  }

  async search(query: string): Promise<Product[]> {
    const q = query.toLowerCase()
    return this.products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.value.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    )
  }

  async getCategories(): Promise<string[]> {
    return [...new Set(this.products.map((p) => p.category))].sort()
  }
}

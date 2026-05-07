import type { Money } from '@domain/value-objects/Money'

interface Totals {
  subtotal: Money
  discounts: Money
  taxableBase: Money
  taxes: Money
  total: Money
}

interface FinancialBreakdownProps {
  totals: Totals
}

function Row({ label, value, highlight = false, negative = false }: {
  label: string
  value: string
  highlight?: boolean
  negative?: boolean
}) {
  return (
    <div className={['flex justify-between text-sm', highlight ? 'font-bold text-base' : ''].join(' ')}>
      <span className={negative ? 'text-green-700' : 'text-gray-600'}>{label}</span>
      <span className={[
        negative ? 'text-green-700' : '',
        highlight ? 'text-gray-900' : 'text-gray-800',
      ].join(' ')}>
        {negative && value !== '$0.00' ? '−' : ''}{value}
      </span>
    </div>
  )
}

export function FinancialBreakdown({ totals }: FinancialBreakdownProps) {
  return (
    <div
      className="flex flex-col gap-1 border-t pt-3"
      aria-label="Order financial breakdown"
      role="region"
    >
      <Row label="Subtotal" value={totals.subtotal.format()} />

      {totals.discounts.amount > 0 && (
        <Row label="Discount" value={totals.discounts.format()} negative />
      )}

      {totals.taxes.amount > 0 && (
        <>
          <Row label="Taxable base" value={totals.taxableBase.format()} />
          <Row label="Tax" value={totals.taxes.format()} />
        </>
      )}

      <div className="mt-2 flex justify-between border-t pt-2">
        <span className="text-base font-bold text-gray-900">TOTAL</span>
        <span
          className="text-xl font-bold text-blue-700"
          aria-live="polite"
          aria-atomic="true"
        >
          {totals.total.format()}
        </span>
      </div>
    </div>
  )
}

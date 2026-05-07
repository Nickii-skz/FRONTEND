interface CategoryTabsProps {
  categories: string[]
  selected: string | undefined
  onSelect: (category: string | undefined) => void
}

export function CategoryTabs({ categories, selected, onSelect }: CategoryTabsProps) {
  const all = ['All', ...categories]

  return (
    <nav
      aria-label="Product categories"
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin"
    >
      {all.map((cat) => {
        const isActive = cat === 'All' ? !selected : selected === cat
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat === 'All' ? undefined : cat)}
            aria-pressed={isActive}
            className={[
              'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              'min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              isActive
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50',
            ].join(' ')}
          >
            {cat}
          </button>
        )
      })}
    </nav>
  )
}

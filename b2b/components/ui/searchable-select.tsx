'use client'
import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'

interface Option {
  value: string
  label: string
  searchAlt?: string  // extra term to match against (e.g. English name when label is localised)
}

interface SearchableSelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  required?: boolean
  id?: string
}

const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Seçin...',
  searchPlaceholder = 'Ara...',
  disabled = false,
  id,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find(o => o.value === value)

  const filtered = search
    ? options.filter(o => {
        const q = normalize(search)
        return normalize(o.label).includes(q) || (o.searchAlt && normalize(o.searchAlt).includes(q))
      })
    : options

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen(prev => !prev)}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <span className={selectedOption ? 'text-foreground' : 'text-muted-foreground'}>
          {selectedOption?.label ?? placeholder}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 shrink-0">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[180px] rounded-md border bg-white shadow-lg">
          <div className="p-2 border-b">
            <Input
              ref={inputRef}
              placeholder={searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">Sonuç bulunamadı</div>
            ) : (
              filtered.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setOpen(false); setSearch('') }}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${opt.value === value ? 'bg-gray-100 font-medium' : ''}`}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

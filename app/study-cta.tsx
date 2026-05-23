'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Category } from '@/types'

const CHIPS: { cat: Category; label: string; icon: string; active: string }[] = [
  { cat: 'word',         label: 'Words',          icon: '📝', active: 'bg-accent/15 text-accent border-accent/40' },
  { cat: 'idiom',        label: 'Idioms',          icon: '💬', active: 'bg-purple-500/15 text-purple-300 border-purple-500/40' },
  { cat: 'phrasal_verb', label: 'Phrasal verbs',   icon: '🔗', active: 'bg-accent-2/15 text-accent-2 border-accent-2/40' },
  { cat: 'other',        label: 'Other',           icon: '💡', active: 'bg-zinc-400/15 text-zinc-300 border-zinc-400/40' },
]

export function StudyCTA({
  dueTodayByCategory,
  totalDue,
}: {
  dueTodayByCategory: Record<Category, number>
  totalDue: number
}) {
  const [selected, setSelected] = useState<Set<Category>>(new Set())

  if (totalDue === 0) return null

  const visibleChips = CHIPS.filter(({ cat }) => dueTodayByCategory[cat] > 0)

  function toggle(cat: Category) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  const dueForSelected =
    selected.size === 0
      ? totalDue
      : [...selected].reduce((sum, cat) => sum + dueTodayByCategory[cat], 0)

  const href =
    selected.size === 0
      ? '/study'
      : `/study?categories=${[...selected].join(',')}`

  return (
    <div className="animate-fade-up delay-6 space-y-3">
      {visibleChips.length > 1 && (
        <div>
          <p className="text-xs font-semibold text-t3 uppercase tracking-widest mb-2">Practice by category</p>
          <div className="flex flex-wrap gap-2">
            {visibleChips.map(({ cat, label, icon, active }) => {
              const isActive = selected.has(cat)
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggle(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors duration-150 ${
                    isActive
                      ? active
                      : 'bg-surface text-t2 border-border hover:border-border-hi hover:text-t1'
                  }`}
                >
                  <span>{icon}</span>
                  {label}
                  <span className={`ml-0.5 tabular-nums ${isActive ? 'opacity-80' : 'text-t3'}`}>
                    {dueTodayByCategory[cat]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <Link
        href={href}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-accent text-bg text-sm font-semibold hover:bg-accent/90 active:scale-[0.98] transition-colors duration-150 shadow-lg shadow-accent/20"
      >
        Start studying
        <span className="bg-bg/20 text-bg px-2 py-0.5 rounded-full text-xs font-bold">
          {dueForSelected} card{dueForSelected !== 1 ? 's' : ''} due
        </span>
      </Link>
    </div>
  )
}

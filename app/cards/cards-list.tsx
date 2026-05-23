'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { deleteCard, fetchCards } from './actions'
import type { Card, Category } from '@/types'

const PAGE_SIZE = 10

const CATEGORY_LABEL: Record<Category, string> = {
  word: 'Word',
  idiom: 'Idiom',
  phrasal_verb: 'Phrasal verb',
  other: 'Other',
}

const CATEGORY_STYLE: Record<Category, string> = {
  word: 'bg-accent/10 text-accent border-accent/20',
  idiom: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  phrasal_verb: 'bg-accent-2/10 text-accent-2 border-accent-2/20',
  other: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
}

export function CardsList({
  initialCards,
  initialHasMore,
  category,
  totalCount,
}: {
  initialCards: Card[]
  initialHasMore: boolean
  category: string | undefined
  totalCount: number
}) {
  const [cards, setCards] = useState(initialCards)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(totalCount)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(initialCards.length)
  const loadingRef = useRef(false)
  const hasMoreRef = useRef(initialHasMore)

  useEffect(() => {
    setCards(initialCards)
    setHasMore(initialHasMore)
    setCount(totalCount)
    offsetRef.current = initialCards.length
    hasMoreRef.current = initialHasMore
  }, [initialCards, initialHasMore, totalCount])

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return
    loadingRef.current = true
    setLoading(true)
    const { cards: newCards, hasMore: more } = await fetchCards(category, offsetRef.current, PAGE_SIZE)
    offsetRef.current += newCards.length
    hasMoreRef.current = more
    setCards(prev => [...prev, ...newCards])
    setHasMore(more)
    setLoading(false)
    loadingRef.current = false
  }, [category])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  async function handleDelete(id: string) {
    await deleteCard(id)
    setCards(prev => prev.filter(c => c.id !== id))
    setCount(prev => prev - 1)
  }

  if (!cards.length && !loading) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="text-4xl mb-4">🃏</div>
        <p className="text-sm font-semibold text-t2">No cards yet</p>
        <p className="text-xs text-t3 mt-1 mb-5">Start building your vocabulary</p>
        <Link
          href="/cards/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-bg text-sm font-semibold hover:bg-accent/90 transition-colors duration-150"
        >
          Create your first card
        </Link>
      </div>
    )
  }

  return (
    <>
      <p className="text-sm text-t3 -mt-4 mb-4">{count} total</p>
      <div className="space-y-2">
        {cards.map((card, i) => (
          <CardRow key={card.id} card={card} onDelete={handleDelete} index={i} />
        ))}
      </div>

      <div ref={sentinelRef} className="py-6 flex justify-center">
        {loading && (
          <div className="flex items-center gap-2 text-xs text-t3">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-t-accent border-border animate-spin" />
            Loading…
          </div>
        )}
        {!hasMore && cards.length > 0 && (
          <p className="text-xs text-t3">— {count} cards loaded —</p>
        )}
      </div>
    </>
  )
}

function CardRow({
  card,
  onDelete,
  index,
}: {
  card: Card
  onDelete: (id: string) => Promise<void>
  index: number
}) {
  const today = new Date().toISOString().split('T')[0]
  const isDue = card.next_review_date <= today
  const delayClass = ['delay-1', 'delay-2', 'delay-3', 'delay-4', 'delay-5', 'delay-6'][index % 6]

  return (
    <div
      className={`rounded-xl border border-border bg-surface px-4 py-3.5 flex items-start justify-between gap-4 hover:border-border-hi hover:bg-elevated transition-colors duration-150 animate-fade-up ${delayClass}`}
    >
      {card.image_url && (
        <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-border mt-0.5">
          <Image src={card.image_url} alt={card.word} fill className="object-cover" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-t1">{card.word}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CATEGORY_STYLE[card.category]}`}>
            {CATEGORY_LABEL[card.category]}
          </span>
          {isDue && (
            <span className="text-xs font-semibold text-accent-2 bg-accent-2/10 px-1.5 py-0.5 rounded-full border border-accent-2/20">
              due
            </span>
          )}
        </div>
        <p className="text-xs text-t2 mt-1.5 line-clamp-1 leading-relaxed">{card.definition}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Link
          href={`/cards/edit/${card.id}`}
          className="text-xs text-t3 hover:text-t1 transition-colors px-2 py-1 rounded-lg hover:bg-border"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={() => onDelete(card.id)}
          className="text-xs text-t3 hover:text-danger transition-colors px-2 py-1 rounded-lg hover:bg-danger/5"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

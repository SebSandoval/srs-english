import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/app/nav'
import { deleteCard } from './actions'
import type { Card, Category } from '@/types'

async function signOut() {
  'use server'
  const { createClient } = await import('@/lib/supabase/server')
  const { redirect } = await import('next/navigation')
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

const CATEGORY_LABEL: Record<Category, string> = {
  word: 'Word',
  idiom: 'Idiom',
  phrasal_verb: 'Phrasal verb',
}

const CATEGORY_STYLE: Record<Category, string> = {
  word: 'bg-accent/10 text-accent border-accent/20',
  idiom: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  phrasal_verb: 'bg-accent-2/10 text-accent-2 border-accent-2/20',
}

export default async function CardsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { category } = await searchParams
  let query = supabase
    .from('cards')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (category && ['word', 'idiom', 'phrasal_verb'].includes(category)) {
    query = query.eq('category', category)
  }

  const { data: cards } = await query

  async function handleDelete(id: string) {
    'use server'
    await deleteCard(id)
  }

  return (
    <>
      <Nav onSignOut={signOut} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-up">
          <div>
            <h1 className="text-2xl font-bold text-t1 tracking-tight">Cards</h1>
            <p className="text-sm text-t3 mt-0.5">{cards?.length ?? 0} total</p>
          </div>
          <Link
            href="/cards/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-bg text-sm font-semibold hover:bg-accent/90 active:scale-[0.98] transition-colors duration-150 shadow-md shadow-accent/20"
          >
            <span className="text-base leading-none">+</span> New card
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap animate-fade-up delay-1">
          {[
            [undefined, 'All'],
            ['word', 'Words'],
            ['idiom', 'Idioms'],
            ['phrasal_verb', 'Phrasal verbs'],
          ].map(([val, label]) => (
            <Link
              key={label}
              href={val ? `/cards?category=${val}` : '/cards'}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150 border ${
                category === val || (!category && !val)
                  ? 'bg-accent/10 text-accent border-accent/30'
                  : 'bg-surface text-t2 border-border hover:border-border-hi hover:text-t1'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Cards list */}
        {!cards?.length ? (
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
        ) : (
          <div className="space-y-2">
            {cards.map((card: Card, i: number) => (
              <CardRow
                key={card.id}
                card={card}
                onDelete={handleDelete}
                index={i}
              />
            ))}
          </div>
        )}
      </main>
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
  const deleteWithId = onDelete.bind(null, card.id)
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
          <span
            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CATEGORY_STYLE[card.category]}`}
          >
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
        <form action={deleteWithId}>
          <button
            type="submit"
            className="text-xs text-t3 hover:text-danger transition-colors px-2 py-1 rounded-lg hover:bg-danger/5"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  )
}

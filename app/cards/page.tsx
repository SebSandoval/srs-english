import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/app/nav'
import { CardsList } from './cards-list'

const PAGE_SIZE = 10

const VALID_CATEGORIES = ['word', 'idiom', 'phrasal_verb', 'other']

async function signOut() {
  'use server'
  const { createClient } = await import('@/lib/supabase/server')
  const { redirect } = await import('next/navigation')
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
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
  const validCategory = category && VALID_CATEGORIES.includes(category) ? category : undefined

  let dataQuery = supabase
    .from('cards')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(0, PAGE_SIZE - 1)

  let countQuery = supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (validCategory) {
    dataQuery = dataQuery.eq('category', validCategory)
    countQuery = countQuery.eq('category', validCategory)
  }

  const [{ data: cards }, { count }] = await Promise.all([dataQuery, countQuery])

  const totalCount = count ?? 0
  const initialCards = (cards ?? []) as import('@/types').Card[]
  const initialHasMore = initialCards.length === PAGE_SIZE && initialCards.length < totalCount

  return (
    <>
      <Nav onSignOut={signOut} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-up">
          <h1 className="text-2xl font-bold text-t1 tracking-tight">Cards</h1>
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
            ['other', 'Other'],
          ].map(([val, label]) => (
            <Link
              key={label}
              href={val ? `/cards?category=${val}` : '/cards'}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150 border ${
                validCategory === val || (!validCategory && !val)
                  ? 'bg-accent/10 text-accent border-accent/30'
                  : 'bg-surface text-t2 border-border hover:border-border-hi hover:text-t1'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Cards list with infinite scroll */}
        <CardsList
          initialCards={initialCards}
          initialHasMore={initialHasMore}
          category={validCategory}
          totalCount={totalCount}
        />
      </main>
    </>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/app/nav'
import { StudySession } from './study-session'
import type { Card } from '@/types'

const VALID_CATEGORIES = ['word', 'idiom', 'phrasal_verb', 'other']

async function signOut() {
  'use server'
  const { createClient } = await import('@/lib/supabase/server')
  const { redirect } = await import('next/navigation')
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function StudyPage({
  searchParams,
}: {
  searchParams: Promise<{ categories?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { categories } = await searchParams
  const categoryFilter = categories
    ?.split(',')
    .filter(c => VALID_CATEGORIES.includes(c)) ?? []

  const today = new Date().toISOString().split('T')[0]
  let query = supabase
    .from('cards')
    .select('*')
    .eq('user_id', user.id)
    .lte('next_review_date', today)

  if (categoryFilter.length > 0) {
    query = query.in('category', categoryFilter)
  }

  const { data: cards } = await query

  return (
    <>
      <Nav onSignOut={signOut} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8 animate-fade-up">
          <h1 className="text-2xl font-bold text-t1 tracking-tight">Study session</h1>
          {cards && cards.length > 0 && (
            <p className="text-sm text-t3 mt-1">{cards.length} card{cards.length !== 1 ? 's' : ''} to review</p>
          )}
        </div>
        <div className="animate-fade-up delay-1">
          <StudySession cards={(cards ?? []) as Card[]} />
        </div>
      </main>
    </>
  )
}

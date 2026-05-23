import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/app/nav'
import { StudySession } from './study-session'
import type { Card } from '@/types'

async function signOut() {
  'use server'
  const { createClient } = await import('@/lib/supabase/server')
  const { redirect } = await import('next/navigation')
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function StudyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]
  const { data: cards } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', user.id)
    .lte('next_review_date', today)

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

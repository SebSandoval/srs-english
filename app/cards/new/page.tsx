import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/app/nav'
import { CardForm } from '../card-form'
import { createCard } from '../actions'

async function signOut() {
  'use server'
  const { createClient } = await import('@/lib/supabase/server')
  const { redirect } = await import('next/navigation')
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function NewCardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <>
      <Nav onSignOut={signOut} />
      <main className="max-w-lg mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8 animate-fade-up">
          <Link
            href="/cards"
            className="inline-flex items-center gap-1 text-xs font-medium text-t3 hover:text-t1 transition-colors mb-4"
          >
            ← Back to cards
          </Link>
          <h1 className="text-2xl font-bold text-t1 tracking-tight">New card</h1>
          <p className="text-sm text-t3 mt-1">Add a new word, idiom, or phrasal verb</p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-6 animate-fade-up delay-1">
          <CardForm action={createCard} />
        </div>
      </main>
    </>
  )
}

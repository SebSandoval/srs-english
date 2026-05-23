import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Nav } from './nav'
import { StudyCTA } from './study-cta'
import type { Category } from '@/types'


async function getStats(userId: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const [{ data: cards }, { data: logs }] = await Promise.all([
    supabase.from('cards').select('category, next_review_date').eq('user_id', userId),
    supabase
      .from('review_logs')
      .select('reviewed_at')
      .eq('user_id', userId)
      .gte('reviewed_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
      .order('reviewed_at', { ascending: false }),
  ])

  const byCategory = { word: 0, idiom: 0, phrasal_verb: 0, other: 0 } as Record<Category, number>
  const dueTodayByCategory = { word: 0, idiom: 0, phrasal_verb: 0, other: 0 } as Record<Category, number>
  let dueToday = 0

  for (const card of cards ?? []) {
    const cat = card.category as Category
    byCategory[cat] = (byCategory[cat] ?? 0) + 1
    if (card.next_review_date <= today) {
      dueToday++
      dueTodayByCategory[cat] = (dueTodayByCategory[cat] ?? 0) + 1
    }
  }

  const reviewDays = new Set((logs ?? []).map((l) => l.reviewed_at.split('T')[0]))
  let streak = 0
  const d = new Date()
  while (reviewDays.has(d.toISOString().split('T')[0])) {
    streak++
    d.setDate(d.getDate() - 1)
  }

  return { total: cards?.length ?? 0, byCategory, dueToday, dueTodayByCategory, streak }
}

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const stats = await getStats(user.id)

  return (
    <>
      <Nav onSignOut={signOut} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6 sm:space-y-8">

        {/* Header */}
        <div className="animate-fade-up">
          <h1 className="text-2xl font-bold text-t1 tracking-tight">Dashboard</h1>
          <p className="text-sm text-t3 mt-1">{user.email}</p>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Total cards"
            value={stats.total}
            className="animate-fade-up delay-1"
          />
          <StatCard
            label="Due today"
            value={stats.dueToday}
            highlight={stats.dueToday > 0}
            className="animate-fade-up delay-2"
          />
          <StatCard
            label="Streak"
            value={`${stats.streak}d`}
            amber={stats.streak > 0}
            className="animate-fade-up delay-3"
          />
          <StatCard
            label="Words"
            value={stats.byCategory.word}
            className="animate-fade-up delay-4"
          />
        </div>

        {/* By category */}
        <div className="animate-fade-up delay-5">
          <h2 className="text-xs font-semibold text-t3 uppercase tracking-widest mb-3">By category</h2>
          <div className="rounded-xl border border-border bg-surface overflow-hidden divide-y divide-border">
            {(
              [
                ['word', 'Words', '📝'],
                ['idiom', 'Idioms', '💬'],
                ['phrasal_verb', 'Phrasal verbs', '🔗'],
                ['other', 'Other', '💡'],
              ] as const
            ).map(([cat, label, icon]) => (
              <CategoryRow
                key={cat}
                label={label}
                icon={icon}
                value={stats.byCategory[cat]}
                total={stats.total}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <StudyCTA dueTodayByCategory={stats.dueTodayByCategory} totalDue={stats.dueToday} />
      </main>
    </>
  )
}

function StatCard({
  label,
  value,
  highlight,
  amber,
  className = '',
}: {
  label: string
  value: string | number
  highlight?: boolean
  amber?: boolean
  className?: string
}) {
  const accent = highlight ? 'border-accent/30 bg-accent/5' : amber ? 'border-accent-2/30 bg-accent-2/5' : 'border-border bg-surface'
  const valueColor = highlight ? 'text-accent' : amber ? 'text-accent-2' : 'text-t1'

  return (
    <div className={`rounded-xl border p-4 transition-colors duration-150 hover:border-border-hi ${accent} ${className}`}>
      <p className="text-xs text-t3 mb-2 font-medium">{label}</p>
      <p className={`text-2xl font-bold tracking-tight ${valueColor}`}>{value}</p>
    </div>
  )
}

function CategoryRow({
  label,
  icon,
  value,
  total,
}: {
  label: string
  icon: string
  value: number
  total: number
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex items-center justify-between px-4 py-3 group hover:bg-elevated transition-colors">
      <div className="flex items-center gap-2.5">
        <span className="text-sm">{icon}</span>
        <span className="text-sm text-t2 font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-20 h-1.5 rounded-full bg-border overflow-hidden hidden sm:block">
          <div
            className="h-full rounded-full bg-accent/50 transition-[width] duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-t1 tabular-nums w-5 text-right">{value}</span>
      </div>
    </div>
  )
}

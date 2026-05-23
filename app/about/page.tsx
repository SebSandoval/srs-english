import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/app/nav'

async function signOut() {
  'use server'
  const { createClient } = await import('@/lib/supabase/server')
  const { redirect } = await import('next/navigation')
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function AboutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <>
      <Nav onSignOut={signOut} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-12">

        {/* ── Hero ── */}
        <section className="animate-fade-up">
          <p className="text-xs font-semibold text-t3 uppercase tracking-widest mb-3">About</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-t1 tracking-tight leading-tight mb-4">
            What is <span className="text-accent">SRS English</span>?
          </h1>
          <p className="text-base text-t2 leading-relaxed max-w-xl">
            A vocabulary builder powered by <strong className="text-t1 font-semibold">spaced repetition</strong> — the scientifically proven method for moving words from short-term memory into long-term retention. Study less. Remember more.
          </p>
        </section>

        {/* ── Spaced Repetition ── */}
        <section className="animate-fade-up delay-1 space-y-4">
          <SectionLabel>The Science</SectionLabel>
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
            <div className="flex items-start gap-4">
              <span className="text-3xl shrink-0 mt-0.5">🧠</span>
              <div>
                <h2 className="text-lg font-bold text-t1 mb-1">The Forgetting Curve</h2>
                <p className="text-sm text-t2 leading-relaxed">
                  In 1885, psychologist Hermann Ebbinghaus discovered that we forget roughly <strong className="text-t1 font-semibold">70% of new information within 24 hours</strong> — unless we actively review it. Each time we recall something successfully, the memory strengthens and takes longer to fade.
                </p>
              </div>
            </div>

            {/* Curve visual */}
            <div className="rounded-xl bg-elevated border border-border p-4">
              <div className="flex items-end gap-1 h-16 mb-2">
                {[100, 58, 44, 36, 33, 31, 30].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-sm transition-all"
                      style={{
                        height: `${h * 0.58}px`,
                        backgroundColor: i === 0 ? 'var(--color-accent)' : `color-mix(in srgb, var(--color-accent) ${h}%, var(--color-border))`,
                        opacity: 0.7 + i * 0.04,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-t3 font-medium">
                <span>Now</span><span>20min</span><span>1h</span><span>9h</span><span>1d</span><span>2d</span><span>6d</span>
              </div>
              <p className="text-[11px] text-t3 mt-2 text-center">Memory retention over time without review</p>
            </div>

            <div className="rounded-xl bg-accent/5 border border-accent/20 p-4">
              <p className="text-sm text-t2 leading-relaxed">
                <strong className="text-accent font-semibold">SRS solves this</strong> by scheduling each review <em>just before</em> you forget it. Review it at the right moment and the memory interval doubles, triples, then grows to weeks and months. You spend minimal time on words you know well, and more time on the ones you struggle with.
              </p>
            </div>
          </div>
        </section>

        {/* ── How the app works ── */}
        <section className="animate-fade-up delay-2 space-y-4">
          <SectionLabel>How it works</SectionLabel>
          <div className="space-y-3">
            {[
              {
                step: '01',
                icon: '✏️',
                title: 'Create a card',
                desc: 'Add a word, idiom, or phrasal verb with its definition, an example sentence, and an optional image. Images act as powerful visual anchors that make recall much easier.',
              },
              {
                step: '02',
                icon: '🃏',
                title: 'Study daily',
                desc: 'The app shows you cards that are due today. Each card starts face-down — you see the word (and image if added). Think of the meaning, then flip to reveal the definition and example.',
              },
              {
                step: '03',
                icon: '⭐',
                title: 'Rate yourself honestly',
                desc: 'After revealing, rate how well you remembered: Again, Hard, Good, or Easy. Your rating directly controls when you see the card again — be honest for best results.',
              },
              {
                step: '04',
                icon: '📅',
                title: 'The algorithm takes over',
                desc: 'Based on your rating, the SM-2 algorithm calculates your next review date automatically. Easy cards disappear for weeks; hard ones come back tomorrow. No manual scheduling needed.',
              },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="flex gap-4 rounded-xl border border-border bg-surface p-5 hover:border-border-hi transition-colors duration-150">
                <div className="shrink-0 flex flex-col items-center gap-2">
                  <span className="text-2xl">{icon}</span>
                  <span className="text-[10px] font-bold text-t3 tabular-nums">{step}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-t1 mb-1">{title}</h3>
                  <p className="text-sm text-t2 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SM-2 Algorithm ── */}
        <section className="animate-fade-up delay-3 space-y-4">
          <SectionLabel>The Algorithm</SectionLabel>
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">⚙️</span>
              <div>
                <h2 className="text-lg font-bold text-t1 mb-1">SM-2 Explained Simply</h2>
                <p className="text-sm text-t2 leading-relaxed">
                  Every card has an <strong className="text-t1 font-semibold">ease factor</strong> (starts at 2.5). This number controls how fast the review interval grows.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Day 1', desc: 'First review' },
                { label: 'Day 6', desc: 'Second review' },
                { label: 'Day 15+', desc: 'Grows by ease factor' },
              ].map(({ label, desc }) => (
                <div key={label} className="rounded-xl bg-elevated border border-border p-3">
                  <p className="text-sm font-bold text-accent">{label}</p>
                  <p className="text-[11px] text-t3 mt-0.5">{desc}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm text-t2">
              <p className="leading-relaxed">
                After the second review, each new interval = <code className="px-1.5 py-0.5 rounded bg-elevated border border-border text-xs font-mono text-t1">previous interval × ease factor</code>. So with the default ease of 2.5, a 6-day interval becomes 15 days, then 37, then 93 — and eventually months between reviews.
              </p>
              <p className="leading-relaxed">
                Rating <strong className="text-t1 font-semibold">Easy</strong> slightly raises the ease factor (cards get reviewed less often). Rating <strong className="text-t1 font-semibold">Again</strong> resets the interval to day 1 and lowers the ease factor (you'll see it much more). This is why your honest self-assessment matters.
              </p>
            </div>
          </div>
        </section>

        {/* ── Rating guide ── */}
        <section className="animate-fade-up delay-4 space-y-4">
          <SectionLabel>Rating guide</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: 'Again',
                key: '1',
                color: 'bg-danger/10 border-danger/30 text-danger',
                dot: 'bg-danger',
                desc: 'Completely forgot. The card resets to day 1 and the ease factor drops.',
              },
              {
                label: 'Hard',
                key: '2',
                color: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
                dot: 'bg-orange-400',
                desc: 'Remembered, but with real effort. Short next interval, ease decreases slightly.',
              },
              {
                label: 'Good',
                key: '3',
                color: 'bg-elevated border-border-hi text-t1',
                dot: 'bg-t2',
                desc: 'Recalled correctly with normal effort. Standard interval progression.',
              },
              {
                label: 'Easy',
                key: '4',
                color: 'bg-accent/10 border-accent/30 text-accent',
                dot: 'bg-accent',
                desc: 'Instantly recalled. Interval grows faster, ease factor increases.',
              },
            ].map(({ label, key, color, dot, desc }) => (
              <div key={label} className={`rounded-xl border p-4 ${color}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">{label}</span>
                  <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-bg/20 font-mono border border-current/20">[{key}]</kbd>
                </div>
                <div className={`w-1.5 h-1.5 rounded-full ${dot} mb-2`} />
                <p className="text-xs leading-relaxed opacity-80">{desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-t3 text-center">You can also use keyboard shortcuts 1–4 during study, and Space to flip the card.</p>
        </section>

        {/* ── Categories ── */}
        <section className="animate-fade-up delay-5 space-y-4">
          <SectionLabel>Card categories</SectionLabel>
          <div className="grid gap-3">
            {[
              {
                icon: '📝',
                label: 'Word',
                color: 'bg-accent/5 border-accent/20',
                badge: 'bg-accent/10 text-accent border-accent/20',
                desc: 'A standalone vocabulary word. Nouns, verbs, adjectives, adverbs — anything that functions as a single unit of meaning.',
                examples: ['Ephemeral', 'Resilient', 'Eloquent'],
              },
              {
                icon: '💬',
                label: 'Idiom',
                color: 'bg-purple-500/5 border-purple-500/20',
                badge: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
                desc: 'A phrase whose meaning can\'t be deduced from its individual words. Idioms are cultural and figurative — they must be learned as whole expressions.',
                examples: ['Break the ice', 'Bite the bullet', 'Hit the sack'],
              },
              {
                icon: '🔗',
                label: 'Phrasal verb',
                color: 'bg-accent-2/5 border-accent-2/20',
                badge: 'bg-accent-2/10 text-accent-2 border-accent-2/20',
                desc: 'A verb combined with a preposition or adverb that creates a new meaning. Essential for natural, fluent English.',
                examples: ['Give up', 'Look into', 'Run out of'],
              },
            ].map(({ icon, label, color, badge, desc, examples }) => (
              <div key={label} className={`rounded-xl border ${color} bg-surface p-5`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{icon}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badge}`}>{label}</span>
                </div>
                <p className="text-sm text-t2 leading-relaxed mb-3">{desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {examples.map((ex) => (
                    <span key={ex} className="text-xs px-2.5 py-1 rounded-full bg-elevated border border-border text-t2 italic">{ex}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tips ── */}
        <section className="animate-fade-up delay-6 space-y-4">
          <SectionLabel>Tips for best results</SectionLabel>
          <div className="rounded-2xl border border-border bg-surface divide-y divide-border overflow-hidden">
            {[
              {
                icon: '🔥',
                title: 'Study every day — even just 5 minutes',
                desc: 'Consistency beats intensity. A 5-minute daily session beats a 2-hour weekly marathon. Your streak tracks this — protect it.',
              },
              {
                icon: '🖼️',
                title: 'Add images to cards',
                desc: 'Our brains encode images ~60,000× faster than text. A picture of "ephemeral" — a soap bubble, a shooting star — makes the word unforgettable.',
              },
              {
                icon: '✂️',
                title: 'Keep definitions short and personal',
                desc: 'Don\'t copy dictionary definitions. Write in your own words: "resilient = bounces back from bad stuff". Short, concrete, and personal sticks better.',
              },
              {
                icon: '1️⃣',
                title: 'One concept per card',
                desc: 'Never put two things on one card. If a word has two meanings, make two cards. Simpler cards = faster reviews = better retention.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 px-5 py-4 hover:bg-elevated transition-colors duration-150">
                <span className="text-xl shrink-0 mt-0.5">{icon}</span>
                <div>
                  <p className="text-sm font-semibold text-t1 mb-0.5">{title}</p>
                  <p className="text-xs text-t2 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="animate-fade-up delay-6 pb-6 sm:pb-0">
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-6 text-center space-y-4">
            <p className="text-sm font-semibold text-t1">Ready to build your vocabulary?</p>
            <p className="text-xs text-t2">Create your first card and start your streak today.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/cards/new"
                className="px-5 py-2.5 rounded-xl bg-accent text-bg text-sm font-semibold hover:bg-accent/90 active:scale-[0.98] transition-colors duration-150 shadow-md shadow-accent/20"
              >
                Create first card
              </Link>
              <Link
                href="/study"
                className="px-5 py-2.5 rounded-xl bg-elevated border border-border text-t1 text-sm font-semibold hover:border-border-hi hover:bg-border transition-colors duration-150"
              >
                Go to study
              </Link>
            </div>
          </div>
        </section>

      </main>
    </>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-t3 uppercase tracking-widest">{children}</p>
  )
}

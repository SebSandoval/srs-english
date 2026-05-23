'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { calculateSM2, type Quality } from '@/lib/sm2'

export async function submitReview(cardId: string, quality: Quality) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: card } = await supabase
    .from('cards')
    .select('interval, repetitions, ease_factor')
    .eq('id', cardId)
    .eq('user_id', user.id)
    .single()

  if (!card) throw new Error('Card not found')

  const result = calculateSM2({
    repetitions: card.repetitions,
    interval: card.interval,
    easeFactor: card.ease_factor,
    quality,
  })

  const nextDate = result.nextReviewDate.toISOString().split('T')[0]

  await Promise.all([
    supabase
      .from('cards')
      .update({
        interval: result.interval,
        repetitions: result.repetitions,
        ease_factor: result.easeFactor,
        next_review_date: nextDate,
        last_reviewed_at: new Date().toISOString(),
      })
      .eq('id', cardId)
      .eq('user_id', user.id),
    supabase.from('review_logs').insert({
      card_id: cardId,
      user_id: user.id,
      quality,
    }),
  ])

  revalidatePath('/')
  revalidatePath('/study')
}

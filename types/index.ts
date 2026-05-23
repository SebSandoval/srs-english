export type Category = 'word' | 'idiom' | 'phrasal_verb' | 'other'

export interface Card {
  id: string
  user_id: string
  word: string
  definition: string
  example: string | null
  category: Category
  image_url: string | null
  audio_url: string | null
  notes: string | null
  interval: number
  repetitions: number
  ease_factor: number
  next_review_date: string
  last_reviewed_at: string | null
  created_at: string
}

export interface ReviewLog {
  id: string
  card_id: string
  user_id: string
  quality: number
  reviewed_at: string
}

export interface DashboardStats {
  totalCards: number
  byCategory: Record<Category, number>
  dueToday: number
  streak: number
  dueNextWeek: Array<{ date: string; count: number }>
}

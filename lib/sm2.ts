export type Quality = 0 | 2 | 4 | 5

export interface SM2Input {
  repetitions: number
  interval: number
  easeFactor: number
  quality: Quality
}

export interface SM2Output {
  repetitions: number
  interval: number
  easeFactor: number
  nextReviewDate: Date
}

export function calculateSM2(input: SM2Input): SM2Output {
  const { quality } = input
  let { repetitions, interval, easeFactor } = input

  if (quality >= 3) {
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
    repetitions += 1
  } else {
    repetitions = 0
    interval = 1
  }

  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + interval)

  return { repetitions, interval, easeFactor, nextReviewDate }
}

export const QUALITY_LABELS: Record<Quality, string> = {
  0: 'Again',
  2: 'Hard',
  4: 'Good',
  5: 'Easy',
}

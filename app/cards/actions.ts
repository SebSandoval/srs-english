'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/types'

async function uploadImage(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, file: File): Promise<string | null> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('card-images').upload(path, file, { upsert: true })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('card-images').getPublicUrl(path)
  return data.publicUrl
}

async function deleteImage(supabase: Awaited<ReturnType<typeof createClient>>, imageUrl: string) {
  const marker = '/object/public/card-images/'
  const idx = imageUrl.indexOf(marker)
  if (idx === -1) return
  const path = imageUrl.slice(idx + marker.length)
  await supabase.storage.from('card-images').remove([path])
}

export async function createCard(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const imageFile = formData.get('image') as File | null
  let imageUrl: string | null = null
  if (imageFile && imageFile.size > 0) {
    imageUrl = await uploadImage(supabase, user.id, imageFile)
  }

  const { error } = await supabase.from('cards').insert({
    user_id: user.id,
    word: formData.get('word') as string,
    definition: formData.get('definition') as string,
    example: (formData.get('example') as string) || null,
    category: (formData.get('category') as Category) ?? 'word',
    notes: (formData.get('notes') as string) || null,
    image_url: imageUrl,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/cards')
  redirect('/cards')
}

export async function updateCard(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const imageFile = formData.get('image') as File | null
  const removeImage = formData.get('remove_image') === 'true'
  const existingImageUrl = formData.get('existing_image_url') as string | null

  let imageUrl: string | null = existingImageUrl || null

  if (removeImage) {
    if (existingImageUrl) await deleteImage(supabase, existingImageUrl)
    imageUrl = null
  } else if (imageFile && imageFile.size > 0) {
    if (existingImageUrl) await deleteImage(supabase, existingImageUrl)
    imageUrl = await uploadImage(supabase, user.id, imageFile)
  }

  const { error } = await supabase
    .from('cards')
    .update({
      word: formData.get('word') as string,
      definition: formData.get('definition') as string,
      example: (formData.get('example') as string) || null,
      category: (formData.get('category') as Category) ?? 'word',
      notes: (formData.get('notes') as string) || null,
      image_url: imageUrl,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/cards')
  redirect('/cards')
}

export async function fetchCards(category: string | undefined, offset: number, limit: number): Promise<{ cards: import('@/types').Card[]; hasMore: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { cards: [], hasMore: false }

  let query = supabase
    .from('cards')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (category && ['word', 'idiom', 'phrasal_verb', 'other'].includes(category)) {
    query = query.eq('category', category)
  }

  const { data: cards } = await query
  return { cards: (cards ?? []) as import('@/types').Card[], hasMore: (cards?.length ?? 0) === limit }
}

export async function deleteCard(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Delete associated image if exists
  const { data: card } = await supabase
    .from('cards')
    .select('image_url')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (card?.image_url) await deleteImage(supabase, card.image_url)

  await supabase.from('cards').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/cards')
}

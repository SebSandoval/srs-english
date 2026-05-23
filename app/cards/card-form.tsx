'use client'

import { useTransition, useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import type { Card } from '@/types'

const CATEGORIES = [
  { value: 'word', label: 'Word' },
  { value: 'idiom', label: 'Idiom' },
  { value: 'phrasal_verb', label: 'Phrasal verb' },
  { value: 'other', label: 'Other' },
] as const

export function CardForm({
  action,
  card,
}: {
  action: (formData: FormData) => Promise<void>
  card?: Card
}) {
  const [pending, startTransition] = useTransition()

  function handleAction(formData: FormData) {
    startTransition(() => action(formData))
  }

  return (
    <form action={handleAction} className="space-y-5">
      <Field label="Word" name="word" defaultValue={card?.word} required />
      <Field
        label="Definition"
        name="definition"
        defaultValue={card?.definition}
        required
        multiline
      />
      <Field label="Example sentence" name="example" defaultValue={card?.example ?? ''} multiline />

      <div>
        <label className="block text-xs font-semibold text-t2 uppercase tracking-widest mb-2">Category</label>
        <select
          name="category"
          defaultValue={card?.category ?? 'word'}
          className="w-full px-3.5 py-2.5 rounded-xl bg-elevated border border-border text-sm text-t1 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-colors duration-150 appearance-none cursor-pointer"
        >
          {CATEGORIES.map(({ value, label }) => (
            <option key={value} value={value} className="bg-surface">
              {label}
            </option>
          ))}
        </select>
      </div>

      <ImageUpload existingImageUrl={card?.image_url ?? null} />

      <Field label="Notes" name="notes" defaultValue={card?.notes ?? ''} multiline />

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 px-4 rounded-xl bg-accent text-bg text-sm font-semibold hover:bg-accent/90 active:scale-[0.98] transition-colors duration-150 shadow-md shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {pending ? 'Saving…' : card ? 'Save changes' : 'Create card'}
      </button>
    </form>
  )
}

function ImageUpload({ existingImageUrl }: { existingImageUrl: string | null }) {
  const [preview, setPreview] = useState<string | null>(existingImageUrl)
  const [isDragging, setIsDragging] = useState(false)
  const [removed, setRemoved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    setRemoved(false)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
    // Inject into the hidden file input via DataTransfer
    const dt = new DataTransfer()
    dt.items.add(file)
    if (inputRef.current) inputRef.current.files = dt.files
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = () => setIsDragging(false)

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const removeImage = () => {
    setPreview(null)
    setRemoved(true)
    if (inputRef.current) {
      inputRef.current.value = ''
      const dt = new DataTransfer()
      inputRef.current.files = dt.files
    }
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-t2 uppercase tracking-widest mb-2">
        Image <span className="text-t3 normal-case font-normal tracking-normal">(optional)</span>
      </label>

      {/* Hidden inputs */}
      <input ref={inputRef} type="file" name="image" accept="image/*" className="hidden" onChange={onInputChange} />
      <input type="hidden" name="remove_image" value={removed ? 'true' : 'false'} />
      <input type="hidden" name="existing_image_url" value={existingImageUrl ?? ''} />

      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-border bg-elevated group">
          <div className="relative w-full h-48">
            <Image
              src={preview}
              alt="Card image preview"
              fill
              className="object-contain"
              unoptimized={preview.startsWith('data:')}
            />
          </div>
          <div className="absolute inset-0 bg-bg/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-semibold text-t1 hover:bg-elevated transition-colors"
            >
              Change
            </button>
            <button
              type="button"
              onClick={removeImage}
              className="px-3 py-1.5 rounded-lg bg-danger/10 border border-danger/20 text-xs font-semibold text-danger hover:bg-danger/20 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`w-full h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors duration-150 cursor-pointer ${
            isDragging
              ? 'border-accent bg-accent/5'
              : 'border-border hover:border-border-hi hover:bg-elevated'
          }`}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className={isDragging ? 'text-accent' : 'text-t3'} stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span className={`text-xs font-medium ${isDragging ? 'text-accent' : 'text-t3'}`}>
            {isDragging ? 'Drop to upload' : 'Drag & drop or click to upload'}
          </span>
          <span className="text-xs text-t3">PNG, JPG, WEBP, GIF</span>
        </button>
      )}
    </div>
  )
}

function Field({
  label,
  name,
  defaultValue,
  required,
  multiline,
}: {
  label: string
  name: string
  defaultValue?: string
  required?: boolean
  multiline?: boolean
}) {
  const cls =
    'w-full px-3.5 py-2.5 rounded-xl bg-elevated border border-border text-sm text-t1 placeholder-t3 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-colors duration-150'

  return (
    <div>
      <label className="block text-xs font-semibold text-t2 uppercase tracking-widest mb-2">
        {label}{required && <span className="text-accent ml-1">*</span>}
      </label>
      {multiline ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          required={required}
          rows={3}
          className={`${cls} resize-none`}
        />
      ) : (
        <input
          type="text"
          name={name}
          defaultValue={defaultValue}
          required={required}
          className={cls}
        />
      )}
    </div>
  )
}

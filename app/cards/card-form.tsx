"use client";

import { useTransition, useState, useRef, useCallback } from "react";
import Image from "next/image";
import type { Card, Category } from "@/types";

const CATEGORIES = [
  { value: "word", label: "Word" },
  { value: "idiom", label: "Idiom" },
  { value: "phrasal_verb", label: "Phrasal verb" },
  { value: "other", label: "Other" },
] as const;

export function CardForm({
  action,
  card,
}: {
  action: (formData: FormData) => Promise<void>;
  card?: Card;
}) {
  const [pending, startTransition] = useTransition();
  const [generating, setGenerating] = useState(false);

  const [word, setWord] = useState(card?.word ?? "");
  const [definition, setDefinition] = useState(card?.definition ?? "");
  const [example, setExample] = useState(card?.example ?? "");
  const [category, setCategory] = useState<Category>(card?.category ?? "word");

  function handleAction(formData: FormData) {
    startTransition(() => action(formData));
  }

  async function generate() {
    const trimmed = word.trim();
    if (!trimmed || generating) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: trimmed }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      if (data.definition) setDefinition(data.definition);
      if (data.example) setExample(data.example);
      if (data.category) setCategory(data.category);
    } catch {
      // silent — fields stay empty for manual fill
    } finally {
      setGenerating(false);
    }
  }

  return (
    <form action={handleAction} className="space-y-5">
      {/* Word + Generate button */}
      <div>
        <label className="block text-xs font-semibold text-t2 uppercase tracking-widest mb-2">
          Word <span className="text-accent ml-1">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            name="word"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            required
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-elevated border border-border text-sm text-t1 placeholder-t3 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-colors duration-150"
          />
          <button
            type="button"
            onClick={generate}
            disabled={!word.trim() || generating}
            title="Generate definition and example with AI"
            className="px-3.5 py-2.5 rounded-xl border border-border bg-elevated text-sm font-semibold text-t2 hover:text-t1 hover:border-border-hi hover:bg-border-hi transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
          >
            {generating ? <SpinnerIcon /> : <SparkleIcon />}
            <span className="hidden sm:inline">
              {generating ? "Generating…" : "Generate"}
            </span>
          </button>
        </div>
      </div>

      {/* Definition */}
      <div>
        <label className="block text-xs font-semibold text-t2 uppercase tracking-widest mb-2">
          Definition <span className="text-accent ml-1">*</span>
        </label>
        <textarea
          name="definition"
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
          required
          rows={3}
          className="w-full px-3.5 py-2.5 rounded-xl bg-elevated border border-border text-sm text-t1 placeholder-t3 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-colors duration-150 resize-none"
        />
      </div>

      {/* Example */}
      <div>
        <label className="block text-xs font-semibold text-t2 uppercase tracking-widest mb-2">
          Example sentence
        </label>
        <textarea
          name="example"
          value={example}
          onChange={(e) => setExample(e.target.value)}
          rows={3}
          className="w-full px-3.5 py-2.5 rounded-xl bg-elevated border border-border text-sm text-t1 placeholder-t3 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-colors duration-150 resize-none"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold text-t2 uppercase tracking-widest mb-2">
          Category
        </label>
        <select
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
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

      <Field
        label="Notes"
        name="notes"
        defaultValue={card?.notes ?? ""}
        multiline
      />

      <button
        type="submit"
        disabled={pending || generating}
        className="w-full py-2.5 px-4 rounded-xl bg-accent text-bg text-sm font-semibold hover:bg-accent/90 active:scale-[0.98] transition-colors duration-150 shadow-md shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {pending ? "Saving…" : card ? "Save changes" : "Create card"}
      </button>
    </form>
  );
}

function SparkleIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M5 17l.75 2.25L8 20l-2.25.75L5 23l-.75-2.25L2 20l2.25-.75L5 17z" />
      <path d="M19 3l.5 1.5L21 5l-1.5.5L19 7l-.5-1.5L17 5l1.5-.5L19 3z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="animate-spin"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function ImageUpload({
  existingImageUrl,
}: {
  existingImageUrl: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(existingImageUrl);
  const [isDragging, setIsDragging] = useState(false);
  const [removed, setRemoved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setRemoved(false);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    const dt = new DataTransfer();
    dt.items.add(file);
    if (inputRef.current) inputRef.current.files = dt.files;
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const removeImage = () => {
    setPreview(null);
    setRemoved(true);
    if (inputRef.current) {
      inputRef.current.value = "";
      const dt = new DataTransfer();
      inputRef.current.files = dt.files;
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-t2 uppercase tracking-widest mb-2">
        Image{" "}
        <span className="text-t3 normal-case font-normal tracking-normal">
          (optional)
        </span>
      </label>

      <input
        ref={inputRef}
        type="file"
        name="image"
        accept="image/*"
        className="hidden"
        onChange={onInputChange}
      />
      <input
        type="hidden"
        name="remove_image"
        value={removed ? "true" : "false"}
      />
      <input
        type="hidden"
        name="existing_image_url"
        value={existingImageUrl ?? ""}
      />

      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-border bg-elevated group">
          <div className="relative w-full h-48">
            <Image
              src={preview}
              alt="Card image preview"
              fill
              className="object-contain"
              unoptimized={preview.startsWith("data:")}
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
              ? "border-accent bg-accent/5"
              : "border-border hover:border-border-hi hover:bg-elevated"
          }`}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            className={isDragging ? "text-accent" : "text-t3"}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span
            className={`text-xs font-medium ${isDragging ? "text-accent" : "text-t3"}`}
          >
            {isDragging ? "Drop to upload" : "Drag & drop or click to upload"}
          </span>
          <span className="text-xs text-t3">PNG, JPG, WEBP, GIF</span>
        </button>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  multiline,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  multiline?: boolean;
}) {
  const cls =
    "w-full px-3.5 py-2.5 rounded-xl bg-elevated border border-border text-sm text-t1 placeholder-t3 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-colors duration-150";

  return (
    <div>
      <label className="block text-xs font-semibold text-t2 uppercase tracking-widest mb-2">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
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
  );
}

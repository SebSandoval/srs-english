"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { submitReview } from "./actions";
import type { Card, Category } from "@/types";
import type { Quality } from "@/lib/sm2";

const QUALITY_BUTTONS: {
  quality: Quality;
  label: string;
  key: string;
  style: string;
}[] = [
  {
    quality: 0,
    label: "Again",
    key: "1",
    style:
      "bg-danger/10 text-danger border-danger/30 hover:bg-danger/20 hover:border-danger/50",
  },
  {
    quality: 2,
    label: "Hard",
    key: "2",
    style:
      "bg-orange-500/10 text-orange-300 border-orange-500/30 hover:bg-orange-500/20 hover:border-orange-500/50",
  },
  {
    quality: 4,
    label: "Good",
    key: "3",
    style:
      "bg-elevated text-t1 border-border-hi hover:bg-border-hi hover:border-accent/30",
  },
  {
    quality: 5,
    label: "Easy",
    key: "4",
    style:
      "bg-accent/10 text-accent border-accent/30 hover:bg-accent/20 hover:border-accent/60",
  },
];

const CATEGORY_LABEL: Record<Category, string> = {
  word: "Word",
  idiom: "Idiom",
  phrasal_verb: "Phrasal verb",
  other: "Other",
};

export function StudySession({ cards }: { cards: Card[] }) {
  const [queue, setQueue] = useState(() => shuffle([...cards]));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const card = queue[index];
  const progress = queue.length > 0 ? (index / queue.length) * 100 : 0;

  const flip = useCallback(() => setFlipped((f) => !f), []);

  const rate = useCallback(
    async (quality: Quality) => {
      if (submitting || !card) return;
      setSubmitting(true);
      await submitReview(card.id, quality);
      const next = index + 1;
      if (next >= queue.length) {
        setDone(true);
      } else {
        setIndex(next);
        setFlipped(false);
        setReviewed((r) => r + 1);
      }
      setSubmitting(false);
    },
    [card, index, queue.length, submitting],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target !== document.body) return;
      if (e.key === " ") {
        e.preventDefault();
        flip();
      }
      if (flipped) {
        if (e.key === "1") rate(0);
        if (e.key === "2") rate(2);
        if (e.key === "3") rate(4);
        if (e.key === "4") rate(5);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flip, flipped, rate]);

  if (!cards.length) {
    return (
      <div className="text-center py-24 animate-fade-in">
        <div className="text-5xl mb-5">🌙</div>
        <p className="text-lg font-semibold text-t1 mb-2">All caught up!</p>
        <p className="text-sm text-t2">
          No cards due today. Come back tomorrow.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center py-24 animate-scale-in">
        <div className="text-5xl mb-5">🎉</div>
        <p className="text-2xl font-bold text-t1 mb-2">Session complete!</p>
        <p className="text-sm text-t2">
          Reviewed {queue.length} card{queue.length !== 1 ? "s" : ""} — great
          work.
        </p>
        <div className="mt-8 inline-flex gap-2 px-5 py-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm font-semibold">
          +{queue.length} reviews logged
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-8 text-xs text-t3 font-medium">
        <span className="tabular-nums">
          {index + 1} / {queue.length}
        </span>
        <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="tabular-nums">{queue.length - index} left</span>
      </div>

      {/* Flash card */}
      <div
        className="relative cursor-pointer select-none"
        style={{ perspective: "1200px" }}
        onClick={flip}
      >
        <div
          className="relative transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <div
            className="rounded-2xl border border-border bg-surface p-6 sm:p-8 min-h-[220px] sm:min-h-[260px] flex flex-col items-center justify-center hover:border-border-hi transition-colors"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="text-xs font-semibold text-t3 uppercase tracking-widest mb-5 px-3 py-1 rounded-full bg-elevated border border-border">
              {CATEGORY_LABEL[card.category]}
            </span>
            {card.image_url && (
              <div className="relative w-40 h-28 sm:w-52 sm:h-36 mb-5 rounded-xl overflow-hidden border border-border">
                <Image
                  src={card.image_url}
                  alt={card.word}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <p className="text-4xl font-bold text-t1 text-center tracking-tight">
              {card.word}
            </p>
            <p className="text-xs text-t3 mt-8 flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-elevated border border-border text-t3 font-mono text-xs">
                space
              </kbd>
              to reveal
            </p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl border border-accent/20 bg-surface p-6 sm:p-8 flex flex-col gap-4 sm:gap-5 overflow-auto"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div>
              <p className="text-xs font-semibold text-t3 uppercase tracking-widest mb-2">
                Definition
              </p>
              <p className="text-base text-t1 leading-relaxed whitespace-pre-wrap">
                {card.definition}
              </p>
            </div>
            {card.example && (
              <div>
                <p className="text-xs font-semibold text-t3 uppercase tracking-widest mb-2">
                  Example
                </p>
                <p className="text-sm text-t2 italic leading-relaxed whitespace-pre-wrap">
                  "{card.example}"
                </p>
              </div>
            )}
            {card.notes && (
              <div>
                <p className="text-xs font-semibold text-t3 uppercase tracking-widest mb-2">
                  Notes
                </p>
                <p className="text-sm text-t2 leading-relaxed whitespace-pre-wrap">
                  {card.notes}
                </p>
              </div>
            )}
            <TTSButton word={card.word} />
          </div>
        </div>
      </div>

      {/* Rating buttons */}
      {flipped && (
        <div className="mt-5 animate-fade-up">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {QUALITY_BUTTONS.map(({ quality, label, key, style }) => (
              <button
                key={quality}
                onClick={() => rate(quality)}
                disabled={submitting}
                className={`py-3 rounded-xl border text-sm font-semibold transition-colors duration-150 disabled:opacity-40 active:scale-95 flex flex-col items-center gap-0.5 ${style}`}
              >
                <span>{label}</span>
                <span className="text-[10px] opacity-50 font-normal hidden sm:inline">
                  [{key}]
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TTSButton({ word }: { word: string }) {
  function speak() {
    if (!("speechSynthesis" in window)) return;
    const utt = new SpeechSynthesisUtterance(word);
    utt.lang = "en-US";
    speechSynthesis.speak(utt);
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        speak();
      }}
      className="self-start flex items-center gap-1.5 text-xs text-t3 hover:text-t1 transition-colors duration-150 mt-auto px-2.5 py-1.5 rounded-lg hover:bg-elevated border border-transparent hover:border-border"
    >
      🔊 Pronounce
    </button>
  );
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

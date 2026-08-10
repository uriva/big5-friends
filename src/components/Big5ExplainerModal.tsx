"use client";

import { useState } from "react";
import {
  Sparkles,
  Users,
  Eye,
  HeartHandshake,
  X,
  ChevronRight,
  ChevronLeft,
  Brain,
} from "lucide-react";

interface Big5ExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Big5ExplainerModal({
  isOpen,
  onClose,
}: Big5ExplainerModalProps) {
  const [slide, setSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      icon: <Brain className="w-8 h-8 text-indigo-400" />,
      tag: "The Science of Personality",
      title: "What is the Big 5 (OCEAN)?",
      content: (
        <div className="space-y-3 text-left">
          <p className="text-xs text-slate-300 leading-relaxed">
            The <strong>Big 5</strong> (or OCEAN model) is the gold standard of scientific personality assessment used by psychologists worldwide:
          </p>

          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-400 font-extrabold text-[10px] flex items-center justify-center shrink-0">O</span>
              <span><strong>Openness:</strong> Curiosity, imagination & original ideas</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-blue-500/20 text-blue-400 font-extrabold text-[10px] flex items-center justify-center shrink-0">C</span>
              <span><strong>Conscientiousness:</strong> Discipline, order & reliability</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 font-extrabold text-[10px] flex items-center justify-center shrink-0">E</span>
              <span><strong>Extraversion:</strong> Energy, sociability & enthusiasm</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] flex items-center justify-center shrink-0">A</span>
              <span><strong>Agreeableness:</strong> Compassion, warmth & cooperation</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-rose-500/20 text-rose-400 font-extrabold text-[10px] flex items-center justify-center shrink-0">N</span>
              <span><strong>Neuroticism:</strong> Emotional sensitivity & stress reactivity</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: <Eye className="w-8 h-8 text-purple-400" />,
      tag: "Social Perception",
      title: "See How Others Perceive You",
      content: (
        <div className="space-y-4 text-left">
          <p className="text-xs text-slate-300 leading-relaxed">
            Self-surveys only tell half the story. <strong>Big 5 Friends</strong> lets your friend group anonymously compare pairs head-to-head.
          </p>

          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 space-y-2 text-xs text-purple-200">
            <div className="font-bold flex items-center gap-2 text-purple-300">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Uncover Social Blindspots</span>
            </div>
            <p className="text-[11px] text-purple-300/80">
              Do your friends see you as the most Agreeable or Extraverted in the group? Discover where your perception aligns with the group consensus!
            </p>
          </div>
        </div>
      ),
    },
    {
      icon: <HeartHandshake className="w-8 h-8 text-emerald-400" />,
      tag: "Friend Connections",
      title: "Discover Who You are Similar To",
      content: (
        <div className="space-y-4 text-left">
          <p className="text-xs text-slate-300 leading-relaxed">
            By comparing personality rankings across traits, the app reveals which friends share your core personality profile!
          </p>

          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 space-y-2 text-xs text-emerald-200">
            <div className="font-bold flex items-center gap-2 text-emerald-300">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Personality Match & Alignment</span>
            </div>
            <p className="text-[11px] text-emerald-300/80">
              Find out who complements your energy, who shares your level of Openness, and who you connect with most naturally.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const currentSlide = slides[slide];

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative flex flex-col justify-between min-h-[460px]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 shadow-md">
              {currentSlide.icon}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                {currentSlide.tag}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                {currentSlide.title}
              </h2>
            </div>
          </div>

          {currentSlide.content}
        </div>

        {/* Footer controls & slide indicators */}
        <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSlide(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  slide === idx ? "w-6 bg-indigo-500" : "w-2 bg-slate-800"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {slide > 0 && (
              <button
                onClick={() => setSlide(slide - 1)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {slide < slides.length - 1 ? (
              <button
                onClick={() => setSlide(slide + 1)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-indigo-500/20"
              >
                Got It, Let's Start!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

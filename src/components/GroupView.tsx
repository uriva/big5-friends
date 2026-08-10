"use client";

import { useState, useMemo, useEffect } from "react";
import { db, id } from "@/lib/db";
import confetti from "canvas-confetti";
import { PersonalityForceGraph } from "@/components/PersonalityForceGraph";
import {
  Users,
  Globe,
  Share2,
  Check,
  Swords,
  CheckCircle2,
  Info,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Undo2,
  Sparkles,
  HelpCircle,
  BarChart3,
  Sliders,
} from "lucide-react";

interface Profile {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface GroupMember {
  id: string;
  profile?: Profile | null;
}

interface Group {
  id: string;
  name: string;
  inviteCode: string;
  members: GroupMember[];
  comparisons?: any[];
}

interface GroupViewProps {
  group: Group;
  currentProfile: Profile;
  allComparisons: any[];
}

const TRAITS = [
  {
    key: "agreeableness",
    label: "Agreeableness",
    question: "Who is more agreeable, compassionate & warm?",
    letter: "A",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    desc: "Compassion, trust, cooperation & warmth towards others",
  },
  {
    key: "openness",
    label: "Openness",
    question: "Who is more curious, inventive & open to new ideas?",
    letter: "O",
    color: "from-indigo-500 to-purple-500",
    bgColor: "bg-indigo-500/10",
    textColor: "text-indigo-400",
    borderColor: "border-indigo-500/30",
    desc: "Curiosity, imagination, appreciation for art & adventure",
  },
  {
    key: "conscientiousness",
    label: "Conscientiousness",
    question: "Who is more organized, disciplined & goal-oriented?",
    letter: "C",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/30",
    desc: "Self-discipline, organization, orderliness & dependability",
  },
  {
    key: "extraversion",
    label: "Extraversion",
    question: "Who is more outgoing, energetic & social?",
    letter: "E",
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-400",
    borderColor: "border-amber-500/30",
    desc: "Sociability, assertiveness, high energy & cheerfulness",
  },
  {
    key: "neuroticism",
    label: "Neuroticism / Sensitivity",
    question: "Who is more emotionally sensitive or reactive?",
    letter: "N",
    color: "from-rose-500 to-pink-500",
    bgColor: "bg-rose-500/10",
    textColor: "text-rose-400",
    borderColor: "border-rose-500/30",
    desc: "Sensitivity to emotions, stress, and mood fluctuations",
  },
] as const;

export function GroupView({
  group,
  currentProfile,
  allComparisons,
}: GroupViewProps) {
  const [viewScope, setViewScope] = useState<"group" | "global">("group");
  const [activeTab, setActiveTab] = useState<"compare" | "profiles">("compare");

  const [copied, setCopied] = useState(false);
  const [voting, setVoting] = useState(false);
  const [localVotedKeys, setLocalVotedKeys] = useState<Set<string>>(new Set());
  const [questionIndex, setQuestionIndex] = useState(0);
  const [votedHistory, setVotedHistory] = useState<
    { pairKey: string; traitKey: string; winnerId: string; loserId: string }[]
  >([]);

  // Extract group profiles
  const members: Profile[] = useMemo(() => {
    return (
      group.members
        ?.map((m) => m.profile)
        .filter((p): p is Profile => Boolean(p)) || []
    );
  }, [group]);

  // Generate all (trait, pair) question combinations across all Big 5 traits
  const allQuestions = useMemo(() => {
    const questions: {
      key: string;
      trait: (typeof TRAITS)[number];
      pair: [Profile, Profile];
    }[] = [];

    TRAITS.forEach((t) => {
      for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
          const pairKey = [members[i].id, members[j].id].sort().join("-");
          questions.push({
            key: `${t.key}:${pairKey}`,
            trait: t,
            pair: [members[i], members[j]],
          });
        }
      }
    });

    return questions;
  }, [members]);

  // Helper to check if a question (trait + pair) has been voted on
  const hasVotedOnQuestion = (q: {
    key: string;
    trait: (typeof TRAITS)[number];
    pair: [Profile, Profile];
  }) => {
    if (localVotedKeys.has(q.key)) return true;

    const [p1, p2] = q.pair;
    const groupComps = group.comparisons || [];
    const dbHit = groupComps.some(
      (c: any) =>
        c.rater?.id === currentProfile.id &&
        c.trait === q.trait.key &&
        ((c.winner?.id === p1.id && c.loser?.id === p2.id) ||
          (c.winner?.id === p2.id && c.loser?.id === p1.id))
    );

    return Boolean(dbHit);
  };

  // Filter unvoted questions
  const unvotedQuestions = useMemo(() => {
    return allQuestions.filter((q) => !hasVotedOnQuestion(q));
  }, [allQuestions, group.comparisons, localVotedKeys, currentProfile.id]);

  // Current active question (sequential traversal without looping!)
  const currentQuestion =
    questionIndex < unvotedQuestions.length
      ? unvotedQuestions[questionIndex]
      : null;

  const completedCount = allQuestions.length - unvotedQuestions.length;
  const progressPercent =
    allQuestions.length > 0
      ? Math.min(
          100,
          Math.round(((completedCount + questionIndex) / allQuestions.length) * 100)
        )
      : 0;

  // Trigger celebratory confetti ONLY when completing all questions
  useEffect(() => {
    if (!currentQuestion && allQuestions.length > 0 && completedCount > 0) {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [currentQuestion, allQuestions.length, completedCount]);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/?join=${group.inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Submit pairwise vote (optimistically advances on its own)
  const handleVote = async (winner: Profile, loser: Profile, traitKey: string) => {
    const pairKey = `${traitKey}:${[winner.id, loser.id].sort().join("-")}`;

    // Optimistically mark as voted locally and save in history for undo
    setLocalVotedKeys((prev) => new Set(prev).add(pairKey));
    setVotedHistory((prev) => [
      ...prev,
      { pairKey, traitKey, winnerId: winner.id, loserId: loser.id },
    ]);

    try {
      const groupComps = group.comparisons || [];
      const existing = groupComps.find(
        (c: any) =>
          c.rater?.id === currentProfile.id &&
          c.trait === traitKey &&
          ((c.winner?.id === winner.id && c.loser?.id === loser.id) ||
            (c.winner?.id === loser.id && c.loser?.id === winner.id))
      );

      const transactPromise = existing
        ? db.transact([
            db.tx.comparisons[existing.id]
              .update({
                updatedAt: Date.now(),
              })
              .unlink({ winner: existing.winner?.id, loser: existing.loser?.id })
              .link({ winner: winner.id })
              .link({ loser: loser.id }),
          ])
        : db.transact([
            db.tx.comparisons[id()]
              .create({
                trait: traitKey,
                updatedAt: Date.now(),
              })
              .link({ group: group.id })
              .link({ rater: currentProfile.id })
              .link({ winner: winner.id })
              .link({ loser: loser.id }),
          ]);

      // 4-second timeout race to prevent transaction timeout modal/error
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 4000)
      );

      await Promise.race([transactPromise, timeoutPromise]);
    } catch (err) {
      console.warn("Transaction processed or timed out silently:", err);
    }
  };

  const handleSkip = () => {
    setQuestionIndex((prev) => prev + 1);
  };

  const handleUnskip = () => {
    setQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  const handleUndo = async () => {
    if (votedHistory.length === 0) return;

    const lastVote = votedHistory[votedHistory.length - 1];

    // Pop from history
    setVotedHistory((prev) => prev.slice(0, -1));

    // Remove from local voted keys so question reappears in unvotedQuestions
    setLocalVotedKeys((prev) => {
      const next = new Set(prev);
      next.delete(lastVote.pairKey);
      return next;
    });

    // Delete comparison from InstantDB
    const groupComps = group.comparisons || [];
    const dbHit = groupComps.find(
      (c: any) =>
        c.rater?.id === currentProfile.id &&
        c.trait === lastVote.traitKey &&
        ((c.winner?.id === lastVote.winnerId && c.loser?.id === lastVote.loserId) ||
          (c.winner?.id === lastVote.loserId && c.loser?.id === lastVote.winnerId))
    );

    if (dbHit) {
      try {
        await db.transact([db.tx.comparisons[dbHit.id].delete()]);
      } catch (err) {
        console.warn("Failed to delete undone comparison:", err);
      }
    }
  };

  const handleResetVotes = async () => {
    setLocalVotedKeys(new Set());
    setVotedHistory([]);
    setQuestionIndex(0);

    const userComps = (group.comparisons || []).filter(
      (c: any) => c.rater?.id === currentProfile.id
    );

    if (userComps.length > 0) {
      try {
        const txs = userComps.map((c: any) => db.tx.comparisons[c.id].delete());
        await db.transact(txs);
      } catch (err) {
        console.warn("Failed to delete user comparisons:", err);
      }
    }
  };

  // Filter comparisons based on Scope (Group vs Global)
  const scopedComparisons = useMemo(() => {
    return allComparisons.filter((c) => {
      if (viewScope === "group") {
        return c.group?.id === group.id;
      }
      return true; // global across all groups
    });
  }, [allComparisons, viewScope, group.id]);

  // Compute rankings for a given trait (deduplicating per rater + pair)
  const computeTraitRankings = (traitKey: string) => {
    const traitComps = scopedComparisons.filter((c) => c.trait === traitKey);

    const latestMap = new Map<string, any>();
    traitComps.forEach((c) => {
      const raterId = c.rater?.id;
      const wId = c.winner?.id;
      const lId = c.loser?.id;
      if (!raterId || !wId || !lId) return;

      const pairKey = [wId, lId].sort().join("-");
      const key = `${raterId}:${pairKey}`;

      const existing = latestMap.get(key);
      if (!existing || (c.updatedAt || 0) > (existing.updatedAt || 0)) {
        latestMap.set(key, c);
      }
    });

    const deduplicatedComps = Array.from(latestMap.values());

    const statsMap: Record<
      string,
      { wins: number; losses: number; total: number }
    > = {};

    members.forEach((m) => {
      statsMap[m.id] = { wins: 0, losses: 0, total: 0 };
    });

    deduplicatedComps.forEach((c) => {
      const wId = c.winner?.id;
      const lId = c.loser?.id;

      if (wId && statsMap[wId]) {
        statsMap[wId].wins += 1;
        statsMap[wId].total += 1;
      }
      if (lId && statsMap[lId]) {
        statsMap[lId].losses += 1;
        statsMap[lId].total += 1;
      }
    });

    return members
      .map((m) => {
        const s = statsMap[m.id] || { wins: 0, losses: 0, total: 0 };
        const winRate =
          s.total > 0 ? Math.round((s.wins / s.total) * 100) : 0;
        return {
          profile: m,
          wins: s.wins,
          losses: s.losses,
          total: s.total,
          winRate,
        };
      })
      .sort((a, b) => b.winRate - a.winRate || b.wins - a.wins);
  };

  // Build trait stats map for Personality Force Graph & RPG Character Cards
  const traitStatsMap = useMemo(() => {
    const map: Record<
      string,
      Record<string, { wins: number; total: number; winRate: number }>
    > = {};

    TRAITS.forEach((t) => {
      const rankings = computeTraitRankings(t.key);
      map[t.key] = {};
      rankings.forEach((r) => {
        map[t.key][r.profile.id] = {
          wins: r.wins,
          total: r.total,
          winRate: r.winRate,
        };
      });
    });

    return map;
  }, [scopedComparisons, members]);

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner">
                <Users className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {group.name}
                </h1>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <span>{members.length} members</span>
                  <span>•</span>
                  <span>Big 5 Friend Comparisons</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Copy Invite Link Button */}
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 bg-slate-950/90 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl px-4 py-2.5 transition cursor-pointer"
              title="Copy Invite Link"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400">
                    Invite Link Copied!
                  </span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs text-slate-300 font-medium">
                    Invite Link: <strong className="font-mono text-indigo-400">{group.inviteCode}</strong>
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2 sm:gap-8 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("compare")}
          className={`flex items-center gap-2 pb-3 px-1 text-sm font-semibold transition border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "compare"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Swords className="w-4 h-4" />
          <span>Compare Friends</span>
        </button>

        <button
          onClick={() => setActiveTab("profiles")}
          className={`flex items-center gap-2 pb-3 px-1 text-sm font-semibold transition border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "profiles"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Trait Profiles & Character Stats</span>
        </button>
      </div>

      {/* TAB 1: Pairwise Comparison Arena */}
      {activeTab === "compare" && (
        <div className="max-w-3xl mx-auto space-y-8">
          {allQuestions.length < 1 ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
              <Info className="w-8 h-8 text-indigo-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">
                Need at least 2 members to compare
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Share your invite link with friends so they can join and compare traits!
              </p>
            </div>
          ) : currentQuestion ? (
            /* Active Question & Pairwise Arena */
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative space-y-8">
              {/* Progress Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-indigo-400">
                    Question {completedCount + questionIndex + 1} of {allQuestions.length}
                  </span>
                  <span className="text-slate-400">{progressPercent}% Reviewed</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Question Header */}
              <div className="text-center space-y-3 pt-2">
                <span
                  className={`inline-block px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${currentQuestion.trait.bgColor} ${currentQuestion.trait.textColor} border ${currentQuestion.trait.borderColor}`}
                >
                  {currentQuestion.trait.label}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  {currentQuestion.trait.question}
                </h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Click on the person who exhibits more of this trait
                </p>
              </div>

              {/* Pairwise Cards (Clicking advances on its own!) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
                {currentQuestion.pair.map((person, idx) => {
                  const opponent = currentQuestion.pair[1 - idx];
                  const isSelf = person.id === currentProfile.id;

                  return (
                    <button
                      key={person.id}
                      onClick={() =>
                        handleVote(person, opponent, currentQuestion.trait.key)
                      }
                      disabled={voting}
                      className="group p-8 rounded-3xl bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/60 shadow-xl transition-all duration-300 text-center flex flex-col items-center justify-center gap-4 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden text-white font-extrabold text-2xl flex items-center justify-center shadow-lg group-hover:border-indigo-500 transition shrink-0">
                        {person.avatarUrl ? (
                          <img
                            src={person.avatarUrl}
                            alt={person.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          person.name.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-center gap-2">
                          <h3 className="text-xl font-extrabold text-white group-hover:text-indigo-300 transition">
                            {person.name}
                          </h3>
                          {isSelf && (
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-semibold">
                              You
                            </span>
                          )}
                        </div>
                        <span className="inline-block mt-2 text-xs font-medium text-slate-400 group-hover:text-indigo-400 transition">
                          Click to select →
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Unsure / Skip, Unskip & Undo Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                {votedHistory.length > 0 && (
                  <button
                    onClick={handleUndo}
                    className="flex items-center gap-2 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 hover:text-amber-200 px-4 py-2.5 rounded-2xl text-xs font-semibold transition cursor-pointer shadow-sm"
                  >
                    <Undo2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Undo Last Answer</span>
                  </button>
                )}

                {questionIndex > 0 && (
                  <button
                    onClick={handleUnskip}
                    className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 px-4 py-2.5 rounded-2xl text-xs font-semibold transition cursor-pointer shadow-sm"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                    <span>Previous / Unskip</span>
                  </button>
                )}

                <button
                  onClick={handleSkip}
                  className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 px-5 py-2.5 rounded-2xl text-xs font-semibold transition cursor-pointer shadow-sm"
                >
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>Unsure / Skip Question</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>

              {/* Footer controls */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-800/80 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  {votedHistory.length > 0 && (
                    <button
                      onClick={handleUndo}
                      className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition cursor-pointer px-3 py-1.5 rounded-xl hover:bg-slate-800"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      <span>Undo</span>
                    </button>
                  )}
                  {questionIndex > 0 && (
                    <button
                      onClick={handleUnskip}
                      className="flex items-center gap-1.5 hover:text-white transition cursor-pointer px-3 py-1.5 rounded-xl hover:bg-slate-800"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Previous Question</span>
                    </button>
                  )}
                  <span>
                    Trait: <strong>{currentQuestion.trait.label}</strong>
                  </span>
                </div>

                <button
                  onClick={handleSkip}
                  className="flex items-center gap-1.5 hover:text-white transition cursor-pointer px-3 py-1.5 rounded-xl hover:bg-slate-800"
                >
                  <span>Next / Skip</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Completion Screen when all questions reached */
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {unvotedQuestions.length === 0
                    ? "All Questions Completed! 🎉"
                    : "Questions Reviewed! 🎉"}
                </h3>
                <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
                  {unvotedQuestions.length === 0
                    ? `You've answered all ${allQuestions.length} comparisons across the Big 5 personality traits for this group.`
                    : `You answered ${completedCount} of ${allQuestions.length} comparisons and skipped ${unvotedQuestions.length} question${unvotedQuestions.length > 1 ? "s" : ""}.`}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {votedHistory.length > 0 && (
                  <button
                    onClick={handleUndo}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800/80 text-amber-300 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-amber-950/20"
                  >
                    <Undo2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Undo Last Answer</span>
                  </button>
                )}

                {unvotedQuestions.length > 0 && (
                  <button
                    onClick={() => setQuestionIndex(0)}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Review / Unskip Skipped Questions ({unvotedQuestions.length})</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab("profiles")}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <BarChart3 className="w-4 h-4 text-indigo-300" />
                  <span>View Trait Profiles & Character Stats</span>
                </button>

                <button
                  onClick={handleResetVotes}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart / Revote</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Trait Profiles & RPG Character Stat Sheets */}
      {activeTab === "profiles" && (
        <div className="space-y-8">
          {/* Header Bar with Animated Scope Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <span className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                Showing <strong>{viewScope === "group" ? "Group Ratings" : "Global Ratings"}</strong> for each friend's character sheet.
              </span>
            </span>

            {/* Scope Switcher: Group vs Global */}
            <div className="bg-slate-950/90 p-1 border border-slate-800 rounded-xl flex items-center gap-1 self-start sm:self-auto">
              <button
                onClick={() => setViewScope("group")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  viewScope === "group"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Group Scores</span>
              </button>
              <button
                onClick={() => setViewScope("global")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  viewScope === "global"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Global Scores</span>
              </button>
            </div>
          </div>

          {/* Personality Similarity Force Graph */}
          {members.length >= 2 && (
            <PersonalityForceGraph
              members={members}
              traitStatsMap={traitStatsMap}
            />
          )}

          {/* RPG Character Stat Sheets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {members.map((member) => {
              const isSelf = member.id === currentProfile.id;

              return (
                <div
                  key={member.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 rounded-3xl p-6 shadow-xl space-y-5 transition duration-300 relative overflow-hidden"
                >
                  {/* Character Header */}
                  <div className="flex items-center gap-4 border-b border-slate-800/80 pb-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center font-extrabold text-xl text-white shrink-0 shadow-md">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        member.name.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-extrabold text-white">
                          {member.name}
                        </h3>
                        {isSelf && (
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-indigo-400 font-medium">
                        Big 5 Character Attributes ({viewScope === "group" ? "Group" : "Global"})
                      </span>
                    </div>
                  </div>

                  {/* RPG Stat Bars with Smooth Width Animations */}
                  <div className="space-y-3.5">
                    {TRAITS.map((t) => {
                      const stats = traitStatsMap[t.key]?.[member.id];
                      const winRate = stats?.winRate ?? 0;

                      return (
                        <div key={t.key} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="flex items-center gap-1.5 text-slate-200">
                              <span
                                className={`w-5 h-5 rounded text-[10px] font-extrabold flex items-center justify-center bg-slate-950 border ${t.borderColor} ${t.textColor}`}
                              >
                                {t.letter}
                              </span>
                              <span>{t.label}</span>
                            </span>

                            <span
                              className={`font-mono font-bold text-xs ${t.textColor}`}
                            >
                              {winRate}%
                            </span>
                          </div>

                          {/* Smooth Animated Bar */}
                          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800/80 p-0.5">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${t.color} transition-all duration-700 ease-out shadow-sm`}
                              style={{ width: `${winRate}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

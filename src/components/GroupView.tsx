"use client";

import { useState, useMemo } from "react";
import { db, id } from "@/lib/db";
import confetti from "canvas-confetti";
import { PersonalityForceGraph } from "@/components/PersonalityForceGraph";
import {
  Users,
  Globe,
  Share2,
  Check,
  Trophy,
  Swords,
  Activity,
  CheckCircle2,
  Info,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Sparkles,
  HelpCircle,
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
  const [activeTab, setActiveTab] = useState<"compare" | "rankings">(
    "compare"
  );

  const [copied, setCopied] = useState(false);
  const [voting, setVoting] = useState(false);
  const [localVotedKeys, setLocalVotedKeys] = useState<Set<string>>(new Set());
  const [skipOffset, setSkipOffset] = useState(0);

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

  // Current active question
  const currentQuestion =
    unvotedQuestions.length > 0
      ? unvotedQuestions[skipOffset % unvotedQuestions.length]
      : null;

  const completedCount = allQuestions.length - unvotedQuestions.length;
  const progressPercent =
    allQuestions.length > 0
      ? Math.round((completedCount / allQuestions.length) * 100)
      : 0;

  const handleCopyLink = () => {
    const link = `${window.location.origin}/?join=${group.inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Submit pairwise vote (optimistically advances on its own)
  const handleVote = async (winner: Profile, loser: Profile, traitKey: string) => {
    if (voting) return;
    setVoting(true);

    const pairKey = `${traitKey}:${[winner.id, loser.id].sort().join("-")}`;

    // Optimistically mark as voted locally so UI advances on its own immediately!
    setLocalVotedKeys((prev) => new Set(prev).add(pairKey));

    try {
      const groupComps = group.comparisons || [];
      const existing = groupComps.find(
        (c: any) =>
          c.rater?.id === currentProfile.id &&
          c.trait === traitKey &&
          ((c.winner?.id === winner.id && c.loser?.id === loser.id) ||
            (c.winner?.id === loser.id && c.loser?.id === winner.id))
      );

      if (existing) {
        await db.transact([
          db.tx.comparisons[existing.id]
            .update({
              updatedAt: Date.now(),
            })
            .link({ winner: winner.id })
            .link({ loser: loser.id }),
        ]);
      } else {
        const compId = id();
        await db.transact([
          db.tx.comparisons[compId]
            .create({
              trait: traitKey,
              updatedAt: Date.now(),
            })
            .link({ group: group.id })
            .link({ rater: currentProfile.id })
            .link({ winner: winner.id })
            .link({ loser: loser.id }),
        ]);
      }

      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err) {
      console.error("Error submitting comparison vote:", err);
    } finally {
      setVoting(false);
    }
  };

  const handleSkip = () => {
    setSkipOffset((prev) => prev + 1);
  };

  const handleResetVotes = () => {
    setLocalVotedKeys(new Set());
    setSkipOffset(0);
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

  // Build trait stats map for Personality Force Graph
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
          onClick={() => setActiveTab("rankings")}
          className={`flex items-center gap-2 pb-3 px-1 text-sm font-semibold transition border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "rankings"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Trait Leaderboards</span>
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
                    Question {completedCount + 1} of {allQuestions.length}
                  </span>
                  <span className="text-slate-400">{progressPercent}% Completed</span>
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

              {/* Unsure / Skip Question Button */}
              <div className="flex justify-center pt-1">
                <button
                  onClick={handleSkip}
                  className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 px-5 py-2.5 rounded-2xl text-xs font-semibold transition cursor-pointer shadow-sm"
                >
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>Unsure / Don't Know Them Well Enough (Skip)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>

              {/* Footer skip control */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-800/80 text-xs text-slate-400">
                <span>
                  Trait: <strong>{currentQuestion.trait.label}</strong>
                </span>

                <button
                  onClick={handleSkip}
                  className="flex items-center gap-1.5 hover:text-white transition cursor-pointer px-3 py-1.5 rounded-xl hover:bg-slate-800"
                >
                  <span>Skip Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Completion Screen when ALL questions & pairs across all Big 5 traits are done! */
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  All Questions Completed! 🎉
                </h3>
                <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
                  You've answered all {allQuestions.length} comparisons across the Big 5 personality traits for this group.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab("rankings")}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Trophy className="w-4 h-4 text-amber-300" />
                  <span>View Trait Leaderboards</span>
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

      {/* TAB 2: Trait Leaderboards & Similarity Force Graph */}
      {activeTab === "rankings" && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <span className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Showing <strong>{viewScope === "group" ? "Group" : "Global"} Leaderboards</strong> based on pairwise wins.
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
                <span>Group Rankings</span>
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
                <span>Global Rankings</span>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {TRAITS.map((trait) => {
              const rankings = computeTraitRankings(trait.key);

              return (
                <div
                  key={trait.key}
                  className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-7 h-7 rounded-xl font-extrabold text-xs flex items-center justify-center bg-slate-800 ${trait.textColor}`}
                      >
                        {trait.letter}
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-white">
                          {trait.label}
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          {trait.desc}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    {rankings.map((r, rankIdx) => {
                      const isSelf = r.profile.id === currentProfile.id;

                      return (
                        <div
                          key={r.profile.id}
                          className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                                rankIdx === 0
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  : rankIdx === 1
                                  ? "bg-slate-300/20 text-slate-300 border border-slate-400/30"
                                  : rankIdx === 2
                                  ? "bg-amber-700/20 text-amber-600 border border-amber-700/30"
                                  : "text-slate-500"
                              }`}
                            >
                              #{rankIdx + 1}
                            </span>

                            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-200 shrink-0">
                              {r.profile.avatarUrl ? (
                                <img
                                  src={r.profile.avatarUrl}
                                  alt={r.profile.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                r.profile.name.charAt(0).toUpperCase()
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-white">
                                  {r.profile.name}
                                </span>
                                {isSelf && (
                                  <span className="text-[9px] bg-indigo-950 text-indigo-400 px-1.5 py-0.2 rounded font-semibold">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {r.wins} W - {r.losses} L ({r.total} votes)
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span
                              className={`text-sm font-extrabold font-mono ${trait.textColor}`}
                            >
                              {r.winRate}%
                            </span>
                            <div className="w-16 bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1 border border-slate-800">
                              <div
                                className={`h-full bg-gradient-to-r ${trait.color}`}
                                style={{ width: `${r.winRate}%` }}
                              />
                            </div>
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

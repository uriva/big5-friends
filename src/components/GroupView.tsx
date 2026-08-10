"use client";

import { useState, useMemo } from "react";
import { db, id } from "@/lib/db";
import confetti from "canvas-confetti";
import {
  Users,
  Globe,
  Share2,
  Check,
  Sparkles,
  Trophy,
  Swords,
  Activity,
  CheckCircle2,
  Info,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Equal,
} from "lucide-react";

interface Profile {
  id: string;
  name: string;
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
  const [activeTab, setActiveTab] = useState<"compare" | "rankings" | "activity">(
    "compare"
  );
  const [selectedTraitKey, setSelectedTraitKey] = useState<string>("agreeableness");

  const [copied, setCopied] = useState(false);
  const [voting, setVoting] = useState(false);

  // Extract group profiles
  const members: Profile[] = useMemo(() => {
    return (
      group.members
        ?.map((m) => m.profile)
        .filter((p): p is Profile => Boolean(p)) || []
    );
  }, [group]);

  // Generate all possible pair combinations of members
  const allPairs = useMemo(() => {
    const pairs: [Profile, Profile][] = [];
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        pairs.push([members[i], members[j]]);
      }
    }
    return pairs;
  }, [members]);

  // Current pair index for active comparison session
  const [pairIndex, setPairIndex] = useState(0);

  const activeTrait =
    TRAITS.find((t) => t.key === selectedTraitKey) || TRAITS[0];

  const currentPair = allPairs[pairIndex % Math.max(1, allPairs.length)];

  const handleCopyLink = () => {
    const link = `${window.location.origin}/?join=${group.inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Submit pairwise vote
  const handleVote = async (winner: Profile, loser: Profile) => {
    if (voting) return;
    setVoting(true);

    try {
      const compId = id();
      await db.transact([
        db.tx.comparisons[compId]
          .create({
            trait: selectedTraitKey,
            updatedAt: Date.now(),
          })
          .link({ group: group.id })
          .link({ rater: currentProfile.id })
          .link({ winner: winner.id })
          .link({ loser: loser.id }),
      ]);

      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.7 },
      });

      // Next pair
      setPairIndex((prev) => prev + 1);
    } catch (err) {
      console.error("Error submitting comparison vote:", err);
    } finally {
      setVoting(false);
    }
  };

  const handleNextPair = () => {
    setPairIndex((prev) => prev + 1);
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

  // Compute rankings for a given trait
  const computeTraitRankings = (traitKey: string) => {
    const traitComps = scopedComparisons.filter((c) => c.trait === traitKey);

    const statsMap: Record<
      string,
      { wins: number; losses: number; total: number }
    > = {};

    // Initialize all group members
    members.forEach((m) => {
      statsMap[m.id] = { wins: 0, losses: 0, total: 0 };
    });

    traitComps.forEach((c) => {
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
                  <span>Pairwise Comparisons</span>
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

            {/* Scope Switcher: Group vs Global */}
            <div className="bg-slate-950/90 p-1 border border-slate-800 rounded-2xl flex items-center gap-1">
              <button
                onClick={() => setViewScope("group")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  viewScope === "group"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Group View</span>
              </button>
              <button
                onClick={() => setViewScope("global")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  viewScope === "global"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Global View</span>
              </button>
            </div>
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

        <button
          onClick={() => setActiveTab("activity")}
          className={`flex items-center gap-2 pb-3 px-1 text-sm font-semibold transition border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "activity"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Activity & Privacy Log</span>
        </button>
      </div>

      {/* TAB 1: Pairwise Comparison Arena */}
      {activeTab === "compare" && (
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Trait selector pills */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 text-center">
              Choose Big 5 Trait to Compare
            </label>
            <div className="flex flex-wrap justify-center gap-2">
              {TRAITS.map((t) => {
                const isSelected = t.key === selectedTraitKey;
                return (
                  <button
                    key={t.key}
                    onClick={() => setSelectedTraitKey(t.key)}
                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition border cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? `bg-slate-900 border-indigo-500 ${t.textColor} shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500`
                        : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    <span className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center font-bold text-[10px]">
                      {t.letter}
                    </span>
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Arena Card */}
          {allPairs.length < 1 ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
              <Info className="w-8 h-8 text-indigo-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">
                Need at least 2 members to compare
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Share your invite code <strong>{group.inviteCode}</strong> with friends so they can join and compare traits!
              </p>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative space-y-8">
              <div className="text-center space-y-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${activeTrait.bgColor} ${activeTrait.textColor} border ${activeTrait.borderColor}`}
                >
                  {activeTrait.label}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  {activeTrait.question}
                </h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Click on the person who exhibits more of this trait
                </p>
              </div>

              {/* Pairwise Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
                {currentPair.map((person, idx) => {
                  const opponent = currentPair[1 - idx];
                  const isSelf = person.id === currentProfile.id;

                  return (
                    <button
                      key={person.id}
                      onClick={() => handleVote(person, opponent)}
                      disabled={voting}
                      className="group p-8 rounded-3xl bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/60 shadow-xl transition-all duration-300 text-center flex flex-col items-center justify-center gap-4 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/30 transition">
                        {person.name.charAt(0).toUpperCase()}
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

              {/* Pass / Skip controls */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-800/80 text-xs text-slate-400">
                <span>
                  Matchup {pairIndex + 1} of {allPairs.length}
                </span>

                <button
                  onClick={handleNextPair}
                  className="flex items-center gap-1.5 hover:text-white transition cursor-pointer px-3 py-1.5 rounded-xl hover:bg-slate-800"
                >
                  <span>Skip / Next Pair</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Trait Leaderboards */}
      {activeTab === "rankings" && (
        <div className="space-y-8">
          <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <span className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              Showing <strong>{viewScope === "group" ? "Group" : "Global"} Leaderboards</strong> based on pairwise wins.
            </span>
          </div>

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
                              className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center ${
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

      {/* TAB 3: Activity & Privacy Log */}
      {activeTab === "activity" && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
              <strong>Privacy Protection:</strong> Activity feed confirms participation without revealing individual choices.
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <h3 className="text-base font-bold text-white">Recent Comparison Activity</h3>

            <div className="space-y-3">
              {scopedComparisons
                .slice()
                .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
                .slice(0, 15)
                .map((comp) => {
                  const raterName = comp.rater?.name || "A friend";
                  const traitObj = TRAITS.find((t) => t.key === comp.trait);
                  const timeAgo = comp.updatedAt
                    ? new Date(comp.updatedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Recently";

                  return (
                    <div
                      key={comp.id}
                      className="flex items-center justify-between text-xs bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="text-slate-300">
                          <strong className="text-white">{raterName}</strong> completed a pairwise comparison for{" "}
                          <strong className="text-indigo-400">{traitObj?.label || comp.trait}</strong>
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{timeAgo}</span>
                    </div>
                  );
                })}

              {scopedComparisons.length === 0 && (
                <p className="text-xs text-slate-500 italic py-4 text-center">
                  No comparison activity recorded yet in this group.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

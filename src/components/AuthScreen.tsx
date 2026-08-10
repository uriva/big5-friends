"use client";

import { useState } from "react";
import { db } from "@/lib/db";
import {
  Sparkles,
  Mail,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  Brain,
  Eye,
  HeartHandshake,
  Users,
  Award,
  History,
  BookOpen,
  ChevronRight,
} from "lucide-react";

export function AuthScreen() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sentEmail, setSentEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await db.auth.sendMagicCode({ email });
      setSentEmail(email);
    } catch (err: any) {
      setError(err?.message || "Failed to send magic code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      setError("Please enter the 6-digit magic code");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await db.auth.signInWithMagicCode({ email: sentEmail, code });
    } catch (err: any) {
      setError(err?.message || "Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-white text-lg tracking-tight">
              Big 5 Friends
            </span>
          </div>

          <a
            href="#signin"
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl transition"
          >
            Sign In / Join
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Brain className="w-4 h-4 text-indigo-400" />
              <span>Scientific Personality Comparison Engine</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Discover How Friends <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Perceive You & Who You Match
              </span>
            </h1>

            <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
              Rate yourself and your friend group (e.g. Uri, Yoni, Ran, Asaf) using head-to-head Big 5 comparisons. See how others truly perceive your personality and reveal who in your group is most similar to you!
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% Anonymous Friend Rating</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Similarity Match Index</span>
              </div>
            </div>
          </div>

          {/* Right Sign-in Card */}
          <div id="signin" className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-extrabold text-white">
                  Get Started in 30 Seconds
                </h2>
                <p className="text-xs text-slate-400">
                  Sign in with email to create or join your friend group
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold text-center">
                  {error}
                </div>
              )}

              {!sentEmail ? (
                <form onSubmit={handleSendCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Your Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <span className="inline-block animate-pulse">Sending magic code...</span>
                    ) : (
                      <>
                        <span>Send Magic Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div className="p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-xl text-xs text-indigo-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>We sent a magic code to <strong>{sentEmail}</strong></span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Enter 6-Digit Code
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="123456"
                        required
                        maxLength={6}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-center font-mono tracking-widest text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? "Verifying..." : "Verify & Sign In"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSentEmail("");
                      setCode("");
                      setError(null);
                    }}
                    className="w-full text-xs text-slate-400 hover:text-slate-200 transition text-center py-1 cursor-pointer"
                  >
                    Use a different email address
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: What is the Big 5? */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
              The Gold Standard of Psychology
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              What are the Big 5 Traits (OCEAN)?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Unlike Myers-Briggs or pop astrology, the <strong>Big Five</strong> is the only personality framework endorsed by modern psychological science. It measures 5 independent dimensions:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-5 space-y-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-black text-sm flex items-center justify-center">O</span>
              <h3 className="font-bold text-white text-base">Openness</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Curiosity, imagination, appreciation for art, emotional depth & original ideas vs routine.
              </p>
            </div>

            <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-5 space-y-2">
              <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 font-black text-sm flex items-center justify-center">C</span>
              <h3 className="font-bold text-white text-base">Conscientiousness</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Self-discipline, organization, dependability, orderliness & goal-driven focus.
              </p>
            </div>

            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 space-y-2">
              <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center">E</span>
              <h3 className="font-bold text-white text-base">Extraversion</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sociability, high energy, assertiveness, talkativeness & enthusiasm in social settings.
              </p>
            </div>

            <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 space-y-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center">A</span>
              <h3 className="font-bold text-white text-base">Agreeableness</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compassion, trust, empathy, generosity & warm cooperative nature towards others.
              </p>
            </div>

            <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-5 space-y-2">
              <span className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 font-black text-sm flex items-center justify-center">N</span>
              <h3 className="font-bold text-white text-base">Neuroticism</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Emotional reactivity, sensitivity to stress, mood shifts vs emotional stability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: History & Creators of the Big 5 */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
            History & Science
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            How the Big 5 Was Created & By Whom
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            The Big Five was not invented in a day by one person. It represents over 100 years of empirical research by legendary psychologists:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">The Lexical Hypothesis (1884–1936)</h3>
                <p className="text-xs text-indigo-400">Sir Francis Galton, Gordon Allport & Henry Odbert</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              In 1884, <strong>Sir Francis Galton</strong> proposed that the most important individual differences in human life are encoded into dictionary language. In 1936, <strong>Gordon Allport</strong> and <strong>Henry Odbert</strong> sifted through Webster's Dictionary to extract <strong>17,953 terms</strong> describing human trait characteristics.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Factor Analysis & Goldberg (1940s–1981)</h3>
                <p className="text-xs text-purple-400">Raymond Cattell & Dr. Lewis Goldberg</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Using statistical factor analysis, <strong>Raymond Cattell</strong> reduced trait lists down to core clusters. In 1981, <strong>Dr. Lewis Goldberg</strong> proved that personality adjectives consistently cluster into <strong>Five Big Factors</strong> and coined the famous term <em>"Big Five"</em>.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">The Canonical OCEAN Standard (1985–Present)</h3>
                <p className="text-xs text-emerald-400">Paul Costa & Robert McCrae (NEO-PI)</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              In 1985–1992, psychologists <strong>Paul Costa</strong> and <strong>Robert McCrae</strong> developed the NEO Personality Inventory, solidifying the <strong>OCEAN</strong> acronym. Today, thousands of peer-reviewed studies across dozens of cultures prove that the Big 5 predicts career performance, relationship harmony, and personal well-being better than any other test.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: What This Site Lets You Do */}
      <section className="py-16 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              How Big 5 Friends Works
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              What This Site Lets You Do
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Self-reporting is biased. <strong>Big 5 Friends</strong> combines self-ratings with peer comparisons to deliver groundbreaking social perception insights:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-extrabold text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-white">Rate Yourself & Friends</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Create a friend group (e.g. Uri, Yoni, Ran, Asaf) and answer quick, head-to-head pairwise questions across the 5 Big 5 traits.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-extrabold text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-white">See Social Perception</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Discover if your friends view you as the most Agreeable, Extraverted, or Creative in the group compared to how you see yourself!
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-extrabold text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-white">Discover Personality Matches</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our Similarity Index calculates trait profile correlations to highlight which friends share your personality style and core values!
              </p>
            </div>
          </div>

          {/* CTA Footer */}
          <div className="text-center pt-8">
            <a
              href="#signin"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/25 transition"
            >
              <span>Create Your Friend Group Now</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>Big 5 Friends • Grounded in the OCEAN Personality Framework (Goldberg, Costa & McCrae)</p>
      </footer>
    </div>
  );
}

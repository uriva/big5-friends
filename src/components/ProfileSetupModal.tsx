"use client";

import { useState } from "react";
import { db, id } from "@/lib/db";
import { User, Sparkles } from "lucide-react";

interface ProfileSetupModalProps {
  userId: string;
  email: string;
}

export function ProfileSetupModal({ userId, email }: ProfileSetupModalProps) {
  const [name, setName] = useState(email.split("@")[0]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const profileId = id();
      await db.transact([
        db.tx.profiles[profileId]
          .create({
            name: name.trim(),
            createdAt: Date.now(),
          })
          .link({ user: userId }),
      ]);
    } catch (err) {
      console.error("Error creating profile:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 mb-3">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Complete Your Profile</h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose how your name will appear to friends in your rating groups
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Your Name / Nickname
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Uri, Yoni, Ran, Asaf"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Saving..." : "Get Started"}
          </button>
        </form>
      </div>
    </div>
  );
}

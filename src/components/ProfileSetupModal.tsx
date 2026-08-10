"use client";

import { useState } from "react";
import { db, id } from "@/lib/db";
import { Camera, Upload, Sparkles, AlertCircle } from "lucide-react";

interface ProfileSetupModalProps {
  userId: string;
  email: string;
}

export function ProfileSetupModal({ userId, email }: ProfileSetupModalProps) {
  const [name, setName] = useState(email.split("@")[0]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (!avatarUrl) {
      setError("A profile picture is required to help friends identify you!");
      return;
    }

    setSaving(true);
    try {
      const profileId = id();
      await db.transact([
        db.tx.profiles[profileId]
          .create({
            name: name.trim(),
            avatarUrl: avatarUrl,
            createdAt: Date.now(),
          })
          .link({ user: userId }),
      ]);
    } catch (err: any) {
      console.error("Error creating profile:", err);
      setError(err?.message || "Failed to create profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-1">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Complete Profile</h2>
          <p className="text-xs text-slate-400">
            A profile picture and name are required so friends can recognize you in comparisons
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mandatory Picture Upload Area */}
          <div className="flex flex-col items-center gap-3">
            <label className="relative group cursor-pointer">
              <div
                className={`w-24 h-24 rounded-full bg-slate-950 border-2 overflow-hidden flex items-center justify-center transition shadow-inner ${
                  !avatarUrl && error
                    ? "border-red-500 animate-pulse"
                    : "border-dashed border-slate-700 group-hover:border-indigo-500"
                }`}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-400 group-hover:text-indigo-400 transition">
                    <Camera className="w-7 h-7 mb-1" />
                    <span className="text-[10px] font-semibold">Upload Photo</span>
                  </div>
                )}
              </div>

              {/* Overlay camera badge */}
              <div className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full text-white shadow-lg group-hover:scale-110 transition">
                <Upload className="w-3.5 h-3.5" />
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
                className="hidden"
              />
            </label>
            <div className="text-center">
              <span className="text-xs font-bold text-slate-300 block">
                Profile Photo <span className="text-red-400">* Required</span>
              </span>
              <span className="text-[11px] text-slate-500">
                {avatarUrl ? "Photo selected ✓" : "Click to select a photo from your device"}
              </span>
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Your Name / Nickname <span className="text-red-400">* Required</span>
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
            disabled={saving || !name.trim() || !avatarUrl}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition disabled:opacity-40 cursor-pointer"
          >
            {saving ? "Saving..." : "Continue to App"}
          </button>
        </form>
      </div>
    </div>
  );
}

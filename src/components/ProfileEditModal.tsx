"use client";

import { useState } from "react";
import { db } from "@/lib/db";
import { Camera, Upload, X, Check } from "lucide-react";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export function ProfileEditModal({
  isOpen,
  onClose,
  profile,
}: ProfileEditModalProps) {
  const [name, setName] = useState(profile.name);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    profile.avatarUrl || null
  );
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setSavedSuccess(false);

    try {
      await db.transact([
        db.tx.profiles[profile.id].update({
          name: name.trim(),
          avatarUrl: avatarUrl || undefined,
        }),
      ]);

      setSavedSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <h2 className="text-xl font-extrabold text-white">Edit Profile & Photo</h2>
          <p className="text-xs text-slate-400">
            Update your picture or display name
          </p>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            <span>Profile updated!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Picture Upload Area */}
          <div className="flex flex-col items-center gap-3">
            <label className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-slate-950 border-2 border-dashed border-slate-700 group-hover:border-indigo-500 overflow-hidden flex items-center justify-center transition shadow-inner">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-400 group-hover:text-indigo-400 transition">
                    <Camera className="w-7 h-7 mb-1" />
                    <span className="text-[10px] font-semibold">Upload</span>
                  </div>
                )}
              </div>

              <div className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full text-white shadow-lg group-hover:scale-110 transition">
                <Upload className="w-3.5 h-3.5" />
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            <span className="text-xs text-slate-400">
              Click photo to change
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name..."
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="w-1/2 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { db, id } from "@/lib/db";
import { UserPlus, Sparkles, X } from "lucide-react";

interface InvitePromptModalProps {
  group: any;
  profileId: string;
  onJoined: (groupId: string) => void;
  onClose: () => void;
}

export function InvitePromptModal({
  group,
  profileId,
  onJoined,
  onClose,
}: InvitePromptModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const creatorName = group?.creator?.name || "A friend";
  const groupName = group?.name || "Friend Group";

  const handleJoin = async () => {
    setLoading(true);
    setError(null);
    try {
      const memberId = id();
      await db.transact([
        db.tx.groupMembers[memberId]
          .create({
            joinedAt: Date.now(),
            role: "member",
          })
          .link({ group: group.id })
          .link({ profile: profileId }),
      ]);

      onJoined(group.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to join group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative text-center space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
          <Sparkles className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
            Group Invite
          </span>
          <h2 className="text-2xl font-extrabold text-white mt-3">
            Join {groupName}?
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            <strong className="text-slate-200">{creatorName}</strong> invited you to join their Big 5 friend group!
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="w-1/2 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Decline
          </button>
          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-1/2 py-3 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? "Joining..." : "Join Group"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

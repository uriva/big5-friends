"use client";

import { useState } from "react";
import { db, id } from "@/lib/db";
import { UserPlus, X } from "lucide-react";

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  allGroups: any[];
  userMemberGroupIds: string[];
  onGroupJoined: (groupId: string) => void;
}

export function JoinGroupModal({
  isOpen,
  onClose,
  profileId,
  allGroups,
  userMemberGroupIds,
  onGroupJoined,
}: JoinGroupModalProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    setLoading(true);
    try {
      const targetGroup = allGroups.find(
        (g) => g.inviteCode && g.inviteCode.toUpperCase() === cleanCode
      );

      if (!targetGroup) {
        setError("Invalid invite code. Please check and try again.");
        setLoading(false);
        return;
      }

      if (userMemberGroupIds.includes(targetGroup.id)) {
        setError("You are already a member of this group!");
        setLoading(false);
        return;
      }

      const memberId = id();
      await db.transact([
        db.tx.groupMembers[memberId]
          .create({
            joinedAt: Date.now(),
            role: "member",
          })
          .link({ group: targetGroup.id })
          .link({ profile: profileId }),
      ]);

      setCode("");
      onGroupJoined(targetGroup.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to join group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Join Friend Group</h2>
            <p className="text-xs text-slate-400">
              Enter the 6-character group invite code
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Invite Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. X7K9P2"
              maxLength={6}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-center font-mono tracking-widest text-lg uppercase text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Joining..." : "Join Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

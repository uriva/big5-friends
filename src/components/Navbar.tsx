"use client";

import { useState } from "react";
import { db } from "@/lib/db";
import {
  Sparkles,
  Users,
  Plus,
  UserPlus,
  LogOut,
  ChevronDown,
  Edit3,
  HelpCircle,
} from "lucide-react";

interface NavbarProps {
  userEmail: string;
  profile: { id: string; name: string; avatarUrl?: string };
  groups: any[];
  activeGroupId: string | null;
  onSelectGroup: (groupId: string | null) => void;
  onOpenCreateModal: () => void;
  onOpenJoinModal: () => void;
  onOpenEditProfile: () => void;
  onOpenExplainer: () => void;
}

export function Navbar({
  userEmail,
  profile,
  groups,
  activeGroupId,
  onSelectGroup,
  onOpenCreateModal,
  onOpenJoinModal,
  onOpenEditProfile,
  onOpenExplainer,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const activeGroup = groups.find((g) => g.id === activeGroupId);

  return (
    <nav className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white tracking-tight text-base sm:text-lg">
              Big 5 Friends
            </span>
            <button
              onClick={onOpenExplainer}
              className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full ml-2 font-medium transition cursor-pointer"
            >
              <HelpCircle className="w-3 h-3" />
              <span>What is Big 5?</span>
            </button>
          </div>
        </div>

        {/* Group Selector & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Group Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-200 transition cursor-pointer"
            >
              <Users className="w-4 h-4 text-indigo-400" />
              <span className="max-w-[120px] sm:max-w-[180px] truncate">
                {activeGroup ? activeGroup.name : "Select Group"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50"
                onClick={() => setMenuOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Your Friend Groups
                </div>

                {groups.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-slate-400 italic">
                    No groups yet. Create or join one!
                  </div>
                ) : (
                  groups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => onSelectGroup(group.id)}
                      className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between transition cursor-pointer ${
                        activeGroupId === group.id
                          ? "bg-indigo-600/10 text-indigo-400 font-semibold"
                          : "text-slate-300 hover:bg-slate-800/60"
                      }`}
                    >
                      <span className="truncate">{group.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {group.inviteCode}
                      </span>
                    </button>
                  ))
                )}

                <div className="border-t border-slate-800 my-1 pt-1 px-2 space-y-1">
                  <button
                    onClick={onOpenCreateModal}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-indigo-400 hover:bg-indigo-600/10 rounded-lg flex items-center gap-2 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Group</span>
                  </button>
                  <button
                    onClick={onOpenJoinModal}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-purple-400 hover:bg-purple-600/10 rounded-lg flex items-center gap-2 transition cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Join Group with Code</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Explainer button for mobile / tablet */}
          <button
            onClick={onOpenExplainer}
            title="What is Big 5?"
            className="sm:hidden p-2 rounded-xl text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Quick Add buttons for desktop */}
          <button
            onClick={onOpenCreateModal}
            title="Create Group"
            className="hidden md:flex items-center gap-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl px-3 py-2 text-xs font-medium transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Group</span>
          </button>

          <button
            onClick={onOpenJoinModal}
            title="Join Group"
            className="hidden md:flex items-center gap-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl px-3 py-2 text-xs font-medium transition cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Join</span>
          </button>

          {/* User Profile Badge & Signout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <button
              onClick={onOpenEditProfile}
              title="Edit Profile & Picture"
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800 transition cursor-pointer text-left group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-200 shrink-0">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profile.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="hidden lg:block">
                <div className="text-xs font-semibold text-slate-200 leading-tight group-hover:text-indigo-400 transition flex items-center gap-1">
                  <span>{profile.name}</span>
                  <Edit3 className="w-3 h-3 text-slate-500 group-hover:text-indigo-400" />
                </div>
                <div className="text-[10px] text-slate-400 max-w-[100px] truncate leading-tight">
                  {userEmail}
                </div>
              </div>
            </button>

            <button
              onClick={() => db.auth.signOut()}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

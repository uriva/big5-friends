"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { AuthScreen } from "@/components/AuthScreen";
import { ProfileSetupModal } from "@/components/ProfileSetupModal";
import { Navbar } from "@/components/Navbar";
import { CreateGroupModal } from "@/components/CreateGroupModal";
import { JoinGroupModal } from "@/components/JoinGroupModal";
import { GroupView } from "@/components/GroupView";
import { Users, Plus, UserPlus, Sparkles, Loader2 } from "lucide-react";

export default function Home() {
  const { isLoading: authLoading, user, error: authError } = db.useAuth();

  // InstantDB Query
  const { isLoading: queryLoading, data, error: queryError } = db.useQuery(
    user
      ? {
          profiles: {
            user: {},
            memberships: {
              group: {
                members: {
                  profile: {},
                },
              },
            },
          },
          groups: {
            members: {
              profile: {},
            },
            comparisons: {
              rater: {},
              winner: {},
              loser: {},
            },
          },
          comparisons: {
            rater: {},
            winner: {},
            loser: {},
            group: {},
          },
        }
      : null
  );

  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  // Derive current profile
  const profiles = data?.profiles || [];
  const currentProfile = profiles.find((p: any) => p.user?.id === user?.id);

  // Derive user groups
  const allGroups = data?.groups || [];
  const allComparisons = data?.comparisons || [];

  const userGroupMemberships = currentProfile?.memberships || [];
  const userGroups = userGroupMemberships
    .map((m: any) => m.group)
    .filter(Boolean);

  const userGroupIds = userGroups.map((g: any) => g.id);

  // Set default active group
  useEffect(() => {
    if (userGroups.length > 0 && (!activeGroupId || !userGroupIds.includes(activeGroupId))) {
      setActiveGroupId(userGroups[0].id);
    }
  }, [userGroups, activeGroupId]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (queryLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-xs text-slate-400">Loading Big 5 Friends...</p>
        </div>
      </div>
    );
  }

  // If user has no profile record yet, force profile setup modal
  if (!currentProfile) {
    return <ProfileSetupModal userId={user.id} email={user.email || ""} />;
  }

  const activeGroup = allGroups.find((g: any) => g.id === activeGroupId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar
        userEmail={user.email || ""}
        profile={currentProfile}
        groups={userGroups}
        activeGroupId={activeGroupId}
        onSelectGroup={(id) => setActiveGroupId(id)}
        onOpenCreateModal={() => setIsCreateOpen(true)}
        onOpenJoinModal={() => setIsJoinOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {userGroups.length === 0 ? (
          /* Empty state: No groups yet */
          <div className="max-w-2xl mx-auto my-16 text-center space-y-8 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-white">
                Welcome to Big 5 Friends, {currentProfile.name}!
              </h2>
              <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
                Create a friend group (e.g. Uri, Yoni, Ran, Asaf) or join an existing group with an invite code to start pairwise Big 5 trait comparisons.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto pt-2">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="p-6 rounded-2xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-left transition group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Create Group</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Start a new group and invite Uri, Yoni, Ran, Asaf
                </p>
              </button>

              <button
                onClick={() => setIsJoinOpen(true)}
                className="p-6 rounded-2xl bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 text-left transition group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Join Group</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter an invite code provided by a friend
                </p>
              </button>
            </div>
          </div>
        ) : activeGroup ? (
          <GroupView
            group={activeGroup}
            currentProfile={currentProfile}
            allComparisons={allComparisons}
          />
        ) : (
          <div className="text-center py-12 text-slate-400">
            Select a group from the top navigation to get started.
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateGroupModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        profileId={currentProfile.id}
        onGroupCreated={(id) => setActiveGroupId(id)}
      />

      <JoinGroupModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        profileId={currentProfile.id}
        allGroups={allGroups}
        userMemberGroupIds={userGroupIds}
        onGroupJoined={(id) => setActiveGroupId(id)}
      />
    </div>
  );
}

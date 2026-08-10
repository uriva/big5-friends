import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
    }),
    profiles: i.entity({
      name: i.string(),
      avatarUrl: i.string().optional(),
      createdAt: i.number(),
    }),
    groups: i.entity({
      name: i.string(),
      inviteCode: i.string().unique().indexed(),
      createdAt: i.number(),
    }),
    groupMembers: i.entity({
      joinedAt: i.number(),
      role: i.string(),
    }),
    comparisons: i.entity({
      trait: i.string().indexed(),
      updatedAt: i.number(),
    }),
  },
  links: {
    userProfile: {
      forward: { on: "profiles", has: "one", label: "user", onDelete: "cascade" },
      reverse: { on: "$users", has: "one", label: "profile" },
    },
    groupMembers: {
      forward: { on: "groupMembers", has: "one", label: "group", onDelete: "cascade" },
      reverse: { on: "groups", has: "many", label: "members" },
    },
    memberProfile: {
      forward: { on: "groupMembers", has: "one", label: "profile", onDelete: "cascade" },
      reverse: { on: "profiles", has: "many", label: "memberships" },
    },
    groupCreator: {
      forward: { on: "groups", has: "one", label: "creator" },
      reverse: { on: "profiles", has: "many", label: "createdGroups" },
    },
    comparisonGroup: {
      forward: { on: "comparisons", has: "one", label: "group", onDelete: "cascade" },
      reverse: { on: "groups", has: "many", label: "comparisons" },
    },
    comparisonRater: {
      forward: { on: "comparisons", has: "one", label: "rater", onDelete: "cascade" },
      reverse: { on: "profiles", has: "many", label: "givenComparisons" },
    },
    comparisonWinner: {
      forward: { on: "comparisons", has: "one", label: "winner", onDelete: "cascade" },
      reverse: { on: "profiles", has: "many", label: "wonComparisons" },
    },
    comparisonLoser: {
      forward: { on: "comparisons", has: "one", label: "loser", onDelete: "cascade" },
      reverse: { on: "profiles", has: "many", label: "lostComparisons" },
    },
  },
});

export type AppSchema = typeof _schema;
export default _schema;

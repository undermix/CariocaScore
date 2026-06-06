import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
...authTables,
users: defineTable({
name: v.optional(v.string()),
image: v.optional(v.string()),
email: v.optional(v.string()),
emailVerificationTime: v.optional(v.number()),
phone: v.optional(v.string()),
phoneVerificationTime: v.optional(v.number()),
isAnonymous: v.optional(v.boolean()),
totalGamesPlayed: v.optional(v.number()),
totalWins: v.optional(v.number()),
averageScore: v.optional(v.number()),
country: v.optional(v.string()),
friendCode: v.optional(v.string()),
}).index("email", ["email"])
  .index("by_friendCode", ["friendCode"]),

friendships: defineTable({
userId: v.id("users"),
friendId: v.id("users"),
status: v.string(),
})
  .index("by_userId", ["userId"])
  .index("by_friendId", ["friendId"])
  .index("by_userId_and_friendId", ["userId", "friendId"]),

games: defineTable({
userId: v.id("users"),
name: v.string(),
status: v.string(),
players: v.array(v.object({
id: v.string(),
name: v.string(),
scores: v.array(v.number()),
totalScore: v.number(),
linkedUserId: v.optional(v.id("users")),
})),
rounds: v.array(v.object({
id: v.string(),
name: v.string(),
completed: v.boolean(),
})),
currentRoundIndex: v.number(),
customRounds: v.optional(v.boolean()),
completedAt: v.optional(v.number()),
})
.index("by_userId", ["userId"])
.index("by_status", ["status"])
.index("by_userId_and_status", ["userId", "status"]),

gameParticipants: defineTable({
gameId: v.id("games"),
userId: v.id("users"),
})
  .index("by_userId", ["userId"])
  .index("by_gameId", ["gameId"])
  .index("by_userId_and_gameId", ["userId", "gameId"]),

pushTokens: defineTable({
userId: v.id("users"),
token: v.string(),
}).index("by_userId", ["userId"]),
});
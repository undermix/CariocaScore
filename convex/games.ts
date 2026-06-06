import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const playerValidator = v.object({
id: v.string(),
name: v.string(),
scores: v.array(v.number()),
totalScore: v.number(),
linkedUserId: v.optional(v.id("users")),
});

const roundValidator = v.object({
id: v.string(),
name: v.string(),
completed: v.boolean(),
});

const gameReturnValidator = v.object({
_id: v.id("games"),
_creationTime: v.number(),
userId: v.id("users"),
name: v.string(),
status: v.string(),
players: v.array(playerValidator),
rounds: v.array(roundValidator),
currentRoundIndex: v.number(),
customRounds: v.optional(v.boolean()),
completedAt: v.optional(v.number()),
isOwner: v.optional(v.boolean()),
});

function gameToReturn(g: any, isOwner?: boolean) {
return {
_id: g._id,
_creationTime: g._creationTime,
userId: g.userId,
name: g.name,
status: g.status,
players: g.players.map((p: any) => ({
id: p.id,
name: p.name,
scores: p.scores,
totalScore: p.totalScore,
linkedUserId: p.linkedUserId,
})),
rounds: g.rounds,
currentRoundIndex: g.currentRoundIndex,
customRounds: g.customRounds,
completedAt: g.completedAt,
isOwner,
};
}

export const listGames = query({
args: { status: v.optional(v.string()) },
returns: v.array(gameReturnValidator),
handler: async (ctx, args) => {
const userId = await getAuthUserId(ctx);
if (!userId) return [];

// Get owned games
let ownedGames;
if (args.status) {
ownedGames = await ctx.db
.query("games")
.withIndex("by_userId_and_status", (q) =>
q.eq("userId", userId).eq("status", args.status!)
)
.order("desc")
.collect();
} else {
ownedGames = await ctx.db
.query("games")
.withIndex("by_userId", (q) => q.eq("userId", userId))
.order("desc")
.collect();
}

const gameMap = new Map<string, any>();
for (const g of ownedGames) {
gameMap.set(g._id as string, gameToReturn(g, true));
}

// Get participated games (where user is a linked player)
const participations = await ctx.db
.query("gameParticipants")
.withIndex("by_userId", (q) => q.eq("userId", userId))
.collect();

for (const p of participations) {
if (gameMap.has(p.gameId as string)) continue;
const game = await ctx.db.get(p.gameId);
if (!game) continue;
if (args.status && game.status !== args.status) continue;
gameMap.set(p.gameId as string, gameToReturn(game, false));
}

const allGames = Array.from(gameMap.values());
allGames.sort((a: any, b: any) => b._creationTime - a._creationTime);
return allGames;
},
});

export const getGame = query({
args: { gameId: v.id("games") },
returns: v.union(gameReturnValidator, v.null()),
handler: async (ctx, args) => {
const userId = await getAuthUserId(ctx);
if (!userId) return null;

const game = await ctx.db.get(args.gameId);
if (!game) return null;

// Allow access if owner
if (game.userId === userId) return gameToReturn(game, true);

// Allow access if participant
const participation = await ctx.db
.query("gameParticipants")
.withIndex("by_userId_and_gameId", (q) =>
q.eq("userId", userId).eq("gameId", args.gameId)
)
.first();
if (participation) return gameToReturn(game, false);

return null;
},
});

export const createGame = mutation({
args: {
name: v.string(),
players: v.array(v.object({
name: v.string(),
linkedUserId: v.optional(v.id("users")),
})),
rounds: v.array(v.object({ id: v.string(), name: v.string() })),
customRounds: v.optional(v.boolean()),
},
returns: v.id("games"),
handler: async (ctx, args) => {
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("No autenticado");

const players = args.players.map((p, i) => ({
id: `player_${i}_${Date.now()}`,
name: p.name,
scores: new Array(args.rounds.length).fill(0) as Array<number>,
totalScore: 0,
linkedUserId: p.linkedUserId,
}));

const rounds = args.rounds.map((r) => ({
id: r.id,
name: r.name,
completed: false,
}));

const gameId = await ctx.db.insert("games", {
userId,
name: args.name,
status: "active",
players,
rounds,
currentRoundIndex: 0,
customRounds: args.customRounds,
});

// Add owner as participant
await ctx.db.insert("gameParticipants", { gameId, userId });

// Add linked friends as participants
const addedUserIds = new Set<string>([userId as string]);
for (const player of players) {
if (player.linkedUserId && !addedUserIds.has(player.linkedUserId as string)) {
await ctx.db.insert("gameParticipants", {
gameId,
userId: player.linkedUserId,
});
addedUserIds.add(player.linkedUserId as string);
}
}

return gameId;
},
});

export const updateScores = mutation({
args: {
gameId: v.id("games"),
roundIndex: v.number(),
scores: v.array(v.object({
playerId: v.string(),
score: v.number(),
})),
},
returns: v.null(),
handler: async (ctx, args) => {
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("No autenticado");

const game = await ctx.db.get(args.gameId);
if (!game) throw new Error("Partida no encontrada");

// Only owner can update scores
if (game.userId !== userId) throw new Error("Solo el creador puede editar puntajes");

if (game.rounds[args.roundIndex]?.completed) {
throw new Error("Esta ronda ya fue completada y no se puede editar");
}
if (game.status === "completed") {
throw new Error("Esta partida ya fue finalizada");
}

const players = game.players.map((player) => {
const scoreEntry = args.scores.find((s) => s.playerId === player.id);
if (scoreEntry) {
const newScores = [...player.scores];
newScores[args.roundIndex] = scoreEntry.score;
const totalScore = newScores.reduce((sum, s) => sum + s, 0);
return { ...player, scores: newScores, totalScore };
}
return player;
});

const rounds = [...game.rounds];
rounds[args.roundIndex] = { ...rounds[args.roundIndex], completed: true };

const nextIncomplete = rounds.findIndex((r) => !r.completed);
const currentRoundIndex = nextIncomplete === -1 ? rounds.length - 1 : nextIncomplete;

const allCompleted = rounds.every((r) => r.completed);

await ctx.db.patch(args.gameId, {
players,
rounds,
currentRoundIndex,
status: allCompleted ? "completed" : "active",
completedAt: allCompleted ? Date.now() : undefined,
});

return null;
},
});

export const addPlayer = mutation({
args: {
gameId: v.id("games"),
playerName: v.string(),
linkedUserId: v.optional(v.id("users")),
},
returns: v.null(),
handler: async (ctx, args) => {
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("No autenticado");

const game = await ctx.db.get(args.gameId);
if (!game || game.userId !== userId) throw new Error("Partida no encontrada");

const newPlayer = {
id: `player_${game.players.length}_${Date.now()}`,
name: args.playerName,
scores: new Array(game.rounds.length).fill(0) as Array<number>,
totalScore: 0,
linkedUserId: args.linkedUserId,
};

await ctx.db.patch(args.gameId, {
players: [...game.players, newPlayer],
});

// Add as participant if linked
if (args.linkedUserId) {
const existing = await ctx.db
.query("gameParticipants")
.withIndex("by_userId_and_gameId", (q) =>
q.eq("userId", args.linkedUserId!).eq("gameId", args.gameId)
)
.first();
if (!existing) {
await ctx.db.insert("gameParticipants", {
gameId: args.gameId,
userId: args.linkedUserId,
});
}
}

return null;
},
});

export const removePlayer = mutation({
args: {
gameId: v.id("games"),
playerId: v.string(),
},
returns: v.null(),
handler: async (ctx, args) => {
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("No autenticado");

const game = await ctx.db.get(args.gameId);
if (!game || game.userId !== userId) throw new Error("Partida no encontrada");

await ctx.db.patch(args.gameId, {
players: game.players.filter((p) => p.id !== args.playerId),
});

return null;
},
});

export const editPlayerName = mutation({
args: {
gameId: v.id("games"),
playerId: v.string(),
newName: v.string(),
},
returns: v.null(),
handler: async (ctx, args) => {
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("No autenticado");

const game = await ctx.db.get(args.gameId);
if (!game || game.userId !== userId) throw new Error("Partida no encontrada");

await ctx.db.patch(args.gameId, {
players: game.players.map((p) =>
p.id === args.playerId ? { ...p, name: args.newName } : p
),
});

return null;
},
});

export const deleteGame = mutation({
args: { gameId: v.id("games") },
returns: v.null(),
handler: async (ctx, args) => {
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("No autenticado");

const game = await ctx.db.get(args.gameId);
if (!game || game.userId !== userId) throw new Error("Partida no encontrada");

// Delete participants
const participants = await ctx.db
.query("gameParticipants")
.withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
.collect();
for (const p of participants) {
await ctx.db.delete(p._id);
}

await ctx.db.delete(args.gameId);
return null;
},
});

export const getStats = query({
args: {},
returns: v.object({
totalGames: v.number(),
completedGames: v.number(),
activeGames: v.number(),
playerStats: v.array(v.object({
name: v.string(),
wins: v.number(),
gamesPlayed: v.number(),
averageScore: v.number(),
bestScore: v.number(),
})),
}),
handler: async (ctx) => {
const userId = await getAuthUserId(ctx);
if (!userId) return { totalGames: 0, completedGames: 0, activeGames: 0, playerStats: [] };

// Get owned games
const ownedGames = await ctx.db
.query("games")
.withIndex("by_userId", (q) => q.eq("userId", userId))
.collect();

// Get participated games
const participations = await ctx.db
.query("gameParticipants")
.withIndex("by_userId", (q) => q.eq("userId", userId))
.collect();

const gameIds = new Set<string>(ownedGames.map((g) => g._id as string));
const allGames = [...ownedGames];

for (const p of participations) {
if (!gameIds.has(p.gameId as string)) {
const game = await ctx.db.get(p.gameId);
if (game) {
allGames.push(game);
gameIds.add(game._id as string);
}
}
}

const completedGames = allGames.filter((g) => g.status === "completed");
const activeGames = allGames.filter((g) => g.status === "active");

const playerMap: Record<string, { wins: number; gamesPlayed: number; totalScore: number; bestScore: number }> = {};

for (const game of completedGames) {
if (game.players.length === 0) continue;

const winner = game.players.reduce((min, p) =>
p.totalScore < min.totalScore ? p : min, game.players[0]);

for (const player of game.players) {
// For stats, use the player's linked user name if they're linked to this user
const key = player.name;
if (!playerMap[key]) {
playerMap[key] = { wins: 0, gamesPlayed: 0, totalScore: 0, bestScore: Infinity };
}
playerMap[key].gamesPlayed++;
playerMap[key].totalScore += player.totalScore;
if (player.totalScore < playerMap[key].bestScore) {
playerMap[key].bestScore = player.totalScore;
}
if (player.id === winner.id) {
playerMap[key].wins++;
}
}
}

const playerStats = Object.entries(playerMap).map(([name, stats]) => ({
name,
wins: stats.wins,
gamesPlayed: stats.gamesPlayed,
averageScore: stats.gamesPlayed > 0 ? Math.round(stats.totalScore / stats.gamesPlayed) : 0,
bestScore: stats.bestScore === Infinity ? 0 : stats.bestScore,
}));

playerStats.sort((a, b) => b.wins - a.wins);

return {
totalGames: allGames.length,
completedGames: completedGames.length,
activeGames: activeGames.length,
playerStats,
};
},
});

export const getGlobalStats = query({
args: { country: v.optional(v.string()) },
returns: v.array(v.object({
playerName: v.string(),
country: v.string(),
totalWins: v.number(),
totalGames: v.number(),
averageScore: v.number(),
bestScore: v.number(),
totalScore: v.number(),
})),
handler: async (ctx, args) => {
    const completedGames = await ctx.db
      .query("games")
      .withIndex("by_status", (q) => q.eq("status", "completed"))
      .order("desc")
      .take(500);

const userCountryCache: Record<string, string> = {};

const playerMap: Record<string, {
wins: number;
gamesPlayed: number;
totalScore: number;
bestScore: number;
country: string;
}> = {};

for (const game of completedGames) {
if (game.players.length === 0) continue;

const winner = game.players.reduce((min, p) =>
p.totalScore < min.totalScore ? p : min, game.players[0]);

let ownerCountry = "";
const userIdStr = game.userId as string;
if (userCountryCache[userIdStr] !== undefined) {
ownerCountry = userCountryCache[userIdStr];
} else {
try {
const user = await ctx.db.get(game.userId);
ownerCountry = (user as any)?.country || "";
userCountryCache[userIdStr] = ownerCountry;
} catch {
userCountryCache[userIdStr] = "";
}
}

if (args.country && ownerCountry !== args.country) continue;

for (const player of game.players) {
// Use linkedUserId's country if available
let playerCountry = ownerCountry;
if (player.linkedUserId) {
const linkedIdStr = player.linkedUserId as string;
if (userCountryCache[linkedIdStr] !== undefined) {
playerCountry = userCountryCache[linkedIdStr];
} else {
try {
const linkedUser = await ctx.db.get(player.linkedUserId);
playerCountry = (linkedUser as any)?.country || ownerCountry;
userCountryCache[linkedIdStr] = playerCountry;
} catch {
userCountryCache[linkedIdStr] = ownerCountry;
}
}
// If filtering by country and this linked user doesn't match, skip
if (args.country && playerCountry !== args.country) continue;
}

const key = player.linkedUserId
? (player.linkedUserId as string)
: player.name.trim().toLowerCase();

if (!playerMap[key]) {
playerMap[key] = {
wins: 0,
gamesPlayed: 0,
totalScore: 0,
bestScore: Infinity,
country: playerCountry,
};
}
playerMap[key].gamesPlayed++;
playerMap[key].totalScore += player.totalScore;
if (player.totalScore < playerMap[key].bestScore) {
playerMap[key].bestScore = player.totalScore;
}
if (playerCountry) {
playerMap[key].country = playerCountry;
}
if (player.id === winner.id) {
playerMap[key].wins++;
}
}
}

const results: Array<{
  playerName: string;
  country: string;
  totalWins: number;
  totalGames: number;
  averageScore: number;
  bestScore: number;
  totalScore: number;
}> = [];

for (const [key, stats] of Object.entries(playerMap)) {
// Find display name
let displayName = key;
for (const game of completedGames) {
for (const player of game.players) {
const playerKey = player.linkedUserId
? (player.linkedUserId as string)
: player.name.trim().toLowerCase();
if (playerKey === key) {
displayName = player.name.trim();
}
}
}

// If key is a user ID, try to get their account name
if (key.length > 20) {
try {
const user = await ctx.db.get(key as any);
if (user && (user as any).name) {
displayName = (user as any).name;
}
} catch {
// keep the player name from games
}
}

    results.push({
      playerName: displayName,
      country: stats.country,
      totalWins: stats.wins,
      totalGames: stats.gamesPlayed,
      averageScore: stats.gamesPlayed > 0 ? Math.round(stats.totalScore / stats.gamesPlayed) : 0,
      bestScore: stats.bestScore === Infinity ? 0 : stats.bestScore,
      totalScore: stats.totalScore,
    });
  }

  results.sort((a, b) => b.totalWins - a.totalWins || a.averageScore - b.averageScore);
  return results.slice(0, 10);
},
});

export const updateUserCountry = mutation({
args: { country: v.string() },
returns: v.null(),
handler: async (ctx, args) => {
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("No autenticado");
await ctx.db.patch(userId, { country: args.country });
return null;
},
});

export const updateUserName = mutation({
args: { name: v.string() },
returns: v.null(),
handler: async (ctx, args) => {
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("No autenticado");
await ctx.db.patch(userId, { name: args.name.trim() });
return null;
},
});

export const getUserProfile = query({
args: {},
returns: v.union(v.object({
name: v.string(),
country: v.string(),
}), v.null()),
handler: async (ctx) => {
const userId = await getAuthUserId(ctx);
if (!userId) return null;
const user = await ctx.db.get(userId);
if (!user) return null;
return {
name: user.name || "",
country: (user as any).country || "",
};
},
});

export const syncOfflineGame = mutation({
  args: {
    name: v.string(),
    status: v.string(),
    players: v.array(v.object({
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
  },
  returns: v.id("games"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const players = args.players.map((p, i) => ({
      id: `player_${i}_${Date.now()}`,
      name: p.name,
      scores: p.scores,
      totalScore: p.totalScore,
      linkedUserId: p.linkedUserId,
    }));

    const gameId = await ctx.db.insert("games", {
      userId,
      name: args.name,
      status: args.status,
      players,
      rounds: args.rounds,
      currentRoundIndex: args.currentRoundIndex,
      customRounds: args.customRounds,
      completedAt: args.completedAt,
    });

    await ctx.db.insert("gameParticipants", { gameId, userId });

    const addedUserIds = new Set<string>([userId as string]);
    for (const player of players) {
      if (player.linkedUserId && !addedUserIds.has(player.linkedUserId as string)) {
        await ctx.db.insert("gameParticipants", {
          gameId,
          userId: player.linkedUserId,
        });
        addedUserIds.add(player.linkedUserId as string);
      }
    }

    return gameId;
  },
});

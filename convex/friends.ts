import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

function generateCode(): string {
const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
let code = "C";
for (let i = 0; i < 5; i++) {
code += chars[Math.floor(Math.random() * chars.length)];
}
return code;
}

export const getMyFriendCode = query({
args: {},
returns: v.union(v.string(), v.null()),
handler: async (ctx) => {
const userId = await getAuthUserId(ctx);
if (!userId) return null;
const user = await ctx.db.get(userId);
if (!user) return null;
return user.friendCode || null;
},
});

export const generateFriendCode = mutation({
args: {},
returns: v.string(),
handler: async (ctx) => {
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("No autenticado");

const user = await ctx.db.get(userId);
if (!user) throw new Error("Usuario no encontrado");
if (user.friendCode) return user.friendCode;

// Generate unique code
let code = generateCode();
let attempts = 0;
while (attempts < 10) {
const existing = await ctx.db
.query("users")
.withIndex("by_friendCode", (q) => q.eq("friendCode", code))
.first();
if (!existing) break;
code = generateCode();
attempts++;
}

await ctx.db.patch(userId, { friendCode: code });
return code;
},
});

export const searchByCode = query({
args: { code: v.string() },
returns: v.union(
v.object({
userId: v.id("users"),
name: v.string(),
country: v.string(),
}),
v.null()
),
handler: async (ctx, args) => {
const myId = await getAuthUserId(ctx);
if (!myId) return null;

const trimmed = args.code.trim().toUpperCase();
if (!trimmed) return null;

const user = await ctx.db
.query("users")
.withIndex("by_friendCode", (q) => q.eq("friendCode", trimmed))
.first();

if (!user || user._id === myId) return null;

return {
userId: user._id,
name: user.name || "Jugador",
country: (user as any).country || "",
};
},
});

export const sendFriendRequest = mutation({
args: { friendId: v.id("users") },
returns: v.null(),
handler: async (ctx, args) => {
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("No autenticado");
if (userId === args.friendId) throw new Error("No puedes agregarte a ti mismo");

// Check if friendship already exists
const existing = await ctx.db
.query("friendships")
.withIndex("by_userId_and_friendId", (q) =>
q.eq("userId", userId).eq("friendId", args.friendId)
)
.first();
if (existing) throw new Error("Solicitud ya enviada");

// Check reverse direction too
const reverse = await ctx.db
.query("friendships")
.withIndex("by_userId_and_friendId", (q) =>
q.eq("userId", args.friendId).eq("friendId", userId)
)
.first();
if (reverse) throw new Error("Ya son amigos o hay solicitud pendiente");

await ctx.db.insert("friendships", {
userId,
friendId: args.friendId,
status: "pending",
});
return null;
},
});

export const acceptFriendRequest = mutation({
args: { friendshipId: v.id("friendships") },
returns: v.null(),
handler: async (ctx, args) => {
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("No autenticado");

const friendship = await ctx.db.get(args.friendshipId);
if (!friendship || friendship.friendId !== userId) {
throw new Error("Solicitud no encontrada");
}

await ctx.db.patch(args.friendshipId, { status: "accepted" });
return null;
},
});

export const rejectFriendRequest = mutation({
args: { friendshipId: v.id("friendships") },
returns: v.null(),
handler: async (ctx, args) => {
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("No autenticado");

const friendship = await ctx.db.get(args.friendshipId);
if (!friendship || friendship.friendId !== userId) {
throw new Error("Solicitud no encontrada");
}

await ctx.db.delete(args.friendshipId);
return null;
},
});

export const removeFriend = mutation({
args: { friendshipId: v.id("friendships") },
returns: v.null(),
handler: async (ctx, args) => {
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("No autenticado");

const friendship = await ctx.db.get(args.friendshipId);
if (!friendship) throw new Error("No encontrado");
if (friendship.userId !== userId && friendship.friendId !== userId) {
throw new Error("No autorizado");
}

await ctx.db.delete(args.friendshipId);
return null;
},
});

export const listFriends = query({
args: {},
returns: v.array(v.object({
friendshipId: v.id("friendships"),
friendUserId: v.id("users"),
name: v.string(),
country: v.string(),
status: v.string(),
isIncoming: v.boolean(),
})),
handler: async (ctx) => {
const userId = await getAuthUserId(ctx);
if (!userId) return [];

// Friendships where I'm the sender
const sent = await ctx.db
.query("friendships")
.withIndex("by_userId", (q) => q.eq("userId", userId))
.collect();

// Friendships where I'm the receiver
const received = await ctx.db
.query("friendships")
.withIndex("by_friendId", (q) => q.eq("friendId", userId))
.collect();

const results: Array<{
friendshipId: typeof sent[0]["_id"];
friendUserId: typeof userId;
name: string;
country: string;
status: string;
isIncoming: boolean;
}> = [];

for (const f of sent) {
const friend = await ctx.db.get(f.friendId);
if (friend) {
results.push({
friendshipId: f._id,
friendUserId: f.friendId,
name: friend.name || "Jugador",
country: (friend as any).country || "",
status: f.status,
isIncoming: false,
});
}
}

for (const f of received) {
const friend = await ctx.db.get(f.userId);
if (friend) {
results.push({
friendshipId: f._id,
friendUserId: f.userId,
name: friend.name || "Jugador",
country: (friend as any).country || "",
status: f.status,
isIncoming: true,
});
}
}

// Sort: pending incoming first, then accepted
results.sort((a, b) => {
if (a.status === "pending" && a.isIncoming && !(b.status === "pending" && b.isIncoming)) return -1;
if (b.status === "pending" && b.isIncoming && !(a.status === "pending" && a.isIncoming)) return 1;
return a.name.localeCompare(b.name);
});

return results;
},
});

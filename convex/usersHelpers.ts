import { internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const getPasswordAccount = internalQuery({
args: { userId: v.id("users") },
returns: v.union(
v.object({ _id: v.id("authAccounts"), secret: v.string() }),
v.null()
),
handler: async (ctx, args) => {
const accounts = await ctx.db
.query("authAccounts")
.withIndex("userIdAndProvider", (q: any) =>
q.eq("userId", args.userId).eq("provider", "password")
)
.collect();
const account = accounts[0];
if (!account || !account.secret) return null;
return { _id: account._id, secret: account.secret };
},
});

export const updatePasswordHash = internalMutation({
args: {
accountId: v.id("authAccounts"),
newHash: v.string(),
},
returns: v.null(),
handler: async (ctx, args) => {
await ctx.db.patch(args.accountId, { secret: args.newHash });
return null;
},
});

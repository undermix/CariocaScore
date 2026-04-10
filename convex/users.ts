"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

function hashPassword(password: string): string {
const salt = randomBytes(16);
const N = 16384, r = 16, p = 1;
const key = scryptSync(password, salt, 64, { N, r, p });
return `$scrypt$n=${N},r=${r},p=${p}$${salt.toString("base64")}$${key.toString("base64")}`;
}

function verifyPassword(storedHash: string, password: string): boolean {
try {
const parts = storedHash.split("$");
const paramStr = parts[2];
const params: Record<string, number> = {};
for (const p of paramStr.split(",")) {
const [k, val] = p.split("=");
params[k] = parseInt(val, 10);
}
const salt = Buffer.from(parts[3], "base64");
const storedKey = Buffer.from(parts[4], "base64");
const key = scryptSync(password, salt, storedKey.length, {
N: params["n"] ?? 16384,
r: params["r"] ?? 16,
p: params["p"] ?? 1,
});
return timingSafeEqual(storedKey, key);
} catch {
return false;
}
}

export const changePassword = action({
args: {
currentPassword: v.string(),
newPassword: v.string(),
},
returns: v.null(),
handler: async (ctx, args) => {
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("No autenticado");

const account = await ctx.runQuery(internal.usersHelpers.getPasswordAccount, {
userId,
});
if (!account) throw new Error("No se encontró cuenta con contraseña");

if (!verifyPassword(account.secret, args.currentPassword)) {
throw new Error("Contraseña actual incorrecta");
}

const newHash = hashPassword(args.newPassword);

await ctx.runMutation(internal.usersHelpers.updatePasswordHash, {
accountId: account._id,
newHash,
});

return null;
},
});

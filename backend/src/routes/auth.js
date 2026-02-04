"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("@repo/db");
const prisma = new db_1.PrismaClient();
exports.authRouter = (0, express_1.Router)();
function mustGetEnv(name) {
    const value = process.env[name];
    if (!value)
        throw new Error(`Missing ${name} in environment`);
    return value;
}
const ACCESS_TOKEN_SECRET = mustGetEnv("ACCESS_TOKEN_SECRET");
const REFRESH_TOKEN_SECRET = mustGetEnv("REFRESH_TOKEN_SECRET");
function issueAccessToken(user) {
    const payload = { sub: user.id };
    return jsonwebtoken_1.default.sign(payload, ACCESS_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: "15m",
    });
}
function issueRefreshToken(user) {
    const payload = { sub: user.id };
    return jsonwebtoken_1.default.sign(payload, REFRESH_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: "30d",
    });
}
function getRefreshExpiryDate(days = 30) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
}
function hashToken(token) {
    // Store a one-way hash in DB so a leaked DB doesn't leak raw refresh tokens.
    // bcrypt is slower but fine at MVP scale.
    return bcrypt_1.default.hash(token, 12);
}
function isStrongPassword(pw) {
    return pw.length >= 8;
}
function parseBearerToken(authHeader) {
    if (!authHeader || !authHeader.startsWith("Bearer "))
        return null;
    return authHeader.slice(7);
}
function assertEmailPassword(body) {
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    if (!email || !password)
        return null;
    return { email, password };
}
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing or invalid Authorization header" });
    }
    const token = authHeader.slice(7);
    try {
        const payload = jsonwebtoken_1.default.verify(token, ACCESS_TOKEN_SECRET);
        req.user = payload;
        next();
    }
    catch {
        return res.status(401).json({ message: "Invalid or expired access token" });
    }
}
async function findValidRefreshTokenRows(userId) {
    return prisma.refresh_tokens.findMany({
        where: {
            user_id: userId,
            revoked_at: null,
            expires_at: { gt: new Date() },
        },
        orderBy: { created_at: "desc" },
    });
}
/**
 * POST /auth/register
 * Body: { email, password, name? }
 */
exports.authRouter.post("/register", async (req, res) => {
    const parsed = assertEmailPassword(req.body);
    if (!parsed) {
        return res.status(400).json({ message: "Missing email or password" });
    }
    const { email, password } = parsed;
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : undefined;
    if (!isStrongPassword(password)) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
    }
    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
        return res.status(409).json({ message: "Email already in use" });
    }
    const password_hash = await bcrypt_1.default.hash(password, 12);
    const user = await prisma.users.create({
        data: {
            email,
            password_hash,
            name,
            is_email_verified: false,
        },
        select: { id: true },
    });
    const accessToken = issueAccessToken(user);
    const refreshToken = issueRefreshToken(user);
    await prisma.refresh_tokens.create({
        data: {
            user_id: user.id,
            token_hash: await hashToken(refreshToken),
            expires_at: getRefreshExpiryDate(30),
        },
    });
    return res.status(201).json({ accessToken, refreshToken });
});
/**
 * POST /auth/login
 * Body: { email, password }
 */
exports.authRouter.post("/login", async (req, res) => {
    const parsed = assertEmailPassword(req.body);
    if (!parsed) {
        return res.status(400).json({ message: "Missing email or password" });
    }
    const { email, password } = parsed;
    const user = await prisma.users.findUnique({
        where: { email },
        select: {
            id: true,
            password_hash: true,
            is_email_verified: true,
        },
    });
    if (!user || !user.password_hash) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const ok = await bcrypt_1.default.compare(password, user.password_hash);
    if (!ok) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const accessToken = issueAccessToken({ id: user.id });
    const refreshToken = issueRefreshToken({ id: user.id });
    await prisma.refresh_tokens.create({
        data: {
            user_id: user.id,
            token_hash: await hashToken(refreshToken),
            expires_at: getRefreshExpiryDate(30),
        },
    });
    return res.json({ accessToken, refreshToken });
});
/**
 * POST /auth/refresh
 * Header: Authorization: Bearer <refreshToken>
 */
exports.authRouter.post("/refresh", async (req, res) => {
    const token = parseBearerToken(req.headers.authorization);
    if (!token) {
        return res.status(401).json({ message: "Missing or invalid Authorization header" });
    }
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(token, REFRESH_TOKEN_SECRET);
    }
    catch {
        return res.status(401).json({ message: "Invalid or expired refresh token" });
    }
    const userId = payload.sub;
    const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { id: true },
    });
    if (!user) {
        return res.status(401).json({ message: "Invalid refresh token" });
    }
    const candidates = await findValidRefreshTokenRows(userId);
    let matched = null;
    for (const rt of candidates) {
        const ok = await bcrypt_1.default.compare(token, rt.token_hash);
        if (ok) {
            matched = { id: rt.id };
            break;
        }
    }
    if (!matched) {
        return res.status(401).json({ message: "Refresh token not recognized" });
    }
    const newRefreshToken = issueRefreshToken({ id: userId });
    const newAccessToken = issueAccessToken({ id: userId });
    const created = await prisma.refresh_tokens.create({
        data: {
            user_id: userId,
            token_hash: await hashToken(newRefreshToken),
            expires_at: getRefreshExpiryDate(30),
        },
        select: { id: true },
    });
    // Revoke the old token (schema has no replacedById, so we just revoke).
    await prisma.refresh_tokens.update({
        where: { id: matched.id },
        data: { revoked_at: new Date() },
    });
    return res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken, rotatedFrom: created.id });
});
/**
 * POST /auth/logout
 * Revokes the provided refresh token.
 * Header: Authorization: Bearer <refreshToken>
 */
exports.authRouter.post("/logout", async (req, res) => {
    const token = parseBearerToken(req.headers.authorization);
    if (!token) {
        return res.status(401).json({ message: "Missing or invalid Authorization header" });
    }
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(token, REFRESH_TOKEN_SECRET);
    }
    catch {
        // If token is invalid/expired, treat as logged out.
        return res.json({ ok: true });
    }
    const userId = payload.sub;
    const candidates = await findValidRefreshTokenRows(userId);
    for (const rt of candidates) {
        const ok = await bcrypt_1.default.compare(token, rt.token_hash);
        if (ok) {
            await prisma.refresh_tokens.update({
                where: { id: rt.id },
                data: { revoked_at: new Date() },
            });
            break;
        }
    }
    return res.json({ ok: true });
});
/**
 * GET /auth/me
 */
exports.authRouter.get("/me", requireAuth, async (req, res) => {
    const userId = req.user.sub;
    const user = await prisma.users.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            is_email_verified: true,
            created_at: true,
            updated_at: true,
        },
    });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    return res.json({ user });
});
/**
 * PATCH /auth/me
 * Allowed fields: name
 */
exports.authRouter.patch("/me", requireAuth, async (req, res) => {
    const userId = req.user.sub;
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : undefined;
    if (name === undefined) {
        return res.status(400).json({ message: "Nothing to update" });
    }
    const user = await prisma.users.update({
        where: { id: userId },
        data: { name: name.length ? name : null },
        select: {
            id: true,
            email: true,
            name: true,
            is_email_verified: true,
            created_at: true,
            updated_at: true,
        },
    });
    return res.json({ user });
});
/**
 * POST /auth/me/change-password
 * Body: { currentPassword, newPassword }
 */
exports.authRouter.post("/me/change-password", requireAuth, async (req, res) => {
    const userId = req.user.sub;
    const currentPassword = typeof req.body?.currentPassword === "string" ? req.body.currentPassword : "";
    const newPassword = typeof req.body?.newPassword === "string" ? req.body.newPassword : "";
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Missing currentPassword or newPassword" });
    }
    if (!isStrongPassword(newPassword)) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
    }
    const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { id: true, password_hash: true },
    });
    if (!user || !user.password_hash) {
        return res.status(404).json({ message: "User not found" });
    }
    const ok = await bcrypt_1.default.compare(currentPassword, user.password_hash);
    if (!ok) {
        return res.status(401).json({ message: "Current password is incorrect" });
    }
    const password_hash = await bcrypt_1.default.hash(newPassword, 12);
    await prisma.$transaction([
        prisma.users.update({
            where: { id: userId },
            data: { password_hash },
        }),
        // Revoke all active refresh tokens when password changes
        prisma.refresh_tokens.updateMany({
            where: { user_id: userId, revoked_at: null },
            data: { revoked_at: new Date() },
        }),
    ]);
    return res.json({ ok: true });
});

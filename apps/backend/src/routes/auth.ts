import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../db";

const SECRET = process.env.ACCESS_TOKEN_SECRET || "dev-secret";
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || "dev-refresh";

function json(statusCode: number, data: any) {
    return {
        statusCode,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
}

// ── POST /auth/register ──
export async function register(body: any) {
    try {
        const { email, password, name } = body;
        if (!email || !password) return json(400, { error: "email and password required" });

        const exists = await query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
        if (exists.rows.length) return json(409, { error: "Email already in use" });

        const hash = await bcrypt.hash(password, 10);
        const result = await query(
            "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name",
            [email.toLowerCase(), hash, name || null],
        );

        const user = result.rows[0];
        const accessToken = jwt.sign({ sub: user.id }, SECRET, { expiresIn: "1h" });
        const refreshToken = jwt.sign({ sub: user.id }, REFRESH_SECRET, { expiresIn: "30d" });

        return json(201, { user, accessToken, refreshToken });
    } catch (err: any) {
        console.error("register error:", err);
        return json(500, { error: err.message });
    }
}

// ── POST /auth/login ──
export async function login(body: any) {
    try {
        const { email, password } = body;
        if (!email || !password) return json(400, { error: "email and password required" });

        const result = await query(
            "SELECT id, email, name, password_hash FROM users WHERE email = $1",
            [email.toLowerCase()],
        );
        const user = result.rows[0];
        if (!user) return json(401, { error: "Invalid credentials" });

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return json(401, { error: "Invalid credentials" });

        const accessToken = jwt.sign({ sub: user.id }, SECRET, { expiresIn: "1h" });
        const refreshToken = jwt.sign({ sub: user.id }, REFRESH_SECRET, { expiresIn: "30d" });

        return json(200, { user: { id: user.id, email: user.email, name: user.name }, accessToken, refreshToken });
    } catch (err: any) {
        console.error("login error:", err);
        return json(500, { error: err.message });
    }
}



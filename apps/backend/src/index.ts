import { register, login } from "./routes/auth";

function json(status: number, data: any) {
  return { statusCode: status, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) };
}

export async function handler(event: any) {
  const method = event.requestContext.http.method;
  const path = event.rawPath.replace("/prod/api/backend", "") || "/";
  const body = event.body ? JSON.parse(event.body) : {};

  if (path === "/health" && method === "GET") return json(200, { ok: true });
  if (path === "/auth/register" && method === "POST") return register(body);
  if (path === "/auth/login" && method === "POST") return login(body);

  return json(404, { error: "Not found" });
}
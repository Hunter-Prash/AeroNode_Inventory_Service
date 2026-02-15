import "dotenv/config";
import express from "express";
import { authRouter } from "./routes/auth";
import cors from "cors";
import serverlessExpress from "@vendia/serverless-express";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

app.use("/auth", authRouter);

app.get("/health", (_, res) => res.json({ ok: true }));

// ── Lambda handler (used by AWS SAM / API Gateway) ──
export const handler = serverlessExpress({ app });

// ── Local dev server (ignored when running in Lambda) ──
if (process.env.NODE_ENV !== "production") {
  app.listen(process.env.PORT || 3001, () => console.log("running"));
}
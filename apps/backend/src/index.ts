import "dotenv/config";
import express from "express";
import { authRouter } from "./routes/auth";

const app = express();
app.use(express.json());

app.use("/auth", authRouter);

app.get("/health", (_, res) => res.json({ ok: true }));

app.listen(process.env.PORT || 3000, () => console.log("running"));
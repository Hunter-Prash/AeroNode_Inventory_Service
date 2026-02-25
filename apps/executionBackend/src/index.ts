import "dotenv/config";
import express from "express";
import { flightRouter } from "./routes/flight";
import { flightDetailsRouter } from "./routes/flightDetails";
import cors from "cors";
import serverlessExpress from "@vendia/serverless-express";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/flights", flightRouter);
app.use("/flights", flightDetailsRouter);

app.get("/health", (_, res) => res.json({ ok: true }));

// ── Lambda handler (used by AWS SAM / API Gateway) ──
export const handler = serverlessExpress({ app });

// ── Local dev server (ignored when running in Lambda) ──
if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () =>
        console.log(`Execution Backend running on port ${PORT}`),
    );
}

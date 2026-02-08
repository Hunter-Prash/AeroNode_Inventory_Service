import express from "express";
import cors from "cors";
import { flightSearchRouter } from "./routes/flight-search";
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use("/flight-search", flightSearchRouter);

app.get("/health", (_, res) => res.json({ ok: true }));

app.listen(process.env.PORT || 4000, () => console.log("running"));

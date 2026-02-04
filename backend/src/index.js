"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const auth_1 = require("./routes/auth");
const fetchFlights_1 = require("./routes/fetchFlights");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use("/auth", auth_1.authRouter);
app.use("/flights", fetchFlights_1.fetchFlightsRouter);
app.get("/health", (_, res) => res.json({ ok: true }));
app.listen(process.env.PORT || 3000, () => console.log("running"));

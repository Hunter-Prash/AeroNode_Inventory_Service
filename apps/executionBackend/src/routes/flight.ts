import { Router, type Request, type Response } from "express";
import amadeus from "../services/amadeus";

export const flightRouter = Router();

/**
 * POST /flights/search
 * Body: { origin, destination, date, adults }
 */
flightRouter.post("/search", async (req: Request, res: Response) => {
    try {
        const { origin, destination, date, adults } = req.body;

        if (!origin || !destination || !date) {
            return res.status(400).json({ message: "Missing required fields: origin, destination, date" });
        }

        const response = await amadeus.shopping.flightOffersSearch.get({
            originLocationCode: origin,
            destinationLocationCode: destination,
            departureDate: date,
            adults: adults || '1',
            max: '10'
        });

        return res.json(JSON.parse(response.body));
    } catch (error: any) {
        console.error("Amadeus API Error:", error);
        // Amadeus errors usually have a response object or code
        const status = error.response?.statusCode || 500;
        const message = error.response?.result?.errors?.[0]?.detail || "Failed to fetch flight offers";
        return res.status(status).json({ message });
    }
});

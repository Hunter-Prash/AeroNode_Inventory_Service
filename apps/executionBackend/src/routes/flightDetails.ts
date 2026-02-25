import { Router, type Request, type Response } from "express";
import amadeus from "../services/amadeus";

export const flightDetailsRouter = Router();

/**
 * POST /flights/price
 * Body: { flightOffers: FlightOffer[] }
 * Prices one or more flight offers returned from /flights/search.
 */
flightDetailsRouter.post("/price", async (req: Request, res: Response) => {
    try {
        const { flightOffers } = req.body;

        if (!flightOffers || !Array.isArray(flightOffers) || flightOffers.length === 0) {
            return res.status(400).json({ message: "Missing or invalid flightOffers array in request body" });
        }

        const response = await amadeus.shopping.flightOffers.pricing.post(
            JSON.stringify({
                data: {
                    type: "flight-offers-pricing",
                    flightOffers,
                },
            })
        );

        return res.json(JSON.parse(response.body));
    } catch (error: any) {
        console.error("Amadeus Pricing Error:", error);
        const status = error.response?.statusCode || 500;
        const message =
            error.response?.result?.errors?.[0]?.detail || "Failed to price flight offer";
        return res.status(status).json({ message });
    }
});

/**
 * GET /flights/:flightId/seats
 * Returns the seat map for a given flight offer ID.
 * Query params: flightOrderId (optional — use when working with a confirmed order)
 */
flightDetailsRouter.get("/:flightId/seats", async (req: Request, res: Response) => {
    try {
        const { flightId } = req.params;

        if (!flightId) {
            return res.status(400).json({ message: "Missing flightId parameter" });
        }

        const response = await amadeus.shopping.seatmaps.get({
            flightOrderId: flightId,
        });

        return res.json(JSON.parse(response.body));
    } catch (error: any) {
        console.error("Amadeus Seatmap Error:", error);
        const status = error.response?.statusCode || 500;
        const message =
            error.response?.result?.errors?.[0]?.detail || "Failed to fetch seat map";
        return res.status(status).json({ message });
    }
});

/**
 * POST /flights/seatmap
 * Body: { flightOffers: FlightOffer[] }
 * Returns seat map for a specific flight offer (pre-booking, from search results).
 */
flightDetailsRouter.post("/seatmap", async (req: Request, res: Response) => {
    try {
        const { flightOffers } = req.body;

        if (!flightOffers || !Array.isArray(flightOffers) || flightOffers.length === 0) {
            return res.status(400).json({ message: "Missing or invalid flightOffers array in request body" });
        }

        const response = await amadeus.shopping.seatmaps.post(
            JSON.stringify({
                data: {
                    type: "flight-offers-seatmaps",
                    flightOffers,
                },
            })
        );

        return res.json(JSON.parse(response.body));
    } catch (error: any) {
        console.error("Amadeus Seatmap POST Error:", error);
        const status = error.response?.statusCode || 500;
        const message =
            error.response?.result?.errors?.[0]?.detail || "Failed to fetch seat map";
        return res.status(status).json({ message });
    }
});

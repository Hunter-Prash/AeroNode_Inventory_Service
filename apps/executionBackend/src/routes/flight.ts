import amadeus from "../services/amadeus";

function json(statusCode: number, data: any) {
    return {
        statusCode,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
}

// POST /flights/search
export async function searchFlights(body: any) {
    try {
        const { origin, destination, date, adults } = body;
        if (!origin || !destination || !date) {
            return json(400, { error: "Missing required fields: origin, destination, date" });
        }

        const response = await amadeus.shopping.flightOffersSearch.get({
            originLocationCode: origin,
            destinationLocationCode: destination,
            departureDate: date,
            adults: adults || "1",
            max: "10",
        });

        return json(200, JSON.parse(response.body));
    } catch (error: any) {
        console.error("Amadeus search error:", error);
        const status = error.response?.statusCode || 500;
        const message = error.response?.result?.errors?.[0]?.detail || "Failed to fetch flights";
        return json(status, { error: message });
    }
}

// POST /flights/price
export async function priceFlights(body: any) {
    try {
        const { flightOffers } = body;
        if (!flightOffers || !Array.isArray(flightOffers) || !flightOffers.length) {
            return json(400, { error: "Missing or invalid flightOffers array" });
        }

        const response = await amadeus.shopping.flightOffers.pricing.post(
            JSON.stringify({ data: { type: "flight-offers-pricing", flightOffers } }),
        );

        return json(200, JSON.parse(response.body));
    } catch (error: any) {
        console.error("Amadeus pricing error:", error);
        const status = error.response?.statusCode || 500;
        const message = error.response?.result?.errors?.[0]?.detail || "Failed to price flight";
        return json(status, { error: message });
    }
}

// GET /flights/:flightId/seats
//this GET route uses flightOrderId, which means: you can only call it after you’ve created a flight order (booking) and you have that flightOrderId.
export async function getSeatmap(flightId: string) {
    try {
        const response = await amadeus.shopping.seatmaps.get({ flightOrderId: flightId });
        return json(200, JSON.parse(response.body));
    } catch (error: any) {
        console.error("Amadeus seatmap error:", error);
        const status = error.response?.statusCode || 500;
        const message = error.response?.result?.errors?.[0]?.detail || "Failed to fetch seat map";
        return json(status, { error: message });
    }
}

// POST /flights/seatmap
export async function postSeatmap(body: any) {
    try {
        const { flightOffers } = body;
        if (!flightOffers || !Array.isArray(flightOffers) || !flightOffers.length) {
            return json(400, { error: "Missing or invalid flightOffers array" });
        }

        const response = await amadeus.shopping.seatmaps.post(
            JSON.stringify({ data: flightOffers }),
        );

        return json(200, JSON.parse(response.body));
    } catch (error: any) {
        console.error("Amadeus seatmap POST error:", error);
        const status = error.response?.statusCode || 500;
        const message = error.response?.result?.errors?.[0]?.detail || "Failed to fetch seat map";
        return json(status, { error: message });
    }
}

// POST /flights/book
export async function createBooking(body: any) {
    try {
        const { flightOffers, travelers } = body;
        if (!flightOffers || !Array.isArray(flightOffers) || !flightOffers.length) {
            return json(400, { error: "Missing or invalid flightOffers array" });
        }
        if (!travelers || !Array.isArray(travelers) || !travelers.length) {
            return json(400, { error: "Missing or invalid travelers array" });
        }

        const response = await amadeus.booking.flightOrders.post(
            JSON.stringify({
                data: {
                    type: "flight-order",
                    flightOffers,
                    travelers
                }
            }),
        );

        return json(200, JSON.parse(response.body));
    } catch (error: any) {
        console.error("Amadeus booking error:", error);
        const status = error.response?.statusCode || 500;
        const message = error.response?.result?.errors?.[0]?.detail || "Failed to create booking";
        return json(status, { error: message });
    }
}

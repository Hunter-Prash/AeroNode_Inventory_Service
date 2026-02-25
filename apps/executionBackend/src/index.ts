import { searchFlights, priceFlights, getSeatmap, postSeatmap, createBooking } from "./routes/flight";

function json(status: number, data: any) {
    return { statusCode: status, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) };
}

export async function handler(event: any) {
    const method = event.requestContext.http.method;
    const path = event.rawPath.replace("/prod/api/execution", "") || "/";
    const body = event.body ? JSON.parse(event.body) : {};

    if (path === "/health" && method === "GET") return json(200, { ok: true });
    if (path === "/flights/search" && method === "POST") return searchFlights(body);
    if (path === "/flights/price" && method === "POST") return priceFlights(body);
    if (path === "/flights/seatmap" && method === "POST") return postSeatmap(body);
    if (path === "/flights/book" && method === "POST") return createBooking(body);

    const seatsMatch = path.match(/^\/flights\/([^/]+)\/seats$/);
    if (seatsMatch && method === "GET") return getSeatmap(seatsMatch[1]);

    return json(404, { error: "Not found" });
}

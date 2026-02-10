import "dotenv/config";
import Amadeus from "amadeus";
import { Router } from "express";

export const flightSearchRouter = Router();

flightSearchRouter.get("/", (req, res) => {
  const amadeus = new Amadeus({
    clientId: process.env.AMADEUS_API_KEY,
    clientSecret: process.env.AMADEUS_API_SECRET,
  });

  const originCode = "DEL";
  const destinationCode = "BLR";
  const dateOfDeparture = "2026-04-01";
  // Find the cheapest flights
  amadeus.shopping.flightOffersSearch
    .get({
      originLocationCode: originCode,
      destinationLocationCode: destinationCode,
      departureDate: dateOfDeparture,
      adults: "1",
      max: "7",
    })
    .then(function (response: { result: any }) {
      res.send(response.result);
    })
    .catch(function (response: any) {
      res.send(response);
    });
});

import express from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// get flights based on origin, dest, date
export const getFlights = async (req, res) => {
  try {
    let { origin, dest, date } = req.body

    const from = new Date(date)
    const to = new Date(date)
    to.setDate(to.getDate() + 10) // show flights till 10 days in the future

    let response = await prisma.flights.findMany({
      where: {
        origin_iata: origin,
        destination_iata: dest,
        departure_utc: {
          gte: from,
          lt: to,
        },
      },
      include: {
        flight_seats: {
          where: {
            status: 'AVAILABLE',
          },
        },
      },
    })

    return res.status(200).json(response)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

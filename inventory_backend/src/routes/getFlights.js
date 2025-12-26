import express from 'express'
import { getFlights } from '../controllers/getFlightCont';

const router=express.Router()

router.get('/getflight',getFlights)
export default router;
import express from 'express';
import { searchDestination, getCitiesByProvince, calculateOngkir } from '../controllers/shipController.js';

const router = express.Router();

router.get('/search-destination', searchDestination);
router.get('/cities-by-province', getCitiesByProvince);
router.post('/calculate-ongkir', calculateOngkir);

export default router;
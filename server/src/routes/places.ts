import { Router } from 'express';
import { PlacesController } from '../controllers/places.controller';

const router = Router();

// Public route - no authentication required
router.get('/autocomplete', PlacesController.autocomplete);

export default router;

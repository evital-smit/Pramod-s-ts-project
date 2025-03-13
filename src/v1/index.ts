import express from 'express';
import userController from "./controllers/userController";
import flightController from "./controllers/flightController";
import bookingController from "./controllers/bookingController";
import bookingdetailsController from "./controllers/bookingdetailsController";
import seatsController from "./controllers/seatsController";

const router = express.Router();

router.use('/auth',userController);
router.use('/flight',flightController); 
router.use('/bookings',bookingController);
router.use('/bookingdetails',bookingdetailsController);
router.use('/seats',seatsController);

export default router;
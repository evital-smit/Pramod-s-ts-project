import express from 'express'
import userController from './v1/controllers/userController';
import flightController from './v1/controllers/flightController';
import bookingController from './v1/controllers/bookingController';
import bookingdetailsController from './v1/controllers/bookingdetailsController';
import seatsController from './v1/controllers/seatsController';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api/auth',userController);
app.use('/api/flight',flightController); 
app.use('/api/bookings',bookingController);
app.use('/api/bookingdetails',bookingdetailsController);
app.use('/api/seats',seatsController);

app.listen( process.env.PORT,()=>{
    console.log("Server is running...");
})


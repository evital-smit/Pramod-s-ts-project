import express, { Request, Response } from "express";
import Joi from "joi";
import { validations } from "../library/validations";
import { functions } from "../library/functions";
import { bookingModel } from "../models/bookingsModel";
import { bookingDetailsModel } from "../models/bookingdetailsModel";
import { responseUtil } from "../library/responseUtil";
import { seatModel } from "../models/seatsModel";
import { auth } from "../library/auth";
import { validateRequest } from "../library/validateRequest";


const router = express.Router();
const responseObj = new responseUtil();
const bookingModelInstance = new bookingModel();
const bookingDetailsModelInstance = new bookingDetailsModel();
const seatModelInstance = new seatModel();  
const functionsObj = new functions();
const validationsObj = new validations();
const authObj = new auth();

interface AuthRequest extends Request {
  user?: {
    user_id: number;
    email: string;
    name?: string; 
  };
}

router.get("/user", authObj.authenticateUser, getUserBookings);
router.put("/modify/:booking_id",authObj.authenticateUser,modifyBookingValidation,modifyUserBooking);

export default router;


function modifyBookingValidation(req: any, res: any, next: any) {
  let schema = Joi.object({
    booking_id: Joi.number().integer().required().messages({
      "number.base": "Booking ID must be a number",
      "any.required": "Booking ID is required",
    }),
    passengerDetails: Joi.array()
      .items(
        Joi.object({
          seat_id: Joi.number().integer().required(),
          passenger_name: Joi.string().min(2).max(50).required(),
          age: Joi.number().integer().min(1).max(120).required(),
          gender: Joi.string().valid("Male", "Female", "Other").required(),
          relation: Joi.string().min(2).max(50).optional(),
        })
      )
      .optional(),
    newSeats: Joi.array().items(Joi.number().integer()).optional(),
  });

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }
}


export async function getUserBookings(req: AuthRequest, res: Response){
  const userId = req.user?.user_id; 

  if (!userId) {
    return;
  }

  try {
    const bookings = await bookingModelInstance.getUserBookings(userId);
    return ;
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return ;
  }
};

export async function modifyUserBooking(req: AuthRequest, res: Response){
  const userId = req.user?.user_id;
  const { booking_id } = req.params;
  const { passengerDetails, newSeats } = req.body;

  if (!userId) {
    return;
  }

  try {
    // Check if booking exists and belongs to the user
    const bookingExists = await bookingModelInstance.getBookingById(Number(booking_id));
    if (bookingExists.error || bookingExists.data.user_id !== userId) {
      return ;
    }

    // Update passenger details if provided
    if (passengerDetails && passengerDetails.length > 0) {
      await bookingModelInstance.getBookingById(Number(booking_id));
    }

    // Check if new seats are available before updating
    if (newSeats && newSeats.length > 0) {
      const availableSeats = await seatModelInstance.getAvailableSeatsByFlight(newSeats);
      if (availableSeats.data > 0) {
        return ;
      }

      // Proceed with seat update
      await seatModelInstance.getAvailableSeatsByFlight(Number(booking_id));
    }

    return;
  } catch (error) {
    console.error("Error modifying booking:", error);
    // return res.json(responseObj.returnResponse(true, "Error modifying booking", null));
    return;
  }
};



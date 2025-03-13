import express, { Request, Response } from "express";
import Joi from "joi";
import { validations } from "../library/validations";
import { functions } from "../library/functions";
import { bookingModel } from "../models/bookingsModel";
import { bookingDetailsModel } from "../models/bookingdetailsModel";
import { seatModel } from "../models/seatsModel";
import { auth } from "../library/auth";


const router = express.Router();
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


function sanitizeInput(input: any) {
  if (typeof input === "string") {
    return input.trim().replace(/'/g, "");
  } else if (Array.isArray(input)) {
    return input.map((item) => (typeof item === "string" ? item.trim().replace(/'/g, "") : item));
  } else if (typeof input === "object" && input !== null) {
    Object.keys(input).forEach((key) => {
      input[key] = sanitizeInput(input[key]);
    });
  }
  return input;
}
function modifyBookingValidation(req: any, res: any, next: any) {
  req.body = sanitizeInput(req.body);

  let schema = Joi.object({
    booking_id: Joi.number().integer().required().messages({
      "number.base": "Booking ID must be a number",
      "any.required": "Booking ID is required",
    }),
    passengerDetails: Joi.array()
      .items(
        Joi.object({
          seat_id: Joi.number().integer().required(),
          passenger_name: Joi.string().trim().min(2).max(50).required(),
          age: Joi.number().integer().min(1).max(120).required(),
          gender: Joi.string().trim().valid("Male", "Female", "Other").required(),
          relation: Joi.string().trim().min(2).max(50).optional(),
        })
      )
      .optional(),
    newSeats: Joi.array().items(Joi.number().integer()).optional(),
  });

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }
}

export async function getUserBookings(req: AuthRequest, res: Response) {
  try {
      const userId = req.user?.user_id;
      if (!userId) {
          res.status(400).send(functionsObj.output(0, "User ID is missing.", null));
          return;
      }
      const bookings = await bookingModelInstance.getUserBookings(userId);
      res.status(200).send(functionsObj.output(1, "User bookings fetched successfully.", bookings));
  } catch (error) {
    res.status(500).send(functionsObj.output(0, "Error fetching user bookings.", null));
  }
}

export async function modifyUserBooking(req: AuthRequest, res: Response) {
  try {
      const userId = req.user?.user_id;
      const { booking_id } = req.params;
      const { passengerDetails, newSeats } = req.body;
      
      if (!userId) {
          res.status(400).send(functionsObj.output(0, "User ID is missing.", null));
          return;
      }

      const bookingExists = await bookingModelInstance.getBookingById(Number(booking_id));
      if (bookingExists.error || bookingExists.data.user_id !== userId) {
          res.status(403).send(functionsObj.output(0, "Unauthorized or booking not found.", null));
          return;
      }

      if (passengerDetails && passengerDetails.length > 0) {
          await bookingDetailsModelInstance.updateBookingDetail(Number(booking_id), passengerDetails);
      }

      if (newSeats && newSeats.length > 0) {
          const availableSeats = await seatModelInstance.getAvailableSeatsByFlight(Number(bookingExists.data.flight_id));
          if (availableSeats.data.length < newSeats.length) {
              res.status(400).send(functionsObj.output(0, "Not enough available seats.", null));
              return;
          }
          await seatModelInstance.updateSeat(Number(booking_id), newSeats);
      }
      res.status(200).send(functionsObj.output(1, "Booking modified successfully.", null));
  } catch (error) {
    res.status(500).send(functionsObj.output(0, "Error modifying booking.", null));
  }
}


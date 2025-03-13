import express, { Request, Response } from "express";
import Joi from "joi";
import { validations } from "../library/validations"; 
import { auth } from "../library/auth";  
import { bookingModel } from "../models/bookingsModel";
import { seatModel} from "../models/seatsModel";
import { functions } from './../library/functions';

const router = express.Router();
const bookingService = new bookingModel();
const seatService = new seatModel();
const validationsObj = new validations();
const authObj = new auth();
const functionsObj = new functions(); 

router.post("/", authObj.authenticateUser, bookSeatsValidation, createBooking);
router.get("/:booking_id", authObj.authenticateUser, cancelBookingValidation, getBookingById);
router.get("/user/:user_id", authObj.authenticateUser, getUserBookings);
router.put("/cancel/:booking_id", authObj.authenticateUser, cancelBookingValidation, cancelBooking);
router.put("/cancel-seats", authObj.authenticateUser,cancelSpecificSeatsValidation, cancelSpecificSeats);
router.put("/modify", authObj.authenticateUser, modifyBookingValidation, modifyBooking);

export default router;

function sanitizeRequestBody(req: any) {
  for (const key in req.body) {
    if (typeof req.body[key] === "string") {
      req.body[key] = req.body[key].trim().replace(/'/g, "");
    } else if (Array.isArray(req.body[key])) {
      req.body[key] = req.body[key].map((item) =>
        typeof item === "string" ? item.trim().replace(/'/g, "") : item
      );
    } else if (typeof req.body[key] === "object" && req.body[key] !== null) {
      for (const subKey in req.body[key]) {
        if (typeof req.body[key][subKey] === "string") {
          req.body[key][subKey] = req.body[key][subKey].trim().replace(/'/g, "");
        }
      }
    }
  }
}

function searchFlightsValidation(req: any, res: any, next: any) {
  let schema = Joi.object({
    departure_city: Joi.string().trim().required().messages({
      "any.required": "Departure city is required.",
    }),
    arrival_city: Joi.string().trim().required().messages({
      "any.required": "Arrival city is required.",
    }),
    date: Joi.date().iso().required().messages({
      "any.required": "Date is required.",
      "date.base": "Date must be a valid ISO date.",
    }),
  });

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }
}

function bookSeatsValidation(req: any, res: any, next: any) {
  let schema = Joi.object({
    user_id: Joi.number().integer().required().messages({
      "any.required": "User ID is required.",
      "number.base": "User ID must be a number.",
    }),
    flight_id: Joi.number().integer().required().messages({
      "any.required": "Flight ID is required.",
      "number.base": "Flight ID must be a number.",
    }),
    seats: Joi.array().items(Joi.number().integer()).min(1).required().messages({
      "any.required": "At least one seat must be selected.",
      "array.min": "At least one seat must be selected.",
      "number.base": "Seat ID must be a number.",
    }),
    total_amount: Joi.number().precision(2).required().messages({
      "any.required": "Total amount is required.",
      "number.base": "Total amount must be a number.",
    }),
  });

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }
}

function cancelBookingValidation(req: any, res: any, next: any) {
  let schema = Joi.object({
    booking_id: Joi.number().integer().required().messages({
      "any.required": "Booking ID is required.",
      "number.base": "Booking ID must be a number.",
    }),
  });

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }
}


function cancelSpecificSeatsValidation(req: any, res: any, next: any) {
  let schema = Joi.object({
    booking_id: Joi.number().integer().required().messages({
      "any.required": "Booking ID is required.",
      "number.base": "Booking ID must be a number.",
    }),
    seat_ids: Joi.array().items(Joi.number().integer()).min(1).required().messages({
      "any.required": "At least one seat ID is required.",
      "array.min": "At least one seat ID must be provided.",
      "number.base": "Seat ID must be a number.",
    }),
  });

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }
}

function modifyBookingValidation(req: any, res: any, next: any) {
  let schema = Joi.object({
    booking_id: Joi.number().integer().required().messages({
      "number.base": "Booking ID must be a number",
      "any.required": "Booking ID is required",
    }),
    passengerDetails: Joi.array()
      .items(
        Joi.object({
          seat_id: Joi.number().integer().required().messages({
            "number.base": "Seat ID must be a number.",
            "any.required": "Seat ID is required.",
          }),
          passenger_name: Joi.string().trim().min(2).max(50).required().messages({
            "string.min": "Passenger name must be at least 2 characters.",
            "string.max": "Passenger name must be at most 50 characters.",
            "any.required": "Passenger name is required.",
          }),
          age: Joi.number().integer().min(1).max(120).required().messages({
            "number.base": "Age must be a number.",
            "number.min": "Age must be at least 1.",
            "number.max": "Age cannot exceed 120.",
            "any.required": "Age is required.",
          }),
          gender: Joi.string().trim().valid("Male", "Female", "Other").required().messages({
            "any.only": "Gender must be 'Male', 'Female', or 'Other'.",
            "any.required": "Gender is required.",
          }),
          relation: Joi.string().trim().min(2).max(50).optional().messages({
            "string.min": "Relation must be at least 2 characters.",
            "string.max": "Relation must be at most 50 characters.",
          }),
        })
      )
      .optional(),
    newSeats: Joi.array().items(Joi.number().integer()).optional().messages({
      "number.base": "New seat IDs must be numbers.",
    }),
  });

  if (!validationsObj.validateRequest(req, res, next, schema)) {
    return;
  }
}

export async function createBooking(req: Request, res: Response) {
  try {
    const { user_id, flight_id, seats, total_amount } = req.body;
    const availableSeats = await bookingService.getAvailableSeats(flight_id, seats);

    if (availableSeats.error || availableSeats.data.length !== seats.length) {
      res.status(400).send(functionsObj.output(0, "Some seats are unavailable", null));
      return;
    }

    const bookingData = {
      user_id,
      flight_id,
      total_price: total_amount,
      booking_status: "CONFIRMED",
    };

    const newBooking = await bookingService.insertRecord(bookingData);

    if (newBooking.error) {
      res.status(500).send(functionsObj.output(0, "Failed to create booking", null));
      return;
    }

    await bookingService.bookNewSeats(newBooking.data.booking_id, flight_id, seats);
    res.status(201).send(functionsObj.output(1, "Booking created successfully", newBooking.data));
  } catch (error) {
    res.status(500).send(functionsObj.output(0, "Internal server error", null));
  }
};

export async function getBookingById(req: Request, res: Response) {
  try {
    const { booking_id } = req.params;
    const booking = await bookingService.getBookingById(parseInt(booking_id));

    if (booking.error) {
      res.status(404).send(functionsObj.output(0, booking.message, null));
      return;
    }
    res.send(functionsObj.output(1, "Booking retrieved successfully", booking.data));
  } catch (error) {
    res.status(500).send(functionsObj.output(0, "Internal server error", null));
  }
};

export async function getUserBookings(req: Request, res: Response) {
  try {
    const { user_id } = req.params;
    const bookings = await bookingService.getUserBookings(parseInt(user_id));

    if (bookings.error) {
      res.status(404).send(functionsObj.output(0, bookings.message, null));
      return;
    }
    res.send(functionsObj.output(1, "User bookings retrieved successfully", bookings.data));
  } catch (error) {
    res.status(500).send(functionsObj.output(0, "Internal server error", null));
  }
};

export async function cancelBooking(req: Request, res: Response) {
  try {
    const { booking_id } = req.params;
    const cancellation = await bookingService.cancelBooking(parseInt(booking_id));

    if (cancellation.error) {
      res.status(400).send(functionsObj.output(0, cancellation.message, null));
      return;
    }
    res.send(functionsObj.output(1, "Booking cancelled successfully", cancellation.data));
  } catch (error) {
    res.status(500).send(functionsObj.output(0, "Internal server error", null));
  }
};

export async function cancelSpecificSeats(req: Request, res: Response) {
  try {
    const { booking_id, seat_ids } = req.body;
    const seatCancellation = await seatService.cancelBookedSeats(booking_id, seat_ids);

    if (seatCancellation.error) {
      res.status(400).send(functionsObj.output(0, seatCancellation.message, null));
      return;
    }
    res.send(functionsObj.output(1, "Seats cancelled successfully", seatCancellation.data));
  } catch (error) {
    res.status(500).send(functionsObj.output(0, "Internal server error", null));
  }
};

export async function modifyBooking(req: Request, res: Response) {
  try {
    const { booking_id } = req.body;
    const modification = await bookingService.getBookingById(booking_id);

    if (modification.error) {
      res.status(400).send(functionsObj.output(0, modification.message, null));
      return;
    }
    res.send(functionsObj.output(1, "Booking modified successfully", modification.data));
  } catch (error) {
    res.status(500).send(functionsObj.output(0, "Internal server error", null));
  }
};

